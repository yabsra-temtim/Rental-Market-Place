import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { reviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Reviews = ({ itemId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [itemId]);

  const fetchReviews = async () => {
    try {
      const response = await reviewService.getByItem(itemId);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      setError('Please login to leave a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      await reviewService.create({
        itemId,
        rating,
        comment,
      });
      setSuccess('Review submitted successfully!');
      setRating(0);
      setComment('');
      fetchReviews();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Reviews ({reviews.length})
      </Typography>
      
      <Box display="flex" alignItems="center" mb={3}>
        <Rating value={averageRating} precision={0.5} readOnly />
        <Typography variant="h6" sx={{ ml: 1 }}>
          {averageRating.toFixed(1)} / 5
        </Typography>
      </Box>

      {/* Write Review Section */}
      {user && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Write a Review
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Box mb={2}>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Share your experience with this item..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Submit Review'}
          </Button>
        </Paper>
      )}

      {/* Reviews List */}
      <List>
        {reviews.map((review, index) => (
          <React.Fragment key={review._id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>
                  {review.userId?.name?.charAt(0) || 'U'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1">
                      {review.userId?.name || 'Anonymous'}
                    </Typography>
                    <Rating value={review.rating} size="small" readOnly />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.primary">
                      {review.comment}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {index < reviews.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>

      {reviews.length === 0 && (
        <Typography color="text.secondary" textAlign="center">
          No reviews yet. Be the first to review!
        </Typography>
      )}
    </Box>
  );
};

export default Reviews;