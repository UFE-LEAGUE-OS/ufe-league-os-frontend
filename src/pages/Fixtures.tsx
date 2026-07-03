import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import fixturesImg from '../assets/fixtures.png';
import heroBg from '../assets/stadium-bg.svg';
import {
  getPublicFixtures,
  type PublicFixtureApi,
} from '../services/publicDashboardService.js';

interface Fixture {
  id: string;
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

function mapBackendStatus(status?: string): Fixture['status'] {
  const normalisedStatus = status?.toUpperCase() ?? '';

  if (normalisedStatus === 'LIVE' || normalisedStatus === 'IN_PROGRESS') {
    return 'live';
  }

  if (normalisedStatus === 'COMPLETED' || normalisedStatus === 'FINISHED') {
    return 'completed';
  }

  return 'upcoming';
}

function formatFixtureTime(matchDate?: string | null) {
  if (!matchDate) {
    return 'TBA';
  }

  const date = new Date(matchDate);

  if (Number.isNaN(date.getTime())) {
    return 'TBA';
  }

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFixtureDate(matchDate?: string | null) {
  if (!matchDate) {
    return '';
  }

  const date = new Date(matchDate);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function mapPublicFixtureToFixture(fixture: PublicFixtureApi): Fixture {
  const competition = fixture.competition_name || 'League OS Competition';

  return {
    id: String(fixture.id),
    league: competition,
    competition,
    date: formatFixtureDate(fixture.match_date),
    time: formatFixtureTime(fixture.match_date),
    teamA: fixture.home_club_name || 'Home Team',
    teamB: fixture.away_club_name || 'Away Team',
    venue: fixture.venue || 'Venue to be confirmed',
    status: mapBackendStatus(fixture.status),
    scoreA: fixture.home_score ?? undefined,
    scoreB: fixture.away_score ?? undefined,
  };
}

function getCalendarMonth(fixtures: Fixture[]) {
  const firstFixtureWithDate = fixtures.find((fixture) => fixture.date);

  if (!firstFixtureWithDate) {
    return new Date();
  }

  const date = new Date(`${firstFixtureWithDate.date}T00:00:00`);

  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function buildCalendarCells(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const mondayBasedOffset = firstDay === 0 ? 6 : firstDay - 1;
  const totalCells = Math.ceil((mondayBasedOffset + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const day = index - mondayBasedOffset + 1;

    return day >= 1 && day <= daysInMonth ? day : null;
  });
}

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
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState('All');
  const [isLoadingFixtures, setIsLoadingFixtures] = useState(true);
  const [fixtureError, setFixtureError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadFixtures() {
      setIsLoadingFixtures(true);
      setFixtureError('');

      try {
        const backendFixtures = await getPublicFixtures();

        if (!isMounted) {
          return;
        }

        setFixtures(backendFixtures.map(mapPublicFixtureToFixture));
      } catch {
        if (!isMounted) {
          return;
        }

        setFixtures([]);
        setFixtureError(
          'We could not load fixtures from the backend. Confirm the public fixtures API is available.',
        );
      } finally {
        if (isMounted) {
          setIsLoadingFixtures(false);
        }
      }
    }

    void loadFixtures();

    return () => {
      isMounted = false;
    };
  }, []);

  const competitionFilters = useMemo(
    () => ['All', ...Array.from(new Set(fixtures.map((fixture) => fixture.competition))).sort()],
    [fixtures],
  );

  const filteredFixtures = useMemo(
    () =>
      selectedCompetition === 'All'
        ? fixtures
        : fixtures.filter((fixture) => fixture.competition === selectedCompetition),
    [fixtures, selectedCompetition],
  );

  const liveFixtures = filteredFixtures.filter((fixture) => fixture.status === 'live');
  const upcomingFixtures = filteredFixtures.filter((fixture) => fixture.status === 'upcoming');
  const calendarMonth = getCalendarMonth(filteredFixtures.length > 0 ? filteredFixtures : fixtures);
  const calendarCells = buildCalendarCells(calendarMonth);
  const fixtureDays = new Set(
    filteredFixtures
      .map((fixture) => fixture.date)
      .filter(Boolean)
      .map((date) => new Date(`${date}T00:00:00`).getDate()),
  );

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
          {competitionFilters.map(competition => (
            <button key={competition} className="fixtures-filter-btn"
              type="button"
              onClick={() => setSelectedCompetition(competition)}
              style={{
                padding: '8px 20px', borderRadius: 20,
                border: '1px solid #1F2937',
                background: competition === selectedCompetition ? '#8135FA' : 'transparent',
                color: competition === selectedCompetition ? '#fff' : '#9CA3AF',
                fontFamily: 'var(--font-heading)', fontWeight: 600,
                fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (competition !== selectedCompetition) { e.currentTarget.style.borderColor = '#8135FA'; e.currentTarget.style.color = '#fff'; }}}
              onMouseLeave={e => { if (competition !== selectedCompetition) { e.currentTarget.style.borderColor = '#1F2937'; e.currentTarget.style.color = '#9CA3AF'; }}}
            >
              {competition === 'All' ? 'All Leagues' : competition}
            </button>
          ))}
        </div>

        {isLoadingFixtures ? (
          <section style={{ marginBottom: 40, background: '#12131F', borderRadius: 8, padding: 24, border: '1px solid #1F2937' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.15rem', marginBottom: 8 }}>LOADING FIXTURES</h2>
            <p style={{ color: '#9CA3AF', margin: 0 }}>Checking the backend fixture schedule.</p>
          </section>
        ) : null}

        {!isLoadingFixtures && fixtureError ? (
          <section style={{ marginBottom: 40, background: '#12131F', borderRadius: 8, padding: 24, border: '1px solid rgba(239,68,68,0.35)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.15rem', marginBottom: 8, color: '#FCA5A5' }}>FIXTURE SYNC ISSUE</h2>
            <p style={{ color: '#FECACA', margin: 0 }}>{fixtureError}</p>
          </section>
        ) : null}

        {/* Live Now */}
        {liveFixtures.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.15rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#DC2626', animation: 'pulse 1.5s infinite' }} />
              LIVE NOW
            </h2>
            <div style={{ background: '#12131F', borderRadius: 8, overflow: 'hidden' }}>
              {liveFixtures.map((f) => (
                <div key={f.id} className="fixtures-live-grid" style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto 1fr 80px', gap: 12, alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #1F2937' }}>
                  <span className="comp-col" style={{ fontSize: '0.75rem', color: '#9CA3AF', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{f.competition}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{f.teamA}</span>
                  <span style={{ fontWeight: 800, color: '#F97316', textAlign: 'center', fontSize: '1.1rem' }}>{f.scoreA ?? '-'} - {f.scoreB ?? '-'}</span>
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
            {upcomingFixtures.length > 0 ? upcomingFixtures.map((f) => (
              <div key={f.id} className="fixtures-upcoming-row" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 90px 1fr 80px 120px', gap: 12, alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #1F2937', fontSize: '0.85rem', transition: 'background 0.2s' }}
                   onMouseEnter={e => (e.currentTarget.style.background = '#1a1f3a')}
                   onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span className="comp-col" style={{ fontSize: '0.7rem', color: '#9CA3AF', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{f.competition}</span>
                <span style={{ fontWeight: 600, textAlign: 'right' }}>{f.teamA}</span>
                <span style={{ color: '#6B7280', textAlign: 'center' }}>-</span>
                <span style={{ fontWeight: 600 }}>{f.teamB}</span>
                <span className="date-col" style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>{f.date ? new Date(`${f.date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : 'TBA'}</span>
                <span className="venue-col" style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>{f.venue}</span>
              </div>
            )) : (
              <p style={{ padding: 20, color: '#6B7280', textAlign: 'center' }}>No upcoming fixtures scheduled. Check back soon!</p>
            )}
          </div>
        </section>

        {/* Fixtures Calendar */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.15rem', marginBottom: 16 }}>
            FIXTURES CALENDAR · {calendarMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="fixtures-calendar" style={{ background: '#12131F', borderRadius: 8, padding: 24, border: '1px solid #1F2937' }}>
            <div className="fixtures-calendar-days" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 16 }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', padding: '8px 0' }}>{day}</div>
              ))}
            </div>
            <div className="fixtures-calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {calendarCells.map((day, index) => {
                const hasFixture = day !== null && fixtureDays.has(day);
                return (
                  <div key={day === null ? `empty-${index}` : `day-${day}`} style={{
                    textAlign: 'center', padding: '8px 0', borderRadius: 6,
                    background: hasFixture ? 'rgba(129, 53, 250, 0.15)' : 'transparent',
                    color: day === null ? '#1F2937' : hasFixture ? '#8135FA' : '#9CA3AF',
                    fontWeight: hasFixture ? 700 : 400, fontSize: '0.85rem',
                    cursor: hasFixture ? 'pointer' : 'default', transition: 'background 0.2s',
                  }}
                       onMouseEnter={e => { if (hasFixture) e.currentTarget.style.background = 'rgba(129, 53, 250, 0.25)'; }}
                       onMouseLeave={e => { if (hasFixture) e.currentTarget.style.background = 'rgba(129, 53, 250, 0.15)'; }}>
                    {day ?? ''}
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
