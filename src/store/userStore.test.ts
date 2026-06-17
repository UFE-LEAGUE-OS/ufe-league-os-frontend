import { beforeEach, describe, expect, it } from 'vitest'
import { useUserStore } from './userStore.js'

beforeEach(() => {
  useUserStore.setState({ profile: null })
})

describe('useUserStore', () => {
  it('stores the current profile snapshot', () => {
    const profile = {
      id: 9,
      display_name: 'Amina',
      favorite_club: 'SC Villa',
    }

    useUserStore.getState().setProfile(profile)

    expect(useUserStore.getState().profile).toEqual(profile)
  })
})
