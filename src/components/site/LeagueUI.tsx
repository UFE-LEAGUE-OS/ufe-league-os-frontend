import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useAuth } from '../../hooks/useAuth.js';
import { useAuthStore } from '../../store/authStore.js';
import '../../styles/components.css';
import leagueMark from '../../assets/league-os-mark.svg';
import leagueWordmark from '../../assets/league-os-wordmark.svg';

type ShellProps = {
  children: ReactNode;
  className?: string;
};

type TopNavProps = {
  compact?: boolean;
};

type AuthTopBarProps = {
  menuItems?: string[];
  menuHref?: string;
  primaryActionLabel?: string;
  primaryActionTo?: string;
};

type LeagueLogoProps = {
  compact?: boolean;
  stacked?: boolean;
  className?: string;
};

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

type StatProps = {
  label: string;
  value: string;
  hint?: string;
};

type MatchProps = {
  home: string;
  away: string;
  time: string;
  date: string;
  score?: string;
  accent?: string;
};

type ClubProps = {
  name: string;
  label: string;
  tone?: string;
};

type RowProps = {
  left: string;
  middle: string;
  right: string;
};

const publicNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/register', label: 'Join' },
  { to: '/login', label: 'Login' },
  { to: '/dashboard/fan', label: 'Experience' },
  { to: '/profile', label: 'Profile' },
];

const loggedInNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/dashboard/fan', label: 'Dashboard' },
  { to: '/competitions', label: 'Competitions' },
  { to: '/news', label: 'News' },
  { to: '/profile', label: 'Profile' },
];

function getStoredAccessToken() {
  return localStorage.getItem('league_os_access_token') || localStorage.getItem('access_token');
}

function getUserDisplayName(user: Record<string, unknown> | null) {
  const fullName = typeof user?.full_name === 'string' ? user.full_name.trim() : '';
  const firstName = typeof user?.first_name === 'string' ? user.first_name.trim() : '';
  const email = typeof user?.email === 'string' ? user.email.trim() : '';

  if (fullName) return fullName;
  if (firstName) return firstName;
  if (email.includes('@')) return email.split('@')[0] ?? 'Fan';

  return 'Fan';
}

function getUserInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'F';
}

export function PageShell({ children, className = '' }: ShellProps) {
  return (
    <div className={`league-shell ${className}`.trim()}>
      <div className="league-orb league-orb-a" />
      <div className="league-orb league-orb-b" />
      <div className="league-grid" />
      {children}
    </div>
  );
}

export function TopNav({ compact = false }: TopNavProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = Boolean(accessToken || getStoredAccessToken());
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(displayName);
  const visibleLinks = isAuthenticated ? loggedInNavLinks : publicNavLinks;

  const handleLogout = () => {
    logout();
    navigate('/login', {
      replace: true,
      state: {
        message: 'You have been logged out.',
      },
    });
  };

  return (
    <header className={`topbar ${compact ? 'topbar-compact' : ''}`.trim()}>
      <Link to="/" className="brand-lockup" aria-label="League OS home">
        <LeagueLogo compact />
      </Link>

      <nav className="topnav">
        {visibleLinks.map((link) => (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="topbar-actions">
        <span className="search-chip">Search</span>

        {isAuthenticated ? (
          <div className="topbar-auth-actions">
            <button type="button" className="topbar-notification-btn" aria-label="Notifications">
              <NotificationsNoneOutlinedIcon />
              <span className="topbar-notification-badge">3</span>
            </button>

            <Link to="/profile" className="topbar-profile-chip" aria-label="View profile">
              <span className="topbar-profile-avatar">{initials}</span>
              <span className="topbar-profile-copy">
                <strong>{displayName}</strong>
                <small>View Profile</small>
              </span>
              <KeyboardArrowDownIcon className="topbar-profile-chevron" />
            </Link>

            <button type="button" className="topbar-logout-button" onClick={handleLogout}>
              <LogoutOutlinedIcon />
              Logout
            </button>
          </div>
        ) : (
          <Link to="/register" className="button button-primary button-small">
            Join now
          </Link>
        )}
      </div>
    </header>
  );
}

export function AuthTopBar({
  menuItems = ['Sport', 'Leagues', 'Clubs', 'Competitions', 'News', 'Membership', 'Tickets'],
  menuHref = '#register',
  primaryActionLabel = 'Sign Up',
  primaryActionTo = '/register',
}: AuthTopBarProps) {
  return (
    <header className="register-header">
      <Link to="/" className="register-brand" aria-label="League OS home">
        <LeagueLogo compact />
      </Link>

      <nav className="register-nav" aria-label="Primary">
        {menuItems.map((item) => (
          <a key={item} href={menuHref}>
            <span>{item}</span>
            <KeyboardArrowDownIcon className="nav-caret" aria-hidden="true" />
          </a>
        ))}
      </nav>

      <div className="register-actions">
        <button type="button" className="register-search" aria-label="Search">
          <SearchOutlinedIcon />
        </button>
        <AuthActionButton to={primaryActionTo}>{primaryActionLabel}</AuthActionButton>
      </div>
    </header>
  );
}

export function AuthActionButton({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className="button button-primary button-small register-signup">
      {children}
    </Link>
  );
}

export function LeagueLogo({ compact = false, stacked = false, className = '' }: LeagueLogoProps) {
  return (
    <span
      className={`league-logo ${compact ? 'league-logo-compact' : ''} ${stacked ? 'league-logo-stacked' : ''} ${className}`.trim()}
    >
      <img
        src={stacked ? leagueMark : leagueWordmark}
        alt="League OS"
        className={`league-logo-image ${stacked ? 'league-logo-image-stacked' : 'league-logo-image-wordmark'}`}
      />
    </span>
  );
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return <section className={`glass-card ${className}`.trim()}>{children}</section>;
}

export function HeroBadge({ label }: { label: string }) {
  return <span className="hero-badge">{label}</span>;
}

export function SectionTitle({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: string;
}) {
  return (
    <div className="section-title">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>
        {title}
        {accent ? <span>{accent}</span> : null}
      </h2>
      {description ? <p className="section-copy">{description}</p> : null}
    </div>
  );
}

export function StatCard({ label, value, hint }: StatProps) {
  return (
    <div className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

export function MatchCard({ home, away, time, date, score, accent }: MatchProps) {
  return (
    <article className={`match-card ${accent ?? ''}`.trim()}>
      <div className="match-teams">
        <div className="team-pill">
          <span>{home}</span>
        </div>
        <div className="versus">
          <span>VS</span>
        </div>
        <div className="team-pill team-pill-muted">
          <span>{away}</span>
        </div>
      </div>
      <div className="match-meta">
        <strong>{score ?? time}</strong>
        <span>{score ? time : date}</span>
      </div>
    </article>
  );
}

export function ClubCard({ name, label, tone }: ClubProps) {
  return (
    <article className={`club-card ${tone ?? ''}`.trim()}>
      <div className="club-mark" />
      <strong>{name}</strong>
      <span>{label}</span>
    </article>
  );
}

export function FixtureRow({ left, middle, right }: RowProps) {
  return (
    <div className="fixture-row">
      <span>{left}</span>
      <span>{middle}</span>
      <strong>{right}</strong>
    </div>
  );
}

export function DetailRow({
  title,
  value,
  tone = 'neutral',
}: {
  title: string;
  value: string;
  tone?: 'neutral' | 'good' | 'warn';
}) {
  return (
    <div className={`detail-row detail-row-${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}

export function ButtonLink({
  to,
  children,
  variant = 'primary',
}: {
  to: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
}) {
  return (
    <Link to={to} className={`button button-${variant}`}>
      {children}
    </Link>
  );
}
