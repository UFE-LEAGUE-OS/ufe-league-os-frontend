import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CalendarDays,
  ChevronRight,
  Crown,
  ExternalLink,
  MapPin,
  Newspaper,
  ShieldCheck,
  Star,
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
import './ClubDetailsPage.css';

type SportName = 'Rugby' | 'Football' | 'Basketball' | 'Other';

type ClubDetails = {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  sport: SportName;
  league: string;
  location: string;
  addedYear: string;
  logo: string;
  banner: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
};

function normalizeSport(club: PublicClubApi): SportName {
  const rawSport = `${club.sport_display || club.sport || ''}`.toLowerCase();

  if (rawSport.includes('rugby')) return 'Rugby';
  if (rawSport.includes('football')) return 'Football';
  if (rawSport.includes('basketball')) return 'Basketball';

  return 'Other';
}

function getSportLabel(sport: SportName) {
  if (sport === 'Rugby') return 'Rugby Club';
  if (sport === 'Football') return 'Football Club';
  if (sport === 'Basketball') return 'Basketball Club';
  return 'Club';
}

function leagueNameFromSport(sport: SportName) {
  if (sport === 'Football') return 'StarTimes Uganda Premier League';
  if (sport === 'Rugby') return 'Nile Special Rugby Premiership';
  if (sport === 'Basketball') return 'National Basketball League';

  return 'League OS';
}

function buildClubInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function yearFromDate(value?: string) {
  if (!value) return 'N/A';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'N/A';

  return String(date.getFullYear());
}

function mapBackendClubToDetails(club: PublicClubApi): ClubDetails {
  const sport = normalizeSport(club);
  const shortName = club.short_name || buildClubInitials(club.name) || club.name;

  return {
    id: club.id,
    slug: club.slug,
    name: club.name,
    shortName,
    sport,
    league: leagueNameFromSport(sport),
    location: 'Uganda',
    addedYear: yearFromDate(club.created_at),
    logo: club.logo_url || club.logo || '',
    banner: club.banner_url || club.banner || '',
    primaryColor: club.primary_color || '#7b3ff2',
    secondaryColor: club.secondary_color || '#ff7a18',
    description: `${club.name} is a ${getSportLabel(sport).toLowerCase()} available from the League OS backend club catalogue.`,
  };
}

function findCompetitionForClub(
  club: ClubDetails,
  competitions: PublicCompetitionApi[],
) {
  return competitions.find((competition) => {
    const name = competition.name.toLowerCase();
    const leagueName = `${competition.league_name || ''}`.toLowerCase();

    if (club.sport === 'Rugby') {
      return name.includes('rugby') || leagueName.includes('rugby');
    }

    if (club.sport === 'Football') {
      return name.includes('uganda premier league') || leagueName.includes('football');
    }

    if (club.sport === 'Basketball') {
      return name.includes('basketball') || leagueName.includes('basketball');
    }

    return false;
  });
}

function getHomeGround(fixtures: PublicFixtureApi[]) {
  return fixtures.find((fixture) => fixture.venue)?.venue || 'Venue to be confirmed';
}

function formatFixtureDate(value?: string | null) {
  if (!value) return { month: 'TBA', day: '--', date: 'Date pending', time: 'Kickoff TBA' };

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { month: 'TBA', day: '--', date: 'Date pending', time: 'Kickoff TBA' };
  }

  return {
    month: date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    day: date.toLocaleDateString('en-GB', { day: '2-digit' }),
    date: date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
}

function getOpponentForFixture(club: ClubDetails, fixture: PublicFixtureApi) {
  const isHome = fixture.home_club === club.id || fixture.home_club_slug === club.slug;

  return {
    name: isHome ? fixture.away_club_name : fixture.home_club_name,
    logo: isHome ? fixture.away_club_logo_url : fixture.home_club_logo_url,
  };
}

function getRecentForm(standing?: PublicStandingApi): string[] {
  const form = standing?.form;

  if (Array.isArray(form)) {
    return form.filter(Boolean);
  }

  if (typeof form === 'string') {
    return form
      .replace(/[,-]/g, '')
      .split('')
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean);
  }

  return [];
}

function ClubDetailsPage() {
  const { clubSlug } = useParams();
  const [club, setClub] = useState<ClubDetails | null>(null);
  const [competition, setCompetition] = useState<PublicCompetitionApi | null>(null);
  const [standing, setStanding] = useState<PublicStandingApi | null>(null);
  const [fixtures, setFixtures] = useState<PublicFixtureApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadClubDetails() {
      if (!clubSlug) {
        setClub(null);
        setErrorMessage('No club slug was provided.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const clubs = await getPublicClubs();
        const selectedClub = clubs.find((item) => item.slug === clubSlug);

        if (!active) return;

        if (!selectedClub) {
          setClub(null);
          setFixtures([]);
          setCompetition(null);
          setStanding(null);
          setErrorMessage('We could not find that club in the backend club catalogue.');
          return;
        }

        const mappedClub = mapBackendClubToDetails(selectedClub);
        setClub(mappedClub);

        const [clubFixtures, competitions] = await Promise.all([
          getPublicFixtures({ clubId: mappedClub.id }),
          getPublicCompetitions(),
        ]);

        if (!active) return;

        const selectedCompetition = findCompetitionForClub(mappedClub, competitions) ?? null;
        setFixtures(clubFixtures);
        setCompetition(selectedCompetition);

        if (selectedCompetition) {
          const standings = await getPublicStandings(selectedCompetition.id);

          if (!active) return;

          setStanding(
            standings.find((row) => row.club_slug === mappedClub.slug) ?? null,
          );
        } else {
          setStanding(null);
        }
      } catch {
        if (!active) return;

        setClub(null);
        setFixtures([]);
        setCompetition(null);
        setStanding(null);
        setErrorMessage('Could not load this club from the backend. Please check the public club APIs.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadClubDetails();

    return () => {
      active = false;
    };
  }, [clubSlug]);

  const recentForm = useMemo(() => getRecentForm(standing ?? undefined), [standing]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="club-detail-page">
          <section className="club-detail-not-found">
            <ShieldCheck size={48} />
            <h1>Loading club profile</h1>
            <p>Checking the backend club catalogue.</p>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (!club) {
    return (
      <>
        <Navbar />
        <main className="club-detail-page">
          <section className="club-detail-not-found">
            <ShieldCheck size={48} />
            <h1>Club not found</h1>
            <p>{errorMessage || 'We could not find that club profile.'}</p>
            <Link to="/clubs">Back to Clubs</Link>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const homeGround = getHomeGround(fixtures);
  const primaryFixture = fixtures[0] ?? null;

  return (
    <>
      <Navbar />

      <main className="club-detail-page">
        <section
          className="club-detail-hero"
          style={
            club.banner
              ? { backgroundImage: `linear-gradient(135deg, rgba(11, 14, 66, 0.93), rgba(21, 24, 79, 0.85)), url(${club.banner})` }
              : undefined
          }
        >
          <div className="club-detail-breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <Link to="/clubs">Clubs</Link>
            <span>›</span>
            <strong>{club.name}</strong>
          </div>

          <div className="club-detail-hero-grid">
            <div className="club-detail-logo-wrap">
              <div className="club-detail-logo-ring">
                <SafeImage src={club.logo} alt={club.name} fallback={<span>{club.shortName}</span>} />
              </div>
              <span className="club-detail-verified">✓</span>
            </div>

            <div className="club-detail-intro">
              <span className="club-detail-badge">Backend Club Profile</span>

              <h1>{club.name}</h1>

              <div className="club-detail-meta">
                <span>{getSportLabel(club.sport)}</span>
                <span>{competition?.name ?? club.league}</span>
                <span>
                  <MapPin size={15} />
                  {club.location}
                </span>
              </div>

              <p className="club-detail-founded">Added {club.addedYear}</p>
              <p className="club-detail-description">{club.description}</p>

              <a href="#overview" className="club-detail-read-more">
                Read more <ChevronRight size={15} />
              </a>

              <div className="club-detail-actions">
                <button type="button">
                  <Star size={17} />
                  Follow
                </button>

                <Link to={`/memberships/${club.slug}`}>
                  <Crown size={17} />
                  Become Member
                </Link>

                <Link to={`/clubs/${club.slug}/teams`}>
                  <Users size={17} />
                  View Team
                </Link>
              </div>
            </div>

            <aside className="club-detail-facts">
              <h2>Club Facts</h2>

              <dl>
                <div>
                  <dt>Backend Name</dt>
                  <dd>{club.name}</dd>
                </div>
                <div>
                  <dt>Short Name</dt>
                  <dd>{club.shortName}</dd>
                </div>
                <div>
                  <dt>Colors</dt>
                  <dd className="club-detail-colors">
                    <span style={{ backgroundColor: club.primaryColor }} />
                    <span style={{ backgroundColor: club.secondaryColor }} />
                  </dd>
                </div>
                <div>
                  <dt>Home Ground</dt>
                  <dd>{homeGround}</dd>
                </div>
                <div>
                  <dt>Backend ID</dt>
                  <dd>{club.id}</dd>
                </div>
                <div>
                  <dt>Website</dt>
                  <dd>
                    <a href={`https://${club.slug}.leagueos.test`} target="_blank" rel="noreferrer">
                      www.{club.slug}.leagueos.test <ExternalLink size={13} />
                    </a>
                  </dd>
                </div>
              </dl>

              <Link to={`/clubs/${club.slug}`} className="club-detail-outline-link">
                View Full Profile <ChevronRight size={15} />
              </Link>
            </aside>
          </div>
        </section>

        <nav className="club-detail-tabs">
          <a href="#overview" className="is-active">Overview</a>
          <Link to={`/clubs/${club.slug}/teams`}>Teams</Link>
          <a href="#fixtures">Fixtures</a>
          <a href="/results">Results</a>
          <a href="/standings">Standings</a>
          <a href="#news">News</a>
        </nav>

        <section className="club-detail-content" id="overview">
          <div className="club-detail-main">
            <section className="club-detail-panel">
              <h2>Club Performance</h2>

              <div className="club-detail-performance-grid">
                <article>
                  <Trophy size={25} />
                  <strong>{standing?.points ?? 'N/A'}</strong>
                  <span>Points</span>
                </article>
                <article>
                  <CalendarDays size={25} />
                  <strong>{fixtures.length}</strong>
                  <span>Upcoming Fixtures</span>
                </article>
                <article>
                  <Users size={25} />
                  <strong>{club.shortName}</strong>
                  <span>Short Name</span>
                </article>
                <article>
                  <Star size={25} />
                  <strong>{standing?.position ?? 'N/A'}</strong>
                  <span>Club Ranking</span>
                </article>
                <article>
                  <ShieldCheck size={25} />
                  <strong>{standing?.played ?? 0}</strong>
                  <span>Matches Played</span>
                </article>
                <article>
                  <Crown size={25} />
                  <strong>{standing && standing.played ? `${Math.round((standing.won / standing.played) * 100)}%` : 'N/A'}</strong>
                  <span>Win Rate</span>
                </article>
              </div>

              <div className="club-detail-split-row">
                <article>
                  <h3>Recent Form</h3>
                  <div className="club-detail-form">
                    {recentForm.length ? (
                      recentForm.map((item, index) => (
                        <span
                          key={`${club.slug}-${item}-${index}`}
                          className={
                            item === 'W'
                              ? 'club-detail-win'
                              : item === 'L'
                                ? 'club-detail-loss'
                                : 'club-detail-draw'
                          }
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="club-detail-draw">N/A</span>
                    )}
                  </div>
                  <p>From backend standings</p>
                </article>

                <article>
                  <h3>Standings Summary</h3>
                  <div className="club-detail-honors">
                    <span>🏆 <strong>{standing?.won ?? 0}</strong><small>Wins</small></span>
                    <span>🤝 <strong>{standing?.drawn ?? 0}</strong><small>Draws</small></span>
                    <span>📉 <strong>{standing?.lost ?? 0}</strong><small>Losses</small></span>
                    <span>⭐ <strong>{standing?.points ?? 0}</strong><small>Points</small></span>
                  </div>
                </article>
              </div>
            </section>

            <section className="club-detail-panel" id="teams">
              <div className="club-detail-panel-header">
                <h2>Teams Under {club.name}</h2>
                <Link to={`/clubs/${club.slug}/teams`}>
                  View Team Page <ChevronRight size={15} />
                </Link>
              </div>

              <div className="club-detail-teams-grid">
                <article>
                  <SafeImage src={club.logo} alt={club.name} fallback={<span>{club.shortName}</span>} />
                  <div>
                    <h3>{club.name}</h3>
                    <p>{getSportLabel(club.sport)} • {competition?.name ?? club.league}</p>
                    <span>Team and squad API pending</span>
                  </div>
                  <Link to={`/clubs/${club.slug}/teams`}>
                    Open Team Page <ChevronRight size={15} />
                  </Link>
                </article>
              </div>
            </section>

            <section className="club-detail-panel" id="fixtures">
              <div className="club-detail-panel-header">
                <h2>Next Fixture</h2>
                <Link to="/fixtures">View Fixtures <ChevronRight size={15} /></Link>
              </div>

              {primaryFixture ? (
                <article className="club-detail-next-fixture">
                  <div>
                    <SafeImage src={club.logo} alt="" fallback={<span>{club.shortName}</span>} />
                    <strong>{club.name}</strong>
                  </div>

                  <div>
                    <span>{formatFixtureDate(primaryFixture.match_date).date}</span>
                    <strong>{formatFixtureDate(primaryFixture.match_date).time}</strong>
                    <small>{primaryFixture.venue || homeGround}</small>
                  </div>

                  <div>
                    <strong>{getOpponentForFixture(club, primaryFixture).name}</strong>
                    <SafeImage
                      src={getOpponentForFixture(club, primaryFixture).logo}
                      alt=""
                      fallback={<span>{getOpponentForFixture(club, primaryFixture).name.slice(0, 2).toUpperCase()}</span>}
                    />
                  </div>
                </article>
              ) : (
                <p className="club-detail-muted">No upcoming fixtures are currently available for this club from the backend.</p>
              )}
            </section>

            <section className="club-detail-panel" id="news">
              <div className="club-detail-panel-header">
                <h2>Latest Club News</h2>
                <Link to="/news">View All News <ChevronRight size={15} /></Link>
              </div>

              <div className="club-detail-news-grid">
                <article>
                  <div className="club-detail-news-thumb">
                    <Newspaper size={28} />
                  </div>
                  <div>
                    <span>Backend API Pending</span>
                    <h3>Club news will load here after the public news API is added.</h3>
                    <p>No hardcoded news article is shown on this club profile.</p>
                  </div>
                </article>
              </div>
            </section>
          </div>

          <aside className="club-detail-side">
            <section className="club-detail-panel club-detail-support">
              <h2>Support Your Club</h2>
              <p>Join the {club.name} community and get exclusive benefits, content, and more.</p>
              <Link to={`/memberships/${club.slug}`}>
                Become a Member <ChevronRight size={15} />
              </Link>
            </section>

            <section className="club-detail-panel" id="players">
              <div className="club-detail-panel-header">
                <h2>Featured Players</h2>
                <Link to={`/clubs/${club.slug}/teams`}>
                  View Team <ChevronRight size={15} />
                </Link>
              </div>

              <p className="club-detail-muted">
                Player data will load here after the public squad/player API is connected.
              </p>
            </section>

            <section className="club-detail-panel">
              <div className="club-detail-panel-header">
                <h2>Upcoming Fixtures</h2>
                <Link to="/fixtures">View All Fixtures <ChevronRight size={15} /></Link>
              </div>

              <div className="club-detail-fixture-list">
                {fixtures.length ? (
                  fixtures.slice(0, 3).map((fixture) => {
                    const fixtureDate = formatFixtureDate(fixture.match_date);
                    const opponent = getOpponentForFixture(club, fixture);

                    return (
                      <article key={fixture.id}>
                        <div>
                          <strong>{fixtureDate.month}</strong>
                          <span>{fixtureDate.day}</span>
                        </div>

                        <SafeImage src={opponent.logo} alt="" fallback={<span>{opponent.name.slice(0, 2).toUpperCase()}</span>} />

                        <div>
                          <strong>vs {opponent.name}</strong>
                          <p>{fixture.competition_name}</p>
                        </div>

                        <span>{fixtureDate.time}</span>
                      </article>
                    );
                  })
                ) : (
                  <p className="club-detail-muted">No upcoming backend fixtures for this club yet.</p>
                )}
              </div>

              <Link to="/fixtures" className="club-detail-outline-link">
                View Full Fixtures <ChevronRight size={15} />
              </Link>
            </section>

            <section className="club-detail-panel">
              <h2>Competition</h2>
              <p className="club-detail-muted">{competition?.name ?? club.league}</p>
              <Link to="/standings" className="club-detail-outline-link">
                View Standings <ChevronRight size={15} />
              </Link>
            </section>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default ClubDetailsPage;
