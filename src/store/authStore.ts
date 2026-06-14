import { create } from 'zustand';

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
  accessToken: null,
  refreshToken: null,
  requiresEmailVerification: false,

  setAuth: ({ user, access, refresh, requiresEmailVerification }) =>
    set({ user, accessToken: access, refreshToken: refresh, requiresEmailVerification }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      requiresEmailVerification: false,
    }),
}));
