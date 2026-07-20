import {
  Navigate,
  useNavigate,
} from 'react-router-dom';
import {
  FiClipboard,
  FiEye,
  FiFeather,
  FiHeart,
  FiHome,
  FiLayout,
  FiLock,
  FiLogIn,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiUserPlus,
  FiUsers,
} from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import { useAuthStore } from '../../store/authStore';
import { getToken } from '../../utils/tokenManager';
import { LOGIN_ROUTE, type AuthFlowState } from '../../utils/authFlow';
import '../../styles/pages/landing.css';
import './SponsorshipHub.css';

const packageTiers = [
  {
    icon: FiEye,
    title: 'Visibility',
    desc: 'Brand placement across matchday, digital and broadcast touchpoints.',
  },
  {
    icon: FiUsers,
    title: 'Fan Engagement',
    desc: 'Activations that put your brand directly in front of engaged fans.',
  },
  {
    icon: FiHome,
    title: 'Hospitality',
    desc: 'VIP access, hospitality suites and matchday experiences.',
  },
  {
    icon: FiHeart,
    title: 'Community Impact',
    desc: 'Community-facing sponsorship opportunities that build brand trust.',
  },
  {
    icon: FiFeather,
    title: 'Grassroots Development',
    desc: 'Support development programmes at the grassroots level.',
  },
];

const steps = [
  {
    icon: FiUserPlus,
    number: '1.',
    title: 'Create Sponsor Account',
    desc: 'Register as an individual or corporate sponsor.',
  },
  {
    icon: FiTarget,
    number: '2.',
    title: 'Discover Opportunities',
    desc: 'Filter neutral packages by objective, sport and budget.',
  },
  {
    icon: FiClipboard,
    number: '3.',
    title: 'Request Partnership',
    desc: 'Select a sports property and submit the sponsorship request.',
  },
  {
    icon: FiTrendingUp,
    number: '4.',
    title: 'Pay and Activate',
    desc: 'Review approved terms, pay securely and track delivery.',
  },
];

export default function SponsorshipHub() {
  const navigate = useNavigate();
  const accessToken = useAuthStore(
    (state) => state.accessToken,
  );
  const user = useAuthStore(
    (state) => state.user,
  );

  const isAuthenticated = Boolean(
    accessToken || getToken(),
  );

  const isSponsor = Boolean(
    user?.is_sponsor ||
      user?.sponsor_type,
  );

  if (isAuthenticated && isSponsor) {
    return (
      <Navigate
        to="/sponsor/dashboard"
        replace
      />
    );
  }

  return (
    <div className="sh-page">
      <Navbar />

      <main className="sh-main landing-page">
        <section className="sh-hero-section">
          <div className="sh-hero-left">
            <h1 className="sh-page-title">
              Sponsorship Hub
            </h1>

            <div className="sh-title-underline" />

            <h2 className="sh-hero-headline">
              Partner. Support.
              <br />
              Grow Sport.
            </h2>

            <p className="sh-hero-desc">
              Create a sponsor account, discover
              verified sports opportunities and
              manage the full partnership through
              League OS.
            </p>
          </div>

          <div className="sh-become-sponsor-card">
            <div className="sh-bs-icon-wrap">
              <FiLayout
                size={28}
                className="sh-bs-icon"
              />
            </div>

            <h3 className="sh-bs-title">
              Become a Sponsor
            </h3>

            <p className="sh-bs-desc">
              Choose the account type that best
              represents how you intend to support
              sport.
            </p>

            <div className="sh-sponsor-type-grid">
              <button
                type="button"
                className="sh-sponsor-type-card"
                onClick={() =>
                  navigate(
                    '/sponsor/corporatesetup',
                  )
                }
              >
                <FiLayout
                  size={28}
                  className="sh-type-icon"
                />
                <span className="sh-type-name">
                  Corporate Sponsor
                </span>
                <span className="sh-type-desc">
                  Businesses and organisations
                </span>
              </button>

              <button
                type="button"
                className="sh-sponsor-type-card"
                onClick={() =>
                  navigate(
                    '/sponsor/individualsetup',
                  )
                }
              >
                <FiUser
                  size={28}
                  className="sh-type-icon"
                />
                <span className="sh-type-name">
                  Individual Sponsor
                </span>
                <span className="sh-type-desc">
                  Individuals supporting sport
                </span>
              </button>
            </div>

            <div className="sh-login-divider">
              <span>Already a sponsor?</span>
            </div>

            <button
              type="button"
              className="sh-login-btn"
              onClick={() =>
                navigate(LOGIN_ROUTE, {
                  state: {
                    postLoginRedirect:
                      '/sponsor/dashboard',
                  } satisfies AuthFlowState,
                })
              }
            >
              <FiLogIn size={16} />
              Log In to Your Dashboard
            </button>
          </div>
        </section>

        <section className="sh-packages-section">
          <h2 className="sh-packages-title">
            Sponsorship Packages
          </h2>

          <div className="sh-packages-underline" />

          <p className="sh-packages-intro">
            Packages are tailored around a sponsorship
            objective. Sign in or create a sponsor
            account to see full package details and
            pricing.
          </p>

          <div className="sh-packages-grid">
            {packageTiers.map((tier) => {
              const Icon = tier.icon;

              return (
                <article
                  key={tier.title}
                  className="sh-package-card"
                >
                  <div className="sh-package-icon-wrap">
                    <Icon
                      size={22}
                      className="sh-package-icon"
                    />
                  </div>
                  <div className="sh-package-title">
                    {tier.title}
                  </div>
                  <div className="sh-package-desc">
                    {tier.desc}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="sh-packages-cta">
            <FiLock
              size={15}
              className="sh-packages-lock-icon"
            />
            <span className="sh-packages-cta-text">
              Pricing is available to signed-in sponsors.
            </span>
            <div className="sh-packages-cta-buttons">
              <button
                type="button"
                className="sh-packages-signin-btn"
                onClick={() => navigate(LOGIN_ROUTE, {
                  state: {
                    postLoginRedirect:
                      '/sponsor/dashboard',
                  } satisfies AuthFlowState,
                })}
              >
                Sign In
              </button>
              <button
                type="button"
                className="sh-packages-register-btn"
                onClick={() => navigate('/register')}
              >
                Create Account
              </button>
            </div>
          </div>
        </section>

        <section className="sh-how-section">
          <h2 className="sh-how-title">
            How it works
          </h2>

          <div className="sh-how-underline" />

          <div className="sh-steps-grid">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="sh-step-card"
                >
                  <div className="sh-step-icon-wrap">
                    <Icon
                      size={26}
                      className="sh-step-icon"
                    />
                  </div>

                  <div className="sh-step-number">
                    {step.number}
                  </div>

                  <div className="sh-step-title">
                    {step.title}
                  </div>

                  <div className="sh-step-desc">
                    {step.desc}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
