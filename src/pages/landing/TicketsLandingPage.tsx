import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/landing/TicketsLandingPage.css';
import BackButton from '../../components/BackButton';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getToken } from '../../utils/tokenManager.js';
import logo from '../../assets/logo.png'; 
import kccaLogo from '../../assets/kcca.png';
import vipersLogo from '../../assets/Vipers_SC.jpg';
import scVillaLogo from '../../assets/sc-villa.png';
import kobsLogo from '../../assets/kobs.jpg';
import piratesLogo from '../../assets/standic-pirates.png';
import platinumLogo from '../../assets/platinum-heathens.jpg';
import blazersLogo from '../../assets/nam-blazers.png';

type TicketTier = 'all' | 'vip' | 'ordinary';

type Match = {
  id: string;
  league: string;
  leagueColor: string;
  date: string;
  time: string;
  homeTeam: string;
  homeLogo: string;
  awayTeam: string;
  awayLogo: string;
  venue: string;
  vipPrice: number;
  ordinaryPrice: number;
  vipAvailable: number;
  ordinaryAvailable: number;
};

const matches: Match[] = [
  {
    id: '1',
    league: 'Uganda Premier League',
    leagueColor: '#7C3AED',
    date: 'Sat, 24 May 2025',
    time: '4:00PM',
    homeTeam: 'KCCA FC',
    homeLogo: kccaLogo,
    awayTeam: 'Vipers SC',
    awayLogo: vipersLogo,
    venue: 'MTN Omondi Stadium, Lugogo',
    vipPrice: 50000,
    ordinaryPrice: 10000,
    vipAvailable: 120,
    ordinaryAvailable: 850,
  },
  {
    id: '2',
    league: 'Uganda Premier League',
    leagueColor: '#7C3AED',
    date: 'Sun, 25 May 2025',
    time: '4:00PM',
    homeTeam: 'SC Villa',
    homeLogo: scVillaLogo,
    awayTeam: 'Express FC',
    awayLogo: '',
    venue: 'Mandela National Stadium, Namboole',
    vipPrice: 75000,
    ordinaryPrice: 15000,
    vipAvailable: 200,
    ordinaryAvailable: 1200,
  },
  {
    id: '3',
    league: 'Nile Special Rugby Premiership',
    leagueColor: '#EA580C',
    date: 'Sat, 31 May 2025',
    time: '2:00PM',
    homeTeam: 'Betway KOBS',
    homeLogo: kobsLogo,
    awayTeam: 'Stanbic Pirates',
    awayLogo: piratesLogo,
    venue: 'Kyadondo Rugby Club',
    vipPrice: 30000,
    ordinaryPrice: 5000,
    vipAvailable: 80,
    ordinaryAvailable: 400,
  },
  {
    id: '4',
    league: 'National Basketball League',
    leagueColor: '#0284C7',
    date: 'Fri, 30 May 2025',
    time: '7:00PM',
    homeTeam: 'City Oilers',
    homeLogo: '',
    awayTeam: 'Namuwongo Blazers',
    awayLogo: blazersLogo,
    venue: 'Lugogo Indoor Stadium',
    vipPrice: 40000,
    ordinaryPrice: 10000,
    vipAvailable: 60,
    ordinaryAvailable: 300,
  },
  {
    id: '5',
    league: 'Uganda Premier League',
    leagueColor: '#7C3AED',
    date: 'Sat, 7 Jun 2025',
    time: '3:00PM',
    homeTeam: 'URA FC',
    homeLogo: '',
    awayTeam: 'BUL FC',
    awayLogo: '',
    venue: "St. Mary's Stadium, Kitende",
    vipPrice: 45000,
    ordinaryPrice: 8000,
    vipAvailable: 90,
    ordinaryAvailable: 600,
  },
  {
    id: '6',
    league: 'Nile Special Rugby Premiership',
    leagueColor: '#EA580C',
    date: 'Sat, 14 Jun 2025',
    time: '2:30PM',
    homeTeam: 'Heathens RFC',
    homeLogo: platinumLogo,
    awayTeam: 'Black Pirates',
    awayLogo: piratesLogo,
    venue: 'Legends Rugby Grounds',
    vipPrice: 35000,
    ordinaryPrice: 6000,
    vipAvailable: 70,
    ordinaryAvailable: 350,
  },
  {
    id: '7',
    league: 'National Basketball League',
    leagueColor: '#0284C7',
    date: 'Sun, 8 Jun 2025',
    time: '5:00PM',
    homeTeam: 'KIU Titans',
    homeLogo: '',
    awayTeam: 'Power Basketball Club',
    awayLogo: '',
    venue: 'Lugogo Indoor Stadium',
    vipPrice: 35000,
    ordinaryPrice: 8000,
    vipAvailable: 50,
    ordinaryAvailable: 250,
  },
  {
    id: '8',
    league: 'Uganda Premier League',
    leagueColor: '#7C3AED',
    date: 'Sun, 15 Jun 2025',
    time: '4:00PM',
    homeTeam: 'Police FC',
    homeLogo: '',
    awayTeam: 'Onduparaka FC',
    awayLogo: '',
    venue: 'Bukasa Tank Hill Grounds',
    vipPrice: 40000,
    ordinaryPrice: 8000,
    vipAvailable: 75,
    ordinaryAvailable: 500,
  },
];

function TeamBadge({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="team-badge">
      {logo ? (
        <img
          src={logo}
          alt={name}
          className="team-logo"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className="team-logo-placeholder">{name.slice(0, 2).toUpperCase()}</div>
      )}
      <span className="team-name">{name}</span>
    </div>
  );
}

function LoginPromptModal({
  onClose,
  onLogin,
  onRegister,
}: {
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <img src={logo} alt="League OS" className="modal-logo" />
        <h2 className="modal-title">Sign in to buy tickets</h2>
        <p className="modal-body">
          Create an account or log in to purchase tickets, manage your bookings, and get match-day
          updates.
        </p>
        <div className="modal-actions">
          <button className="btn-primary" onClick={onLogin}>
            Log In
          </button>
          <button className="btn-secondary" onClick={onRegister}>
            Create Account
          </button>
        </div>
        <p className="modal-footnote">Get a free account now and enjoy League OS.</p>
      </div>
    </div>
  );
}

export default function TicketsLandingPage() {
  const navigate = useNavigate();
  const [activeLeague, setActiveLeague] = useState('All Leagues');
  const [activeTier, setActiveTier] = useState<TicketTier>('all');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const isLoggedIn = Boolean(getToken());

  const leagues = [
    'All Leagues',
    'Uganda Premier League',
    'Nile Special Rugby Premiership',
    'National Basketball League',
  ];

  const filteredMatches = matches.filter((match) => {
    return activeLeague === 'All Leagues' || match.league === activeLeague;
  });

  const handleBuyTicket = (matchId: string, tier: 'vip' | 'ordinary') => {
    if (!getToken()) {
      setShowLoginPrompt(true);
      return;
    }

    navigate(`/tickets/${matchId}/checkout?tier=${tier}`);
  };

  const formatPrice = (price: number) => `UGX ${price.toLocaleString()}`;

      return (
  <div
    className="tickets-page"
    
  >
    



      <Navbar />

      <main className="tickets-main">
        {/* Page actions: Back + Sign Up (page-specific, not in the global navbar) */}
        <div className="tickets-page-actions">
          <BackButton />
          {isLoggedIn ? (
            <div className="tickets-auth-actions">
              <button type="button" onClick={() => navigate('/dashboard/tickets')}>
                My Tickets
              </button>
              <button type="button" onClick={() => navigate('/dashboard/wallet')}>
                Wallet
              </button>
            </div>
          ) : (
            <button className="signup-btn" onClick={() => navigate('/register')}>
              Sign Up
            </button>
          )}
        </div>

        {/* Header */}
        <div className="tickets-header">
          <h1>
            <span className="tickets-header-plain">Match </span>
            <span className="tickets-header-accent">Ticketing</span>
          </h1>
          <p>Browse and purchase tickets for upcoming matches.</p>
        </div>

        {/* Filters */}
        <div className="tickets-filters">
          <div className="league-filters">
            {leagues.map((league) => (
              <button
                key={league}
                className={`league-btn ${activeLeague === league ? 'league-btn-active' : ''}`}
                onClick={() => setActiveLeague(league)}
              >
                {league}
              </button>
            ))}
          </div>

          <div className="tier-filters">
            {(['all', 'vip', 'ordinary'] as TicketTier[]).map((tier) => (
              <button
                key={tier}
                className={`tier-btn ${activeTier === tier ? 'tier-btn-active' : ''}`}
                onClick={() => setActiveTier(tier)}
              >
                {tier === 'all' ? 'All Tickets' : tier === 'vip' ? '⭐ VIP' : 'Ordinary'}
              </button>
            ))}
          </div>
        </div>

        {/* Match Cards */}
        <div className="match-grid">
          {filteredMatches.map((match) => (
            <div key={match.id} className="match-card">
              {/* Card Header */}
              <div className="match-card-header">
                <span className="match-date">
                  {match.date} • {match.time}
                </span>
                <span className="match-league" style={{ color: match.leagueColor }}>
                  {match.league}
                </span>
              </div>

              {/* Teams */}
              <div className="match-teams">
                <TeamBadge name={match.homeTeam} logo={match.homeLogo} />
                <span className="vs-label">VS</span>
                <TeamBadge name={match.awayTeam} logo={match.awayLogo} />
              </div>

              {/* Venue */}
              <div className="match-venue">
                <span className="venue-icon">📍</span>
                {match.venue}
              </div>

              {/* Ticket Tiers */}
              <div className="ticket-tiers">
                {(activeTier === 'all' || activeTier === 'vip') && (
                  <div className="ticket-tier ticket-vip">
                    <div className="tier-info">
                      <span className="tier-label">⭐ VIP</span>
                      <span className="tier-seats">{match.vipAvailable} seats left</span>
                    </div>
                    <div className="tier-price-row">
                      <span className="tier-price">{formatPrice(match.vipPrice)}</span>
                      <button
                        className="buy-btn buy-btn-vip"
                        onClick={() => handleBuyTicket(match.id, 'vip')}
                      >
                        Buy VIP
                      </button>
                    </div>
                  </div>
                )}

                {(activeTier === 'all' || activeTier === 'ordinary') && (
                  <div className="ticket-tier ticket-ordinary">
                    <div className="tier-info">
                      <span className="tier-label">🎟 Ordinary</span>
                      <span className="tier-seats">{match.ordinaryAvailable} seats left</span>
                    </div>
                    <div className="tier-price-row">
                      <span className="tier-price">{formatPrice(match.ordinaryPrice)}</span>
                      <button
                        className="buy-btn buy-btn-ordinary"
                        onClick={() => handleBuyTicket(match.id, 'ordinary')}
                      >
                        Buy Ticket
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

       <Footer />

        {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPromptModal
          onClose={() => setShowLoginPrompt(false)}
          onLogin={() => navigate('/login')}
          onRegister={() => navigate('/register')}
        />
      )}
    </div>
  );
}
