import { useState, useRef, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resendOtp, verifyOtp } from '../../services/authService.js';
import { LeagueLogo } from '../../components/site/LeagueUI.js';
import { GlassCard, LeagueLogo, PageShell, TopNav } from '../../components/site/LeagueUI.js';
import { getPendingOnboardingSession } from '../../utils/onboardingSession.js';
import '../../styles/pages/verify-email.css';

type LocationState = { email?: string; message?: string };

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [email] = useState(state?.email ?? '');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const locationState = location.state as VerifyEmailLocationState | null;
  const pendingOnboarding = getPendingOnboardingSession();
  const [email, setEmail] = useState(locationState?.email ?? pendingOnboarding?.email ?? '');
  const [code, setCode] = useState('');
  const [statusMessage, setStatusMessage] = useState(locationState?.message ?? '');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState(state?.message ?? '');
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
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setDigits(next);
    focusSlot(Math.min(pasted.length, 5));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) { setErrorMessage('Enter all 6 digits.'); return; }

    setIsSubmitting(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      await verifyOtp({ email, code, purpose: 'EMAIL_VERIFICATION' });
      setStatusMessage('Verified! Redirecting to login...');
      setTimeout(() => navigate('/login', {
        replace: true,
        state: { message: 'Your number has been verified. You can now sign in.' },
      }), 1400);
      await verifyOtp({
        email: normalizedEmail,
        code: normalizedCode,
        purpose: 'EMAIL_VERIFICATION',
      });

      setStatusMessage('Email verified successfully. Redirecting to personalization...');
      window.setTimeout(() => {
        navigate('/personalize', {
          replace: true,
          state: {
            email: normalizedEmail,
            message: 'Your email has been verified. Let’s personalize your fan profile.',
          },
        });
      }, 1500);
    } catch (error) {
      const data = (error as { response?: { data?: unknown } })?.response?.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const msgs = Object.values(data as Record<string, unknown>)
          .flatMap((v) => Array.isArray(v) ? v : [v])
          .filter((v): v is string => typeof v === 'string');
        if (msgs.length) { setErrorMessage(msgs[0]); return; }
      }
      setErrorMessage('Could not verify. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) { setErrorMessage('Email is required to resend the code.'); return; }
    setIsResending(true);
    setErrorMessage('');
    try {
      await resendOtp({ email });
      setStatusMessage('A new code has been sent.');
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

        <h1 className="otp-title">Verify Your Number</h1>
        <p className="otp-subtitle">
          Enter the 6-digit code sent to your email address to continue.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="otp-boxes">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                className={`otp-box${d ? ' otp-box-filled' : ''}`}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={d}
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                aria-label={`Digit ${i + 1}`}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>

          {errorMessage && (
            <p className="otp-message otp-error" role="alert">{errorMessage}</p>
          )}
          {statusMessage && (
            <p className="otp-message otp-success" role="status">{statusMessage}</p>
          )}

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
