import { create } from 'zustand';
import {
  clearAuthStorage,
  getRefreshToken,
  getStoredUser,
  getToken,
  setRefreshToken,
  setStoredUser,
  setToken,
} from '../utils/tokenManager.js';

export type UserRole =
  | 'FAN'
  | 'CLUB_ADMIN'
  | 'LEAGUE_ADMIN'
  | 'UNION_ADMIN'
  | 'REFEREE'
  | 'TICKETING_OFFICER'
  | 'SPONSOR'
  | 'SUPER_ADMIN'
  | 'fan'
  | 'club_admin'
  | 'league_admin'
  | 'union_admin'
  | 'referee'
  | 'ticketing_officer'
  | 'sponsor'
  | 'super_admin';

export type AuthUser = {
  id?: string | number;
  email?: string;
  full_name?: string;
  first_name?: string;
  role?: UserRole | string;
  sponsor_type?: 'INDIVIDUAL' | 'CORPORATE';
  [key: string]: unknown;
} | null;

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
  user: getStoredUser<AuthUser>(),
  accessToken: getToken(),
  refreshToken: getRefreshToken(),
  requiresEmailVerification: false,

  setAuth: ({ user, access, refresh, requiresEmailVerification }) => {
    setToken(access);
    setRefreshToken(refresh);
    setStoredUser(user);

    set({
      user,
      accessToken: access,
      refreshToken: refresh,
      requiresEmailVerification,
    });
  },

  clearAuth: () => {
    clearAuthStorage();

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      requiresEmailVerification: false,
    });
  },
}));
