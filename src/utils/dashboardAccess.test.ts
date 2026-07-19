import { describe, expect, it } from 'vitest';

import {
  canAccessDashboardRoute,
  getAvailableWorkspaceOptions,
  getDefaultDashboardRoute,
  getDefaultEntitlement,
  getEntitlementsForDashboard,
  hasDashboardEntitlement,
  hasUnionWorkspaceRole,
  validateDashboardAccess,
} from './dashboardAccess';

const fanEntitlement = {
  id: 'fan',
  dashboard: 'FAN',
  route: '/dashboard/fan',
  scope_type: 'ACCOUNT',
  scope_id: 14,
  workspace_role: null,
  permissions: [],
};

const sponsorEntitlement = {
  id: 'individual-sponsor-4',
  dashboard: 'SPONSOR',
  route: '/dashboard/sponsor',
  scope_type: 'INDIVIDUAL_SPONSOR_ACCOUNT',
  scope_id: 4,
  workspace_role: 'OWNER',
  permissions: ['sponsor.dashboard.view'],
};

const matchOfficialEntitlement = {
  id: 'union-workspace-9',
  dashboard: 'UNION_WORKSPACE',
  route: '/dashboard/union-admin',
  scope_type: 'UNION_WORKSPACE',
  scope_id: 9,
  workspace_role: 'MATCH_OFFICIAL',
  permissions: [
    'union.dashboard.view',
    'union.official.appointments.view',
  ],
};

function clubEntitlement(
  workspaceRole: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id: `club-${workspaceRole.toLowerCase()}`,
    dashboard: 'CLUB_ADMIN',
    route: '/dashboard/club-admin',
    scope_type: 'CLUB',
    scope_id: 7,
    workspace_role: workspaceRole,
    permissions: ['dashboard.club_admin'],
    ...overrides,
  };
}

describe('dashboard access contract', () => {
  it('validates the numeric backend version and resolves an explicit Fan default', () => {
    const access = validateDashboardAccess({
      version: 1,
      default_entitlement_id: 'fan',
      entitlements: [fanEntitlement],
    });

    expect(access).not.toBeNull();
    expect(getDefaultEntitlement(access)).toEqual(fanEntitlement);
    expect(getDefaultDashboardRoute(access)).toBe('/dashboard/fan');
    expect(hasDashboardEntitlement(access, 'FAN')).toBe(true);
  });

  it.each([
    {
      version: '1',
      default_entitlement_id: 'fan',
      entitlements: [fanEntitlement],
    },
    {
      version: 1,
      default_entitlement_id: 'missing',
      entitlements: [fanEntitlement],
    },
    {
      version: 1,
      default_entitlement_id: null,
      entitlements: [fanEntitlement],
    },
    {
      version: 1,
      default_entitlement_id: 'fan',
      entitlements: [
        fanEntitlement,
        { ...fanEntitlement, route: '/dashboard/another-fan' },
      ],
    },
    {
      version: 1,
      default_entitlement_id: 'fan',
      entitlements: [{ ...fanEntitlement, route: 'dashboard/fan' }],
    },
  ])('rejects malformed or unsupported contracts', (value) => {
    expect(validateDashboardAccess(value)).toBeNull();
    expect(getDefaultDashboardRoute(value)).toBeNull();
  });

  it('accepts an explicit empty access contract without manufacturing Fan', () => {
    const access = validateDashboardAccess({
      version: 1,
      default_entitlement_id: null,
      entitlements: [],
    });

    expect(access).not.toBeNull();
    expect(getDefaultEntitlement(access)).toBeNull();
    expect(getDefaultDashboardRoute(access)).toBeNull();
    expect(hasDashboardEntitlement(access, 'FAN')).toBe(false);
  });

  it('keeps Sponsor and Fan separate and honors the Sponsor default', () => {
    const access = {
      version: 1,
      default_entitlement_id: sponsorEntitlement.id,
      entitlements: [sponsorEntitlement, fanEntitlement],
    };

    expect(getDefaultDashboardRoute(access)).toBe('/dashboard/sponsor');
    expect(getEntitlementsForDashboard(access, 'SPONSOR')).toEqual([
      sponsorEntitlement,
    ]);
    expect(hasDashboardEntitlement(access, 'FAN')).toBe(true);
    expect(canAccessDashboardRoute(access, '/dashboard/fan')).toBe(true);
    expect(canAccessDashboardRoute(access, '/sponsor/payments')).toBe(true);
  });

  it('preserves multiple scoped Union options, roles, and permissions', () => {
    const secondWorkspace = {
      ...matchOfficialEntitlement,
      id: 'union-workspace-15',
      scope_id: 15,
      workspace_role: 'TICKETING_OFFICER',
      permissions: ['union.dashboard.view', 'union.ticketing.scan'],
    };
    const access = {
      version: 1,
      default_entitlement_id: matchOfficialEntitlement.id,
      entitlements: [matchOfficialEntitlement, secondWorkspace],
    };

    expect(getAvailableWorkspaceOptions(access, 'UNION_WORKSPACE')).toEqual([
      {
        entitlementId: 'union-workspace-9',
        dashboard: 'UNION_WORKSPACE',
        route: '/dashboard/union-admin',
        scopeType: 'UNION_WORKSPACE',
        scopeId: 9,
        workspaceRole: 'MATCH_OFFICIAL',
        permissions: [
          'union.dashboard.view',
          'union.official.appointments.view',
        ],
      },
      {
        entitlementId: 'union-workspace-15',
        dashboard: 'UNION_WORKSPACE',
        route: '/dashboard/union-admin',
        scopeType: 'UNION_WORKSPACE',
        scopeId: 15,
        workspaceRole: 'TICKETING_OFFICER',
        permissions: ['union.dashboard.view', 'union.ticketing.scan'],
      },
    ]);
    expect(hasUnionWorkspaceRole(access, 'MATCH_OFFICIAL')).toBe(true);
    expect(hasUnionWorkspaceRole(access, 'OWNER')).toBe(false);
  });

  it('authorizes saved redirects only through explicit dashboard capabilities', () => {
    const unionAccess = {
      version: 1,
      default_entitlement_id: matchOfficialEntitlement.id,
      entitlements: [matchOfficialEntitlement],
    };
    const fanAccess = {
      version: 1,
      default_entitlement_id: fanEntitlement.id,
      entitlements: [fanEntitlement],
    };

    expect(canAccessDashboardRoute(unionAccess, '/dashboard/fan')).toBe(false);
    expect(canAccessDashboardRoute(unionAccess, '/memberships')).toBe(false);
    expect(
      canAccessDashboardRoute(unionAccess, '/dashboard/match-official'),
    ).toBe(true);
    expect(canAccessDashboardRoute(fanAccess, '/dashboard/union-admin')).toBe(
      false,
    );
    expect(canAccessDashboardRoute(fanAccess, '/fantasy/team-builder')).toBe(
      true,
    );
    expect(canAccessDashboardRoute(fanAccess, '/dashboard/wallet')).toBe(true);
  });

  it.each([
    'CLUB_ADMIN',
    'CHAIRMAN',
    'TREASURER',
    'TEAM_MANAGER',
    'CUSTOM',
    'CUSTOM_ADMIN',
  ])(
    'keeps the %s workspace role on the shared Club route',
    (workspaceRole) => {
      const entitlement = clubEntitlement(workspaceRole);
      const access = {
        version: 1,
        default_entitlement_id: entitlement.id,
        entitlements: [entitlement],
      };

      expect(getDefaultDashboardRoute(access)).toBe(
        '/dashboard/club-admin',
      );
      expect(
        canAccessDashboardRoute(access, '/dashboard/club-admin/teams'),
      ).toBe(true);
    },
  );

  it('keeps Club Ticketing on its canonical shared-shell route', () => {
    const ticketing = {
      id: 'club-ticketing-7',
      dashboard: 'TICKETING_OFFICER',
      route: '/dashboard/ticketing-officer',
      scope_type: 'CLUB',
      scope_id: 7,
      workspace_role: 'TICKETING_OFFICER',
      permissions: ['dashboard.ticketing_officer'],
    };
    const access = {
      version: 1,
      default_entitlement_id: ticketing.id,
      entitlements: [ticketing],
    };

    expect(getDefaultDashboardRoute(access)).toBe(
      '/dashboard/ticketing-officer',
    );
    expect(
      canAccessDashboardRoute(
        access,
        '/dashboard/ticketing-officer/scanner',
      ),
    ).toBe(true);
    expect(
      canAccessDashboardRoute(access, '/dashboard/club-admin'),
    ).toBe(false);
  });

  it.each([
    ['CHAIRMAN', '/club-admin/chairman'],
    ['CHAIRMAN', '/dashboard/chairman'],
    ['TREASURER', '/club-admin/treasurer'],
    ['TREASURER', '/dashboard/treasurer'],
    ['TEAM_MANAGER', '/club-admin/team-manager'],
    ['TEAM_MANAGER', '/dashboard/team-manager'],
    ['CUSTOM', '/club-admin/custom-admin'],
    ['CUSTOM_ADMIN', '/dashboard/custom-admin'],
  ])(
    'authorizes the %s legacy alias only for its matching entitlement',
    (workspaceRole, alias) => {
      const matching = clubEntitlement(workspaceRole);
      const different = clubEntitlement('CLUB_ADMIN');

      expect(
        canAccessDashboardRoute(
          {
            version: 1,
            default_entitlement_id: matching.id,
            entitlements: [matching],
          },
          alias,
        ),
      ).toBe(true);
      expect(
        canAccessDashboardRoute(
          {
            version: 1,
            default_entitlement_id: different.id,
            entitlements: [different],
          },
          alias,
        ),
      ).toBe(false);
    },
  );

  it('does not let a normal Club entitlement authorize the ticketing alias', () => {
    const normalClub = clubEntitlement('CHAIRMAN');
    const ticketing = {
      id: 'club-ticketing-7',
      dashboard: 'TICKETING_OFFICER',
      route: '/dashboard/ticketing-officer',
      scope_type: 'CLUB',
      scope_id: 7,
      workspace_role: 'TICKETING_OFFICER',
      permissions: ['dashboard.ticketing_officer'],
    };

    expect(
      canAccessDashboardRoute(
        {
          version: 1,
          default_entitlement_id: normalClub.id,
          entitlements: [normalClub],
        },
        '/club-admin/ticketing-officer',
      ),
    ).toBe(false);
    expect(
      canAccessDashboardRoute(
        {
          version: 1,
          default_entitlement_id: ticketing.id,
          entitlements: [ticketing],
        },
        '/club-admin/ticketing-officer',
      ),
    ).toBe(true);
  });

  it.each([
    { scope_type: 'LEAGUE' },
    { scope_id: null },
    { route: '/club-admin/chairman' },
    { workspace_role: null },
  ])('rejects malformed Club capability routing: %j', (overrides) => {
    const malformed = clubEntitlement('CHAIRMAN', overrides);

    expect(
      canAccessDashboardRoute(
        {
          version: 1,
          default_entitlement_id: malformed.id,
          entitlements: [malformed],
        },
        '/dashboard/club-admin',
      ),
    ).toBe(false);
  });
});
