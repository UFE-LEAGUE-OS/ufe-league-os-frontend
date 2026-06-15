import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { setToken } from '../../utils/tokenManager.js';
import { GlassCard, PageShell } from '../../components/site/LeagueUI.js';
import '../../styles/pages/login.css';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [message, setMessage] = useState('Completing Google sign-in...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    if (!params.has('access')) {
      setMessage('Google sign-in could not be completed. Please try again.');
      return;
    }

    try {
      const userParam = params.get('user');
      const user = userParam ? JSON.parse(userParam) : null;
      const access = params.get('access') || '';
      const refresh = params.get('refresh') || '';
      const requiresEmailVerification = params.get('requires_email_verification') === 'true';
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
    } catch {
      setMessage('Google sign-in could not be completed. Please try again.');
    }
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
