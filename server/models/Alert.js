const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    enum: ['GREATER_THAN', 'LESS_THAN', 'VOLUME_SPIKE'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isTriggered: {
    type: Boolean,
    default: false
  },
  notificationChannels: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  triggeredAt: {
    type: Date
  }
});

module.exports = mongoose.model('Alert', AlertSchema);
