import axios from 'axios';

const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000/api';

const normalizedApiBaseUrl = String(rawApiBaseUrl).replace(/\/+$/, '');

export const apiBaseUrl = normalizedApiBaseUrl.endsWith('/api')
  ? normalizedApiBaseUrl
  : `${normalizedApiBaseUrl}/api`;

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('league_os_access_token');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default axiosInstance;