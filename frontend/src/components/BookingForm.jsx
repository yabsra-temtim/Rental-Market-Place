import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, differenceInDays, startOfDay } from 'date-fns';
import { bookingService } from '../services/api';

const BookingForm = ({ open, onClose, item, onSuccess }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateTotal = () => {
    if (startDate && endDate) {
      const days = differenceInDays(endDate, startDate);
      return days * item.pricePerDay;
    }
    return 0;
  };

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    const start = startOfDay(startDate);
    const end = startOfDay(endDate);

    if (end <= start) {
      setError('End date must be after start date');
      return;
    }

    if (differenceInDays(end, start) < 1) {
      setError('Minimum rental period is 1 day');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await bookingService.create({
        itemId: item._id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        totalPrice: calculateTotal(),
      });
      
      onSuccess(response.data);
      onClose();
      // Reset form
      setStartDate(null);
      setEndDate(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const isDateAvailable = ({ date }) => {
    // Add logic to check if date is already booked
    // This would require fetching existing bookings for the item
    return true; // Placeholder
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Book {item.title}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Select Start Date
          </Typography>
          <Calendar
            onChange={setStartDate}
            value={startDate}
            minDate={startOfDay(new Date())}
            tileDisabled={({ date }) => !isDateAvailable({ date })}
            className="booking-calendar"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Select End Date
          </Typography>
          <Calendar
            onChange={setEndDate}
            value={endDate}
            minDate={startDate || startOfDay(new Date())}
            tileDisabled={({ date }) => !isDateAvailable({ date })}
            className="booking-calendar"
          />
        </Box>

        {startDate && endDate && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Start:</strong> {format(startDate, 'PPP')}
            </Typography>
            <Typography variant="body2">
              <strong>End:</strong> {format(endDate, 'PPP')}
            </Typography>
            <Typography variant="body2">
              <strong>Duration:</strong> {differenceInDays(endDate, startDate)} days
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
              Total: ${calculateTotal()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Price per day: ${item.pricePerDay}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleBooking}
          variant="contained"
          disabled={!startDate || !endDate || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Confirm Booking'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingForm;