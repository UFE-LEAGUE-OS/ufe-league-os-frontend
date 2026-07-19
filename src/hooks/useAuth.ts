import { useAuthStore } from '../store/authStore.js';
import * as authApi from '../services/authService.js';
import type {
  AuthenticationResponse,
  GoogleLoginPayload,
  LoginPayload,
} from '../services/authService.js';

export function useAuth() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const completeAuthentication = (result: AuthenticationResponse) => {
    const { user, access, refresh, requires_email_verification } = result;

    setAuth({
      user,
      access,
      refresh,
      requiresEmailVerification: Boolean(requires_email_verification),
    });

    return result;
  };

  const login = async (payload: LoginPayload) => {
    const response = await authApi.login(payload);

    return completeAuthentication(response.data);
  };

  const googleLogin = async (payload: GoogleLoginPayload) => {
    const response = await authApi.googleLogin(payload);

    return completeAuthentication(response.data);
  };

  const logout = () => {
    clearAuth();
  };

  return { googleLogin, login, logout };
}
