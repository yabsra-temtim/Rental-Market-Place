import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Item Services
export const itemService = {
  getAll: (params) => api.get('/api/items', { params }),
  getById: (id) => api.get(`/api/items/${id}`),
  create: (data) => api.post('/api/items', data),
  update: (id, data) => api.put(`/api/items/${id}`, data),
  delete: (id) => api.delete(`/api/items/${id}`),
};

// Booking Services
export const bookingService = {
  getAll: () => api.get('/api/bookings'),
  getMyBookings: () => api.get('/api/bookings/my'),
  create: (data) => api.post('/api/bookings', data),
  updateStatus: (id, status) => api.put(`/api/bookings/${id}/status`, { status }),
  cancel: (id) => api.delete(`/api/bookings/${id}`),
};

// Review Services
export const reviewService = {
  getByItem: (itemId) => api.get(`/api/reviews/${itemId}`),
  create: (data) => api.post('/api/reviews', data),
  delete: (id) => api.delete(`/api/reviews/${id}`),
};

// Payment Services
export const paymentService = {
  checkout: (bookingId) => api.post('/api/payments/checkout', { bookingId }),
};

// User Services (ADD THIS)
export const userService = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
};

export default api;