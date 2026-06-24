import { useNavigate } from 'react-router-dom';
import { FiClock, FiTrendingUp, FiMapPin } from 'react-icons/fi';
import { GiRugbyConversion } from 'react-icons/gi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../sports/SportsPage.css';
import './Leagues.css';

import smackLeagueSvg from '../../assets/smack-league.svg';
import ctaBannerImg from '../../assets/cta-banner.png';
import smackLeagueWebp from '../../assets/smack league/Smack-league.webp';
import finaleImg from '../../assets/smack league/finale.jpg';
import guinessVibesImg from '../../assets/smack league/Guiness-vibes.webp';
import smackImg1 from '../../assets/smack league/images (1).jfif';
import smackImg2 from '../../assets/smack league/images (2).jfif';

import seasonImg from '../../assets/smack league/season.jfif';

const leadStory = {
  tag: 'SMACK League Season 8',
  title: 'Five Derbies and Live Entertainment Headline SMACK League\'s Return',
  summary: 'The SMACK League, powered by Guinness, makes its return on Matchday 8 of Season 8 at the IUEA Sports Grounds in Kansanga, Kampala. The Valentine\'s Edition promises thrilling rugby action and entertainment.',
  date: '12 February 2026',
  image: smackLeagueWebp,
};

const moreStories = [
  { tag: 'Matchday Experience', title: 'Guinness Matchday on Tour Elevates SMACK League with Premier League Experience', summary: 'The Guinness Matchday Truck brought a full Premier League experience to the SMACK League, complete with live screenings and fan activations.', date: '23 November 2025', image: guinessVibesImg },
  { tag: 'Rugby 7s', title: 'SMACK League Season 8 Kicks Off with Record Participation', summary: 'The eighth season of Uganda\'s premier rugby 7s social league began with five teams competing for glory, bringing together corporate and community sides.', date: '15 October 2025', image: finaleImg },
  { tag: 'Social Rugby', title: 'Why SMACK League Is Changing Uganda\'s Rugby Social Scene', summary: 'Blending competitive rugby 7s with entertainment, the SMACK League has created a unique weekend sports experience that attracts players and fans alike.', date: '20 October 2025', image: smackImg2 },
  { tag: 'Community', title: 'SMACK League Teams Prep for Crucial Matchday 8 Fixtures', summary: 'With the season reaching its climax, teams are battling for position in the standings as the race for the title heats up.', date: '5 February 2026', image: smackImg1 },
];

const standings = [
  { pos: 1, team: 'SMACK Lions', p: 7, w: 6, d: 0, l: 1, pts: 18 },
  { pos: 2, team: 'Guinness Warriors', p: 7, w: 5, d: 1, l: 1, pts: 16 },
  { pos: 3, team: 'Kansanga Kings', p: 7, w: 4, d: 1, l: 2, pts: 13 },
  { pos: 4, team: 'IUEA Eagles', p: 7, w: 2, d: 0, l: 5, pts: 6 },
  { pos: 5, team: 'City Chiefs', p: 7, w: 0, d: 0, l: 7, pts: 0 },
];

const topStories = [
  { title: 'SMACK League Valentine\'s Edition set for February 15', date: '10 February 2026' },
  { title: 'Guinness extends partnership with SMACK League', date: '28 January 2026' },
  { title: 'SMACK League Season 8 attracts record crowds', date: '20 November 2025' },
  { title: 'Five teams confirmed for Season 8 of SMACK League', date: '10 October 2025' },
  { title: 'SMACK League named best social sports league in Kampala', date: '5 December 2025' },
];

const transfers = [
  { player: 'Michael Okello', from: 'City Chiefs', to: 'SMACK Lions', type: 'in' as const },
  { player: 'James Ssali', from: 'Guinness Warriors', to: 'Kansanga Kings', type: 'out' as const },
  { player: 'David Wasswa', from: 'IUEA Eagles', to: 'Guinness Warriors', type: 'in' as const },
  { player: 'Samuel Kintu', from: 'SMACK Lions', to: 'City Chiefs', type: 'out' as const },
];

const watchItems = [
  { title: 'SMACK League Matchday 8 - Valentine\'s Edition Highlights', meta: '10 min watch', image: smackLeagueWebp },
  { title: 'Guinness Matchday Experience at SMACK League', meta: '8 min watch', image: guinessVibesImg },
  { title: 'Best Tries of SMACK League Season 8 So Far', meta: '6 min watch', image: seasonImg },
  { title: 'Interview: SMACK League Season 8 Title Contenders', meta: '12 min watch', image: finaleImg },
];

export default function SmackLeague() {
  const navigate = useNavigate();

  const handleStoryClick = () => navigate('/news');

  return (
    <div className="sport-page smack-theme">
      <Navbar />
      <button className="sport-back-btn" onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      {/* League Header */}
      <div className="league-header">
        <div className="league-header-brand">
          <img src={smackLeagueSvg} alt="SMACK League" className="league-logo" />
          <div>
            <h1>SMACK League</h1>
            <p className="league-motto">Uganda's premier social rugby 7s league</p>
          </div>
        </div>
        <div className="league-quick-info">
          <div className="quick-info-item">
            <GiRugbyConversion size={16} />
            <span>5 Teams</span>
          </div>
          <div className="quick-info-item">
            <FiMapPin size={16} />
            <span>IUEA Grounds, Kansanga</span>
          </div>
          <div className="quick-info-item">
            <FiClock size={16} />
            <span>Season 8</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="sport-page-header">
        <p>Powered by Guinness. Where competitive rugby 7s meets entertainment. The SMACK League is Kampala's ultimate weekend sports experience.</p>
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
                <GiRugbyConversion size={64} />
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
                      <GiRugbyConversion size={32} />
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
            <h3>SMACK League Standings</h3>
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
                <GiRugbyConversion size={32} style={{ opacity: 0 }} />
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
          <h2>About the SMACK League</h2>
          <div className="league-about-grid">
            <div className="about-card">
              <h3> What is SMACK League?</h3>
              <p>The SMACK League is Uganda's premier social rugby 7s competition, powered by Guinness. It brings together corporate teams, rugby enthusiasts, and fans for a unique blend of competitive rugby and entertainment.</p>
            </div>
            <div className="about-card">
              <h3> Venue</h3>
              <p>All matches are played at the IUEA Sports Grounds in Kansanga, Kampala. The venue provides an intimate atmosphere where fans can enjoy world-class rugby 7s action up close.</p>
            </div>
            <div className="about-card">
              <h3>Experience</h3>
              <p>More than just rugby - each matchday features live entertainment, DJs, food vendors, and the famous Guinness Matchday Truck, creating a festival-like atmosphere for fans of all ages.</p>
            </div>
            <div className="about-card">
              <h3> Season 8</h3>
              <p>Now in its eighth season, the SMACK League continues to grow with 5 competing teams, increased fan attendance, and the highest standard of rugby 7s in Uganda's social sports scene.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="sport-cta-banner" style={{
        background: `linear-gradient(135deg, rgba(180, 120, 0, 0.92), rgba(220, 160, 0, 0.88)), url(${ctaBannerImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
      }}>
        <h2>Experience the SMACK League</h2>
        <p>Follow the action, get matchday updates, and be part of Kampala's most exciting rugby 7s league.</p>
        <button onClick={() => navigate('/register')}>Create Free Account</button>
      </div>

      <Footer />
    </div>
  );
}