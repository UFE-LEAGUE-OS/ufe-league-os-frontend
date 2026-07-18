import { render, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '../store/authStore.js';
import AuthSessionHydrator from './AuthSessionHydrator';

const fetchCurrentUserMock = vi.hoisted(() => vi.fn());

vi.mock('../services/authService.js', () => ({
  fetchCurrentUser: fetchCurrentUserMock,
}));

const fanUser = {
  id: 14,
  email: 'fan@example.com',
  dashboard_access: {
    version: 1 as const,
    default_entitlement_id: 'fan',
    entitlements: [
      {
        id: 'fan',
        dashboard: 'FAN' as const,
        route: '/dashboard/fan',
        scope_type: 'ACCOUNT',
        scope_id: 14,
        workspace_role: null,
        permissions: [],
      },
    ],
  },
};

beforeEach(() => {
  fetchCurrentUserMock.mockReset();
  localStorage.clear();
  sessionStorage.clear();
  useAuthStore.setState({
    user: { id: 14 },
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    requiresEmailVerification: false,
    accessStatus: 'loading',
  });
});

describe('AuthSessionHydrator', () => {
  it('refreshes stale stored access once and persists the validated user', async () => {
    fetchCurrentUserMock.mockResolvedValueOnce({ data: fanUser });

    render(
      <StrictMode>
        <AuthSessionHydrator />
      </StrictMode>,
    );

    await waitFor(() => {
      expect(useAuthStore.getState().accessStatus).toBe('ready');
    });

    expect(fetchCurrentUserMock).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user).toEqual(fanUser);
    expect(localStorage.getItem('league_os_auth_user')).toContain(
      '"default_entitlement_id":"fan"',
    );
  });

  it('marks malformed refreshed access unavailable without retrying', async () => {
    fetchCurrentUserMock.mockResolvedValueOnce({
      data: {
        id: 14,
        dashboard_access: {
          version: 2,
          default_entitlement_id: 'fan',
          entitlements: [],
        },
      },
    });

    const { rerender } = render(<AuthSessionHydrator />);

    await waitFor(() => {
      expect(useAuthStore.getState().accessStatus).toBe('unavailable');
    });

    rerender(<AuthSessionHydrator />);
    expect(fetchCurrentUserMock).toHaveBeenCalledTimes(1);
  });

  it('clears authentication after a rejected authenticated session', async () => {
    fetchCurrentUserMock.mockRejectedValueOnce({
      response: { status: 401 },
    });

    render(<AuthSessionHydrator />);

    await waitFor(() => {
      expect(useAuthStore.getState().accessStatus).toBe('unauthenticated');
    });

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('does not call the backend for an already validated session', () => {
    useAuthStore.setState({
      user: fanUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requiresEmailVerification: false,
      accessStatus: 'ready',
    });

    render(<AuthSessionHydrator />);

    expect(fetchCurrentUserMock).not.toHaveBeenCalled();
  });
});
