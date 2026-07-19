import { render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import DefaultDashboardRedirect from './DefaultDashboardRedirect';
import { useAuthStore } from '../store/authStore';

function renderRedirect() {
  return render(
    <MemoryRouter
      initialEntries={['/dashboard']}
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <Routes>
        <Route
          path="/dashboard"
          element={<DefaultDashboardRedirect />}
        />
        <Route
          path="/dashboard/sponsor"
          element={<h1>Sponsor dashboard</h1>}
        />
        <Route
          path="/dashboard/club-admin"
          element={<h1>Club Admin dashboard</h1>}
        />
        <Route
          path="/dashboard/ticketing-officer"
          element={<h1>Club Ticketing dashboard</h1>}
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
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    requiresEmailVerification: false,
    accessStatus: 'unauthenticated',
  });
});

describe('DefaultDashboardRedirect', () => {
  it('uses the exact route from the explicit default entitlement', () => {
    useAuthStore.setState({
      user: {
        id: 14,
        dashboard_access: {
          version: 1,
          default_entitlement_id: 'sponsor-4',
          entitlements: [
            {
              id: 'sponsor-4',
              dashboard: 'SPONSOR',
              route: '/dashboard/sponsor',
              scope_type: 'SPONSOR_ACCOUNT',
              scope_id: 4,
              workspace_role: 'OWNER',
              permissions: ['sponsor.dashboard.view'],
            },
            {
              id: 'fan',
              dashboard: 'FAN',
              route: '/dashboard/fan',
              scope_type: 'ACCOUNT',
              scope_id: 14,
              workspace_role: null,
              permissions: [],
            },
          ],
        },
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requiresEmailVerification: false,
      accessStatus: 'ready',
    });

    renderRedirect();

    expect(
      screen.getByRole('heading', { name: /sponsor dashboard/i }),
    ).toBeInTheDocument();
  });

  it('waits without redirecting while access is hydrating', () => {
    useAuthStore.setState({
      user: { id: 14 },
      accessToken: 'access-token',
      accessStatus: 'loading',
    });

    renderRedirect();

    expect(
      screen.getByRole('status'),
    ).toHaveTextContent(/restoring your dashboard access/i);
  });

  it('fails closed for empty or invalid access', () => {
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

    renderRedirect();

    expect(
      screen.getByRole('heading', { name: /access unavailable/i }),
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
    'uses the canonical Club route for a %s default entitlement',
    (workspaceRole) => {
      useAuthStore.setState({
        user: {
          id: 14,
          role: 'FAN',
          dashboard_access: {
            version: 1,
            default_entitlement_id: 'club-7',
            entitlements: [
              {
                id: 'club-7',
                dashboard: 'CLUB_ADMIN',
                route: '/dashboard/club-admin',
                scope_type: 'CLUB',
                scope_id: 7,
                workspace_role: workspaceRole,
                permissions: ['dashboard.club_admin'],
              },
            ],
          },
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        requiresEmailVerification: false,
        accessStatus: 'ready',
      });

      renderRedirect();

      expect(
        screen.getByRole('heading', {
          name: /club admin dashboard/i,
        }),
      ).toBeInTheDocument();
    },
  );

  it('uses the canonical Club Ticketing default route', () => {
    useAuthStore.setState({
      user: {
        id: 14,
        role: 'FAN',
        dashboard_access: {
          version: 1,
          default_entitlement_id: 'club-ticketing-7',
          entitlements: [
            {
              id: 'club-ticketing-7',
              dashboard: 'TICKETING_OFFICER',
              route: '/dashboard/ticketing-officer',
              scope_type: 'CLUB',
              scope_id: 7,
              workspace_role: 'TICKETING_OFFICER',
              permissions: ['dashboard.ticketing_officer'],
            },
          ],
        },
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requiresEmailVerification: false,
      accessStatus: 'ready',
    });

    renderRedirect();

    expect(
      screen.getByRole('heading', {
        name: /club ticketing dashboard/i,
      }),
    ).toBeInTheDocument();
  });
});
