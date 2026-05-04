const io = require('socket.io-client');
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const SYMBOL = 'RELIANCE';

async function runTest() {
    console.log('--- Starting Financial API Test ---');

    try {
        // 1. Authenticate (Register/Login) to get Token
        // Using a test user
        const user = {
            name: 'Test Investor',
            username: 'testinvestor',
            email: 'testinvestor@example.com',
            password: 'password123'
        };

        let token;
        try {
            console.log('Attempting to register...');
            const regRes = await axios.post(`${BASE_URL}/api/auth/register`, user);
            token = regRes.data.token;
            console.log('Registered successfully. Token received.');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('User already exists, logging in...');
                const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
                    email: user.email,
                    password: user.password
                });
                token = loginRes.data.token;
                console.log('Logged in successfully. Token received.');
            } else {
                throw error;
            }
        }

        const authHeaders = { headers: { 'x-auth-token': token } };

        // 2. Test REST API: Get Quote
        console.log(`\nFetching Quote for ${SYMBOL}...`);
        const quoteRes = await axios.get(`${BASE_URL}/api/financial/quote/${SYMBOL}`, authHeaders);
        console.log('Quote received:', quoteRes.data);

        // 3. Test REST API: Get Historical Data
        console.log(`\nFetching Historical Data for ${SYMBOL}...`);
        const histRes = await axios.get(`${BASE_URL}/api/financial/historical/${SYMBOL}?interval=1day`, authHeaders);
        console.log(`Historical data received: ${histRes.data.length} records`);
        console.log('Sample record:', histRes.data[0]);

        // 4. Test WebSocket Stream
        console.log('\nConnecting to WebSocket...');
        const socket = io(BASE_URL, {
            transports: ['websocket'],
            auth: { token }
        });

        socket.on('connect', () => {
            console.log('WebSocket Connected!');
            
            console.log(`Subscribing to ${SYMBOL}...`);
            socket.emit('subscribe', [SYMBOL]);
        });

        socket.on('price_update', (data) => {
            console.log('Real-time Update:', data);
        });

        socket.on('connect_error', (err) => {
            console.error('Connection Error:', err.message);
        });

        // Keep connection open for 5 seconds then exit
        setTimeout(() => {
            console.log('\nTest completed. Disconnecting...');
            socket.disconnect();
            process.exit(0);
        }, 5000);

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Server Response:', error.response.data);
        }
        process.exit(1);
    }
}

runTest();

