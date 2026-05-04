import React from 'react';
import { Box, Container, Typography, Grid, Link, Stack } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 8, 
        px: 2, 
        mt: 'auto', 
        bgcolor: 'rgba(10, 10, 10, 0.5)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="white" sx={{ fontWeight: 800, mb: 2 }}>
              INVESTARA
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', lineHeight: 1.8 }}>
              Professional-grade trading terminal powered by deep learning and real-time stream processing.
            </Typography>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" color="white" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Platform
            </Typography>
            <Stack spacing={1}>
              <FooterLink text="Terminal" />
              <FooterLink text="Portfolio" />
              <FooterLink text="Orders" />
            </Stack>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" color="white" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Resources
            </Typography>
            <Stack spacing={1}>
              <FooterLink text="API Docs" />
              <FooterLink text="Status" />
              <FooterLink text="Help Center" />
            </Stack>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="white" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Legal
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.3)', display: 'block' }}>
              © 2026 Investara Technologies Pvt Ltd. All trades involve risk.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const FooterLink = ({ text }) => (
  <Link 
    href="#" 
    underline="none" 
    sx={{ 
      color: 'rgba(255, 255, 255, 0.4)', 
      fontSize: '0.875rem',
      transition: '0.2s',
      '&:hover': { color: 'primary.light' }
    }}
  >
    {text}
  </Link>
);

export default Footer;