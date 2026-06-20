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
import { usePasswordValidation } from '../../hooks/usePasswordValidation.js';
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

function PasswordStatusDisplay({
  status,
  message,
  score,
}: {
  status: string;
  message: string;
  score: number;
}) {
  if (!status || status === 'idle') return null;

  const statusClass = `status-${status}`;

  return (
    <div className={`password-status ${statusClass}`}>
      <span className="password-status-text">{message}</span>
      {status === 'medium' || status === 'strong' ? (
        <div className="password-strength-bar" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`password-strength-bar-segment${i <= score ? ' active' : ''}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
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
  const [hasRequestedCode, setHasRequestedCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { validation, validatePassword, resetValidation } = usePasswordValidation();

  const resetCodeStep = () => {
    setHasRequestedCode(false);
    setStep('request');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setSuccessMessage('');
    resetValidation();
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);

    if (step !== 'request' || hasRequestedCode) {
      resetCodeStep();
    }
  };

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsRequesting(true);
    setHasRequestedCode(true);
    setStep('code');
    setIsRequesting(false);

    void requestPasswordReset({ email: email.trim().toLowerCase() }).catch(() => undefined);
  };

  const handleVerifyCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsVerifyingCode(true);
    setStep('password');
    setIsVerifyingCode(false);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPassword(val);
    void validatePassword(val);
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validation.disabled) return;

    setIsResetting(true);
    setSuccessMessage('Password reset successful. Redirecting to login...');
    setStep('success');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setHasRequestedCode(false);

    window.setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2000);

    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        code: resetCode.trim(),
        password: newPassword,
        confirm_password: confirmPassword,
      });
    } catch {
      return;
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
              We'll send a secure code to your email so you can create a new League OS
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

                  <button type="submit" className="login-submit" disabled={isVerifyingCode}>
                    {isVerifyingCode ? 'Verifying...' : 'Verify Code'}
                  </button>

                  <button type="button" className="text-button" onClick={resetCodeStep}>
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
                      onChange={handlePasswordChange}
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
                  <PasswordStatusDisplay
                    status={validation.status}
                    message={validation.message}
                    score={validation.score}
                  />
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

                <button type="submit" className="login-submit" disabled={isResetting || validation.disabled}>
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
                <p className="login-footnote" style={{ color: '#c8ffd5', fontWeight: 700, marginTop: '0.5rem' }}>
                  {successMessage}
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