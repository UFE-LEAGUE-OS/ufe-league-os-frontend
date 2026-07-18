import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import DashboardEntitlementRoute from './DashboardEntitlementRoute';
import { useAuthStore } from '../store/authStore';
import { useClubWorkspaceStore } from '../store/clubWorkspaceStore';
import type {
  DashboardEntitlement,
  DashboardIdentifier,
} from '../types/dashboardAccess';

const fanEntitlement = {
  id: 'fan',
  dashboard: 'FAN' as const,
  route: '/dashboard/fan',
  scope_type: 'ACCOUNT',
  scope_id: 14,
  workspace_role: null,
  permissions: [],
};

const unionEntitlement = {
  id: 'union-workspace-9',
  dashboard: 'UNION_WORKSPACE' as const,
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
  id: string,
  scopeId: number,
  workspaceRole: string,
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
    permissions:
      dashboard === 'TICKETING_OFFICER'
        ? ['dashboard.ticketing_officer']
        : ['dashboard.club_admin'],
  };
}

function LoginProbe() {
  const location = useLocation();
  const state = location.state as {
    postLoginRedirect?: string;
  } | null;

  return (
    <>
      <h1>Login</h1>
      <span>{state?.postLoginRedirect}</span>
    </>
  );
}

function setAuthenticatedAccess(
  entitlements: DashboardEntitlement[] = [unionEntitlement],
  defaultId = entitlements[0]?.id ?? null,
) {
  useAuthStore.setState({
    user: {
      id: 14,
      dashboard_access: {
        version: 1,
        default_entitlement_id: defaultId,
        entitlements,
      },
    },
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    requiresEmailVerification: false,
    accessStatus: 'ready',
  });
}

function renderGuard(
  path: string,
  props: {
    dashboard: DashboardIdentifier;
    workspaceRole?: string | readonly string[];
    permission?: string;
    scopeType?: string;
  },
) {
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
            <DashboardEntitlementRoute {...props}>
              <h1>Protected dashboard</h1>
            </DashboardEntitlementRoute>
          }
        />
        <Route
          path="/dashboard/fan"
          element={<h1>Fan default</h1>}
        />
        <Route
          path="/dashboard/union-admin"
          element={<h1>Union default</h1>}
        />
        <Route
          path="/dashboard/club-admin"
          element={<h1>Club default</h1>}
        />
        <Route
          path="/dashboard/ticketing-officer"
          element={<h1>Ticketing default</h1>}
        />
        <Route
          path="/account/access-unavailable"
          element={<h1>Access unavailable</h1>}
        />
        <Route
          path="/login"
          element={<LoginProbe />}
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

describe('DashboardEntitlementRoute', () => {
  it('sends an unauthenticated request to login', () => {
    renderGuard('/dashboard/fan', {
      dashboard: 'FAN',
    });

    expect(
      screen.getByRole('heading', { name: 'Login' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('/dashboard/fan'),
    ).toBeInTheDocument();
  });

  it('shows neutral loading while dashboard access hydrates', () => {
    useAuthStore.setState({
      user: { id: 14 },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requiresEmailVerification: false,
      accessStatus: 'loading',
    });

    renderGuard('/dashboard/fan', {
      dashboard: 'FAN',
    });

    expect(
      screen.getByRole('status'),
    ).toHaveTextContent(/restoring your dashboard access/i);
    expect(
      screen.queryByRole('heading', { name: 'Protected dashboard' }),
    ).not.toBeInTheDocument();
  });

  it('renders only when the exact dashboard criteria match', () => {
    setAuthenticatedAccess();

    renderGuard('/dashboard/match-official', {
      dashboard: 'UNION_WORKSPACE',
      workspaceRole: 'MATCH_OFFICIAL',
      permission: 'union.official.appointments.view',
    });

    expect(
      screen.getByRole('heading', { name: 'Protected dashboard' }),
    ).toBeInTheDocument();
  });

  it('redirects an unauthorized dashboard to the validated default', () => {
    setAuthenticatedAccess([fanEntitlement]);

    renderGuard('/dashboard/union-admin', {
      dashboard: 'UNION_WORKSPACE',
    });

    expect(
      screen.getByRole('heading', { name: 'Fan default' }),
    ).toBeInTheDocument();
  });

  it('fails closed without a usable default', () => {
    useAuthStore.setState({
      user: {
        id: 14,
        dashboard_access: {
          version: 1,
          default_entitlement_id: null,
          entitlements: [],
        },
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requiresEmailVerification: false,
      accessStatus: 'ready',
    });

    renderGuard('/dashboard/fan', {
      dashboard: 'FAN',
    });

    expect(
      screen.getByRole('heading', { name: 'Access unavailable' }),
    ).toBeInTheDocument();
  });

  it('breaks a rejected-default redirect loop', () => {
    setAuthenticatedAccess();

    renderGuard('/dashboard/union-admin', {
      dashboard: 'UNION_WORKSPACE',
      workspaceRole: 'OWNER',
    });

    expect(
      screen.getByRole('heading', { name: 'Access unavailable' }),
    ).toBeInTheDocument();
  });

  it.each([
    'CLUB_ADMIN',
    'CHAIRMAN',
    'TREASURER',
    'TEAM_MANAGER',
    'CUSTOM',
    'CUSTOM_ADMIN',
  ])(
    'allows %s through the canonical shared Club guard',
    (workspaceRole) => {
      setAuthenticatedAccess([
        clubEntitlement(
          `club-${workspaceRole.toLowerCase()}`,
          7,
          workspaceRole,
        ),
      ]);

      renderGuard('/dashboard/club-admin', {
        dashboard: 'CLUB_ADMIN',
        scopeType: 'CLUB',
      });

      expect(
        screen.getByRole('heading', {
          name: 'Protected dashboard',
        }),
      ).toBeInTheDocument();
    },
  );

  it('allows Club Ticketing through its canonical shared-shell guard', () => {
    setAuthenticatedAccess([
      clubEntitlement(
        'club-ticketing-7',
        7,
        'TICKETING_OFFICER',
        'TICKETING_OFFICER',
      ),
    ]);

    renderGuard('/dashboard/ticketing-officer', {
      dashboard: 'TICKETING_OFFICER',
      workspaceRole: 'TICKETING_OFFICER',
      scopeType: 'CLUB',
    });

    expect(
      screen.getByRole('heading', {
        name: 'Protected dashboard',
      }),
    ).toBeInTheDocument();
  });

  it.each([
    { scope_type: 'LEAGUE' },
    { scope_id: null },
    { route: '/club-admin/chairman' },
  ])('fails closed for an invalid Club entitlement: %j', (overrides) => {
    setAuthenticatedAccess([
      {
        ...clubEntitlement('club-chairman-7', 7, 'CHAIRMAN'),
        ...overrides,
      },
    ]);

    renderGuard('/dashboard/club-admin', {
      dashboard: 'CLUB_ADMIN',
      scopeType: 'CLUB',
    });

    expect(
      screen.getByRole('heading', {
        name: 'Access unavailable',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: 'Fan default',
      }),
    ).not.toBeInTheDocument();
  });

  it('requires an explicit selection when multiple Club scopes exist', () => {
    setAuthenticatedAccess([
      clubEntitlement('club-treasurer-7', 7, 'TREASURER'),
      clubEntitlement('club-team-manager-11', 11, 'TEAM_MANAGER'),
    ]);

    renderGuard('/dashboard/club-admin', {
      dashboard: 'CLUB_ADMIN',
      scopeType: 'CLUB',
    });

    expect(
      screen.getByRole('heading', {
        name: /select a club workspace/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: 'Protected dashboard',
      }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: /team manager.*club 11/i,
      }),
    );

    expect(
      useClubWorkspaceStore.getState().selectedEntitlementId,
    ).toBe('club-team-manager-11');
    expect(
      screen.getByRole('heading', {
        name: 'Protected dashboard',
      }),
    ).toBeInTheDocument();
  });

  it('fails closed for an invalid selected Club entitlement', () => {
    setAuthenticatedAccess([
      clubEntitlement('club-treasurer-7', 7, 'TREASURER'),
      clubEntitlement('club-team-manager-11', 11, 'TEAM_MANAGER'),
    ]);
    useClubWorkspaceStore.setState({
      selectedEntitlementId: 'club-missing',
    });

    renderGuard('/dashboard/club-admin', {
      dashboard: 'CLUB_ADMIN',
      scopeType: 'CLUB',
    });

    expect(
      screen.getByRole('heading', {
        name: 'Access unavailable',
      }),
    ).toBeInTheDocument();
  });

  it('fails closed when a legacy alias role does not match the active entitlement', () => {
    setAuthenticatedAccess([
      clubEntitlement('club-treasurer-7', 7, 'TREASURER'),
    ]);

    renderGuard('/club-admin/chairman', {
      dashboard: 'CLUB_ADMIN',
      workspaceRole: 'CHAIRMAN',
      scopeType: 'CLUB',
    });

    expect(
      screen.getByRole('heading', {
        name: 'Access unavailable',
      }),
    ).toBeInTheDocument();
  });
});
