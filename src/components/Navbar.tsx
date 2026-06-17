import './Navbar.css';
import logo from '../assets/logo.png';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="League OS" className="logo-img" />
      </div>

      <ul className="navbar-links">
        <li>Sport <span className="arrow">▾</span></li>
        <li>Leagues <span className="arrow">▾</span></li>
        <li>Teams <span className="arrow">▾</span></li>
        <li>Competitions <span className="arrow">▾</span></li>
        <li>News</li>
        <li>Membership</li>
        <li>Tickets</li>
      </ul>

      <div className="navbar-actions">
        <button className="search-icon" aria-label="Search">🔍</button>
        <button className="login-btn">Login</button>
      </div>
    </nav>
  );
}

export default Navbar;