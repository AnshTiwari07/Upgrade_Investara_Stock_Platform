const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const crypto = require('crypto');
const QRCode = require('qrcode');

// NPCI Settings
const UPI_CONFIG = {
  payeeVpa: 'investara@bank',
  payeeName: 'Investara Trading',
  merchantCode: '0000', // Mock merchant code
  currency: 'INR'
};

// @route   POST api/payments/generate-upi-qr
// @desc    Generate a dynamic UPI QR code
// @access  Private
router.post('/generate-upi-qr', auth, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: 'Please provide a valid amount' });
  }

  try {
    const transactionId = 'UPI' + crypto.randomBytes(8).toString('hex').toUpperCase();
    
    // NPCI Compliant UPI URI
    // Format: upi://pay?pa=<vpa>&pn=<name>&am=<amount>&cu=<curr>&tr=<txn_id>
    const upiUri = `upi://pay?pa=${UPI_CONFIG.payeeVpa}&pn=${encodeURIComponent(UPI_CONFIG.payeeName)}&am=${amount}&cu=${UPI_CONFIG.currency}&tr=${transactionId}&mc=${UPI_CONFIG.merchantCode}`;

    // Generate QR Code as Data URL
    const qrDataUrl = await QRCode.toDataURL(upiUri);

    // Create a pending transaction
    const transaction = new Transaction({
      user: req.user.id,
      type: 'DEPOSIT',
      amount,
      paymentMethod: 'UPI',
      transactionId,
      status: 'PENDING',
      paymentDetails: {
        upiId: 'Direct QR Payment'
      }
    });

    await transaction.save();

    res.json({
      qrCode: qrDataUrl,
      upiUri,
      transactionId,
      amount
    });
  } catch (err) {
    console.error('[UPI QR Error]', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/payments/status/:transactionId
// @desc    Check status of a specific transaction
// @access  Private
router.get('/status/:transactionId', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ transactionId: req.params.transactionId });
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    res.json({ status: transaction.status });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/payments/webhook/upi
// @desc    Mock webhook for UPI payment status updates
// @access  Public (In production, would be secured by gateway signature)
router.post('/webhook/upi', async (req, res) => {
  const { transactionId, status } = req.body;
  
  try {
    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    if (transaction.status === 'PENDING' && status === 'SUCCESS') {
      transaction.status = 'COMPLETED';
      await transaction.save();

      // Update user balance
      const User = require('../models/User');
      const user = await User.findById(transaction.user);
      if (user) {
        user.balance += transaction.amount;
        await user.save();
      }
    }

    res.json({ msg: 'Webhook received' });
  } catch (err) {
    console.error('[Webhook Error]', err);
    res.status(500).send('Internal Error');
  }
});

// @route   POST api/payments/deposit
// @desc    Deposit funds using a payment method
// @access  Private
router.post('/deposit', auth, async (req, res) => {
  const { amount, paymentMethod, paymentDetails } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: 'Please provide a valid amount' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Generate a mock transaction ID
    const transactionId = 'TXN' + crypto.randomBytes(8).toString('hex').toUpperCase();

    // PCI DSS Note: Never store full card numbers or CVV. 
    // We only store masked card numbers for transaction history.
    const transaction = new Transaction({
      user: req.user.id,
      type: 'DEPOSIT',
      amount,
      paymentMethod,
      transactionId,
      status: 'COMPLETED', // Mocking instant success for now
      paymentDetails: {
        upiId: paymentDetails?.upiId,
        cardNumber: paymentDetails?.cardNumber ? `**** **** **** ${paymentDetails.cardNumber.slice(-4)}` : undefined,
        cardType: paymentDetails?.cardType
      }
    });

    await transaction.save();

    // Update user balance
    user.balance += Number(amount);
    await user.save();

    res.json({
      msg: 'Deposit successful',
      balance: user.balance,
      transaction
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/payments/history
// @desc    Get payment history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
