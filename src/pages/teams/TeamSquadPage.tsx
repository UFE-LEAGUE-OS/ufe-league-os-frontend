import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CalendarDays,
  ChevronRight,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
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
import './TeamSquadPage.css';

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

function getClubInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('') || 'LO';
}

function normaliseTeamSlug(value: string | undefined) {
  if (!value) return '';

  return value.replace(
    /-(senior-men|senior-women|development-squad|academy-team|first-team|squad|team|players)$/,
    '',
  );
}

function findClubFromRoute(clubs: PublicClubApi[], teamSlug: string | undefined) {
  if (!clubs.length) return undefined;

  const normalisedSlug = normaliseTeamSlug(teamSlug);

  return (
    clubs.find((club) => club.slug === teamSlug) ||
    clubs.find((club) => club.slug === normalisedSlug) ||
    clubs
      .slice()
      .sort((a, b) => b.slug.length - a.slug.length)
      .find((club) => Boolean(teamSlug?.startsWith(`${club.slug}-`))) ||
    clubs[0]
  );
}

function formatDateTime(value?: string) {
  if (!value) return 'Date pending';

  return new Intl.DateTimeFormat('en-UG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatForm(form: string | string[] | undefined) {
  if (Array.isArray(form)) return form;
  if (typeof form === 'string') return form.split('').filter(Boolean);
  return [];
}

function getClubStanding(club: PublicClubApi, standings: PublicStandingApi[]) {
  return standings.find((row) => row.club === club.id || row.club_slug === club.slug);
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

function TeamSquadPage() {
  const { teamSlug } = useParams();
  const [clubs, setClubs] = useState<PublicClubApi[]>([]);
  const [competitions, setCompetitions] = useState<PublicCompetitionApi[]>([]);
  const [fixtures, setFixtures] = useState<PublicFixtureApi[]>([]);
  const [standings, setStandings] = useState<PublicStandingApi[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const club = useMemo(() => findClubFromRoute(clubs, teamSlug), [clubs, teamSlug]);
  const currentSport = club ? formatSport(club) : 'Sport pending';

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

  const scheduledFixtures = useMemo(
    () => fixtures.filter((fixture) => fixture.status === 'SCHEDULED'),
    [fixtures],
  );
  const completedFixtures = useMemo(
    () => fixtures.filter((fixture) => fixture.status !== 'SCHEDULED'),
    [fixtures],
  );
  const standing = club ? getClubStanding(club, standings) : undefined;
  const form = formatForm(standing?.form);
  const nextMatch = scheduledFixtures[0];
  const nextOpponent = club && nextMatch ? getMatchOpponent(club, nextMatch) : undefined;

  useEffect(() => {
    let isMounted = true;

    async function loadSquadPageData() {
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

        const selectedClub = findClubFromRoute(clubsData, teamSlug);
        const fixtureData = selectedClub ? await getPublicFixtures({ clubId: selectedClub.id }) : [];

        if (!isMounted) return;

        setFixtures(fixtureData);

        const competitionId = fixtureData[0]?.competition ?? competitionsData[0]?.id;
        const standingData = competitionId ? await getPublicStandings(competitionId) : [];

        if (!isMounted) return;

        setStandings(standingData);
        setLoadState('success');
      } catch (error) {
        if (!isMounted) return;
        setLoadState('error');
        setErrorMessage(error instanceof Error ? error.message : 'Could not load backend squad data.');
      }
    }

    void loadSquadPageData();

    return () => {
      isMounted = false;
    };
  }, [teamSlug]);

  if (loadState === 'loading' || loadState === 'idle') {
    return (
      <>
        <Navbar />
        <main className="team-squad-page">
          <section className="team-squad-not-found">
            <ShieldCheck size={44} />
            <h1>Loading squad page</h1>
            <p>Fetching club, fixture and standings data from the backend.</p>
          </section>
        </main>
      </>
    );
  }

  if (loadState === 'error' || !club) {
    return (
      <>
        <Navbar />
        <main className="team-squad-page">
          <section className="team-squad-not-found">
            <ShieldCheck size={44} />
            <h1>Team squad unavailable</h1>
            <p>{errorMessage || 'The backend did not return a matching club for this squad route.'}</p>
            <Link to="/clubs">Back to Clubs</Link>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="team-squad-page">
        <section className="team-squad-hero">
          <div className="team-squad-breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <Link to="/clubs">Clubs</Link>
            <span>›</span>
            <Link to={`/clubs/${club.slug}`}>{club.name}</Link>
            <span>›</span>
            <strong>Players &amp; Squads</strong>
          </div>

          <div className="team-squad-identity">
            <SafeImage
              className="team-squad-logo"
              src={getClubLogo(club)}
              alt={club.name}
              fallback={getClubInitials(club.name)}
            />

            <div>
              <h1>{club.name}</h1>
              <p>
                {currentSport} Club <span>•</span> {selectedCompetition?.name ?? 'Competition pending'}
              </p>
              <p>
                Official players and squads will appear here once the backend squad API is available.
              </p>
            </div>

            <div className="team-squad-hero-stats">
              <span>
                <Trophy size={22} />
                <strong>API</strong>
                <small>Teams pending</small>
              </span>
              <span>
                <Users size={22} />
                <strong>API</strong>
                <small>Players pending</small>
              </span>
              <span>
                <CalendarDays size={22} />
                <strong>{scheduledFixtures.length}</strong>
                <small>Upcoming fixtures</small>
              </span>
            </div>

            <button type="button" className="team-squad-follow">
              <Star size={18} />
              Follow Club
            </button>
          </div>

          <nav className="team-squad-tabs">
            <Link to={`/clubs/${club.slug}`}>Overview</Link>
            <Link to="/fixtures">Fixtures</Link>
            <Link to="/results">Results</Link>
            <Link to={`/clubs/${club.slug}/teams`} className="is-active">Players &amp; Squads</Link>
            <Link to="/news">News</Link>
            <Link to="/standings">Stats</Link>
          </nav>
        </section>

        <section className="team-squad-content" id="squad">
          <div className="team-squad-main">
            <div className="team-squad-filters">
              <label>
                <span>Team</span>
                <select value="Official teams API pending" disabled>
                  <option>Official teams API pending</option>
                </select>
              </label>

              <label>
                <span>Season</span>
                <select value={selectedCompetition?.season ?? 'Season pending'} disabled>
                  <option>{selectedCompetition?.season ?? 'Season pending'}</option>
                </select>
              </label>

              <label>
                <span>Position</span>
                <select value="Positions API pending" disabled>
                  <option>Positions API pending</option>
                </select>
              </label>

              <label className="team-squad-search">
                <Search size={18} />
                <input type="search" placeholder="Player search pending backend API" disabled />
              </label>

              <button type="button" disabled>
                API pending
              </button>
            </div>

            <div className="team-squad-roster team-squad-roster-pending">
              <article className="team-squad-api-pending-card">
                <ShieldAlert size={36} />
                <span className="team-squad-featured-badge">Backend API pending</span>
                <h2>Official squads are not available yet</h2>
                <p>
                  This page now uses backend club, fixture and standings data. The previous hardcoded
                  KOBS squad and generated players have been removed so the UI does not display fake
                  player records.
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
                  <div>
                    <dt>Player endpoint</dt>
                    <dd>/api/clubs/{club.id}/players/</dd>
                  </div>
                </dl>
                <Link to={`/clubs/${club.slug}/teams`}>
                  Back to Club Teams <ChevronRight size={16} />
                </Link>
              </article>
            </div>

            <div className="team-squad-full-roster">
              <span>Official roster API pending</span>
            </div>

            <section className="team-squad-bottom-panel">
              <div>
                <h2>Recent Form <span>(Backend standings)</span></h2>
                {form.length ? (
                  <div className="team-squad-form">
                    {form.slice(0, 5).map((item, index) => (
                      <article key={`${item}-${index}`}>
                        <strong className={item === 'W' ? 'is-win' : item === 'L' ? 'is-loss' : 'is-draw'}>
                          {item}
                        </strong>
                        <span>Backend form</span>
                        <small>{selectedCompetition?.name ?? 'Competition pending'}</small>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="team-squad-muted">No backend form has been returned for this club yet.</p>
                )}
              </div>

              <div>
                <h2>Backend Status</h2>
                <div className="team-squad-strengths">
                  <span>Club Data <strong>Connected</strong></span>
                  <span>Fixtures <strong>Connected</strong></span>
                  <span>Squads <strong>Pending</strong></span>
                </div>
              </div>
            </section>
          </div>

          <aside className="team-squad-side">
            <section className="team-squad-side-card">
              <h2>Squad Overview</h2>

              <div className="team-squad-overview-stats">
                <span>
                  <small>Teams</small>
                  <strong>API</strong>
                </span>
                <span>
                  <small>Players</small>
                  <strong>API</strong>
                </span>
                <span>
                  <small>Position</small>
                  <strong>{standing?.position ?? '—'}</strong>
                </span>
              </div>

              <div className="team-squad-injuries">
                <h3>
                  Injuries / Unavailable
                  <span>API</span>
                </h3>
                <p>Injury and player availability data needs the official squad/player backend API.</p>
              </div>
            </section>

            <section className="team-squad-side-card">
              <h2>Leadership</h2>
              <div className="team-squad-status-list">
                <article>
                  <ShieldCheck size={16} />
                  <div>
                    <strong>Captain and staff data pending</strong>
                    <small>Requires official Team / Player / Staff backend models.</small>
                  </div>
                </article>
              </div>
            </section>

            <section className="team-squad-side-card">
              <h2>Backend Fixtures</h2>
              {nextMatch && nextOpponent ? (
                <>
                  <div className="team-squad-next-match">
                    <SafeImage
                      className="team-squad-next-match-logo"
                      src={getClubLogo(club)}
                      alt={club.name}
                      fallback={getClubInitials(club.name)}
                    />
                    <div>
                      <strong>vs {nextOpponent.name}</strong>
                      <span>{selectedCompetition?.name ?? nextMatch.competition_name}</span>
                      <small>{formatDateTime(nextMatch.match_date)}</small>
                      <small>{nextMatch.venue || 'Venue pending'}</small>
                      <small>{nextOpponent.side}</small>
                    </div>
                    <SafeImage
                      className="team-squad-next-match-logo"
                      src={nextOpponent.logo}
                      alt={nextOpponent.name}
                      fallback={getClubInitials(nextOpponent.name)}
                    />
                  </div>

                  <Link to="/fixtures">
                    View Match Centre <ChevronRight size={16} />
                  </Link>
                </>
              ) : (
                <p className="team-squad-muted">No upcoming backend fixtures were returned for this club.</p>
              )}
            </section>

            <section className="team-squad-side-card">
              <h2>Backend Summary</h2>
              <div className="team-squad-status-list">
                <article>
                  <CalendarDays size={16} />
                  <div>
                    <strong>{scheduledFixtures.length} upcoming fixtures</strong>
                    <small>{completedFixtures.length} completed fixtures returned for this club.</small>
                  </div>
                </article>
                <article>
                  <Trophy size={16} />
                  <div>
                    <strong>{standing?.points ?? '—'} points</strong>
                    <small>{standing ? `Played ${standing.played}, position ${standing.position}` : 'Standing pending'}</small>
                  </div>
                </article>
              </div>
            </section>
          </aside>
        </section>
      </main>
    </>
  );
}

export default TeamSquadPage;
