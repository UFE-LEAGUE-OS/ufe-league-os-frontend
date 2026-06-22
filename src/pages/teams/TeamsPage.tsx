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
import {
  competitionStandings,
  publicClubs,
  publicPlayers,
  publicTeams,
  type PublicClub,
  type PublicTeam,
} from '../../data/publicBrowseCatalog';
import './TeamsPage.css';

type ClubTeam = PublicTeam & {
  tag: string;
  coach: string;
  nextFixture: string;
  nextOpponentLogo: string;
  description: string;
};

const rugbyTeamTemplates = [
  {
    key: 'first-xv',
    tag: 'Senior Men',
    label: 'Senior Men',
    squadSize: 28,
    coach: 'Philip Wokorach',
    description: 'Competing at the highest level in the Nile Special Rugby Premiership.',
  },
  {
    key: 'ladies',
    tag: 'Ladies Team',
    label: 'Ladies',
    squadSize: 24,
    coach: 'Peace Lekuru',
    description: 'Representing the club in the women’s rugby series.',
  },
  {
    key: 'u20',
    tag: 'U20 Team',
    label: 'U20',
    squadSize: 26,
    coach: 'Henry Ssenginja',
    description: 'Developing the next generation of rugby talent.',
  },
  {
    key: '7s',
    tag: '7s Team',
    label: '7s',
    squadSize: 18,
    coach: 'David Kyalo',
    description: 'Competing in national sevens tournaments and regional events.',
  },
  {
    key: 'u18',
    tag: 'U18 Team',
    label: 'U18',
    squadSize: 30,
    coach: 'Ivan Magomu',
    description: 'Building strong foundations for future champions.',
  },
  {
    key: 'academy',
    tag: 'Academy Team',
    label: 'Academy',
    squadSize: 32,
    coach: 'Brian Odongo',
    description: 'Grassroots development program for young players.',
  },
];

const footballTeamTemplates = [
  { key: 'senior-team', tag: 'Senior Team', label: 'Senior Team', squadSize: 27, coach: 'Head Coach', description: 'Competing in the top football league.' },
  { key: 'women-team', tag: 'Women’s Team', label: 'Women’s Team', squadSize: 24, coach: 'Team Coach', description: 'Representing the club in women’s football.' },
  { key: 'u20-team', tag: 'U20 Team', label: 'U20 Team', squadSize: 26, coach: 'Youth Coach', description: 'Developing future senior team players.' },
  { key: 'reserve-team', tag: 'Reserve Team', label: 'Reserve Team', squadSize: 25, coach: 'Reserve Coach', description: 'Competitive reserve squad and player pathway.' },
];

const basketballTeamTemplates = [
  { key: 'senior-team', tag: 'Senior Team', label: 'Senior Team', squadSize: 15, coach: 'Head Coach', description: 'Competing in the National Basketball League.' },
  { key: 'women-team', tag: 'Women’s Team', label: 'Women’s Team', squadSize: 14, coach: 'Team Coach', description: 'Representing the club in women’s basketball.' },
  { key: 'u18-team', tag: 'U18 Team', label: 'U18 Team', squadSize: 16, coach: 'Youth Coach', description: 'Developing young basketball talent.' },
  { key: 'academy-team', tag: 'Academy Team', label: 'Academy Team', squadSize: 18, coach: 'Academy Coach', description: 'Grassroots basketball development pathway.' },
];

function getTemplatesForClub(club: PublicClub) {
  if (club.sport === 'Rugby') return rugbyTeamTemplates;
  if (club.sport === 'Football') return footballTeamTemplates;
  return basketballTeamTemplates;
}

function getCompetitionForClub(club: PublicClub) {
  return (
    competitionStandings.find((competition) =>
      competition.rows.some((row) => row.slug === club.slug),
    ) ?? competitionStandings.find((competition) => competition.sport === club.sport)
  );
}

function getTeamSlug(club: PublicClub, key: string) {
  if (club.slug === 'kobs' && key === 'first-xv') return 'kobs-first-xv';
  if (club.slug === 'kobs' && key === 'ladies') return 'kobs-ladies';

  const existingTeam = publicTeams.find(
    (team) => team.clubSlug === club.slug && team.slug.includes(key),
  );

  return existingTeam?.slug ?? `${club.slug}-${key}`;
}

function getClubTeams(club: PublicClub): ClubTeam[] {
  const templates = getTemplatesForClub(club);

  return templates.map((template) => {
    const slug = getTeamSlug(club, template.key);
    const existingTeam = publicTeams.find((team) => team.slug === slug);

    return {
      slug,
      name: existingTeam?.name ?? `${club.name} ${template.label}`,
      clubSlug: club.slug,
      clubName: club.name,
      sport: club.sport,
      league: club.league,
      squadSize: existingTeam?.squadSize ?? template.squadSize,
      image: existingTeam?.image ?? club.logo,
      form: existingTeam?.form ?? ['W', 'W', 'L', 'W', 'W'],
      tag: template.tag,
      coach: template.coach,
      nextFixture:
        club.sport === 'Rugby'
          ? 'vs Heathens 7s • 17 May 2025'
          : club.sport === 'Football'
            ? 'vs SC Villa • 24 May 2025'
            : 'vs JT Jaguars • 24 May 2025',
      nextOpponentLogo: club.logo,
      description: template.description,
    };
  });
}

function getOtherClubs(currentClub: PublicClub) {
  return publicClubs
    .filter((club) => club.slug !== currentClub.slug)
    .slice(0, 4);
}

function getRecentResults(club: PublicClub, teams: ClubTeam[]) {
  const mainTeam = teams[0];

  return [
    {
      date: '10 MAY',
      team: mainTeam?.name ?? club.name,
      opponent: club.sport === 'Rugby' ? 'Impis RFC' : club.sport === 'Football' ? 'SC Villa' : 'JT Jaguars',
      score: club.sport === 'Basketball' ? '78 - 71' : '28 - 17',
      result: 'W',
    },
    {
      date: '03 MAY',
      team: mainTeam?.name ?? club.name,
      opponent: club.sport === 'Rugby' ? 'Betway KOBs' : club.sport === 'Football' ? 'Express FC' : 'KIU Titans',
      score: club.sport === 'Basketball' ? '69 - 74' : '19 - 22',
      result: 'L',
    },
    {
      date: '26 APR',
      team: teams[3]?.name ?? mainTeam?.name ?? club.name,
      opponent: club.sport === 'Rugby' ? 'Heathens 7s' : club.sport === 'Football' ? 'KCCA U20' : 'UCU Canons',
      score: club.sport === 'Basketball' ? '82 - 76' : '31 - 12',
      result: 'W',
    },
    {
      date: '19 APR',
      team: teams[2]?.name ?? mainTeam?.name ?? club.name,
      opponent: club.sport === 'Rugby' ? 'SC Villa U20' : club.sport === 'Football' ? 'Vipers U20' : 'Ndejje Angels',
      score: '14 - 14',
      result: 'D',
    },
  ];
}

function TeamsPage() {
  const { clubSlug } = useParams();
  const club = publicClubs.find((item) => item.slug === clubSlug) ?? publicClubs[0];
  const teams = getClubTeams(club);
  const otherClubs = getOtherClubs(club);
  const competition = getCompetitionForClub(club);
  const players = publicPlayers.filter((player) => player.clubSlug === club.slug);
  const recentResults = getRecentResults(club, teams);

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
          <p>Browse teams by club across Rugby, Football and Basketball.</p>

          <div className="club-teams-filters">
            <Link to="/clubs">All Sports</Link>
            <Link to={`/clubs?sport=${encodeURIComponent(club.sport)}`}>{club.sport}</Link>

            <label>
              <span>Select Competition</span>
              <select value={competition?.name ?? club.league} disabled>
                <option>{competition?.name ?? club.league}</option>
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
                {publicClubs.map((item) => (
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
                <img src={club.logo} alt={club.name} />
              </div>

              <div className="club-teams-club-copy">
                <h2>{club.name}</h2>
                <p>
                  <span>{club.sport}</span>
                  <span>{club.league}</span>
                  <span>{club.location}</span>
                </p>
                <small>One club. Many teams. Building champions on and off the field.</small>
              </div>

              <div className="club-teams-club-stats">
                <span>
                  <Users size={24} />
                  <strong>{teams.length}</strong>
                  Teams
                </span>
                <span>
                  <Users size={24} />
                  <strong>{teams.reduce((total, team) => total + team.squadSize, 0)}+</strong>
                  Players
                </span>
                <span>
                  <Trophy size={24} />
                  <strong>{club.trophies}</strong>
                  Trophies
                </span>
                <span>
                  <CalendarDays size={24} />
                  Since
                  <strong>{club.founded}</strong>
                </span>
              </div>
            </section>

            <div className="club-teams-section-title">
              <h2>Teams at {club.name}</h2>
              <span>{teams.length} Teams</span>
            </div>

            <section className="club-teams-grid">
              {teams.map((team) => (
                <article key={team.slug} className="club-team-card">
                  <div className="club-team-image">
                    <img src={team.image || club.logo} alt={team.name} />
                    <span>{team.tag}</span>
                  </div>

                  <div className="club-team-body">
                    <h3>{team.name}</h3>
                    <p>{team.description}</p>

                    <dl>
                      <div>
                        <dt>Head Coach</dt>
                        <dd>{team.coach}</dd>
                      </div>
                      <div>
                        <dt>Squad Size</dt>
                        <dd>{team.squadSize}</dd>
                      </div>
                    </dl>

                    <div className="club-team-footer">
                      <small>
                        <ShieldCheck size={15} />
                        Next Fixture {team.nextFixture}
                      </small>

                      <Link to={`/teams/${team.slug}/squad`}>
                        View Team
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <section className="club-teams-bottom-grid">
              <article className="club-teams-panel">
                <div className="club-teams-panel-header">
                  <h2>Featured Squad Players</h2>
                  <Link to={`/teams/${teams[0]?.slug}/squad`}>
                    View All Players <ArrowRight />
                  </Link>
                </div>

                <div className="club-teams-player-row">
                  {(players.length ? players : publicPlayers.slice(0, 4)).slice(0, 4).map((player) => (
                    <Link key={player.slug} to={`/players/${player.slug}`} className="club-teams-player-card">
                      <img src={player.image} alt={player.name} />
                      <div>
                        <strong>{player.name}</strong>
                        <span>{player.position}</span>
                      </div>
                      <b>{player.jerseyNumber}</b>
                    </Link>
                  ))}
                </div>
              </article>

              <article className="club-teams-panel">
                <div className="club-teams-panel-header">
                  <h2>Recent Team Results</h2>
                  <Link to="/results">
                    View All Results <ArrowRight />
                  </Link>
                </div>

                <div className="club-teams-result-list">
                  {recentResults.map((result) => (
                    <div key={`${result.date}-${result.team}-${result.opponent}`} className="club-teams-result-row">
                      <span>{result.date}</span>
                      <strong>{result.team}</strong>
                      <small>{result.opponent}</small>
                      <b>{result.score}</b>
                      <em className={`is-${result.result.toLowerCase()}`}>{result.result}</em>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </div>

          <aside className="club-teams-sidebar">
            <h2>Other Clubs</h2>
            <p>Select a club to view its teams and squad details.</p>

            <div className="club-teams-other-list">
              {otherClubs.map((item) => (
                <Link key={item.slug} to={`/clubs/${item.slug}/teams`}>
                  <img src={item.logo} alt={item.name} />
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.sport} Club</small>
                    <small>{item.location}</small>
                  </span>
                  <ChevronRight size={18} />
                </Link>
              ))}
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
