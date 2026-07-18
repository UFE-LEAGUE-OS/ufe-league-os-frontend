import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { getToken } from '../utils/tokenManager.js';
import { LOGIN_ROUTE } from '../utils/authFlow.js';
import {
  getDefaultDashboardRoute,
  getNormalizedRoles,
  userHasAnyRole,
} from '../utils/roleRoutes.js';
import { ACCESS_UNAVAILABLE_ROUTE } from '../utils/dashboardAccess.js';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function RoleProtectedRoute({
  children,
  allowedRoles,
  redirectTo,
}: RoleProtectedRouteProps) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken) ?? getToken();

  if (!accessToken) {
    return (
      <Navigate
        to={LOGIN_ROUTE}
        replace
        state={{
          message: 'Please log in to continue.',
          postLoginRedirect: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  const userRoles = getNormalizedRoles(user);

  if (userRoles.length === 0) {
    return (
      <Navigate
        to={LOGIN_ROUTE}
        replace
        state={{
          message: 'Please log in again so we can confirm your role.',
          postLoginRedirect: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  if (!userHasAnyRole(user, allowedRoles)) {
    return (
      <Navigate
        to={redirectTo ?? getDefaultDashboardRoute(user) ?? ACCESS_UNAVAILABLE_ROUTE}
        replace
      />
    );
  }

  return children;
}
