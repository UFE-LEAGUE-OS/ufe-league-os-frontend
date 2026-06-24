import { useNavigate } from 'react-router-dom';
import './Hero.css';
import heroImage from '../assets/hero.png';

function Hero() {
  const navigate = useNavigate();
  return (
    <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
      <div className="hero-top">
        <div className="hero-content">
          <h1 className="hero-heading">
            EVERY GAME. EVERY FAN.<br />
            <span className="hero-heading-accent">ONE PLATFORM.</span>
          </h1>
          <p className="hero-subtext">
            Follow your teams. Track competitions. Join communities.
            Buy tickets. Play fantasy. All the passion of Ugandan sport, in one place.
          </p>
          <div className="hero-buttons">
            <button className="btn-outline" onClick={() => navigate('/competitions')}>
              Browse Competitions <span className="btn-arrow"> </span>
            </button>
            <button className="btn-outline">Become a sponsor</button>
            <button className="btn-outline" onClick={() => navigate('/register')}>Sign Up</button>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">20+</span>
            <span className="stat-label">SPORTS</span>
          </div>
          <div className="stat">
            <span className="stat-number">150+</span>
            <span className="stat-label">COMPETITIONS</span>
          </div>
          <div className="stat">
            <span className="stat-number">500+</span>
            <span className="stat-label">CLUBS</span>
          </div>
          <div className="stat">
            <span className="stat-number">1M+</span>
            <span className="stat-label">FANS</span>
          </div>
        </div>
      </div>

      <div className="hero-features">
        <div className="feature">
          <span className="feature-icon">🌐</span> Live Scores & Stats
        </div>
        <div className="feature">
          <span className="feature-icon">⚙️</span> Official Data
        </div>
        <div className="feature">
          <span className="feature-icon">📋</span> Exclusive Content
        </div>
        <div className="feature">
          <span className="feature-icon">👥</span> Fan Engagement
        </div>
      </div>
    </section>
  );
}

export default Hero;