import {
  canAccessDashboardRoute,
} from './dashboardAccess.js';

export function normalizeRole(value: unknown) {
  return typeof value === 'string'
    ? value.trim().toUpperCase().replace(/[\s-]+/g, '_')
    : '';
}

export function getNormalizedRoles(value: unknown) {
  const roles: string[] = [];

  const addRole = (role: unknown) => {
    const normalizedRole = normalizeRole(role);

    if (normalizedRole && !roles.includes(normalizedRole)) {
      roles.push(normalizedRole);
    }
  };

  if (Array.isArray(value)) {
    value.forEach(addRole);
  } else if (value && typeof value === 'object') {
    const user = value as { role?: unknown; roles?: unknown };

    addRole(user.role);

    if (Array.isArray(user.roles)) {
      user.roles.forEach(addRole);
    }
  } else {
    addRole(value);
  }

  return roles;
}

export function userHasAnyRole(userOrRole: unknown, allowedRoles: unknown[]) {
  const userRoles = getNormalizedRoles(userOrRole);
  const normalizedAllowedRoles = allowedRoles
    .map(normalizeRole)
    .filter(Boolean);

  return userRoles.some((role) => normalizedAllowedRoles.includes(role));
}

const CLUB_WORKSPACE_ROLES = new Set([
  'CLUB_ADMIN',
  'CHAIRMAN',
  'TREASURER',
  'CUSTOM',
  'CUSTOM_ADMIN',
  'TEAM_MANAGER',
  'TICKETING_OFFICER',
]);

// This priority list is retained only for legacy callers. Entitlement-aware
// routing remains authoritative whenever dashboard_access is present.
function getPreferredDashboardRole(value: unknown) {
  const roles = getNormalizedRoles(value);

  return (
    [
      'SUPER_ADMIN',
      'UNION_ADMIN',
      'CHAIRMAN',
      'TREASURER',
      'CUSTOM',
      'CUSTOM_ADMIN',
      'TEAM_MANAGER',
      'TICKETING_OFFICER',
      'CLUB_ADMIN',
      'LEAGUE_ADMIN',
      'REFEREE',
      'MATCH_OFFICIAL',
      'SPONSOR',
      'FAN',
    ].find((role) => roles.includes(role)) || ''
  );
}

export function getDefaultDashboardRoute(role: unknown) {
  const normalizedRole = getPreferredDashboardRole(role) || normalizeRole(role);

  switch (normalizedRole) {
    case 'SUPER_ADMIN':
      return '/super-admin';
    case 'UNION_ADMIN':
      return '/dashboard/union-admin';

    case 'CLUB_ADMIN':
    case 'CHAIRMAN':
    case 'TREASURER':
    case 'CUSTOM':
    case 'CUSTOM_ADMIN':
    case 'TEAM_MANAGER':
      return '/dashboard/club-admin';
    case 'TICKETING_OFFICER':
      return '/dashboard/ticketing-officer';
    case 'LEAGUE_ADMIN':
      return '/dashboard/league-admin';
    case 'REFEREE':
    case 'MATCH_OFFICIAL':
      return '/dashboard/referee';
    case 'SPONSOR':
      return '/dashboard/sponsor';
    case 'FAN':
      return '/dashboard/fan';
    default:
      return null;
  }
}

export function isFanDashboardRoute(pathname: string) {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/fan');
}

export function isSuperAdminRoute(pathname: string) {
  return (
    pathname === '/dashboard/super-admin' ||
    pathname.startsWith('/dashboard/super-admin/') ||
    pathname === '/super-admin' ||
    pathname.startsWith('/super-admin/')
  );
}

export function isUnionAdminRoute(pathname: string) {
  return pathname === '/dashboard/union-admin' || pathname.startsWith('/dashboard/union-admin/');
}

export function canRoleAccessRedirect(userOrRole: unknown, pathname: string) {
  if (
    userOrRole &&
    typeof userOrRole === 'object' &&
    Object.prototype.hasOwnProperty.call(userOrRole, 'dashboard_access')
  ) {
    return canAccessDashboardRoute(
      (userOrRole as { dashboard_access?: unknown }).dashboard_access,
      pathname,
    );
  }

  const roles = getNormalizedRoles(userOrRole);

  if (roles.length === 0) return false;

  const preferredRole = getPreferredDashboardRole(roles);
  const defaultRoute = getDefaultDashboardRoute(roles);

  if (!defaultRoute) return false;

  // Club route authorization always requires a scoped entitlement. Legacy
  // User.role values may supply display/redirect hints, never access.
  if (CLUB_WORKSPACE_ROLES.has(preferredRole)) {
    return false;
  }

  if (preferredRole === 'SUPER_ADMIN') {
    return isSuperAdminRoute(pathname);
  }

  if (preferredRole === 'UNION_ADMIN') {
    return isUnionAdminRoute(pathname);
  }

  if (preferredRole === 'FAN') {
    return isFanDashboardRoute(pathname);
  }

  return pathname === defaultRoute || pathname.startsWith(`${defaultRoute}/`);
}
