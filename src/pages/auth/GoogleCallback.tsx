import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { setToken } from '../../utils/tokenManager.js';
import { GlassCard, PageShell } from '../../components/site/LeagueUI.js';
import '../../styles/pages/login.css';

function parseCallbackHash() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));

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
      requiresEmailVerification: params.get('requires_email_verification') === 'true',
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
    setToken(access);
    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
    }

    setAuth({
      user,
      access,
      refresh,
      requiresEmailVerification,
    });

    window.history.replaceState({}, document.title, window.location.pathname);
    navigate('/dashboard', { replace: true });
  }, [navigate, setAuth]);

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
            </header>
          </div>
        </GlassCard>
      </main>
    </PageShell>
  );
}
