// Add dashboard API calls here as your backend expands.

import axiosInstance from './apiClient.js';

export const fetchDashboardData = () => axiosInstance.get('/dashboards/me/');
