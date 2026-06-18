import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiUser } from 'react-icons/fi';
import './CompetitionsNavbar.css';
import logo from '../assets/logo.png';

function CompetitionsNavbar() {
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState('Competitions');

  const navLinks = ['Overview', 'Clubs', 'Competitions', 'Unions', 'News'];

  return (
    <nav className="comp-navbar">
      <div
        className="comp-navbar-logo"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      >
        <img src={logo} alt="League OS" className="comp-logo-img" />
      </div>

      <ul className="comp-navbar-links">
        {navLinks.map((link) => (
          <li
            key={link}
            className={`comp-nav-item ${activeLink === link ? 'active' : ''}`}
            onClick={() => setActiveLink(link)}
          >
            {link}
          </li>
        ))}
      </ul>

      <div className="comp-navbar-actions">
        <div className="comp-search-wrapper">
          <input
            type="text"
            className="comp-search-input"
            placeholder="Search leagues..."
          />
        </div>
        <button className="comp-icon-btn" aria-label="Notifications">
          <FiBell size={18} />
        </button>
        <button className="comp-icon-btn" aria-label="Profile">
          <FiUser size={18} />
        </button>
        <button
          className="comp-login-btn"
          onClick={() => navigate('/login')}
        >
          Log In
        </button>
        <button
          className="comp-signup-btn"
          onClick={() => navigate('/register')}
        >
          Sign Up
        </button>
      </div>
    </nav>
  );
}

export default CompetitionsNavbar;