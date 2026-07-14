import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiTag,
  FiBell,
  FiBarChart2,
  FiUsers,
  FiCreditCard,
  FiSettings,
  FiHelpCircle,
  FiZap,
  FiLayout,
  FiUser,
} from 'react-icons/fi';
import logo from '../assets/logo.png';
import './SponsorSidebar.css';

const sidebarLinks = [
  { label: 'Dashboard', icon: FiGrid, route: '/sponsor/dashboard' },
  { label: 'Profile', icon: FiUser, route: '/sponsor/profile' },
  { label: 'Sponsorship Hub', icon: FiLayout, route: '/sponsorhub' },
  { label: 'Packages', icon: FiTag, route: '/sponsor/packages' },
  { label: 'Payments', icon: FiCreditCard, route: '/sponsor/payments' },
  { label: 'Campaigns', icon: FiBell, route: '/sponsor/campaigns' },
  { label: 'Analytics', icon: FiBarChart2, route: '/sponsor/analytics' },
  { label: 'My Team', icon: FiUsers, route: '/sponsor/team' },
];

const bottomLinks = [
  { label: 'Settings', icon: FiSettings, route: '/sponsor/settings' },
  { label: 'Help & Support', icon: FiHelpCircle, route: '/sponsor/support' },
];

export default function SponsorSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (route: string) => location.pathname === route;

  return (
    <aside className="sp-sidebar">
      <div className="sp-sidebar-logo" onClick={() => navigate('/')}>
        <img src={logo} alt="League OS" className="sp-logo-img" />
      </div>

      <nav className="sp-sidebar-nav">
        <ul className="sp-nav-list">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li
                key={link.route}
                className={`sp-nav-item ${isActive(link.route) ? 'sp-nav-item-active' : ''}`}
                onClick={() => navigate(link.route)}
              >
                <Icon size={18} className="sp-nav-icon" />
                <span>{link.label}</span>
              </li>
            );
          })}
        </ul>
        <div className="sp-sidebar-divider" />
        <ul className="sp-nav-list">
          {bottomLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li
                key={link.route}
                className={`sp-nav-item ${isActive(link.route) ? 'sp-nav-item-active' : ''}`}
                onClick={() => navigate(link.route)}
              >
                <Icon size={18} className="sp-nav-icon" />
                <span>{link.label}</span>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="sp-sidebar-cta">
        <div className="sp-cta-icon-wrap">
          <FiZap size={20} className="sp-cta-icon" />
        </div>
        <h4 className="sp-cta-title">Ready to Get Started?</h4>
        <p className="sp-cta-desc">
          Create your campaign and connect with Uganda's top sports properties.
        </p>
        <button
          className="sp-cta-btn"
          onClick={() => navigate('/sponsor/campaigns/new')}
        >
          Get Started
        </button>
      </div>
    </aside>
  );
}