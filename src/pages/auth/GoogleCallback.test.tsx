import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import GoogleCallback from './GoogleCallback'
import { useAuthStore } from '../../store/authStore.js'

const navigateMock = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

beforeEach(() => {
  navigateMock.mockReset()
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    requiresEmailVerification: false,
  })
  localStorage.clear()
})

function renderGoogleCallback() {
  return render(
    <MemoryRouter>
      <GoogleCallback />
    </MemoryRouter>,
  )
}

describe('GoogleCallback page', () => {
  it('stores returning OAuth tokens and routes to the dashboard', async () => {
    const user = { id: 7, email: 'fan@example.com' }
    window.history.replaceState(
      {},
      '',
      `/google-callback#access=access-123&refresh=refresh-456&requires_email_verification=false&is_new_user=false&user=${encodeURIComponent(JSON.stringify(user))}`,
    )

    renderGoogleCallback()

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/dashboard', { replace: true })
    })

    expect(localStorage.getItem('league_os_access_token')).toBe('access-123')
    expect(localStorage.getItem('league_os_refresh_token')).toBe('refresh-456')
    expect(useAuthStore.getState()).toMatchObject({
      user,
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
      requiresEmailVerification: false,
    })
  })

  it('routes new OAuth users to personalization', async () => {
    const user = { id: 8, email: 'newfan@example.com' }
    window.history.replaceState(
      {},
      '',
      `/google-callback#access=access-123&refresh=refresh-456&requires_email_verification=false&is_new_user=true&user=${encodeURIComponent(JSON.stringify(user))}`,
    )

    renderGoogleCallback()

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/personalize', { replace: true })
    })
  })

  it('routes OAuth users requiring email verification to OTP without storing tokens', async () => {
    window.history.replaceState(
      {},
      '',
      '/google-callback#requires_email_verification=true&email=fan%40example.com',
    )

    renderGoogleCallback()

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/verify-email', {
        replace: true,
        state: {
          email: 'fan@example.com',
          message: 'Please verify your email address before continuing.',
        },
      })
    })

    expect(localStorage.getItem('league_os_access_token')).toBeNull()
  })

  it('shows an error when the callback hash is incomplete', async () => {
    window.history.replaceState({}, '', '/google-callback#state=missing-access')

    renderGoogleCallback()

    expect(
      await screen.findByText(/google sign-in could not be completed/i),
    ).toBeInTheDocument()
  })
})
