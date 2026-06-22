import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CalendarDays,
  ChevronRight,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { publicClubs, publicTeams } from '../../data/publicBrowseCatalog';
import './TeamSquadPage.css';

type SquadPlayer = {
  slug: string;
  name: string;
  number: number;
  position: string;
  group: 'Forwards' | 'Backs' | 'Squad';
  nationality: string;
  flag: string;
  age: number;
  apps: number;
  tries: number;
  points: number;
  status?: 'Available' | 'Out' | 'Doubtful';
  injury?: string;
  role?: 'Captain' | 'Vice Captain';
};

const seasons = ['2025/26', '2024/25', '2023/24'];

const PLAYER_AVATAR = '/assets/players/player-avatar.png';

const rugbyPositions = [
  'All Positions',
  'Prop',
  'Hooker',
  'Lock',
  'Flanker',
  '8th Man',
  'Scrum-Half',
  'Fly-Half',
  'Centre',
  'Wing',
  'Fullback',
];

const footballPositions = ['All Positions', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Winger'];
const basketballPositions = ['All Positions', 'Guard', 'Forward', 'Centre'];

const kobsPlayers: SquadPlayer[] = [
  {
    slug: 'ian-munyani',
    name: 'Ian Munyani',
    number: 14,
    position: 'Centre',
    group: 'Backs',
    nationality: 'Uganda',
    flag: '🇺🇬',
    age: 27,
    apps: 12,
    tries: 4,
    points: 20,
    role: 'Captain',
  },
  {
    slug: 'patrick-ochan',
    name: 'Patrick Ochan',
    number: 9,
    position: 'Scrum-Half',
    group: 'Backs',
    nationality: 'Uganda',
    flag: '🇺🇬',
    age: 25,
    apps: 11,
    tries: 0,
    points: 15,
  },
  {
    slug: 'james-musoke',
    name: 'James Musoke',
    number: 13,
    position: 'Prop',
    group: 'Forwards',
    nationality: 'Uganda',
    flag: '🇺🇬',
    age: 28,
    apps: 10,
    tries: 1,
    points: 5,
    role: 'Vice Captain',
  },
  {
    slug: 'pius-ogena',
    name: 'Pius Ogena',
    number: 8,
    position: '8th Man',
    group: 'Forwards',
    nationality: 'Uganda',
    flag: '🇺🇬',
    age: 26,
    apps: 12,
    tries: 2,
    points: 10,
  },
  {
    slug: 'brian-odongo',
    name: 'Brian Odongo',
    number: 11,
    position: 'Hooker',
    group: 'Forwards',
    nationality: 'Kenya',
    flag: '🇰🇪',
    age: 29,
    apps: 12,
    tries: 1,
    points: 5,
    status: 'Doubtful',
    injury: 'Ankle Injury',
  },
  {
    slug: 'robert-aziku',
    name: 'Robert Aziku',
    number: 15,
    position: 'Lock',
    group: 'Forwards',
    nationality: 'Uganda',
    flag: '🇺🇬',
    age: 26,
    apps: 11,
    tries: 1,
    points: 5,
  },
  {
    slug: 'asuman-mugerwa',
    name: 'Asuman Mugerwa',
    number: 7,
    position: 'Flanker',
    group: 'Forwards',
    nationality: 'Uganda',
    flag: '🇺🇬',
    age: 24,
    apps: 12,
    tries: 0,
    points: 0,
  },
  {
    slug: 'david-kyalo',
    name: 'David Kyalo',
    number: 10,
    position: 'Fly-Half',
    group: 'Backs',
    nationality: 'Kenya',
    flag: '🇰🇪',
    age: 25,
    apps: 10,
    tries: 3,
    points: 15,
  },
  {
    slug: 'solomon-okello',
    name: 'Solomon Okello',
    number: 6,
    position: 'Blindside',
    group: 'Forwards',
    nationality: 'Uganda',
    flag: '🇺🇬',
    age: 28,
    apps: 11,
    tries: 0,
    points: 0,
  },
  {
    slug: 'moses-aluma',
    name: 'Moses Aluma',
    number: 4,
    position: 'Lock',
    group: 'Forwards',
    nationality: 'Uganda',
    flag: '🇺🇬',
    age: 27,
    apps: 8,
    tries: 0,
    points: 0,
    status: 'Out',
    injury: 'Hamstring Injury',
  },
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildGenericPlayers(teamName: string, sport: string): SquadPlayer[] {
  const firstNames = ['Alex', 'Brian', 'Daniel', 'Emmanuel', 'Isaac', 'Joel', 'Kevin', 'Martin', 'Nicholas', 'Samuel', 'Peter', 'David'];
  const lastNames = ['Kato', 'Okello', 'Mugisha', 'Otim', 'Wasswa', 'Ochieng', 'Tumusiime', 'Nsubuga', 'Kisekka', 'Mutebi', 'Akena', 'Muwanga'];

  const positions =
    sport === 'Football'
      ? ['Goalkeeper', 'Defender', 'Defender', 'Midfielder', 'Midfielder', 'Winger', 'Forward', 'Forward']
      : sport === 'Basketball'
        ? ['Guard', 'Guard', 'Forward', 'Forward', 'Centre', 'Guard', 'Forward', 'Centre']
        : ['Prop', 'Hooker', 'Lock', 'Flanker', '8th Man', 'Scrum-Half', 'Fly-Half', 'Centre', 'Wing', 'Fullback'];

  return Array.from({ length: sport === 'Basketball' ? 10 : 16 }, (_, index) => {
    const name = `${firstNames[index % firstNames.length]} ${lastNames[(index + 3) % lastNames.length]}`;
    const position = positions[index % positions.length];

    return {
      slug: `${slugify(teamName)}-${slugify(name)}`,
      name,
      number: index + 1,
      position,
      group:
        sport === 'Rugby'
          ? index < 8
            ? 'Forwards'
            : 'Backs'
          : 'Squad',
      nationality: index % 5 === 0 ? 'Kenya' : 'Uganda',
      flag: index % 5 === 0 ? '🇰🇪' : '🇺🇬',
      age: 22 + (index % 9),
      apps: 7 + (index % 6),
      tries: sport === 'Rugby' ? index % 4 : index % 5,
      points: sport === 'Basketball' ? 8 + index * 2 : (index % 5) * 5,
      role: index === 0 ? 'Captain' : index === 1 ? 'Vice Captain' : undefined,
      status: index === 8 ? 'Doubtful' : undefined,
      injury: index === 8 ? 'Minor Knock' : undefined,
    };
  });
}


function makeFallbackTeamFromSlug(teamSlug: string | undefined) {
  if (!teamSlug) return undefined;

  const club = publicClubs
    .slice()
    .sort((a, b) => b.slug.length - a.slug.length)
    .find((item) => teamSlug === item.slug || teamSlug.startsWith(`${item.slug}-`));

  if (!club) return undefined;

  const suffix = teamSlug
    .replace(`${club.slug}-`, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return {
    slug: teamSlug,
    name: `${club.name} ${suffix || 'Squad'}`,
    clubSlug: club.slug,
    clubName: club.name,
    sport: club.sport,
    league: club.league,
    squadSize: club.sport === 'Basketball' ? 14 : club.sport === 'Football' ? 26 : 28,
    image: club.logo,
    form: ['W', 'W', 'L', 'W', 'W'],
  };
}

function getPlayersForTeam(teamSlug: string, teamName: string, sport: string) {
  if (teamSlug.includes('kobs')) return kobsPlayers;
  return buildGenericPlayers(teamName, sport);
}

function TeamSquadPage() {
  const { teamSlug } = useParams();
  const team = publicTeams.find((item) => item.slug === teamSlug) ?? makeFallbackTeamFromSlug(teamSlug);
  const club = publicClubs.find((item) => item.slug === team?.clubSlug);

  const [selectedSeason, setSelectedSeason] = useState('2025/26');
  const [selectedPosition, setSelectedPosition] = useState('All Positions');
  const [searchQuery, setSearchQuery] = useState('');

  const players = useMemo(() => {
    if (!team) return [];
    return getPlayersForTeam(team.slug, team.name, team.sport);
  }, [team]);

  const positionOptions =
    team?.sport === 'Football'
      ? footballPositions
      : team?.sport === 'Basketball'
        ? basketballPositions
        : rugbyPositions;

  const filteredPlayers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return players.filter((player) => {
      const matchesPosition =
        selectedPosition === 'All Positions' ||
        player.position === selectedPosition ||
        player.position.toLowerCase().includes(selectedPosition.toLowerCase());

      const matchesSearch =
        !query ||
        player.name.toLowerCase().includes(query) ||
        player.position.toLowerCase().includes(query) ||
        player.nationality.toLowerCase().includes(query);

      return matchesPosition && matchesSearch;
    });
  }, [players, searchQuery, selectedPosition]);

  if (!team || !club) {
    return (
      <>
        <Navbar />
        <main className="team-squad-page">
          <section className="team-squad-not-found">
            <ShieldCheck size={44} />
            <h1>Team squad not found</h1>
            <p>We could not find that squad. Return to the teams directory and choose another team.</p>
            <Link to="/teams">Back to Teams</Link>
          </section>
        </main>
      </>
    );
  }

  const featuredPlayer = filteredPlayers[0] ?? players[0];
  const rosterPlayers = filteredPlayers.filter((player) => player.slug !== featuredPlayer?.slug);
  const forwardsCount = players.filter((player) => player.group === 'Forwards').length || Math.ceil(players.length / 2);
  const backsCount = players.filter((player) => player.group === 'Backs').length || Math.floor(players.length / 2);
  const averageAge = players.length
    ? (players.reduce((total, player) => total + player.age, 0) / players.length).toFixed(1)
    : '0.0';
  const injuredPlayers = players.filter((player) => player.status === 'Out' || player.status === 'Doubtful');
  const leaders = players.filter((player) => player.role);
  const opponents = publicClubs.filter((item) => item.sport === team.sport && item.slug !== club.slug).slice(0, 1);
  const nextOpponent = opponents[0] ?? club;

  return (
    <>
      <Navbar />

      <main className="team-squad-page">
        <section className="team-squad-hero">
          <div className="team-squad-breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <Link to="/teams">Teams</Link>
            <span>›</span>
            <Link to={`/clubs/${club.slug}`}>{club.name}</Link>
            <span>›</span>
            <strong>Players &amp; Squads</strong>
          </div>

          <div className="team-squad-identity">
            <img src={club.logo} alt={club.name} />

            <div>
              <h1>{club.name}</h1>
              <p>
                {team.sport} Club <span>•</span> {team.league}
              </p>
              <p>
                Kampala, Uganda <span>•</span> Est. {club.founded}
              </p>
            </div>

            <div className="team-squad-hero-stats">
              <span>
                <Trophy size={22} />
                <strong>{club.trophies}</strong>
                <small>Trophies</small>
              </span>
              <span>
                <CalendarDays size={22} />
                <strong>{club.founded}</strong>
                <small>Founded</small>
              </span>
              <span>
                <Users size={22} />
                <strong>{club.followers}</strong>
                <small>Followers</small>
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
            <a href="#squad" className="is-active">Players &amp; Squads</a>
            <Link to="/news">News</Link>
            <Link to="/standings">Stats</Link>
          </nav>
        </section>

        <section className="team-squad-content" id="squad">
          <div className="team-squad-main">
            <div className="team-squad-filters">
              <label>
                <span>Team</span>
                <select defaultValue="Senior Men">
                  <option>Senior Men</option>
                  <option>Senior Women</option>
                  <option>Development Squad</option>
                  <option>Academy Team</option>
                </select>
              </label>

              <label>
                <span>Season</span>
                <select value={selectedSeason} onChange={(event) => setSelectedSeason(event.target.value)}>
                  {seasons.map((season) => (
                    <option key={season}>{season}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Position</span>
                <select value={selectedPosition} onChange={(event) => setSelectedPosition(event.target.value)}>
                  {positionOptions.map((position) => (
                    <option key={position}>{position}</option>
                  ))}
                </select>
              </label>

              <label className="team-squad-search">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  setSelectedPosition('All Positions');
                  setSearchQuery('');
                  setSelectedSeason('2025/26');
                }}
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>

            <div className="team-squad-roster">
              {featuredPlayer ? (
                <article className="team-squad-featured-player">
                  <span className="team-squad-featured-badge">Featured Player</span>
                  <div className="team-squad-player-silhouette">
                    <img src={PLAYER_AVATAR} alt={featuredPlayer.name} />
                  </div>
                  <div className="team-squad-featured-copy">
                    <strong>{featuredPlayer.number}</strong>
                    <h2>{featuredPlayer.name}</h2>
                    <p>{featuredPlayer.position}</p>
                    <span>{featuredPlayer.flag} {featuredPlayer.nationality}</span>
                  </div>

                  <dl>
                    <div>
                      <dt>Age</dt>
                      <dd>{featuredPlayer.age}</dd>
                    </div>
                    <div>
                      <dt>Apps</dt>
                      <dd>{featuredPlayer.apps}</dd>
                    </div>
                    <div>
                      <dt>{team.sport === 'Basketball' ? 'PPG' : team.sport === 'Football' ? 'Goals' : 'Tries'}</dt>
                      <dd>{featuredPlayer.tries}</dd>
                    </div>
                    <div>
                      <dt>Points</dt>
                      <dd>{featuredPlayer.points}</dd>
                    </div>
                  </dl>

                  <Link to={`/players/${featuredPlayer.slug}`}>
                    View Player Profile <ChevronRight size={16} />
                  </Link>
                </article>
              ) : null}

              {rosterPlayers.slice(0, 8).map((player) => (
                <article key={player.slug} className="team-squad-player-card">
                  <span className="team-squad-number">{player.number}</span>
                  <div className="team-squad-mini-silhouette">
                    <img src={PLAYER_AVATAR} alt={player.name} />
                  </div>
                  <h3>{player.name}</h3>
                  <p>{player.position}</p>
                  <span>{player.flag} {player.nationality}</span>

                  <dl>
                    <div>
                      <dt>Apps</dt>
                      <dd>{player.apps}</dd>
                    </div>
                    <div>
                      <dt>{team.sport === 'Basketball' ? 'PPG' : team.sport === 'Football' ? 'Goals' : 'Tries'}</dt>
                      <dd>{player.tries}</dd>
                    </div>
                    <div>
                      <dt>Pts</dt>
                      <dd>{player.points}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="team-squad-full-roster">
              <Link to={`/teams/${team.slug}/squad`}>
                <CalendarDays size={16} />
                View Full Roster
                <ChevronRight size={16} />
              </Link>
              <span>{players.length} Players in Squad</span>
            </div>

            <section className="team-squad-bottom-panel">
              <div>
                <h2>Recent Form <span>(Last 5 Matches)</span></h2>
                <div className="team-squad-form">
                  {team.form.map((item, index) => (
                    <article key={`${item}-${index}`}>
                      <strong className={item === 'W' ? 'is-win' : item === 'L' ? 'is-loss' : 'is-draw'}>
                        {item}
                      </strong>
                      <span>vs {['Pirates', 'Hippos', 'Heathens', 'Mongers', 'Walukuba'][index] ?? 'Rivals'}</span>
                      <small>{['28-17', '34-10', '18-21', '24-12', '31-15'][index] ?? '20-15'}</small>
                    </article>
                  ))}
                </div>
              </div>

              <div>
                <h2>Squad Strengths</h2>
                <div className="team-squad-strengths">
                  <span>Set Pieces <strong>Strong</strong></span>
                  <span>Defence <strong>Very Strong</strong></span>
                  <span>Discipline <strong>Good</strong></span>
                </div>
              </div>
            </section>
          </div>

          <aside className="team-squad-side">
            <section className="team-squad-side-card">
              <h2>Squad Overview</h2>

              <div className="team-squad-overview-stats">
                <span>
                  <small>Forwards</small>
                  <strong>{forwardsCount}</strong>
                </span>
                <span>
                  <small>Backs</small>
                  <strong>{backsCount}</strong>
                </span>
                <span>
                  <small>Average Age</small>
                  <strong>{averageAge}</strong>
                </span>
              </div>

              <div className="team-squad-injuries">
                <h3>
                  Injuries / Unavailable
                  <span>{injuredPlayers.length}</span>
                </h3>

                {injuredPlayers.length ? (
                  injuredPlayers.slice(0, 2).map((player) => (
                    <article key={player.slug}>
                      <ShieldAlert size={16} />
                      <div>
                        <strong>{player.name}</strong>
                        <small>{player.injury}</small>
                      </div>
                      <span>{player.status}</span>
                    </article>
                  ))
                ) : (
                  <p>No current injuries reported.</p>
                )}
              </div>
            </section>

            <section className="team-squad-side-card">
              <h2>Leadership</h2>

              <div className="team-squad-leaders">
                {leaders.map((player) => (
                  <article key={player.slug}>
                    <div className="team-squad-leader-photo">
                      <img src={PLAYER_AVATAR} alt={player.name} />
                    </div>
                    <div>
                      <small>{player.role}</small>
                      <strong>{player.name}</strong>
                    </div>
                    <span>{player.number}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="team-squad-side-card">
              <h2>Next Match</h2>

              <div className="team-squad-next-match">
                <img src={club.logo} alt={club.name} />
                <div>
                  <strong>vs {nextOpponent.name}</strong>
                  <span>{team.league}</span>
                  <small>Sun, 25 May 2025 • 4:00 PM</small>
                  <small>Legends Rugby Grounds, Kampala</small>
                </div>
                <img src={nextOpponent.logo} alt={nextOpponent.name} />
              </div>

              <Link to="/fixtures">
                View Match Centre <ChevronRight size={16} />
              </Link>
            </section>
          </aside>
        </section>
      </main>
    </>
  );
}

export default TeamSquadPage;
