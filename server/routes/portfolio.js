const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');
const auth = require('../middleware/auth');

// GET /api/portfolio - get current user's portfolio
router.get('/', auth, async (req, res) => {
  try {
    console.log(`Fetching portfolio for user: ${req.user.id}`);
    let portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      console.log(`No portfolio found for user: ${req.user.id}, creating new one.`);
      portfolio = new Portfolio({ user: req.user.id, holdings: [] });
      await portfolio.save();
    }

    // Recalculate summary fields from holdings
    let totalInvestment = 0;
    let currentValue = 0;
    const holdings = portfolio.holdings || [];

    for (const h of holdings) {
      const stock = await Stock.findOne({ symbol: h.symbol });
      if (!stock) {
        console.warn(`Stock not found in database: ${h.symbol}. Using averageBuyPrice as fallback current price.`);
      }
      const price = stock ? stock.currentPrice : h.averageBuyPrice;
      h.currentValue = Number((h.quantity * price).toFixed(2));
      h.investedAmount = Number((h.quantity * h.averageBuyPrice).toFixed(2));
      h.profitLoss = Number((h.currentValue - h.investedAmount).toFixed(2));
      h.profitLossPercentage = h.investedAmount > 0 ? Number(((h.profitLoss / h.investedAmount) * 100).toFixed(2)) : 0;
      totalInvestment += h.investedAmount;
      currentValue += h.currentValue;
    }

    portfolio.totalInvestment = Number(totalInvestment.toFixed(2));
    portfolio.currentValue = Number(currentValue.toFixed(2));
    portfolio.overallProfitLoss = Number((currentValue - totalInvestment).toFixed(2));
    portfolio.overallProfitLossPercentage = totalInvestment > 0 ? Number((((currentValue - totalInvestment) / totalInvestment) * 100).toFixed(2)) : 0;
    
    portfolio.updatedAt = Date.now();
    await portfolio.save();

    res.json(portfolio);
  } catch (err) {
    console.error('Portfolio Error:', err.message);
    res.status(500).json({ msg: 'Server error: Unable to retrieve portfolio details.' });
  }
});

module.exports = router;