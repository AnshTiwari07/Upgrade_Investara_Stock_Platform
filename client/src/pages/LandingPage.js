import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  TextField, 
  Stack, 
  IconButton,
  AppBar,
  Toolbar,
  useScrollTrigger,
  Alert,
  Snackbar,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const LandingPage = () => {
  // Simple A/B testing logic: 0 = Original, 1 = Enhanced Visuals
  const [variant, setVariant] = useState(0);

  useEffect(() => {
    // Persist or randomly assign variant for A/B testing
    const savedVariant = localStorage.getItem('landing_variant');
    if (savedVariant !== null) {
      setVariant(parseInt(savedVariant));
    } else {
      const newVariant = Math.random() > 0.5 ? 1 : 0;
      setVariant(newVariant);
      localStorage.setItem('landing_variant', newVariant.toString());
    }
    
    // Log for analytics (mock)
    console.log(`[A/B Test] Landing page variant assigned: ${variant === 1 ? 'B (Enhanced)' : 'A (Original)'}`);
  }, [variant]);

  return (
    <Box sx={{ bgcolor: '#0a0a0a', color: 'white', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navigation />
      <HeroSection variant={variant} />
      <FeaturesSection />
      <AnalysisSection variant={variant} />
      <TestimonialsSection variant={variant} />
      <ContactSection />
      <LandingFooter />
    </Box>
  );
};

// --- Sub-components ---

const Navigation = () => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: trigger ? 'rgba(10, 10, 10, 0.9)' : 'transparent',
        backdropFilter: trigger ? 'blur(10px)' : 'none',
        boxShadow: trigger ? 1 : 0,
        transition: 'all 0.3s ease'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
            INVESTARA
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Button color="inherit" component={RouterLink} to="/login">Login</Button>
          <Button variant="contained" color="primary" component={RouterLink} to="/register" sx={{ borderRadius: '20px', px: 3 }}>
            Open Account
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

const HeroSection = ({ variant }) => {
  const isB = variant === 1;

  return (
    <Box sx={{ 
      pt: { xs: 15, md: 25 }, 
      pb: { xs: 10, md: 20 },
      position: 'relative',
      overflow: 'hidden',
      background: isB 
        ? 'none' 
        : 'radial-gradient(circle at 50% -20%, #1a237e 0%, #0a0a0a 60%)'
    }}>
      {isB && (
        <Box
          component="picture"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.9) 100%)',
            }
          }}
        >
          {/* Responsive images for Hero Section */}
          <source media="(min-width: 1440px)" srcSet="https://images.unsplash.com/photo-1611974717483-9b057916e4d7?auto=format&fit=crop&q=80&w=1920" />
          <source media="(min-width: 768px)" srcSet="https://images.unsplash.com/photo-1611974717483-9b057916e4d7?auto=format&fit=crop&q=80&w=1024" />
          <img 
            src="https://images.unsplash.com/photo-1611974717483-9b057916e4d7?auto=format&fit=crop&q=80&w=640" 
            alt="Intelligent trading terminal interface" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      )}
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography variant="h1" sx={{ 
                fontSize: { xs: '2.5rem', md: '4.5rem' }, 
                fontWeight: 900, 
                lineHeight: 1.1,
                mb: 3,
                background: 'linear-gradient(to right, #fff, #90caf9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: isB ? '0 4px 10px rgba(0,0,0,0.5)' : 'none'
              }}>
                The Future of Trading is Intelligent.
              </Typography>
              <Typography variant="h5" sx={{ 
                color: 'grey.300', 
                mb: 5, 
                maxWidth: '600px', 
                lineHeight: 1.6,
                textShadow: isB ? '0 2px 4px rgba(0,0,0,0.8)' : 'none'
              }}>
                Investara combines real-time tick data with advanced LSTM neural networks to give you the directional edge you've been waiting for.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  variant="contained" 
                  size="large" 
                  component={RouterLink} 
                  to="/register"
                  sx={{ py: 2, px: 6, fontSize: '1.1rem', borderRadius: '30px', fontWeight: 'bold' }}
                >
                  Get Started Free
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  sx={{ py: 2, px: 6, fontSize: '1.1rem', borderRadius: '30px', color: 'white', borderColor: 'grey.700', backdropFilter: 'blur(10px)' }}
                >
                  View Live Demo
                </Button>
              </Stack>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <Box sx={{ 
                p: 2, 
                bgcolor: 'rgba(255,255,255,0.03)', 
                borderRadius: 4, 
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                overflow: 'hidden'
              }}>
                {isB ? (
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=800" 
                    alt="Advanced market analysis dashboard" 
                    style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                    loading="eager"
                  />
                ) : (
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 180, color: 'primary.main', opacity: 0.8 }} />
                  </Box>
                )}
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const FeaturesSection = () => {
  const features = [
    { icon: <SpeedIcon color="primary" />, title: 'Real-time Ingestion', desc: 'Sub-millisecond processing of NSE/BSE tick data via Kafka pipelines.' },
    { icon: <PsychologyIcon color="primary" />, title: 'LSTM Forecasting', desc: 'Advanced neural networks predicting trends with >75% directional accuracy.' },
    { icon: <SecurityIcon color="primary" />, title: 'Bank-Grade Security', desc: 'Dual-storage architecture with Redis and PostgreSQL for data integrity.' },
    { icon: <TrendingUpIcon color="primary" />, title: 'Advanced Analysis', desc: 'Real-time calculation of SMA, EMA, RSI, MACD, and Bollinger Bands.' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 15 }}>
      <Typography variant="h3" align="center" sx={{ fontWeight: 800, mb: 10 }}>
        Engineered for Modern Traders
      </Typography>
      <Grid container spacing={4}>
        {features.map((f, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <FeatureCard {...f} delay={i * 0.1} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

const FeatureCard = ({ icon, title, desc, delay }) => {
  const [ref, inView] = useInView({ triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-10px)', bgcolor: 'rgba(255,255,255,0.05)' } }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 2 }}>{icon}</Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>{title}</Typography>
          <Typography variant="body2" sx={{ color: 'grey.500', lineHeight: 1.6 }}>{desc}</Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AnalysisSection = ({ variant }) => {
  const [ref, inView] = useInView({ triggerOnce: true });
  const isB = variant === 1;

  return (
    <Box sx={{ bgcolor: 'rgba(25, 35, 126, 0.05)', py: 15 }}>
      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box ref={ref} sx={{ position: 'relative' }}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 4 }}>
                  Institutional-Grade Analytics in Your Pocket
                </Typography>
                <Typography variant="body1" sx={{ color: 'grey.400', mb: 4, fontSize: '1.1rem' }}>
                  Stop relying on lagging indicators. Our real-time pipeline calculates technical signals the moment a trade happens on the exchange.
                </Typography>
                <Stack spacing={3}>
                  <AnalysisItem text="Real-time MACD & RSI crossovers" />
                  <AnalysisItem text="Volatility monitoring with Bollinger Bands" />
                  <AnalysisItem text="Automated volume spike detection" />
                </Stack>
              </motion.div>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            {/* Visual representation of a chart or terminal */}
            <Box sx={{ 
              height: 400, 
              bgcolor: '#111', 
              borderRadius: 4, 
              border: '1px solid rgba(255,255,255,0.1)',
              p: isB ? 0 : 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              {isB ? (
                <img 
                  src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800" 
                  alt="Real-time trading analytics visualization" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              ) : (
                <>
                  <Box sx={{ height: 2, bgcolor: 'primary.main', mb: 4, width: '80%', opacity: 0.5 }} />
                  <Box sx={{ height: 2, bgcolor: 'success.main', mb: 4, width: '60%', opacity: 0.5 }} />
                  <Box sx={{ height: 2, bgcolor: 'error.main', width: '90%', opacity: 0.5 }} />
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const AnalysisItem = ({ text }) => (
  <Stack direction="row" spacing={2} alignItems="center">
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
    <Typography variant="body1" sx={{ fontWeight: 600 }}>{text}</Typography>
  </Stack>
);

const TestimonialsSection = ({ variant }) => {
  const isB = variant === 1;
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonials = [
    { 
      name: 'Rahul Sharma', 
      role: 'Full-time Trader', 
      text: "The LSTM forecasting has completely changed how I approach my morning trades. It's like having a quant team in my browser.",
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200'
    },
    { 
      name: 'Ananya Iyer', 
      role: 'Swing Investor', 
      text: "Lightning fast. The real-time charts are much more responsive than anything else I've used in the Indian market.",
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200'
    },
    { 
      name: 'Vikram Singh', 
      role: 'Day Trader', 
      text: "The clean UI and deep analytics are a perfect combination. Investara is the future of trading platforms.",
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200'
    }
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 15 }}>
      <Typography variant="h3" align="center" sx={{ fontWeight: 800, mb: 10 }}>
        Trusted by 10,000+ Smart Traders
      </Typography>

      {isB ? (
        <Box sx={{ position: 'relative', maxWidth: '800px', mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconButton onClick={handlePrev} sx={{ color: 'white', mr: 2 }}>
              <ArrowBackIosNewIcon />
            </IconButton>
            
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card sx={{ 
                    bgcolor: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    p: { xs: 2, md: 5 },
                    textAlign: 'center'
                  }}>
                    <CardContent>
                      <Typography variant="h5" sx={{ color: 'grey.300', fontStyle: 'italic', mb: 4, lineHeight: 1.6 }}>
                        "{testimonials[currentIndex].text}"
                      </Typography>
                      <Stack direction="column" spacing={2} alignItems="center">
                        <Avatar 
                          src={testimonials[currentIndex].photo}
                          alt={testimonials[currentIndex].name}
                          sx={{ 
                            width: 80, 
                            height: 80, 
                            mb: 2,
                            border: '3px solid',
                            borderColor: 'primary.main',
                            transition: '0.3s',
                            '&:hover': { transform: 'scale(1.1)', boxShadow: '0 0 20px rgba(33, 150, 243, 0.5)' }
                          }} 
                        />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                            {testimonials[currentIndex].name}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ color: 'grey.600' }}>
                            {testimonials[currentIndex].role}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </Box>

            <IconButton onClick={handleNext} sx={{ color: 'white', ml: 2 }}>
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
          
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 4 }}>
            {testimonials.map((_, i) => (
              <Box 
                key={i} 
                onClick={() => setCurrentIndex(i)}
                sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  bgcolor: i === currentIndex ? 'primary.main' : 'rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  transition: '0.3s'
                }} 
              />
            ))}
          </Stack>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {testimonials.map((t, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', p: 3 }}>
                <CardContent>
                  <Typography variant="body1" sx={{ color: 'grey.300', fontStyle: 'italic', mb: 4 }}>"{t.text}"</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.dark' }}>{t.name[0]}</Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white' }}>{t.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'grey.600' }}>{t.role}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

const ContactSection = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ open: false, message: '', severity: 'success' });

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setStatus({ open: true, message: 'Please enter an email address', severity: 'error' });
      return;
    }

    if (!validateEmail(email)) {
      setStatus({ open: true, message: 'Please enter a valid email address', severity: 'error' });
      return;
    }

    setLoading(true);
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus({ 
        open: true, 
        message: 'Successfully subscribed to Investara Insights!', 
        severity: 'success' 
      });
      setEmail('');
    } catch (error) {
      setStatus({ 
        open: true, 
        message: 'Subscription failed. Please try again later.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseStatus = () => {
    setStatus({ ...status, open: false });
  };

  return (
    <Box sx={{ py: 15, bgcolor: '#111' }}>
      <Container maxWidth="md">
        <Typography variant="h3" align="center" sx={{ fontWeight: 800, mb: 2 }}>
          Stay Ahead of the Curve
        </Typography>
        <Typography variant="body1" align="center" sx={{ color: 'grey.500', mb: 6 }}>
          Subscribe to our newsletter for weekly market insights generated by our LSTM models.
        </Typography>
        
        <Box component="form" onSubmit={handleSubscribe} noValidate>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField 
              fullWidth 
              placeholder="Enter your email" 
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.03)',
                '& input': { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'primary.main' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                }
              }} 
            />
            <Button 
              type="submit"
              variant="contained" 
              size="large" 
              disabled={loading}
              sx={{ 
                px: 6, 
                borderRadius: '8px',
                minWidth: '160px',
                height: { xs: '56px', sm: 'auto' }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Subscribe'}
            </Button>
          </Stack>
        </Box>

        <Snackbar 
          open={status.open} 
          autoHideDuration={6000} 
          onClose={handleCloseStatus}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseStatus} severity={status.severity} sx={{ width: '100%' }}>
            {status.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

const LandingFooter = () => {
  return (
    <Box sx={{ py: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <Container maxWidth="lg">
        <Grid container spacing={8}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>INVESTARA</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'grey.600', mb: 4 }}>
              Next-generation trading terminal powered by real-time stream processing and deep learning.
            </Typography>
            <Stack direction="row" spacing={2}>
              <IconButton color="inherit" sx={{ opacity: 0.6 }}><TwitterIcon /></IconButton>
              <IconButton color="inherit" sx={{ opacity: 0.6 }}><LinkedInIcon /></IconButton>
              <IconButton color="inherit" sx={{ opacity: 0.6 }}><GitHubIcon /></IconButton>
              <IconButton color="inherit" sx={{ opacity: 0.6 }}><FacebookIcon /></IconButton>
            </Stack>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Product</Typography>
            <FooterLink text="Terminal" />
            <FooterLink text="API Docs" />
            <FooterLink text="Indicator API" />
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Company</Typography>
            <FooterLink text="About Us" />
            <FooterLink text="Careers" />
            <FooterLink text="Contact" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Contact Us</Typography>
            <Typography variant="body2" sx={{ color: 'grey.600', mb: 1 }}>support@investara.com</Typography>
            <Typography variant="body2" sx={{ color: 'grey.600' }}>Mumbai, Maharashtra, India</Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'grey.700' }}>
            © 2026 Investara Technologies Pvt Ltd. All rights reserved. SEBI Reg No: INZ000000000
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

const FooterLink = ({ text }) => (
  <Typography variant="body2" sx={{ color: 'grey.600', mb: 1, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
    {text}
  </Typography>
);

export default LandingPage;
