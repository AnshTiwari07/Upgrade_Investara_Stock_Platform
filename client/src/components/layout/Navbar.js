import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AppBar, Toolbar, Typography, Button, Box, Link, IconButton, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import TradingSettings from '../TradingSettings';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: 'rgba(10, 10, 10, 0.8)', 
        backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: 'none'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link component={RouterLink} to="/dashboard" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              INVESTARA
            </Typography>
          </Link>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            <>
              <Button color="inherit" component={RouterLink} to="/dashboard" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>Dashboard</Button>
              <Button color="inherit" component={RouterLink} to="/portfolio" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>Portfolio</Button>
              <Button color="inherit" component={RouterLink} to="/orders" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>Orders</Button>
              <Button color="inherit" component={RouterLink} to="/payments" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>Payments</Button>
              <Button 
                variant="outlined" 
                onClick={onLogout} 
                sx={{ 
                  ml: 2, 
                  borderRadius: '20px', 
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { borderColor: 'white' }
                }}
              >
                Logout ({user?.name})
              </Button>
              <Tooltip title="Terminal Settings">
                <IconButton onClick={() => setSettingsOpen(true)} sx={{ ml: 1, color: 'white', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">Login</Button>
              <Button variant="contained" color="primary" component={RouterLink} to="/register" sx={{ borderRadius: '20px', px: 3 }}>
                Get Started
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
      <TradingSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </AppBar>
  );
};

export default Navbar;