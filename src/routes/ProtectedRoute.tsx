import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { getToken } from '../utils/tokenManager.js';
import { LOGIN_ROUTE, VERIFY_EMAIL_ROUTE } from '../utils/authFlow.js';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const requiresEmailVerification = useAuthStore(
    (state) => state.requiresEmailVerification,
  );
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken) ?? getToken();

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

  return children;
}
