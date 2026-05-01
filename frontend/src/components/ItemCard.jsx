import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Rating,
  Box,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const ItemCard = ({ item }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={item.images?.[0] || '/placeholder-image.jpg'}
        alt={item.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2">
          {item.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {item.description?.substring(0, 100)}...
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <LocationOnIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {item.location}
          </Typography>
        </Box>
        <Typography variant="h5" color="primary" gutterBottom>
          ${item.pricePerDay}/day
        </Typography>
        <Chip
          label={item.availability ? 'Available' : 'Not Available'}
          color={item.availability ? 'success' : 'error'}
          size="small"
        />
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={() => navigate(`/items/${item._id}`)}
          fullWidth
          variant="contained"
          disabled={!item.availability}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default ItemCard;