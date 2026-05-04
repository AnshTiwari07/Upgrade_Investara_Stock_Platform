const financialService = require('../services/FinancialDataService');
const pipelineService = require('../services/PipelineService');

module.exports = (io) => {
  const intervals = new Map();
  
  // Initialize the pipeline
  pipelineService.initialize();

  io.on('connection', (socket) => {
    console.log('New client connected for market stream');

    socket.on('subscribe', (symbol) => {
      console.log(`Client subscribed to ${symbol}`);
      socket.join(symbol);

      if (!intervals.has(symbol)) {
        const intervalId = setInterval(async () => {
          // 1. Fetch real-time tick from financial service (cached/throttled)
          const rawTick = await financialService.getRealTimeQuote(symbol);
          
          // 2. Pass through the analysis pipeline
          const processedData = await pipelineService.ingestTick(rawTick);
          
          // 3. Emit processed data with indicators
          io.to(symbol).emit('price_update', processedData);
        }, financialService.isMarketOpen() ? 2000 : 10000); // 2s during market, 10s otherwise
        intervals.set(symbol, intervalId);
      }
    });

    socket.on('unsubscribe', (symbol) => {
      console.log(`Client unsubscribed from ${symbol}`);
      socket.leave(symbol);
      
      // Cleanup interval if no one is listening (optimization)
      const room = io.sockets.adapter.rooms.get(symbol);
      if (!room || room.size === 0) {
        if (intervals.has(symbol)) {
          clearInterval(intervals.get(symbol));
          intervals.delete(symbol);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};
