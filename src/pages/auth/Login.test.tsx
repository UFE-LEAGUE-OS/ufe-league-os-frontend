import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Login from './Login'
import { useAuthStore } from '../../store/authStore.js'

const navigateMock = vi.hoisted(() => vi.fn())
const loginMock = vi.hoisted(() => vi.fn())

vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  GoogleLogin: ({ onSuccess }: { onSuccess?: (response: { credential?: string }) => void }) => (
    <button type="button" onClick={() => onSuccess?.({ credential: 'test-credential' })}>
      Google Login
    </button>
  ),
}))

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('../../services/authService.js', () => ({
  login: loginMock,
}))

function renderLogin(initialEntries?: { pathname: string; state?: object }[]) {
  return render(
    <GoogleOAuthProvider clientId="test-client-id">
      <MemoryRouter initialEntries={initialEntries}>
        <Login />
      </MemoryRouter>
    </GoogleOAuthProvider>,
  )
}

describe('Login page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    loginMock.mockReset()
    vi.mocked(axios.post).mockReset()
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      requiresEmailVerification: false,
    })
  })

  it('renders the sign-in form and toggles password visibility', async () => {
    const user = userEvent.setup()

    renderLogin()

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter phone number or email')).toBeInTheDocument()

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

    loginMock.mockResolvedValueOnce({
      access: 'access-token',
      refresh: 'refresh-token',
      requires_email_verification: true,
      user: {
        email: 'fan@example.com',
        role: 'FAN',
        frontend_dashboard_route: '/dashboard/fan',
      },
    })

    renderLogin([{ pathname: '/login', state: { postLoginRedirect: '/profile' } }])

    await user.type(screen.getByPlaceholderText('Enter phone number or email'), 'fan@example.com')
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

    loginMock.mockRejectedValueOnce({
      response: {
        data: {
          requires_email_verification: true,
          detail: 'Email verification required.',
        },
      },
    })

    renderLogin()

    await user.type(screen.getByPlaceholderText('Enter phone number or email'), 'fan@example.com')
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

    expect(loginMock).not.toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
    expect(screen.getByText(/phone number or email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })

  it('shows backend errors and does not redirect for invalid credentials', async () => {
    const user = userEvent.setup()

    loginMock.mockRejectedValueOnce({
      response: {
        data: {
          detail: 'No active account found with the given credentials.',
        },
      },
    })

    renderLogin()

    await user.type(screen.getByPlaceholderText('Enter phone number or email'), 'wrong@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'WrongPassword123')
    await user.click(screen.getByRole('button', { name: /^log in$/i }))

    expect(loginMock).toHaveBeenCalledWith({
      identifier: 'wrong@example.com',
      password: 'WrongPassword123',
    })
    expect(await screen.findByRole('alert')).toHaveTextContent(/no active account/i)
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('submits valid credentials and redirects to the backend dashboard route', async () => {
    const user = userEvent.setup()

    loginMock.mockResolvedValueOnce({
      access: 'access-token',
      refresh: 'refresh-token',
      requires_email_verification: false,
      user: {
        email: 'fan@example.com',
        role: 'FAN',
        frontend_dashboard_route: '/dashboard/fan',
      },
    })

    renderLogin()

    await user.type(screen.getByPlaceholderText('Enter phone number or email'), 'fan@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'StrongPassword123')
    await user.click(screen.getByRole('button', { name: /^log in$/i }))

    expect(loginMock).toHaveBeenCalledWith({
      identifier: 'fan@example.com',
      password: 'StrongPassword123',
    })
    expect(navigateMock).toHaveBeenCalledWith('/dashboard/fan', { replace: true })
  })

  it('returns verified users to their requested protected page', async () => {
    const user = userEvent.setup()

    loginMock.mockResolvedValueOnce({
      access: 'access-token',
      refresh: 'refresh-token',
      requires_email_verification: false,
      user: {
        email: 'fan@example.com',
        role: 'FAN',
        frontend_dashboard_route: '/dashboard/fan',
      },
    })

    renderLogin([{ pathname: '/login', state: { postLoginRedirect: '/memberships' } }])

    await user.type(screen.getByPlaceholderText('Enter phone number or email'), 'fan@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'StrongPassword123')
    await user.click(screen.getByRole('button', { name: /^log in$/i }))

    expect(navigateMock).toHaveBeenCalledWith('/memberships', { replace: true })
  })
})