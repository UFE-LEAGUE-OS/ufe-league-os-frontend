import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import StadiumOutlinedIcon from '@mui/icons-material/StadiumOutlined';
import SportsSoccerOutlinedIcon from '@mui/icons-material/SportsSoccerOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import Footer from '../../components/Footer.js';
import { useAuthStore } from '../../store/authStore.js';
import { fetchDashboardData } from '../../services/dashboardService.js';
import { PageShell } from '../../components/site/LeagueUI.js';
import leagueWordmark from '../../assets/league-os-wordmark.svg';
import rugbyImage from '../../assets/images/rugby.jpeg';
import heathens from '../../assets/platinum-heathens.jpg';
import pirates from '../../assets/standic-pirates.png';
import rhinos from '../../assets/impis.jpg';
import basketballCard from '../../assets/basketball-card.png';
import clubsImage from '../../assets/clubs.png';
import fixturesImage from '../../assets/fixtures.png';
import standingsImage from '../../assets/standings.png';
import resultsImage from '../../assets/results.png';
import '../../styles/pages/fan/dashboard.css';

type TeamCard = {
  name: string;
  image_key?: string;
  image_url?: string;
  logo_url?: string;
  tone?: string;
  website_url?: string;
  official_url?: string;
};

type NewsCard = {
  tag: string;
  image: string;
  image_key?: string;
  title: string;
  copy: string;
  meta: string;
  comments: string;
};

type SummaryCard = {
  label: string;
  value: unknown;
};

type LeagueTableRow = {
  position: number;
  name: string;
  points: string;
};

function getFeatureIcon(label: string) {
  switch (label) {
    case 'Fixtures':
      return CalendarMonthOutlinedIcon;
    case 'Rankings':
      return WorkspacePremiumOutlinedIcon;
    case 'Gear':
      return ConfirmationNumberOutlinedIcon;
    case 'Venues':
      return StadiumOutlinedIcon;
    default:
      return SportsSoccerOutlinedIcon;
  }
}
function getTeamImage(team: TeamCard) {
  const directImage = team.logo_url ?? team.image_url;

  if (directImage) {
    return directImage;
  }

  const key = (team.image_key ?? team.name ?? '').toLowerCase();

  switch (key) {
    case 'heathens':
      return heathens;
    case 'pirates':
      return pirates;
    case 'rhinos':
      return rhinos;
    default:
      return clubsImage;
  }
}

function getTeamWebsite(team: TeamCard) {
  return team.website_url ?? team.official_url ?? '';
}

function getNewsImage(imageKey?: string) {
  switch ((imageKey ?? '').toLowerCase()) {
    case 'fantasy':
      return basketballCard;
    case 'news':
    default:
      return rugbyImage;
  }
}

function getTeamTone(name: string) {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (normalized.includes('heathens')) {
    return 'tone-heathens';
  }

  if (normalized.includes('pirates')) {
    return 'tone-pirates';
  }

  if (normalized.includes('rhinos')) {
    return 'tone-rhinos';
  }

  return 'tone-default';
}

function getDisplayName(user: Record<string, unknown> | null) {
  const fullName = typeof user?.full_name === 'string' ? user.full_name.trim() : '';
  const firstName = typeof user?.first_name === 'string' ? user.first_name.trim() : '';
  const email = typeof user?.email === 'string' ? user.email.trim() : '';

  if (fullName) {
    return fullName;
  }

  if (firstName) {
    return firstName;
  }

  if (email.includes('@')) {
    return email.split('@')[0] ?? 'Fan';
  }

  return 'Fan';
}

function getAvatarUrl(user: Record<string, unknown> | null) {
  return typeof user?.avatar_url === 'string' ? user.avatar_url : '';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function getQuickLinkMeta(label: string) {
  switch (label.toLowerCase()) {
    case 'fixtures':
      return { icon: CalendarMonthOutlinedIcon, image: fixturesImage };
    case 'rankings':
    case 'standings':
      return { icon: WorkspacePremiumOutlinedIcon, image: standingsImage };
    case 'gear':
    case 'tickets':
      return { icon: ConfirmationNumberOutlinedIcon, image: clubsImage };
    case 'venues':
      return { icon: StadiumOutlinedIcon, image: resultsImage };
    default:
      return { icon: SportsSoccerOutlinedIcon, image: clubsImage };
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const routeMessage = (location.state as { message?: string } | null)?.message ?? '';
  const profileUser = ((dashboardResponse?.user as Record<string, unknown> | undefined) ??
    (user as Record<string, unknown> | null)) as Record<string, unknown> | null;
  const displayName = getDisplayName(profileUser);
  const avatarUrl = getAvatarUrl(profileUser);
  const avatarFallback = getInitials(displayName);
  const dashboard = (dashboardResponse?.dashboard as Record<string, unknown> | undefined) ?? null;
  const dashboardDescription =
    (dashboard?.description as string | undefined) ??
    'Follow teams, view fixtures, buy tickets, and manage memberships.';
  const featuredTeams = (dashboard?.featured_teams as TeamCard[] | undefined) ?? [];
  const backendFollowedTeams = (dashboard?.followed_teams as TeamCard[] | undefined) ?? [];
  const summaryCards = (dashboard?.summary_cards as SummaryCard[] | undefined) ?? [];
  const displaySummaryCards = summaryCards;
  const followedTeams = backendFollowedTeams.length > 0 ? backendFollowedTeams : featuredTeams;
  const leagueTable = (dashboard?.league_table as LeagueTableRow[] | undefined) ?? [];
  const modules = (dashboard?.modules as string[] | undefined) ?? [];
  const quickActions = (dashboard?.quick_actions as string[] | undefined) ?? [];
  const liveMatch = (dashboard?.live_match as Record<string, unknown> | undefined) ?? null;
  const newsCards = (dashboard?.news_cards as NewsCard[] | undefined) ?? [];
  const liveMiniCards =
    modules.slice(0, 4).map((label) => {
      const meta = getQuickLinkMeta(label);
      return {
        label,
        icon: meta.icon,
        image: meta.image,
      };
    });

  const handleLogout = () => {
    clearAuth();
    navigate('/login', {
      replace: true,
      state: {
        message: 'You have been logged out.',
      },
    });
  };

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return undefined;
    }

    const closeProfileMenu = (event: MouseEvent) => {
      if (profileMenuRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsProfileMenuOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeProfileMenu);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeProfileMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isProfileMenuOpen]);

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

  return (
    <PageShell className="dashboard-page dashboard-redesign">
      <main className="fan-dashboard">
        <header className="dashboard-nav">
          <Link to="/" className="dashboard-brand dashboard-brand-wide" aria-label="League OS home">
            <img src={leagueWordmark} alt="League OS" className="dashboard-brand-wordmark" />
          </Link>

          <nav className="dashboard-nav-links" aria-label="Primary">
            {['Overview', 'Clubs', 'Competitions', 'Unions', 'News'].map((item, index) => (
              <Link
                key={item}
                to={index === 0 ? '/dashboard/fan' : '/dashboard/fan'}
                className={index === 0 ? 'is-active' : undefined}
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="dashboard-nav-tools">
            <label className="dashboard-search" aria-label="Search leagues">
              <SearchOutlinedIcon />
              <input type="text" placeholder="Search leagues..." />
            </label>
            <button type="button" className="icon-button" aria-label="Notifications">
              <NotificationsNoneOutlinedIcon />
            </button>
            <div className="dashboard-profile-stack">
              {routeMessage ? (
                <p className="dashboard-user-status" role="status" aria-live="polite">
                  {routeMessage}
                </p>
              ) : null}
              <div className="dashboard-profile-menu-wrap" ref={profileMenuRef}>
                <button
                  type="button"
                  className="dashboard-user-chip"
                  aria-label="Open profile menu"
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                >
                  <span className="dashboard-user-avatar">
                    {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{avatarFallback}</span>}
                  </span>
                  <span className="dashboard-user-name">{displayName}</span>
                </button>

                {isProfileMenuOpen ? (
                  <div className="dashboard-profile-menu" role="menu">
                    <div className="dashboard-profile-menu-header">
                      <span className="dashboard-user-avatar dashboard-user-avatar-large">
                        {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{avatarFallback}</span>}
                      </span>
                      <div>
                        <strong>{displayName}</strong>
                        <span>Fan profile</span>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="dashboard-profile-menu-item"
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <PhotoCameraOutlinedIcon />
                      Change picture
                    </Link>
                    <button
                      type="button"
                      className="dashboard-profile-menu-item dashboard-profile-menu-logout"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <LogoutOutlinedIcon />
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <section className="dashboard-intro">
          <div className="dashboard-greeting">
            <h1>Hello, {displayName}!</h1>
            <span className="dashboard-greeting-sub">Your fan dashboard is ready.</span>
            <span className="dashboard-greeting-line">{dashboardDescription}</span>
          </div>

          <div className="dashboard-intro-actions">
            <Link to="/dashboard/sponsor" className="dashboard-sponsor-button">
              <WorkspacePremiumOutlinedIcon />
              Become a sponsor
            </Link>
          </div>
        </section>

        <section className="dashboard-live-summary">
          <div className="summary-copy">
            <h2>Live dashboard data</h2>
            <p>Your latest teams, fixtures, memberships, and tickets are summarized here.</p>
          </div>

          <div className="summary-card-grid">
            {displaySummaryCards.map((card) => (
              <article key={card.label} className="summary-card">
                <strong>{String(card.value)}</strong>
                <span>{card.label}</span>
              </article>
            ))}
          </div>

          <div className="dashboard-action-pills" aria-label="Quick actions">
            {quickActions.map((action) => (
              <span key={action} className="dashboard-action-pill">
                {action}
              </span>
            ))}
          </div>
        </section>

        <section className="dashboard-followed-teams" aria-labelledby="followed-teams-title">
          <div className="dashboard-section-heading">
            <h2 id="followed-teams-title">Followed teams</h2>
          </div>
          <div className="dashboard-teams-row">
            {followedTeams.map((team) => {
              const websiteUrl = getTeamWebsite(team);
              const cardClassName = `team-card ${team.tone ?? getTeamTone(team.name)}`;

              return websiteUrl ? (
                <a
                  key={team.name}
                  className={cardClassName}
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${team.name} official website`}
                >
                  <img src={getTeamImage(team)} alt={`${team.name} logo`} className="team-card-image" />
                  <span className="team-card-label">{team.name}</span>
                </a>
              ) : (
                <article key={team.name} className={cardClassName}>
                  <img src={getTeamImage(team)} alt={`${team.name} logo`} className="team-card-image" />
                  <span className="team-card-label">{team.name}</span>
                </article>
              );
            })}
          </div>
        </section>

        <section className="hero-match-card">
          <div className="hero-match-glow" />
          <div className="hero-match-content">
            <div className="match-context">
              <span className="live-pill">LIVE NOW</span>
              <span>{String(liveMatch?.league ?? '')}</span>
            </div>

            <div className="match-main">
              <div className="match-copy">
                <h2>
                  {String(liveMatch?.home ?? '')} vs {String(liveMatch?.away ?? '')}
                </h2>
                <p>
                  {String(liveMatch?.venue ?? '')} • {String(liveMatch?.period ?? '')} •{' '}
                  {String(liveMatch?.minute ?? '')}
                </p>
              </div>

              <div className="match-score">
                <div>
                  <strong>{String(liveMatch?.score_home ?? '')}</strong>
                  <span>{String(liveMatch?.home ?? '')}</span>
                </div>
                <span className="score-divider" aria-hidden="true" />
                <div>
                  <strong>{String(liveMatch?.score_away ?? '')}</strong>
                  <span>{String(liveMatch?.away ?? '')}</span>
                </div>
              </div>
            </div>

            <div className="match-actions">
              <Link to="/dashboard/fan" className="match-button match-button-primary">
                Open Match Centre
                <ChevronRightIcon />
              </Link>
              <button type="button" className="match-button match-button-secondary">
                Betting Odds
              </button>
              <Link to="/dashboard/fan" className="match-button match-button-primary match-button-compact">
                Fixtures
                <ChevronRightIcon />
              </Link>
            </div>
          </div>
        </section>

        <section className="dashboard-main-grid">
          <div className="dashboard-sidebar">
            <div className="dashboard-mini-icons">
              {liveMiniCards.map((item) => {
                const Icon = getFeatureIcon(item.label);

                return (
                  <article
                    key={item.label}
                    className="mini-icon-card"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(7, 8, 18, 0.18), rgba(7, 8, 18, 0.78)), url(${item.image})`,
                    }}
                  >
                    <span className="mini-icon">
                      <Icon />
                    </span>
                    <span>{item.label}</span>
                  </article>
                );
              })}
            </div>

            <article className="league-table-card">
              <div className="section-heading">
                <h3>League Table</h3>
                <button type="button">Full View</button>
              </div>

              <div className="league-table-list">
                {leagueTable.map((row, index) => (
                  <div key={row.name} className={`league-table-row ${index === 0 ? 'is-highlighted' : ''}`}>
                    <span className="league-table-position">{row.position}</span>
                    <span className="league-table-name">{row.name}</span>
                    <strong className="league-table-points">{row.points}</strong>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="news-column">
            <div className="section-heading section-heading-news">
              <h2>Latest News</h2>
              <div className="section-heading-controls">
                <button type="button" aria-label="Previous news">
                  <ChevronLeftIcon />
                </button>
                <button type="button" aria-label="Next news">
                  <ChevronRightIcon />
                </button>
              </div>
            </div>

            <div className="news-grid">
              {newsCards.map((card) => (
                <article key={card.title} className="news-card">
                  <div className="news-image-wrap">
                    <span className="news-tag">{card.tag}</span>
                    <img src={getNewsImage(card.image_key)} alt="" className="news-image" />
                  </div>
                  <div className="news-body">
                    <h3>{card.title}</h3>
                    <p>{card.copy}</p>
                    <div className="news-meta">
                      <span>{card.meta}</span>
                      <span>Comments {card.comments}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="dashboard-footer-wrap">
          <Footer />
        </div>

        {isLoading ? <div className="dashboard-status">Loading your dashboard...</div> : null}
        {errorMessage ? <div className="dashboard-status dashboard-status-warn">{errorMessage}</div> : null}
      </main>
    </PageShell>
  );
}
