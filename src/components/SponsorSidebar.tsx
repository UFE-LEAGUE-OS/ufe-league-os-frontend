import {
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  FiBarChart2,
  FiCreditCard,
  FiGrid,
  FiHelpCircle,
  FiLayout,
  FiSettings,
  FiTag,
  FiUser,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import logo from '../assets/logo.png';
import './SponsorSidebar.css';

const sidebarLinks = [
  {
    label: 'Dashboard',
    icon: FiGrid,
    route: '/sponsor/dashboard',
  },
  {
    label: 'Profile',
    icon: FiUser,
    route: '/sponsor/profile',
  },
  {
    label: 'Discover Opportunities',
    icon: FiTag,
    route: '/sponsor/packages',
  },
  {
    label: 'Agreements & Payments',
    icon: FiCreditCard,
    route: '/sponsor/payments',
  },
  {
    label: 'Activations',
    icon: FiLayout,
    route: '/sponsor/activations',
  },
  {
    label: 'Performance',
    icon: FiBarChart2,
    route: '/sponsor/analytics',
  },
  {
    label: 'My Team',
    icon: FiUsers,
    route: '/sponsor/team',
  },
];

const bottomLinks = [
  {
    label: 'Settings',
    icon: FiSettings,
    route: '/sponsor/settings',
  },
  {
    label: 'Help & Support',
    icon: FiHelpCircle,
    route: '/sponsor/support',
  },
];

export default function SponsorSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (route: string) =>
    location.pathname === route;

  return (
    <aside className="sp-sidebar">
      <button
        type="button"
        className="sp-sidebar-logo"
        onClick={() => navigate('/')}
      >
        <img
          src={logo}
          alt="League OS"
          className="sp-logo-img"
        />
      </button>

      <nav className="sp-sidebar-nav">
        <ul className="sp-nav-list">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;

            return (
              <li key={link.route}>
                <button
                  type="button"
                  className={`sp-nav-item ${
                    isActive(link.route)
                      ? 'sp-nav-item-active'
                      : ''
                  }`}
                  onClick={() =>
                    navigate(link.route)
                  }
                >
                  <Icon
                    size={18}
                    className="sp-nav-icon"
                  />
                  <span>{link.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="sp-sidebar-divider" />

        <ul className="sp-nav-list">
          {bottomLinks.map((link) => {
            const Icon = link.icon;

            return (
              <li key={link.route}>
                <button
                  type="button"
                  className={`sp-nav-item ${
                    isActive(link.route)
                      ? 'sp-nav-item-active'
                      : ''
                  }`}
                  onClick={() =>
                    navigate(link.route)
                  }
                >
                  <Icon
                    size={18}
                    className="sp-nav-icon"
                  />
                  <span>{link.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sp-sidebar-cta">
        <div className="sp-cta-icon-wrap">
          <FiZap
            size={20}
            className="sp-cta-icon"
          />
        </div>

        <h4 className="sp-cta-title">
          Find your next partnership
        </h4>

        <p className="sp-cta-desc">
          Compare neutral packages and choose
          an available sports property.
        </p>

        <button
          type="button"
          className="sp-cta-btn"
          onClick={() =>
            navigate('/sponsor/packages')
          }
        >
          Explore Opportunities
        </button>
      </div>
    </aside>
  );
}
