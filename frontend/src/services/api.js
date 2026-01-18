import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 Unauthorized
      const isLoginOrRegister = error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/register');
      
      if (!isLoginOrRegister) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on landing/login page
        if (!['/login', '/', '/register'].includes(window.location.pathname)) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (email, token, password) => apiClient.post('/auth/reset-password', { email, token, password }),
  updatePasswordByEmail: (email, password) => apiClient.post('/auth/forgot-password/update', { email, password }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const donationAPI = {
  createDonation: (data) => {
    const headers = {};
    if (data instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    return apiClient.post('/donations', data, { headers });
  },
  getDonations: (filters) => apiClient.get('/donations', { params: filters }),
  getDonationById: (id) => apiClient.get(`/donations/${id}`),
  updateDonation: (id, data) => apiClient.put(`/donations/${id}`, data),
  deleteDonation: (id) => apiClient.delete(`/donations/${id}`),
  acceptDonation: (id) => apiClient.post(`/donations/${id}/accept`),
  rejectDonation: (id) => apiClient.post(`/donations/${id}/reject`),
  getDonationHistory: (donationId) => apiClient.get(`/donations/${donationId}/history`),
  getUserActivity: () => apiClient.get('/donations/activity/user'),
  getMyHistory: () => apiClient.get('/donations/history/my'),
};

export const pickupAPI = {
  createPickupRequest: (data) => apiClient.post('/pickup-requests', data),
  getPickupRequests: (filters) => apiClient.get('/pickup-requests', { params: filters }),
  getPickupRequestById: (id) => apiClient.get(`/pickup-requests/${id}`),
  updatePickupRequest: (id, data) => apiClient.put(`/pickup-requests/${id}`, data),
};

export const organizationAPI = {
  getOrganizations: (filters) => apiClient.get('/organizations', { params: filters }),
  getOrganizationById: (id) => apiClient.get(`/organizations/${id}`),
  createOrganization: (data) => apiClient.post('/organizations', data),
  rateOrganization: (id, data) => apiClient.post(`/organizations/${id}/rate`, data),
};

export const notificationAPI = {
  getNotifications: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
};

export const messageAPI = {
  sendMessage: (data) => apiClient.post('/messages', data),
  getConversations: () => apiClient.get('/messages/conversations'),
  getMessages: (userId) => apiClient.get(`/messages/conversations/${userId}`),
};

export const pointsAPI = {
  getUserPoints: () => apiClient.get('/points/my-points'),
  getTransactionHistory: (page = 1, limit = 20) => 
    apiClient.get('/points/history', { params: { page, limit } }),
  getLeaderboard: (limit = 10) => 
    apiClient.get('/points/leaderboard', { params: { limit } }),
  getPointsInfo: () => apiClient.get('/points/info'),
  redeemPoints: (points, description) => 
    apiClient.post('/points/redeem', { points, description }),
};

export default apiClient;
