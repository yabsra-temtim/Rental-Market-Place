import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  TextField,
  Box,
  Pagination,
  Alert,
} from '@mui/material';
import { itemService } from '../services/api';
import ItemCard from '../components/ItemCard';
import { LoadingGrid } from '../components/LoadingSkeleton';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await itemService.getAll({
          ...filters,
          page,
          limit: 12
        });
        
        if (isMounted) {
          setItems(response.data.items || []);
          setTotalPages(response.data.totalPages || 1);
        }
      } catch (error) {
        console.error('Failed to fetch items:', error);
        if (isMounted) {
          setError(error.response?.data?.message || 'Failed to load items');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchItems();
    
    return () => {
      isMounted = false;
    };
  }, [page, filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPage(1); // Reset to first page on filter change
  };

  if (loading && page === 1) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LoadingGrid />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Available Rentals
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {/* Filters */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Location"
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
          size="small"
        />
        <TextField
          label="Min Price"
          name="minPrice"
          type="number"
          value={filters.minPrice}
          onChange={handleFilterChange}
          size="small"
        />
        <TextField
          label="Max Price"
          name="maxPrice"
          type="number"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          size="small"
        />
      </Box>

      {loading && page > 1 ? (
        <LoadingGrid />
      ) : (
        <>
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <ItemCard item={item} />
              </Grid>
            ))}
          </Grid>

          {items.length === 0 && !loading && (
            <Typography variant="body1" textAlign="center" mt={4}>
              No items found. Try adjusting your filters.
            </Typography>
          )}

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Home;