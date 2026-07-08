import axiosInstance from './apiClient.js';

export type AuthPayload = Record<string, unknown>;

export const register = (payload: AuthPayload) =>
  axiosInstance.post('/accounts/register/', payload);

export const login = (payload: AuthPayload) => axiosInstance.post('/accounts/login/', payload);

export const verifyOtp = (payload: AuthPayload) =>
  axiosInstance.post('/accounts/verify-otp/', payload);

export const resendOtp = (payload: AuthPayload) =>
  axiosInstance.post('/accounts/resend-otp/', payload);

export const requestPasswordReset = (payload: AuthPayload) =>
  axiosInstance.post('/accounts/password-reset/request/', payload);

export const resetPassword = (payload: AuthPayload) =>
  axiosInstance.post('/accounts/password-reset/confirm/', payload);

export const fetchProfile = () => axiosInstance.get('/accounts/profile/');

export const updateProfile = (payload: AuthPayload) =>
  axiosInstance.patch('/accounts/profile/', payload);

export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);

  return axiosInstance.patch('/accounts/profile/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const removeAvatar = () => axiosInstance.delete('/accounts/profile/avatar/');
