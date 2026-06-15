import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import VerifyEmail from './VerifyEmail';

const navigateMock = vi.hoisted(() => vi.fn());
const verifyOtpMock = vi.hoisted(() => vi.fn());
const resendOtpMock = vi.hoisted(() => vi.fn());

vi.mock('../../services/authService.js', () => ({
  verifyOtp: verifyOtpMock,
  resendOtp: resendOtpMock,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('VerifyEmail page', () => {
  it('verifies the OTP and routes the user back to login', async () => {
    const user = userEvent.setup();
    const timeoutSpy = vi.spyOn(window, 'setTimeout');

    verifyOtpMock.mockResolvedValueOnce({ data: { message: 'OTP verified successfully.' } });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/verify-email', state: { email: 'fan@example.com' } }]}>
        <VerifyEmail />
      </MemoryRouter>,
    );

    expect(screen.getByDisplayValue('fan@example.com')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Enter the 6-digit code'), '12a3456');
    await user.click(screen.getByRole('button', { name: /verify email/i }));

    await waitFor(() => {
      expect(verifyOtpMock).toHaveBeenCalledWith({
        email: 'fan@example.com',
        code: '123456',
        purpose: 'EMAIL_VERIFICATION',
      });
    });

    expect(screen.getByRole('status')).toHaveTextContent(/email verified successfully/i);

    const timeoutCall = timeoutSpy.mock.calls.find(([, delay]) => delay === 1500);
    expect(timeoutCall).toBeDefined();

    const callback = timeoutCall?.[0];
    if (typeof callback === 'function') {
      callback();
    }

    expect(navigateMock).toHaveBeenCalledWith('/login', {
      replace: true,
      state: {
        message: 'Your email has been verified. You can now sign in.',
      },
    });
  });

  it('can resend the verification code', async () => {
    const user = userEvent.setup();
    resendOtpMock.mockResolvedValueOnce({ data: { message: 'A new OTP has been sent.' } });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/verify-email', state: { email: 'fan@example.com' } }]}>
        <VerifyEmail />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /resend code/i }));

    await waitFor(() => {
      expect(resendOtpMock).toHaveBeenCalledWith({
        email: 'fan@example.com',
      });
    });

    expect(screen.getByRole('status')).toHaveTextContent(/new verification code has been sent/i);
  });
});
