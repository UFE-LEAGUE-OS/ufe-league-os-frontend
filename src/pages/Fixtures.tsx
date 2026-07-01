import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import fixturesImg from '../assets/fixtures.png';
import heroBg from '../assets/stadium-bg.svg';

interface Fixture {
  league: string;
  competition: string;
  date: string;
  time: string;
  teamA: string;
  teamB: string;
  venue: string;
  status: 'upcoming' | 'live' | 'completed';
  scoreA?: number;
  scoreB?: number;
}

const fixtures: Fixture[] = [
  { league: 'UPL', competition: 'Uganda Premier League', date: '2026-06-20', time: '16:00', teamA: 'KCCA FC', teamB: 'Vipers SC', venue: 'MTN Omondi Stadium', status: 'live', scoreA: 2, scoreB: 1 },
  { league: 'UPL', competition: 'Uganda Premier League', date: '2026-06-20', time: '14:00', teamA: 'SC Villa', teamB: 'Express FC', venue: 'Wankulukuku Stadium', status: 'completed', scoreA: 0, scoreB: 3 },
  { league: 'UPL', competition: 'Uganda Premier League', date: '2026-06-20', time: '14:00', teamA: 'URA FC', teamB: 'BUL FC', venue: 'Mehta Stadium', status: 'completed', scoreA: 1, scoreB: 1 },
  { league: 'UPL', competition: 'Uganda Premier League', date: '2026-06-21', time: '16:00', teamA: 'Kitara FC', teamB: 'Bright Stars', venue: 'Kitara Stadium', status: 'upcoming' },
  { league: 'NSRPL', competition: 'Nile Special Rugby Premiership', date: '2026-06-21', time: '16:00', teamA: 'Betway KOBS', teamB: 'Stanbic Black Pirates', venue: 'Legacy Rugby Grounds', status: 'upcoming' },
  { league: 'NSRPL', competition: 'Nile Special Rugby Premiership', date: '2026-06-20', time: '15:00', teamA: 'IMPIS RFC', teamB: 'Toyota Buffaloes', venue: 'Kyadondo Rugby Club', status: 'completed', scoreA: 25, scoreB: 7 },
  { league: 'NSRPL', competition: 'Nile Special Rugby Premiership', date: '2026-06-22', time: '14:00', teamA: 'Platinum Heathens', teamB: 'Rams RFC', venue: 'Hima Grounds', status: 'upcoming' },
  { league: 'NBL', competition: 'National Basketball League', date: '2026-06-21', time: '18:00', teamA: 'Namuwongo Blazers', teamB: 'City Oilers', venue: 'Lugogo Arena', status: 'upcoming' },
  { league: 'NBL', competition: 'National Basketball League', date: '2026-06-20', time: '18:00', teamA: 'UCU Canons', teamB: 'KIU Titans', venue: 'YMCA Court', status: 'completed', scoreA: 72, scoreB: 68 },
  { league: 'TBL', competition: 'Tooro Basketball League', date: '2026-06-22', time: '15:00', teamA: 'Midnight Express', teamB: 'Dujay FC', venue: 'Fort Portal Arena', status: 'upcoming' },
];

const styles = `
  @media (max-width: 768px) {
    .fixtures-main { padding: 16px !important; }
    .fixtures-title { font-size: 1.8rem !important; }
    .fixtures-desc { font-size: 0.85rem !important; }
    .fixtures-live-grid { grid-template-columns: 1fr 1fr auto 1fr !important; gap: 6px !important; font-size: 0.75rem !important; }
    .fixtures-live-grid .comp-col { display: none !important; }
    .fixtures-upcoming-header { grid-template-columns: 1fr 60px 1fr 70px !important; font-size: 0.65rem !important; }
    .fixtures-upcoming-header .comp-col, .fixtures-upcoming-header .venue-col { display: none !important; }
    .fixtures-upcoming-row { grid-template-columns: 1fr 60px 1fr 70px !important; font-size: 0.75rem !important; }
    .fixtures-upcoming-row .comp-col, .fixtures-upcoming-row .venue-col { display: none !important; }
    .fixtures-calendar { padding: 16px !important; }
    .fixtures-calendar-grid { gap: 4px !important; }
    .fixtures-calendar-grid div { font-size: 0.7rem !important; padding: 4px 0 !important; }
    .fixtures-calendar-days div { font-size: 0.65rem !important; padding: 4px 0 !important; }
    .fixtures-hero { padding: 24px 16px !important; }
    .fixtures-hero h1 { font-size: 1.6rem !important; }
  }
  @media (max-width: 480px) {
    .fixtures-main { padding: 12px !important; }
    .fixtures-title { font-size: 1.4rem !important; }
    .fixtures-live-grid { grid-template-columns: 1fr auto 1fr !important; }
    .fixtures-live-grid .comp-col, .fixtures-live-grid .live-col { display: none !important; }
    .fixtures-upcoming-header { grid-template-columns: 1fr 50px 1fr !important; }
    .fixtures-upcoming-header .comp-col, .fixtures-upcoming-header .venue-col, .fixtures-upcoming-header .date-col { display: none !important; }
    .fixtures-upcoming-row { grid-template-columns: 1fr 50px 1fr !important; }
    .fixtures-upcoming-row .comp-col, .fixtures-upcoming-row .venue-col, .fixtures-upcoming-row .date-col { display: none !important; }
    .fixtures-hero { padding: 16px !important; }
    .fixtures-hero h1 { font-size: 1.3rem !important; }
    .fixtures-hero p { font-size: 0.75rem !important; }
    .fixtures-filter-btn { font-size: 0.7rem !important; padding: 6px 14px !important; }
  }
`;

function Fixtures() {
  const liveFixtures = fixtures.filter(f => f.status === 'live');
  const upcomingFixtures = fixtures.filter(f => f.status === 'upcoming');

  return (
    <div style={{ background: '#00030D', minHeight: '100vh', fontFamily: 'var(--font-body)', color: '#fff' }}>
      <style>{styles}</style>
      <Navbar />

      {/* Hero Banner */}
      <div className="fixtures-hero" style={{
        position: 'relative',
        padding: '40px 56px',
        background: `linear-gradient(135deg, rgba(129,53,250,0.15) 0%, rgba(0,3,13,0.9) 100%), url(${heroBg}) center/cover`,
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1400, margin: '0 auto' }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#9CA3AF', textDecoration: 'none', fontSize: '0.85rem',
            fontWeight: 600, marginBottom: 16, transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>
            ← Back to Home
          </Link>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.8rem', fontStyle: 'italic', fontWeight: 800, marginBottom: 8 }}>
            FIXTURES
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.95rem', maxWidth: 600 }}>
            Upcoming and live matches across Uganda's top leagues and competitions.
          </p>
        </div>
        <img src={fixturesImg} alt="" style={{
          position: 'absolute', right: 0, top: 0, height: '100%',
          opacity: 0.15, objectFit: 'cover', width: '40%',
        }} />
      </div>

      <main className="fixtures-main" style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 56px' }}>
        {/* League Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {['All', 'UPL', 'NSRPL', 'NBL', 'TBL'].map(league => (
            <button key={league} className="fixtures-filter-btn"
              style={{
                padding: '8px 20px', borderRadius: 20,
                border: '1px solid #1F2937',
                background: league === 'All' ? '#8135FA' : 'transparent',
                color: league === 'All' ? '#fff' : '#9CA3AF',
                fontFamily: 'var(--font-heading)', fontWeight: 600,
                fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (league !== 'All') { e.currentTarget.style.borderColor = '#8135FA'; e.currentTarget.style.color = '#fff'; }}}
              onMouseLeave={e => { if (league !== 'All') { e.currentTarget.style.borderColor = '#1F2937'; e.currentTarget.style.color = '#9CA3AF'; }}}
            >
              {league === 'All' ? 'All Leagues' : league}
            </button>
          ))}
        </div>

        {/* Live Now */}
        {liveFixtures.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.15rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#DC2626', animation: 'pulse 1.5s infinite' }} />
              LIVE NOW
            </h2>
            <div style={{ background: '#12131F', borderRadius: 8, overflow: 'hidden' }}>
              {liveFixtures.map((f, i) => (
                <div key={i} className="fixtures-live-grid" style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto 1fr 80px', gap: 12, alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #1F2937' }}>
                  <span className="comp-col" style={{ fontSize: '0.75rem', color: '#9CA3AF', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{f.competition}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{f.teamA}</span>
                  <span style={{ fontWeight: 800, color: '#F97316', textAlign: 'center', fontSize: '1.1rem' }}>{f.scoreA} - {f.scoreB}</span>
                  <span style={{ fontWeight: 600 }}>{f.teamB}</span>
                  <span className="live-col" style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 700, textAlign: 'center', background: 'rgba(220,38,38,0.12)', borderRadius: 4, padding: '2px 8px' }}>LIVE</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Fixtures */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.15rem', marginBottom: 16 }}>UPCOMING FIXTURES</h2>
          <div style={{ background: '#12131F', borderRadius: 8, overflow: 'hidden' }}>
            <div className="fixtures-upcoming-header" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 90px 1fr 80px 120px', gap: 12, padding: '12px 20px', borderBottom: '1px solid #1F2937', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span className="comp-col">Competition</span>
              <span style={{ textAlign: 'right' }}>Home</span>
              <span style={{ textAlign: 'center' }}>Score</span>
              <span>Away</span>
              <span className="date-col">Date</span>
              <span className="venue-col">Venue</span>
            </div>
            {upcomingFixtures.length > 0 ? upcomingFixtures.map((f, i) => (
              <div key={i} className="fixtures-upcoming-row" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 90px 1fr 80px 120px', gap: 12, alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #1F2937', fontSize: '0.85rem', transition: 'background 0.2s' }}
                   onMouseEnter={e => (e.currentTarget.style.background = '#1a1f3a')}
                   onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span className="comp-col" style={{ fontSize: '0.7rem', color: '#9CA3AF', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{f.competition}</span>
                <span style={{ fontWeight: 600, textAlign: 'right' }}>{f.teamA}</span>
                <span style={{ color: '#6B7280', textAlign: 'center' }}>-</span>
                <span style={{ fontWeight: 600 }}>{f.teamB}</span>
                <span className="date-col" style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>{new Date(f.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <span className="venue-col" style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>{f.venue}</span>
              </div>
            )) : (
              <p style={{ padding: 20, color: '#6B7280', textAlign: 'center' }}>No upcoming fixtures scheduled. Check back soon!</p>
            )}
          </div>
        </section>

        {/* Fixtures Calendar */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.15rem', marginBottom: 16 }}>FIXTURES CALENDAR</h2>
          <div className="fixtures-calendar" style={{ background: '#12131F', borderRadius: 8, padding: 24, border: '1px solid #1F2937' }}>
            <div className="fixtures-calendar-days" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 16 }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', padding: '8px 0' }}>{day}</div>
              ))}
            </div>
            <div className="fixtures-calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 4;
                const hasFixture = day >= 20 && day <= 22;
                return (
                  <div key={i} style={{
                    textAlign: 'center', padding: '8px 0', borderRadius: 6,
                    background: hasFixture ? 'rgba(129, 53, 250, 0.15)' : 'transparent',
                    color: day < 1 || day > 30 ? '#1F2937' : hasFixture ? '#8135FA' : '#9CA3AF',
                    fontWeight: hasFixture ? 700 : 400, fontSize: '0.85rem',
                    cursor: hasFixture ? 'pointer' : 'default', transition: 'background 0.2s',
                  }}
                       onMouseEnter={e => { if (hasFixture) e.currentTarget.style.background = 'rgba(129, 53, 250, 0.25)'; }}
                       onMouseLeave={e => { if (hasFixture) e.currentTarget.style.background = 'rgba(129, 53, 250, 0.15)'; }}>
                    {day >= 1 && day <= 30 ? day : ''}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: '0.8rem', color: '#9CA3AF', marginTop: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(129, 53, 250, 0.5)' }} /> Matches scheduled
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Fixtures;