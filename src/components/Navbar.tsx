import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FiBell, FiChevronDown, FiLogOut, FiSearch, FiX } from 'react-icons/fi';
import './Navbar.css';
import logo from '../assets/logo.png';
import { useAuth } from '../hooks/useAuth.js';
import { useAuthStore } from '../store/authStore.js';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { logout } = useAuth();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = Boolean(
    accessToken ||
      localStorage.getItem('league_os_access_token') ||
      localStorage.getItem('access_token'),
  );

  const fullName = typeof user?.full_name === 'string' ? user.full_name.trim() : '';
  const firstName = typeof user?.first_name === 'string' ? user.first_name.trim() : '';
  const email = typeof user?.email === 'string' ? user.email.trim() : '';
  const displayName = fullName || firstName || (email.includes('@') ? email.split('@')[0] : 'Fan');
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'F';

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    setSearchQuery('');
  };

  const handleKeyDown = (e: { key: string }) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      handleSearchToggle();
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

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
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button className="search-close" onClick={handleSearchToggle}>
            <FiX size={16} />
          </button>
        </div>
      ) : (
        <ul className="navbar-links">
          <li
            className={isActive('/sports') ? 'active-link' : ''}
            onClick={() => navigate('/sports')}
          >
            Sport <span className="arrow">▾</span>
          </li>
          <li className={isActive('/leagues') ? 'active-link' : ''}>
            Leagues <span className="arrow">▾</span>
          </li>
          <li
            className={isActive('/clubs') ? 'active-link' : ''}
            onClick={() => navigate('/clubs')}
          >
            Clubs <span className="arrow">▾</span>
          </li>
          <li
            className={isActive('/competitions') ? 'active-link' : ''}
            onClick={() => navigate('/competitions')}
          >
            Competitions <span className="arrow">▾</span>
          </li>
          <li
            className={isActive('/news') ? 'active-link' : ''}
            onClick={() => navigate('/news')}
          >
            News
          </li>
          <li
            className={isActive('/memberships') ? 'active-link' : ''}
            onClick={() => navigate('/memberships')}
          >
            Membership
          </li>
          <li
            className={isActive('/tickets') ? 'active-link' : ''}
            onClick={() => navigate('/tickets')}
          >
            Tickets
          </li>
        </ul>
      )}

      <div className="navbar-actions">
        <button
          className="search-icon"
          aria-label="Search"
          onClick={handleSearchToggle}
        >
          {searchOpen ? <FiX size={18} /> : <FiSearch size={18} />}
        </button>

        {isAuthenticated ? (
          <div className="navbar-auth-actions">
            <button className="navbar-notification-btn" aria-label="Notifications">
              <FiBell size={20} />
              <span className="navbar-notification-badge">3</span>
            </button>

            <button className="navbar-user-chip" onClick={() => navigate('/profile')}>
              <span className="navbar-user-avatar">{initials}</span>
              <span className="navbar-user-copy">
                <strong>{displayName}</strong>
                <small>View Profile</small>
              </span>
              <FiChevronDown className="navbar-user-chevron" size={16} />
            </button>

            <button className="logout-btn" onClick={handleLogout}>
              <FiLogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <button className="login-btn" onClick={() => navigate('/login')}>
            Log In
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;