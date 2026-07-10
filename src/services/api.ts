// api.ts
import axios from "axios";
import { getToken } from "../utils/tokenManager.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const normalisedApiBaseUrl = API_BASE_URL.endsWith("/")
  ? API_BASE_URL
  : `${API_BASE_URL}/`;

export const api = axios.create({
  baseURL: normalisedApiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const accessToken = getToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});