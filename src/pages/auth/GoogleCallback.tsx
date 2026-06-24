import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { GlassCard, PageShell } from '../../components/site/LeagueUI.js';
import {
  getPostAuthRedirect,
  VERIFY_EMAIL_ROUTE,
} from '../../utils/authFlow.js';
import '../../styles/pages/auth/login.css';

function parseCallbackHash() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  if (params.has('error')) {
    return {
      ok: false as const,
      message: params.get('error_description') || 'Google sign-in was cancelled or failed. Please try again.',
    };
  }

  if (params.get('requires_email_verification') === 'true') {
    return {
      ok: true as const,
      user: null,
      access: '',
      refresh: '',
      email: params.get('email') || '',
      requiresEmailVerification: true,
      isFirstTimeUser: false,
    };
  }

  if (!params.has('access')) {
    return {
      ok: false as const,
      message: 'Google sign-in could not be completed. Please try again.',
    };
  }

  try {
    return {
      ok: true as const,
      user: params.get('user') ? JSON.parse(params.get('user') as string) : null,
      access: params.get('access') || '',
      refresh: params.get('refresh') || '',
      email: params.get('email') || '',
      requiresEmailVerification: params.get('requires_email_verification') === 'true',
      isFirstTimeUser: params.get('is_new_user') === 'true',
    };
  } catch {
    return {
      ok: false as const,
      message: 'Google sign-in could not be completed. Please try again.',
    };
  }
}

export default function GoogleCallback() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [message] = useState(() => {
    const result = parseCallbackHash();
    return result.ok ? 'Completing Google sign-in...' : result.message;
  });

  useEffect(() => {
    const result = parseCallbackHash();

    if (!result.ok) {
      return;
    }

    const { access, refresh, requiresEmailVerification, user } = result;

    window.history.replaceState({}, document.title, window.location.pathname);

    if (requiresEmailVerification) {
      clearAuth();
      const email =
        result.email ||
        (result.user && typeof result.user.email === 'string' ? result.user.email : '');

      navigate(VERIFY_EMAIL_ROUTE, {
        replace: true,
        state: {
          email,
          message: 'Please verify your email address before continuing.',
        },
      });
      return;
    }

    if (!access || !refresh) {
      return;
    }

    setAuth({
      user,
      access,
      refresh,
      requiresEmailVerification,
    });

    navigate(getPostAuthRedirect({ isFirstTimeUser: result.isFirstTimeUser }), {
      replace: true,
    });
  }, [clearAuth, navigate, setAuth]);

  return (
    <PageShell className="auth-page login-page">
      <main className="login-layout">
        <GlassCard className="login-card">
          <div className="login-card-inner">
            <header className="login-card-header">
              <h2>
                Signing <span>you in</span>
              </h2>
              <p>{message}</p>
              {!message.includes('Completing') ? (
                <p className="login-footnote">
                  <Link to="/login">Return to login</Link>
                </p>
              ) : null}
            </header>
          </div>
        </GlassCard>
      </main>
    </PageShell>
  );
}
