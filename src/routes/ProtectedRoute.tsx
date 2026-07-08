import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { getToken } from '../utils/tokenManager.js';
import { LOGIN_ROUTE, VERIFY_EMAIL_ROUTE } from '../utils/authFlow.js';
import {
  getDefaultDashboardRoute,
  isFanDashboardRoute,
  normalizeRole,
} from '../utils/roleRoutes.js';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const requiresEmailVerification = useAuthStore(
    (state) => state.requiresEmailVerification,
  );
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken) ?? getToken();
  const userRole = normalizeRole(user?.role);

  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (!event.persisted) return;

      const currentToken = getToken();

      if (!currentToken) {
        navigate(LOGIN_ROUTE, { replace: true });
        return;
      }

      const latestRole = normalizeRole(useAuthStore.getState().user?.role);
      const currentPath = window.location.pathname;

      if (latestRole && isFanDashboardRoute(currentPath) && latestRole !== 'FAN') {
        navigate(getDefaultDashboardRoute(latestRole), { replace: true });
      }
    }

    window.addEventListener('pageshow', handlePageShow);

    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [navigate]);

  if (requiresEmailVerification) {
    const email = typeof user?.email === 'string' ? user.email : undefined;
    const postLoginRedirect = `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={VERIFY_EMAIL_ROUTE}
        replace
        state={{
          email,
          message: 'Please verify your email address before continuing.',
          postLoginRedirect,
        }}
      />
    );
  }

  if (!accessToken) {
    const postLoginRedirect = `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={LOGIN_ROUTE}
        replace
        state={{
          message: 'Please log in to continue.',
          postLoginRedirect,
        }}
      />
    );
  }

  if (userRole && isFanDashboardRoute(location.pathname) && userRole !== 'FAN') {
    return <Navigate to={getDefaultDashboardRoute(userRole)} replace />;
  }

  return children;
}
