const app = require('../server/server');

// Simple middleware to log requests for debugging in Vercel
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`[API Request] ${req.method} ${req.url}`);
  }
  next();
});

module.exports = app;
