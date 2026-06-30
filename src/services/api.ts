import axios from "axios";
import { getToken } from "../utils/tokenManager.js";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://ufe-league-os-backend.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
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
