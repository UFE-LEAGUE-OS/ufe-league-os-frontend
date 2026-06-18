import { useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LeagueLogo } from '../../components/site/LeagueUI.js';
import { resendOtp, verifyOtp } from '../../services/authService.js';
import { getPendingOnboardingSession } from '../../utils/onboardingSession.js';
import '../../styles/pages/verify-email.css';

type LocationState = { email?: string; message?: string };

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const pendingOnboarding = getPendingOnboardingSession();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [email] = useState(locationState?.email ?? pendingOnboarding?.email ?? '');
  const [statusMessage, setStatusMessage] = useState(locationState?.message ?? '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusSlot = (index: number) => inputRefs.current[index]?.focus();

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setErrorMessage('');
    if (digit && index < 5) focusSlot(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) focusSlot(index - 1);
    if (e.key === 'ArrowLeft' && index > 0) focusSlot(index - 1);
    if (e.key === 'ArrowRight' && index < 5) focusSlot(index + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((digit, index) => {
      next[index] = digit;
    });
    setDigits(next);
    focusSlot(Math.min(pasted.length, 5));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    const normalizedEmail = email.trim().toLowerCase();

    if (code.length !== 6) {
      setErrorMessage('Enter all 6 digits.');
      return;
    }

    if (!normalizedEmail) {
      setErrorMessage('Email is required to verify your account.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      await verifyOtp({ email: normalizedEmail, code, purpose: 'EMAIL_VERIFICATION' });

      const hasPendingOnboarding = Boolean(getPendingOnboardingSession());
      setStatusMessage(
        hasPendingOnboarding
          ? 'Email verified successfully. Redirecting to personalization...'
          : 'Email verified successfully. Redirecting to login...',
      );

      window.setTimeout(() => {
        navigate(hasPendingOnboarding ? '/personalize' : '/login', {
          replace: true,
          state: {
            email: normalizedEmail,
            message: hasPendingOnboarding
              ? "Your email has been verified. Let's personalize your fan profile."
              : 'Your email has been verified. You can now sign in.',
          },
        });
      }, 1500);
    } catch (error) {
      const data = (error as { response?: { data?: unknown } })?.response?.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const messages = Object.values(data as Record<string, unknown>)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .filter((value): value is string => typeof value === 'string');
        if (messages.length) {
          setErrorMessage(messages[0]);
          return;
        }
      }
      setErrorMessage('Could not verify. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setErrorMessage('Email is required to resend the code.');
      return;
    }

    setIsResending(true);
    setErrorMessage('');

    try {
      await resendOtp({ email: normalizedEmail });
      setStatusMessage('A new verification code has been sent.');
    } catch {
      setErrorMessage('Could not resend the code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="otp-shell">
      <div className="otp-card">
        <div className="otp-logo">
          <LeagueLogo compact />
        </div>

        <h1 className="otp-title">Verify Your Email</h1>
        <p className="otp-subtitle">
          Enter the 6-digit code sent to your email address to continue.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="otp-boxes">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                className={`otp-box${digit ? ' otp-box-filled' : ''}`}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={digit}
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                aria-label={`Digit ${index + 1}`}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>

          {errorMessage ? (
            <p className="otp-message otp-error" role="alert">{errorMessage}</p>
          ) : null}
          {statusMessage ? (
            <p className="otp-message otp-success" role="status">{statusMessage}</p>
          ) : null}

          <button type="submit" className="otp-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <button type="button" className="otp-resend" onClick={handleResend} disabled={isResending}>
          {isResending ? 'Resending...' : "Didn't receive a code? Resend"}
        </button>
      </div>
    </div>
  );
}
