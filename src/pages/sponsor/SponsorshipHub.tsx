import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiTarget,
  FiClipboard,
  FiUserPlus,
  FiTrendingUp,
  FiUser,
  FiLayout,
} from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import SponsorSidebar from '../../components/SponsorSidebar';
import { useAuthStore } from '../../store/authStore';
import { getToken } from '../../utils/tokenManager';
import '../../styles/pages/landing.css';
import './SponsorshipHub.css';

const steps = [
  {
    icon: FiUserPlus,
    number: '1.',
    title: 'Create Account',
    desc: 'Sign up as a corporate or individual sponsor.',
  },
  {
    icon: FiTarget,
    number: '2.',
    title: 'Choose Opportunities',
    desc: 'Browse sponsorship packages and campaigns.',
  },
  {
    icon: FiClipboard,
    number: '3.',
    title: 'Partner & Activate',
    desc: 'Confirm your partnership and activate your sponsorship.',
  },
  {
    icon: FiTrendingUp,
    number: '4.',
    title: 'Track Impact',
    desc: 'Monitor performance, reach, and engagement.',
  },
];

export default function SponsorshipHub() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = Boolean(accessToken || getToken());

  return (
    <div className="sh-page">
      <Navbar />

      <div className="sh-layout">
        {isAuthenticated && <SponsorSidebar />}

        <main className="sh-main landing-page">

          {/* Hero section */}
          <div className="sh-hero-section">
            <div className="sh-hero-left">
              <h1 className="sh-page-title">Sponsorship Hub</h1>
              <div className="sh-title-underline" />
              <h2 className="sh-hero-headline">
                Partner. Promote.<br />Inspire.
              </h2>
              <p className="sh-hero-desc">
                Join our network of sponsors and be part of the journey to grow sports,
                empower communities and build a stronger future together.
              </p>
              <div className="sh-stats">
                <div className="sh-stat">
                  <FiUsers size={20} className="sh-stat-icon" />
                  <div>
                    <div className="sh-stat-number">50K+</div>
                    <div className="sh-stat-label">Active Users</div>
                  </div>
                </div>
                <div className="sh-stat">
                  <FiTarget size={20} className="sh-stat-icon" />
                  <div>
                    <div className="sh-stat-number">200+</div>
                    <div className="sh-stat-label">Competitions</div>
                  </div>
                </div>
                <div className="sh-stat">
                  <FiClipboard size={20} className="sh-stat-icon" />
                  <div>
                    <div className="sh-stat-number">5K+</div>
                    <div className="sh-stat-label">Matches</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Become a Sponsor card */}
            <div className="sh-become-sponsor-card">
              <div className="sh-bs-icon-wrap">
                <FiLayout size={28} className="sh-bs-icon" />
              </div>
              <h3 className="sh-bs-title">Become a Sponsor</h3>
              <p className="sh-bs-desc">
                Choose how you would like to partner with us and unlock opportunities
                that drive impact and visibility.
              </p>
              <div className="sh-sponsor-type-grid">
                <div
                  className="sh-sponsor-type-card"
                  onClick={() => navigate('/sponsor/corporatesetup')}
                >
                  <FiLayout size={28} className="sh-type-icon" />
                  <div className="sh-type-name">Corporate Sponsor</div>
                  <div className="sh-type-desc">For businesses and organizations</div>
                </div>
                <div
                  className="sh-sponsor-type-card"
                  onClick={() => navigate('/sponsor/individualsetup')}
                >
                  <FiUser size={28} className="sh-type-icon" />
                  <div className="sh-type-name">Individual Sponsor</div>
                  <div className="sh-type-desc">For individuals who want to make an impact</div>
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="sh-how-section">
            <h2 className="sh-how-title">How it works</h2>
            <div className="sh-how-underline" />
            <div className="sh-steps-grid">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="sh-step-card">
                    <div className="sh-step-icon-wrap">
                      <Icon size={26} className="sh-step-icon" />
                    </div>
                    <div className="sh-step-number">{step.number}</div>
                    <div className="sh-step-title">{step.title}</div>
                    <div className="sh-step-desc">{step.desc}</div>
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