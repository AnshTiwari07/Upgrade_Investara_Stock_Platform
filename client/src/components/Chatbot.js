import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  IconButton, 
  Avatar, 
  Fab, 
  Zoom,
  CircularProgress,
  Divider,
  Button
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const Chatbot = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      role: 'bot', 
      text: "Hello! I'm your Investara Trading Assistant. How can I help you with the markets today?",
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState({});
  const [isHealthy, setIsHealthy] = useState(true);
  const messagesEndRef = useRef(null);

  const checkHealth = async () => {
    try {
      const res = await api.get('/health');
      setIsHealthy(res.data.status === 'UP');
    } catch (err) {
      setIsHealthy(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    if (!isAuthenticated) {
      setChatHistory(prev => [...prev, { 
        role: 'bot', 
        text: "Please log in to your Investara account to chat with the market assistant.", 
        timestamp: new Date() 
      }]);
      setMessage('');
      return;
    }

    if (!isHealthy) {
      setChatHistory(prev => [...prev, { 
        role: 'bot', 
        text: "I'm currently offline due to a connection issue with the Investara servers. Please check your network or try again later.", 
        timestamp: new Date() 
      }]);
      setMessage('');
      return;
    }

    const userMsg = { role: 'user', text: message, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/chatbot/message', { 
        message: message,
        context: context 
      });

      const botMsg = { 
        role: 'bot', 
        text: response.data.text, 
        data: response.data.data,
        timestamp: new Date() 
      };
      
      setChatHistory(prev => [...prev, botMsg]);
      if (response.data.context) {
        setContext(response.data.context);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorText = "I'm having trouble connecting to the server. Please try again.";
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorText = "Please log in to use the Investara Assistant.";
        } else if (status === 429) {
          errorText = "You're sending messages too fast. Please wait a moment.";
        } else if (status >= 500) {
          errorText = "Service temporarily unavailable. Our engineers are working on it.";
        }
      } else if (error.request) {
        errorText = "Network error. Please check your internet connection.";
      }

      setChatHistory(prev => [...prev, { 
        role: 'bot', 
        text: errorText, 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 2000 }}>
        <Zoom in={true}>
          <Fab 
            color="primary" 
            aria-label="chat" 
            onClick={() => setIsOpen(!isOpen)}
            sx={{ 
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            }}
          >
            {isOpen ? <CloseIcon /> : <ChatIcon />}
          </Fab>
        </Zoom>
      </Box>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: 'fixed',
              bottom: 100,
              right: 32,
              zIndex: 2000,
              width: '380px',
              maxWidth: '90vw'
            }}
          >
            <Paper
              elevation={24}
              sx={{
                height: '550px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '20px',
                overflow: 'hidden',
                background: 'rgba(20, 20, 20, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            >
              {/* Header */}
              <Box sx={{ p: 2, background: 'linear-gradient(90deg, #1a1a1a, #2c2c2c)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SmartToyIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Investara Assistant</Typography>
                  <Typography variant="caption" sx={{ color: isHealthy ? 'success.main' : 'error.main' }}>
                    {isHealthy ? 'Online • Market Expert' : 'Offline • Connection Issue'}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ opacity: 0.1 }} />

              {/* Message List */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {chatHistory.map((msg, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-start',
                      gap: 1
                    }}
                  >
                    {msg.role === 'bot' && (
                      <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.1)' }}>
                        <SmartToyIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                    )}
                    <Paper
                      sx={{
                        p: 1.5,
                        maxWidth: '80%',
                        borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                        bgcolor: msg.role === 'user' ? 'primary.main' : 'rgba(255,255,255,0.05)',
                        color: 'white',
                        boxShadow: 'none'
                      }}
                    >
                      <Typography variant="body2">{msg.text}</Typography>
                    </Paper>
                  </Box>
                ))}
                {loading && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.1)' }}>
                      <SmartToyIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Paper sx={{ p: 1.5, borderRadius: '18px 18px 18px 2px', bgcolor: 'rgba(255,255,255,0.05)' }}>
                      <CircularProgress size={16} color="inherit" />
                    </Paper>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box 
                component="form" 
                onSubmit={handleSendMessage}
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(0,0,0,0.2)', 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                {!isAuthenticated ? (
                  <Button
                    component={Link}
                    to="/login"
                    variant="contained"
                    fullWidth
                    sx={{
                      borderRadius: '25px',
                      textTransform: 'none',
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    Login to Chat
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Ask about markets, prices..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={loading}
                      autoComplete="off"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '25px',
                          color: 'white',
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        }
                      }}
                    />
                    <IconButton 
                      type="submit" 
                      color="primary" 
                      disabled={!message.trim() || loading}
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
                      }}
                    >
                      <SendIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
