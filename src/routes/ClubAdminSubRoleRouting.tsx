import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { getDefaultDashboardRoute } from '../utils/roleRoutes.js';

/**
 * Mounted at /club-admin/*. Purely a routing junction — renders no chrome
 * of its own. Each sub-role (Chairman, Treasurer, Custom Admin, Team
 * Manager, Ticketing Officer) keeps its own full AdminWorkspaceLayout,
 * matching the mockup's "separate layout per role" diagram rather than
 * one shared shell UI wrapping all five.
 */
export function ClubAdminSubRoleShell() {
  return <Outlet />;
}

/**
 * Handles the bare /club-admin hit (no sub-role segment yet). Delegates
 * to getDefaultDashboardRoute — the same utility RoleProtectedRoute uses
 * — so there is exactly one place that decides "where does this user's
 * role actually send them", instead of two competing lists of role
 * checks drifting out of sync.
 *
 * If the resolved user isn't actually one of the five club sub-roles
 * (e.g. a plain CLUB_ADMIN, or a fan with no club role), this correctly
 * lands them wherever getDefaultDashboardRoute says they belong instead
 * of leaving them on a broken/empty /club-admin page.
 */
export function ClubAdminSubRoleRedirect() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={getDefaultDashboardRoute(user)} replace />;
}