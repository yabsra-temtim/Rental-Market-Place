import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import { itemService, bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ItemCard from '../components/ItemCard';

const Dashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [myItems, setMyItems] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, bookingsRes] = await Promise.all([
        itemService.getAll({ ownerId: user._id }),
        bookingService.getMyBookings(),
      ]);
      setMyItems(itemsRes.data);
      setMyBookings(bookingsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBookingStatusColor = (status) => {
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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 80, height: 80 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4">{user?.name}</Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email} • Role: {user?.role}
            </Typography>
            <Typography variant="body2">
              Member since: {new Date(user?.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="My Listings" />
          <Tab label="My Bookings" />
        </Tabs>

        {/* My Items Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Items I'm Renting Out</Typography>
              <Button variant="contained" onClick={() => navigate('/create-item')}>
                Add New Item
              </Button>
            </Box>
            
            {myItems.length === 0 ? (
              <Alert severity="info">
                You haven't listed any items yet. Click "Add New Item" to get started!
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {myItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item._id}>
                    <ItemCard item={item} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* My Bookings Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>My Rental Bookings</Typography>
            
            {myBookings.length === 0 ? (
              <Alert severity="info">
                You haven't made any bookings yet. Browse items to get started!
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Dates</TableCell>
                      <TableCell>Total Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myBookings.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell>
                          <Typography variant="body2">
                            {booking.itemId?.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${booking.totalPrice}</TableCell>
                        <TableCell>
                          <Chip
                            label={booking.status}
                            color={getBookingStatusColor(booking.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => navigate(`/items/${booking.itemId?._id}`)}
                          >
                            View Item
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;