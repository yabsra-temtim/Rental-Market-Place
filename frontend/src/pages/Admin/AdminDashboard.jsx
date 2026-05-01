import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { itemService, bookingService, userService } from '../../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [updateStatusDialog, setUpdateStatusDialog] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, itemsRes, bookingsRes] = await Promise.all([
        userService.getAll(),
        itemService.getAll(),
        bookingService.getAll(),
      ]);
      setUsers(usersRes.data);
      setItems(itemsRes.data);
      setBookings(bookingsRes.data);
      
      // Calculate stats
      setStats({
        totalUsers: usersRes.data.length,
        totalItems: itemsRes.data.length,
        totalBookings: bookingsRes.data.length,
        totalRevenue: bookingsRes.data
          .filter(b => b.status === 'confirmed')
          .reduce((sum, b) => sum + b.totalPrice, 0),
      });
      setError('');
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await userService.delete(userId);
      fetchData();
      setDeleteDialog(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      setError('Failed to delete user');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await itemService.delete(itemId);
      fetchData();
      setDeleteDialog(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
      setError('Failed to delete item');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    if (!status) {
      setError('Please select a status');
      return;
    }
    try {
      await bookingService.updateStatus(bookingId, status);
      fetchData();
      setUpdateStatusDialog(null);
      setSelectedStatus('');
    } catch (error) {
      console.error('Failed to update booking status:', error);
      setError('Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4">{stats.totalUsers || 0}</Typography>
            <Typography color="textSecondary">Total Users</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4">{stats.totalItems || 0}</Typography>
            <Typography color="textSecondary">Total Items</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4">{stats.totalBookings || 0}</Typography>
            <Typography color="textSecondary">Total Bookings</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4">${stats.totalRevenue || 0}</Typography>
            <Typography color="textSecondary">Total Revenue</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Users" />
          <Tab label="Items" />
          <Tab label="Bookings" />
        </Tabs>

        {/* Users Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Manage Users</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => setDeleteDialog({ type: 'user', id: user._id })}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton color="warning">
                          <BlockIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {users.length === 0 && (
              <Typography sx={{ mt: 2, textAlign: 'center' }}>
                No users found
              </Typography>
            )}
          </Box>
        )}

        {/* Items Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Manage Items</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Price/Day</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.ownerId?.name || 'Unknown'}</TableCell>
                      <TableCell>${item.pricePerDay}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.availability ? 'Available' : 'Rented'}
                          color={item.availability ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => setDeleteDialog({ type: 'item', id: item._id })}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {items.length === 0 && (
              <Typography sx={{ mt: 2, textAlign: 'center' }}>
                No items found
              </Typography>
            )}
          </Box>
        )}

        {/* Bookings Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Manage Bookings</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>{booking.itemId?.title || 'N/A'}</TableCell>
                      <TableCell>{booking.userId?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${booking.totalPrice}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={booking.status === 'confirmed' ? 'success' : booking.status === 'cancelled' ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setUpdateStatusDialog(booking)}
                        >
                          Update Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {bookings.length === 0 && (
              <Typography sx={{ mt: 2, textAlign: 'center' }}>
                No bookings found
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this {deleteDialog?.type}?
          {deleteDialog?.type === 'user' && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              This action cannot be undone. All associated data will be removed.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button 
            onClick={() => {
              if (deleteDialog?.type === 'user') handleDeleteUser(deleteDialog.id);
              if (deleteDialog?.type === 'item') handleDeleteItem(deleteDialog.id);
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={!!updateStatusDialog} onClose={() => {
        setUpdateStatusDialog(null);
        setSelectedStatus('');
      }}>
        <DialogTitle>Update Booking Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            <strong>Item:</strong> {updateStatusDialog?.itemId?.title || 'N/A'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Customer:</strong> {updateStatusDialog?.userId?.name || 'N/A'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Current Status:</strong> {updateStatusDialog?.status}
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="New Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setUpdateStatusDialog(null);
            setSelectedStatus('');
          }}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleUpdateBookingStatus(updateStatusDialog?._id, selectedStatus)}
            variant="contained"
            disabled={!selectedStatus}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;