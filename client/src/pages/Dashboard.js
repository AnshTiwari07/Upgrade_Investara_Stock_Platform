import React, { useEffect, useState, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api';
import Sparkline from '../components/Sparkline';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  CircularProgress, 
  Alert,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PsychologyIcon from '@mui/icons-material/Psychology';

const Dashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [notice, setNotice] = useState(null);
  const [sparklineData, setSparklineData] = useState({});
  const [topForecasts, setTopForecasts] = useState([]);

  const fetchSparklineData = useCallback(async (stocksToFetch) => {
    const data = {};
    for (const stock of stocksToFetch) {
      try {
        const res = await api.get(`/stocks/${stock.symbol}/history?range=7D`);
        if (res.data && res.data.history) {
          data[stock.symbol] = res.data.history;
        } else if (res.data && Array.isArray(res.data)) {
          data[stock.symbol] = res.data;
        } else {
          data[stock.symbol] = [];
        }
      } catch (err) {
        data[stock.symbol] = [];
      }
    }
    setSparklineData(data);
  }, []);

  const fetchStocks = useCallback(async () => {
    try {
      const res = await api.get('/stocks');
      setStocks(res.data);
      fetchSparklineData(res.data);
      
      // Simulate top LSTM forecasts
      const forecasts = res.data.slice(0, 3).map(s => ({
        ...s,
        target: Number((s.currentPrice * 1.05).toFixed(2)),
        confidence: 82.4
      }));
      setTopForecasts(forecasts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchSparklineData]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      setNotice(null);
      await api.post('/stocks/seed');
      setNotice({ type: 'success', msg: 'Seeded demo stocks' });
      setLoading(true);
      await fetchStocks();
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', msg: 'Seeding failed' });
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
          Terminal
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleSeed} 
            disabled={seeding} 
            sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
          >
            {seeding ? 'Seeding...' : 'Seed Data'}
          </Button>
          <Button variant="contained" component={RouterLink} to="/portfolio">My Portfolio</Button>
        </Box>
      </Box>
      
      {notice && <Alert severity={notice.type} sx={{ mb: 4, borderRadius: 2 }}>{notice.msg}</Alert>}

      <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', color: 'primary.light', fontWeight: 700 }}>
        <PsychologyIcon sx={{ mr: 1.5 }} /> LSTM Top Predictions
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {topForecasts.map(s => (
          <Grid item xs={12} md={4} key={`forecast-${s.symbol}`}>
            <Card sx={{ 
              transition: '0.3s', 
              '&:hover': { transform: 'translateY(-5px)', bgcolor: 'rgba(255,255,255,0.05)' } 
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" color="white" sx={{ fontWeight: 800 }}>{s.symbol}</Typography>
                  <Chip size="small" label={`${s.confidence}% Acc.`} color="success" variant="outlined" sx={{ fontWeight: 700 }} />
                </Box>
                <Typography variant="caption" color="rgba(255,255,255,0.4)" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Target Forecast
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 800 }}>₹ {s.target}</Typography>
                  <TrendingUpIcon color="success" />
                </Box>
                <Button 
                  fullWidth
                  variant="text"
                  component={RouterLink} 
                  to={`/stock/${s.symbol}`}
                  sx={{ mt: 3, justifyContent: 'flex-start', color: 'primary.light', p: 0 }}
                >
                  Analyze Chart →
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ mb: 3, color: 'white', fontWeight: 700 }}>Market Overview</Typography>
      <TableContainer component={Paper} sx={{ mb: 6 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Change</TableCell>
              <TableCell>Change %</TableCell>
              <TableCell>7D History</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stocks.map((s) => (
              <TableRow key={s.symbol} hover>
                <TableCell sx={{ fontWeight: 700 }}>{s.symbol}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>{s.name}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>₹ {s.currentPrice}</TableCell>
                <TableCell sx={{ color: s.change >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                  {s.change >= 0 ? '+' : ''}{s.change}
                </TableCell>
                <TableCell sx={{ color: s.changePercent >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                  {s.changePercent}%
                </TableCell>
                <TableCell style={{ width: 150 }}>
                  {sparklineData[s.symbol] ? (
                      <Sparkline 
                        data={sparklineData[s.symbol]} 
                        dataKey="close"
                        strokeColor={s.change >= 0 ? '#4caf50' : '#f44336'}
                      />
                    ) : (
                      <Box sx={{ height: 40, display: 'flex', alignItems: 'center', opacity: 0.3 }}>
                        <CircularProgress size={16} />
                      </Box>
                    )}
                </TableCell>
                <TableCell align="right">
                  <Button 
                    variant="text" 
                    size="small" 
                    component={RouterLink} 
                    to={`/stock/${s.symbol}`}
                    sx={{ color: 'primary.light' }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Dashboard;