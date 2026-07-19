import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from './useAuth.js'
import { useAuthStore } from '../store/authStore.js'

const authMocks = vi.hoisted(() => ({
  login: vi.fn(),
  googleLogin: vi.fn(),
}))

vi.mock('../services/authService.js', () => ({
  login: authMocks.login,
  googleLogin: authMocks.googleLogin,
}))

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    requiresEmailVerification: false,
    accessStatus: 'unauthenticated',
  })
})

describe('useAuth', () => {
  it('logs in a user and hydrates the auth store', async () => {
    authMocks.login.mockResolvedValueOnce({
      data: {
        user: {
          id: 14,
          email: 'fan@example.com',
          dashboard_access: {
            version: 1,
            default_entitlement_id: 'fan',
            entitlements: [
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
        access: 'access-token',
        refresh: 'refresh-token',
        requires_email_verification: false,
      },
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login({ email: 'fan@example.com', password: 'Secret123!' })
    })

    expect(authMocks.login).toHaveBeenCalledWith({
      email: 'fan@example.com',
      password: 'Secret123!',
    })
    expect(useAuthStore.getState()).toMatchObject({
      user: { id: 14, email: 'fan@example.com' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requiresEmailVerification: false,
      accessStatus: 'ready',
    })
  })

  it('uses the same authenticated response handling for Google login', async () => {
    authMocks.googleLogin.mockResolvedValueOnce({
      data: {
        user: {
          id: 22,
          email: 'sponsor@example.com',
          dashboard_access: {
            version: 1,
            default_entitlement_id: 'sponsor',
            entitlements: [
              {
                id: 'sponsor',
                dashboard: 'SPONSOR',
                route: '/dashboard/sponsor',
                scope_type: 'ACCOUNT',
                scope_id: 22,
                workspace_role: 'OWNER',
                permissions: ['sponsor.dashboard.view'],
              },
            ],
          },
        },
        access: 'google-access',
        refresh: 'google-refresh',
        requires_email_verification: false,
      },
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.googleLogin({ token: 'credential' })
    })

    expect(authMocks.googleLogin).toHaveBeenCalledWith({ token: 'credential' })
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'google-access',
      refreshToken: 'google-refresh',
      accessStatus: 'ready',
      user: {
        email: 'sponsor@example.com',
        dashboard_access: {
          default_entitlement_id: 'sponsor',
        },
      },
    })
  })

  it('logs a user out by clearing the auth store', () => {
    const { result } = renderHook(() => useAuth())

    useAuthStore.getState().setAuth({
      user: { id: 14 },
      access: 'access-token',
      refresh: 'refresh-token',
      requiresEmailVerification: true,
    })

    act(() => {
      result.current.logout()
    })

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      accessToken: null,
      refreshToken: null,
      requiresEmailVerification: false,
      accessStatus: 'unauthenticated',
    })
  })
})
