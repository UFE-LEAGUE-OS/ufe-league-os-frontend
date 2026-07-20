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

  it('redirects an already-authenticated sponsor straight to their dashboard', () => {
    useAuthStore.setState({
      accessToken: 'token-123',
      user: {
        id: 1,
        is_sponsor: true,
      } as never,
    });

    renderHub();

    expect(screen.getByText('Sponsor Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Sponsorship Hub')).not.toBeInTheDocument();
  });
});
