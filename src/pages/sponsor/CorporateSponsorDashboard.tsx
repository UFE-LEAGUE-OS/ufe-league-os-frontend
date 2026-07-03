import { useNavigate } from 'react-router-dom';
import {
  FiShield,
  FiUsers,
  FiTrendingUp,
  FiDollarSign,
  FiMapPin,
  FiGlobe,
  FiCalendar,
  FiChevronRight,
  FiPlus,
  FiBarChart2,
  FiGrid,
} from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import SponsorSidebar from '../../components/SponsorSidebar';
import '../../styles/pages/landing.css';
import './CorporateSponsorDashboard.css';

const stats = [
  {
    icon: FiShield,
    label: 'Active Sponsorships',
    value: '5',
    change: '+1 from last month',
  },
  {
    icon: FiUsers,
    label: 'Total Reach',
    value: '2.4M',
    change: '+18.5% vs last month',
  },
  {
    icon: FiTrendingUp,
    label: 'Engagements',
    value: '186K',
    change: '+31.2% vs last month',
  },
  {
    icon: FiDollarSign,
    label: 'ROI / Media Value',
    value: 'UGX 2.4B',
    change: '+32.0% vs last month',
  },
];

const campaigns = [
  {
    id: 1,
    logo: '🏉',
    name: 'Nile Special Rugby Premiership',
    role: 'Official Beer Partner',
    dates: '01 May 2024 - 31 May 2025',
    reach: '850K',
    reachChange: '+28%',
    engagements: '64K',
    engagementsChange: '+34%',
    roi: 'UGX 1.1B',
    roiChange: '+29%',
  },
  {
    id: 2,
    logo: '🦅',
    name: 'Kobs FC Jersey Sponsor',
    role: 'Official Jersey Partner',
    dates: '01 Apr 2024 - 31 Mar 2025',
    reach: '420K',
    reachChange: '+22%',
    engagements: '28K',
    engagementsChange: '+18%',
    roi: 'UGX 650M',
    roiChange: '+21%',
  },
  {
    id: 3,
    logo: '🦁',
    name: 'UPL Harvest League',
    role: 'Official Partner',
    dates: '01 Feb 2024 - 31 Jan 2025',
    reach: '310K',
    reachChange: '+16%',
    engagements: '21K',
    engagementsChange: '+12%',
    roi: 'UGX 380M',
    roiChange: '+15%',
  },
];

const quickActions = [
  {
    icon: FiPlus,
    title: 'Create Campaign',
    desc: 'Launch a new sponsorship campaign or activation',
    route: '/sponsor/campaigns/new',
  },
  {
    icon: FiBarChart2,
    title: 'View Analytics',
    desc: 'Explore performance insights and audience analytics',
    route: '/sponsor/analytics',
  },
  {
    icon: FiUsers,
    title: 'Manage Team',
    desc: 'Add team members and manage permissions',
    route: '/sponsor/team',
  },
  {
    icon: FiGrid,
    title: 'Browse Packages',
    desc: 'Discover sponsorship opportunities and packages',
    route: '/sponsor/packages',
  },
];

export default function CorporateSponsorDashboard() {
  const navigate = useNavigate();

  return (
    <div className="csd-page">
      <Navbar />

      <div className="csd-layout">
        <SponsorSidebar />

        <main className="csd-main landing-page">

          {/* Welcome hero card */}
          <div className="csd-hero-card">
            <div className="csd-hero-left">
              <div className="csd-welcome-text">Welcome back,</div>
              <div className="csd-company-row">
                <h1 className="csd-company-name">Nile Breweries Limited</h1>
                <span className="csd-verified-badge">
                  Verified Sponsor ✓
                </span>
              </div>
              <div className="csd-tagline">Building champions. Together.</div>
              <div className="csd-meta-row">
                <span className="csd-meta-item">
                  <FiMapPin size={13} /> Kampala, Uganda
                </span>
                <span className="csd-meta-divider">|</span>
                <span className="csd-meta-item">
                  <FiGlobe size={13} /> www.nilebreweries.com
                </span>
              </div>
            </div>
            <div className="csd-hero-logo">
              <div className="csd-nile-logo-card">
                <div className="csd-nile-emblem">🦁</div>
                <div className="csd-nile-name">NILE</div>
                <div className="csd-nile-special">— SPECIAL —</div>
                <div className="csd-nile-bars">
                  <span className="csd-bar csd-bar-orange" />
                  <span className="csd-bar csd-bar-red" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="csd-stats-row">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="csd-stat-card">
                  <div className="csd-stat-icon-wrap">
                    <Icon size={20} className="csd-stat-icon" />
                  </div>
                  <div className="csd-stat-info">
                    <div className="csd-stat-label">{stat.label}</div>
                    <div className="csd-stat-value">{stat.value}</div>
                    <div className="csd-stat-change">{stat.change}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom: campaigns + quick actions */}
          <div className="csd-bottom">

            {/* Recent Campaigns */}
            <div className="csd-campaigns-card">
              <div className="csd-campaigns-header">
                <h2 className="csd-campaigns-title">Recent Campaigns</h2>
                <button
                  className="csd-view-all"
                  onClick={() => navigate('/sponsor/campaigns')}
                >
                  View All
                </button>
              </div>

              <div className="csd-campaigns-list">
                {campaigns.map((c) => (
                  <div key={c.id} className="csd-campaign-row">
                    <div className="csd-campaign-logo">{c.logo}</div>
                    <div className="csd-campaign-info">
                      <div className="csd-campaign-name-row">
                        <span className="csd-campaign-name">{c.name}</span>
                        <span className="csd-live-badge">Live</span>
                      </div>
                      <div className="csd-campaign-role">{c.role}</div>
                      <div className="csd-campaign-dates">
                        <FiCalendar size={11} /> {c.dates}
                      </div>
                    </div>
                    <div className="csd-campaign-stats">
                      <div className="csd-campaign-stat">
                        <div className="csd-cs-label">Reach</div>
                        <div className="csd-cs-value">{c.reach}</div>
                        <div className="csd-cs-change">{c.reachChange}</div>
                      </div>
                      <div className="csd-campaign-stat">
                        <div className="csd-cs-label">Engagements</div>
                        <div className="csd-cs-value">{c.engagements}</div>
                        <div className="csd-cs-change">{c.engagementsChange}</div>
                      </div>
                      <div className="csd-campaign-stat">
                        <div className="csd-cs-label">ROI / Value</div>
                        <div className="csd-cs-value">{c.roi}</div>
                        <div className="csd-cs-change">{c.roiChange}</div>
                      </div>
                    </div>
                    <FiChevronRight size={18} className="csd-campaign-chevron" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="csd-quick-actions">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div key={action.title} className="csd-action-card">
                    <div className="csd-action-icon-wrap">
                      <Icon size={20} className="csd-action-icon" />
                    </div>
                    <div className="csd-action-title">{action.title}</div>
                    <div className="csd-action-desc">{action.desc}</div>
                    <button
                      className="csd-action-btn"
                      onClick={() => navigate(action.route)}
                    >
                      <FiChevronRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}