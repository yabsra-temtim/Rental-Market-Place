import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Chip,
  Card,
  CardMedia,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import { itemService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';
import Reviews from '../components/Reviews';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await itemService.getById(id);
      setItem(response.data);
    } catch (error) {
      setError('Failed to load item details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = (booking) => {
    setBookingSuccess(booking);
    setTimeout(() => setBookingSuccess(null), 5000);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !item) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Item not found'}</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <IconButton onClick={() => navigate('/')} sx={{ mb: 2 }}>
        <ArrowBackIcon /> Back
      </IconButton>

      {bookingSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Booking confirmed! View your bookings in the dashboard.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Images Gallery */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={item.images?.[0] || '/placeholder-image.jpg'}
              alt={item.title}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
          {item.images?.length > 1 && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              {item.images.slice(1, 4).map((img, index) => (
                <Card key={index} sx={{ width: 100 }}>
                  <CardMedia
                    component="img"
                    height="80"
                    image={img}
                    alt={`${item.title} ${index + 2}`}
                    sx={{ objectFit: 'cover' }}
                  />
                </Card>
              ))}
            </Box>
          )}
        </Grid>

        {/* Item Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {item.title}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <LocationOnIcon color="action" />
            <Typography variant="body1">{item.location}</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <PersonIcon color="action" />
            <Typography variant="body2">
              Owner: {item.ownerId?.name || 'Unknown'}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <CalendarTodayIcon color="action" />
            <Typography variant="body2">
              Listed: {new Date(item.createdAt).toLocaleDateString()}
            </Typography>
          </Box>

          <Chip
            label={item.availability ? 'Available Now' : 'Currently Rented'}
            color={item.availability ? 'success' : 'error'}
            sx={{ mb: 2 }}
          />

          <Typography variant="h4" color="primary" gutterBottom>
            ${item.pricePerDay} <Typography component="span" variant="body1">/ day</Typography>
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {item.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Category
          </Typography>
          <Chip label={item.category} sx={{ mb: 2 }} />

          {user?._id !== item.ownerId?._id && item.availability && (
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => setBookingOpen(true)}
              sx={{ mt: 2 }}
            >
              Book Now
            </Button>
          )}

          {user?._id === item.ownerId?._id && (
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => navigate(`/edit-item/${item._id}`)}
              sx={{ mt: 2 }}
            >
              Edit Listing
            </Button>
          )}
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Reviews itemId={item._id} />

      {/* Booking Modal */}
      <BookingForm
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        item={item}
        onSuccess={handleBookingSuccess}
      />
    </Container>
  );
};

export default ItemDetails;