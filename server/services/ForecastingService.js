/**
 * LSTM Trend Forecasting Service
 * Mock implementation of LSTM logic using sliding windows and directional probability
 * to demonstrate the integration in the Investara Dashboard.
 */
class ForecastingService {
  constructor() {
    this.models = {}; // Store mock models for each symbol
    this.history = {}; // Windowed history for training
    this.windowSize = 30; // 30 ticks for training
    this.predictionAccuracy = 0.78; // Targeted directional accuracy
  }

  /**
   * Main entry point for tick ingestion to update forecast
   */
  async processTick(tick) {
    const { symbol, price } = tick;
    
    if (!this.history[symbol]) this.history[symbol] = [];
    this.history[symbol].push(price);
    
    if (this.history[symbol].length > this.windowSize) {
      this.history[symbol].shift();
    }

    // Only start forecasting once we have enough data
    if (this.history[symbol].length < this.windowSize) {
      return null;
    }

    return this.generateForecast(symbol);
  }

  /**
   * Generate a 5-step directional forecast
   */
  generateForecast(symbol) {
    const data = this.history[symbol];
    const lastPrice = data[data.length - 1];
    
    // Calculate simple momentum
    const shortEMA = this.calculateSimpleEMA(data, 5);
    const longEMA = this.calculateSimpleEMA(data, 15);
    const momentum = shortEMA - longEMA;
    
    // Simulate LSTM output: 5 future points
    const forecast = [];
    let currentBase = lastPrice;
    
    for (let i = 1; i <= 5; i++) {
      // Add a slight bias towards momentum + some random noise
      const bias = (momentum * 0.1) * i;
      const noise = (Math.random() - 0.5) * (lastPrice * 0.005);
      currentBase += (bias + noise);
      forecast.push(Number(currentBase.toFixed(2)));
    }

    return {
      forecast,
      trend: momentum > 0 ? 'BULLISH' : 'BEARISH',
      confidence: Number((0.7 + Math.random() * 0.1).toFixed(2)), // 70-80% confidence
      nextTarget: forecast[4]
    };
  }

  calculateSimpleEMA(data, period) {
    if (data.length < period) return data[data.length - 1];
    const multiplier = 2 / (period + 1);
    let ema = data[data.length - period];
    for (let i = data.length - period + 1; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }
    return ema;
  }

  /**
   * Mock daily retraining pipeline
   */
  async runDailyRetraining() {
    console.log('[ML] Starting daily LSTM retraining pipeline...');
    // In a real app, this would query Postgres for 24h of data and update weights
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('[ML] Retraining complete. Accuracy: 78.4%');
  }
}

module.exports = new ForecastingService();
