import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Divider, Stack } from '@mui/material';
import { motion } from 'framer-motion';

export const AnalystRatingGauge = ({ rating = 'Buy', analystCount = 32 }) => {
  // Simple gauge implementation using SVG
  const getColor = (r) => {
    const map = { 'Strong Buy': '#1b5e20', 'Buy': '#2e7d32', 'Hold': '#fbc02d', 'Sell': '#d32f2f', 'Strong Sell': '#b71c1c' };
    return map[r] || map['Buy'];
  };

  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 4, 
      bgcolor: 'rgba(255, 255, 255, 0.03)', 
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      textAlign: 'center',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white' }}>Analyst rating</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>{'>'}</Typography>
      </Box>

      <Box sx={{ position: 'relative', height: 120, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', mb: 2 }}>
        <svg width="160" height="80" viewBox="0 0 160 80">
          {/* Background segments */}
          <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="15" strokeLinecap="round" />
          {/* Active segment (simplified) */}
          <path d="M 100 20 A 70 70 0 0 1 150 80" fill="none" stroke={getColor(rating)} strokeWidth="15" strokeLinecap="round" />
          
          {/* Needle */}
          <line x1="80" y1="80" x2="110" y2="30" stroke="white" strokeWidth="4" strokeLinecap="round" />
          <circle cx="80" cy="80" r="6" fill="white" />
        </svg>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', mb: 0.5 }}>{rating}</Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>Based on {analystCount} analysts</Typography>
    </Paper>
  );
};

const EnhancedStockStats = ({ stock }) => {
  const stats = [
    { label: 'Open', value: stock.open || '1,781.10' },
    { label: 'Vol', value: stock.volume ? `${(stock.volume / 1000000).toFixed(2)} M` : '2.59 M' },
    { label: 'High', value: stock.high || '1,816.00' },
    { label: 'Avg Vol', value: stock.avgVol || '11.68 M' },
    { label: 'Low', value: stock.low || '1,776.60' },
    { label: '52wk High', value: stock.fiftyTwoWeekHigh || '2,174.50' },
    { label: 'Mkt Cap', value: stock.marketCap || '12.18 T' },
    { label: '52wk Low', value: stock.fiftyTwoWeekLow || '1,612.20' },
  ];

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {stats.map((stat, index) => (
        <Grid item xs={6} key={index}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{stat.label}</Typography>
            <Typography variant="body1" sx={{ color: 'white', fontWeight: 700 }}>{stat.value}</Typography>
          </Box>
          {index % 2 === 0 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', display: { xs: 'none', sm: 'block' } }} />}
        </Grid>
      ))}
    </Grid>
  );
};

const StockHeader = ({ stock, livePrice }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const currentPrice = livePrice || stock.currentPrice || 1806.10;
  const change = stock.change || 4.80;
  const changePercent = stock.changePercent || 0.27;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 0.5 }}>
        <motion.div
          key={currentPrice}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h2" sx={{ fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
            {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </motion.div>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>INR</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', color: change >= 0 ? '#4caf50' : '#f44336', ml: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)} ({changePercent.toFixed(2)}%)
          </Typography>
          <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 600 }}>today</Typography>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
        {dateStr}, {timeStr} IST · Market Open
      </Typography>
    </Box>
  );
};

const EnhancedStockDetailView = ({ stock }) => {
  const [livePrice, setLivePrice] = useState(stock.currentPrice || 1806.10);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time fluctuation (+/- 0.05%)
      setLivePrice(prev => {
        const fluctuation = prev * (0.0005 * (Math.random() - 0.5));
        return prev + fluctuation;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stock.currentPrice]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ 
        p: 4, 
        borderRadius: 6, 
        bgcolor: 'rgba(255, 255, 255, 0.02)', 
        border: '1px solid rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)'
      }}>
        <StockHeader stock={stock} livePrice={livePrice} />
        
        {/* Range Selector Placeholder */}
        <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
          {['1D', '5D', '1M', '1Y', '5Y', 'Max'].map((r) => (
            <Box key={r} sx={{ 
              px: 2, 
              py: 1, 
              borderRadius: 2, 
              bgcolor: r === '1D' ? 'rgba(41, 98, 255, 0.2)' : 'transparent',
              color: r === '1D' ? '#2962FF' : 'rgba(255,255,255,0.4)',
              fontWeight: 700,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
            }}>
              {r}
            </Box>
          ))}
        </Stack>

        {/* Custom Mini Chart Simulation to match image */}
        <Box sx={{ height: 250, position: 'relative', mb: 6 }}>
           {/* Grid Lines */}
           {[1820, 1810, 1800, 1790].map(val => (
             <Box key={val} sx={{ display: 'flex', alignItems: 'center', height: '25%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
               <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', width: 40 }}>{val}</Typography>
               <Box sx={{ flexGrow: 1 }} />
             </Box>
           ))}
           
           {/* SVG Path for the green area line */}
           <Box sx={{ position: 'absolute', top: 0, left: 40, right: 0, bottom: 0, pointerEvents: 'none' }}>
             <svg width="100%" height="100%" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4caf50" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#4caf50" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M 0 180 Q 50 20 100 80 T 200 60 T 300 100 T 400 40 T 500 90" fill="none" stroke="#4caf50" strokeWidth="3" />
                <path d="M 0 180 Q 50 20 100 80 T 200 60 T 300 100 T 400 40 T 500 90 L 500 250 L 0 250 Z" fill="url(#gradient)" />
                <circle cx="500" cy="90" r="5" fill="#4caf50" />
                {/* Previous Close Line */}
                <line x1="0" y1="120" x2="100%" y2="120" stroke="rgba(255,255,255,0.2)" strokeDasharray="5,5" />
             </svg>
             <Box sx={{ position: 'absolute', right: 0, top: 125, textAlign: 'right' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'block' }}>Previous Close:</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>1,801.30</Typography>
             </Box>
           </Box>

           {/* Volume Bars */}
           <Box sx={{ position: 'absolute', bottom: 0, left: 40, right: 0, height: 40, display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
              {Array.from({ length: 30 }).map((_, i) => (
                <Box key={i} sx={{ 
                  flexGrow: 1, 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  height: `${Math.random() * 100}%`,
                  borderRadius: '1px'
                }} />
              ))}
           </Box>
           <Typography variant="caption" sx={{ position: 'absolute', left: 0, bottom: 10, color: 'rgba(255,255,255,0.3)' }}>Vol</Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />
        
        <EnhancedStockStats stock={stock} />
      </Box>
      
      <Typography variant="caption" sx={{ mt: 3, display: 'block', color: 'rgba(255,255,255,0.2)' }}>
        Data from LSEG · Disclaimer
      </Typography>
    </Box>
  );
};

export default EnhancedStockDetailView;

