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
import {
  competitionStandings,
  getClubBySlug,
  publicClubs,
  publicTeams,
} from '../../data/publicBrowseCatalog';
import { useBackendClubs } from '../../hooks/useBackendClubs';
import './ClubDetailsPage.css';

function getSportLabel(sport: string) {
  if (sport === 'Rugby') return 'Rugby Club';
  if (sport === 'Football') return 'Football Club';
  if (sport === 'Basketball') return 'Basketball Club';
  return `${sport} Club`;
}

function getHomeGround(slug: string, sport: string, location: string) {
  const grounds: Record<string, string> = {
    kobs: 'Legends Rugby Grounds, Kampala',
    'kcca-fc': 'MTN Omondi Stadium, Lugogo',
    'sc-villa': 'Mutesa II Stadium, Wankulukuku',
    'impis-rfc': 'Makerere Rugby Grounds, Kampala',
    'black-pirates': 'Kings Park Arena, Bweyogerere',
    'platinum-heathens': 'Kyadondo Rugby Club, Kampala',
    'namuwongo-blazers': 'Lugogo Indoor Arena, Kampala',
    'city-oilers': 'Lugogo Indoor Arena, Kampala',
    'vipers-sc': 'St Mary’s Stadium, Kitende',
  };

  return grounds[slug] ?? (sport === 'Basketball' ? 'Lugogo Indoor Arena, Kampala' : location);
}

function getFullName(slug: string, name: string) {
  const names: Record<string, string> = {
    kobs: 'Kampala Commercial Bank (KCB) Rugby Club',
    'kcca-fc': 'Kampala Capital City Authority Football Club',
    'sc-villa': 'Sports Club Villa Jogoo',
    'impis-rfc': 'Impis Rugby Football Club',
    'black-pirates': 'Stanbic Black Pirates Rugby Club',
    'platinum-heathens': 'Platinum Heathens Rugby Club',
    'namuwongo-blazers': 'Namuwongo Blazers Basketball Club',
    'city-oilers': 'City Oilers Basketball Club',
    'vipers-sc': 'Vipers Sports Club',
  };

  return names[slug] ?? name;
}

function getNickname(slug: string, name: string) {
  const names: Record<string, string> = {
    kobs: 'The Bankers',
    'kcca-fc': 'The Kasasiro Boys',
    'sc-villa': 'The Jogoos',
    'impis-rfc': 'The Makerere Impis',
    'black-pirates': 'The Sea Robbers',
    'platinum-heathens': 'The Heathens',
    'namuwongo-blazers': 'The Blazers',
    'city-oilers': 'The Oilers',
    'vipers-sc': 'The Venoms',
  };

  return names[slug] ?? name;
}

function getCompetitionForClub(slug: string) {
  return competitionStandings.find((competition) =>
    competition.rows.some((row) => row.slug === slug),
  );
}

function getStandingForClub(slug: string) {
  return competitionStandings.flatMap((competition) => competition.rows).find((row) => row.slug === slug);
}

function getOpponents(slug: string, sport: string) {
  return publicClubs.filter((club) => club.slug !== slug && club.sport === sport).slice(0, 3);
}

function ClubDetailsPage() {
  const { clubSlug } = useParams();
  const baseClub = getClubBySlug(clubSlug);
  const { clubs: backendClubs } = useBackendClubs();

  if (!baseClub) {
    return (
      <>
        <Navbar />
        <main className="club-detail-page">
          <section className="club-detail-not-found">
            <ShieldCheck size={48} />
            <h1>Club not found</h1>
            <p>We could not find that club profile.</p>
            <Link to="/clubs">Back to Clubs</Link>
          </section>
          <Footer />
      </main>
      </>
    );
  }

  const backendClub = backendClubs.find((club) => club.slug === baseClub.slug);
  const club = backendClub ? { ...baseClub, name: backendClub.name } : baseClub;

  const competition = getCompetitionForClub(club.slug);
  const standing = getStandingForClub(club.slug);
  const teams = publicTeams.filter((team) => team.clubSlug === club.slug);
  const opponents = getOpponents(club.slug, club.sport);
  const recentForm = standing?.form ?? ['W', 'W', 'L', 'W', 'W'];

  const featuredPlayers = [
    { name: 'Ian Munyani', position: club.sport === 'Rugby' ? 'Centre' : club.sport === 'Football' ? 'Forward' : 'Guard', number: 10 },
    { name: 'Patrick Ochan', position: club.sport === 'Rugby' ? 'Scrum-half' : club.sport === 'Football' ? 'Midfielder' : 'Forward', number: 9 },
    { name: 'Pius Ogena', position: club.sport === 'Rugby' ? '8th Man' : club.sport === 'Football' ? 'Defender' : 'Centre', number: 8 },
    { name: 'Brian Odongo', position: club.sport === 'Rugby' ? 'Hooker' : club.sport === 'Football' ? 'Goalkeeper' : 'Captain', number: 13 },
  ];

  return (
    <>
      <Navbar />

      <main className="club-detail-page">
        <section className="club-detail-hero">
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
                <img src={club.logo} alt={club.name} />
              </div>
              {club.featured ? <span className="club-detail-verified">✓</span> : null}
            </div>

            <div className="club-detail-intro">
              {club.featured ? <span className="club-detail-badge">Featured Club</span> : null}

              <h1>{club.name}</h1>

              <div className="club-detail-meta">
                <span>{getSportLabel(club.sport)}</span>
                <span>{club.league}</span>
                <span>
                  <MapPin size={15} />
                  {club.location}
                </span>
              </div>

              <p className="club-detail-founded">Founded {club.founded}</p>
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
                  <dt>Full Name</dt>
                  <dd>{getFullName(club.slug, club.name)}</dd>
                </div>
                <div>
                  <dt>Nickname</dt>
                  <dd>{getNickname(club.slug, club.name)}</dd>
                </div>
                <div>
                  <dt>Colors</dt>
                  <dd className="club-detail-colors">
                    <span />
                    <span />
                  </dd>
                </div>
                <div>
                  <dt>Home Ground</dt>
                  <dd>{getHomeGround(club.slug, club.sport, club.location)}</dd>
                </div>
                <div>
                  <dt>Capacity</dt>
                  <dd>{club.sport === 'Basketball' ? '3,500' : club.sport === 'Football' ? '10,000' : '5,000'}</dd>
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
                  <strong>{club.trophies}</strong>
                  <span>Trophies Won</span>
                </article>
                <article>
                  <CalendarDays size={25} />
                  <strong>{club.founded}</strong>
                  <span>Founded</span>
                </article>
                <article>
                  <Users size={25} />
                  <strong>{club.followers}</strong>
                  <span>Followers</span>
                </article>
                <article>
                  <Star size={25} />
                  <strong>{standing?.position ?? club.ranking}</strong>
                  <span>Club Ranking</span>
                </article>
                <article>
                  <ShieldCheck size={25} />
                  <strong>{standing?.played ?? 12}</strong>
                  <span>Matches Played</span>
                </article>
                <article>
                  <Crown size={25} />
                  <strong>{standing ? `${Math.round((standing.won / standing.played) * 100)}%` : '62%'}</strong>
                  <span>Win Rate</span>
                </article>
              </div>

              <div className="club-detail-split-row">
                <article>
                  <h3>Recent Form</h3>
                  <div className="club-detail-form">
                    {recentForm.map((item, index) => (
                      <span
                        key={`${item}-${index}`}
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
                    ))}
                  </div>
                  <p>Last 5 Matches</p>
                </article>

                <article>
                  <h3>Honors</h3>
                  <div className="club-detail-honors">
                    <span>🏆 <strong>{club.trophies}</strong><small>League Titles</small></span>
                    <span>🥇 <strong>{Math.max(1, Math.round(club.trophies / 3))}</strong><small>Cups</small></span>
                    <span>🥈 <strong>{Math.max(1, Math.round(club.trophies / 5))}</strong><small>Finals</small></span>
                    <span>🥉 <strong>{Math.max(1, Math.round(club.trophies / 2))}</strong><small>Other</small></span>
                  </div>
                </article>
              </div>
            </section>


            <section className="club-detail-panel" id="teams">
              <div className="club-detail-panel-header">
                <h2>Teams Under {club.name}</h2>
                <Link to={`/clubs/${club.slug}/teams`}>
                  View All Teams <ChevronRight size={15} />
                </Link>
              </div>

              <div className="club-detail-teams-grid">
                {teams.length ? (
                  teams.map((team) => (
                    <article key={team.slug}>
                      <img src={team.image || club.logo} alt={team.name} />
                      <div>
                        <h3>{team.name}</h3>
                        <p>{team.sport} • {team.league}</p>
                        <span>{team.squadSize} players in squad</span>
                      </div>
                      <Link to={`/teams/${team.slug}/squad`}>
                        View Squad <ChevronRight size={15} />
                      </Link>
                    </article>
                  ))
                ) : (
                  <article>
                    <img src={club.logo} alt={club.name} />
                    <div>
                      <h3>{club.name} Senior Team</h3>
                      <p>{club.sport} • {club.league}</p>
                      <span>Squad setup pending</span>
                    </div>
                    <Link to="/clubs">
                      Back to Clubs <ChevronRight size={15} />
                    </Link>
                  </article>
                )}
              </div>
            </section>

            <section className="club-detail-panel" id="fixtures">
              <div className="club-detail-panel-header">
                <h2>Next Fixture</h2>
                <Link to="/fixtures">View Fixtures <ChevronRight size={15} /></Link>
              </div>

              {opponents[0] ? (
                <article className="club-detail-next-fixture">
                  <div>
                    <img src={club.logo} alt="" />
                    <strong>{club.name}</strong>
                  </div>

                  <div>
                    <span>Sat, 24 May 2025</span>
                    <strong>{club.sport === 'Basketball' ? '7:00 PM EAT' : '4:00 PM EAT'}</strong>
                    <small>{getHomeGround(club.slug, club.sport, club.location)}</small>
                  </div>

                  <div>
                    <strong>{opponents[0].name}</strong>
                    <img src={opponents[0].logo} alt="" />
                  </div>
                </article>
              ) : null}
            </section>

            <section className="club-detail-panel" id="news">
              <div className="club-detail-panel-header">
                <h2>Latest Club News</h2>
                <Link to="/news">View All News <ChevronRight size={15} /></Link>
              </div>

              <div className="club-detail-news-grid">
                {[
                  `${club.name} clinch vital win in top-of-the-table clash`,
                  `Strong second half secures bonus point victory`,
                  `Youth development programme empowering future stars`,
                ].map((title, index) => (
                  <article key={title}>
                    <div className="club-detail-news-thumb">
                      <Newspaper size={28} />
                    </div>
                    <div>
                      <span>{index === 1 ? 'Match Report' : 'Club News'}</span>
                      <h3>{title}</h3>
                      <p>{index + 1} day ago</p>
                    </div>
                  </article>
                ))}
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

            <section className="club-detail-panel" id="teams">
              <div className="club-detail-panel-header">
                <h2>Featured Players</h2>
                <Link to={`/clubs/${club.slug}/teams`}>
                  View Team <ChevronRight size={15} />
                </Link>
              </div>

              <div className="club-detail-player-row">
                {featuredPlayers.map((player) => (
                  <Link key={player.name} to={`/clubs/${club.slug}/teams`}>
                    <span>{player.number}</span>
                    <img src={club.logo} alt={player.name} />
                    <strong>{player.name}</strong>
                    <small>{player.position}</small>
                  </Link>
                ))}
              </div>
            </section>

            <section className="club-detail-panel">
              <div className="club-detail-panel-header">
                <h2>Upcoming Fixtures</h2>
                <Link to="/fixtures">View All Fixtures <ChevronRight size={15} /></Link>
              </div>

              <div className="club-detail-fixture-list">
                {opponents.map((opponent, index) => (
                  <article key={opponent.slug}>
                    <div>
                      <strong>{['MAY', 'MAY', 'JUN'][index] ?? 'JUN'}</strong>
                      <span>{['24', '31', '07'][index] ?? '14'}</span>
                    </div>

                    <img src={opponent.logo} alt="" />

                    <div>
                      <strong>vs {opponent.name}</strong>
                      <p>{competition?.name ?? club.league}</p>
                    </div>

                    <span>{club.sport === 'Basketball' ? '7:00 PM EAT' : '4:00 PM EAT'}</span>
                  </article>
                ))}
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
    </>
  );
}

export default ClubDetailsPage;