import './CTABanner.css';
import ctaImage from '../assets/cta-banner.png';

const features = [
  { icon: '🛡️', title: 'Club Memberships', desc: 'Unlock exclusive content, early access, and official merch.' },
  { icon: '📊', title: 'Polls & Surveys', desc: 'Have your say on crucial club decisions and directions.' },
  { icon: '⭐', title: 'MVP Voting', desc: 'Vote for your match winners and players of the month.' },
  { icon: '🎮', title: 'Quizzes & Games', desc: 'Test your sports knowledge and compete with others.' },
];

function CTABanner() {
  return (
    <section className="cta-banner" style={{ backgroundImage: `url(${ctaImage})` }}>
      <div className="cta-content">
        <h2 className="cta-heading">
          JOIN. ENGAGE. <span className="cta-accent">BE REWARDED.</span>
        </h2>

        <div className="cta-features">
          {features.map((f) => (
            <div className="cta-feature" key={f.title}>
              <div className="cta-feature-icon">{f.icon}</div>
              <div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="explore-membership-btn">Explore Memberships →</button>
      </div>
    </section>
  );
}

export default CTABanner;