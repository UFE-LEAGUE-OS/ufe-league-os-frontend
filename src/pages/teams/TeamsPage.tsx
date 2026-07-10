import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SafeImage from '../../components/SafeImage/SafeImage';
import {
  getPublicClubs,
  getPublicCompetitions,
  getPublicFixtures,
  getPublicStandings,
  type PublicClubApi,
  type PublicCompetitionApi,
  type PublicFixtureApi,
  type PublicStandingApi,
} from '../../services/publicDashboardService';
import './TeamsPage.css';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

function formatSport(club: PublicClubApi) {
  if (club.sport_display) return club.sport_display;
  if (!club.sport) return 'Sport pending';

  return club.sport
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getClubLogo(club: PublicClubApi) {
  return club.logo_url || club.logo || '';
}

function formatDate(value?: string) {
  if (!value) return 'Date pending';

  return new Intl.DateTimeFormat('en-UG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatMatchTime(value?: string) {
  if (!value) return '';

  return new Intl.DateTimeFormat('en-UG', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatForm(form: string | string[] | undefined) {
  if (Array.isArray(form)) return form;
  if (typeof form === 'string') return form.split('').filter(Boolean);
  return [];
}

function getMatchOpponent(club: PublicClubApi, fixture: PublicFixtureApi) {
  const isHome = fixture.home_club === club.id;

  return {
    name: isHome ? fixture.away_club_name : fixture.home_club_name,
    slug: isHome ? fixture.away_club_slug : fixture.home_club_slug,
    logo: isHome ? fixture.away_club_logo_url : fixture.home_club_logo_url,
    side: isHome ? 'Home' : 'Away',
  };
}

function getClubStanding(club: PublicClubApi, standings: PublicStandingApi[]) {
  return standings.find((row) => row.club === club.id || row.club_slug === club.slug);
}

function TeamsPage() {
  const { clubSlug } = useParams();
  const [clubs, setClubs] = useState<PublicClubApi[]>([]);
  const [competitions, setCompetitions] = useState<PublicCompetitionApi[]>([]);
  const [fixtures, setFixtures] = useState<PublicFixtureApi[]>([]);
  const [standings, setStandings] = useState<PublicStandingApi[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const club = useMemo(() => {
    if (!clubs.length) return undefined;
    return clubs.find((item) => item.slug === clubSlug) ?? clubs[0];
  }, [clubs, clubSlug]);

  const currentSport = club ? formatSport(club) : 'Sport pending';

  const otherClubs = useMemo(() => {
    if (!club) return [];

    return clubs
      .filter((item) => item.slug !== club.slug)
      .filter((item) => formatSport(item) === currentSport)
      .slice(0, 4);
  }, [club, clubs, currentSport]);

  const selectedCompetition = useMemo(() => {
    if (!club) return undefined;

    const competitionFromFixture = fixtures.find(
      (fixture) => fixture.home_club === club.id || fixture.away_club === club.id,
    );

    if (competitionFromFixture) {
      return competitions.find((item) => item.id === competitionFromFixture.competition);
    }

    return competitions[0];
  }, [club, competitions, fixtures]);

  const clubStanding = club ? getClubStanding(club, standings) : undefined;
  const upcomingFixtures = fixtures.filter((fixture) => fixture.status === 'SCHEDULED');
  const completedFixtures = fixtures.filter((fixture) => fixture.status !== 'SCHEDULED');
  const form = formatForm(clubStanding?.form);

  useEffect(() => {
    let isMounted = true;

    async function loadTeamsPageData() {
      setLoadState('loading');
      setErrorMessage('');

      try {
        const [clubsData, competitionsData] = await Promise.all([
          getPublicClubs(),
          getPublicCompetitions(),
        ]);

        if (!isMounted) return;

        setClubs(clubsData);
        setCompetitions(competitionsData);

        const selectedClub = clubsData.find((item) => item.slug === clubSlug) ?? clubsData[0];
        const fixtureData = selectedClub ? await getPublicFixtures({ clubId: selectedClub.id }) : [];

        if (!isMounted) return;

        setFixtures(fixtureData);

        const competitionIds = Array.from(new Set(fixtureData.map((fixture) => fixture.competition)));
        const competitionId = competitionIds[0] ?? competitionsData[0]?.id;
        const standingData = competitionId ? await getPublicStandings(competitionId) : [];

        if (!isMounted) return;

        setStandings(standingData);
        setLoadState('success');
      } catch (error) {
        if (!isMounted) return;
        setLoadState('error');
        setErrorMessage(error instanceof Error ? error.message : 'Could not load team data.');
      }
    }

    void loadTeamsPageData();

    return () => {
      isMounted = false;
    };
  }, [clubSlug]);

  if (loadState === 'loading' || loadState === 'idle') {
    return (
      <>
        <Navbar />
        <main className="club-teams-page">
          <section className="club-teams-hero">
            <div className="club-teams-breadcrumb">
              <Link to="/">Home</Link>
              <span>›</span>
              <Link to="/clubs">Clubs</Link>
              <span>›</span>
              <strong>Teams</strong>
            </div>
            <h1>Loading teams</h1>
            <p>Fetching club data, fixtures and standings from the backend.</p>
          </section>
          <Footer />
        </main>
      </>
    );
  }

  if (loadState === 'error' || !club) {
    return (
      <>
        <Navbar />
        <main className="club-teams-page">
          <section className="club-teams-hero">
            <div className="club-teams-breadcrumb">
              <Link to="/">Home</Link>
              <span>›</span>
              <Link to="/clubs">Clubs</Link>
              <span>›</span>
              <strong>Teams</strong>
            </div>
            <h1>Teams unavailable</h1>
            <p>{errorMessage || 'The backend did not return a matching club.'}</p>
            <Link to="/clubs" className="club-teams-clear">
              Back to clubs
            </Link>
          </section>
          <Footer />
        </main>
      </>
    );
  }

  const logo = getClubLogo(club);

  return (
    <>
      <Navbar />

      <main className="club-teams-page">
        <section className="club-teams-hero">
          <div className="club-teams-breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <Link to="/clubs">Clubs</Link>
            <span>›</span>
            <Link to={`/clubs/${club.slug}`}>{club.name}</Link>
            <span>›</span>
            <strong>Teams</strong>
          </div>

          <h1>Teams</h1>
          <p>Browse backend club data, fixtures and standings by club.</p>

          <div className="club-teams-filters">
            <Link to="/clubs">All Sports</Link>
            <Link to={`/clubs?sport=${encodeURIComponent(currentSport)}`}>{currentSport}</Link>

            <label>
              <span>Select Competition</span>
              <select value={selectedCompetition?.id ?? ''} disabled>
                <option value={selectedCompetition?.id ?? ''}>
                  {selectedCompetition?.name ?? 'Competition pending'}
                </option>
              </select>
            </label>

            <label>
              <span>Select Club</span>
              <select
                value={club.slug}
                onChange={(event) => {
                  window.location.href = `/clubs/${event.target.value}/teams`;
                }}
              >
                {clubs.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <Link to={`/clubs/${club.slug}/teams`} className="club-teams-clear">
              <RotateCcw size={15} />
              Clear Filters
            </Link>
          </div>
        </section>

        <section className="club-teams-layout">
          <div className="club-teams-main">
            <section className="club-teams-club-card">
              <div className="club-teams-logo">
                <SafeImage src={logo} alt={club.name} fallback={<span>{club.short_name || club.name.charAt(0)}</span>} />
              </div>

              <div className="club-teams-club-copy">
                <h2>{club.name}</h2>
                <p>
                  <span>{currentSport}</span>
                  <span>{selectedCompetition?.name ?? 'Competition pending'}</span>
                  <span>{club.short_name || 'Short name pending'}</span>
                </p>
                <small>Official teams and squads will appear here once the backend team API is available.</small>
              </div>

              <div className="club-teams-club-stats">
                <span>
                  <Users size={24} />
                  <strong>API</strong>
                  Teams pending
                </span>
                <span>
                  <Users size={24} />
                  <strong>API</strong>
                  Squad pending
                </span>
                <span>
                  <Trophy size={24} />
                  <strong>{clubStanding?.points ?? 0}</strong>
                  Points
                </span>
                <span>
                  <CalendarDays size={24} />
                  Position
                  <strong>{clubStanding?.position ?? '—'}</strong>
                </span>
              </div>
            </section>

            <div className="club-teams-section-title">
              <h2>Teams at {club.name}</h2>
              <span>Backend API pending</span>
            </div>

            <section className="club-teams-grid">
              <article className="club-team-card">
                <div className="club-team-image">
                  <SafeImage src={logo} alt={club.name} fallback={null} />
                  <span>API Pending</span>
                </div>

                <div className="club-team-body">
                  <h3>Official teams are not available yet</h3>
                  <p>
                    This page now uses backend club, fixture and standings data. The previous fake team templates have
                    been removed so that the UI does not display hardcoded squads.
                  </p>

                  <dl>
                    <div>
                      <dt>Backend model needed</dt>
                      <dd>Team / Squad</dd>
                    </div>
                    <div>
                      <dt>Suggested endpoint</dt>
                      <dd>/api/clubs/{club.id}/teams/</dd>
                    </div>
                  </dl>

                  <div className="club-team-footer">
                    <small>
                      <ShieldCheck size={15} />
                      Awaiting official team API
                    </small>

                    <Link to={`/clubs/${club.slug}`}>View Club</Link>
                  </div>
                </div>
              </article>
            </section>

            <section className="club-teams-bottom-grid">
              <article className="club-teams-panel">
                <div className="club-teams-panel-header">
                  <h2>Backend Fixture Feed</h2>
                  <Link to="/fixtures">
                    View All Fixtures <ArrowRight />
                  </Link>
                </div>

                <div className="club-teams-result-list">
                  {upcomingFixtures.length ? (
                    upcomingFixtures.slice(0, 4).map((fixture) => {
                      const opponent = getMatchOpponent(club, fixture);

                      return (
                        <div key={fixture.id} className="club-teams-result-row">
                          <span>{formatDate(fixture.match_date)}</span>
                          <strong>{club.name}</strong>
                          <small>{opponent.side} vs {opponent.name}</small>
                          <b>{formatMatchTime(fixture.match_date)}</b>
                          <em className="is-w">{fixture.status}</em>
                        </div>
                      );
                    })
                  ) : (
                    <div className="club-teams-result-row">
                      <span>API</span>
                      <strong>No fixtures returned</strong>
                      <small>This club has no scheduled fixtures in the current backend response.</small>
                      <b>—</b>
                      <em>—</em>
                    </div>
                  )}
                </div>
              </article>

              <article className="club-teams-panel">
                <div className="club-teams-panel-header">
                  <h2>Backend Standing</h2>
                  <Link to="/standings">
                    View Standings <ArrowRight />
                  </Link>
                </div>

                <div className="club-teams-result-list">
                  <div className="club-teams-result-row">
                    <span>POS</span>
                    <strong>{club.name}</strong>
                    <small>Played {clubStanding?.played ?? 0} • W {clubStanding?.won ?? 0} D {clubStanding?.drawn ?? 0} L {clubStanding?.lost ?? 0}</small>
                    <b>{clubStanding?.points ?? 0} pts</b>
                    <em className="is-w">{clubStanding?.position ?? '—'}</em>
                  </div>

                  <div className="club-teams-result-row">
                    <span>FORM</span>
                    <strong>{form.length ? form.join(' ') : 'No form yet'}</strong>
                    <small>Form is read from the backend standings table.</small>
                    <b>GD {clubStanding?.goal_difference ?? 0}</b>
                    <em>API</em>
                  </div>
                </div>
              </article>
            </section>

            <section className="club-teams-bottom-grid">
              <article className="club-teams-panel">
                <div className="club-teams-panel-header">
                  <h2>Featured Squad Players</h2>
                  <span>API pending</span>
                </div>

                <p>
                  The previous generated player list has been removed. We need an official players/squad backend API
                  before this section can display real database records.
                </p>
              </article>

              <article className="club-teams-panel">
                <div className="club-teams-panel-header">
                  <h2>Recent Team Results</h2>
                  <Link to="/results">
                    View All Results <ArrowRight />
                  </Link>
                </div>

                <div className="club-teams-result-list">
                  {completedFixtures.length ? (
                    completedFixtures.slice(0, 4).map((fixture) => {
                      const opponent = getMatchOpponent(club, fixture);
                      const score = `${fixture.home_score ?? 0} - ${fixture.away_score ?? 0}`;

                      return (
                        <div key={fixture.id} className="club-teams-result-row">
                          <span>{formatDate(fixture.match_date)}</span>
                          <strong>{club.name}</strong>
                          <small>{opponent.name}</small>
                          <b>{score}</b>
                          <em>{fixture.status}</em>
                        </div>
                      );
                    })
                  ) : (
                    <div className="club-teams-result-row">
                      <span>API</span>
                      <strong>No completed results returned</strong>
                      <small>The current seed mostly contains scheduled fixtures.</small>
                      <b>—</b>
                      <em>—</em>
                    </div>
                  )}
                </div>
              </article>
            </section>
          </div>

          <aside className="club-teams-sidebar">
            <h2>Other {currentSport} Clubs</h2>
            <p>Select another backend club to view its fixtures and standings.</p>

            <div className="club-teams-other-list">
              {otherClubs.map((item) => {
                const itemLogo = getClubLogo(item);

                return (
                  <Link key={item.slug} to={`/clubs/${item.slug}/teams`}>
                    <SafeImage src={itemLogo} alt={item.name} fallback={<span>{item.short_name || item.name.charAt(0)}</span>} />
                    <span>
                      <strong>{item.name}</strong>
                      <small>{formatSport(item)} Club</small>
                      <small>{item.short_name || item.slug}</small>
                    </span>
                    <ChevronRight size={18} />
                  </Link>
                );
              })}
            </div>

            <Link to="/clubs" className="club-teams-view-all">
              View All Clubs
            </Link>
          </aside>
        </section>

        <Footer />
      </main>
    </>
  );
}

export default TeamsPage;
