import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiTrendingUp, FiMapPin } from 'react-icons/fi';
import { MdSportsBasketball } from 'react-icons/md';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../sports/SportsPage.css';
import './Leagues.css';

import nblSvg from '../../assets/national-basketball.svg';
import ctaBannerImg from '../../assets/cta-banner.png';
import headerBasketImg from '../../assets/national basket league/images.jfif';
import story1Img from '../../assets/national basket league/images (1).jfif';
import story2Img from '../../assets/national basket league/images (2).jfif';
import story3Img from '../../assets/national basket league/images (3).jfif';
import story4Img from '../../assets/national basket league/images (4).jfif';
import basketballCardImg from '../../assets/national basket league/download.jfif';
import basketChampionsImg from '../../assets/basket_champions.jfif';
import namBlazersImg from '../../assets/nam-blazers.png';

const leadStory = {
  tag: 'National Basketball League',
  title: 'Nam Blazers Claim 2025 NBL Title, City Oilers Reign Ends at Ten',
  summary: 'The Namuwongo Blazers ended the City Oilers\' decade-long dominance, winning their first NBL championship in 2025. Joel Lukoji Banza was named both league MVP and Finals MVP.',
  date: '2025 Season',
  image: headerBasketImg,
};

const moreStories = [
  { tag: 'NBL History', title: 'City Oilers: The Most Decorated Team with 10 Consecutive Titles', summary: 'The City Oilers have dominated Ugandan basketball with 10 straight NBL championships, establishing themselves as a powerhouse in East African basketball.', date: '2010-2024', image: story1Img },
  { tag: 'Road to BAL', title: 'NBL Champions Earn Spot in Basketball Africa League Qualifiers', summary: 'The league champions qualify for the Road to BAL, representing Uganda in continental competition against top African clubs.', date: 'Annual', image: story2Img },
  { tag: 'FUBA Awards', title: 'Annual FUBA Awards Celebrate NBL\'s Top Performers and MVPs', summary: 'Each year the Federation of Uganda Basketball Associations honours the league\'s most valuable players, top scorers, and standout performers.', date: 'Annual', image: story3Img },
  { tag: 'The Silverbacks', title: 'Uganda National Team Continues to Rise Through NBL Development', summary: 'The NBL serves as the primary pipeline for the Uganda national team, The Silverbacks, who debuted at the FIBA Africa Championship in 2015.', date: 'National Team', image: story4Img },
];

const standings = [
  { pos: 1, team: 'Namuwongo Blazers', p: 24, w: 20, d: 0, l: 4, pts: 40 },
  { pos: 2, team: 'City Oilers', p: 24, w: 19, d: 0, l: 5, pts: 38 },
  { pos: 3, team: 'KIU Titans', p: 24, w: 16, d: 0, l: 8, pts: 32 },
  { pos: 4, team: 'UCU Canons', p: 24, w: 14, d: 0, l: 10, pts: 28 },
  { pos: 5, team: 'JKL Dolphins', p: 24, w: 13, d: 0, l: 11, pts: 26 },
];

const topStories = [
  { title: '2025 Champions: Nam Blazers capture first NBL title', date: '2025' },
  { title: 'City Oilers\' historic 10-title streak ends', date: '2025' },
  { title: 'Joel Lukoji Banza named MVP and Finals MVP', date: '2025' },
  { title: 'NBL expands to 13 teams for 2025 season', date: '2025' },
  { title: 'Uganda\'s Road to BAL campaign set for 2026', date: '2026' },
];

const transfers = [
  { player: 'Titus Lual', from: 'City Oilers', to: 'Namuwongo Blazers', type: 'out' as const },
  { player: 'Fayeed Bbale', from: 'Namuwongo Blazers', to: 'City Oilers', type: 'in' as const },
  { player: 'Peter Cheng', from: 'KIU Titans', to: 'Namuwongo Blazers', type: 'in' as const },
  { player: 'Tonny Drileba', from: 'Our Saviour', to: 'KIU Titans', type: 'in' as const },
];

const watchItems = [
  { title: '2025 NBL Finals - Nam Blazers vs City Oilers Highlights', meta: '12 min watch', image: basketballCardImg },
  { title: 'Top 10 Plays of the 2025 NBL Season', meta: '8 min watch', image: basketChampionsImg },
  { title: 'Road to BAL: Uganda\'s Continental Journey', meta: '15 min watch', image: headerBasketImg },
  { title: 'FUBA Awards 2025 - Full Ceremony', meta: '20 min watch', image: namBlazersImg },
];

export default function NationalBasketballLeague() {
  const navigate = useNavigate();

  const handleStoryClick = () => navigate('/news');

  return (
    <div className="sport-page nbl-theme">
      <Navbar />
      <button className="sport-back-btn" onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      {/* League Header */}
      <div className="league-header">
        <div className="league-header-brand">
          <img src={nblSvg} alt="National Basketball League" className="league-logo" />
          <div>
            <h1>National Basketball League</h1>
            <p className="league-motto">Uganda's premier basketball competition</p>
          </div>
        </div>
        <div className="league-quick-info">
          <div className="quick-info-item">
            <MdSportsBasketball size={16} />
            <span>13 Clubs</span>
          </div>
          <div className="quick-info-item">
            <FiMapPin size={16} />
            <span>Kampala, Uganda</span>
          </div>
          <div className="quick-info-item">
            <FiClock size={16} />
            <span>Since 1995</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="sport-page-header">
        <p>The National Basketball League (NBL) is a semi-professional basketball league in Uganda that serves as the highest division of men's basketball in the country. Established in 1995, the league currently consists of 13 teams and is administered by the Federation of Uganda Basketball Associations (FUBA), founded in 1962.</p>
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
                <MdSportsBasketball size={64} />
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
                      <MdSportsBasketball size={32} />
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
            <h3>National Basketball League</h3>
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
          <h2>Watch</h2>
          <span style={{ fontSize: 13, color: '#888', cursor: 'pointer' }}>View all →</span>
        </div>
        <div className="watch-grid">
          {watchItems.map((item) => (
            <div key={item.title} className="watch-card">
              <div className="watch-thumb" style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <MdSportsBasketball size={32} style={{ opacity: 0 }} />
              </div>
              <p>{item.title}</p>
              <div className="watch-meta">{item.meta}</div>
            </div>
          ))}
        </div>
      </div>

      {/* About the League - Updated with Wikipedia information */}
      <div className="league-about-section">
        <div className="league-about-content">
          <h2>About the National Basketball League</h2>
          <div className="league-about-grid">
            <div className="about-card">
              <h3>History</h3>
              <p>Basketball was introduced in Uganda in 1962 by the American Peace Corps and East African teachers. The National Basketball League (NBL) was formally established in 1995 as the highest division of men's basketball. The Federation of Uganda Basketball Associations (FUBA), founded in 1962, brings together 61 basketball teams primarily from the central region.</p>
            </div>
            <div className="about-card">
              <h3>Competition & Style</h3>
              <p>The league is particularly known for its physicality—a defining feature that sets Ugandan basketball apart from other regional leagues. The NBL consists of 13 clubs with promotion and relegation to Division 1 (second level) and Division 2 (third level). Champions earn the right to participate in the Road to BAL qualifiers for the Basketball Africa League.</p>
            </div>
            <div className="about-card">
              <h3>Champions</h3>
              <p>The City Oilers are the most successful team in league history with 10 total championships, all won consecutively—demonstrating sustained excellence and dominance. The Namuwongo Blazers (Nam Blazers) are the current champions, winning their first title in 2025. Other notable clubs include KIU Titans, UCU Canons, JKL Dolphins, and Kampala Rockets.</p>
            </div>
            <div className="about-card">
              <h3>Development</h3>
              <p>The NBL serves as the primary pipeline for Uganda's national team, The Silverbacks, who made their FIBA Africa Championship debut in 2015 in Tunisia. FUBA also organizes secondary school games, university competitions, 3x3 basketball tournaments, and international zonal qualifiers. The league continues expanding its reach beyond the central region of Uganda.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Clubs Section - from Wikipedia */}
      <div className="league-about-section" style={{ background: '#0f0f0f' }}>
        <div className="league-about-content">
          <h2>Current NBL Clubs (13 Teams)</h2>
          <div className="league-about-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { name: 'City Oilers', location: 'Silver Springs, Kampala' },
              { name: 'JKL Dolphins', location: 'Namboole, Kampala' },
              { name: 'JT Jaguars', location: 'Kira Town, Kampala' },
              { name: 'Kampala Rockets', location: 'Kampala' },
              { name: 'KCCA Panthers', location: 'Nakasero, Kampala' },
              { name: 'KIU Titans', location: 'Kampala' },
              { name: 'LivingStone', location: 'Budaka District' },
              { name: 'Namuwongo Blazers', location: 'Namuwongo, Kampala' },
              { name: 'Rezlife Saints', location: 'Kampala' },
              { name: 'Sommet', location: 'Kampala' },
              { name: 'UCU Canons', location: 'Kampala' },
              { name: 'Victoria Crocs', location: 'Kampala' },
            ].map((club) => (
              <div key={club.name} className="about-card" style={{ padding: 12, margin: 0 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: 14, color: '#f97316' }}>{club.name}</h4>
                <p style={{ margin: 0, fontSize: 12, color: '#aaa' }}>{club.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FUBA Awards Section - from Wikipedia */}
      <div className="league-about-section">
        <div className="league-about-content">
          <h2>FUBA Awards: NBL Most Valuable Players</h2>
          <div className="league-about-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {[
              { year: 2013, mvp: 'Bernard Okumu (Vegetarians)', playoffs_mvp: 'Kami Kabange (Oilers)' },
              { year: 2014, mvp: '—', playoffs_mvp: 'Jimmy Enabu (Oilers)' },
              { year: 2015, mvp: 'Brian Namake (UCU Canons)', playoffs_mvp: 'Kami Kabange (Oilers)' },
              { year: 2017, mvp: 'Jordin Mayes (Oilers)', playoffs_mvp: 'Asher Sserugo (Oilers)' },
              { year: 2018, mvp: 'Michael Makiadi (Power)', playoffs_mvp: 'Landry Ndikumana (Oilers)' },
              { year: 2019, mvp: 'Landry Ndikumana (Oilers)', playoffs_mvp: 'James Okello (Oilers)' },
              { year: 2020, mvp: 'Syrus Kiviiri (Power)', playoffs_mvp: 'James Okello (Oilers)' },
              { year: 2022, mvp: 'Tonny Drileba (Oilers)', playoffs_mvp: 'James Okello (Oilers)' },
              { year: 2023, mvp: 'Titus Lual (Oilers)', playoffs_mvp: 'Titus Lual (Oilers)' },
              { year: 2024, mvp: '—', playoffs_mvp: 'Titus Lual (Oilers)' },
              { year: 2025, mvp: 'Joel Lukoji Banza (Blazers)', playoffs_mvp: 'Joel Lukoji Banza (Blazers)' },
            ].map((award) => (
              <div key={award.year} className="about-card" style={{ padding: 12, margin: 0 }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#f97316' }}>{award.year} Season</h4>
                <p style={{ margin: 0, fontSize: 12, color: '#ccc' }}><strong>MVP:</strong> {award.mvp}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#aaa' }}><strong>Playoffs MVP:</strong> {award.playoffs_mvp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="sport-cta-banner" style={{
        background: `linear-gradient(135deg, rgba(234, 88, 12, 0.92), rgba(249, 115, 22, 0.88)), url(${ctaBannerImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
      }}>
        <h2>Experience Ugandan Hoops</h2>
        <p>Get the latest scores, player stats, and breaking basketball news from across Uganda.</p>
        <button onClick={() => navigate('/register')}>Create Free Account</button>
      </div>

      {/* Back Button */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: '1px solid #4f46e5',
            color: '#4f46e5',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#4f46e5';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#4f46e5';
          }}
        >
          <FiArrowLeft size={18} />
          Back to Home
        </button>
      </div>

      <Footer />
    </div>
  );
}
