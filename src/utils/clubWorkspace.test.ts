import { describe, expect, it } from 'vitest';

import type {
  DashboardAccess,
  DashboardEntitlement,
} from '../types/dashboardAccess';
import {
  getClubWorkspaceOptions,
  getFirstPermittedClubTab,
  resolveActiveClubWorkspace,
} from './clubWorkspace';

function clubEntitlement(
  id: string,
  scopeId: number,
  workspaceRole: string,
  permissions: string[],
  dashboard: 'CLUB_ADMIN' | 'TICKETING_OFFICER' = 'CLUB_ADMIN',
): DashboardEntitlement {
  return {
    id,
    dashboard,
    route:
      dashboard === 'TICKETING_OFFICER'
        ? '/dashboard/ticketing-officer'
        : '/dashboard/club-admin',
    scope_type: 'CLUB',
    scope_id: scopeId,
    workspace_role: workspaceRole,
    permissions,
  };
}

function access(
  entitlements: DashboardEntitlement[],
  defaultId = entitlements[0]?.id ?? null,
): DashboardAccess {
  return {
    version: 1,
    default_entitlement_id: defaultId,
    entitlements,
  };
}

describe('Club workspace entitlement selection', () => {
  it.each([
    'CLUB_ADMIN',
    'CHAIRMAN',
    'TREASURER',
    'TEAM_MANAGER',
    'CUSTOM',
  ])('keeps %s in the canonical shared Club workspace', (workspaceRole) => {
    const options = getClubWorkspaceOptions(
      access([
        clubEntitlement(
          `club-${workspaceRole}`,
          7,
          workspaceRole,
          ['dashboard.club_admin'],
        ),
      ]),
    );

    expect(options).toEqual([
      expect.objectContaining({
        dashboard: 'CLUB_ADMIN',
        route: '/dashboard/club-admin',
        scope_type: 'CLUB',
        scope_id: 7,
        workspace_role: workspaceRole,
      }),
    ]);
  });

  it('keeps Club Ticketing in the shared shell with its canonical route', () => {
    const [option] = getClubWorkspaceOptions(
      access([
        clubEntitlement(
          'club-ticketing-9',
          9,
          'TICKETING_OFFICER',
          ['club.ticketing.manage', 'dashboard.ticketing_officer'],
          'TICKETING_OFFICER',
        ),
      ]),
    );

    expect(option).toMatchObject({
      dashboard: 'TICKETING_OFFICER',
      route: '/dashboard/ticketing-officer',
      scope_type: 'CLUB',
      scope_id: 9,
      workspace_role: 'TICKETING_OFFICER',
    });
  });

  it('automatically resolves one valid Club entitlement', () => {
    const contract = access([
      clubEntitlement(
        'club-7',
        7,
        'TREASURER',
        ['club.finance.view'],
      ),
    ]);

    expect(resolveActiveClubWorkspace(contract, null)).toMatchObject({
      entitlement_id: 'club-7',
      scope_id: 7,
      permissions: ['club.finance.view'],
    });
  });

  it('fails closed when an explicit selection is stale or invalid', () => {
    const contract = access([
      clubEntitlement(
        'club-7',
        7,
        'TREASURER',
        ['club.finance.view'],
      ),
    ]);

    expect(
      resolveActiveClubWorkspace(contract, 'club-missing'),
    ).toBeNull();
  });

  it('requires an explicit entitlement when multiple Club scopes exist', () => {
    const contract = access([
      clubEntitlement('club-7', 7, 'TREASURER', ['club.finance.view']),
      clubEntitlement('club-11', 11, 'TEAM_MANAGER', ['club.squad.manage']),
    ]);

    expect(resolveActiveClubWorkspace(contract, null)).toBeNull();
    expect(resolveActiveClubWorkspace(contract, 'missing')).toBeNull();
    expect(resolveActiveClubWorkspace(contract, 'club-11')).toMatchObject({
      entitlement_id: 'club-11',
      scope_id: 11,
      workspace_role: 'TEAM_MANAGER',
      permissions: ['club.squad.manage'],
    });
  });

  it('never combines permissions from different Club scopes', () => {
    const contract = access([
      clubEntitlement('club-7', 7, 'TREASURER', ['club.finance.view']),
      clubEntitlement('club-11', 11, 'TEAM_MANAGER', ['club.squad.manage']),
    ]);

    expect(
      resolveActiveClubWorkspace(contract, 'club-7')?.permissions,
    ).toEqual(['club.finance.view']);
    expect(
      resolveActiveClubWorkspace(contract, 'club-11')?.permissions,
    ).toEqual(['club.squad.manage']);
  });

  it('rejects non-Club scopes and malformed Club Ticketing roles', () => {
    const invalidScope = {
      ...clubEntitlement('league-7', 7, 'CHAIRMAN', []),
      scope_type: 'LEAGUE',
    };
    const invalidTicketing = clubEntitlement(
      'ticketing-7',
      7,
      'TREASURER',
      ['dashboard.ticketing_officer'],
      'TICKETING_OFFICER',
    );

    expect(
      getClubWorkspaceOptions(access([invalidScope, invalidTicketing])),
    ).toEqual([]);
  });
});

describe('Club workspace permission defaults', () => {
  it.each([
    [['club.finance.view'], 'finances'],
    [['club.squad.manage'], 'teams'],
    [['club.ticketing.manage'], 'ticketing'],
    [['club.profile.view'], 'profileBranding'],
  ])('selects the first module allowed by %j', (permissions, expected) => {
    expect(getFirstPermittedClubTab(permissions)).toBe(expected);
  });

  it('falls back to user management when no other Club module is permitted', () => {
    expect(
      getFirstPermittedClubTab(['dashboard.club_admin']),
    ).toBe('clubUsers');
    expect(getFirstPermittedClubTab(['dashboard.me'])).toBe('clubUsers');
  });
});
