import axiosInstance from './apiClient.js';

export const fetchDashboardData = () => axiosInstance.get('/dashboards/me/');
