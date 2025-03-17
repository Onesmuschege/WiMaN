import { apiClient } from './apiService';

const subscriptionService = {
  getSubscriptionPlans: async () => {
    try {
      const response = await apiClient.get('/subscriptions/plans');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return { success: false, error: 'Failed to load plans' };
    }
  }
};

export default subscriptionService;