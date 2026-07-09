import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import axios from 'axios';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import { GlassCard, PageShell } from '../../components/site/LeagueUI.js';
import { useAuth } from '../../hooks/useAuth.js';
import { apiBaseUrl } from '../../services/apiClient.js';
import {
    getSafeAuthRedirect,
    VERIFY_EMAIL_ROUTE,
    type AuthFlowState,
} from '../../utils/authFlow.js';
import BackButton from '../../components/BackButton.js';

import '../../styles/pages/auth/login.css';

type LoginErrors = {
    identifier?: string;
    password?: string;
    general?: string;
};

type LoginResult = {
    frontend_dashboard_route?: unknown;
    dashboard_route?: unknown;
    requires_email_verification?: boolean;
    user?: {
        email?: unknown;
        frontend_dashboard_route?: unknown;
        dashboard_route?: unknown;
    };
};

type ApiError = {
    response?: {
        data?: {
            detail?: string;
            error?: string;
            message?: string;
            non_field_errors?: string[];
            identifier?: string[];
            email?: string[];
            password?: string[];
            requires_email_verification?: boolean;
        };
    };
};

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

function firstMessage(value?: string | string[]) {
    if (Array.isArray(value)) return value[0];
    return value;
}

function getLoginErrorMessage(error: unknown) {
    const data = (error as ApiError).response?.data;

    if (data?.requires_email_verification) {
        return 'Please verify your email before logging in.';
    }

  return (
    firstMessage(data?.detail) ||
    firstMessage(data?.error) ||
    firstMessage(data?.message) ||
    firstMessage(data?.non_field_errors) ||
    firstMessage(data?.identifier) ||
    firstMessage(data?.email) ||
    firstMessage(data?.password) ||
    'Login failed. Please check your phone number or email and password.'
  );
}

function safeDashboardRoute(value: unknown) {
    return typeof value === 'string' && value.startsWith('/') ? value : null;
}

function resolveDashboardRoute(result: LoginResult) {
    return (
        safeDashboardRoute(result.user?.frontend_dashboard_route) ||
        safeDashboardRoute(result.frontend_dashboard_route) ||
        safeDashboardRoute(result.user?.dashboard_route) ||
        safeDashboardRoute(result.dashboard_route) ||
        '/dashboard'
    );
}

function getUserEmail(value: unknown) {
    return typeof value === 'string' && value.includes('@') ? value : undefined;
}

export default function Login() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [googleLoginMessage, setGoogleLoginMessage] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<LoginErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const locationState = location.state as AuthFlowState | null;
    const locationMessage = locationState?.message ?? '';
    const postLoginRedirect = getSafeAuthRedirect(locationState?.postLoginRedirect);

    const clearError = (field: keyof LoginErrors) => {
        setErrors((current) => ({
            ...current,
            [field]: undefined,
            general: undefined,
        }));
    };

    const handleIdentifierChange = (e: ChangeEvent<HTMLInputElement>) => {
        setIdentifier(e.target.value);
        clearError('identifier');
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        clearError('password');
    };

    const validateForm = () => {
        const nextErrors: LoginErrors = {};

        if (!identifier.trim()) {
            nextErrors.identifier = 'Phone number or email is required.';
        }

        if (!password) {
            nextErrors.password = 'Password is required.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const result = await login({
                identifier: identifier.trim(),
                password,
            });

            if (result.requires_email_verification) {
                navigate(VERIFY_EMAIL_ROUTE, {
                    replace: true,
                    state: {
                        email:
                            getUserEmail(result.user?.email) ??
                            getUserEmail(identifier.trim()),
                        message: 'Please verify your email address before continuing.',
                        postLoginRedirect: postLoginRedirect ?? resolveDashboardRoute(result),
                    },
                });
                return;
            }

            navigate(postLoginRedirect ?? resolveDashboardRoute(result), { replace: true });
        } catch (error) {
            const data = (error as ApiError).response?.data;

            if (data?.requires_email_verification) {
                navigate(VERIFY_EMAIL_ROUTE, {
                    replace: true,
                    state: {
                        email: getUserEmail(identifier.trim()),
                        message: 'Please verify your email address before continuing.',
                        postLoginRedirect: postLoginRedirect ?? '/dashboard',
                    },
                });
                return;
            }

            setErrors({
                general: getLoginErrorMessage(error),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        const credential = credentialResponse.credential;

        if (!credential) {
            setGoogleLoginMessage('Google sign-in failed: no credential received.');
            return;
        }

        try {
            const response = await axios.post(
                `${apiBaseUrl}/google/`,
                { token: credential }
            );

            const result = response.data as LoginResult;

            if (result.requires_email_verification) {
                navigate(VERIFY_EMAIL_ROUTE, {
                    replace: true,
                    state: {
                        email: getUserEmail(result.user?.email),
                        message: 'Please verify your email address before continuing.',
                        postLoginRedirect: postLoginRedirect ?? resolveDashboardRoute(result),
                    },
                });
                return;
            }

            navigate(postLoginRedirect ?? resolveDashboardRoute(result), { replace: true });
        } catch (error) {
      const apiMessage = firstMessage((error as ApiError).response?.data?.detail);
      setGoogleLoginMessage(
        apiMessage || 'Google sign-in could not be completed. Please try again.',
      );
        }
    };

    return (
        <PageShell className="auth-page login-page">
            <div className="login-back-wrap">
                <BackButton to="/" label="Back to home" />
            </div>

            <main className="login-layout">
                <section className="login-story">
                    <div className="login-hero-copy">
                        <h1>
                            <span>Every Game.</span>
                            <span>Every Fan.</span>
                            <span className="login-hero-accent">One Platform.</span>
                        </h1>
                        <p>
                            League OS is Uganda's unified platform for fans, teams, leagues and partners.
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
                                <p className="auth-message auth-message-success" role="status" aria-live="polite">
                                    {locationMessage}
                                </p>
                            ) : null}
                        </header>

                        <form className="login-form" onSubmit={handleSubmit} noValidate>
                            {errors.general ? (
                                <p className="auth-message auth-message-error" role="alert">
                                    {errors.general}
                                </p>
                            ) : null}

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
                                        onChange={handleIdentifierChange}
                                        aria-invalid={Boolean(errors.identifier)}
                                        aria-describedby={errors.identifier ? 'login-identifier-error' : undefined}
                                    />
                                </div>
                                {errors.identifier ? (
                                    <p id="login-identifier-error" className="login-footnote login-footnote-error" role="alert">
                                        {errors.identifier}
                                    </p>
                                ) : null}
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
                                        onChange={handlePasswordChange}
                                        aria-invalid={Boolean(errors.password)}
                                        aria-describedby={errors.password ? 'login-password-error' : undefined}
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
                                {errors.password ? (
                                    <p id="login-password-error" className="login-footnote login-footnote-error" role="alert">
                                        {errors.password}
                                    </p>
                                ) : null}
                            </label>

                            <div className="login-meta-row">
                                <span />
                                <Link className="login-forgot" to="/forgot-password">
                                    Forgot password?
                                </Link>
                            </div>

                            <button type="submit" className="login-submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Logging in...' : 'Log In'}
                            </button>

                            <div className="login-divider" aria-hidden="true">
                                <span>OR</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                  onError={() => {
                    clearError('general');
                    setGoogleLoginMessage('Google sign-in failed. Please try again.');
                  }}
                                />
                            </div>

                            {googleLoginMessage ? (
                                <p className="auth-message auth-message-warning" role="status" aria-live="polite">
                                    {googleLoginMessage}
                                </p>
                            ) : null}

                            <p className="login-footnote">
                                Don't have an account? <Link to="/register">Sign Up</Link>
                            </p>
                        </form>
                    </div>
                </GlassCard>
            </main>
        </PageShell>
    );
}