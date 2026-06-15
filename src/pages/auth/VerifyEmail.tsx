import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resendOtp, verifyOtp } from '../../services/authService.js';
import { GlassCard, LeagueLogo, PageShell, TopNav } from '../../components/site/LeagueUI.js';
import '../../styles/pages/verify-email.css';

type VerifyEmailLocationState = {
  email?: string;
  message?: string;
};

function normalizeOtpInput(value: string) {
  return value.replace(/[^\d]/g, '').slice(0, 6);
}

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as VerifyEmailLocationState | null;
  const [email, setEmail] = useState(locationState?.email ?? '');
  const [code, setCode] = useState('');
  const [statusMessage, setStatusMessage] = useState(locationState?.message ?? '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (locationState?.email) {
      setEmail(locationState.email);
    }
  }, [locationState?.email]);

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();

    if (!normalizedEmail) {
      setErrorMessage('Email address is required.');
      return;
    }

    if (normalizedCode.length !== 6) {
      setErrorMessage('Verification code must be 6 digits long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      await verifyOtp({
        email: normalizedEmail,
        code: normalizedCode,
        purpose: 'EMAIL_VERIFICATION',
      });

      setStatusMessage('Email verified successfully. Redirecting to login...');
      window.setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            message: 'Your email has been verified. You can now sign in.',
          },
        });
      }, 1500);
    } catch (error) {
      const responseData = (error as { response?: { data?: unknown } })?.response?.data;

      if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
        const messages = Object.values(responseData as Record<string, unknown>)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .filter((value): value is string => typeof value === 'string');

        if (messages.length > 0) {
          setErrorMessage(messages[0]);
          return;
        }
      }

      setErrorMessage('We could not verify your email right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage('Email address is required to resend the code.');
      return;
    }

    setIsResending(true);
    setErrorMessage('');

    try {
      await resendOtp({ email: normalizedEmail });
      setStatusMessage('A new verification code has been sent to your email address.');
    } catch {
      setErrorMessage('We could not resend the verification code right now. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <PageShell className="auth-page">
      <TopNav compact />

      <main className="page verify-layout">
        <GlassCard className="verify-card">
          <div className="verify-logo">
            <LeagueLogo compact />
          </div>
          <h1>Verify Your Email</h1>
          <p>Enter the 6-digit code we sent to your email address to finish setup.</p>

          <form className="login-form register-form" onSubmit={handleVerify} noValidate>
            <label>
              Email address
              <div className="field-shell">
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </label>

            <label>
              Verification code
              <div className="field-shell">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter the 6-digit code"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(normalizeOtpInput(event.target.value))}
                />
              </div>
            </label>

            {errorMessage ? (
              <p className="login-footnote" role="alert" style={{ color: '#ffd08a' }}>
                {errorMessage}
              </p>
            ) : null}

            {statusMessage ? (
              <p className="login-footnote" role="status" aria-live="polite" style={{ color: '#c8ffd5' }}>
                {statusMessage}
              </p>
            ) : null}

            <button type="submit" className="button button-primary button-full" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Verify Email'}
            </button>

            <button type="button" className="text-button" onClick={handleResend} disabled={isResending}>
              {isResending ? 'Resending...' : 'Resend code'}
            </button>
          </form>
        </GlassCard>
      </main>
    </PageShell>
  );
}
