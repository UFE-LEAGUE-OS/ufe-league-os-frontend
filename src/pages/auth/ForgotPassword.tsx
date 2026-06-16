import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestPasswordReset, resetPassword } from '../../services/authService.js';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { GlassCard, PageShell } from '../../components/site/LeagueUI.js';
import { normalizeCodeInput } from './forgotPasswordUtils.js';
import '../../styles/pages/login.css';
import '../../styles/pages/register.css';

const features = [
  {
    title: 'Secure OTP',
    copy: 'We send a time-limited reset code to your email address.',
    tone: 'feature-purple',
    icon: MarkEmailReadOutlinedIcon,
  },
  {
    title: 'Private Recovery',
    copy: 'Only someone with access to your email can update the password.',
    tone: 'feature-orange',
    icon: ShieldOutlinedIcon,
  },
  {
    title: 'Fast Sign-in',
    copy: 'Set a new password and get back into your account quickly.',
    tone: 'feature-blue',
    icon: LockResetOutlinedIcon,
  },
];

type RecoveryStep = 'request' | 'code' | 'password' | 'success';

function extractMessage(error: unknown, fallback: string) {
  const responseData = (error as { response?: { data?: unknown } })?.response?.data;

  if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
    const messages = Object.values(responseData as Record<string, unknown>)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter((value): value is string => typeof value === 'string');

    if (messages.length > 0) {
      return messages[0];
    }
  }

  return fallback;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<RecoveryStep>('request');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const resetToRequestStep = () => {
    setStep('request');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setStatusMessage('');
    setErrorMessage('');
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);

    if (step !== 'request') {
      resetToRequestStep();
    }
  };

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage('Email address is required.');
      return;
    }

    setIsRequesting(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      await requestPasswordReset({ email: normalizedEmail });
      setStatusMessage('A reset code has been sent to your email.');
      setStep('code');
    } catch (error) {
      setErrorMessage(
        extractMessage(error, 'We could not send the reset code right now. Please try again.'),
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (resetCode.trim().length !== 6) {
      setErrorMessage('Reset code must be 6 digits long.');
      return;
    }

    setIsVerifyingCode(true);
    setErrorMessage('');

    try {
      setStatusMessage('Code accepted. Enter your new password.');
      setStep('password');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage('Email address is required.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please enter and confirm your new password.');
      return;
    }

    setIsResetting(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      await resetPassword({
        email: normalizedEmail,
        code: resetCode.trim(),
        password: newPassword,
        confirm_password: confirmPassword,
      });

      setStatusMessage('Password reset successful. Redirecting to login...');
      setStep('success');

      window.setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            message: 'Your password has been reset. You can sign in again now.',
          },
        });
      }, 1800);
    } catch (error) {
      setErrorMessage(
        extractMessage(error, 'We could not reset your password right now. Please try again.'),
      );
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <PageShell className="auth-page login-page">
      <main className="login-layout">
        <section className="login-story">
          <div className="login-hero-copy">
            <h1>
              <span>Reset Access.</span>
              <span>Recover Securely.</span>
              <span className="login-hero-accent">Back in the Game.</span>
            </h1>
            <p>
              We&apos;ll send a secure code to your email so you can create a new League OS
              password and get right back to your account.
            </p>
          </div>

          <div className="login-feature-list">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article key={feature.title} className={`login-feature ${feature.tone}`}>
                  <span className="login-feature-icon" aria-hidden="true">
                    <Icon className="login-feature-icon-svg" />
                  </span>
                  <div className="login-feature-copy">
                    <strong>{feature.title}</strong>
                    <p>{feature.copy}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <GlassCard className="login-card">
          <div className="login-card-inner">
            <header className="login-card-header">
              <h2>
                Forgot <span>Password?</span>
              </h2>
            </header>

            {step === 'request' ? (
              <form className="login-form register-form" onSubmit={handleRequestCode} noValidate autoComplete="off">
                <input
                  type="text"
                  name="fake-username"
                  autoComplete="username"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="login-hidden-autofill"
                />
                <input
                  type="password"
                  name="fake-password"
                  autoComplete="new-password"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="login-hidden-autofill"
                />
                <label>
                  Email address
                  <div className="field-shell">
                    <span className="field-icon-ghost" aria-hidden="true">
                      <EmailOutlinedIcon />
                    </span>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      inputMode="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      name="recovery-email"
                      value={email}
                      onChange={handleEmailChange}
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

                <button type="submit" className="login-submit" disabled={isRequesting}>
                  {isRequesting ? 'Sending Code...' : 'Send Reset Code'}
                </button>

                <p className="login-footnote">
                  <Link
                    to="/login"
                    style={{ color: '#b691ff', fontWeight: 700, textDecoration: 'none' }}
                  >
                    <ArrowBackOutlinedIcon fontSize="inherit" style={{ verticalAlign: '-2px' }} />{' '}
                    Back to login
                  </Link>
                </p>
              </form>
            ) : null}

            {step === 'code' ? (
              <>
                <div className="login-divider" aria-hidden="true">
                  <span>Verify Code</span>
                </div>

                <form className="login-form register-form" onSubmit={handleVerifyCode} noValidate>
                  <label>
                    Reset code
                    <div className="field-shell">
                      <span className="field-icon-ghost" aria-hidden="true">
                        <KeyOutlinedIcon />
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter the 6-digit code"
                        autoComplete="one-time-code"
                        value={resetCode}
                        onChange={(event) => setResetCode(normalizeCodeInput(event.target.value))}
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

                  <button type="submit" className="login-submit" disabled={isVerifyingCode}>
                    {isVerifyingCode ? 'Verifying...' : 'Verify Code'}
                  </button>

                  <button type="button" className="text-button" onClick={resetToRequestStep}>
                    Resend code
                  </button>
                </form>
              </>
            ) : null}

            {step === 'password' ? (
              <form className="login-form register-form" onSubmit={handleResetPassword} noValidate>
                <label>
                  New password
                  <div className="password-field">
                    <span className="field-icon-ghost" aria-hidden="true">
                      <LockOutlinedIcon />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      className="field-icon"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                    </button>
                  </div>
                </label>

                <label>
                  Confirm password
                  <div className="password-field">
                    <span className="field-icon-ghost" aria-hidden="true">
                      <LockOutlinedIcon />
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      className="field-icon"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showConfirmPassword}
                      onClick={() => setShowConfirmPassword((current) => !current)}
                    >
                      {showConfirmPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                    </button>
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

                <button type="submit" className="login-submit" disabled={isResetting}>
                  {isResetting ? 'Resetting...' : 'Reset Password'}
                </button>

                <p className="login-footnote">
                  <Link
                    to="/login"
                    style={{ color: '#b691ff', fontWeight: 700, textDecoration: 'none' }}
                  >
                    <ArrowBackOutlinedIcon fontSize="inherit" style={{ verticalAlign: '-2px' }} />{' '}
                    Back to login
                  </Link>
                </p>
              </form>
            ) : null}

            {step === 'success' ? (
              <div
                className="login-form register-form"
                role="status"
                aria-live="polite"
                style={{
                  padding: '1.25rem',
                  borderRadius: '18px',
                  background: 'rgba(200, 255, 213, 0.08)',
                  border: '1px solid rgba(200, 255, 213, 0.28)',
                }}
              >
                <h3 style={{ margin: 0, color: '#c8ffd5', fontSize: '1.05rem', fontWeight: 800 }}>
                  Success
                </h3>
                <p
                  className="login-footnote"
                  style={{ color: '#c8ffd5', fontWeight: 700, marginTop: '0.5rem' }}
                >
                  {statusMessage}
                </p>
                <p className="login-footnote">
                  <Link
                    to="/login"
                    style={{ color: '#b691ff', fontWeight: 700, textDecoration: 'none' }}
                  >
                    <ArrowBackOutlinedIcon fontSize="inherit" style={{ verticalAlign: '-2px' }} />{' '}
                    Back to login
                  </Link>
                </p>
              </div>
            ) : null}
          </div>
        </GlassCard>
      </main>
    </PageShell>
  );
}
