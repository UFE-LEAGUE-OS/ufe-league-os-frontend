import { create } from 'zustand';
import {
  type AuthenticatedUser,
  isAuthenticatedUser,
} from '../types/dashboardAccess.js';
import { validateDashboardAccess } from '../utils/dashboardAccess.js';
import { useClubWorkspaceStore } from './clubWorkspaceStore.js';
import {
  clearAuthStorage,
  getRefreshToken,
  getStoredUser,
  getToken,
  setRefreshToken,
  setStoredUser,
  setToken,
} from '../utils/tokenManager.js';

export type AuthUser = AuthenticatedUser | null;
export type AccessStatus =
  | 'unauthenticated'
  | 'loading'
  | 'ready'
  | 'unavailable';

type AuthStore = {
  user: AuthUser;
  accessToken: string | null;
  refreshToken: string | null;
  requiresEmailVerification: boolean;
  accessStatus: AccessStatus;
  setAuth: (payload: {
    user: unknown;
    access: string;
    refresh: string;
    requiresEmailVerification: boolean;
  }) => void;
  setHydratedUser: (user: unknown) => void;
  setAccessUnavailable: () => void;
  clearAuth: () => void;
};

function sanitizeUser(value: unknown) {
  if (!isAuthenticatedUser(value)) {
    return {
      user: null,
      hasValidAccess: false,
    };
  }

  const dashboardAccess = validateDashboardAccess(value.dashboard_access);

  return {
    user: {
      ...value,
      dashboard_access: dashboardAccess,
    },
    hasValidAccess: dashboardAccess !== null,
  };
}

function getAccessStatus(
  hasValidAccess: boolean,
  user: AuthUser,
): Exclude<AccessStatus, 'unauthenticated' | 'loading'> {
  if (
    hasValidAccess &&
    user?.dashboard_access &&
    user.dashboard_access.entitlements.length > 0
  ) {
    return 'ready';
  }

  return 'unavailable';
}

const initialAccessToken = getToken();
const initialRefreshToken = getRefreshToken();
const initialUser = sanitizeUser(getStoredUser<unknown>());

export const useAuthStore = create<AuthStore>()((set) => ({
  user: initialAccessToken ? initialUser.user : null,
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken,
  requiresEmailVerification: false,
  accessStatus: !initialAccessToken
    ? 'unauthenticated'
    : initialUser.hasValidAccess
      ? getAccessStatus(true, initialUser.user)
      : 'loading',

  setAuth: ({ user, access, refresh, requiresEmailVerification }) => {
    const sanitized = sanitizeUser(user);

    useClubWorkspaceStore.getState().clearSelection();
    setToken(access);
    setRefreshToken(refresh);
    setStoredUser(sanitized.user);

    set({
      user: sanitized.user,
      accessToken: access,
      refreshToken: refresh,
      requiresEmailVerification,
      accessStatus: getAccessStatus(
        sanitized.hasValidAccess,
        sanitized.user,
      ),
    });
  },

  setHydratedUser: (user) => {
    const sanitized = sanitizeUser(user);

    setStoredUser(sanitized.user);
    set({
      user: sanitized.user,
      accessStatus: getAccessStatus(
        sanitized.hasValidAccess,
        sanitized.user,
      ),
    });
  },

  setAccessUnavailable: () => {
    set({ accessStatus: 'unavailable' });
  },

  clearAuth: () => {
    useClubWorkspaceStore.getState().clearSelection();
    clearAuthStorage();

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      requiresEmailVerification: false,
      accessStatus: 'unauthenticated',
    });
  },
}));
