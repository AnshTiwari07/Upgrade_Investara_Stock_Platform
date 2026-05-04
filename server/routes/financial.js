const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const apiLimiter = require('../middleware/rateLimiter');
const financialService = require('../services/FinancialDataService');

// @route   GET api/financial/historical/:symbol
// @desc    Get historical data for a symbol
// @access  Private
router.get('/historical/:symbol', [auth, apiLimiter], async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval } = req.query; // 'daily' or 'intraday'
    const data = await financialService.getHistoricalData(symbol, interval);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/financial/quote/:symbol
// @desc    Get current real-time quote (simulated snapshot)
// @access  Private
router.get('/quote/:symbol', [auth, apiLimiter], (req, res) => {
  try {
    const { symbol } = req.params;
    // For snapshot, we can use the simulatePriceUpdate to get the latest state
    // But better to check if we have state, or initialize it.
    financialService.initializeMockData(symbol);
    const data = financialService.mockData[symbol];
    
    res.json({
      symbol,
      price: data.price,
      change: 0, // In a real app calculate change from open/prevClose
      percentChange: 0,
      volume: data.volume,
      timestamp: new Date(data.lastUpdated).toISOString()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
