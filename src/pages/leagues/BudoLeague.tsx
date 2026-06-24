import { useNavigate } from 'react-router-dom';
import { FiClock, FiTrendingUp, FiMapPin } from 'react-icons/fi';
import { IoSchoolOutline } from 'react-icons/io5';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../sports/SportsPage.css';
import './Leagues.css';

import buddoLeagueSvg from '../../assets/buddo-league.svg';
import ctaBannerImg from '../../assets/cta-banner.png';
import budoLeagueWebp from '../../assets/budo league/Budo-league.webp';
import hkImg from '../../assets/budo league/HK12mrDW4AAnhC1.jpg';
import seasonImg from '../../assets/budo league/season.jfif';
import starImg from '../../assets/budo league/star.webp';
import womanImg from '../../assets/budo league/woman.jfif';

const leadStory = {
  tag: 'Budo League',
  title: 'Budo League 2026 Season Kicks Off with Record Number of Teams',
  summary: 'The Budo League enters its most exciting season yet with 24 teams competing across two divisions, showcasing the best of old students football from King\'s College Budo.',
  date: '20 June 2026',
  image: budoLeagueWebp,
};

const moreStories = [
  { tag: 'Match Reports', title: 'Budo Old Boys Stun Lions with Late Winner in Derby Clash', summary: 'A 89th minute strike from captain Andrew Ssempijja secured a dramatic 2-1 victory in the highly anticipated Budo derby.', date: '18 June 2026', image: hkImg },
  { tag: 'Transfers', title: 'Star Striker Peter Kirabo Returns to His Boyhood Club', summary: 'The former Budo student joins the league after a successful spell in the FUFA Big League, signing a two-year deal.', date: '15 June 2026', image: starImg },
  { tag: 'Development', title: 'Budo League Launches Youth Academy Partnership with School', summary: 'The league has partnered with King\'s College Budo to create a structured pathway for current students into the old boys league.', date: '12 June 2026', image: seasonImg },
  { tag: 'Women\'s Football', title: 'Budo League Introduces Women\'s Division for 2026 Season', summary: 'For the first time ever, the Budo League will feature a women\'s division with 8 teams confirmed for the inaugural season.', date: '10 June 2026', image: womanImg },
];

const standings = [
  { pos: 1, team: 'Budo Old Boys FC', p: 10, w: 8, d: 1, l: 1, pts: 25 },
  { pos: 2, team: 'Lions FC', p: 10, w: 7, d: 2, l: 1, pts: 23 },
  { pos: 3, team: 'Kings XI', p: 10, w: 6, d: 3, l: 1, pts: 21 },
  { pos: 4, team: 'Budo United', p: 10, w: 5, d: 2, l: 3, pts: 17 },
  { pos: 5, team: 'College FC', p: 10, w: 4, d: 4, l: 2, pts: 16 },
];

const topStories = [
  { title: 'Budo League announces new sponsorship deal for 2026 season', date: '19 June 2026' },
  { title: 'Record attendance expected for Budo derby this weekend', date: '17 June 2026' },
  { title: 'Budo League All-Star game scheduled for August', date: '14 June 2026' },
  { title: 'Five players called up to national team from Budo League', date: '11 June 2026' },
  { title: 'Budo League app launched for live scores and updates', date: '9 June 2026' },
];

const transfers = [
  { player: 'Peter Kirabo', from: 'Free Agent', to: 'Budo Old Boys FC', type: 'in' as const },
  { player: 'David Muwonge', from: 'Kings XI', to: 'Lions FC', type: 'out' as const },
  { player: 'Samuel Kasirye', from: 'College FC', to: 'Budo United', type: 'in' as const },
  { player: 'Joseph Ssali', from: 'Budo Old Boys FC', to: 'Kings XI', type: 'out' as const },
];

const watchItems = [
  { title: 'Budo Derby Highlights - Budo Old Boys vs Lions FC', meta: '12 min watch', image: hkImg },
  { title: 'Budo League Season Preview 2026', meta: '8 min watch', image: budoLeagueWebp },
  { title: 'Interview: Budo Old Boys FC Captain', meta: '15 min watch', image: seasonImg },
  { title: 'Best Goals of Budo League 2025', meta: '6 min watch', image: starImg },
];

export default function BudoLeague() {
  const navigate = useNavigate();

  const handleStoryClick = () => navigate('/news');

  return (
    <div className="sport-page budo-theme">
      <Navbar />
      <button className="sport-back-btn" onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      {/* League Header */}
      <div className="league-header">
        <div className="league-header-brand">
          <img src={buddoLeagueSvg} alt="Budo League" className="league-logo" />
          <div>
            <h1>Budo League</h1>
            <p className="league-motto">The premier old students football competition</p>
          </div>
        </div>
        <div className="league-quick-info">
          <div className="quick-info-item">
            <IoSchoolOutline size={16} />
            <span>24 Teams</span>
          </div>
          <div className="quick-info-item">
            <FiMapPin size={16} />
            <span>Kampala, Uganda</span>
          </div>
          <div className="quick-info-item">
            <FiClock size={16} />
            <span>Since 1998</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="sport-page-header">
        <p>The premier football competition for old students of King's College Budo. Tradition, rivalry, and excellence on the pitch.</p>
      </div>

      {/* Main Content */}
      <div className="sport-content-wrapper">
        <div className="sport-main">
          {/* Lead Story */}
          <div className="lead-story" onClick={handleStoryClick}>
            {leadStory.image ? (
              <img src={leadStory.image} alt={leadStory.title} className="lead-story-image" />
            ) : (
              <div className="lead-story-image-placeholder">
                <IoSchoolOutline size={64} />
              </div>
            )}
            <div className="lead-story-text">
              <span className="story-tag">{leadStory.tag}</span>
              <h2>{leadStory.title}</h2>
              <p>{leadStory.summary}</p>
              <div className="story-meta">
                <FiClock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                {leadStory.date}
              </div>
            </div>
          </div>

          {/* More Stories Grid */}
          <div className="sport-section">
            <div className="sport-section-title">
              <FiTrendingUp size={18} />
              <span>More Stories</span>
            </div>
            <div className="story-grid">
              {moreStories.map((story) => (
                <div key={story.title} className="story-card" onClick={handleStoryClick}>
                  {story.image ? (
                    <img src={story.image} alt={story.title} className="story-card-image" />
                  ) : (
                    <div className="story-card-image-placeholder">
                      <IoSchoolOutline size={32} />
                    </div>
                  )}
                  <div className="story-card-body">
                    <span className="story-tag">{story.tag}</span>
                    <h3>{story.title}</h3>
                    <p>{story.summary}</p>
                    <div className="story-meta">{story.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="sport-sidebar">
          {/* Standings Widget */}
          <div className="sidebar-widget">
            <h3>Budo League Standings</h3>
            <table className="standings-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Team</th>
                  <th>P</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row) => (
                  <tr key={row.team}>
                    <td className="team-pos">{row.pos}</td>
                    <td className="team-name">{row.team}</td>
                    <td>{row.p}</td>
                    <td>{row.w}</td>
                    <td>{row.d}</td>
                    <td>{row.l}</td>
                    <td className="team-pts">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Stories Widget */}
          <div className="sidebar-widget">
            <h3>Must Read</h3>
            <ul className="top-stories-list">
              {topStories.map((story) => (
                <li key={story.title} onClick={handleStoryClick}>
                  {story.title}
                  <span className="story-date">{story.date}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Transfers Widget */}
          <div className="sidebar-widget">
            <h3>Latest Transfers</h3>
            <ul className="transfer-list">
              {transfers.map((t) => (
                <li key={t.player}>
                  <div className={`transfer-icon ${t.type}`}>
                    {t.type === 'in' ? '⬇' : '⬆'}
                  </div>
                  <div>
                    <strong>{t.player}</strong>
                    <div className="transfer-club">{t.from} → {t.to}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Watch Section */}
      <div className="watch-section">
        <div className="watch-section-header">
          <h2>Watch </h2>
          <span style={{ fontSize: 13, color: '#888', cursor: 'pointer' }}>View all →</span>
        </div>
        <div className="watch-grid">
          {watchItems.map((item) => (
            <div key={item.title} className="watch-card">
              <div className="watch-thumb" style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <IoSchoolOutline size={32} style={{ opacity: 0 }} />
              </div>
              <p>{item.title}</p>
              <div className="watch-meta">{item.meta}</div>
            </div>
          ))}
        </div>
      </div>

      {/* About the League */}
      <div className="league-about-section">
        <div className="league-about-content">
          <h2>About the Budo League</h2>
          <div className="league-about-grid">
            <div className="about-card">
              <h3> History</h3>
              <p>Founded in 1998 by old students of King's College Budo, the Budo League has grown from a small gathering of alumni to become one of Uganda's most prestigious old students football competitions.</p>
            </div>
            <div className="about-card">
              <h3>Mission</h3>
              <p>To foster camaraderie, healthy competition, and community development among old Budonians through the beautiful game of football.</p>
            </div>
            <div className="about-card">
              <h3>Community</h3>
              <p>With over 500 registered players across 24 teams, the Budo League represents a vibrant community of professionals, entrepreneurs, and leaders united by their alma mater.</p>
            </div>
            <div className="about-card">
              <h3>Growth</h3>
              <p>The league now features two divisions, a women's section, and youth development programs, making it a model for old students associations across East Africa.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="sport-cta-banner" style={{
        background: `linear-gradient(135deg, rgba(0, 80, 40, 0.92), rgba(0, 120, 60, 0.88)), url(${ctaBannerImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
      }}>
        <h2>Join the Budo League Community</h2>
        <p>Follow your team, get live match updates, and connect with fellow Budonians.</p>
        <button onClick={() => navigate('/register')}>Create Free Account</button>
      </div>

      <Footer />
    </div>
  );
}