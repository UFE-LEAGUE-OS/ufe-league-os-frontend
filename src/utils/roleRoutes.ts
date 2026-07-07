export function normalizeRole(value: unknown) {
  return typeof value === 'string'
    ? value.trim().toUpperCase().replace(/-/g, '_')
    : '';
}

export function getDefaultDashboardRoute(role: unknown) {
  const normalizedRole = normalizeRole(role);

  switch (normalizedRole) {
    case 'SUPER_ADMIN':
      return '/dashboard/super-admin';
    case 'UNION_ADMIN':
      return '/dashboard/union-admin';
    case 'CLUB_ADMIN':
      return '/dashboard/club-admin';
    case 'LEAGUE_ADMIN':
      return '/dashboard/league-admin';
    case 'REFEREE':
      return '/dashboard/referee';
    case 'TICKETING_OFFICER':
      return '/dashboard/ticketing-officer';
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

export function canRoleAccessRedirect(role: unknown, pathname: string) {
  const normalizedRole = normalizeRole(role);

  if (!normalizedRole) return false;

  if (normalizedRole === 'SUPER_ADMIN') {
    return isSuperAdminRoute(pathname);
  }

  if (normalizedRole === 'UNION_ADMIN') {
    return pathname === '/dashboard/union-admin' || pathname.startsWith('/dashboard/union-admin/');
  }

  if (normalizedRole === 'FAN') {
    return !isSuperAdminRoute(pathname) && !pathname.startsWith('/dashboard/union-admin');
  }

  return !isSuperAdminRoute(pathname) && !isFanDashboardRoute(pathname);
}
