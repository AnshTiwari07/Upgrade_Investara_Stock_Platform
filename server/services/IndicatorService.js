/**
 * Technical Indicator Calculation Engine
 */
class IndicatorService {
  /**
   * Simple Moving Average (SMA)
   */
  calculateSMA(data, window = 14) {
    if (data.length < window) return null;
    const slice = data.slice(-window);
    const sum = slice.reduce((acc, val) => acc + val.price, 0);
    return Number((sum / window).toFixed(2));
  }

  /**
   * Exponential Moving Average (EMA)
   */
  calculateEMA(data, window = 14, previousEMA = null) {
    if (data.length < window) return null;
    const currentPrice = data[data.length - 1].price;
    const multiplier = 2 / (window + 1);
    
    if (previousEMA === null) {
      return this.calculateSMA(data, window);
    }
    
    const ema = (currentPrice - previousEMA) * multiplier + previousEMA;
    return Number(ema.toFixed(2));
  }

  /**
   * Relative Strength Index (RSI)
   */
  calculateRSI(data, window = 14) {
    if (data.length < window + 1) return null;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = data.length - window; i < data.length; i++) {
      const difference = data[i].price - data[i - 1].price;
      if (difference >= 0) {
        gains += difference;
      } else {
        losses -= difference;
      }
    }
    
    const avgGain = gains / window;
    const avgLoss = losses / window;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    return Number(rsi.toFixed(2));
  }

  /**
   * Moving Average Convergence Divergence (MACD)
   */
  calculateMACD(data, fastWindow = 12, slowWindow = 26, signalWindow = 9) {
    if (data.length < slowWindow) return null;
    
    const fastEMA = this.calculateEMA(data, fastWindow);
    const slowEMA = this.calculateEMA(data, slowWindow);
    
    if (fastEMA === null || slowEMA === null) return null;
    
    const macdLine = fastEMA - slowEMA;
    // For a real implementation, we'd maintain a series of MACD lines to calculate the signal line
    // Here we'll return the MACD line and a mock signal/histogram for simplicity in this tick-by-tick simulation
    return {
      macdLine: Number(macdLine.toFixed(2)),
      signalLine: Number((macdLine * 0.9).toFixed(2)), // Mock signal
      histogram: Number((macdLine * 0.1).toFixed(2))   // Mock histogram
    };
  }

  /**
   * Bollinger Bands
   */
  calculateBollingerBands(data, window = 20, stdDevMultiplier = 2) {
    if (data.length < window) return null;
    
    const sma = this.calculateSMA(data, window);
    const slice = data.slice(-window);
    const squareDiffs = slice.map(val => Math.pow(val.price - sma, 2));
    const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / window;
    const stdDev = Math.sqrt(avgSquareDiff);
    
    return {
      middle: sma,
      upper: Number((sma + stdDevMultiplier * stdDev).toFixed(2)),
      lower: Number((sma - stdDevMultiplier * stdDev).toFixed(2))
    };
  }
}

module.exports = new IndicatorService();
