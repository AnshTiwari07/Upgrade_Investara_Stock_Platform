const axios = require('axios');

class FinancialDataService {
  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.mockData = {};
    this.cache = new Map();
    this.cacheTTL = 60000; // 1 minute cache for real data
    this.lastRequestTime = 0;
    this.minRequestInterval = 12000; // 5 requests per minute limit (12s interval) for free tier
  }

  // Market hours check (Simulated for IST: 9:15 AM to 3:30 PM)
  isMarketOpen() {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    // Weekends closed
    if (day === 0 || day === 6) return false;

    // 9:15 AM = 555, 3:30 PM = 930
    return currentTime >= 555 && currentTime <= 930;
  }

  // Rate-limited wrapper for axios
  async throttledRequest(params) {
    const now = Date.now();
    const waitTime = Math.max(0, this.lastRequestTime + this.minRequestInterval - now);
    
    if (waitTime > 0) {
      console.log(`[FinancialData] Rate limiting: waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
    const start = Date.now();
    try {
      const response = await axios.get(this.baseUrl, { params });
      const duration = Date.now() - start;
      console.log(`[FinancialData] API Request ${params.function} for ${params.symbol} took ${duration}ms`);
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`[FinancialData Error] API Request ${params.function} failed after ${duration}ms: ${error.message}`);
      throw error;
    }
  }

  // Get real-time quote with caching
  async getRealTimeQuote(symbol) {
    const cached = this.cache.get(symbol);
    if (cached && (Date.now() - cached.timestamp < this.cacheTTL)) {
      return cached.data;
    }

    if (this.apiKey) {
      try {
        const response = await this.throttledRequest({
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.apiKey
        });

        const quote = response.data['Global Quote'];
        if (quote && quote['05. price']) {
          const data = {
            symbol: symbol,
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            volume: parseInt(quote['06. volume']),
            high: parseFloat(quote['03. high']),
            low: parseFloat(quote['04. low']),
            open: parseFloat(quote['02. open']),
            previousClose: parseFloat(quote['08. previous close']),
            timestamp: new Date().toISOString(),
            isAfterHours: !this.isMarketOpen()
          };
          this.cache.set(symbol, { data, timestamp: Date.now() });
          return data;
        }
      } catch (error) {
        console.warn(`Alpha Vantage Quote Error for ${symbol}:`, error.message);
      }
    }

    // Fallback to simulation if API fails or key is missing
    return this.simulatePriceUpdate(symbol);
  }

  // Generate mock initial data for a symbol
  initializeMockData(symbol, basePrice = 100) {
    if (!this.mockData[symbol]) {
      this.mockData[symbol] = {
        price: basePrice,
        volume: 1000,
        high: basePrice,
        low: basePrice,
        open: basePrice,
        lastUpdated: Date.now()
      };
    }
  }

  // Simulate a price update using a random walk
  simulatePriceUpdate(symbol) {
    if (!this.mockData[symbol]) {
      this.initializeMockData(symbol);
    }

    const current = this.mockData[symbol];
    const volatility = 0.002; // 0.2% max change per tick
    const change = current.price * volatility * (Math.random() - 0.5);
    const newPrice = Math.max(0.01, current.price + change);
    const roundedPrice = parseFloat(newPrice.toFixed(2));

    current.price = roundedPrice;
    current.volume += Math.floor(Math.random() * 100);
    current.high = Math.max(current.high, roundedPrice);
    current.low = Math.min(current.low, roundedPrice);
    current.lastUpdated = Date.now();

    const totalChange = roundedPrice - 100; // Mock change from base price
    const changePercent = (totalChange / 100) * 100;

    return {
      symbol,
      price: roundedPrice,
      change: parseFloat(totalChange.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: current.volume,
      high: current.high,
      low: current.low,
      timestamp: new Date().toISOString(),
      type: 'trade'
    };
  }

  async getHistoricalData(symbol, range = '1M') {
    const cached = this.cache.get(`${symbol}_${range}`);
    if (cached && (Date.now() - cached.timestamp < 3600000)) { // 1 hour cache for historical
      return cached.data;
    }

    let data;
    if (this.apiKey) {
      try {
        let functionName = 'TIME_SERIES_DAILY';
        let outputSize = 'compact';

        if (range === '5Y' || range === '1Y') {
          outputSize = 'full';
        } else if (range === '1D' || range === '1W') {
          functionName = 'TIME_SERIES_INTRADAY';
        }

        const response = await this.throttledRequest({
          function: functionName,
          symbol: symbol,
          interval: functionName === 'TIME_SERIES_INTRADAY' ? '5min' : undefined,
          outputsize: outputSize,
          apikey: this.apiKey
        });

        data = this.normalizeAlphaVantageData(response.data);
        if (data && data.length > 0) {
          data = this.filterDataByRange(data, range);
          this.cache.set(`${symbol}_${range}`, { data, timestamp: Date.now() });
          return data;
        }
      } catch (error) {
        console.warn(`Alpha Vantage Historical Error for ${symbol}:`, error.message);
      }
    }

    // Fallback to generated data
    const daysMap = { '1D': 1, '1W': 7, '1M': 30, '1Y': 365, '5Y': 1825 };
    data = this.generateMockHistoricalData(symbol, daysMap[range] || 30);
    this.cache.set(`${symbol}_${range}`, { data, timestamp: Date.now() });
    return data;
  }

  filterDataByRange(data, range) {
    const now = new Date();
    let cutoff = new Date();

    switch (range) {
      case '1D': cutoff.setHours(0, 0, 0, 0); break;
      case '1W': cutoff.setDate(now.getDate() - 7); break;
      case '1M': cutoff.setMonth(now.getMonth() - 1); break;
      case '1Y': cutoff.setFullYear(now.getFullYear() - 1); break;
      case '5Y': cutoff.setFullYear(now.getFullYear() - 5); break;
      default: cutoff.setMonth(now.getMonth() - 1);
    }

    return data.filter(item => new Date(item.date) >= cutoff);
  }

  normalizeAlphaVantageData(data) {
    const timeSeriesKey = Object.keys(data).find(k => k.includes('Time Series'));
    if (!timeSeriesKey) return [];

    const timeSeries = data[timeSeriesKey];
    return Object.entries(timeSeries).map(([date, values]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    })).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort ascending
  }

  generateMockHistoricalData(symbol, days) {
    const data = [];
    let price = 100;
    const now = new Date();

    for (let i = days; i > 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const open = price;
      const close = price * (1 + (Math.random() - 0.5) * 0.05);
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      const volume = Math.floor(Math.random() * 1000000) + 50000;

      data.push({
        date: date.toISOString().split('T')[0],
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume
      });

      price = close;
    }
    return data;
  }
}

module.exports = new FinancialDataService();

