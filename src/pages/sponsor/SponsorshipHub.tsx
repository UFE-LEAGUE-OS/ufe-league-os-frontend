import {
  Navigate,
  useNavigate,
} from 'react-router-dom';
import {
  FiClipboard,
  FiLayout,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiUserPlus,
} from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import { useAuthStore } from '../../store/authStore';
import { getToken } from '../../utils/tokenManager';
import '../../styles/pages/landing.css';
import './SponsorshipHub.css';

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
