const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Mock auth middleware before importing routes
jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = { id: '507f1f77bcf86cd799439011' };
  next();
});

const paymentRoutes = require('../routes/payments');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const app = express();
app.use(express.json());
app.use('/api/payments', paymentRoutes);

describe('Payment API', () => {
  let user;

  beforeAll(async () => {
    const url = `mongodb://127.0.0.1/payment_test`;
    await mongoose.connect(url, { useNewUrlParser: true });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    
    user = new User({
      _id: '507f1f77bcf86cd799439011',
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123',
      balance: 1000
    });
    await user.save();
  });

  it('should deposit funds via UPI', async () => {
    const res = await request(app)
      .post('/api/payments/deposit')
      .send({
        amount: 500,
        paymentMethod: 'UPI',
        paymentDetails: { upiId: 'test@upi' }
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.balance).toEqual(1500);
    expect(res.body.transaction.paymentMethod).toEqual('UPI');
  });

  it('should deposit funds via CARD', async () => {
    const res = await request(app)
      .post('/api/payments/deposit')
      .send({
        amount: 1000,
        paymentMethod: 'CARD',
        paymentDetails: { cardNumber: '4111111111111111', cardType: 'VISA' }
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.balance).toEqual(2000);
    expect(res.body.transaction.paymentDetails.cardNumber).toEqual('**** **** **** 1111');
  });

  it('should return error for invalid amount', async () => {
    const res = await request(app)
      .post('/api/payments/deposit')
      .send({
        amount: -100,
        paymentMethod: 'UPI'
      });

    expect(res.statusCode).toEqual(400);
  });

  it('should fetch transaction history', async () => {
    // Add a transaction first
    const txn = new Transaction({
      user: user._id,
      type: 'DEPOSIT',
      amount: 500,
      paymentMethod: 'UPI',
      transactionId: 'TXN123',
      status: 'COMPLETED'
    });
    await txn.save();

    const res = await request(app).get('/api/payments/history');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].transactionId).toEqual('TXN123');
  });

  it('should generate a dynamic UPI QR code', async () => {
    const res = await request(app)
      .post('/api/payments/generate-upi-qr')
      .send({ amount: 500 });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('qrCode');
    expect(res.body).toHaveProperty('upiUri');
    expect(res.body.upiUri).toContain('upi://pay');
    expect(res.body.upiUri).toContain('am=500');
  });

  it('should update status via webhook', async () => {
    const txn = new Transaction({
      user: user._id,
      type: 'DEPOSIT',
      amount: 1000,
      paymentMethod: 'UPI',
      transactionId: 'UPI_TEST_123',
      status: 'PENDING'
    });
    await txn.save();

    const res = await request(app)
      .post('/api/payments/webhook/upi')
      .send({ transactionId: 'UPI_TEST_123', status: 'SUCCESS' });

    expect(res.statusCode).toEqual(200);
    
    const updatedTxn = await Transaction.findOne({ transactionId: 'UPI_TEST_123' });
    expect(updatedTxn.status).toEqual('COMPLETED');
    
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.balance).toEqual(2000);
  });
});
