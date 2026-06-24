import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from './authStore.js'

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  requiresEmailVerification: false,
}

beforeEach(() => {
  useAuthStore.setState(initialState)
})

describe('useAuthStore', () => {
  it('stores authenticated user data', () => {
    useAuthStore.getState().setAuth({
      user: { id: 1, email: 'fan@example.com' },
      access: 'access-token',
      refresh: 'refresh-token',
      requiresEmailVerification: true,
    })

    expect(useAuthStore.getState()).toMatchObject({
      user: { id: 1, email: 'fan@example.com' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requiresEmailVerification: true,
    })
    expect(localStorage.getItem('league_os_access_token')).toBe('access-token')
    expect(localStorage.getItem('league_os_refresh_token')).toBe('refresh-token')
  })

  it('clears authenticated user data', () => {
    useAuthStore.getState().setAuth({
      user: { id: 1 },
      access: 'access-token',
      refresh: 'refresh-token',
      requiresEmailVerification: true,
    })

    useAuthStore.getState().clearAuth()

    expect(useAuthStore.getState()).toMatchObject(initialState)
    expect(localStorage.getItem('league_os_access_token')).toBeNull()
    expect(localStorage.getItem('league_os_refresh_token')).toBeNull()
  })
})
