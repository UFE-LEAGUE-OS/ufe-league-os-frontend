import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGrid, FiList, FiTrendingUp } from 'react-icons/fi';
import { BsTicketPerforated } from 'react-icons/bs';
import { GiSoccerBall, GiRugbyConversion } from 'react-icons/gi';
import { MdSportsBasketball } from 'react-icons/md';
import { IoSchoolOutline } from 'react-icons/io5';
import CompetitionsNavbar from '../components/CompetitionsNavbar';
import CompetitionsFooter from '../components/CompetitionsFooter';
import footballImg from '../assets/football-card.png';
import rugbyImg from '../assets/rugby-card.png';
import basketballImg from '../assets/basketball-card.png';
import '../styles/pages/landing/Competitions.css';

const sportFilters = [
  'All Sports', 'Football', 'Rugby', 'Basketball', 'Volleyball', 'Cricket'
];

const competitions = [
  {
    id: 1,
    sport: 'FOOTBALL',
    sportClass: 'football',
    league: 'Uganda Premier League',
    description: "Uganda's elite football division featuring 16 historic clubs battling for regional supremacy.",
    image: footballImg,
    isLive: true,
    type: 'football-card',
    stats: { label: 'Active Matches', value: '4 Matches' },
    progress: 60,
  },
  {
    id: 2,
    sport: 'RUGBY',
    sportClass: 'rugby',
    league: 'Nile Special Premiership',
    description: 'Experience the grit of Ugandan rugby where legends are made across 10 elite clubs.',
    image: rugbyImg,
    isLive: false,
    type: 'rugby-card',
    round: { current: '12 of 18', leader: 'Heathens', nextGame: 'Today, 17:00' },
  },
  {
    id: 3,
    sport: 'BASKETBALL',
    sportClass: 'basketball',
    league: 'National Basketball League',
    description: 'High-flying action and electric atmosphere from the top tier of East African hoops.',
    image: basketballImg,
    isLive: false,
    type: 'basketball-card',
    teams: '12 Clubs',
    hasTickets: true,
  },
  {
    id: 4,
    sport: 'DEVELOPMENT',
    sportClass: 'development',
    league: 'Budo League',
    description: 'The premier football competition for old students and secondary school development teams in Uganda.',
    image: null,
    isLive: false,
    type: 'development-card',
    nextMatchday: 'Sun, 26 May',
  },
];

const streakData = [
  {
    team: 'KCCA FC',
    results: [
      { type: 'win' }, { type: 'win' }, { type: 'draw' },
      { type: 'loss' }, { type: 'win' },
    ],
  },
  {
    team: 'Vipers SC',
    results: [
      { type: 'win' }, { type: 'win' }, { type: 'win' },
      { type: 'draw' }, { type: 'win' },
    ],
  },
];

function Competitions() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All Sports');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'FOOTBALL': return <GiSoccerBall size={16} />;
      case 'RUGBY': return <GiRugbyConversion size={16} />;
      case 'BASKETBALL': return <MdSportsBasketball size={16} />;
      case 'DEVELOPMENT': return <IoSchoolOutline size={16} />;
      default: return null;
    }
  };

  const getStreakLabel = (type: string) => {
    switch (type) {
      case 'win': return 'W';
      case 'draw': return 'D';
      case 'loss': return 'L';
      default: return '';
    }
  };

  return (
    <div className="competitions-page">
      <CompetitionsNavbar />

      {/* Page Header */}
      <div className="competitions-header">
        <div className="competitions-header-top">
          <div>
            <h1 className="competitions-title">Competitions</h1>
            <p className="competitions-subtitle">
              The ultimate hub for East African sports excellence. Track your
              favorite local clubs and stay ahead with real-time Ugandan match analytics.
            </p>
          </div>
          <div className="view-mode-toggle">
            <span className="view-mode-label">View mode:</span>
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <FiGrid size={16} />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <FiList size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Sport Filter Tabs */}
      <div className="sport-filters">
        {sportFilters.map((filter) => (
          <button
            key={filter}
            className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Competitions Grid */}
      <div className="competitions-grid">
        {competitions.map((comp) => (
          <div
            key={comp.id}
            className={`competition-card ${comp.type}`}
          >
            {comp.image ? (
              <img
                src={comp.image}
                alt={comp.league}
                className="card-image"
              />
            ) : (
              <div className="card-image-placeholder" />
            )}

            <div className="card-body">
              {comp.isLive && (
                <div className="live-badge">
                  <span className="live-dot" />
                  LIVE
                </div>
              )}

              <div className="sport-badge">
                <div className="sport-badge-icon">
                  {getSportIcon(comp.sport)}
                </div>
                <div className="sport-badge-text">
                  <span className={`sport-name ${comp.sportClass}`}>
                    {comp.sport}
                  </span>
                  <span className="league-name">{comp.league}</span>
                </div>
              </div>

              <p className="card-description">{comp.description}</p>

              {comp.stats && (
                <>
                  <div className="card-stats">
                    <span className="stat-label">{comp.stats.label}</span>
                    <span className="stat-value">{comp.stats.value}</span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${comp.progress}%` }}
                      />
                    </div>
                  </div>
                </>
              )}

              {comp.round && (
                <div className="round-info">
                  <div className="round-col">
                    <span className="round-col-label">Round</span>
                    <span className="round-col-value">{comp.round.current}</span>
                  </div>
                  <div className="round-col">
                    <span className="round-col-label">Leader</span>
                    <span className="round-col-value">{comp.round.leader}</span>
                  </div>
                  <div className="round-col">
                    <span className="round-col-label">Next Game</span>
                    <span className="round-col-value">{comp.round.nextGame}</span>
                  </div>
                </div>
              )}

              {comp.teams && (
                <div className="teams-row">
                  <span className="stat-label">Teams</span>
                  <span className="stat-value">{comp.teams}</span>
                </div>
              )}

              {comp.hasTickets && (
                <div className="tickets-banner">
                  <BsTicketPerforated size={12} />
                  Finals tickets now available!
                </div>
              )}

              {comp.nextMatchday && (
                <div className="card-stats">
                  <span className="stat-label">Next Matchday</span>
                  <span className="stat-value">{comp.nextMatchday}</span>
                </div>
              )}

              <button className="view-details-btn">
                View Full Details →
              </button>
            </div>
          </div>
        ))}

        {/* Sponsor Card */}
        <div className="sponsor-card">
          <div>
            <div className="sponsor-icon">🏆</div>
            <h3 className="sponsor-title">Level up your game</h3>
            <p className="sponsor-desc">
              Get exclusive access to detailed player statistics, live
              analytics, and priority ticketing across all leagues.
            </p>
          </div>
          <button className="sponsor-btn">Become a Sponsor</button>
        </div>

        {/* Propose League Card */}
        <div className="propose-card">
          <div className="propose-plus">+</div>
          <p className="propose-title">Propose League</p>
          <p className="propose-desc">
            Submit your organization for listing on League OS
          </p>
        </div>
      </div>

      {/* Uganda Cup Featured Banner */}
      <div className="featured-banner">
        <div className="banner-left">
          <span className="official-badge">OFFICIAL</span>
          <h2 className="banner-title">
            Uganda Cup 2024:<br />Road to the Finals
          </h2>
          <p className="banner-desc">
            Witness the most inclusive football tournament in the country.
            From regional qualifiers to the grand stage at Nelson Mandela Stadium.
          </p>
          <div className="banner-buttons">
            <button className="banner-primary-btn">
              <BsTicketPerforated size={14} />
              Buy Finals Tickets
            </button>
            <button className="banner-secondary-btn">
              Match Schedule
            </button>
          </div>
        </div>

        <div className="banner-right">
          <div className="live-streak-panel">
            <div className="live-streak-header">
              <span className="live-streak-title">Live Streak</span>
              <FiTrendingUp size={16} color="#9CA3AF" />
            </div>
            {streakData.map((team) => (
              <div key={team.team} className="streak-row">
                <div className="streak-team-icon">⚽</div>
                <span className="streak-team-name">{team.team}</span>
                <div className="streak-badges">
                  {team.results.map((result, i) => (
                    <div
                      key={i}
                      className={`streak-badge ${result.type}`}
                    >
                      {getStreakLabel(result.type)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="competitions-cta">
        <div className="cta-left">
          <h2>Join the Elite Experience</h2>
          <p>
            Create an account to unlock premium match tracking, exclusive
            Ugandan sports insights, and compete for epic fantasy rewards.
          </p>
        </div>
        <div className="cta-buttons">
          <button
            className="cta-primary-btn"
            onClick={() => navigate('/register')}
          >
            Create Account
          </button>
          <button
            className="cta-secondary-btn"
            onClick={() => navigate('/login')}
          >
            Log In
          </button>
        </div>
      </div>

      <CompetitionsFooter />
    </div>
  );
}

export default Competitions;
