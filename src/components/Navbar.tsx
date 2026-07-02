import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  FiBell,
  FiChevronDown,
  FiGrid,
  FiLogOut,
  FiSearch,
  FiUser,
  FiX,
} from 'react-icons/fi';
import './Navbar.css';
import logo from '../assets/logo.png';
import { useAuth } from '../hooks/useAuth.js';
import { useCurrentUser } from '../hooks/useCurrentUser.js';
import { useAuthStore } from '../store/authStore.js';
import { getToken } from '../utils/tokenManager.js';

type NavbarLink = {
  label: string;
  route: string;
  showArrow?: boolean;
};

type NavbarProps = {
  links?: NavbarLink[];
};

const defaultNavLinks: NavbarLink[] = [
  { label: 'Sport', route: '/sports', showArrow: true },
  { label: 'Leagues', route: '/leagues', showArrow: true },
  { label: 'Clubs', route: '/clubs', showArrow: true },
  { label: 'Competitions', route: '/competitions', showArrow: true },
  { label: 'News', route: '/news' },
  { label: 'Club Memberships', route: '/memberships' },
  { label: 'Tickets', route: '/tickets' },
];

const leagueItems = [
  { name: 'Uganda Premier League', route: '/leagues/uganda-premier-league' },
  { name: 'Nile Special Premiership', route: '/leagues/nile-special-premiership' },
  { name: 'National Basketball League', route: '/leagues/national-basketball-league' },
  { name: 'Budo League', route: '/leagues/budo-league' },
  { name: 'SMACK League', route: '/leagues/smack-league' },
];

function Navbar({ links = defaultNavLinks }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [leaguesOpen, setLeaguesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const leaguesRef = useRef<HTMLLIElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const { currentUser } = useCurrentUser();

  const isAuthenticated = Boolean(accessToken || getToken());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (leaguesRef.current && !leaguesRef.current.contains(event.target as Node)) {
        setLeaguesOpen(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fullName = typeof user?.full_name === 'string' ? user.full_name.trim() : '';
  const firstName = typeof user?.first_name === 'string' ? user.first_name.trim() : '';
  const username = typeof user?.username === 'string' ? user.username.trim() : '';
  const email = typeof user?.email === 'string' ? user.email.trim() : '';

  const storeDisplayName =
    fullName ||
    firstName ||
    username ||
    (email.includes('@') ? email.split('@')[0] : '');

  const displayName =
    currentUser.name && currentUser.name !== 'Fan'
      ? currentUser.name
      : storeDisplayName || 'Fan';

  const initials =
    currentUser.avatarInitials && currentUser.avatarInitials !== 'F'
      ? currentUser.avatarInitials
      : displayName
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() ?? '')
          .join('') || 'F';

  const handleSearchToggle = () => {
    setSearchOpen((currentValue) => !currentValue);
    setSearchQuery('');
  };

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }

    if (event.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      handleSearchToggle();
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();

    navigate('/login', {
      replace: true,
      state: {
        message: 'You have been logged out.',
      },
    });
  };

  const goToProfileRoute = (route: string) => {
    setUserMenuOpen(false);
    navigate(route);
  };

  return (
    <nav className="navbar">
      <div
        className="navbar-logo"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      >
        <img src={logo} alt="League OS" className="logo-img" />
      </div>

      {searchOpen ? (
        <div className="search-bar">
          <FiSearch size={16} className="search-bar-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search competitions, clubs, players..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button className="search-close" onClick={handleSearchToggle} aria-label="Close search">
            <FiX size={16} />
          </button>
        </div>
      ) : (
        <ul className="navbar-links">
          {links.map((item) => {
            const hasLeagueDropdown = item.label === 'Leagues';

            return (
              <li
                key={item.label}
                ref={hasLeagueDropdown ? leaguesRef : null}
                className={`${isActive(item.route) ? 'active-link' : ''} ${
                  hasLeagueDropdown ? 'nav-dropdown-trigger' : ''
                }`}
                onClick={() => {
                  if (!hasLeagueDropdown) {
                    navigate(item.route);
                  }
                }}
                onMouseEnter={() => {
                  if (hasLeagueDropdown) {
                    setLeaguesOpen(true);
                  }
                }}
                onMouseLeave={() => {
                  if (hasLeagueDropdown) {
                    setLeaguesOpen(false);
                  }
                }}
              >
                {item.label}
                {item.showArrow ? <span className="arrow">▾</span> : null}

                {hasLeagueDropdown && leaguesOpen ? (
                  <ul className="nav-dropdown">
                    {leagueItems.map((league) => (
                      <li
                        key={league.route}
                        className="nav-dropdown-item"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(league.route);
                          setLeaguesOpen(false);
                        }}
                      >
                        {league.name}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <div className="navbar-actions">
        {!searchOpen && (
          <>
            <button
              className="search-icon"
              aria-label="Search"
              onClick={handleSearchToggle}
            >
              <FiSearch size={18} />
            </button>

            {isAuthenticated ? (
              <div className="navbar-auth-actions">
                <button
                  className="navbar-notification-btn"
                  aria-label="Notifications"
                  title="Notifications"
                  onClick={() => navigate('/profile/notifications')}
                >
                  <FiBell size={20} />
                </button>

                <div className="navbar-user-menu" ref={userMenuRef}>
                  <button
                    type="button"
                    className="navbar-user-chip"
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    onClick={() => setUserMenuOpen((currentValue) => !currentValue)}
                  >
                    <span className="navbar-user-avatar">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt="" aria-hidden="true" />
                      ) : (
                        initials
                      )}
                    </span>

                    <span className="navbar-user-copy">
                      <strong>{displayName}</strong>
                      <small>View Profile</small>
                    </span>

                    <FiChevronDown className="navbar-user-chevron" size={16} />
                  </button>

                  {userMenuOpen ? (
                    <div className="navbar-user-dropdown" role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => goToProfileRoute('/dashboard/fan')}
                      >
                        <FiGrid size={16} />
                        Dashboard
                      </button>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => goToProfileRoute('/profile')}
                      >
                        <FiUser size={16} />
                        View Profile
                      </button>

                      <button type="button" role="menuitem" onClick={handleLogout}>
                        <FiLogOut size={16} />
                        Log Out
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <button className="login-btn" onClick={() => navigate('/login')}>
                Log In
              </button>
            )}
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
