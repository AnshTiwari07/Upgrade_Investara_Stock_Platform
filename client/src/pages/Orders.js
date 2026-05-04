import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip
} from '@mui/material';
import api from '../api';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', letterSpacing: '-1px', mb: 6 }}>
        Orders
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Price</TableCell>
              <TableCell align="right">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10, color: 'rgba(255,255,255,0.3)' }}>
                  No orders found.
                </TableCell>
              </TableRow>
            )}
            {orders.map((o) => (
              <TableRow key={o._id} hover>
                <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                  {new Date(o.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{o.symbol}</TableCell>
                <TableCell>
                  <Chip 
                    label={o.orderType} 
                    size="small" 
                    color={o.orderType === 'BUY' ? 'success' : 'error'} 
                    variant="outlined"
                    sx={{ fontWeight: 700, borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{o.quantity}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>₹ {o.price}</TableCell>
                <TableCell align="right">
                  <Chip 
                    label={o.status} 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.05)', 
                      color: 'white', 
                      fontWeight: 600,
                      borderRadius: 1
                    }} 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Orders;