import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '../../store/authStore';
import UserSidebar from './UserSidebar';

const fanAccess = {
  version: 1 as const,
  default_entitlement_id: 'fan',
  entitlements: [
    {
      id: 'fan',
      dashboard: 'FAN' as const,
      route: '/dashboard/fan',
      scope_type: null,
      scope_id: null,
      workspace_role: null,
      permissions: [],
    },
  ],
};

const sponsorAccess = {
  version: 1 as const,
  default_entitlement_id: 'sponsor',
  entitlements: [
    {
      id: 'sponsor',
      dashboard: 'SPONSOR' as const,
      route: '/sponsor/dashboard',
      scope_type: null,
      scope_id: null,
      workspace_role: null,
      permissions: [],
    },
    {
      id: 'fan',
      dashboard: 'FAN' as const,
      route: '/dashboard/fan',
      scope_type: null,
      scope_id: null,
      workspace_role: null,
      permissions: [],
    },
  ],
};

function renderSidebar() {
  return render(
    <MemoryRouter>
      <UserSidebar />
    </MemoryRouter>,
  );
}

describe('UserSidebar', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useAuthStore.setState({
      user: { id: 1, email: 'fan@example.com', dashboard_access: fanAccess },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requiresEmailVerification: false,
      accessStatus: 'ready',
    });
  });

  it('sends a fan without a sponsor entitlement to the sponsorship hub', () => {
    renderSidebar();

    expect(screen.getByText('Become a Sponsor').closest('a')).toHaveAttribute(
      'href',
      '/sponsorhub',
    );
  });

  it('sends a fan who already has a sponsor entitlement straight to their sponsor dashboard', () => {
    useAuthStore.setState({
      user: { id: 1, email: 'sponsor@example.com', dashboard_access: sponsorAccess },
    });

    renderSidebar();

    expect(screen.getByText('Become a Sponsor').closest('a')).toHaveAttribute(
      'href',
      '/sponsor/dashboard',
    );
  });
});
