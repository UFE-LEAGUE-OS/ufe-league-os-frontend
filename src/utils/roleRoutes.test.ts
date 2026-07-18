import { describe, expect, it } from 'vitest';
import {
  canRoleAccessRedirect,
  getDefaultDashboardRoute,
  normalizeRole,
} from './roleRoutes';

describe('role dashboard routing', () => {
  it('normalizes match official role variants', () => {
    expect(normalizeRole('match official')).toBe('MATCH_OFFICIAL');
    expect(normalizeRole('match-official')).toBe('MATCH_OFFICIAL');
  });

  it('routes referees to the restricted official dashboard', () => {
    expect(getDefaultDashboardRoute('REFEREE')).toBe('/dashboard/referee');
  });

  it('routes match officials to the restricted official dashboard', () => {
    expect(getDefaultDashboardRoute('MATCH_OFFICIAL')).toBe(
      '/dashboard/referee',
    );
  });

  it('prefers the official dashboard when the user is also a fan', () => {
    expect(
      getDefaultDashboardRoute(['FAN', 'REFEREE']),
    ).toBe('/dashboard/referee');
  });

  it.each([
    'CLUB_ADMIN',
    'CHAIRMAN',
    'TREASURER',
    'TEAM_MANAGER',
    'CUSTOM',
    'CUSTOM_ADMIN',
  ])('maps legacy %s routing to the shared Club workspace', (role) => {
    expect(getDefaultDashboardRoute(role)).toBe(
      '/dashboard/club-admin',
    );
  });

  it('keeps legacy Club Ticketing on its canonical route', () => {
    expect(
      getDefaultDashboardRoute('TICKETING_OFFICER'),
    ).toBe('/dashboard/ticketing-officer');
  });

  it('does not default blank, missing, or unknown roles to Fan', () => {
    expect(getDefaultDashboardRoute(null)).toBeNull();
    expect(getDefaultDashboardRoute('')).toBeNull();
    expect(getDefaultDashboardRoute('NOT_A_REAL_ROLE')).toBeNull();
  });

  it('keeps legacy redirect checks within the exact role dashboard family', () => {
    expect(canRoleAccessRedirect('FAN', '/dashboard/fan')).toBe(true);
    expect(canRoleAccessRedirect('FAN', '/dashboard/sponsor')).toBe(false);
    expect(canRoleAccessRedirect('LEAGUE_ADMIN', '/dashboard/fan')).toBe(false);
    expect(
      canRoleAccessRedirect('LEAGUE_ADMIN', '/dashboard/league-admin'),
    ).toBe(true);
  });

  it('uses dashboard access rather than legacy roles when a contract is present', () => {
    const user = {
      role: 'FAN',
      roles: ['FAN', 'UNION_ADMIN'],
      dashboard_access: {
        version: 1,
        default_entitlement_id: 'union-workspace-3',
        entitlements: [
          {
            id: 'union-workspace-3',
            dashboard: 'UNION_WORKSPACE',
            route: '/dashboard/union-admin',
            scope_type: 'UNION_WORKSPACE',
            scope_id: 3,
            workspace_role: 'OWNER',
            permissions: [],
          },
        ],
      },
    };

    expect(canRoleAccessRedirect(user, '/dashboard/fan')).toBe(false);
    expect(
      canRoleAccessRedirect(user, '/dashboard/union-admin'),
    ).toBe(true);
  });

  it('does not authorize Club routes from a stored legacy role alone', () => {
    expect(
      canRoleAccessRedirect('CHAIRMAN', '/dashboard/club-admin'),
    ).toBe(false);
    expect(
      canRoleAccessRedirect(
        'TICKETING_OFFICER',
        '/dashboard/ticketing-officer',
      ),
    ).toBe(false);
  });

  it('uses a scoped Club entitlement despite a conflicting Fan role', () => {
    const user = {
      role: 'FAN',
      dashboard_access: {
        version: 1,
        default_entitlement_id: 'club-chairman-7',
        entitlements: [
          {
            id: 'club-chairman-7',
            dashboard: 'CLUB_ADMIN',
            route: '/dashboard/club-admin',
            scope_type: 'CLUB',
            scope_id: 7,
            workspace_role: 'CHAIRMAN',
            permissions: ['dashboard.club_admin'],
          },
        ],
      },
    };

    expect(
      canRoleAccessRedirect(user, '/dashboard/club-admin'),
    ).toBe(true);
    expect(
      canRoleAccessRedirect(user, '/dashboard/fan'),
    ).toBe(false);
  });
});
