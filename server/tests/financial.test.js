const financialService = require('../services/FinancialDataService');

describe('FinancialDataService', () => {
  beforeEach(() => {
    // Reset mock data before each test
    financialService.mockData = {};
  });

  test('initializeMockData should create initial state for a symbol', () => {
    financialService.initializeMockData('AAPL', 150);
    const data = financialService.mockData['AAPL'];
    expect(data).toBeDefined();
    expect(data.price).toBe(150);
    expect(data.volume).toBe(1000);
  });

  test('simulatePriceUpdate should update price and volume', () => {
    financialService.initializeMockData('AAPL', 100);
    // Force multiple updates to ensure it's extremely unlikely to stay at exactly 100
    financialService.simulatePriceUpdate('AAPL');
    financialService.simulatePriceUpdate('AAPL');
    const update = financialService.simulatePriceUpdate('AAPL');
    
    expect(update.symbol).toBe('AAPL');
    expect(update.volume).toBeGreaterThan(1000);
    expect(update.timestamp).toBeDefined();
    
    const stored = financialService.mockData['AAPL'];
    expect(stored.price).toBe(update.price);
  });

  test('getHistoricalData should return generated data when no API key', async () => {
    const data = await financialService.getHistoricalData('AAPL');
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(30);
    expect(data[0]).toHaveProperty('open');
    expect(data[0]).toHaveProperty('close');
    expect(data[0]).toHaveProperty('high');
    expect(data[0]).toHaveProperty('low');
    expect(data[0]).toHaveProperty('volume');
    expect(data[0]).toHaveProperty('date');
  });

  test('normalizeAlphaVantageData should format data correctly', () => {
    const mockApiResponse = {
      "Meta Data": {},
      "Time Series (Daily)": {
        "2023-10-27": {
          "1. open": "150.00",
          "2. high": "155.00",
          "3. low": "149.50",
          "4. close": "153.20",
          "5. volume": "1000000"
        }
      }
    };

    const normalized = financialService.normalizeAlphaVantageData(mockApiResponse);
    expect(normalized).toHaveLength(1);
    expect(normalized[0].date).toBe("2023-10-27");
    expect(normalized[0].close).toBe(153.20);
  });
});
