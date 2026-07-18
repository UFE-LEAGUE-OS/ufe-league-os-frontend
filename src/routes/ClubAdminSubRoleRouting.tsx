import { Navigate } from 'react-router-dom';

import DashboardEntitlementRoute from './DashboardEntitlementRoute.js';
import {
  CLUB_ADMIN_ROUTE,
  CLUB_TICKETING_ROUTE,
  type ClubWorkspaceDashboard,
} from '../utils/clubWorkspace.js';

type ClubAdminLegacyAliasRedirectProps = {
  dashboard?: ClubWorkspaceDashboard;
  workspaceRole: string | readonly string[];
};

/**
 * Entitlement-aware compatibility layer for retired Club sub-role routes.
 * The alias renders no workspace UI; an exact scoped entitlement is checked
 * before navigation continues to the shared Club shell.
 */
export function ClubAdminLegacyAliasRedirect({
  dashboard = 'CLUB_ADMIN',
  workspaceRole,
}: ClubAdminLegacyAliasRedirectProps) {
  const destination =
    dashboard === 'TICKETING_OFFICER'
      ? CLUB_TICKETING_ROUTE
      : CLUB_ADMIN_ROUTE;

  return (
    <DashboardEntitlementRoute
      dashboard={dashboard}
      scopeType="CLUB"
      workspaceRole={workspaceRole}
    >
      <Navigate replace to={destination} />
    </DashboardEntitlementRoute>
  );
}

/** Backward-compatible bare /club-admin redirect. */
export function ClubAdminSubRoleRedirect() {
  return (
    <ClubAdminLegacyAliasRedirect
      workspaceRole={[
        'CLUB_ADMIN',
        'CHAIRMAN',
        'TREASURER',
        'TEAM_MANAGER',
        'CUSTOM',
        'CUSTOM_ADMIN',
      ]}
    />
  );
}
