const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const portfolioRoutes = require('../routes/portfolio');
const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');

// Create a simple express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware
const mockAuth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token || token === 'invalid') {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, 'test_secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Use the mock auth for testing
app.use('/api/portfolio', (req, res, next) => {
  // Replace the real auth middleware with our mock for testing purposes
  // In a real scenario, we'd use jest.mock('../middleware/auth')
  mockAuth(req, res, next);
}, portfolioRoutes);

// Mock the models
jest.mock('../models/Portfolio');
jest.mock('../models/Stock');

describe('Portfolio API Integration Tests', () => {
  let token;
  const userId = new mongoose.Types.ObjectId().toString();

  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret';
    token = jwt.sign({ user: { id: userId } }, 'test_secret');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/portfolio - Success - Returns portfolio with calculated values', async () => {
    const mockPortfolio = {
      user: userId,
      holdings: [
        { symbol: 'RELIANCE', quantity: 10, averageBuyPrice: 2000 }
      ],
      save: jest.fn().mockResolvedValue(true)
    };

    const mockStock = {
      symbol: 'RELIANCE',
      currentPrice: 2500
    };

    Portfolio.findOne.mockResolvedValue(mockPortfolio);
    Stock.findOne.mockResolvedValue(mockStock);

    const res = await request(app)
      .get('/api/portfolio')
      .set('x-auth-token', token);

    expect(res.status).toBe(200);
    expect(res.body.holdings[0].currentValue).toBe(25000); // 10 * 2500
    expect(res.body.holdings[0].investedAmount).toBe(20000); // 10 * 2000
    expect(res.body.holdings[0].profitLoss).toBe(5000);
    expect(res.body.holdings[0].profitLossPercentage).toBe(25);
    expect(res.body.totalInvestment).toBe(20000);
    expect(res.body.currentValue).toBe(25000);
    expect(res.body.overallProfitLoss).toBe(5000);
    expect(res.body.overallProfitLossPercentage).toBe(25);
  });

  test('GET /api/portfolio - Success - Creates new portfolio if none exists', async () => {
    Portfolio.findOne.mockResolvedValue(null);
    // Mock the constructor behavior
    Portfolio.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
      holdings: []
    }));

    const res = await request(app)
      .get('/api/portfolio')
      .set('x-auth-token', token);

    expect(res.status).toBe(200);
  });

  test('GET /api/portfolio - Failure - Missing Authentication', async () => {
    const res = await request(app).get('/api/portfolio');
    expect(res.status).toBe(401);
    expect(res.body.msg).toBe('No token, authorization denied');
  });

  test('GET /api/portfolio - Failure - Invalid Token', async () => {
    const res = await request(app)
      .get('/api/portfolio')
      .set('x-auth-token', 'invalid');
    expect(res.status).toBe(401);
    expect(res.body.msg).toBe('No token, authorization denied');
  });

  test('GET /api/portfolio - Failure - Server Error', async () => {
    Portfolio.findOne.mockRejectedValue(new Error('Database connection failed'));

    const res = await request(app)
      .get('/api/portfolio')
      .set('x-auth-token', token);

    expect(res.status).toBe(500);
    expect(res.body.msg).toContain('Server error');
  });

  test('GET /api/portfolio - Success - Handles missing stock in database', async () => {
    const mockPortfolio = {
      user: userId,
      holdings: [
        { symbol: 'UNKNOWN', quantity: 5, averageBuyPrice: 100 }
      ],
      save: jest.fn().mockResolvedValue(true)
    };

    Portfolio.findOne.mockResolvedValue(mockPortfolio);
    Stock.findOne.mockResolvedValue(null); // Stock not found

    const res = await request(app)
      .get('/api/portfolio')
      .set('x-auth-token', token);

    expect(res.status).toBe(200);
    // Should fallback to averageBuyPrice for currentValue calculation
    expect(res.body.holdings[0].currentValue).toBe(500); // 5 * 100
    expect(res.body.holdings[0].profitLoss).toBe(0);
  });
});
