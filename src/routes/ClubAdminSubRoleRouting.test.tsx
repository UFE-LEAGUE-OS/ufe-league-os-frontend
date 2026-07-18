import { render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { ClubAdminLegacyAliasRedirect } from './ClubAdminSubRoleRouting';
import { useAuthStore } from '../store/authStore';
import { useClubWorkspaceStore } from '../store/clubWorkspaceStore';
import type { DashboardEntitlement } from '../types/dashboardAccess';

function clubEntitlement(
  workspaceRole: string,
  dashboard: 'CLUB_ADMIN' | 'TICKETING_OFFICER' = 'CLUB_ADMIN',
): DashboardEntitlement {
  return {
    id: `club-${workspaceRole.toLowerCase()}`,
    dashboard,
    route:
      dashboard === 'TICKETING_OFFICER'
        ? '/dashboard/ticketing-officer'
        : '/dashboard/club-admin',
    scope_type: 'CLUB',
    scope_id: 7,
    workspace_role: workspaceRole,
    permissions:
      dashboard === 'TICKETING_OFFICER'
        ? ['dashboard.ticketing_officer']
        : ['dashboard.club_admin'],
  };
}

function authenticate(entitlement: DashboardEntitlement) {
  useAuthStore.setState({
    user: {
      id: 14,
      dashboard_access: {
        version: 1,
        default_entitlement_id: entitlement.id,
        entitlements: [entitlement],
      },
    },
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    requiresEmailVerification: false,
    accessStatus: 'ready',
  });
}

function renderAlias({
  dashboard = 'CLUB_ADMIN',
  path,
  workspaceRole,
}: {
  dashboard?: 'CLUB_ADMIN' | 'TICKETING_OFFICER';
  path: string;
  workspaceRole: string | readonly string[];
}) {
  return render(
    <MemoryRouter
      initialEntries={[path]}
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <Routes>
        <Route
          path={path}
          element={
            <ClubAdminLegacyAliasRedirect
              dashboard={dashboard}
              workspaceRole={workspaceRole}
            />
          }
        />
        <Route
          path="/dashboard/club-admin"
          element={<h1>Shared Club workspace</h1>}
        />
        <Route
          path="/dashboard/ticketing-officer"
          element={<h1>Shared Club ticketing workspace</h1>}
        />
        <Route
          path="/account/access-unavailable"
          element={<h1>Access unavailable</h1>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    requiresEmailVerification: false,
    accessStatus: 'unauthenticated',
  });
  useClubWorkspaceStore.setState({
    selectedEntitlementId: null,
  });
});

describe('Club Admin legacy aliases', () => {
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
    'redirects the %s alias to the canonical shared Club workspace',
    (workspaceRole, path) => {
      authenticate(clubEntitlement(workspaceRole));

      renderAlias({
        path,
        workspaceRole:
          workspaceRole === 'CUSTOM' ||
          workspaceRole === 'CUSTOM_ADMIN'
            ? ['CUSTOM', 'CUSTOM_ADMIN']
            : workspaceRole,
      });

      expect(
        screen.getByRole('heading', {
          name: 'Shared Club workspace',
        }),
      ).toBeInTheDocument();
    },
  );

  it('redirects the ticketing alias to canonical Club Ticketing', () => {
    authenticate(
      clubEntitlement(
        'TICKETING_OFFICER',
        'TICKETING_OFFICER',
      ),
    );

    renderAlias({
      dashboard: 'TICKETING_OFFICER',
      path: '/club-admin/ticketing-officer',
      workspaceRole: 'TICKETING_OFFICER',
    });

    expect(
      screen.getByRole('heading', {
        name: 'Shared Club ticketing workspace',
      }),
    ).toBeInTheDocument();
  });

  it('fails closed when the alias role does not match', () => {
    authenticate(clubEntitlement('TREASURER'));

    renderAlias({
      path: '/club-admin/chairman',
      workspaceRole: 'CHAIRMAN',
    });

    expect(
      screen.getByRole('heading', {
        name: 'Access unavailable',
      }),
    ).toBeInTheDocument();
  });

  it('fails closed when no corresponding Club entitlement exists', () => {
    authenticate({
      id: 'fan',
      dashboard: 'FAN',
      route: '/dashboard/fan',
      scope_type: 'ACCOUNT',
      scope_id: 14,
      workspace_role: null,
      permissions: [],
    });

    renderAlias({
      path: '/dashboard/chairman',
      workspaceRole: 'CHAIRMAN',
    });

    expect(
      screen.getByRole('heading', {
        name: 'Access unavailable',
      }),
    ).toBeInTheDocument();
  });
});
