import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  FiBell,
  FiChevronDown,
  FiGrid,
  FiLogOut,
  FiMenu,
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

type NavbarDropdownItem = {
  name: string;
  route: string;
};

type NavbarLink = {
  label: string;
  route: string;
  showArrow?: boolean;
  dropdownItems?: NavbarDropdownItem[];
};

type NavbarProps = {
  links?: NavbarLink[];
  showSignup?: boolean;
};

const leagueItems: NavbarDropdownItem[] = [
  { name: 'Uganda Premier League', route: '/leagues/uganda-premier-league' },
  { name: 'Nile Special Premiership', route: '/leagues/nile-special-premiership' },
  { name: 'National Basketball League', route: '/leagues/national-basketball-league' },
  { name: 'Budo League', route: '/leagues/budo-league' },
  { name: 'SMACK League', route: '/leagues/smack-league' },
];

const matchItems: NavbarDropdownItem[] = [
  { name: 'Fixtures', route: '/fixtures' },
  { name: 'Results', route: '/results' },
  { name: 'Standings', route: '/standings' },
];

export const publicNavLinks: NavbarLink[] = [
  { label: 'Sport', route: '/sports' },
  { label: 'Leagues', route: '/leagues/uganda-premier-league', showArrow: true, dropdownItems: leagueItems },
  { label: 'Clubs', route: '/clubs' },
  { label: 'Matches', route: '/fixtures', showArrow: true, dropdownItems: matchItems },
  { label: 'Competitions', route: '/competitions' },
  { label: 'News', route: '/news' },
  { label: 'Tickets', route: '/tickets' },
];

const defaultNavLinks = publicNavLinks;

function Navbar({ links = defaultNavLinks, showSignup = false }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownLabel, setOpenDropdownLabel] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navListRef = useRef<HTMLUListElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const { currentUser } = useCurrentUser();

  const isAuthenticated = Boolean(accessToken || getToken());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navListRef.current && !navListRef.current.contains(event.target as Node)) {
        setOpenDropdownLabel(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    setOpenDropdownLabel(null);
    setMobileMenuOpen(false);
    logout();
    navigate('/login', {
      replace: true,
      state: { message: 'You have been logged out.' },
    });
  };

  const goToProfileRoute = (route: string) => {
    setUserMenuOpen(false);
    setOpenDropdownLabel(null);
    navigate(route);
  };

  return (
    <>
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
          <ul className="navbar-links" ref={navListRef}>
            {links.map((item) => {
              const hasDropdown = Boolean(item.dropdownItems?.length);
              const dropdownOpen = openDropdownLabel === item.label;
              const dropdownIsActive = item.dropdownItems?.some((dropdownItem) => isActive(dropdownItem.route));

              return (
                <li
                  key={item.label}
                  className={`${isActive(item.route) || dropdownIsActive ? 'active-link' : ''} ${
                    hasDropdown ? 'nav-dropdown-trigger' : ''
                  }`}
                  onClick={() => {
                    if (hasDropdown) {
                      setOpenDropdownLabel((currentLabel) =>
                        currentLabel === item.label ? null : item.label,
                      );
                      return;
                    }
                    navigate(item.route);
                  }}
                  onMouseEnter={() => { if (hasDropdown) setOpenDropdownLabel(item.label); }}
                  onMouseLeave={() => { if (hasDropdown) setOpenDropdownLabel(null); }}
                >
                  {item.label}
                  {item.showArrow || hasDropdown ? <span className="arrow">▾</span> : null}
                  {hasDropdown && dropdownOpen ? (
                    <ul className="nav-dropdown">
                      {item.dropdownItems?.map((dropdownItem) => (
                        <li
                          key={dropdownItem.route}
                          className="nav-dropdown-item"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(dropdownItem.route);
                            setOpenDropdownLabel(null);
                          }}
                        >
                          {dropdownItem.name}
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
              <button className="search-icon" aria-label="Search" onClick={handleSearchToggle}>
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
                      onClick={() => setUserMenuOpen((v) => !v)}
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
                        <button type="button" role="menuitem" onClick={() => goToProfileRoute('/dashboard/fan')}>
                          <FiGrid size={16} />
                          Dashboard
                        </button>
                        <button type="button" role="menuitem" onClick={() => goToProfileRoute('/profile')}>
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
                <div className="auth-buttons">
                  <button className="login-btn" onClick={() => navigate('/login')}>
                    Log In
                  </button>
                  {showSignup && (
                    <button className="signup-btn" onClick={() => navigate('/register')}>
                      Sign Up
                    </button>
                  )}
                </div>
              )}

              <button
                className="navbar-hamburger"
                aria-label="Toggle menu"
                onClick={() => setMobileMenuOpen((v) => !v)}
              >
                {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </>
          )}
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          {links.map((item) => {
            const hasDropdown = Boolean(item.dropdownItems?.length);
            const dropdownIsActive = item.dropdownItems?.some((dropdownItem) => isActive(dropdownItem.route));

            return (
              <div className="navbar-mobile-group" key={item.label}>
                <button
                  className={`navbar-mobile-link ${
                    isActive(item.route) || dropdownIsActive ? 'active-link' : ''
                  }`}
                  onClick={() => {
                    navigate(item.route);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </button>
                {hasDropdown ? (
                  <div className="navbar-mobile-submenu">
                    {item.dropdownItems?.map((dropdownItem) => (
                      <button
                        key={dropdownItem.route}
                        className={`navbar-mobile-sublink ${isActive(dropdownItem.route) ? 'active-link' : ''}`}
                        onClick={() => {
                          navigate(dropdownItem.route);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {dropdownItem.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
          {isAuthenticated ? (
            <>
              <button className="navbar-mobile-link" onClick={() => { navigate('/dashboard/fan'); setMobileMenuOpen(false); }}>
                <FiGrid size={16} /> Dashboard
              </button>
              <button className="navbar-mobile-link" onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
                <FiUser size={16} /> Profile
              </button>
              <button className="navbar-mobile-link navbar-mobile-logout" onClick={handleLogout}>
                <FiLogOut size={16} /> Log Out
              </button>
            </>
          ) : (
            <button className="navbar-mobile-link navbar-mobile-login" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
              Log In
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;