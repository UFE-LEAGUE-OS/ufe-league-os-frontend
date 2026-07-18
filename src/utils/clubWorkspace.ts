import type {
  DashboardAccess,
  DashboardEntitlement,
  DashboardIdentifier,
} from '../types/dashboardAccess.js';
import { validateDashboardAccess } from './dashboardAccess.js';

export const CLUB_ADMIN_ROUTE = '/dashboard/club-admin';
export const CLUB_TICKETING_ROUTE = '/dashboard/ticketing-officer';

export type ClubWorkspaceDashboard =
  | 'CLUB_ADMIN'
  | 'TICKETING_OFFICER';

export interface ActiveClubWorkspace {
  entitlement_id: string;
  dashboard: ClubWorkspaceDashboard;
  route: typeof CLUB_ADMIN_ROUTE | typeof CLUB_TICKETING_ROUTE;
  scope_type: 'CLUB';
  scope_id: string | number;
  workspace_role: string;
  permissions: string[];
}

export type ClubWorkspaceTab =
  | 'overview'
  | 'membership'
  | 'teams'
  | 'matches'
  | 'finances'
  | 'ticketing'
  | 'facilities'
  | 'profileBranding'
  | 'sponsorshipMatchday'
  | 'compliance'
  | 'reports'
  | 'communications'
  | 'clubUsers'
  | 'settings';

const NORMAL_CLUB_ROLES = new Set([
  'CLUB_ADMIN',
  'CHAIRMAN',
  'TREASURER',
  'TEAM_MANAGER',
  'CUSTOM',
  // Temporary compatibility for data created before the backend role was
  // normalized to ClubAdminScope.Role.CUSTOM.
  'CUSTOM_ADMIN',
]);

export const CLUB_TAB_PERMISSIONS: Record<
  ClubWorkspaceTab,
  readonly string[]
> = {
  // The backend has no permission for the aggregate overview. Dashboard
  // permissions authorize route entry; they must not expose cross-module
  // summaries on their own.
  overview: [],
  membership: ['club.members.manage'],
  teams: [
    'club.squad.manage',
    'club.training.manage',
  ],
  matches: [
    'club.matches.manage',
    'club.events.manage',
  ],
  finances: [
    'club.finance.view',
    'club.finance.manage',
  ],
  ticketing: [
    'dashboard.ticketing_officer',
    'club.ticketing.manage',
    'club.ticketing.validate',
  ],
  // There are no maintained facilities, compliance, or communications
  // permissions in the current backend contract, so these modules fail
  // closed until such permissions exist.
  facilities: [],
  profileBranding: [
    'club.profile.view',
    'club.profile.edit',
  ],
  sponsorshipMatchday: [
    'club.sponsorship.view',
    'club.sponsorship.manage',
  ],
  compliance: [],
  reports: ['club.reports.view'],
  communications: ['club.communications.manage'],
  clubUsers: ['club.admin.manage'],
  settings: ['club.settings.manage'],
};

const CLUB_TAB_PRIORITY: readonly ClubWorkspaceTab[] = [
  'overview',
  'membership',
  'teams',
  'matches',
  'finances',
  'ticketing',
  'facilities',
  'profileBranding',
  'sponsorshipMatchday',
  'compliance',
  'reports',
  'communications',
  'clubUsers',
  'settings',
];

function isCanonicalClubEntitlement(
  entitlement: DashboardEntitlement,
): entitlement is DashboardEntitlement & {
  dashboard: ClubWorkspaceDashboard;
  route: typeof CLUB_ADMIN_ROUTE | typeof CLUB_TICKETING_ROUTE;
  scope_type: 'CLUB';
  scope_id: string | number;
  workspace_role: string;
} {
  if (
    entitlement.scope_type !== 'CLUB' ||
    entitlement.scope_id === null ||
    !entitlement.workspace_role
  ) {
    return false;
  }

  if (entitlement.dashboard === 'CLUB_ADMIN') {
    return (
      entitlement.route === CLUB_ADMIN_ROUTE &&
      NORMAL_CLUB_ROLES.has(entitlement.workspace_role)
    );
  }

  return (
    entitlement.dashboard === 'TICKETING_OFFICER' &&
    entitlement.route === CLUB_TICKETING_ROUTE &&
    entitlement.workspace_role === 'TICKETING_OFFICER'
  );
}

function toActiveClubWorkspace(
  entitlement: DashboardEntitlement,
): ActiveClubWorkspace | null {
  if (!isCanonicalClubEntitlement(entitlement)) return null;

  return {
    entitlement_id: entitlement.id,
    dashboard: entitlement.dashboard,
    route: entitlement.route,
    scope_type: 'CLUB',
    scope_id: entitlement.scope_id,
    workspace_role: entitlement.workspace_role,
    permissions: [...entitlement.permissions],
  };
}

export function getClubWorkspaceOptions(
  value: unknown,
  dashboard?: DashboardIdentifier,
): ActiveClubWorkspace[] {
  const access = validateDashboardAccess(value);

  if (!access) return [];

  return access.entitlements
    .filter(
      (entitlement) =>
        (!dashboard || entitlement.dashboard === dashboard) &&
        isCanonicalClubEntitlement(entitlement),
    )
    .map(toActiveClubWorkspace)
    .filter(
      (workspace): workspace is ActiveClubWorkspace =>
        workspace !== null,
    );
}

export function resolveActiveClubWorkspace(
  value: DashboardAccess | unknown,
  selectedEntitlementId: string | null,
  dashboard?: ClubWorkspaceDashboard,
): ActiveClubWorkspace | null {
  const options = getClubWorkspaceOptions(value, dashboard);

  if (selectedEntitlementId) {
    return (
      options.find(
        (option) =>
          option.entitlement_id === selectedEntitlementId,
      ) ?? null
    );
  }

  return options.length === 1 ? options[0] : null;
}

export function isClubTabPermitted(
  tab: ClubWorkspaceTab,
  permissions: readonly string[],
) {
  const effectivePermissions = new Set(permissions);

  return CLUB_TAB_PERMISSIONS[tab].some((permission) =>
    effectivePermissions.has(permission),
  );
}

export function getFirstPermittedClubTab(
  permissions: readonly string[],
): ClubWorkspaceTab | null {
  return (
    CLUB_TAB_PRIORITY.find((tab) =>
      isClubTabPermitted(tab, permissions),
    ) ?? null
  );
}
