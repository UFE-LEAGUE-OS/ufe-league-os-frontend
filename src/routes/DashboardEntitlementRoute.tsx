import { type ReactNode } from 'react';
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute.js';
import RouteLoadingFallback from '../components/RouteLoadingFallback.js';
import { useAuthStore } from '../store/authStore.js';
import { useClubWorkspaceStore } from '../store/clubWorkspaceStore.js';
import {
  ACCESS_UNAVAILABLE_ROUTE,
  getDefaultDashboardRoute,
  getMatchingEntitlements,
  validateDashboardAccess,
} from '../utils/dashboardAccess.js';
import {
  getClubWorkspaceOptions,
  resolveActiveClubWorkspace,
  type ActiveClubWorkspace,
  type ClubWorkspaceDashboard,
} from '../utils/clubWorkspace.js';
import { LOGIN_ROUTE } from '../utils/authFlow.js';
import type { DashboardIdentifier } from '../types/dashboardAccess.js';

type DashboardEntitlementRouteProps = {
  children?: ReactNode;
  dashboard: DashboardIdentifier;
  workspaceRole?: string | readonly string[];
  permission?: string;
  scopeType?: string;
};

function comparablePath(value: string) {
  const pathname = value.split(/[?#]/, 1)[0] || '/';

  return pathname.length > 1
    ? pathname.replace(/\/+$/, '')
    : pathname;
}

function formatWorkspaceRole(role: string) {
  return role
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ClubWorkspaceSelector({
  options,
}: {
  options: ActiveClubWorkspace[];
}) {
  const navigate = useNavigate();
  const selectEntitlement = useClubWorkspaceStore(
    (state) => state.selectEntitlement,
  );

  function handleSelection(workspace: ActiveClubWorkspace) {
    selectEntitlement(workspace.entitlement_id);
    navigate(workspace.route, { replace: true });
  }

  return (
    <main
      aria-labelledby="club-workspace-selector-title"
      className="club-workspace-selector"
    >
      <h1 id="club-workspace-selector-title">
        Select a Club workspace
      </h1>
      <p>
        Choose the Club scope you want to manage.
      </p>
      <div className="club-workspace-selector-options">
        {options.map((workspace) => (
          <button
            key={workspace.entitlement_id}
            type="button"
            onClick={() => handleSelection(workspace)}
          >
            {formatWorkspaceRole(workspace.workspace_role)}
            {' — '}
            Club {workspace.scope_id}
          </button>
        ))}
      </div>
    </main>
  );
}

function isClubWorkspaceDashboard(
  dashboard: DashboardIdentifier,
): dashboard is ClubWorkspaceDashboard {
  return (
    dashboard === 'CLUB_ADMIN' ||
    dashboard === 'TICKETING_OFFICER'
  );
}

function workspaceMatchesCriteria(
  workspace: ActiveClubWorkspace,
  dashboard: ClubWorkspaceDashboard,
  workspaceRole?: string | readonly string[],
  permission?: string,
) {
  if (workspace.dashboard !== dashboard) return false;

  const requestedRoles =
    typeof workspaceRole === 'string'
      ? [workspaceRole]
      : workspaceRole;

  if (
    requestedRoles &&
    !requestedRoles.some(
      (role) =>
        role.toUpperCase() ===
        workspace.workspace_role.toUpperCase(),
    )
  ) {
    return false;
  }

  return (
    !permission ||
    workspace.permissions.includes(permission)
  );
}

function EntitlementAuthorization({
  children,
  dashboard,
  workspaceRole,
  permission,
  scopeType,
}: DashboardEntitlementRouteProps) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const accessStatus = useAuthStore((state) => state.accessStatus);
  const selectedEntitlementId = useClubWorkspaceStore(
    (state) => state.selectedEntitlementId,
  );
  const isClubGuard =
    scopeType === 'CLUB' &&
    isClubWorkspaceDashboard(dashboard);

  if (accessStatus === 'loading') {
    return (
      <RouteLoadingFallback message="Restoring your dashboard access…" />
    );
  }

  const access = validateDashboardAccess(user?.dashboard_access);

  if (accessStatus === 'unauthenticated') {
    return (
      <Navigate
        replace
        state={{
          message: 'Please log in to continue.',
          postLoginRedirect: `${location.pathname}${location.search}`,
        }}
        to={LOGIN_ROUTE}
      />
    );
  }

  if (accessStatus === 'ready' && access) {
    if (isClubGuard) {
      const clubEntitlements = access.entitlements.filter(
        (entitlement) =>
          entitlement.dashboard === 'CLUB_ADMIN' ||
          entitlement.dashboard === 'TICKETING_OFFICER',
      );
      const options = getClubWorkspaceOptions(access);

      if (
        options.length === 0 ||
        options.length !== clubEntitlements.length
      ) {
        return (
          <Navigate
            replace
            to={ACCESS_UNAVAILABLE_ROUTE}
          />
        );
      }

      if (
        options.length > 1 &&
        selectedEntitlementId === null
      ) {
        return <ClubWorkspaceSelector options={options} />;
      }

      const activeWorkspace = resolveActiveClubWorkspace(
        access,
        selectedEntitlementId,
      );

      if (
        activeWorkspace &&
        workspaceMatchesCriteria(
          activeWorkspace,
          dashboard,
          workspaceRole,
          permission,
        )
      ) {
        return children ?? <Outlet />;
      }

      return (
        <Navigate
          replace
          to={ACCESS_UNAVAILABLE_ROUTE}
        />
      );
    }

    const matches = getMatchingEntitlements(access, {
      dashboard,
      workspaceRole,
      permission,
      scopeType,
      requireScopeId: Boolean(scopeType),
    });

    if (matches.length > 0) {
      return children ?? <Outlet />;
    }
  }

  if (isClubGuard) {
    return (
      <Navigate
        replace
        to={ACCESS_UNAVAILABLE_ROUTE}
      />
    );
  }

  const defaultRoute =
    accessStatus === 'ready'
      ? getDefaultDashboardRoute(access)
      : null;
  const requestedPath = comparablePath(location.pathname);
  const defaultPath = defaultRoute
    ? comparablePath(defaultRoute)
    : null;

  if (
    defaultRoute &&
    defaultPath !== requestedPath &&
    defaultPath !== ACCESS_UNAVAILABLE_ROUTE
  ) {
    return <Navigate replace to={defaultRoute} />;
  }

  return (
    <Navigate
      replace
      to={ACCESS_UNAVAILABLE_ROUTE}
    />
  );
}

export default function DashboardEntitlementRoute(
  props: DashboardEntitlementRouteProps,
) {
  return (
    <ProtectedRoute>
      <EntitlementAuthorization {...props} />
    </ProtectedRoute>
  );
}
