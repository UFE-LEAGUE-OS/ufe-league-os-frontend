import { useNavigate } from 'react-router-dom';
import { FiClock, FiTrendingUp, FiMapPin } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../sports/SportsPage.css';
import './Leagues.css';

import uplSvg from '../../assets/star-times-upl.svg';
import ctaBannerImg from '../../assets/cta-banner.png';
import uplImage from '../../assets/uganda premier league/image.jfif';
import uplImg1 from '../../assets/uganda premier league/images (1).jfif';
import uplImg2 from '../../assets/uganda premier league/images (2).jfif';
import uplImg3 from '../../assets/uganda premier league/images (3).jfif';
import uplImg from '../../assets/uganda premier league/images.jfif';
import vipersJpg from '../../assets/uganda premier league/Vipers-football-club.jpg';
import edwardSatulo from '../../assets/uganda premier league/Edward-Satulo-clears-the-ball.webp';

const leadStory = {
  tag: 'Uganda Premier League',
  title: 'Vipers SC Secure Top Spot After Thrilling Victory Over KCCA FC',
  summary: 'A dramatic 3-2 win at St. Mary\'s Stadium sees Vipers move to the top of the Uganda Premier League table, leaving KCCA FC in second place with just two points separating the sides.',
  date: '15 June 2026',
  image: vipersJpg,
};

const moreStories = [
  { tag: 'Transfer News', title: 'Youngster Ivan Ssempijja Signs Three-Year Deal with KCCA FC', summary: 'The 19-year-old midfielder joins the Kampala giants from regional side Busoga United for an undisclosed fee.', date: '10 June 2026', image: edwardSatulo },
  { tag: 'Uganda Cup', title: 'Uganda Cup Quarter-Final Draw Reveals Exciting Matchups', summary: 'FUFA has confirmed the quarter-final pairings for this year\'s competition, with defending champions BUL FC facing Vipers SC.', date: '12 June 2026', image: uplImg3 },
  { tag: 'FUFA Big League', title: 'Kitara FC Clinch Promotion to Uganda Premier League', summary: 'A 2-0 victory over Calvary FC secured Kitara\'s return to the top flight after a four-season absence.', date: '8 June 2026', image: uplImg2 },
  { tag: 'Analysis', title: 'Why Uganda Premier League Is Becoming Africa\'s Most Competitive', summary: 'With five different champions in the last six seasons, the UPL is proving that any team can beat any other on their day.', date: '5 June 2026', image: uplImg1 },
];

const standings = [
  { pos: 1, team: 'Vipers SC', p: 16, w: 12, d: 3, l: 1, pts: 39 },
  { pos: 2, team: 'KCCA FC', p: 16, w: 11, d: 4, l: 1, pts: 37 },
  { pos: 3, team: 'SC Villa', p: 16, w: 10, d: 3, l: 3, pts: 33 },
  { pos: 4, team: 'URA FC', p: 16, w: 9, d: 5, l: 2, pts: 32 },
  { pos: 5, team: 'BUL FC', p: 16, w: 8, d: 4, l: 4, pts: 28 },
];

const topStories = [
  { title: 'Micho returns to coach Uganda Cranes for fourth time', date: '14 June 2026' },
  { title: 'Express FC appoint new head coach ahead of new season', date: '13 June 2026' },
  { title: 'URA FC striker leads goal-scoring charts with 12 goals', date: '11 June 2026' },
  { title: 'FUFA unveils new five-year development plan for Ugandan football', date: '9 June 2026' },
  { title: 'Wakiso Giants stadium renovation to be completed by August', date: '7 June 2026' },
];

const transfers = [
  { player: 'Ivan Ssempijja', from: 'Busoga United', to: 'KCCA FC', type: 'in' as const },
  { player: 'Joshua Lubwama', from: 'Vipers SC', to: 'SC Villa', type: 'out' as const },
  { player: 'Moses Waiswa', from: 'URA FC', to: 'BUL FC', type: 'in' as const },
  { player: 'Derrick Kakooza', from: 'Police FC', to: 'Express FC', type: 'out' as const },
];

const watchItems = [
  { title: 'Vipers SC vs KCCA FC - Match Highlights', meta: '12 min watch', image: vipersJpg },
  { title: 'Uganda Cup 2025 - Best Goals of the Tournament', meta: '8 min watch', image: uplImg1 },
  { title: 'Exclusive: Interview with Vipers SC Head Coach', meta: '15 min watch', image: uplImage },
  { title: 'UPL Round 16 - Goals Roundup', meta: '6 min watch', image: uplImg },
];

export default function UgandaPremierLeague() {
  const navigate = useNavigate();

  const handleStoryClick = () => navigate('/news');

  return (
    <div className="sport-page upl-theme">
      <Navbar />
      <button className="sport-back-btn" onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      {/* League Header */}
      <div className="league-header">
        <div className="league-header-brand">
          <img src={uplSvg} alt="Uganda Premier League" className="league-logo" />
          <div>
            <h1>Uganda Premier League</h1>
            <p className="league-motto">Uganda's elite football division</p>
          </div>
        </div>
        <div className="league-quick-info">
          <div className="quick-info-item">
            <GiSoccerBall size={16} />
            <span>16 Clubs</span>
          </div>
          <div className="quick-info-item">
            <FiMapPin size={16} />
            <span>Kampala, Uganda</span>
          </div>
          <div className="quick-info-item">
            <FiClock size={16} />
            <span>Since 1968</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="sport-page-header">
        <p>From the local pitch to the big stage. The latest news, scores, and analysis from the Uganda Premier League.</p>
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
                <GiSoccerBall size={64} />
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
                      <GiSoccerBall size={32} />
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
            <h3>Uganda Premier League</h3>
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
                <GiSoccerBall size={32} style={{ opacity: 0 }} />
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
          <h2>About the Uganda Premier League</h2>
          <div className="league-about-grid">
            <div className="about-card">
              <h3>History</h3>
              <p>Founded in 1968, the Uganda Premier League is the top professional football division in Uganda. With 16 clubs competing each season, it showcases the best of Ugandan football talent.</p>
            </div>
            <div className="about-card">
              <h3>Mission</h3>
              <p>To develop and promote professional football in Uganda, providing a competitive platform for clubs and players to excel at the highest domestic level.</p>
            </div>
            <div className="about-card">
              <h3>Clubs</h3>
              <p>The league features historic clubs like SC Villa, KCCA FC, Vipers SC, and Express FC, each with passionate fan bases that create electric matchday atmospheres across the country.</p>
            </div>
            <div className="about-card">
              <h3> Growth</h3>
              <p>With increasing TV coverage, sponsorship deals, and player exports to international leagues, the UPL continues to raise the standard of Ugandan football on the African stage.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="sport-cta-banner" style={{
        background: `linear-gradient(135deg, rgba(30, 58, 138, 0.92), rgba(37, 99, 235, 0.88)), url(${ctaBannerImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
      }}>
        <h2>Follow the UPL Action</h2>
        <p>Get live scores, transfer news, and exclusive match analysis delivered to your feed.</p>
        <button onClick={() => navigate('/register')}>Create Free Account</button>
      </div>

      <Footer />
    </div>
  );
}