import axios, { AxiosHeaders } from 'axios';
import { getToken } from '../utils/tokenManager.js';

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
  const accessToken = getToken();
  const headers = AxiosHeaders.from(config.headers);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    headers.delete('Content-Type');
    headers.delete('content-type');
  }

  config.headers = headers;

  return config;
});

export default axiosInstance;
