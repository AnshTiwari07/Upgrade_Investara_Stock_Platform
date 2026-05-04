import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Box,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/portfolio');
      setPortfolio(res.data);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
      const errorMsg = err.response?.data?.msg || err.message || 'An unexpected error occurred.';
      setError(`Failed to load portfolio: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  if (loading) return (
    <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
      <CircularProgress sx={{ color: 'common.white' }} />
      <Typography sx={{ mt: 2, color: 'common.white' }}>Loading your portfolio...</Typography>
    </Container>
  );

  if (error) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={fetchPortfolio} startIcon={<RefreshIcon />}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    </Container>
  );

  if (!portfolio) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Alert severity="info">No portfolio data found. Start investing to see your holdings!</Alert>
    </Container>
  );

  return (
  <Container maxWidth="lg">
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
        Portfolio
      </Typography>
      <Button 
        variant="outlined" 
        onClick={fetchPortfolio} 
        startIcon={<RefreshIcon />}
        sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
      >
        Refresh
      </Button>
    </Box>
    
    <Paper sx={{ p: 4, mb: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      <Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Available Balance
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>₹ {portfolio.balance ?? '—'}</Typography>
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Total Invested
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>₹ {portfolio.totalInvestment}</Typography>
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Current Value
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>₹ {portfolio.currentValue}</Typography>
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Overall P/L
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: portfolio.overallProfitLoss >= 0 ? 'success.main' : 'error.main' }}>
            ₹ {portfolio.overallProfitLoss}
          </Typography>
          <Typography variant="body1" sx={{ color: portfolio.overallProfitLoss >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
            ({portfolio.overallProfitLossPercentage}%)
          </Typography>
        </Box>
      </Box>
    </Paper>
      
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Symbol</TableCell>
            <TableCell>Qty</TableCell>
            <TableCell>Avg Price</TableCell>
            <TableCell>Invested</TableCell>
            <TableCell>Current</TableCell>
            <TableCell>P/L</TableCell>
            <TableCell align="right">P/L %</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(!portfolio.holdings || portfolio.holdings.length === 0) && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 10, color: 'rgba(255,255,255,0.3)' }}>
                No holdings yet. Place orders to build your portfolio.
              </TableCell>
            </TableRow>
          )}
          {portfolio.holdings?.map((h) => (
            <TableRow key={h.symbol} hover>
              <TableCell sx={{ fontWeight: 700 }}>{h.symbol}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{h.quantity}</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>₹ {h.averageBuyPrice}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>₹ {h.investedAmount}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>₹ {h.currentValue}</TableCell>
              <TableCell sx={{ color: h.profitLoss >= 0 ? 'success.main' : 'error.main', fontWeight: 700 }}>
                {h.profitLoss >= 0 ? '+' : ''}₹ {h.profitLoss}
              </TableCell>
              <TableCell align="right" sx={{ color: h.profitLossPercentage >= 0 ? 'success.main' : 'error.main', fontWeight: 700 }}>
                {h.profitLossPercentage}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Container>
  );
};

export default Portfolio;
