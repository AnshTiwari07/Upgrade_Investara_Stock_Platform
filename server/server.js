const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stocks');
const portfolioRoutes = require('./routes/portfolio');
const orderRoutes = require('./routes/orders');
const transactionRoutes = require('./routes/transactions');
const streamRoutes = require('./routes/stream');
const financialRoutes = require('./routes/financial');
const chatbotRoutes = require('./routes/chatbot');
const paymentRoutes = require('./routes/payments');
const marketStream = require('./sockets/marketStream');

// Load environment variables
dotenv.config();

const { register, collectDefaultMetrics } = require('prom-client');

const app = express();

// 1. Setup Prometheus Monitoring
collectDefaultMetrics({ prefix: 'investara_' });
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for now, restrict in production
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: "*", // Keep it open for Vercel, or set to your specific deployment URL
  credentials: true
}));

// Serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stream', streamRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/payments', paymentRoutes);

// 2. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'UP' : 'DOWN',
      server: 'UP'
    }
  });
});

// Initialize WebSocket stream
marketStream(io);

// Connect to Database
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/investara-clone';
console.log(`[Database] Attempting to connect to: ${mongoURI.split('@').pop()}`); // Log safely

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    if (process.env.NODE_ENV === 'production') {
      console.warn('CRITICAL: MongoDB connection failed in production. Ensure MONGO_URI is set in Vercel env variables.');
    }
  });

// Default route
app.get('/', (req, res) => {
  res.send('Investara Clone API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;