import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './Navbar.css';
import logo from '../assets/logo.png';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
          <li className={isActive('/sport') ? 'active-link' : ''}>
            Sport <span className="arrow">▾</span>
          </li>
          <li className={isActive('/leagues') ? 'active-link' : ''}>
            Leagues <span className="arrow">▾</span>
          </li>
          <li className={isActive('/teams') ? 'active-link' : ''}>
            Teams <span className="arrow">▾</span>
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
          <li className={isActive('/membership') ? 'active-link' : ''}>
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
        <button className="login-btn" onClick={() => navigate('/login')}>
          Log In
        </button>
      </div>
    </nav>
  );
}

export default Navbar;