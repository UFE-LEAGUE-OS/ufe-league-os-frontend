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
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import type { AuthFlowState } from '../../utils/authFlow';
import { useAuthStore } from '../../store/authStore';
import SponsorshipHub from './SponsorshipHub';

function LoginSentinel() {
  const location = useLocation();
  const state = location.state as AuthFlowState | null;

  return (
    <div>
      Login Page
      <span>postLoginRedirect: {state?.postLoginRedirect ?? 'none'}</span>
    </div>
  );
}

function renderHub() {
  return render(
    <MemoryRouter initialEntries={['/sponsorhub']}>
      <Routes>
        <Route path="/sponsorhub" element={<SponsorshipHub />} />
        <Route path="/login" element={<LoginSentinel />} />
        <Route path="/sponsor/dashboard" element={<div>Sponsor Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SponsorshipHub', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      requiresEmailVerification: false,
      accessStatus: 'unauthenticated',
    });
  });

  it('is reachable by logged-out users and shows the public hub content', () => {
    renderHub();

    expect(screen.getByText('Sponsorship Hub')).toBeInTheDocument();
    expect(screen.getByText('Corporate Sponsor')).toBeInTheDocument();
    expect(screen.getByText('Individual Sponsor')).toBeInTheDocument();
  });

  it('lists package tiers without exposing any pricing', () => {
    renderHub();

    expect(screen.getByText('Sponsorship Packages')).toBeInTheDocument();
    expect(screen.getByText('Visibility')).toBeInTheDocument();
    expect(screen.getByText('Fan Engagement')).toBeInTheDocument();
    expect(
      screen.getByText('Pricing is available to signed-in sponsors.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/UGX/)).not.toBeInTheDocument();
  });

  it('sends the Login button to /login with a sponsor dashboard redirect', () => {
    renderHub();

    fireEvent.click(screen.getByText('Log In to Your Dashboard'));

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(
      screen.getByText('postLoginRedirect: /sponsor/dashboard'),
    ).toBeInTheDocument();
  });

  it('sends the packages Sign In CTA to /login with a sponsor dashboard redirect', () => {
    renderHub();

    fireEvent.click(screen.getByText('Sign In'));

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(
      screen.getByText('postLoginRedirect: /sponsor/dashboard'),
    ).toBeInTheDocument();
  });

  it('redirects an already-authenticated sponsor with a granted entitlement straight to their dashboard', () => {
    useAuthStore.setState({
      accessToken: 'token-123',
      user: {
        id: 1,
        is_sponsor: true,
        dashboard_access: {
          version: 1,
          default_entitlement_id: 'sponsor',
          entitlements: [
            {
              id: 'sponsor',
              dashboard: 'SPONSOR',
              route: '/sponsor/dashboard',
              scope_type: null,
              scope_id: null,
              workspace_role: null,
              permissions: [],
            },
          ],
        },
      } as never,
    });

    renderHub();

    expect(screen.getByText('Sponsor Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Sponsorship Hub')).not.toBeInTheDocument();
  });

  it('does not bounce a pending sponsor without a granted entitlement back and forth', () => {
    // is_sponsor is true (they've applied) but no SPONSOR dashboard entitlement
    // has been granted yet (e.g. pending approval) — the old is_sponsor-only
    // check used to force-navigate to /sponsor/dashboard here, which would
    // immediately bounce them back out since that route requires the real
    // entitlement, creating a redirect loop back to wherever they came from.
    useAuthStore.setState({
      accessToken: 'token-123',
      user: {
        id: 1,
        is_sponsor: true,
        dashboard_access: {
          version: 1,
          default_entitlement_id: 'fan',
          entitlements: [
            {
              id: 'fan',
              dashboard: 'FAN',
              route: '/dashboard/fan',
              scope_type: null,
              scope_id: null,
              workspace_role: null,
              permissions: [],
            },
          ],
        },
      } as never,
    });

    renderHub();

    expect(screen.getByText('Sponsorship Hub')).toBeInTheDocument();
    expect(screen.queryByText('Sponsor Dashboard')).not.toBeInTheDocument();
  });
});
