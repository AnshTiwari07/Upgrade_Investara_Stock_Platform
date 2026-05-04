import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import InvestaraChart from '../components/InvestaraChart';
import EnhancedStockDetailView, { AnalystRatingGauge } from '../components/EnhancedStockDetailView';
import { Box, Typography, Paper, Grid, Chip, Button, Alert, TextField } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import io from 'socket.io-client';
import { AudioContext } from '../context/AudioContext';

const imageMap = {
  'reliance.png': require('../images/reliance.png'),
  'tcs.png': require('../images/tcs.png'),
  'infosys.png': require('../images/infosys.png'),
  'hdfc.png': require('../images/hdfc.png'),
  'sbi.png': require('../images/sbi.png'),
};

const StockDetail = () => {
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(null);
  const [loadingStock, setLoadingStock] = useState(true);
  const [error, setError] = useState(null);
  const [showSplash, setShowSplash] = useState(false);
  const [splashText, setSplashText] = useState('');
  const [forecast, setForecast] = useState(null);
  const socketRef = useRef(null);

  const { playBuySound, playSellSound } = useContext(AudioContext);

  const fetchStock = useCallback(async () => {
    try {
      const res = await api.get(`/stocks/${symbol}`);
      setStock(res.data);
    } catch (err) {
      console.error('Failed to load stock', err);
      setError('Failed to load stock details. Please try again.');
    } finally {
      setLoadingStock(false);
    }
  }, [symbol]);

  useEffect(() => { 
    fetchStock();
    
    // Setup WebSocket for forecast updates
    const socket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '/');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('subscribe', symbol);
    });

    socket.on('price_update', (data) => {
      if (data.symbol === symbol && data.forecast) {
        setForecast(data.forecast);
      }
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('unsubscribe', symbol);
        socketRef.current.disconnect();
      }
    };
  }, [symbol, fetchStock]);

  const placeOrder = async (orderType) => {
    try {
      const res = await api.post('/orders/place', { symbol, quantity, orderType });
      setMessage(res.data.msg);
      if (orderType === 'BUY') {
        setSplashText(`Congratulations for buying "${stock?.name || symbol}"`);
        playBuySound();
      } else if (orderType === 'SELL') {
        setSplashText(`Nice decision selling "${stock?.name || symbol}"`);
        playSellSound();
      }
      setShowSplash(true);
      setTimeout(() => setShowSplash(false), 3000);
    } catch (err) {
      setMessage('Order failed');
    }
  };

  if (loadingStock) return <Box className="shimmer" sx={{ height: 40, width: 200, borderRadius: 2 }} />;
  if (!stock) return <Typography color="error">Unable to load stock.</Typography>;
  
  const logoSrc = imageMap[(stock.logo || '').toLowerCase()] || null;

  return (
    <Box sx={{ py: 6 }}>
      {showSplash && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, backdropFilter: 'blur(10px)' }}>
          <Paper elevation={24} sx={{ p: 6, borderRadius: 4, textAlign: 'center', maxWidth: 400 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>Order Confirmed</Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)' }}>{splashText}</Typography>
          </Paper>
        </Box>
      )}

      <Grid container spacing={6} sx={{ mt: 2 }}>
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
            <img src={logoSrc} alt={stock.name} style={{ width: '64px', height: '64px', marginRight: '24px', borderRadius: '16px' }} />
            <Box>
              <Typography variant="h2" sx={{ color: 'white', fontWeight: 900, letterSpacing: '-1px' }}>
                {stock.name} <Typography component="span" variant="h4" sx={{ color: 'rgba(255,255,255,0.3)', ml: 1 }}>{stock.symbol}</Typography>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 2 }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 800 }}>₹ {stock.currentPrice}</Typography>
                <Chip 
                  label={`${stock.change >= 0 ? '+' : ''}${stock.change} (${stock.changePercent}%)`}
                  color={stock.change >= 0 ? 'success' : 'error'}
                  sx={{ fontWeight: 800, borderRadius: 1 }}
                />
              </Box>
            </Box>
          </Box>

          <InvestaraChart symbol={symbol} />

          <Paper sx={{ p: 4, mt: 4 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 700 }}>About {stock.name}</Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontSize: '1.1rem' }}>
              {stock.name}, a leader in the {stock.sector} sector, is led by {stock.owner}. 
              Founded in {stock.startDate}, it has a market cap of ₹{stock.marketCap}. 
              With a consistent growth rate of {stock.growth}%, it remains a top choice for institutional investors.
            </Typography>
          </Paper>

          {/* Relocated elements: error alert and enhanced stock view */}
          <Box sx={{ mt: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}
            <EnhancedStockDetailView stock={stock} />
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 700 }}>Execute Trade</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Quantity</Typography>
                    <TextField 
                      fullWidth
                      type="number" 
                      size="small"
                      value={quantity} 
                      onChange={(e) => setQuantity(Number(e.target.value))} 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button fullWidth variant="contained" color="success" size="large" onClick={() => placeOrder('BUY')} sx={{ py: 2, fontWeight: 800 }}>BUY</Button>
                    <Button fullWidth variant="contained" color="error" size="large" onClick={() => placeOrder('SELL')} sx={{ py: 2, fontWeight: 800 }}>SELL</Button>
                  </Box>
                  {message && <Typography variant="body2" sx={{ textAlign: 'center', color: 'primary.light', fontWeight: 600 }}>{message}</Typography>}
                </Box>
              </Paper>

              <Paper sx={{ p: 4, border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'primary.light', flexGrow: 1, fontWeight: 700 }}>LSTM Forecast</Typography>
                  <Chip size="small" label="High Confidence" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                </Box>
                
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" sx={{ color: 'white', mb: 1, fontWeight: 900 }}>
                    {forecast ? `₹ ${forecast.nextTarget}` : 'Calculating...'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
                    {forecast?.trend === 'BULLISH' ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
                    <Typography variant="h6" sx={{ color: forecast?.trend === 'BULLISH' ? 'success.main' : 'error.main', fontWeight: 800 }}>
                      {forecast?.trend || 'PENDING'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mt: 3, display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Signal Reliability: {forecast ? `${(forecast.confidence * 100).toFixed(1)}%` : '--'}
                  </Typography>
                </Box>
                
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', mt: 4, display: 'block', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.5 }}>
                  * Signal generated via real-time LSTM retraining pipeline. Trading involves risk.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <AnalystRatingGauge />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StockDetail;
