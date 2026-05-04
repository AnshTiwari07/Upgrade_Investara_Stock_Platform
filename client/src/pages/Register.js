import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  Stack,
  Grid
} from '@mui/material';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', panCard: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please check your details.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>Join Investara</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Start your journey with real-time neural forecasting.
        </Typography>
      </Box>

      <Paper sx={{ p: 6 }}>
        <form onSubmit={onSubmit}>
          <Stack spacing={3}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
            
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, mb: 1, display: 'block' }}>
                Full Name
              </Typography>
              <TextField 
                fullWidth 
                name="name" 
                placeholder="John Doe"
                value={formData.name} 
                onChange={onChange} 
                required 
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, mb: 1, display: 'block' }}>
                Email Address
              </Typography>
              <TextField 
                fullWidth 
                type="email"
                name="email" 
                placeholder="john@example.com"
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
                placeholder="Min. 8 characters"
                value={formData.password} 
                onChange={onChange} 
                required 
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, mb: 1, display: 'block' }}>
                  Phone
                </Typography>
                <TextField 
                  fullWidth 
                  name="phone" 
                  placeholder="+91..."
                  value={formData.phone} 
                  onChange={onChange} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, mb: 1, display: 'block' }}>
                  PAN Card
                </Typography>
                <TextField 
                  fullWidth 
                  name="panCard" 
                  placeholder="ABCDE1234F"
                  value={formData.panCard} 
                  onChange={onChange} 
                />
              </Grid>
            </Grid>

            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              type="submit" 
              size="large"
              sx={{ py: 2, mt: 2, fontWeight: 800 }}
            >
              Create Account
            </Button>
          </Stack>
        </form>
      </Paper>

      <Typography variant="body2" sx={{ mt: 4, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        Already a member? <Link to="/login" style={{ color: '#2962FF', textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
      </Typography>
    </Container>
  );
};

export default Register;