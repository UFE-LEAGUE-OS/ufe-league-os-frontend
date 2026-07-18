import {
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import {
  ACCESS_UNAVAILABLE_ROUTE,
  getDefaultDashboardRoute,
} from '../utils/dashboardAccess.js';

function comparablePath(value: string) {
  const pathname = value.split(/[?#]/, 1)[0] || '/';

  return pathname.length > 1
    ? pathname.replace(/\/+$/, '')
    : pathname;
}

/**
 * Sends /dashboard to the backend-selected entitlement. Missing or invalid
 * access fails closed and never manufactures a Fan destination.
 */
export default function DefaultDashboardRedirect() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const accessStatus = useAuthStore((state) => state.accessStatus);

  if (accessStatus === 'loading') {
    return (
      <div
        aria-live="polite"
        className="dashboard-access-loading"
        role="status"
      >
        Restoring your dashboard access…
      </div>
    );
  }

  const defaultRoute =
    accessStatus === 'ready'
      ? getDefaultDashboardRoute(user?.dashboard_access)
      : null;
  const defaultPath = defaultRoute
    ? comparablePath(defaultRoute)
    : null;

  if (
    !defaultRoute ||
    defaultPath === comparablePath(location.pathname) ||
    defaultPath === ACCESS_UNAVAILABLE_ROUTE
  ) {
    return (
      <Navigate
        replace
        to={ACCESS_UNAVAILABLE_ROUTE}
      />
    );
  }

  return <Navigate replace to={defaultRoute} />;
}
