import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from './useAuth.js'
import { useAuthStore } from '../store/authStore.js'

const loginMock = vi.hoisted(() => vi.fn())

vi.mock('../services/authService.js', () => ({
  login: loginMock,
}))

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    requiresEmailVerification: false,
  })
})

describe('useAuth', () => {
  it('logs in a user and hydrates the auth store', async () => {
    loginMock.mockResolvedValueOnce({
      data: {
        user: { id: 14, email: 'fan@example.com' },
        access: 'access-token',
        refresh: 'refresh-token',
        requires_email_verification: false,
      },
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login({ email: 'fan@example.com', password: 'Secret123!' })
    })

    expect(loginMock).toHaveBeenCalledWith({
      email: 'fan@example.com',
      password: 'Secret123!',
    })
    expect(useAuthStore.getState()).toMatchObject({
      user: { id: 14, email: 'fan@example.com' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requiresEmailVerification: false,
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
    })
  })
})
