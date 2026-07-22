import { useEffect, useState } from 'react';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  FiBarChart2,
  FiBell,
  FiCreditCard,
  FiFileText,
  FiGrid,
  FiHelpCircle,
  FiImage,
  FiLayout,
  FiSettings,
  FiTag,
  FiUser,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import logo from '../assets/logo.png';
import { getNotificationInbox } from '../services/notificationService';
import './SponsorSidebar.css';

const sidebarLinks = [
  {
    label: 'Dashboard',
    icon: FiGrid,
    route: '/sponsor/dashboard',
  },
  {
    label: 'Notifications',
    icon: FiBell,
    route: '/sponsor/notifications',
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
    label: 'Campaigns',
    icon: FiZap,
    route: '/sponsor/campaigns',
  },
  {
    label: 'Assets',
    icon: FiImage,
    route: '/sponsor/assets',
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
  {
    label: 'Audit Log',
    icon: FiFileText,
    route: '/sponsor/audit-log',
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
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (route: string) =>
    location.pathname === route;

  useEffect(() => {
    let active = true;

    getNotificationInbox({
      category: 'SPONSORSHIP',
      unreadOnly: true,
      limit: 1,
    })
      .then((response) => {
        if (active) setUnreadCount(response.unread_count);
      })
      .catch(() => {
        // Non-critical — the nav item still works without a badge.
      });

    return () => {
      active = false;
    };
  }, [location.pathname]);

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
                  {link.route === '/sponsor/notifications' &&
                    unreadCount > 0 && (
                      <span className="sp-nav-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
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
