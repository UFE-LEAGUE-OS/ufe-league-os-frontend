import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import type { AuthFlowState } from '../../utils/authFlow';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { becomeSponsor } from '../../services/sponsorshipService';
import { fetchCurrentUser, updateProfile } from '../../services/authService.js';
import { useAuthStore } from '../../store/authStore';
import CorporateSponsorReview from './CorporateSponsorReview';

vi.mock(
  '../../services/sponsorshipService',
  async () => {
    const actual = await vi.importActual<
      typeof import('../../services/sponsorshipService')
    >('../../services/sponsorshipService');

    return {
      ...actual,
      becomeSponsor: vi.fn(),
    };
  },
);

vi.mock(
  '../../services/authService.js',
  async () => {
    const actual = await vi.importActual<
      typeof import('../../services/authService.js')
    >('../../services/authService.js');

    return {
      ...actual,
      fetchCurrentUser: vi.fn(),
      updateProfile: vi.fn(),
    };
  },
);

const sponsorUser = {
  id: 21,
  email: 'corp@example.com',
  is_sponsor: true,
  sponsor_type: 'CORPORATE',
  dashboard_access: {
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
    ],
  },
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/sponsor/corporatesetup/review']}>
      <Routes>
        <Route path="/sponsor/corporatesetup/review" element={<CorporateSponsorReview />} />
        <Route path="/sponsor/corporatesetup/complete" element={<div>Complete Page</div>} />
        <Route path="/login" element={<LoginSentinel />} />
      </Routes>
    </MemoryRouter>,
  );
}

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

describe('CorporateSponsorReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 21, email: 'corp@example.com' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requiresEmailVerification: false,
      accessStatus: 'ready',
    });
    vi.mocked(updateProfile).mockResolvedValue({ data: {} } as never);
  });

  it('refreshes the authenticated user with the new sponsor entitlement after submitting', async () => {
    vi.mocked(becomeSponsor).mockResolvedValue({ data: {} } as never);
    vi.mocked(fetchCurrentUser).mockResolvedValue({ data: sponsorUser } as never);

    renderPage();

    fireEvent.click(screen.getByLabelText(/I confirm that all information provided is accurate/i));
    fireEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(fetchCurrentUser).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(useAuthStore.getState().user).toEqual(sponsorUser);
    });

    expect(await screen.findByText('Complete Page')).toBeInTheDocument();
  });

  it('still navigates to the complete page if refreshing the user fails', async () => {
    vi.mocked(becomeSponsor).mockResolvedValue({ data: {} } as never);
    vi.mocked(fetchCurrentUser).mockRejectedValue(new Error('network error'));

    renderPage();

    fireEvent.click(screen.getByLabelText(/I confirm that all information provided is accurate/i));
    fireEvent.click(screen.getByText('Submit Application'));

    expect(await screen.findByText('Complete Page')).toBeInTheDocument();
  });

  it('swaps the submit button for a dashboard login link when an account already exists', async () => {
    vi.mocked(becomeSponsor).mockRejectedValue({
      response: {
        data: { non_field_errors: ['You already have a corporate sponsor account.'] },
      },
    });

    renderPage();

    fireEvent.click(screen.getByLabelText(/I confirm that all information provided is accurate/i));
    fireEvent.click(screen.getByText('Submit Application'));

    const dashboardButton = await screen.findByText('Log In to Your Dashboard');
    expect(screen.queryByText('Submit Application')).not.toBeInTheDocument();

    fireEvent.click(dashboardButton);

    expect(await screen.findByText('Login Page')).toBeInTheDocument();
    expect(
      screen.getByText('postLoginRedirect: /sponsor/dashboard'),
    ).toBeInTheDocument();
  });
});
