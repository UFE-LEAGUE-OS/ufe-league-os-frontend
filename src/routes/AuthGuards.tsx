import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { getToken } from '../utils/tokenManager.js';
import { getPendingOnboardingSession } from '../utils/onboardingSession.js';

function useIsAuthenticated() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return Boolean(accessToken || getToken());
}

export function RequireAuth() {
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          message: 'Please log in to continue.',
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}

export function PublicOnly() {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/dashboard/fan" replace />;
  }

  return <Outlet />;
}

export function RequireOnboarding() {
  const pendingOnboarding = getPendingOnboardingSession();

  if (!pendingOnboarding) {
    return (
      <Navigate
        to="/register"
        replace
        state={{
          message: 'Start registration first so we can finish setting up your account.',
        }}
      />
    );
  }

  return <Outlet />;
}
