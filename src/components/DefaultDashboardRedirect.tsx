import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { getDefaultDashboardRoute } from '../utils/roleRoutes.js';

/**
 * Single source of truth for "where does /dashboard actually go".
 * Reads the logged-in user's role and sends them to the right workspace
 * (fan, club-admin, treasurer, chairman, etc.) instead of hardcoding one
 * destination for everyone.
 */
export default function DefaultDashboardRedirect() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={getDefaultDashboardRoute(user)} replace />;
}