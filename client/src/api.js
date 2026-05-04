import axios from 'axios';

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5001/api'
      : '/api',
});

// Sensible default timeout to avoid hanging requests
api.defaults.timeout = 15000; // Increased to 15 seconds

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// Retry mechanism with exponential backoff
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // Detailed logging for debugging
    console.error(`API Error: ${config.method.toUpperCase()} ${config.url}`, {
      status: response?.status,
      message: error.message,
      data: response?.data
    });

    // Only retry on network errors or 5xx server errors
    const shouldRetry = !response || (response.status >= 500 && response.status <= 599);
    
    if (shouldRetry && (!config.__retryCount || config.__retryCount < 3)) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      
      // Exponential backoff: 1s, 2s, 4s (shorter in tests)
      const isTest = process.env.NODE_ENV === 'test';
      const delay = isTest ? 10 : Math.pow(2, config.__retryCount - 1) * 1000;
      console.log(`Retrying request (${config.__retryCount}/3) in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
