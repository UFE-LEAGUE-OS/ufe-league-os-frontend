import { describe, expect, it, vi } from 'vitest'
import {
  fetchProfile,
  login,
  register,
  removeAvatar,
  requestPasswordReset,
  resendOtp,
  resetPassword,
  updateProfile,
  verifyOtp,
} from './authService.js'

const axiosMock = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('./apiClient.js', () => ({
  default: axiosMock,
}))

describe('authService', () => {
  it('routes authentication calls to the expected backend endpoints', async () => {
    axiosMock.post.mockResolvedValue({ data: {} })

    await register({ email: 'new@example.com' })
    await login({ email: 'fan@example.com' })
    await verifyOtp({ code: '123456' })
    await resendOtp({ email: 'fan@example.com' })
    await requestPasswordReset({ email: 'fan@example.com' })
    await resetPassword({ code: '123456' })

    expect(axiosMock.post).toHaveBeenNthCalledWith(1, '/accounts/register/', { email: 'new@example.com' })
    expect(axiosMock.post).toHaveBeenNthCalledWith(2, '/accounts/login/', { email: 'fan@example.com' })
    expect(axiosMock.post).toHaveBeenNthCalledWith(3, '/accounts/verify-otp/', { code: '123456' })
    expect(axiosMock.post).toHaveBeenNthCalledWith(4, '/accounts/resend-otp/', { email: 'fan@example.com' })
    expect(axiosMock.post).toHaveBeenNthCalledWith(5, '/accounts/request-password-reset/', {
      email: 'fan@example.com',
    })
    expect(axiosMock.post).toHaveBeenNthCalledWith(6, '/accounts/reset-password/', { code: '123456' })
  })

  it('routes profile management calls to the expected backend endpoints', async () => {
    axiosMock.get.mockResolvedValue({ data: {} })
    axiosMock.patch.mockResolvedValue({ data: {} })
    axiosMock.delete.mockResolvedValue({ data: {} })

    await fetchProfile()
    await updateProfile({ display_name: 'Amina' })
    await removeAvatar()

    expect(axiosMock.get).toHaveBeenCalledWith('/accounts/profile/')
    expect(axiosMock.patch).toHaveBeenCalledWith('/accounts/profile/', { display_name: 'Amina' })
    expect(axiosMock.delete).toHaveBeenCalledWith('/accounts/profile/avatar/')
  })
})
