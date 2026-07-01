import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import resultsImg from '../assets/results.png';
import standingsImg from '../assets/standings.png';
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

interface TableRow {
  pos: number;
  team: string;
  p: number;
  w: number;
  d: number;
  l: number;
  pts: number;
}

const results: Fixture[] = [
  { league: 'UPL', competition: 'Uganda Premier League', date: '2026-06-20', time: '14:00', teamA: 'SC Villa', teamB: 'Express FC', venue: 'Wankulukuku Stadium', status: 'completed', scoreA: 0, scoreB: 3 },
  { league: 'UPL', competition: 'Uganda Premier League', date: '2026-06-20', time: '14:00', teamA: 'URA FC', teamB: 'BUL FC', venue: 'Mehta Stadium', status: 'completed', scoreA: 1, scoreB: 1 },
  { league: 'UPL', competition: 'Uganda Premier League', date: '2026-06-19', time: '16:00', teamA: 'KCCA FC', teamB: 'Kitara FC', venue: 'MTN Omondi Stadium', status: 'completed', scoreA: 2, scoreB: 0 },
  { league: 'UPL', competition: 'Uganda Premier League', date: '2026-06-19', time: '14:00', teamA: 'Vipers SC', teamB: 'Bright Stars', venue: 'Kitara Stadium', status: 'completed', scoreA: 3, scoreB: 1 },
  { league: 'UPL', competition: 'Uganda Premier League', date: '2026-06-18', time: '16:00', teamA: 'Express FC', teamB: 'URA FC', venue: 'Wankulukuku Stadium', status: 'completed', scoreA: 2, scoreB: 2 },
  { league: 'NSRPL', competition: 'Nile Special Rugby Premiership', date: '2026-06-20', time: '15:00', teamA: 'IMPIS RFC', teamB: 'Toyota Buffaloes', venue: 'Kyadondo Rugby Club', status: 'completed', scoreA: 25, scoreB: 7 },
  { league: 'NSRPL', competition: 'Nile Special Rugby Premiership', date: '2026-06-19', time: '16:00', teamA: 'Betway KOBS', teamB: 'Platinum Heathens', venue: 'Legacy Rugby Grounds', status: 'completed', scoreA: 31, scoreB: 12 },
  { league: 'NSRPL', competition: 'Nile Special Rugby Premiership', date: '2026-06-18', time: '15:00', teamA: 'Stanbic Black Pirates', teamB: 'Rams RFC', venue: 'Kyadondo Rugby Club', status: 'completed', scoreA: 28, scoreB: 14 },
  { league: 'NBL', competition: 'National Basketball League', date: '2026-06-20', time: '18:00', teamA: 'UCU Canons', teamB: 'KIU Titans', venue: 'YMCA Court', status: 'completed', scoreA: 72, scoreB: 68 },
  { league: 'NBL', competition: 'National Basketball League', date: '2026-06-19', time: '18:00', teamA: 'Namuwongo Blazers', teamB: 'City Oilers', venue: 'Lugogo Arena', status: 'completed', scoreA: 85, scoreB: 79 },
  { league: 'NBL', competition: 'National Basketball League', date: '2026-06-18', time: '16:00', teamA: 'KIU Titans', teamB: 'UCU Canons', venue: 'YMCA Court', status: 'completed', scoreA: 65, scoreB: 71 },
  { league: 'TBL', competition: 'Tooro Basketball League', date: '2026-06-19', time: '15:00', teamA: 'Midnight Express', teamB: 'Dujay FC', venue: 'Fort Portal Arena', status: 'completed', scoreA: 98, scoreB: 76 },
];

const standings: Record<string, TableRow[]> = {
  'UPL': [
    { pos: 1, team: 'Vipers SC', p: 25, w: 18, d: 5, l: 2, pts: 59 },
    { pos: 2, team: 'KCCA FC', p: 25, w: 16, d: 6, l: 3, pts: 54 },
    { pos: 3, team: 'SC Villa', p: 25, w: 15, d: 5, l: 5, pts: 50 },
    { pos: 4, team: 'Kitara FC', p: 25, w: 14, d: 7, l: 4, pts: 49 },
    { pos: 5, team: 'BUL FC', p: 25, w: 12, d: 8, l: 5, pts: 44 },
    { pos: 6, team: 'Express FC', p: 25, w: 11, d: 6, l: 8, pts: 39 },
    { pos: 7, team: 'URA FC', p: 25, w: 9, d: 5, l: 11, pts: 32 },
    { pos: 8, team: 'Bright Stars', p: 25, w: 6, d: 8, l: 11, pts: 26 },
  ],
  'NSRPL': [
    { pos: 1, team: 'Betway KOBS', p: 12, w: 10, d: 1, l: 1, pts: 51 },
    { pos: 2, team: 'Stanbic Black Pirates', p: 12, w: 9, d: 1, l: 2, pts: 47 },
    { pos: 3, team: 'Platinum Heathens', p: 12, w: 8, d: 2, l: 2, pts: 42 },
    { pos: 4, team: 'IMPIS RFC', p: 12, w: 7, d: 1, l: 4, pts: 36 },
    { pos: 5, team: 'Toyota Buffaloes', p: 12, w: 5, d: 2, l: 5, pts: 29 },
    { pos: 6, team: 'Rams RFC', p: 12, w: 4, d: 1, l: 7, pts: 22 },
  ],
  'NBL': [
    { pos: 1, team: 'Namuwongo Blazers', p: 18, w: 15, d: 0, l: 3, pts: 30 },
    { pos: 2, team: 'City Oilers', p: 18, w: 13, d: 0, l: 5, pts: 26 },
    { pos: 3, team: 'UCU Canons', p: 18, w: 12, d: 0, l: 6, pts: 24 },
    { pos: 4, team: 'KIU Titans', p: 18, w: 10, d: 0, l: 8, pts: 20 },
  ],
  'TBL': [
    { pos: 1, team: 'Midnight Express', p: 14, w: 12, d: 0, l: 2, pts: 24 },
    { pos: 2, team: 'Dujay FC', p: 14, w: 9, d: 0, l: 5, pts: 18 },
    { pos: 3, team: 'Fort Hoops', p: 14, w: 7, d: 0, l: 7, pts: 14 },
    { pos: 4, team: 'Tooro Titans', p: 14, w: 5, d: 0, l: 9, pts: 10 },
  ],
};

const leagueNames: Record<string, string> = {
  UPL: 'Uganda Premier League',
  NSRPL: 'Nile Special Rugby Premiership',
  NBL: 'National Basketball League',
  TBL: 'Tooro Basketball League',
};

const leagueColors: Record<string, string> = {
  UPL: '#F97316',
  NSRPL: '#10B981',
  NBL: '#3B82F6',
  TBL: '#A855F7',
};

function groupByDate(items: Fixture[]) {
  const groups: Record<string, Fixture[]> = {};
  items.forEach(item => {
    if (!groups[item.date]) groups[item.date] = [];
    groups[item.date].push(item);
  });
  return groups;
}

const styles = `
  @media (max-width: 768px) {
    .results-main { padding: 16px !important; }
    .results-hero { padding: 24px 16px !important; }
    .results-hero h1 { font-size: 1.6rem !important; }
    .results-hero p { font-size: 0.85rem !important; }
    .results-row { grid-template-columns: 1fr 70px 1fr !important; font-size: 0.75rem !important; }
    .results-row .comp-col, .results-row .time-col { display: none !important; }
    .results-standings-grid { grid-template-columns: 1fr !important; }
    .results-date-header { font-size: 0.75rem !important; }
    .results-score { font-size: 0.85rem !important; padding: 2px 8px !important; }
  }
  @media (max-width: 480px) {
    .results-main { padding: 12px !important; }
    .results-hero { padding: 16px !important; }
    .results-hero h1 { font-size: 1.3rem !important; }
    .results-hero p { font-size: 0.75rem !important; }
    .results-row { grid-template-columns: 1fr 55px 1fr !important; font-size: 0.7rem !important; }
    .results-row .comp-col, .results-row .time-col { display: none !important; }
    .results-standings-grid { grid-template-columns: 1fr !important; }
    .results-filter-btn { font-size: 0.7rem !important; padding: 6px 14px !important; }
    .results-standings-table { font-size: 0.75rem !important; }
    .results-standings-table .d-col { display: none !important; }
  }
`;

function Results() {
  const groupedResults = groupByDate(results);
  const dates = Object.keys(groupedResults).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div style={{ background: '#00030D', minHeight: '100vh', fontFamily: 'var(--font-body)', color: '#fff' }}>
      <style>{styles}</style>
      <Navbar />

      {/* Hero Banner */}
      <div className="results-hero" style={{
        position: 'relative',
        padding: '40px 56px',
        background: `linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(0,3,13,0.9) 100%), url(${heroBg}) center/cover`,
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
            RESULTS
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.95rem', maxWidth: 600 }}>
            Latest scores and standings across all leagues and competitions.
          </p>
        </div>
        <img src={resultsImg} alt="" style={{
          position: 'absolute', right: 0, top: 0, height: '100%',
          opacity: 0.12, objectFit: 'cover', width: '40%',
        }} />
      </div>

      <main className="results-main" style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 56px' }}>
        {/* League Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {['All', 'UPL', 'NSRPL', 'NBL', 'TBL'].map(league => (
            <button key={league} className="results-filter-btn"
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

        {/* Latest Results by Date */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.15rem', marginBottom: 20 }}>LATEST RESULTS</h2>
          {dates.map(date => (
            <div key={date} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span className="results-date-header" style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600, color: '#9CA3AF' }}>
                  {new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <div style={{ flex: 1, height: 1, background: '#1F2937' }} />
              </div>
              <div style={{ background: '#12131F', borderRadius: 8, overflow: 'hidden' }}>
                {groupedResults[date].map((f, i) => {
                  const winner = f.scoreA !== undefined && f.scoreB !== undefined
                    ? (f.scoreA > f.scoreB ? 'home' : f.scoreA < f.scoreB ? 'away' : 'draw')
                    : 'draw';
                  return (
                    <div key={i} className="results-row" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 90px 1fr 120px', gap: 12, alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #1F2937', fontSize: '0.85rem', transition: 'background 0.2s' }}
                         onMouseEnter={e => (e.currentTarget.style.background = '#1a1f3a')}
                         onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <span className="comp-col" style={{ fontSize: '0.7rem', color: '#9CA3AF', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                        <span style={{ color: leagueColors[f.league], marginRight: 4 }}>●</span> {f.competition}
                      </span>
                      <span style={{ fontWeight: winner === 'home' ? 800 : 400, textAlign: 'right', color: winner === 'home' ? '#fff' : '#9CA3AF' }}>{f.teamA}</span>
                      <span className="results-score" style={{ fontWeight: 800, color: '#F97316', textAlign: 'center', fontSize: '1rem', background: 'rgba(249, 115, 22, 0.08)', borderRadius: 6, padding: '4px 12px', justifySelf: 'center' }}>
                        {f.scoreA} - {f.scoreB}
                      </span>
                      <span style={{ fontWeight: winner === 'away' ? 800 : 400, color: winner === 'away' ? '#fff' : '#9CA3AF' }}>{f.teamB}</span>
                      <span className="time-col" style={{ color: '#6B7280', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{f.venue}</span>
                        <span style={{ fontSize: '0.7rem', color: '#4B5563' }}>{f.time}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* League Standings */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.15rem', margin: 0 }}>LEAGUE STANDINGS</h2>
            <img src={standingsImg} alt="" style={{ height: 24, opacity: 0.4 }} />
          </div>
          <div className="results-standings-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {Object.entries(standings).map(([league, rows]) => (
              <div key={league} style={{ background: '#12131F', borderRadius: 8, padding: 16, border: '1px solid #1F2937' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 600, marginBottom: 12, color: leagueColors[league], display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: leagueColors[league] }} />
                  {leagueNames[league]}
                </h3>
                <div className="results-standings-table" style={{ display: 'grid', gridTemplateColumns: '28px 1fr 28px 28px 28px 36px', gap: 8, padding: '8px 0', borderBottom: '1px solid #1F2937', color: '#6B7280', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <span>#</span><span>Team</span><span>P</span><span>W</span><span className="d-col">{league === 'NBL' || league === 'TBL' ? 'L' : 'D'}</span><span style={{ textAlign: 'right' }}>Pts</span>
                </div>
                {rows.map((r) => (
                  <div key={r.pos} className="results-standings-table" style={{ display: 'grid', gridTemplateColumns: '28px 1fr 28px 28px 28px 36px', gap: 8, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1F2937', fontSize: '0.82rem' }}>
                    <span style={{
                      color: r.pos <= 2 ? leagueColors[league] : '#9CA3AF', fontWeight: 700,
                      width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 4, background: r.pos <= 2 ? `${leagueColors[league]}20` : 'transparent',
                    }}>{r.pos}</span>
                    <span style={{ fontWeight: 600 }}>{r.team}</span>
                    <span style={{ color: '#9CA3AF' }}>{r.p}</span>
                    <span style={{ color: '#9CA3AF' }}>{r.w}</span>
                    <span className="d-col" style={{ color: '#9CA3AF' }}>{r.d}</span>
                    <span style={{ fontWeight: 800, textAlign: 'right', color: '#fff', fontSize: '0.9rem' }}>{r.pts}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Results;