import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { bookingService, paymentService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialog, setCancelDialog] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getMyBookings();
      setBookings(response.data);
    } catch (error) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingService.cancel(bookingId);
      fetchBookings();
      setCancelDialog(null);
    } catch (error) {
      setError('Failed to cancel booking');
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      const response = await paymentService.checkout(bookingId);
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      setError('Failed to initiate payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Bookings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking._id}>
                <TableCell>
                  <Typography variant="body2">
                    {booking.itemId?.title}
                  </Typography>
                </TableCell>
                <TableCell>{booking.itemId?.ownerId?.name}</TableCell>
                <TableCell>
                  {new Date(booking.startDate).toLocaleDateString()}
                  <br />→<br />
                  {new Date(booking.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} days
                </TableCell>
                <TableCell>${booking.totalPrice}</TableCell>
                <TableCell>
                  <Chip
                    label={booking.status}
                    color={getStatusColor(booking.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {booking.payment?.status === 'paid' ? (
                    <Chip label="Paid" color="success" size="small" />
                  ) : booking.status === 'confirmed' ? (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handlePayment(booking._id)}
                    >
                      Pay Now
                    </Button>
                  ) : (
                    <Chip label="Pending" color="warning" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  {booking.status === 'pending' && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setCancelDialog(booking._id)}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    size="small"
                    onClick={() => window.location.href = `/items/${booking.itemId?._id}`}
                  >
                    View Item
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {bookings.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          You haven't made any bookings yet. Browse items to get started!
        </Alert>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelDialog} onClose={() => setCancelDialog(null)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          Are you sure you want to cancel this booking?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(null)}>No</Button>
          <Button onClick={() => handleCancelBooking(cancelDialog)} color="error">
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Bookings;