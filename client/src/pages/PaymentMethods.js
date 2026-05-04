import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Fade
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCodeIcon from '@mui/icons-material/QrCode';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const PaymentMethods = () => {
  const { user, setUser } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [history, setHistory] = useState([]);
  
  // UPI QR states
  const [qrCode, setQrCode] = useState(null);
  const [activeTxnId, setActiveTxnId] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  // Card details
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // UPI details
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/payments/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setStatus({ type: '', msg: '' });
    setQrCode(null);
    setActiveTxnId(null);
    setIsPolling(false);
  };

  const generateUPIQR = async () => {
    if (!amount || amount <= 0) {
      setStatus({ type: 'error', msg: 'Please enter a valid amount' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      const res = await api.post('/payments/generate-upi-qr', { amount: parseFloat(amount) });
      setQrCode(res.data.qrCode);
      setActiveTxnId(res.data.transactionId);
      setIsPolling(true);
      setStatus({ type: 'info', msg: 'QR Code generated. Please scan with any UPI app.' });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to generate QR. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (isPolling && activeTxnId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/payments/status/${activeTxnId}`);
          if (res.data.status === 'COMPLETED') {
            setIsPolling(false);
            setStatus({ type: 'success', msg: 'Payment verified! Balance updated.' });
            setQrCode(null);
            setActiveTxnId(null);
            fetchHistory();
            // Refresh user data to show new balance
            const userRes = await api.get('/auth/user');
            setUser(userRes.data);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPolling, activeTxnId, setUser]);

  const simulateSuccess = async () => {
    if (!activeTxnId) return;
    try {
      await api.post('/payments/webhook/upi', { transactionId: activeTxnId, status: 'SUCCESS' });
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setStatus({ type: 'error', msg: 'Please enter a valid amount' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', msg: '' });

    let paymentMethod = '';
    let paymentDetails = {};

    if (tabValue === 0) {
      paymentMethod = 'UPI';
      if (!upiId || !upiId.includes('@')) {
        setStatus({ type: 'error', msg: 'Please enter a valid UPI ID' });
        setLoading(false);
        return;
      }
      paymentDetails = { upiId };
    } else if (tabValue === 1) {
      paymentMethod = 'CARD';
      if (cardData.number.length < 16 || cardData.cvv.length < 3) {
        setStatus({ type: 'error', msg: 'Please enter valid card details' });
        setLoading(false);
        return;
      }
      paymentDetails = { 
        cardNumber: cardData.number,
        cardType: cardData.number.startsWith('4') ? 'VISA' : 'MASTERCARD'
      };
    }

    try {
      const res = await api.post('/payments/deposit', {
        amount: parseFloat(amount),
        paymentMethod,
        paymentDetails
      });

      setStatus({ type: 'success', msg: 'Deposit successful! Funds added to your wallet.' });
      setAmount('');
      setUpiId('');
      setCardData({ number: '', expiry: '', cvv: '', name: '' });
      
      // Update local user balance
      setUser({ ...user, balance: res.data.balance });
      fetchHistory();
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.msg || 'Payment failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Add Funds
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Securely add money to your Investara wallet
            </Typography>
          </Box>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'rgba(33, 150, 243, 0.1)', border: '1px solid rgba(33, 150, 243, 0.2)' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <AccountBalanceWalletIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary">Current Balance</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ${user?.balance?.toLocaleString() || '0.00'}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {status.msg && (
          <Alert severity={status.type} sx={{ mb: 3, borderRadius: 2 }}>
            {status.msg}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
              >
                <Tab icon={<QrCodeIcon />} label="UPI" />
                <Tab icon={<CreditCardIcon />} label="Cards" />
              </Tabs>

              <Box sx={{ p: 4 }}>
                <form onSubmit={handleDeposit}>
                  <TextField
                    fullWidth
                    label="Amount to Deposit ($)"
                    variant="outlined"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    sx={{ mb: 3 }}
                    placeholder="Enter amount (e.g. 500)"
                    required
                  />

                  {tabValue === 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.7 }}>UPI Payment</Typography>
                      {!qrCode ? (
                        <>
                          <TextField
                            fullWidth
                            label="UPI ID (Manual)"
                            variant="outlined"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="yourname@bank"
                            sx={{ mb: 3 }}
                          />
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={generateUPIQR}
                            disabled={loading}
                            sx={{ mb: 2, py: 1, borderRadius: 2 }}
                            startIcon={<QrCodeIcon />}
                          >
                            Generate UPI QR Code
                          </Button>
                        </>
                      ) : (
                        <Box sx={{ textAlign: 'center', mb: 3, p: 2, bgcolor: '#fff', borderRadius: 2 }}>
                          <img src={qrCode} alt="UPI QR Code" style={{ width: '200px', height: '200px' }} />
                          <Typography variant="body2" sx={{ mt: 1, color: 'primary.main', fontWeight: 600 }}>
                            Scan to pay ${amount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            TXN ID: {activeTxnId}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Button size="small" variant="text" onClick={simulateSuccess}>
                              Simulate Success (Demo)
                            </Button>
                            <Button size="small" variant="text" color="error" onClick={() => { setQrCode(null); setIsPolling(false); }}>
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                        Supported: Google Pay, PhonePe, BHIM, Paytm, and all major bank UPIs.
                      </Typography>
                    </Box>
                  )}

                  {tabValue === 1 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.7 }}>Card Details (Visa/Mastercard)</Typography>
                      <TextField
                        fullWidth
                        label="Card Number"
                        variant="outlined"
                        value={cardData.number}
                        onChange={(e) => setCardData({...cardData, number: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                        placeholder="0000 0000 0000 0000"
                        sx={{ mb: 2 }}
                      />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Expiry (MM/YY)"
                            variant="outlined"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                            placeholder="MM/YY"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="CVV"
                            variant="outlined"
                            type="password"
                            value={cardData.cvv}
                            onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                            placeholder="***"
                          />
                        </Grid>
                      </Grid>
                      <TextField
                        fullWidth
                        label="Cardholder Name"
                        variant="outlined"
                        value={cardData.name}
                        onChange={(e) => setCardData({...cardData, name: e.target.value})}
                        sx={{ mt: 2, mb: 3 }}
                      />
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2, 
                      fontWeight: 700,
                      boxShadow: '0 8px 16px rgba(33, 150, 243, 0.3)'
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : `Deposit $${amount || '0'}`}
                  </Button>
                  
                  <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 16, mr: 0.5 }} /> PCI DSS Compliant & Secure
                    </Typography>
                  </Box>
                </form>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center' }}>
              <HistoryIcon sx={{ mr: 1 }} /> Recent Activity
            </Typography>
            <Paper sx={{ borderRadius: 3, maxHeight: 400, overflowY: 'auto' }}>
              <List sx={{ p: 0 }}>
                {history.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="No transactions yet" 
                      secondary="Your deposits will appear here"
                      primaryTypographyProps={{ sx: { opacity: 0.5 } }}
                    />
                  </ListItem>
                ) : (
                  history.map((txn, index) => (
                    <React.Fragment key={txn._id}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: txn.status === 'COMPLETED' ? 'success.main' : 'error.main', width: 32, height: 32 }}>
                            {txn.status === 'COMPLETED' ? <CheckCircleOutlineIcon sx={{ fontSize: 20 }} /> : <ErrorOutlineIcon sx={{ fontSize: 20 }} />}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                Deposit via {txn.paymentMethod}
                              </Typography>
                              <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700 }}>
                                +${txn.amount.toLocaleString()}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(txn.createdAt).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                {txn.transactionId}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < history.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};

export default PaymentMethods;
