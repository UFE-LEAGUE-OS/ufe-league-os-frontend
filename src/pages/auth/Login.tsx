import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import { GlassCard, PageShell } from '../../components/site/LeagueUI.js';
import { useAuth } from '../../hooks/useAuth.js';
import { buildGoogleAuthUrl } from './loginUtils.js';
import '../../styles/pages/login.css';

const features = [
  {
    title: 'For Fans',
    copy: 'Follow your teams, get live scores, and never miss a moment.',
    tone: 'feature-purple',
    icon: GroupsOutlinedIcon,
  },
  {
    title: 'Live Scores & Updates',
    copy: 'Real-time scores, results and match highlights.',
    tone: 'feature-orange',
    icon: EmojiEventsOutlinedIcon,
  },
  {
    title: 'Never Miss a Moment',
    copy: 'Personalized schedules and important alerts.',
    tone: 'feature-blue',
    icon: EventNoteOutlinedIcon,
  },
];

function LoginFieldIcon({ children }: { children: ReactNode }) {
  return (
    <span className="login-field-icon" aria-hidden="true">
      {children}
    </span>
  );
}

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoginMessage, setGoogleLoginMessage] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const locationMessage = (location.state as { message?: string } | null)?.message ?? '';

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  const googleRedirectUri =
    import.meta.env.VITE_GOOGLE_REDIRECT_URI?.trim() ||
    `${apiBaseUrl}/api/accounts/google/callback/`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate('/dashboard');

    setIsSubmitting(true);
    setErrorMessage('');

    const normalizedIdentifier = identifier.trim();

    if (!normalizedIdentifier || !password) {
      setErrorMessage('Please enter your email/phone number and password.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await login({
        identifier: normalizedIdentifier,
        password,
      });

      const dashboardRoute =
        response.frontend_dashboard_route && response.frontend_dashboard_route.startsWith('/dashboard')
          ? response.frontend_dashboard_route
          : '/dashboard/fan';

      navigate(dashboardRoute, {
        replace: true,
        state: {
          message: 'Login successful. Welcome back.',
        },
      });
    } catch (error) {
      const responseData = (error as { response?: { data?: unknown } })?.response?.data;

      if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
        const data = responseData as Record<string, unknown>;

        if (data.code === 'email_not_verified') {
          navigate('/verify-email', {
            replace: true,
            state: {
              email: String(data.email ?? normalizedIdentifier),
              message: 'Please verify your email before logging in.',
            },
          });
          return;
        }

        const messages = Object.values(data)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .filter((value): value is string => typeof value === 'string');

        if (messages.length > 0) {
          setErrorMessage(messages[0]);
          return;
        }
      }

      setErrorMessage(
        'We could not log you in right now. Please check your credentials and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const url = buildGoogleAuthUrl({
      apiBaseUrl,
      googleClientId,
      googleRedirectUri,
    });

    if (!url) {
      setGoogleLoginMessage(
        'Google sign-in is not configured yet.',
      );
      return;
    }

    setGoogleLoginMessage('');
    window.location.assign(url);
  };

  return (
    <PageShell className="auth-page login-page">
      <main className="login-layout">
        <section className="login-story">
          <div className="login-hero-copy">
            <h1>
              <span>Every Game.</span>
              <span>Every Fan.</span>
              <span className="login-hero-accent">One Platform.</span>
            </h1>
            <p>
              League OS is Uganda&apos;s unified platform for fans, teams, leagues and partners.
              Follow. Engage. Support.
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
                Welcome <span>Back!</span>
              </h2>
              <p>Log in to continue your League OS experience.</p>
              {locationMessage ? (
                <p className="login-footnote" role="status" aria-live="polite" style={{ color: '#c8ffd5' }}>
                  {locationMessage}
                </p>
              ) : null}
              {errorMessage ? (
                <p className="login-footnote" role="alert" style={{ color: '#ffd08a' }}>
                  {errorMessage}
                </p>
              ) : null}
            </header>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <label>
                Phone Number or Email
                <div className="login-field-shell">
                  <LoginFieldIcon>
                    <PersonOutlinedIcon />
                  </LoginFieldIcon>
                  <input
                    type="text"
                    placeholder="Enter phone number or email"
                    autoComplete="username"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                  />
                </div>
              </label>

              <label>
                Password
                <div className="login-password-shell">
                  <LoginFieldIcon>
                    <LockOutlinedIcon />
                  </LoginFieldIcon>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                  </button>
                </div>
              </label>

              <div className="login-meta-row">
                <span />
                <Link className="login-forgot" to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="login-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging In...' : 'Log In'}
              </button>

              <div className="login-divider" aria-hidden="true">
                <span>OR</span>
              </div>

              <button type="button" className="login-google" onClick={handleGoogleLogin}>
                <span className="google-mark" aria-hidden="true">
                  G
                </span>
                <span>Continue with Google</span>
              </button>

              {googleLoginMessage ? (
                <p className="login-footnote" role="status" aria-live="polite" style={{ color: '#ffd08a' }}>
                  {googleLoginMessage}
                </p>
              ) : null}

              <p className="login-footnote">
                Don&apos;t have an account? <Link to="/register">Sign Up</Link>
              </p>
            </form>
          </div>
        </GlassCard>
      </main>
    </PageShell>
  );
}
