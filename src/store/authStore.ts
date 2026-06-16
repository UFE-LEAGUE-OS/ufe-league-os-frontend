import { create } from 'zustand';
import {
  clearAuthTokens,
  getRefreshToken,
  getToken,
  setAuthTokens,
} from '../utils/tokenManager.js';

type AuthUser = Record<string, unknown> | null;

type AuthStore = {
  user: AuthUser;
  accessToken: string | null;
  refreshToken: string | null;
  requiresEmailVerification: boolean;
  setAuth: (payload: {
    user: AuthUser;
    access: string;
    refresh: string;
    requiresEmailVerification: boolean;
  }) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  accessToken: getToken(),
  refreshToken: getRefreshToken(),
  requiresEmailVerification: false,

  setAuth: ({ user, access, refresh, requiresEmailVerification }) => {
    setAuthTokens({
      accessToken: access,
      refreshToken: refresh,
    });

    set({ user, accessToken: access, refreshToken: refresh, requiresEmailVerification });
  },

  clearAuth: () => {
    clearAuthTokens();

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      requiresEmailVerification: false,
    });
  },
}));
