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

// Ordered by priority: if a user carries more than one role, the first
// match here wins. The five club sub-roles (CHAIRMAN, TREASURER,
// CUSTOM_ADMIN, TEAM_MANAGER, TICKETING_OFFICER) are checked before the
// plain CLUB_ADMIN fallback, since a sub-role is more specific and should
// route into its own /club-admin/<sub-role> branch rather than the
// generic club-admin dashboard.
function getPreferredDashboardRole(value: unknown) {
  const roles = getNormalizedRoles(value);

  return (
    [
      'SUPER_ADMIN',
      'UNION_ADMIN',
      'CHAIRMAN',
      'TREASURER',
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

    // Club sub-roles nest under /club-admin (see ClubAdminSubRoleRouting).
    case 'CHAIRMAN':
      return '/club-admin/chairman';
    case 'TREASURER':
      return '/club-admin/treasurer';
    case 'CUSTOM_ADMIN':
      return '/club-admin/custom-admin';
    case 'TEAM_MANAGER':
      return '/club-admin/team-manager';
    case 'TICKETING_OFFICER':
      // Was '/dashboard/ticketing-officer' — updated to land directly in
      // the nested shell instead of bouncing through the backward-compat
      // redirect in AppRoutes.tsx.
      return '/club-admin/ticketing-officer';

    case 'CLUB_ADMIN':
      return '/dashboard/club-admin';
    case 'LEAGUE_ADMIN':
      return '/dashboard/league-admin';
    case 'REFEREE':
    case 'MATCH_OFFICIAL':
      return '/dashboard/referee';
    case 'SPONSOR':
      return '/dashboard/sponsor';
    case 'FAN':
    default:
      return '/dashboard/fan';
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
  const roles = getNormalizedRoles(userOrRole);

  if (roles.length === 0) return false;

  if (roles.includes('SUPER_ADMIN')) {
    return isSuperAdminRoute(pathname);
  }

  if (roles.includes('UNION_ADMIN') && isUnionAdminRoute(pathname)) {
    return true;
  }

  if (roles.includes('FAN') && !isSuperAdminRoute(pathname) && !isUnionAdminRoute(pathname)) {
    return true;
  }

  return !isSuperAdminRoute(pathname) && !isFanDashboardRoute(pathname);
}