import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/tokenManager.js';
import './CTABanner.css';
import ctaImage from '../assets/cta-banner.png';

type FeatureAction = 'membership' | 'polls' | 'mvp' | 'quizzes';

type Feature = {
  icon: string;
  title: string;
  desc: string;
  action: FeatureAction;
  route: string;
};

const features: Feature[] = [
  { icon: '🛡️', title: 'Club Memberships', desc: 'Unlock exclusive content, early access, and official merch.', action: 'membership', route: '/memberships' },
  { icon: '📊', title: 'Polls & Surveys', desc: 'Have your say on crucial club decisions and directions.', action: 'polls', route: '/fan/polls' },
  { icon: '⭐', title: 'MVP Voting', desc: 'Vote for your match winners and players of the month.', action: 'mvp', route: '/fan/mvp-voting' },
  { icon: '🎮', title: 'Quizzes & Games', desc: 'Test your sports knowledge and compete with others.', action: 'quizzes', route: '/fan/quizzes' },
];

function isAuthenticated() {
  return Boolean(
    localStorage.getItem('league_os_access_token') ||
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('league_os_access_token') ||
      sessionStorage.getItem('access_token') ||
      getToken(),
  );
}

function CTABanner() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  const handleFeatureClick = (route: string) => {
    if (authenticated) {
      navigate(route);
    }
    // For unauthenticated users, the AuthRequiredGate intercepts
    // via the data-auth-action attribute on the element.
  };

  return (
    <section className="cta-banner" style={{ backgroundImage: `url(${ctaImage})` }}>
      <div className="cta-content">
        <h2 className="cta-heading">
          JOIN. ENGAGE. <span className="cta-accent">BE REWARDED.</span>
        </h2>
      </div>
      <div className="cta-right">
        <div className="cta-features">
          {features.map((f) => (
            <div
              className="cta-feature"
              key={f.title}
              role="button"
              tabIndex={0}
              data-auth-action={f.action}
              onClick={() => handleFeatureClick(f.route)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleFeatureClick(f.route);
                }
              }}
            >
              <div className="cta-feature-icon">{f.icon}</div>
              <div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          className="explore-membership-btn"
          data-auth-action="membership"
          onClick={() => handleFeatureClick('/memberships')}
        >
          Explore Memberships →
        </button>
      </div>
    </section>
  );
}

export default CTABanner;