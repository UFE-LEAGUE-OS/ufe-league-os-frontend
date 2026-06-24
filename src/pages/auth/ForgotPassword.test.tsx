import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ForgotPassword from './ForgotPassword'
import { normalizeCodeInput } from './forgotPasswordUtils'

const navigateMock = vi.hoisted(() => vi.fn())
const requestPasswordResetMock = vi.hoisted(() => vi.fn())
const resetPasswordMock = vi.hoisted(() => vi.fn())

vi.mock('../../services/authService.js', () => ({
  requestPasswordReset: requestPasswordResetMock,
  resetPassword: resetPasswordMock,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

beforeEach(() => {
  navigateMock.mockReset()
  requestPasswordResetMock.mockReset()
  resetPasswordMock.mockReset()
})

describe('forgot password helpers', () => {
  it('keeps only numeric reset code characters', () => {
    expect(normalizeCodeInput('12a-34 56')).toBe('123456')
  })
})

describe('ForgotPassword page', () => {
  it('walks through request, verification, and password reset', async () => {
    const user = userEvent.setup()
    requestPasswordResetMock.mockResolvedValueOnce({ data: { ok: true } })
    resetPasswordMock.mockResolvedValueOnce({ data: { ok: true } })
    const timeoutSpy = vi.spyOn(window, 'setTimeout')

    const { container } = render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('you@example.com'), 'USER@EXAMPLE.COM')
    await user.click(screen.getByRole('button', { name: /send reset code/i }))

    await waitFor(() => {
      expect(requestPasswordResetMock).toHaveBeenCalledWith({
        email: 'user@example.com',
      })
    })

    await user.type(screen.getByPlaceholderText(/enter the 6-digit code/i), '12a34b56')
    expect(screen.getByDisplayValue('123456')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^verify code$/i }))

    const passwordInputs = container.querySelectorAll('input[type="password"]')
    expect(passwordInputs).toHaveLength(2)

    await user.type(passwordInputs[0], 'NewStrongPass1!')
    await user.type(passwordInputs[1], 'NewStrongPass1!')
    await user.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith({
        email: 'user@example.com',
        code: '123456',
        password: 'NewStrongPass1!',
        confirm_password: 'NewStrongPass1!',
      })
    })

    expect(screen.getByRole('status')).toHaveTextContent(/password reset successful/i)
    await waitFor(() => {
      expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000)
    })

    const timeoutCall = timeoutSpy.mock.calls.find(([, delay]) => delay === 2000)
    const timerCallback = timeoutCall?.[0]
    expect(typeof timerCallback).toBe('function')

    if (typeof timerCallback === 'function') {
      timerCallback()
    }

    expect(navigateMock).toHaveBeenCalledWith('/login', {
      replace: true,
      state: { message: 'Password reset successful. You can now sign in.' },
    })
  })

  it('does not advance when requesting a reset code fails', async () => {
    const user = userEvent.setup()
    requestPasswordResetMock.mockRejectedValueOnce({
      response: { data: { email: ['No account exists for this email.'] } },
    })

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('you@example.com'), 'missing@example.com')
    await user.click(screen.getByRole('button', { name: /send reset code/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/no account exists/i)
    expect(screen.queryByPlaceholderText(/enter the 6-digit code/i)).not.toBeInTheDocument()
  })

  it('shows backend reset errors and keeps the password form open', async () => {
    const user = userEvent.setup()
    requestPasswordResetMock.mockResolvedValueOnce({ data: { ok: true } })
    resetPasswordMock.mockRejectedValueOnce({
      response: { data: { code: ['Invalid OTP code.'] } },
    })

    const { container } = render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('you@example.com'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /send reset code/i }))
    await user.type(await screen.findByPlaceholderText(/enter the 6-digit code/i), '123456')
    await user.click(screen.getByRole('button', { name: /^verify code$/i }))

    const passwordInputs = container.querySelectorAll('input[type="password"]')
    await user.type(passwordInputs[0], 'NewStrongPass1!')
    await user.type(passwordInputs[1], 'NewStrongPass1!')
    await user.click(screen.getByRole('button', { name: /reset password/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid otp code/i)
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
