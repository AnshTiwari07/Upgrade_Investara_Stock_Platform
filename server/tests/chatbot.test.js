const chatbotService = require('../services/ChatbotService');
const financialService = require('../services/FinancialDataService');
const forecastingService = require('../services/ForecastingService');

jest.mock('../services/FinancialDataService');
jest.mock('../services/ForecastingService');

describe('ChatbotService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should recognize greetings', async () => {
    const responses = [
      await chatbotService.processMessage('hi'),
      await chatbotService.processMessage('hellooo'),
      await chatbotService.processMessage('hey there')
    ];

    responses.forEach(res => {
      expect(res.text).toContain("Hello! I'm your Investara Trading Assistant");
    });
  });

  test('should handle price queries', async () => {
    financialService.getRealTimeQuote.mockResolvedValue({
      price: 150.00,
      changePercent: 2.5
    });

    const res = await chatbotService.processMessage("what's the price of AAPL");
    
    expect(financialService.getRealTimeQuote).toHaveBeenCalledWith('AAPL');
    expect(res.text).toContain('The current price of AAPL is $150.00');
  });

  test('should handle forecast queries', async () => {
    financialService.getRealTimeQuote.mockResolvedValue({ symbol: 'TSLA', price: 200 });
    forecastingService.processTick.mockResolvedValue({
      trend: 'Bullish',
      confidence: 0.85,
      nextTarget: 210.50
    });

    const res = await chatbotService.processMessage("forecast for TSLA");
    
    expect(forecastingService.processTick).toHaveBeenCalled();
    expect(res.text).toContain('trend for TSLA is Bullish');
    expect(res.text).toContain('85% confidence');
  });

  test('should explain trading terms', async () => {
    const res = await chatbotService.processMessage("what is forex");
    expect(res.text).toContain('global marketplace for exchanging national currencies');
  });

  test('should handle system health checks', async () => {
    financialService.apiKey = 'test-key';
    financialService.isMarketOpen.mockReturnValue(true);

    const res = await chatbotService.processMessage("system status");
    expect(res.text).toContain('Connected (Alpha Vantage)');
    expect(res.text).toContain('Market Status: Open');
  });

  test('should provide fallback for unrecognized queries', async () => {
    const res = await chatbotService.processMessage("tell me a joke");
    expect(res.text).toContain("I'm not quite sure about that specific query");
  });

  test('should handle context-aware follow-ups', async () => {
    const context = { last_symbol: 'AAPL' };
    const res = await chatbotService.processMessage("tell me more about it", context);
    expect(res.text).toContain('You were asking about AAPL');
  });

  test('should handle errors gracefully', async () => {
    financialService.getRealTimeQuote.mockRejectedValue(new Error('API Failure'));
    
    const res = await chatbotService.processMessage("price of MSFT");
    expect(res.text).toContain("I encountered an error processing your request");
  });
});
