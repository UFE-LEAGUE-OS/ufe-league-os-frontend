import { useAuthStore } from '../store/authStore.js';
import * as authApi from '../services/authService.js';
import type { AuthPayload } from '../services/authService.js';

export function useAuth() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const login = async (payload: AuthPayload) => {
    const response = await authApi.login(payload);
    const { user, access, refresh, requires_email_verification } = response.data;
    setAuth({ user, access, refresh, requiresEmailVerification: requires_email_verification });
    return response.data;
  };

  return { login, logout: clearAuth };
}
