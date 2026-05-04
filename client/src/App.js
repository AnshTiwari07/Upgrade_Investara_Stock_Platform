import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import theme from './theme';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Portfolio from './pages/Portfolio';
import Orders from './pages/Orders';
import PaymentMethods from './pages/PaymentMethods';
import StockDetail from './pages/StockDetail';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import Chatbot from './components/Chatbot';
import { AuthContext } from './context/AuthContext';

const AuthHandler = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const publicPaths = ['/', '/login', '/register'];
      if (!publicPaths.includes(location.pathname)) {
        navigate('/login');
      }
    }
  }, [isAuthenticated, loading, navigate, location]);

  return children;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthHandler>
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
            <Routes>
              {/* Public Landing Page without standard Layout */}
              <Route path="/" element={<LandingPage />} />
              
              {/* App routes with standard Layout */}
              <Route path="*" element={
                <>
                  <Navbar />
                  <Container maxWidth="lg" sx={{ flexGrow: 1, py: 6 }} className="page-fade">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/portfolio" element={<Portfolio />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/payments" element={<PaymentMethods />} />
                      <Route path="/stock/:symbol" element={<StockDetail />} />
                      <Route path="/stocks/:symbol" element={<StockDetail />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Container>
                  <Footer />
                  <Chatbot />
                </>
              } />
            </Routes>
          </Box>
        </AuthHandler>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
