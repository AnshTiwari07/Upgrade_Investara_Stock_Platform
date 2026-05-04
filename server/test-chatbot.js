const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testChatbot() {
  console.log('--- Chatbot Root Cause Analysis Test ---');
  
  try {
    // 1. Health Check
    console.log('\n(1) Verifying Back-end Health...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    console.log('Health Status:', healthRes.data.status);
    console.log('Services:', JSON.stringify(healthRes.data.services, null, 2));

    // 2. Authentication & Token Generation
    console.log('\n(2) Verifying API Authentication...');
    const user = {
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      name: 'Test User',
      username: 'testuser' + Date.now()
    };
    
    console.log('Registering test user...');
    const regRes = await axios.post(`${BASE_URL}/auth/register`, user);
    const token = regRes.data.token;
    console.log('Token acquired successfully.');

    const authHeaders = { headers: { 'x-auth-token': token } };

    // 3. Request/Response Pipeline - General Message
    console.log('\n(3) Testing Request/Response Pipeline (Greeting)...');
    const greetRes = await axios.post(`${BASE_URL}/chatbot/message`, { message: 'hi' }, authHeaders);
    console.log('Greeting Response:', greetRes.data.text);

    // 4. Testing Specific Intent (Price) - Potential failure point
    console.log('\n(4) Testing Specific Intent (Price)...');
    try {
      const priceRes = await axios.post(`${BASE_URL}/chatbot/message`, { message: 'price of AAPL' }, authHeaders);
      console.log('Price Response:', priceRes.data.text);
    } catch (err) {
      console.error('Price Intent Failed:', err.response?.data || err.message);
    }

    // 5. Testing Specific Intent (Forecast) - Potential failure point
    console.log('\n(5) Testing Specific Intent (Forecast)...');
    try {
      const forecastRes = await axios.post(`${BASE_URL}/chatbot/message`, { message: 'forecast for AAPL' }, authHeaders);
      console.log('Forecast Response:', forecastRes.data.text);
    } catch (err) {
      console.error('Forecast Intent Failed:', err.response?.data || err.message);
    }

    console.log('\nTest Completed Successfully.');
  } catch (error) {
    console.error('\nTest Failed with Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

testChatbot();
