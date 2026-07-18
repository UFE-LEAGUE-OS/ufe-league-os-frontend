import { Link, useNavigate } from 'react-router-dom';

import logo from '../../assets/logos/league-os-horizontal.png';
import { useAuth } from '../../hooks/useAuth.js';
import './AccessUnavailablePage.css';

export default function AccessUnavailablePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <main className="access-unavailable-page">
      <section
        aria-labelledby="access-unavailable-title"
        className="access-unavailable-card"
      >
        <img
          alt="League OS"
          className="access-unavailable-logo"
          src={logo}
        />

        <p className="access-unavailable-eyebrow">
          Account access
        </p>
        <h1 id="access-unavailable-title">
          Your dashboard is not available yet
        </h1>
        <p>
          This account currently has no valid dashboard assignment. You can
          review your profile, contact support, or sign out and try another
          account.
        </p>

        <div className="access-unavailable-actions">
          <Link to="/profile">Open profile</Link>
          <Link to="/support">Get support</Link>
          <button
            onClick={handleLogout}
            type="button"
          >
            Log out
          </button>
        </div>
      </section>
    </main>
  );
}
