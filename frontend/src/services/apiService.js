// src/services/apiService.js
import axios from 'axios';
import authService from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with authorization header
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include the token in all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['x-access-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to token expiration and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshResult = await authService.refreshToken();
        
        if (refreshResult.success) {
          // Update the header and retry the original request
          originalRequest.headers['x-access-token'] = localStorage.getItem('accessToken');
          return apiClient(originalRequest);
        }
        
        // If refresh failed, redirect to login
        authService.logout();
        window.location.href = '/login';
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        authService.logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// User-related API services
const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/users/profile');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch profile'
      };
    }
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await apiClient.patch('/users/change_password', { 
        old_password: oldPassword, 
        new_password: newPassword 
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to change password'
      };
    }
  },

  // Get subscription plans
  getSubscriptionPlans: async () => {
    try {
      const response = await apiClient.get('/users/subscriptions');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch subscription plans'
      };
    }
  },

  // Subscribe to plan
  subscribeToPlan: async (planId) => {
    try {
      const response = await apiClient.post('/users/subscribe', { plan_id: planId });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to subscribe to plan'
      };
    }
  },

  // Update user settings
  updateSettings: async (settingsData) => {
    try {
      const response = await apiClient.put('/users/settings', settingsData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update settings'
      };
    }
  },

  // Get user settings
  getSettings: async () => {
    try {
      const response = await apiClient.get('/users/settings');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch settings'
      };
    }
  }
};

// Admin-related API services
const adminService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/admin/users');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch users'
      };
    }
  },

  // Update user details
  updateUser: async (username, userData) => {
    try {
      const response = await apiClient.put(`/admin/users/${username}`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update user'
      };
    }
  },

  // Block a user
  blockUser: async (username) => {
    try {
      const response = await apiClient.patch(`/admin/users/${username}/block`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to block user'
      };
    }
  },

  // Get all active subscriptions
  getActiveSubscriptions: async () => {
    try {
      const response = await apiClient.get('/admin/subscriptions');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch subscriptions'
      };
    }
  },

  // Process expired subscriptions (admin only)
  processExpiredSubscriptions: async () => {
    try {
      const response = await apiClient.post('/admin/expire_subscriptions');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to process expired subscriptions'
      };
    }
  },

  // Get system settings
  getSystemSettings: async () => {
    try {
      const response = await apiClient.get('/admin/settings');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch system settings'
      };
    }
  },

  // Update system settings
  updateSystemSettings: async (settingsData) => {
    try {
      const response = await apiClient.put('/admin/settings', settingsData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update system settings'
      };
    }
  },

  // Toggle maintenance mode
  toggleMaintenanceMode: async (enableMaintenance) => {
    try {
      const response = await apiClient.post('/admin/maintenance', { 
        maintenance_mode: enableMaintenance 
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to toggle maintenance mode'
      };
    }
  },

  // Create system backup
  createBackup: async () => {
    try {
      const response = await apiClient.post('/admin/backup');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create backup'
      };
    }
  },

  // Restore system from backup
  restoreBackup: async (backupData) => {
    try {
      const response = await apiClient.post('/admin/restore', backupData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to restore from backup'
      };
    }
  }
};

// Network-related API services
const networkService = {
  // Get all networks
  getAllNetworks: async () => {
    try {
      const response = await apiClient.get('/networks');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch networks'
      };
    }
  },

  // Get network by ID
  getNetworkById: async (id) => {
    try {
      const response = await apiClient.get(`/networks/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch network'
      };
    }
  },

  // Create new network
  createNetwork: async (networkData) => {
    try {
      const response = await apiClient.post('/networks', networkData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create network'
      };
    }
  },

  // Update network
  updateNetwork: async (id, networkData) => {
    try {
      const response = await apiClient.put(`/networks/${id}`, networkData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update network'
      };
    }
  },

  // Delete network
  deleteNetwork: async (id) => {
    try {
      const response = await apiClient.delete(`/networks/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete network'
      };
    }
  },

  // Get devices for a network
  getNetworkDevices: async (id) => {
    try {
      const response = await apiClient.get(`/networks/${id}/devices`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch network devices'
      };
    }
  }
};

// Device-related API services
const deviceService = {
  // Get all devices
  getAllDevices: async () => {
    try {
      const response = await apiClient.get('/devices');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch devices'
      };
    }
  },

  // Get device by ID
  getDeviceById: async (id) => {
    try {
      const response = await apiClient.get(`/devices/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch device'
      };
    }
  },

  // Create new device
  createDevice: async (deviceData) => {
    try {
      const response = await apiClient.post('/devices', deviceData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create device'
      };
    }
  },

  // Update device
  updateDevice: async (id, deviceData) => {
    try {
      const response = await apiClient.put(`/devices/${id}`, deviceData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update device'
      };
    }
  },

  // Delete device
  deleteDevice: async (id) => {
    try {
      const response = await apiClient.delete(`/devices/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete device'
      };
    }
  },

  // Block device
  blockDevice: async (id) => {
    try {
      const response = await apiClient.patch(`/devices/${id}/block`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to block device'
      };
    }
  },

  // Unblock device
  unblockDevice: async (id) => {
    try {
      const response = await apiClient.patch(`/devices/${id}/unblock`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to unblock device'
      };
    }
  }
};

// M-Pesa payment services
const mpesaService = {
  // Initiate M-Pesa payment
  initiatePayment: async (phoneNumber, amount) => {
    try {
      const response = await apiClient.post('/mpesa/pay', { 
        phone_number: phoneNumber, 
        amount: amount 
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to initiate payment'
      };
    }
  },

  // Check payment status
  checkPaymentStatus: async (paymentId) => {
    try {
      const response = await apiClient.get(`/mpesa/status/${paymentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to check payment status'
      };
    }
  }
};

export { userService, adminService, networkService, deviceService, mpesaService, apiClient};
