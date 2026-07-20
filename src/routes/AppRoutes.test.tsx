import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AppRoutes from './AppRoutes';
import { useAuthStore } from '../store/authStore';
import { useClubWorkspaceStore } from '../store/clubWorkspaceStore';
import type {
  DashboardEntitlement,
  DashboardIdentifier,
} from '../types/dashboardAccess';

vi.mock('../pages', () => ({
  Landing: () => <h1>Landing Page</h1>,
  Login: () => <h1>Login Page</h1>,
  GoogleCallback: () => <h1>Google Callback Page</h1>,
  ForgotPassword: () => <h1>Forgot Password Page</h1>,
  Register: () => <h1>Register Page</h1>,
  VerifyEmail: () => <h1>Verify Email Page</h1>,
  Dashboard: () => <h1>Fan Dashboard</h1>,
  Profile: () => <h1>Profile Page</h1>,
  Competitions: () => <h1>Competitions Page</h1>,
  Fixtures: () => <h1>Fixtures Page</h1>,
  Results: () => <h1>Results Page</h1>,
  Support: () => <h1>Support Page</h1>,
}));

vi.mock('../components/AuthenticatedLayout/AuthenticatedLayout', async () => {
  const { Outlet } = await vi.importActual<
    typeof import('react-router-dom')
  >('react-router-dom');

  return {
    default: () => <Outlet />,
  };
});

vi.mock('../pages/auth/Personalize', () => ({
  default: () => <h1>Personalize Page</h1>,
}));

vi.mock('../pages/landing/NewsPage', () => ({
  default: () => <h1>News Page</h1>,
}));

vi.mock('../pages/landing/TicketsLandingPage', () => ({
  default: () => <h1>Tickets Page</h1>,
}));

vi.mock('../pages/union-admin/UnionAdminDashboard', () => ({
  default: () => <h1>Union Workspace</h1>,
}));

vi.mock('../pages/league-admin/LeagueAdminDashboard', () => ({
  default: () => <h1>League Admin Dashboard</h1>,
}));

vi.mock('../pages/club-admin/ClubAdminDashboard', () => ({
  default: () => <h1>Club Admin Dashboard</h1>,
}));

vi.mock('../pages/fantasy/FantasyPage', () => ({
  default: () => <h1>Fantasy Page</h1>,
}));

vi.mock('../pages/sponsor/CorporateSponsorDashboard', () => ({
  default: () => <h1>Sponsor Dashboard</h1>,
}));

vi.mock('../pages/sponsor/SponsorPayments', () => ({
  default: () => <h1>Sponsor Payments Page</h1>,
}));

vi.mock('../pages/sponsor/SponsorPaymentProcessing', () => ({
  default: () => <h1>Sponsor Payment Processing Page</h1>,
}));

vi.mock('../pages/super-admin/SuperAdminDashboard', async () => {
  const { Outlet } = await vi.importActual<
    typeof import('react-router-dom')
  >('react-router-dom');

  return {
    default: () => (
      <>
        <h1>Super Admin Dashboard</h1>
        <Outlet />
      </>
    ),
  };
});

function makeEntitlement(
  dashboard: DashboardIdentifier,
  overrides: Partial<DashboardEntitlement> = {},
): DashboardEntitlement {
  const routes: Record<DashboardIdentifier, string> = {
    FAN: '/dashboard/fan',
    SPONSOR: '/dashboard/sponsor',
    SUPER_ADMIN: '/dashboard/super-admin',
    UNION_WORKSPACE: '/dashboard/union-admin',
    LEAGUE_ADMIN: '/dashboard/league-admin',
    CLUB_ADMIN: '/dashboard/club-admin',
    TICKETING_OFFICER: '/dashboard/ticketing-officer',
  };
  const id = `${dashboard.toLowerCase()}-1`;
  const scopeTypes: Record<DashboardIdentifier, string> = {
    FAN: 'ACCOUNT',
    SPONSOR: 'SPONSOR_ACCOUNT',
    SUPER_ADMIN: 'ACCOUNT',
    UNION_WORKSPACE: 'UNION_WORKSPACE',
    LEAGUE_ADMIN: 'LEAGUE',
    CLUB_ADMIN: 'CLUB',
    TICKETING_OFFICER: 'CLUB',
  };
  const defaultWorkspaceRole =
    dashboard === 'CLUB_ADMIN'
      ? 'CLUB_ADMIN'
      : dashboard === 'TICKETING_OFFICER'
        ? 'TICKETING_OFFICER'
        : null;

  return {
    id,
    dashboard,
    route: routes[dashboard],
    scope_type: scopeTypes[dashboard],
    scope_id: 1,
    workspace_role: defaultWorkspaceRole,
    permissions: [],
    ...overrides,
  };
}

function authenticate(
  entitlements: DashboardEntitlement[],
  defaultId = entitlements[0]?.id ?? null,
) {
  useAuthStore.getState().setAuth({
    user: {
      id: 1,
      email: 'user@example.com',
      dashboard_access: {
        version: 1,
        default_entitlement_id: defaultId,
        entitlements,
      },
    },
    access: 'access-token',
    refresh: 'refresh-token',
    requiresEmailVerification: false,
  });
}

function visit(path: string) {
  window.history.pushState({}, '', path);
  return render(<AppRoutes />);
}

describe('AppRoutes dashboard entitlements', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useAuthStore.getState().clearAuth();
    useClubWorkspaceStore.setState({
      selectedEntitlementId: null,
    });
    window.history.pushState({}, '', '/');
  });

  it('redirects logged-out users from a dashboard to login', () => {
    visit('/dashboard/fan');

    expect(
      screen.getByRole('heading', { name: /login page/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /fan dashboard/i }),
    ).not.toBeInTheDocument();
  });

  it('uses the explicit Fan default for a normal Fan', () => {
    authenticate([makeEntitlement('FAN')]);

    visit('/dashboard');

    expect(
      screen.getByRole('heading', { name: /fan dashboard/i }),
    ).toBeInTheDocument();
  });

  it('uses the Sponsor default when Sponsor and Fan are both explicit', async () => {
    const sponsor = makeEntitlement('SPONSOR');
    const fan = makeEntitlement('FAN');
    authenticate([sponsor, fan], sponsor.id);

    visit('/dashboard');

    expect(
      await screen.findByRole('heading', { name: /sponsor dashboard/i }),
    ).toBeInTheDocument();
  });

  it('routes empty authenticated access to the unavailable page', () => {
    authenticate([]);

    visit('/dashboard');

    expect(
      screen.getByRole('heading', {
        name: /your dashboard is not available yet/i,
      }),
    ).toBeInTheDocument();
  });

  it('denies the Fan dashboard to a Union operational account', async () => {
    const union = makeEntitlement('UNION_WORKSPACE', {
      workspace_role: 'OWNER',
      permissions: ['union.dashboard.view'],
    });
    authenticate([union]);

    visit('/dashboard/fan');

    expect(
      await screen.findByRole('heading', { name: /union workspace/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /fan dashboard/i }),
    ).not.toBeInTheDocument();
  });

  it('denies the Union workspace to a Fan account', () => {
    authenticate([makeEntitlement('FAN')]);

    visit('/dashboard/union-admin');

    expect(
      screen.getByRole('heading', { name: /fan dashboard/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /union workspace/i }),
    ).not.toBeInTheDocument();
  });

  it('allows Match Officials only through the restricted Union selector', () => {
    const matchOfficial = makeEntitlement('UNION_WORKSPACE', {
      workspace_role: 'MATCH_OFFICIAL',
      permissions: ['union.official.appointments.view'],
    });
    authenticate([matchOfficial]);

    visit('/dashboard/match-official');

    expect(
      screen.getByRole('heading', { name: /union workspace/i }),
    ).toBeInTheDocument();
  });

  it('allows Union Ticketing Officers into the shared Union shell', () => {
    const unionTicketing = makeEntitlement('UNION_WORKSPACE', {
      workspace_role: 'TICKETING_OFFICER',
      permissions: ['union.ticketing.scan'],
    });
    authenticate([unionTicketing]);

    visit('/dashboard/union-admin');

    expect(
      screen.getByRole('heading', { name: /union workspace/i }),
    ).toBeInTheDocument();
  });

  it.each([
    ['LEAGUE_ADMIN', '/dashboard/league-admin', /league admin dashboard/i],
    ['CLUB_ADMIN', '/dashboard/club-admin', /club admin dashboard/i],
  ] as const)(
    'allows a scoped %s entitlement through its dashboard route',
    async (dashboard, path, heading) => {
      authenticate([makeEntitlement(dashboard)]);

      visit(path);

      expect(
        await screen.findByRole('heading', { name: heading }),
      ).toBeInTheDocument();
    },
  );

  it('supports the canonical Super Admin backend route', async () => {
    authenticate([makeEntitlement('SUPER_ADMIN')]);

    visit('/dashboard/super-admin');

    expect(
      await screen.findByRole('heading', { name: /super admin dashboard/i }),
    ).toBeInTheDocument();
  });

  it('renders Club Ticketing in the shared Club Admin shell', () => {
    authenticate([
      makeEntitlement('TICKETING_OFFICER', {
        workspace_role: 'TICKETING_OFFICER',
        permissions: ['dashboard.ticketing_officer'],
      }),
    ]);

    visit('/dashboard/ticketing-officer');

    expect(
      screen.getByRole('heading', {
        name: /club admin dashboard/i,
      }),
    ).toBeInTheDocument();
  });

  it.each([
    'CHAIRMAN',
    'TREASURER',
    'TEAM_MANAGER',
    'CUSTOM',
    'CUSTOM_ADMIN',
  ])(
    'renders the %s entitlement in the canonical shared Club shell',
    (workspaceRole) => {
      authenticate([
        makeEntitlement('CLUB_ADMIN', {
          id: `club-${workspaceRole.toLowerCase()}-7`,
          scope_id: 7,
          workspace_role: workspaceRole,
        }),
      ]);

      visit('/dashboard/club-admin');

      expect(
        screen.getByRole('heading', {
          name: /club admin dashboard/i,
        }),
      ).toBeInTheDocument();
    },
  );

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
    'redirects the %s legacy alias to /dashboard/club-admin',
    (workspaceRole, path) => {
      authenticate([
        makeEntitlement('CLUB_ADMIN', {
          id: `club-${workspaceRole.toLowerCase()}-7`,
          scope_id: 7,
          workspace_role: workspaceRole,
        }),
      ]);

      visit(path);

      expect(window.location.pathname).toBe('/dashboard/club-admin');
      expect(
        screen.getByRole('heading', {
          name: /club admin dashboard/i,
        }),
      ).toBeInTheDocument();
    },
  );

  it('redirects the ticketing alias to its canonical shared-shell route', () => {
    authenticate([
      makeEntitlement('TICKETING_OFFICER', {
        id: 'club-ticketing-7',
        scope_id: 7,
        workspace_role: 'TICKETING_OFFICER',
      }),
    ]);

    visit('/club-admin/ticketing-officer');

    expect(window.location.pathname).toBe(
      '/dashboard/ticketing-officer',
    );
    expect(
      screen.getByRole('heading', {
        name: /club admin dashboard/i,
      }),
    ).toBeInTheDocument();
  });

  it('fails closed when a Club alias role does not match', () => {
    authenticate([
      makeEntitlement('CLUB_ADMIN', {
        id: 'club-treasurer-7',
        scope_id: 7,
        workspace_role: 'TREASURER',
      }),
    ]);

    visit('/club-admin/chairman');

    expect(
      screen.getByRole('heading', {
        name: /your dashboard is not available yet/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: /club admin dashboard/i,
      }),
    ).not.toBeInTheDocument();
  });

  it('fails closed for a malformed Club scope without redirecting to Fan', () => {
    authenticate([
      makeEntitlement('CLUB_ADMIN', {
        scope_type: 'LEAGUE',
        workspace_role: 'CHAIRMAN',
      }),
    ]);

    visit('/dashboard/club-admin');

    expect(
      screen.getByRole('heading', {
        name: /your dashboard is not available yet/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: /fan dashboard/i,
      }),
    ).not.toBeInTheDocument();
  });

  it('requires an explicit selection for multiple Club entitlements', () => {
    authenticate([
      makeEntitlement('CLUB_ADMIN', {
        id: 'club-treasurer-7',
        scope_id: 7,
        workspace_role: 'TREASURER',
      }),
      makeEntitlement('CLUB_ADMIN', {
        id: 'club-team-manager-11',
        scope_id: 11,
        workspace_role: 'TEAM_MANAGER',
      }),
    ]);

    visit('/dashboard/club-admin');

    expect(
      screen.getByRole('heading', {
        name: /select a club workspace/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: /club admin dashboard/i,
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
        name: /club admin dashboard/i,
      }),
    ).toBeInTheDocument();
  });

  it('keeps generic profile access separate from Fan access', () => {
    authenticate([
      makeEntitlement('UNION_WORKSPACE', {
        workspace_role: 'OWNER',
      }),
    ]);

    visit('/profile');

    expect(
      screen.getByRole('heading', { name: /profile page/i }),
    ).toBeInTheDocument();
  });

  it('rejects Fan capabilities for an operational account', () => {
    authenticate([
      makeEntitlement('UNION_WORKSPACE', {
        workspace_role: 'MATCH_OFFICIAL',
      }),
    ]);

    visit('/fantasy');

    expect(
      screen.getByRole('heading', { name: /union workspace/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /fantasy page/i }),
    ).not.toBeInTheDocument();
  });

  it('allows an explicit Fan entitlement to use Fan capabilities', () => {
    authenticate([makeEntitlement('FAN')]);

    visit('/fantasy');

    expect(
      screen.getByRole('heading', { name: /fantasy page/i }),
    ).toBeInTheDocument();
  });

  it('redirects unverified accounts before protected pages', () => {
    authenticate([makeEntitlement('FAN')]);
    useAuthStore.setState({
      requiresEmailVerification: true,
    });

    visit('/profile');

    expect(
      screen.getByRole('heading', { name: /verify email page/i }),
    ).toBeInTheDocument();
  });

  it('keeps the Sponsor callback public while access is hydrating', async () => {
    useAuthStore.setState({
      user: { id: 1 },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requiresEmailVerification: false,
      accessStatus: 'loading',
    });

    visit('/sponsor/payment/processing?status=successful&tx_ref=test-reference');

    expect(
      await screen.findByRole('heading', {
        name: /sponsor payment processing page/i,
      }),
    ).toBeInTheDocument();
  });

  it('keeps public exploration routes available without login', () => {
    visit('/fixtures');

    expect(
      screen.getByRole('heading', { name: /fixtures page/i }),
    ).toBeInTheDocument();
  });
});
