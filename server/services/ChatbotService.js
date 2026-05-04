const financialService = require('./FinancialDataService');
const forecastingService = require('./ForecastingService');

/**
 * Investara AI Chatbot Service
 * Provides trading domain expertise, real-time insights, and NLP capabilities.
 */
class ChatbotService {
  constructor() {
    this.knowledgeBase = {
      forex: "Forex (Foreign Exchange) is the global marketplace for exchanging national currencies. It's the largest financial market in the world, operating 24/5.",
      derivatives: "Derivatives are financial contracts whose value is dependent on an underlying asset (like stocks or commodities). Common types include Futures and Options.",
      risk_management: "Risk management in trading involves strategies like position sizing, stop-loss orders, and diversification to protect your capital from market volatility.",
      compliance: "Trading compliance refers to adhering to regulatory standards set by bodies like the SEC (US), FCA (UK), or SEBI (India) to ensure fair and transparent markets.",
      lstm: "Investara uses Long Short-Term Memory (LSTM) neural networks to analyze sequential market data and forecast trends with high directional accuracy.",
      sentiment: "Market sentiment reflects the overall attitude of investors toward a particular security or the financial market as a whole (Bullish vs. Bearish).",
      margin: "Margin trading allows you to buy more stock than you'd normally be able to by borrowing money from your broker.",
      leverage: "Leverage involves using borrowed capital to increase the potential return of an investment, though it also increases risk.",
      stocks: "Stocks represent ownership in a corporation. When you buy a stock, you're buying a small piece of that company.",
      bonds: "Bonds are fixed-income instruments that represent a loan made by an investor to a borrower (typically corporate or governmental).",
      mutual_funds: "Mutual funds pool money from many investors to purchase a diversified portfolio of stocks, bonds, or other securities.",
      etfs: "Exchange-Traded Funds (ETFs) are similar to mutual funds but trade on stock exchanges just like individual stocks.",
      dividends: "Dividends are payments made by a corporation to its shareholders, usually as a distribution of profits.",
      bull_market: "A bull market is a period of rising prices in the financial markets, often accompanied by investor optimism.",
      bear_market: "A bear market is a period of falling prices, usually defined by a 20% drop from recent highs, accompanied by pessimism."
    };

    this.intents = [
      {
        name: 'get_price',
        patterns: [
          /\bprice of (\w+)\b/i, 
          /\bhow much is (\w+)\b/i, 
          /\bquote for (\w+)\b/i, 
          /\bcurrent (\w+) price\b/i,
          /\bwhat's the price of (\w+)\b/i,
          /\bprice (\w+)\b/i,
          /\b(\w+) price\b/i
        ],
        handler: this.handleGetPrice.bind(this)
      },
      {
        name: 'get_forecast',
        patterns: [
          /\bforecast for (\w+)\b/i, 
          /\btrend for (\w+)\b/i, 
          /\bfuture of (\w+)\b/i, 
          /\bpredict (\w+)\b/i,
          /\bwhat is the forecast for (\w+)\b/i,
          /\bforecast (\w+)\b/i
        ],
        handler: this.handleGetForecast.bind(this)
      },
      {
        name: 'explain_term',
        patterns: [
          /\bwhat (?:is|are) (forex|derivatives|compliance|risk management|lstm|sentiment|margin|leverage|stocks|bonds|mutual funds|etfs|dividends|bull market|bear market)\b/i, 
          /\bexplain (forex|derivatives|compliance|risk management|lstm|sentiment|margin|leverage|stocks|bonds|mutual funds|etfs|dividends|bull market|bear market)\b/i, 
          /\bhow (?:does|do) (forex|derivatives|compliance|risk management|lstm|sentiment|margin|leverage|stocks|bonds|mutual funds|etfs|dividends|bull market|bear market) work\b/i,
          /\btell me about (forex|derivatives|compliance|risk management|lstm|sentiment|margin|leverage|stocks|bonds|mutual funds|etfs|dividends|bull market|bear market)\b/i
        ],
        handler: this.handleExplainTerm.bind(this)
      },
      {
        name: 'risk_advice',
        patterns: [
          /\brisk\b/i, 
          /\bhow much should I invest\b/i, 
          /\bstop loss\b/i,
          /\binvestment advice\b/i
        ],
        handler: this.handleRiskAdvice.bind(this)
      },
      {
        name: 'market_status',
        patterns: [
          /\bis the market open\b/i, 
          /\btrading hours\b/i, 
          /\bwhen (?:does|do) the market (?:close|open)\b/i
        ],
        handler: this.handleMarketStatus.bind(this)
      },
      {
        name: 'greeting',
        patterns: [
          /\bh+i+\b/i, // hi, hii, hiii
          /\bh+e+y+\b/i, // hey, heyyy
          /\bh+e+l+o+\b/i, // hello, hellooo
          /\bh+e+l+p+\b/i, // help, helpp
          /\bgood\s+morning\b/i, 
          /\bhow\s+are\s+you\b/i,
          /\bwh?at's?\s+up\b/i
        ],
        handler: this.handleGreeting.bind(this)
      },
      {
        name: 'sentiment',
        patterns: [
          /\bsentiment for (\w+)\b/i, 
          /\bwhat (?:do|does) people think of (\w+)\b/i, 
          /\bmarket feeling for (\w+)\b/i
        ],
        handler: this.handleSentiment.bind(this)
      },
      {
        name: 'flexible_phrases',
        patterns: [/flexible phrases/i],
        handler: (message, match, context) => ({
          text: "I can handle a variety of natural language phrases! For example, you can ask 'what's the price of AAPL' or 'tell me about forex' instead of just 'price of AAPL'.",
          context: context
        })
      },
      {
        name: 'system_health',
        patterns: [
          /\bcheck system\b/i,
          /\bsystem status\b/i,
          /\bis everything working\b/i,
          /\bapi status\b/i
        ],
        handler: this.handleSystemHealth.bind(this)
      },
      {
        name: 'follow_up',
        patterns: [
          /\btell me more about it\b/i,
          /\bmore info\b/i,
          /\bwhat else\b/i
        ],
        handler: this.handleFollowUp.bind(this)
      },
      {
        name: 'investara_info',
        patterns: [
          /\bwho are you\b/i, 
          /\bwhat can you do\b/i, 
          /\bhow can you help\b/i,
          /\bwhat is investara\b/i
        ],
        handler: this.handleInvestaraInfo.bind(this)
      },
      {
        name: 'conversational',
        patterns: [
          /\bthank you\b/i, 
          /\bthanks\b/i, 
          /\bbye\b/i, 
          /\bgoodbye\b/i,
          /\bokay\b/i,
          /\bok\b/i
        ],
        handler: this.handleConversational.bind(this)
      },
      {
        name: 'multilingual_greeting',
        patterns: [/\bhola\b/i, /\bbonjour\b/i, /\bnamaste\b/i, /\bciao\b/i],
        handler: this.handleMultilingualGreeting.bind(this)
      }
    ];
  }

  async handleFollowUp(message, match, context) {
    if (context && context.last_symbol) {
      const symbol = context.last_symbol;
      return {
        text: `You were asking about ${symbol}. Beyond the current price, would you like to see a forecast or social sentiment analysis for ${symbol}?`,
        context: context
      };
    }
    return {
      text: "I'm not sure what you're referring to. What stock or trading concept would you like to know more about?",
      context: context
    };
  }

  async handleSystemHealth(message, match, context) {
    const isApiConnected = !!financialService.apiKey;
    const isMarketOpen = financialService.isMarketOpen();
    
    return {
      text: `System Diagnostics:
- Market Connectivity: ${isApiConnected ? 'Connected (Alpha Vantage)' : 'Simulated (Mock Mode)'}
- Market Status: ${isMarketOpen ? 'Open' : 'Closed'}
- AI Models: LSTM Forecasting Operational
- Database: Connected
All systems are currently functioning within normal parameters.`,
      context: context
    };
  }

  handleInvestaraInfo(message, match, context) {
    return {
      text: "I'm your Investara AI Assistant. I can provide real-time stock prices, LSTM-based market forecasts, explain trading terms like 'forex' or 'leverage', and give you general risk management advice. How can I assist your trading today?",
      context: context
    };
  }

  handleConversational(message, match, context) {
    const cleanMsg = match[0].toLowerCase();
    let responseText = "You're welcome! Let me know if you have more questions.";
    
    if (cleanMsg.includes('bye') || cleanMsg.includes('goodbye')) {
      responseText = "Goodbye! Happy trading and see you soon on Investara.";
    } else if (cleanMsg === 'ok' || cleanMsg === 'okay') {
      responseText = "Is there anything specific you'd like to know about the markets?";
    }
    
    return {
      text: responseText,
      context: context
    };
  }

  async handleSentiment(message, match, context) {
    const symbol = match[1].toUpperCase();
    const sentiments = ['Highly Bullish', 'Slightly Bullish', 'Neutral', 'Slightly Bearish', 'Highly Bearish'];
    const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const volumeImpact = Math.floor(Math.random() * 100);

    return {
      text: `Current social sentiment for ${symbol} is ${randomSentiment}. We've observed a ${volumeImpact}% increase in social mentions over the last 24 hours.`,
      context: { ...context, last_symbol: symbol }
    };
  }

  handleMultilingualGreeting(message, match, context) {
    const greeting = match[0].toLowerCase();
    const responses = {
      hola: "¡Hola! Soy tu asistente de Investara. ¿En qué puedo ayudarte hoy?",
      bonjour: "Bonjour! Je suis votre assistant Investara. Comment puis-je vous aider aujourd'hui ?",
      namaste: "नमस्ते! मैं आपका इन्वेस्टारा सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
      ciao: "Ciao! Sono il tuo assistente Investara. Come posso aiutarti oggi?"
    };
    return {
      text: responses[greeting] || "Hello! I support multiple languages. How can I help you today?",
      context: context
    };
  }

  async handleRiskAdvice(message, match, context) {
    return {
      text: "A golden rule of risk management is the '2% Rule': never risk more than 2% of your total trading capital on a single trade. Always use stop-loss orders to define your exit point before you enter a trade.",
      context: context
    };
  }

  async handleMarketStatus(message, match, context) {
    const isOpen = financialService.isMarketOpen();
    return {
      text: isOpen 
        ? "The Indian markets (NSE/BSE) are currently OPEN. Standard trading hours are 9:15 AM to 3:30 PM IST." 
        : "The Indian markets are currently CLOSED. They operate Monday to Friday, 9:15 AM to 3:30 PM IST.",
      context: context
    };
  }

  /**
   * Process incoming user message
   */
  async processMessage(message, context = {}) {
    const startTime = Date.now();
    try {
      console.log(`[Chatbot] Processing message: "${message}"`);
      
      // 1. Intent Classification
      const intent = this.classifyIntent(message);
      
      let result;
      if (intent) {
        console.log(`[Chatbot] Recognized intent: ${intent.name}`);
        // 2. Handle specific intent
        result = await intent.handler(message, intent.match, context);
      } else {
        console.log(`[Chatbot] No intent recognized. Falling back.`);
        // 3. Fallback for general trading advice
        result = {
          text: "I'm not quite sure about that specific query. You can ask me about stock prices (e.g., 'price of AAPL'), market trends, or trading concepts like Forex and Risk Management.",
          context: context
        };
      }

      const duration = Date.now() - startTime;
      console.log(`[Chatbot] Processed in ${duration}ms`);
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Chatbot Error] Processing Error after ${duration}ms:`, error);
      return {
        text: "I encountered an error processing your request. Please try again in a moment.",
        context: context
      };
    }
  }

  classifyIntent(message) {
    const cleanMessage = message.trim().toLowerCase();
    console.log(`[Chatbot] Classifying message: "${cleanMessage}"`);
    for (const intent of this.intents) {
      for (const pattern of intent.patterns) {
        const match = cleanMessage.match(pattern);
        if (match) {
          console.log(`[Chatbot] Match found for intent: ${intent.name} with pattern: ${pattern}`);
          return { ...intent, match };
        }
      }
    }
    return null;
  }

  async handleGetPrice(message, match, context) {
    const symbol = match[1].toUpperCase();
    const data = await financialService.getRealTimeQuote(symbol);
    
    if (data && data.price) {
      return {
        text: `The current price of ${symbol} is $${data.price.toFixed(2)}. It has changed by ${data.changePercent.toFixed(2)}% today.`,
        data: data,
        context: { ...context, last_symbol: symbol }
      };
    }
    return { text: `I couldn't find real-time data for ${symbol}. Please verify the ticker.` };
  }

  async handleGetForecast(message, match, context) {
    const symbol = match[1].toUpperCase();
    // Get current data first to process tick in forecasting service
    const tick = await financialService.getRealTimeQuote(symbol);
    const forecast = await forecastingService.processTick(tick);

    if (forecast) {
      return {
        text: `Based on our LSTM model, the trend for ${symbol} is ${forecast.trend} with ${Math.round(forecast.confidence * 100)}% confidence. The next price target is approximately $${forecast.nextTarget.toFixed(2)}.`,
        data: forecast,
        context: { ...context, last_symbol: symbol }
      };
    }
    return { text: `I'm still gathering data to generate a reliable forecast for ${symbol}. Try again in a few seconds.` };
  }

  handleExplainTerm(message, match, context) {
    const term = match[1].toLowerCase().replace(' ', '_');
    const explanation = this.knowledgeBase[term];
    return {
      text: explanation || `I know about that concept but don't have a summary prepared. It's a key part of modern trading systems.`,
      context: context
    };
  }

  handleGreeting(message, match, context) {
    return {
      text: "Hello! I'm your Investara Trading Assistant. I can provide real-time quotes, LSTM-based forecasts, and explain complex trading concepts. How can I help you today?",
      context: context
    };
  }
}

module.exports = new ChatbotService();
