import { useAuthStore } from '../store/authStore.js';
import * as authApi from '../services/authService.js';
import type { AuthPayload } from '../services/authService.js';

const ACCESS_TOKEN_KEY = 'league_os_access_token';
const REFRESH_TOKEN_KEY = 'league_os_refresh_token';

function storeTokens(access?: string, refresh?: string) {
  if (access) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem('access_token', access);
  }

  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem('refresh_token', refresh);
  }
}

function clearStoredTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function useAuth() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const login = async (payload: AuthPayload) => {
    const response = await authApi.login(payload);
    const { user, access, refresh, requires_email_verification } = response.data;

    storeTokens(access, refresh);
    setAuth({
      user,
      access,
      refresh,
      requiresEmailVerification: Boolean(requires_email_verification),
    });

    return response.data;
  };

  const logout = () => {
    clearStoredTokens();
    clearAuth();
  };

  return { login, logout };
}
