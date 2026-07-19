import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from './authStore.js'
import { useClubWorkspaceStore } from './clubWorkspaceStore.js'

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  requiresEmailVerification: false,
  accessStatus: 'unauthenticated' as const,
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  useAuthStore.setState(initialState)
  useClubWorkspaceStore.setState({
    selectedEntitlementId: null,
  })
})

describe('useAuthStore', () => {
  it('stores authenticated user data with a validated dashboard contract', () => {
    const dashboardAccess = {
      version: 1 as const,
      default_entitlement_id: 'fan',
      entitlements: [
        {
          id: 'fan',
          dashboard: 'FAN' as const,
          route: '/dashboard/fan',
          scope_type: 'ACCOUNT',
          scope_id: 1,
          workspace_role: null,
          permissions: [],
        },
      ],
    }

    useAuthStore.getState().setAuth({
      user: { id: 1, email: 'fan@example.com', dashboard_access: dashboardAccess },
      access: 'access-token',
      refresh: 'refresh-token',
      requiresEmailVerification: true,
    })

    expect(useAuthStore.getState()).toMatchObject({
      user: { id: 1, email: 'fan@example.com', dashboard_access: dashboardAccess },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requiresEmailVerification: true,
      accessStatus: 'ready',
    })
    expect(localStorage.getItem('league_os_access_token')).toBe('access-token')
    expect(localStorage.getItem('league_os_refresh_token')).toBe('refresh-token')
  })

  it('fails closed when a fresh authenticated response has malformed access', () => {
    useAuthStore.getState().setAuth({
      user: {
        id: 1,
        dashboard_access: {
          version: 2,
          default_entitlement_id: 'fan',
          entitlements: [],
        },
      },
      access: 'access-token',
      refresh: 'refresh-token',
      requiresEmailVerification: false,
    })

    expect(useAuthStore.getState()).toMatchObject({
      accessStatus: 'unavailable',
      user: { id: 1, dashboard_access: null },
    })
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

  it('clears a prior Club selection for a new login or logout', () => {
    useClubWorkspaceStore
      .getState()
      .selectEntitlement('club-scope-7')

    useAuthStore.getState().setAuth({
      user: { id: 1 },
      access: 'access-token',
      refresh: 'refresh-token',
      requiresEmailVerification: false,
    })

    expect(
      useClubWorkspaceStore.getState().selectedEntitlementId,
    ).toBeNull()

    useClubWorkspaceStore
      .getState()
      .selectEntitlement('club-scope-8')
    useAuthStore.getState().clearAuth()

    expect(
      useClubWorkspaceStore.getState().selectedEntitlementId,
    ).toBeNull()
  })

  it('preserves an explicit Club selection during session hydration', () => {
    useClubWorkspaceStore
      .getState()
      .selectEntitlement('club-scope-7')

    useAuthStore.getState().setHydratedUser({
      id: 1,
      dashboard_access: {
        version: 1,
        default_entitlement_id: 'club-scope-7',
        entitlements: [
          {
            id: 'club-scope-7',
            dashboard: 'CLUB_ADMIN',
            route: '/dashboard/club-admin',
            scope_type: 'CLUB',
            scope_id: 7,
            workspace_role: 'TREASURER',
            permissions: ['club.finance.view'],
          },
        ],
      },
    })

    expect(
      useClubWorkspaceStore.getState().selectedEntitlementId,
    ).toBe('club-scope-7')
  })
})
