import { useEffect } from 'react';

import { fetchCurrentUser } from '../services/authService.js';
import { useAuthStore } from '../store/authStore.js';

let inFlightHydration: Promise<void> | null = null;
let inFlightAccessToken: string | null = null;

function isUnauthorized(error: unknown) {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return false;
  }

  const response = (error as { response?: { status?: unknown } }).response;
  return response?.status === 401;
}

function hydrateCurrentSession(accessToken: string) {
  if (inFlightHydration && inFlightAccessToken === accessToken) {
    return inFlightHydration;
  }

  inFlightAccessToken = accessToken;
  inFlightHydration = fetchCurrentUser()
    .then(({ data }) => {
      if (useAuthStore.getState().accessToken !== accessToken) {
        return;
      }

      useAuthStore.getState().setHydratedUser(data);
    })
    .catch((error: unknown) => {
      if (useAuthStore.getState().accessToken !== accessToken) {
        return;
      }

      if (isUnauthorized(error)) {
        useAuthStore.getState().clearAuth();
        return;
      }

      useAuthStore.getState().setAccessUnavailable();
    })
    .finally(() => {
      if (inFlightAccessToken === accessToken) {
        inFlightHydration = null;
        inFlightAccessToken = null;
      }
    });

  return inFlightHydration;
}

export default function AuthSessionHydrator() {
  const accessStatus = useAuthStore((state) => state.accessStatus);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (accessStatus !== 'loading' || !accessToken) {
      return;
    }

    void hydrateCurrentSession(accessToken);
  }, [accessStatus, accessToken]);

  return null;
}
