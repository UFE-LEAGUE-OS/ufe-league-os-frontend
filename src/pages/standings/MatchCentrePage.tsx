import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiUsers, FiCalendar, FiShare2, FiExternalLink, FiArrowRight } from 'react-icons/fi';
import './MatchCentrePage.css';
import kccaLogo from '../../assets/kcca.png';
import vipersLogo from '../../assets/Vipers_SC.jpg';
import stadiumImg from '../../assets/stadium-bg.svg';
import kccaTransfer from '../../assets/kcca_transfer.jpg';
import vipersNews from '../../assets/Vipers_SC.jpg';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const tabs = ['Overview', 'Lineups', 'Timeline', 'Stats', 'Tickets'];

export default function MatchCentrePage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const navigate = useNavigate();

  return (
    <div className="mc-page">

      <Navbar />

      <div className="mc-breadcrumb">
        <span onClick={() => navigate('/')} className="mc-bc-link">HOME</span>
        <span className="mc-bc-sep">›</span>
        <span onClick={() => navigate('/leagues/uganda-premier-league')} className="mc-bc-link">UGANDA PREMIER LEAGUE</span>
        <span className="mc-bc-sep">›</span>
        <span className="mc-bc-current">MATCH CENTRE</span>
      </div>


      <div className="mc-hero">
        <div className="mc-league-badge">
          <span className="mc-flag">🇺🇬</span>
          <span>UGANDA PREMIER LEAGUE</span>
          <span className="mc-dot">•</span>
          <span>MATCHWEEK 29</span>
        </div>

        <div className="mc-datetime">Sun, 26 May 2024</div>
        <div className="mc-kickoff">04:00 PM EAT</div>

        <div className="mc-teams-row">

          <div className="mc-team mc-team--home">
            <div className="mc-team-crest">
              <img src={kccaLogo} alt="KCCA FC" className="mc-crest-img" />
            </div>
            <div className="mc-team-name">KCCA FC</div>
            <div className="mc-team-position">7TH PLACE</div>
          </div>


          <div className="mc-centre">
            <div className="mc-vs">VS</div>
            <div className="mc-live-badge">LIVE</div>
            <div className="mc-timer">
              <span className="mc-timer-unit">01</span>
              <span className="mc-timer-colon">:</span>
              <span className="mc-timer-unit">08</span>
              <span className="mc-timer-colon">:</span>
              <span className="mc-timer-unit">28</span>
            </div>
            <div className="mc-timer-labels">
              <span>HRS</span>
              <span>MINS</span>
              <span>SECS</span>
            </div>
          </div>

  
          <div className="mc-team mc-team--away">
            <div className="mc-team-crest">
              <img src={vipersLogo} alt="Vipers SC" className="mc-crest-img" />
            </div>
            <div className="mc-team-name">VIPERS SC</div>
            <div className="mc-team-position">2ND PLACE</div>
          </div>
        </div>

        <div className="mc-venue-strip">
          <span className="mc-venue-item"><FiMapPin size={14} /> MTN Omondi Stadium</span>
          <span className="mc-venue-item"><FiUsers size={14} /> 15,000 Capacity</span>
        </div>
      </div>


      <div className="mc-body">
        <div className="mc-main">


          <div className="mc-tabs">
            <div className="mc-tab-list">
              {tabs.map(tab => (
                <button
                  key={tab}
                  className={`mc-tab ${activeTab === tab ? 'mc-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="mc-tab-actions">
              <button className="mc-action-btn"><FiCalendar size={14} /> ADD TO CALENDAR</button>
              <button className="mc-action-btn"><FiShare2 size={14} /> SHARE</button>
            </div>
          </div>


          {activeTab === 'Overview' && (
            <div className="mc-overview">


              <div className="mc-card">
                <div className="mc-card-title">Form Guide</div>
                <div className="mc-form-row">
                  <span className="mc-form-team-dot mc-form-team-dot--kcca" />
                  <span className="mc-form-team-name">KCCA FC</span>
                  <div className="mc-form-results">
                    <span className="mc-form-badge mc-form-badge--w">W</span>
                    <span className="mc-form-badge mc-form-badge--w">W</span>
                    <span className="mc-form-badge mc-form-badge--l">L</span>
                    <span className="mc-form-badge mc-form-badge--w">W</span>
                  </div>
                </div>
                <div className="mc-form-row">
                  <span className="mc-form-team-dot mc-form-team-dot--vipers" />
                  <span className="mc-form-team-name">Vipers SC</span>
                  <div className="mc-form-results">
                    <span className="mc-form-badge mc-form-badge--w">W</span>
                    <span className="mc-form-badge mc-form-badge--w">W</span>
                    <span className="mc-form-badge mc-form-badge--w">W</span>
                    <span className="mc-form-badge mc-form-badge--d">D</span>
                    <span className="mc-form-badge mc-form-badge--w">W</span>
                  </div>
                </div>
              </div>


              <div className="mc-card">
                <div className="mc-card-title">Head to Head</div>
                <div className="mc-h2h-stats">
                  <div className="mc-h2h-stat">
                    <div className="mc-h2h-num">1</div>
                    <div className="mc-h2h-label">WON</div>
                  </div>
                  <div className="mc-h2h-stat">
                    <div className="mc-h2h-num">2</div>
                    <div className="mc-h2h-label">DRAWS</div>
                  </div>
                  <div className="mc-h2h-stat mc-h2h-stat--right">
                    <div className="mc-h2h-num mc-h2h-num--vipers">3</div>
                    <div className="mc-h2h-label">WON</div>
                  </div>
                </div>
                <div className="mc-h2h-bar">
                  <div className="mc-h2h-bar-fill mc-h2h-bar-fill--kcca" style={{ width: '17%' }} />
                  <div className="mc-h2h-bar-fill mc-h2h-bar-fill--draw" style={{ width: '33%' }} />
                  <div className="mc-h2h-bar-fill mc-h2h-bar-fill--vipers" style={{ width: '50%' }} />
                </div>
                <div className="mc-h2h-team-labels">
                  <span>KCCA FC</span>
                  <span>VIPERS SC</span>
                </div>
              </div>


              <div className="mc-venue-card">
                <div className="mc-venue-img">
                  <img src={stadiumImg} alt="MTN Omondi Stadium" className="mc-venue-img-real" />
                </div>
                <div className="mc-venue-details">
                  <div className="mc-card-title">Venue Detail</div>
                  <div className="mc-venue-table">
                    <div className="mc-venue-row">
                      <span className="mc-venue-key">Stadium</span>
                      <span className="mc-venue-val">MTN Omondi Stadium</span>
                    </div>
                    <div className="mc-venue-row">
                      <span className="mc-venue-key">City</span>
                      <span className="mc-venue-val">Kampala, Uganda</span>
                    </div>
                    <div className="mc-venue-row">
                      <span className="mc-venue-key">Capacity</span>
                      <span className="mc-venue-val">20,000</span>
                    </div>
                    <div className="mc-venue-row">
                      <span className="mc-venue-key">Surface</span>
                      <span className="mc-venue-val">Natural Grass</span>
                    </div>
                  </div>
                  <button className="mc-venue-guide-btn">VIEW STADIUM GUIDE</button>
                </div>
              </div>


              <div className="mc-news-section">
                <div className="mc-news-header">
                  <span className="mc-news-title">Match News</span>
                  <span className="mc-news-viewall">VIEW ALL NEWS</span>
                </div>
                <div className="mc-news-grid">
                  <div className="mc-news-card">
                    <div className="mc-news-img">
                      <img src={kccaTransfer} alt="KCCA FC" className="mc-news-img-real" />
                    </div>
                    <div className="mc-news-content">
                      <div className="mc-news-headline">KCCA FC eye top-six finish in crucial clash</div>
                      <div className="mc-news-excerpt">The Kasasiro Boys look to build momentum in the final stretch of the season as they host rivals...</div>
                    </div>
                  </div>
                  <div className="mc-news-card">
                    <div className="mc-news-img">
                      <img src={vipersNews} alt="Vipers SC" className="mc-news-img-real" />
                    </div>
                    <div className="mc-news-content">
                      <div className="mc-news-headline">Fans swarm MTN Omondi ahead of Derby</div>
                      <div className="mc-news-excerpt">Tickets are selling fast as the local community prepares for the highly anticipated Kampala showdown.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'Overview' && (
            <div className="mc-tab-placeholder">
              <p>{activeTab} content coming soon.</p>
            </div>
          )}
        </div>


        <aside className="mc-sidebar">

          {/* Match Tickets */}
          <div className="mc-sidebar-card">
            <div className="mc-sidebar-card-header">
              <span className="mc-sidebar-card-title">Match Tickets</span>
              <FiExternalLink size={16} className="mc-sidebar-icon" />
            </div>
            <p className="mc-sidebar-desc">Don't miss the local derby! Book your spot now for the highlight of the week.</p>
            <div className="mc-ticket-features">
              <div className="mc-ticket-feature"><span className="mc-feature-check">✓</span> Secure, e-tickets via phone</div>
              <div className="mc-ticket-feature"><span className="mc-feature-check">✓</span> Early access gate entry</div>
            </div>
            <button className="mc-get-tickets-btn">GET TICKETS <FiArrowRight size={16} /></button>
            <div className="mc-tickets-starting">Starting from UGX 10,000</div>
          </div>


          <div className="mc-sidebar-card">
            <div className="mc-sidebar-card-title">Ticket Tiers</div>
            <div className="mc-tier-list">
              <div className="mc-tier-item">
                <span className="mc-tier-dot mc-tier-dot--vip" />
                <div className="mc-tier-info">
                  <div className="mc-tier-name">VIP</div>
                  <div className="mc-tier-sub">CENTRE STAND</div>
                </div>
                <div className="mc-tier-price">UGX 40k</div>
              </div>
              <div className="mc-tier-item">
                <span className="mc-tier-dot mc-tier-dot--vvip" />
                <div className="mc-tier-info">
                  <div className="mc-tier-name">VVIP</div>
                  <div className="mc-tier-sub">PADDED SEATING</div>
                </div>
                <div className="mc-tier-price">UGX 80k</div>
              </div>
              <div className="mc-tier-item">
                <span className="mc-tier-dot mc-tier-dot--ordinary" />
                <div className="mc-tier-info">
                  <div className="mc-tier-name">Ordinary</div>
                  <div className="mc-tier-sub">GENERAL ADMISSION</div>
                </div>
                <div className="mc-tier-price">UGX 15k</div>
              </div>
            </div>
            <button className="mc-buy-tickets-btn">BUY TICKETS NOW</button>
          </div>


          <div className="mc-sidebar-card">
            <div className="mc-sidebar-card-title">Match Officials</div>
            <div className="mc-officials-list">
              <div className="mc-official-item">
                <div className="mc-official-avatar"><FiUsers size={18} /></div>
                <div className="mc-official-info">
                  <div className="mc-official-role">REFEREE</div>
                  <div className="mc-official-name">Hakim Ssebuliba</div>
                </div>
              </div>
              <div className="mc-official-item">
                <div className="mc-official-avatar"><FiUsers size={18} /></div>
                <div className="mc-official-info">
                  <div className="mc-official-role">ASST. REFEREE 1</div>
                  <div className="mc-official-name">Juma Kateregga</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="mc-cta-banner">
        <div className="mc-cta-left">
          <h2 className="mc-cta-title">Unlock the Full Match Experience</h2>
          <p className="mc-cta-desc">Create an account to access exclusive live tracking, deep player analytics, and join the official fantasy league to win local prizes.</p>
        </div>
        <div className="mc-cta-actions">
          <button className="mc-cta-register" onClick={() => navigate('/register')}>Create an Account</button>
          <button className="mc-cta-login" onClick={() => navigate('/login')}>Log In</button>
        </div>
      </div>

      <Footer />
    </div>
  );
}