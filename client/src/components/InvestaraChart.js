import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { Box, Typography, Paper, Grid, CircularProgress, Chip, ToggleButton, ToggleButtonGroup, Button } from '@mui/material';
import io from 'socket.io-client';
import api from '../api';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const InvestaraChart = ({ symbol }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const socketRef = useRef();
  
  const [latestData, setLatestData] = useState(null);
  const [range, setRange] = useState('1M');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async (selectedRange) => {
    setLoading(true);
    try {
      const res = await api.get(`/stocks/${symbol}/history?range=${selectedRange}`);
      const data = res.data.map(item => ({
        time: Math.floor(new Date(item.date).getTime() / 1000),
        value: item.close || item.price
      }));
      setHistory(data);
      if (seriesRef.current) {
        seriesRef.current.setData(data);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Price\n"
      + history.map(e => `${new Date(e.time * 1000).toISOString().split('T')[0]},${e.value}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${symbol}_${range}_history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchHistory(range);
  }, [range, fetchHistory]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. Initialize Lightweight Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.1)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.1)' },
      },
      width: chartContainerRef.current.clientWidth || 600,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      }
    });

    // Use addAreaSeries with defensive check
    let series;
    if (chart && typeof chart.addAreaSeries === 'function') {
      series = chart.addAreaSeries({
        lineColor: '#2962FF',
        topColor: 'rgba(41, 98, 255, 0.3)',
        bottomColor: 'rgba(41, 98, 255, 0)',
        lineWidth: 2,
      });
    } else {
      console.error('chart.addAreaSeries is not a function. Check lightweight-charts version.');
      chart.remove();
      return;
    }

    if (!series) {
      console.error('Failed to create series');
      chart.remove();
      return;
    }

    chartRef.current = chart;
    seriesRef.current = series;

    // 2. Establish WebSocket connection
    const socket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '/');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('subscribe', symbol);
    });

    socket.on('price_update', (data) => {
      if (data.symbol === symbol) {
        setLatestData(data);
        if (seriesRef.current && range === '1D') {
          seriesRef.current.update({
            time: Math.floor(new Date(data.timestamp).getTime() / 1000),
            value: data.price,
          });
        }
      }
    });

    // Handle resizing
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.emit('unsubscribe', symbol);
      socket.disconnect();
      chart.remove();
    };
  }, [symbol, range]);

  return (
    <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {symbol} Analysis
            {latestData?.isAfterHours && (
              <Chip label="After Hours" size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
            )}
          </Typography>
          {latestData && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Vol: {latestData.volume?.toLocaleString()} | High: ₹{latestData.high} | Low: ₹{latestData.low}
            </Typography>
          )}
        </Box>
        
        {loading && <CircularProgress size={20} sx={{ color: 'white' }} />}

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={range}
            exclusive
            onChange={(e, next) => next && setRange(next)}
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
          >
            {['1D', '1W', '1M', '1Y', '5Y'].map(r => (
              <ToggleButton key={r} value={r} sx={{ color: 'rgba(255,255,255,0.5)', px: 2, '&.Mui-selected': { color: 'white', bgcolor: 'primary.main' } }}>
                {r}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<FileDownloadIcon />} 
            onClick={exportData}
            sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
          >
            Export
          </Button>
        </Box>
      </Box>

      <Box sx={{ position: 'relative' }}>
        {loading && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, bgcolor: 'rgba(10,10,10,0.5)', backdropFilter: 'blur(4px)' }}>
            <CircularProgress />
          </Box>
        )}
        <div ref={chartContainerRef} style={{ position: 'relative' }} />
      </Box>

      {latestData && (
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={6} md={3}>
            <MetricCard label="Current Price" value={`₹${latestData.price}`} color="primary.light" />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard 
              label="Change" 
              value={`${latestData.change >= 0 ? '+' : ''}${latestData.change} (${latestData.changePercent}%)`} 
              color={latestData.change >= 0 ? 'success.main' : 'error.main'} 
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard label="Day Open" value={`₹${latestData.open}`} />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard label="Prev Close" value={`₹${latestData.previousClose}`} />
          </Grid>
        </Grid>
      )}

      {latestData && latestData.indicators && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <IndicatorCard title="SMA (14)" value={latestData.indicators.sma} />
          </Grid>
          <Grid item xs={12} md={4}>
            <IndicatorCard title="EMA (14)" value={latestData.indicators.ema} />
          </Grid>
          <Grid item xs={12} md={4}>
            <IndicatorCard title="RSI (14)" value={latestData.indicators.rsi} />
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

const MetricCard = ({ label, value, color = 'white' }) => (
  <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1, border: '1px solid rgba(255,255,255,0.05)' }}>
    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>{label}</Typography>
    <Typography variant="h6" sx={{ color, fontWeight: 800 }}>{value}</Typography>
  </Box>
);

const IndicatorCard = ({ title, value }) => (
  <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
    <Typography variant="caption" sx={{ color: 'grey.500', display: 'block' }}>{title}</Typography>
    <Typography variant="body1" sx={{ color: 'common.white', fontWeight: 'bold' }}>
      {value ?? 'Calculating...'}
    </Typography>
  </Box>
);

export default InvestaraChart;
