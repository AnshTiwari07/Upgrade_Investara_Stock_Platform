const chatbotService = require('./server/services/ChatbotService');

const testQueries = [
    "what's the price of AAPL",
    "forecast for TSLA",
    "what is forex",
    "risk advice",
    "system status",
    "hi",
    "tell me more about it",
    "random query"
];

async function runTest() {
    console.log("--- Chatbot Service Intent Classification Test ---");
    for (const query of testQueries) {
        const intent = chatbotService.classifyIntent(query);
        console.log(`Query: "${query}" -> Intent: ${intent ? intent.name : 'null (Fallback)'}`);
    }
}

runTest();
