// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  },

  // Login user and get tokens
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      if (response.data.access_token) {
        localStorage.setItem('accessToken', response.data.access_token);
        localStorage.setItem('refreshToken', response.data.refresh_token);
        localStorage.setItem('userRole', response.data.role);
        
        // Store user info - in a real app, you might want to decode the JWT
        localStorage.setItem('user', JSON.stringify({
          username: credentials.username,
          role: response.data.role
        }));
      }
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Login failed'
      };
    }
  },

  // Logout user - clear local storage
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    return { success: true };
  },

  // Refresh the access token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });
      if (response.data.access_token) {
        localStorage.setItem('accessToken', response.data.access_token);
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Failed to refresh token' };
    } catch (error) {
      // If refresh token is expired or invalid, logout
      authService.logout();
      return { 
        success: false, 
        error: error.response?.data?.error || 'Token refresh failed'
      };
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/request_reset`, { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Password reset request failed'
      };
    }
  },

  // Reset password with token
  resetPassword: async (resetToken, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/auth/reset_password`, {
        reset_token: resetToken,
        new_password: newPassword
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Password reset failed'
      };
    }
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem('accessToken') !== null;
  },

  // Check if user is admin
  isAdmin: () => {
    return localStorage.getItem('userRole') === 'admin';
  }
};

export default authService;