const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function runTestSuite() {
  console.log('--- Chatbot Test Suite ---');
  
  try {
    // 1. Setup - Get Token
    const user = {
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      name: 'Test User',
      username: 'testuser' + Date.now()
    };
    const regRes = await axios.post(`${BASE_URL}/auth/register`, user);
    const token = regRes.data.token;
    const authHeaders = { headers: { 'x-auth-token': token } };

    // 2. Test Performance and Content
    const testCases = [
      { name: 'Greeting (Standard)', message: 'hi' },
      { name: 'Greeting (Variant)', message: 'hii' },
      { name: 'Greeting (Variant)', message: 'hellooo' },
      { name: 'Greeting (Variant)', message: 'heyyy' },
      { name: 'Flexible Phrases', message: 'Flexible Phrases' },
      { name: 'Price Query', message: "what's the price of AAPL" },
      { name: 'Term Explanation (New Term)', message: 'explain mutual funds' },
      { name: 'Term Explanation (Existing Term)', message: 'what is forex' },
      { name: 'Investara Info', message: 'who are you' },
      { name: 'Conversational', message: 'thank you very much' },
      { name: 'Conversational (Exit)', message: 'goodbye' },
      { name: 'Risk Advice', message: 'how much should I invest' },
      { name: 'Forecast Request (First Attempt)', message: 'forecast for RELIANCE' }
    ];

    for (const test of testCases) {
      console.log(`\nTesting: ${test.name} ("${test.message}")`);
      const start = Date.now();
      
      const res = await axios.post(`${BASE_URL}/chatbot/message`, { message: test.message }, authHeaders);
      
      const duration = Date.now() - start;
      const responseText = res.data.text;

      // Assertion: Response time < 2000ms
      if (duration < 2000) {
        console.log(`✅ Performance: ${duration}ms (PASSED)`);
      } else {
        console.log(`❌ Performance: ${duration}ms (FAILED - exceeds 2s)`);
      }

      // Assertion: Non-empty text field
      if (responseText && responseText.trim().length > 0) {
        console.log(`✅ Content: Non-empty (PASSED)`);
        console.log(`   Response: "${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}"`);
      } else {
        console.log(`❌ Content: Empty (FAILED)`);
      }

      // Assertion: Status 200
      if (res.status === 200) {
        console.log(`✅ Status: 200 (PASSED)`);
      } else {
        console.log(`❌ Status: ${res.status} (FAILED)`);
      }
    }

    // 3. Stress Test for Forecast (Filling the 30-tick window)
    console.log('\n--- Stress Testing Forecast (Filling 30-tick window) ---');
    for (let i = 1; i <= 30; i++) {
      process.stdout.write(`Tick ${i}/30... `);
      const res = await axios.post(`${BASE_URL}/chatbot/message`, { message: 'forecast for RELIANCE' }, authHeaders);
      if (i === 30) {
        console.log('\nFinal Forecast Response:', res.data.text);
        if (!res.data.text.includes('gathering data')) {
          console.log('✅ Forecast Logic: Activated after 30 ticks (PASSED)');
        } else {
          console.log('❌ Forecast Logic: Still gathering data after 30 ticks (FAILED)');
        }
      }
    }

    console.log('\nTest Suite Completed.');
  } catch (error) {
    console.error('\nTest Suite Failed:', error.response?.data || error.message);
  }
}

runTestSuite();
