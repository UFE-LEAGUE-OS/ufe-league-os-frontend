import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import './Navbar.css';
import logo from '../assets/logo.png';

function Navbar() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchToggle = () => {
    setSearchOpen((current) => !current);
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

  return (
    <nav className="navbar">
      <div className="navbar-logo">
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
          <li>Sport <span className="arrow">▾</span></li>
          <li>Leagues <span className="arrow">▾</span></li>
          <li>Teams <span className="arrow">▾</span></li>
          <li onClick={() => navigate('/competitions')}>
            Competitions <span className="arrow">▾</span>
          </li>
          <li onClick={() => navigate('/news')}>News</li>
          <li>Membership</li>
          <li>Tickets</li>
        </ul>
      )}

      <div className="navbar-actions">
        <button
          className="search-icon"
          aria-label={searchOpen ? 'Close search' : 'Search'}
          onClick={handleSearchToggle}
        >
          {searchOpen ? <FiX size={18} /> : <FiSearch size={18} />}
        </button>
        <button className="login-btn" onClick={() => navigate('/login')}>Login</button>
      </div>
    </nav>
  );
}

export default Navbar;
