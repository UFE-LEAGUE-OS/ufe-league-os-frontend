import { MemoryRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import Login from './Login'
import { useAuthStore } from '../../store/authStore.js'

const navigateMock = vi.hoisted(() => vi.fn())
const authMocks = vi.hoisted(() => ({
  login: vi.fn(),
  googleLogin: vi.fn(),
}))

vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  GoogleLogin: ({ onSuccess }: { onSuccess: (res: { credential?: string }) => void }) => (
    <button type="button" onClick={() => onSuccess({ credential: 'test-credential' })}>Google Login</button>
  ),
}))

vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('../../services/authService.js', () => ({
  login: authMocks.login,
  googleLogin: authMocks.googleLogin,
}))

function renderLogin(initialEntries?: { pathname: string; state?: object }[]) {
  return render(
    <GoogleOAuthProvider clientId="test-client-id">
      <MemoryRouter initialEntries={initialEntries} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Login />
      </MemoryRouter>
    </GoogleOAuthProvider>,
  )
}

function entitlement(
  id: string,
  dashboard: 'FAN' | 'SPONSOR' | 'UNION_WORKSPACE',
  route: string,
  workspaceRole: string | null = null,
) {
  return {
    id,
    dashboard,
    route,
    scope_type: dashboard === 'UNION_WORKSPACE' ? 'UNION_WORKSPACE' : 'ACCOUNT',
    scope_id: dashboard === 'UNION_WORKSPACE' ? 9 : 14,
    workspace_role: workspaceRole,
    permissions: [],
  }
}

function access(
  defaultEntitlementId: string | null,
  entitlements: ReturnType<typeof entitlement>[],
) {
  return {
    version: 1 as const,
    default_entitlement_id: defaultEntitlementId,
    entitlements,
  }
}

const fanAccess = access('fan', [
  entitlement('fan', 'FAN', '/dashboard/fan'),
])

const verifiedLoginResponse = {
  data: {
    access: 'access-token',
    refresh: 'refresh-token',
    requires_email_verification: false,
    user: {
      email: 'fan@example.com',
      role: 'FAN',
      dashboard_access: fanAccess,
    },
  },
}

const verificationRequiredResponse = {
  data: {
    access: 'access-token',
    refresh: 'refresh-token',
    requires_email_verification: true,
    user: {
      email: 'fan@example.com',
      role: 'FAN',
      dashboard_access: fanAccess,
    },
  },
}

describe('Login page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    authMocks.login.mockReset()
    authMocks.googleLogin.mockReset()
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      requiresEmailVerification: false,
      accessStatus: 'unauthenticated',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks();
  })

  it('renders the sign-in form and toggles password visibility', async () => {
    const user = userEvent.setup()

    renderLogin()

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter phone number, email, or username')).toBeInTheDocument()

    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const toggleButton = screen.getByRole('button', { name: /show password/i })

    expect(passwordInput).toHaveAttribute('type', 'password')
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()
  })

  it('shows a success message passed from email verification', () => {
    renderLogin([{ pathname: '/login', state: { message: 'Your email has been verified. You can now sign in.' } }])

    expect(screen.getByRole('status')).toHaveTextContent(/email has been verified/i)
  })

  it('redirects users who still need email verification to the OTP page', async () => {
    const user = userEvent.setup()

    authMocks.login.mockResolvedValueOnce(verificationRequiredResponse)

    renderLogin([{ pathname: '/login', state: { postLoginRedirect: '/profile' } }])

    await user.type(screen.getByPlaceholderText('Enter phone number, email, or username'), 'fan@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'StrongPassword123')
    await user.click(screen.getByRole('button', { name: /^log in$/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/verify-email', {
        replace: true,
        state: {
          email: 'fan@example.com',
          message: 'Please verify your email address before continuing.',
          postLoginRedirect: '/profile',
        },
      })
    })
  })

  it('redirects backend verification-required errors to the OTP page', async () => {
    const user = userEvent.setup()

    authMocks.login.mockRejectedValueOnce({
      response: {
        data: {
          requires_email_verification: true,
          detail: 'Email verification required.',
        },
      },
    })

    renderLogin()

    await user.type(screen.getByPlaceholderText('Enter phone number, email, or username'), 'fan@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'StrongPassword123')
    await user.click(screen.getByRole('button', { name: /^log in$/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/verify-email', {
        replace: true,
        state: {
          email: 'fan@example.com',
          message: 'Please verify your email address before continuing.',
          postLoginRedirect: '/dashboard',
        },
      })
    })
  })

  it('does not submit or redirect when the login form is empty', async () => {
    const user = userEvent.setup()

    renderLogin()

    await user.click(screen.getByRole('button', { name: /^log in$/i }))

    expect(authMocks.login).not.toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
    expect(screen.getByText(/phone number, email, or username is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })

  it('shows backend errors and does not redirect for invalid credentials', async () => {
    const user = userEvent.setup()

    authMocks.login.mockRejectedValueOnce({
      response: {
        data: {
          detail: 'No active account found with the given credentials.',
        },
      },
    })

    renderLogin()

    await user.type(screen.getByPlaceholderText('Enter phone number, email, or username'), 'wrong@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'WrongPassword123')
    await user.click(screen.getByRole('button', { name: /^log in$/i }))

    expect(authMocks.login).toHaveBeenCalledWith({
      identifier: 'wrong@example.com',
      password: 'WrongPassword123',
    })
    expect(await screen.findByRole('alert')).toHaveTextContent(/no active account/i)
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('submits valid credentials and redirects to the explicit backend default', async () => {
    const user = userEvent.setup()

    authMocks.login.mockResolvedValueOnce(verifiedLoginResponse)

    renderLogin()

    await user.type(screen.getByPlaceholderText('Enter phone number, email, or username'), 'fan@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'StrongPassword123')
    await user.click(screen.getByRole('button', { name: /^log in$/i }))

    expect(authMocks.login).toHaveBeenCalledWith({
      identifier: 'fan@example.com',
      password: 'StrongPassword123',
    })

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/dashboard/fan', { replace: true })
    })
  })

  it('routes an operational user from the Union entitlement, not legacy roles', async () => {
    const user = userEvent.setup()

    authMocks.login.mockResolvedValueOnce({
      data: {
        access: 'access-token',
        refresh: 'refresh-token',
        requires_email_verification: false,
        user: {
          email: 'uru.owner@leagueos.test',
          role: 'FAN',
          roles: ['FAN', 'UNION_ADMIN'],
          dashboard_access: access('union-workspace-9', [
            entitlement(
              'union-workspace-9',
              'UNION_WORKSPACE',
              '/dashboard/union-admin',
              'OWNER',
            ),
          ]),
        },
      },
    })

    renderLogin()

    await user.type(
      screen.getByPlaceholderText('Enter phone number, email, or username'),
      'uru.owner@leagueos.test',
    )
    await user.type(
      screen.getByPlaceholderText('Enter your password'),
      'StrongPassword123',
    )
    await user.click(
      screen.getByRole('button', { name: /^log in$/i }),
    )

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(
        '/dashboard/union-admin',
        { replace: true },
      )
    })
  })

  it('returns verified users to their requested protected page', async () => {
    const user = userEvent.setup()

    authMocks.login.mockResolvedValueOnce(verifiedLoginResponse)

    renderLogin([{ pathname: '/login', state: { postLoginRedirect: '/memberships' } }])

    await user.type(screen.getByPlaceholderText('Enter phone number, email, or username'), 'fan@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'StrongPassword123')
    await user.click(screen.getByRole('button', { name: /^log in$/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/memberships', { replace: true })
    })
  })

  it('rejects a saved Fan redirect for an operational user', async () => {
    const user = userEvent.setup()

    authMocks.login.mockResolvedValueOnce({
      data: {
        access: 'access-token',
        refresh: 'refresh-token',
        requires_email_verification: false,
        user: {
          email: 'official@example.com',
          dashboard_access: access('union-workspace-9', [
            entitlement(
              'union-workspace-9',
              'UNION_WORKSPACE',
              '/dashboard/union-admin',
              'MATCH_OFFICIAL',
            ),
          ]),
        },
      },
    })

    renderLogin([{
      pathname: '/login',
      state: { postLoginRedirect: '/dashboard/fan' },
    }])

    await user.type(
      screen.getByPlaceholderText('Enter phone number, email, or username'),
      'official@example.com',
    )
    await user.type(
      screen.getByPlaceholderText('Enter your password'),
      'StrongPassword123',
    )
    await user.click(screen.getByRole('button', { name: /^log in$/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(
        '/dashboard/union-admin',
        { replace: true },
      )
    })
  })

  it('rejects a saved Union redirect for a Fan', async () => {
    const user = userEvent.setup()

    authMocks.login.mockResolvedValueOnce(verifiedLoginResponse)
    renderLogin([{
      pathname: '/login',
      state: { postLoginRedirect: '/dashboard/union-admin' },
    }])

    await user.type(
      screen.getByPlaceholderText('Enter phone number, email, or username'),
      'fan@example.com',
    )
    await user.type(
      screen.getByPlaceholderText('Enter your password'),
      'StrongPassword123',
    )
    await user.click(screen.getByRole('button', { name: /^log in$/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/dashboard/fan', {
        replace: true,
      })
    })
  })

  it('fails closed when the authenticated response has no usable access', async () => {
    const user = userEvent.setup()

    authMocks.login.mockResolvedValueOnce({
      data: {
        access: 'access-token',
        refresh: 'refresh-token',
        requires_email_verification: false,
        user: {
          email: 'unscoped@example.com',
          role: 'LEAGUE_ADMIN',
          dashboard_access: access(null, []),
        },
      },
    })

    renderLogin()
    await user.type(
      screen.getByPlaceholderText('Enter phone number, email, or username'),
      'unscoped@example.com',
    )
    await user.type(
      screen.getByPlaceholderText('Enter your password'),
      'StrongPassword123',
    )
    await user.click(screen.getByRole('button', { name: /^log in$/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(
        '/account/access-unavailable',
        { replace: true },
      )
    })
  })

  it('handles Google Sign-In success and navigation for a new user', async () => {
    const user = userEvent.setup()
    authMocks.googleLogin.mockResolvedValueOnce({
      data: {
        access: 'google-access-token',
        refresh: 'google-refresh-token',
        requires_email_verification: false,
        is_new_user: true,
        user: {
          email: 'new.google.user@example.com',
          dashboard_access: fanAccess,
        },
      },
    })

    renderLogin()

    await user.click(screen.getByRole('button', { name: /google login/i }));

    await waitFor(() => {
      expect(authMocks.googleLogin).toHaveBeenCalledWith({
        token: 'test-credential',
      });
    });
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/personalize', { replace: true })
    })
  })

  it('stores returning Google auth and uses the explicit Sponsor default', async () => {
    const user = userEvent.setup()
    const sponsorAccess = access('sponsor', [
      entitlement('sponsor', 'SPONSOR', '/dashboard/sponsor', 'OWNER'),
      entitlement('fan', 'FAN', '/dashboard/fan'),
    ])

    authMocks.googleLogin.mockResolvedValueOnce({
      data: {
        access: 'google-access-token',
        refresh: 'google-refresh-token',
        requires_email_verification: false,
        is_new_user: false,
        user: {
          email: 'sponsor@example.com',
          dashboard_access: sponsorAccess,
        },
      },
    })

    renderLogin()
    await user.click(screen.getByRole('button', { name: /google login/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/dashboard/sponsor', {
        replace: true,
      })
    })
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'google-access-token',
      refreshToken: 'google-refresh-token',
      user: {
        email: 'sponsor@example.com',
        dashboard_access: sponsorAccess,
      },
    })
  })

  it('shows an error message when Google Sign-In fails', async () => {
    const user = userEvent.setup()
    authMocks.googleLogin.mockRejectedValueOnce({
      response: { data: { detail: 'Invalid Google token.' } },
    })

    renderLogin()

    await user.click(screen.getByRole('button', { name: /google login/i }))

    await waitFor(() => {
      expect(authMocks.googleLogin).toHaveBeenCalledWith({
        token: 'test-credential',
      })
    })

    expect(await screen.findByText(/invalid google token/i)).toBeInTheDocument()
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
