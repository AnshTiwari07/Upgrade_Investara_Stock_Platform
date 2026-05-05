import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  Stack,
  Divider
} from '@mui/material';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Proactively seed demo user on login page load
    api.post('/auth/seed-demo').catch(() => {});
  }, []);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const onSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'ECONNABORTED' || !err.response) {
        setError('Network error: Backend terminal is unreachable. Check your connection.');
      } else if (err.response.status === 503) {
        setError('Database error: Could not connect to the markets. Please try again in a moment.');
      } else {
        setError(err.response?.data?.msg || 'Invalid credentials');
      }
    }
  };

  const handleDemoAccess = async () => {
    setError(null);
    try {
      // 1. Ensure demo user exists
      await api.post('/auth/seed-demo');
      // 2. Log in with demo credentials
      await login('demo@investara.com', 'password123');
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo access error:', err);
      if (err.response?.status === 503) {
        setError('Database connection failed. Ensure MONGO_URI is set in Vercel.');
      } else {
        setError('Could not access demo terminal. Please try registering.');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10, mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>Welcome Back</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Enter your credentials to access the Investara Terminal.
        </Typography>
      </Box>

      <Paper sx={{ p: 6 }}>
        <form onSubmit={onSubmit}>
          <Stack spacing={3}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
            
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, mb: 1, display: 'block' }}>
                Email Address
              </Typography>
              <TextField 
                fullWidth 
                name="email" 
                placeholder="name@company.com"
                value={formData.email} 
                onChange={onChange} 
                required 
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, mb: 1, display: 'block' }}>
                Password
              </Typography>
              <TextField 
                fullWidth 
                type="password" 
                name="password" 
                placeholder="••••••••"
                value={formData.password} 
                onChange={onChange} 
                required 
              />
            </Box>

            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              type="submit" 
              size="large"
              sx={{ py: 2, mt: 2, fontWeight: 800 }}
            >
              Sign In
            </Button>

            <Divider sx={{ my: 1, opacity: 0.1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>OR</Typography>
            </Divider>

            <Button 
              fullWidth 
              variant="outlined" 
              color="secondary" 
              size="large"
              onClick={handleDemoAccess}
              sx={{ py: 1.5, fontWeight: 700, borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              Access Demo Terminal
            </Button>
          </Stack>
        </form>
      </Paper>

      <Typography variant="body2" sx={{ mt: 4, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        Don't have an account? <Link to="/register" style={{ color: '#2962FF', textDecoration: 'none', fontWeight: 700 }}>Create one now</Link>
      </Typography>
    </Container>
  );
};

export default Login;