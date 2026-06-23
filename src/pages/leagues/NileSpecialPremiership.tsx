import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiTrendingUp, FiMapPin } from 'react-icons/fi';
import { GiRugbyConversion } from 'react-icons/gi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../sports/SportsPage.css';
import './Leagues.css';

import nileRugbySvg from '../../assets/nile-rugby.svg';
import ctaBannerImg from '../../assets/cta-banner.png';
import heathensImg from '../../assets/Nile special premiership/images.jfif';
import ugandaRugbyImg from '../../assets/Nile special premiership/images (1).jfif';
import piratesImg from '../../assets/Nile special premiership/images (2).jfif';

import womenRugbyImg from '../../assets/Nile special premiership/images (4).jfif';
import rugbyChampionsImg from '../../assets/Nile special premiership/images (5).jfif';
import sponsorImg from '../../assets/Nile special premiership/images (6).jfif';

import impisImg from '../../assets/impis.jpg';
import ugandaCupImg from '../../assets/ugandacup.jfif';

const leadStory = {
  tag: 'Nile Special Rugby Premiership',
  title: 'Stanbic Black Pirates Crowned League Champions',
  summary: 'Stanbic Black Pirates defeated KOBs 24-07 at Legends to claim the Nile Special Rugby Premiership title, finishing top of the table with 79 points. Heathens RFC placed second with 77 points, while KOBs took third with 75 points.',
  date: '2025/26 Season',
  image: rugbyChampionsImg,
};

const moreStories = [
  { tag: 'Nile Special Premiership', title: 'Heathens vs Kobs: Title Decider Clash as Top Teams Meet', summary: 'The Nile Special Rugby Premiership top two teams clashed in a crucial title decider, with Heathens hosting Kobs in a match that would shape the championship race.', date: 'Latest Season', image: heathensImg },
  { tag: 'Rugby 7s', title: 'Uganda 7s Team Announced for Africa Cup Sevens in Kenya', summary: 'The Uganda Rugby Union has named a 14-man squad for the upcoming tournament, with captain Michael Wokorach leading the side.', date: '14 June 2026', image: ugandaRugbyImg },
  { tag: 'Nile Special Premiership', title: 'Toyota Buffaloes Rise in Standings After Strong Season Run', summary: 'Toyota Buffaloes improved their position from 5th to 4th place in the league standings, showcasing their development in Ugandan rugby.', date: 'Latest Season', image: sponsorImg },
  { tag: 'Women\'s Rugby', title: 'Uganda Women\'s Rugby Team Prepares for Friendly Series', summary: 'The Lady Rugby Cranes are set to face Kenya in a three-match friendly series later this month in Kampala.', date: '3 June 2026', image: womenRugbyImg },
];

const standings = [
  { pos: 1, team: 'Stanbic Black Pirates', p: 14, w: 13, d: 0, l: 1, pts: 79 },
  { pos: 2, team: 'Heathens RFC', p: 14, w: 12, d: 0, l: 2, pts: 77 },
  { pos: 3, team: 'KOBs Rugby', p: 14, w: 11, d: 1, l: 2, pts: 75 },
  { pos: 4, team: 'Jinja Hippos', p: 14, w: 8, d: 0, l: 6, pts: 50 },
  { pos: 5, team: 'Toyota Buffaloes', p: 14, w: 7, d: 1, l: 6, pts: 36 },
];

const topStories = [
  { title: 'Stanbic Black Pirates crowned Nile Special Rugby Premiership champions', date: '2025/26' },
  { title: 'Uganda Rugby Union announces new youth development academy', date: '2026' },
  { title: 'Nile Special extends sponsorship of Uganda Rugby League', date: '2026' },
  { title: 'Mongers RFC aiming for promotion to top division', date: '2026' },
  { title: 'Uganda to host 2027 Africa Rugby Cup qualifying tournament', date: '2026' },
];

const transfers = [
  { player: 'Desire Ssempijja', from: 'KOBs Rugby', to: 'Stanbic Black Pirates', type: 'in' as const },
  { player: 'Ivan Magomu', from: 'Pirates RFC', to: 'Jinja Hippos', type: 'out' as const },
  { player: 'James Odongo', from: 'Rams RFC', to: 'KOBs Rugby', type: 'in' as const },
  { player: 'Simon Odoch', from: 'Heathens RFC', to: 'Pirates RFC', type: 'out' as const },
];

const watchItems = [
  { title: 'Nile Special Premiership - Final: Pirates vs KOBs Highlights', meta: '10 min watch', image: rugbyChampionsImg },
  { title: 'Uganda 7s - Africa Cup Preparation Match', meta: '14 min watch', image: impisImg },
  { title: 'Exclusive: Interview with Stanbic Black Pirates Captain', meta: '12 min watch', image: piratesImg },
  { title: 'Best Tries of the Nile Special Premiership Season', meta: '7 min watch', image: ugandaCupImg },
];

export default function NileSpecialPremiership() {
  const navigate = useNavigate();

  const handleStoryClick = () => navigate('/news');

  return (
    <div className="sport-page nile-premiership-theme">
      <Navbar />
      <button className="sport-back-btn" onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      {/* League Header */}
      <div className="league-header">
        <div className="league-header-brand">
          <img src={nileRugbySvg} alt="Nile Special Rugby Premiership" className="league-logo" />
          <div>
            <h1>Nile Special Rugby Premiership</h1>
            <p className="league-motto">Uganda's elite rugby competition</p>
          </div>
        </div>
        <div className="league-quick-info">
          <div className="quick-info-item">
            <GiRugbyConversion size={16} />
            <span>10 Clubs</span>
          </div>
          <div className="quick-info-item">
            <FiMapPin size={16} />
            <span>Kyadondo, Kampala</span>
          </div>
          <div className="quick-info-item">
            <FiClock size={16} />
            <span>Uganda Rugby Union</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="sport-page-header">
        <p>The Nile Special Rugby Premiership is Uganda's top-tier rugby union competition, organized by the Uganda Rugby Union. The league features 10 elite clubs competing for the championship, with Stanbic Black Pirates as the current champions after defeating KOBs 24-07 in the final.</p>
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
            <h3>Nile Special Premiership Standings</h3>
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
                <GiRugbyConversion size={32} style={{ opacity: 0 }} />
              </div>
              <p>{item.title}</p>
              <div className="watch-meta">{item.meta}</div>
            </div>
          ))}
        </div>
      </div>

      {/* About the League - Updated with Uganda Rugby Union website information */}
      <div className="league-about-section">
        <div className="league-about-content">
          <h2>About the Nile Special Rugby Premiership</h2>
          <div className="league-about-grid">
            <div className="about-card">
              <h3>Champions</h3>
              <p>Stanbic Black Pirates are the current Nile Special Rugby Premiership champions, having defeated KOBs 24-07 in the final at Legends. The Pirates finished top of the table with 79 points, followed by Heathens RFC (77 pts) and KOBs (75 pts). #NileSpecialRugby #GutsGritGold</p>
            </div>
            <div className="about-card">
              <h3>Competition</h3>
              <p>The Nile Special Rugby Premiership is Uganda's premier rugby union competition organized by the Uganda Rugby Union. It features 10 of the country's most historic clubs competing in a round-robin format followed by playoffs, providing the highest standard of rugby in Uganda.</p>
            </div>
            <div className="about-card">
              <h3>Clubs</h3>
              <p>The league features elite clubs including Stanbic Black Pirates (champions), Heathens RFC, KOBs Rugby, Jinja Hippos, Toyota Buffaloes, Impis, Mongers, Walukuba Barbarians, Rams, and Rhinos. Each club brings a rich history and dedicated fan base to every matchday at venues like Kyadondo Rugby Grounds and Legends.</p>
            </div>
            <div className="about-card">
              <h3>Development</h3>
              <p>The Uganda Rugby Union continues to develop the sport through youth academies, the Uganda Rugby Cranes national team, and the Lady Rugby Cranes women's side. With sponsorship from Nile Special, increased TV coverage, and growing grassroots programmes, the league continues elevating Ugandan rugby on the continental stage.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="sport-cta-banner" style={{
        background: `linear-gradient(135deg, rgba(76, 29, 149, 0.92), rgba(124, 58, 237, 0.88)), url(${ctaBannerImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
      }}>
        <h2>Follow the Nile Special Premiership</h2>
        <p>Follow your favorite clubs, get live match updates, and be part of Uganda's rugby family.</p>
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
