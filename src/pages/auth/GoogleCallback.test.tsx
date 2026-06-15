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

describe('GoogleCallback page', () => {
  it('stores the OAuth tokens and routes to the dashboard', async () => {
    const user = { id: 7, email: 'fan@example.com' }
    window.history.replaceState(
      {},
      '',
      `/google-callback#access=access-123&refresh=refresh-456&requires_email_verification=true&user=${encodeURIComponent(JSON.stringify(user))}`,
    )

    render(<GoogleCallback />)

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/dashboard', { replace: true })
    })

    expect(localStorage.getItem('access_token')).toBe('access-123')
    expect(localStorage.getItem('refresh_token')).toBe('refresh-456')
    expect(useAuthStore.getState()).toMatchObject({
      user,
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
      requiresEmailVerification: true,
    })
  })

  it('shows an error when the callback hash is incomplete', async () => {
    window.history.replaceState({}, '', '/google-callback#state=missing-access')

    render(<GoogleCallback />)

    expect(
      await screen.findByText(/google sign-in could not be completed/i),
    ).toBeInTheDocument()
  })
})
