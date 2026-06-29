import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { getToken } from '../utils/tokenManager.js';
import { LOGIN_ROUTE } from '../utils/authFlow.js';
import type { UserRole } from '../store/authStore.js';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export default function RoleProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/',
}: RoleProtectedRouteProps) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken) ?? getToken();

  // Not logged in — redirect to login
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

  // Logged in but wrong role — redirect to fallback
  const userRole = user?.role as UserRole | undefined;
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}