import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { fetchDashboardData } from '../../services/dashboardService.js';
import {
  ClubCard,
  DetailRow,
  GlassCard,
  HeroBadge,
  PageShell,
  SectionTitle,
  StatCard,
  Tag,
  TopNav,
} from '../../components/site/LeagueUI.js';
import '../../styles/pages/dashboard.css';

type DashboardCard = { label: string; value: unknown };

const fallbackPreferences = ['SC Villa', "Women's league", 'Live match alerts', 'Stadium updates'];
const fallbackClubs = [
  { name: 'SC Villa', label: 'Selected club', tone: 'tone-villa' },
  { name: 'KCCA FC', label: 'Followed club', tone: 'tone-kcca' },
  { name: 'Vipers SC', label: 'Rival watch', tone: 'tone-vipers' },
  { name: 'BUL FC', label: 'Trending', tone: 'tone-bul' },
];

function asStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function getStoredPreferences() {
  const raw = localStorage.getItem('league_os_personalization_preferences');

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as {
      favoriteClub?: string;
      focusArea?: string;
      notifications?: string[];
    };

    return [parsed.favoriteClub, parsed.focusArea, ...(parsed.notifications ?? [])].filter(
      (item): item is string => typeof item === 'string' && item.length > 0,
    );
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [dashboardResponse, setDashboardResponse] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const routeMessage = (location.state as { message?: string } | null)?.message ?? '';

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const response = await fetchDashboardData();

        if (!active) {
          return;
        }

        setDashboardResponse(response.data as Record<string, unknown>);
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status;

        if (status === 401 || status === 403) {
          clearAuth();
          navigate('/login', {
            replace: true,
            state: {
              message: 'Your session expired. Please log in again.',
            },
          });
          return;
        }

        setErrorMessage('We could not load your dashboard right now. Please try again.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [clearAuth, navigate]);

  const dashboard = (dashboardResponse?.dashboard as Record<string, unknown> | undefined) ?? null;
  const title = (dashboard?.title as string | undefined) ?? 'Fan Dashboard';
  const description =
    (dashboard?.description as string | undefined) ??
    'Choose the clubs, updates, and match-day topics that matter to you.';
  const summaryCards = (dashboard?.summary_cards as DashboardCard[] | undefined) ?? [];
  const modules = useMemo(() => asStringList(dashboard?.modules), [dashboard]);
  const quickActions = useMemo(() => asStringList(dashboard?.quick_actions), [dashboard]);
  const preferences = useMemo(() => getStoredPreferences(), []);

  return (
    <PageShell className="dashboard-page">
      <TopNav compact />

      <main className="page dashboard-layout">
        <section className="dashboard-hero">
          <div className="hero-copy hero-copy-tight">
            <HeroBadge label={(dashboardResponse?.role_display as string | undefined) ?? 'Your dashboard'} />
            <h1>
              {title}
              <br />
              <span>{(user as { first_name?: string } | null)?.first_name ?? 'Fan'} is back.</span>
            </h1>
            <p>{description}</p>
            {routeMessage ? (
              <p className="login-footnote" role="status" aria-live="polite" style={{ color: '#c8ffd5' }}>
                {routeMessage}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="login-footnote" role="alert" style={{ color: '#ffd08a' }}>
                {errorMessage}
              </p>
            ) : null}
          </div>

          <GlassCard className="dashboard-panel">
            <SectionTitle eyebrow="Your feed" title="What you care about" />
            <div className="tag-cloud">
              {(preferences.length > 0 ? preferences : fallbackPreferences).map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>

            <div className="dashboard-mini-grid">
              <DetailRow
                title="Dashboard route"
                value={(dashboardResponse?.frontend_dashboard_route as string | undefined) ?? '/dashboard/fan'}
                tone="good"
              />
              <DetailRow
                title="Backend route"
                value={(dashboardResponse?.backend_dashboard_route as string | undefined) ?? '/api/dashboards/me/'}
                tone="neutral"
              />
              <DetailRow
                title="Status"
                value={isLoading ? 'Loading...' : 'Ready'}
                tone="good"
              />
              <DetailRow
                title="Role"
                value={(dashboardResponse?.role_display as string | undefined) ?? 'Fan'}
                tone="warn"
              />
            </div>
          </GlassCard>
        </section>

        <section className="dashboard-grid">
          <GlassCard className="content-card">
            <SectionTitle eyebrow="Popular clubs" title="Pick your favourites" />
            <div className="club-grid club-grid-tight">
              {(fallbackClubs ?? []).map((card) => (
                <ClubCard key={card.name} {...card} />
              ))}
            </div>
          </GlassCard>

          <GlassCard className="content-card">
            <SectionTitle eyebrow="Fan summary" title="Your activity at a glance" />
            <div className="stat-grid">
              {(summaryCards.length > 0
                ? summaryCards
                : [
                    { label: 'prediction streak', value: 12 },
                    { label: 'clubs followed', value: 8 },
                    { label: 'badges earned', value: 14 },
                    { label: 'reward balance', value: 320 },
                  ]
              ).map((card) => (
                <StatCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  hint="Updated from your dashboard"
                />
              ))}
            </div>
          </GlassCard>
        </section>

        <section className="dashboard-grid">
          <GlassCard className="content-card">
            <SectionTitle eyebrow="Modules" title="What this role can do" />
            <div className="tag-cloud">
              {(modules.length > 0
                ? modules
                : ['Fixtures', 'Results', 'Standings', 'Tickets', 'Memberships']
              ).map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="content-card">
            <SectionTitle eyebrow="Quick actions" title="Start here" />
            <div className="tag-cloud">
              {(quickActions.length > 0
                ? quickActions
                : ['Browse fixtures', 'Buy a ticket', 'Join membership']
              ).map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>
          </GlassCard>
        </section>
      </main>
    </PageShell>
  );
}
