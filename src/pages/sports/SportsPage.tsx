 import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Shield,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import { GiRugbyConversion, GiSoccerBall } from 'react-icons/gi';
import { MdSportsBasketball } from 'react-icons/md';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { competitionStandings, publicClubs, publicTeams } from '../../data/publicBrowseCatalog';
import './SportsPage.css';

type SportName = 'Rugby' | 'Football' | 'Basketball';

type SportConfig = {
  name: SportName;
  imageUrl: string;
  tagline: string;
  description: string;
  accentClass: string;
};

const sports: SportConfig[] = [
  {
    name: 'Rugby',
    imageUrl: '/assets/sports/rugby-promo.png',
    tagline: 'Strength. Passion. Unity.',
    description: 'Experience the power and tradition of Ugandan rugby. From the Premiership to sevens and cup finals.',
    accentClass: 'is-rugby',
  },
  {
    name: 'Football',
    imageUrl: '/assets/sports/football-promo.png',
    tagline: 'The world’s game.',
    description: 'The heartbeat of the nation. Follow Uganda’s top leagues, clubs and rising talent.',
    accentClass: 'is-football',
  },
  {
    name: 'Basketball',
    imageUrl: '/assets/sports/basketball-promo.png',
    tagline: 'Fast. Fierce. Focused.',
    description: 'High-flying action on the court. Follow Uganda’s best teams and stars.',
    accentClass: 'is-basketball',
  },
];

const extraCompetitions: Record<SportName, string[]> = {
  Rugby: ['Rugby Championship 7s', 'Uganda Cup', 'Enterprise Cup'],
  Football: ['Uganda Premier League', 'FUFA Big League', 'Budo League', 'Community Football'],
  Basketball: ['National Basketball League', 'FUBA Division One', 'FUBA Cup'],
};

const fixtureData: Record<SportName, Array<[string, string, string, string]>> = {
  Rugby: [
    ['Kobs vs Heathens', 'Nile Special Premiership', '25 MAY', '4:00 PM'],
    ['Buffaloes vs Pirates', 'Nile Special Premiership', '26 MAY', '2:00 PM'],
    ['Hippos vs Rams', 'Rugby Championship 7s', '01 JUN', '10:00 AM'],
  ],
  Football: [
    ['Vipers vs KCCA FC', 'Uganda Premier League', '24 MAY', '4:00 PM'],
    ['SC Villa vs Express FC', 'Uganda Premier League', '25 MAY', '2:00 PM'],
    ['URA FC vs BUL FC', 'Uganda Premier League', '01 JUN', '4:00 PM'],
  ],
  Basketball: [
    ['City Oilers vs JT Jaguars', 'National Basketball League', '24 MAY', '7:00 PM'],
    ['UCU Canons vs KIU Titans', 'National Basketball League', '25 MAY', '5:00 PM'],
    ['Betway Power vs Ndejje', 'National Basketball League', '31 MAY', '7:00 PM'],
  ],
};

function getFallbackLogo(sport: SportName) {
  return publicClubs.find((club) => club.sport === sport)?.logo ?? '/assets/logos/league-os-horizontal.png';
}

function getSportStats(sport: SportName) {
  const clubs = publicClubs.filter((club) => club.sport === sport);
  const teams = publicTeams.filter((team) => team.sport === sport);
  const competitions = competitionStandings.filter((competition) => competition.sport === sport);
  const fallbackLogo = getFallbackLogo(sport);

  const displayCompetitions = [
    ...competitions.map((competition) => ({
      name: competition.name,
      description: `${competition.season} season standings.`,
      logo: competition.logo || fallbackLogo,
    })),
    ...extraCompetitions[sport].map((name) => ({
      name,
      description:
        sport === 'Rugby'
          ? 'Fast, fierce, Ugandan rugby action.'
          : sport === 'Football'
            ? 'Top football pathways and community competition.'
            : 'Knockout action and league basketball.',
      logo: fallbackLogo,
    })),
  ];

  return {
    clubs,
    teams,
    competitions: displayCompetitions,
    competitionCount: sport === 'Rugby' ? '12+' : sport === 'Football' ? '35+' : '10+',
    clubCount: sport === 'Rugby' ? '68+' : sport === 'Football' ? '240+' : '48+',
    fans: sport === 'Rugby' ? '120K+' : sport === 'Football' ? '1.2M+' : '80K+',
    liveFixtures: sport === 'Rugby' ? '24' : sport === 'Football' ? '58' : '18',
  };
}

function SportsPage() {
  return (
    <>
      <Navbar />

      <main className="sports-page">
        <section className="sports-hero">
          <div className="sports-breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <strong>Sport</strong>
          </div>

          <div className="sports-hero-layout">
            <div className="sports-hero-copy">
              <h1>Browse Sports</h1>
              <p>Explore Rugby, Football and Basketball across Uganda.</p>
              <span>
                Discover competitions, clubs, fixtures and standings. Follow your teams and never miss the action.
              </span>
            </div>

            <div className="sports-hero-cards">
              {sports.map((sport) => (
                <Link
                  key={sport.name}
                  to={`/clubs?sport=${encodeURIComponent(sport.name)}`}
                  className={`sports-hero-card ${sport.accentClass}`}
                >
                  <img src={sport.imageUrl} alt={sport.name} />
                  <div>
                    <h2>{sport.name}</h2>
                    <p>{sport.tagline}</p>
                    <span>
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="sports-glance">
          <h2>Uganda Sports At a Glance</h2>

          <div className="sports-glance-grid">
            {sports.map((sport) => {
              const stats = getSportStats(sport.name);

              return (
                <article key={sport.name}>
                  <div className={`sports-glance-icon ${sport.accentClass}`}>
                    {sport.name === 'Rugby' ? <GiRugbyConversion size={36} /> : sport.name === 'Football' ? <GiSoccerBall size={36} /> : <MdSportsBasketball size={36} />}
                  </div>

                  <div className="sports-glance-content">
                    <h3>{sport.name}</h3>

                    <dl>
                      <div>
                        <dt>{stats.competitionCount}</dt>
                        <dd>Competitions</dd>
                      </div>
                      <div>
                        <dt>{stats.clubCount}</dt>
                        <dd>Clubs</dd>
                      </div>
                      <div>
                        <dt>{stats.fans}</dt>
                        <dd>Fans</dd>
                      </div>
                      <div>
                        <dt>{stats.liveFixtures}</dt>
                        <dd>Live Fixtures</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="sports-section-list">
          {sports.map((sport) => {
            const stats = getSportStats(sport.name);
            const fixtures = fixtureData[sport.name];

            return (
              <article key={sport.name} className="sports-section-card">
                <div className={`sports-section-intro ${sport.accentClass}`}>
                  <div className="sports-section-symbol">
                    {sport.name === 'Rugby' ? <GiRugbyConversion size={28} /> : sport.name === 'Football' ? <GiSoccerBall size={28} /> : <MdSportsBasketball size={28} />}
                  </div>

                  <h2>{sport.name}</h2>
                  <p>{sport.description}</p>

                  <Link to={`/clubs?sport=${encodeURIComponent(sport.name)}`}>
                    Explore {sport.name}
                    <ArrowRight size={16} />
                  </Link>
                </div>

                <div className="sports-panel">
                  <div className="sports-panel-header">
                    <h3>Featured Competitions</h3>
                    <Link to="/standings">View all</Link>
                  </div>

                  {stats.competitions.slice(0, 4).map((competition) => (
                    <Link key={`${sport.name}-${competition.name}`} to="/standings" className="sports-list-item">
                      <img src={competition.logo} alt="" />
                      <div>
                        <strong>{competition.name}</strong>
                        <span>{competition.description}</span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="sports-panel">
                  <div className="sports-panel-header">
                    <h3>Featured Clubs</h3>
                    <Link to={`/clubs?sport=${encodeURIComponent(sport.name)}`}>View all</Link>
                  </div>

                  {stats.clubs.slice(0, 4).map((club) => (
                    <Link key={club.slug} to={`/clubs/${club.slug}`} className="sports-list-item">
                      <img src={club.logo} alt="" />
                      <div>
                        <strong>{club.name}</strong>
                        <span>{club.location}</span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="sports-panel">
                  <div className="sports-panel-header">
                    <h3>Upcoming Fixtures</h3>
                    <Link to="/fixtures">View all</Link>
                  </div>

                  {fixtures.map((fixture) => (
                    <Link key={`${sport.name}-${fixture[0]}`} to="/fixtures" className="sports-fixture-item">
                      <time>
                        <strong>{fixture[2].split(' ')[0]}</strong>
                        <span>{fixture[2].split(' ')[1]}</span>
                      </time>

                      <div>
                        <strong>{fixture[0]}</strong>
                        <span>{fixture[1]}</span>
                        <small>{fixture[3]}</small>
                      </div>
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </section>

        <section className="sports-browse">
          <h2>Browse by</h2>

          <div className="sports-browse-grid">
            <Link to="/standings">
              <Trophy size={36} />
              <strong>Standings</strong>
              <span>Check league tables</span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/clubs">
              <Shield size={36} />
              <strong>Clubs</strong>
              <span>Explore all clubs</span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/clubs">
              <Users size={36} />
              <strong>Teams</strong>
              <span>Find teams under clubs</span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/fixtures">
              <CalendarDays size={36} />
              <strong>Fixtures</strong>
              <span>Upcoming matches</span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/competitions">
              <Star size={36} />
              <strong>Fantasy Leagues</strong>
              <span>Play and compete</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <section className="sports-actions">
          <div>
            <h2>What You Can Do</h2>
            <p>Your game. Your way. Everything you need in one place.</p>
          </div>

          <Link to="/clubs">Browse Clubs</Link>
          <Link to="/standings">View Standings</Link>
          <Link to="/clubs" data-auth-required data-auth-action="follow">Follow Teams</Link>
          <Link to="/tickets" data-auth-required data-auth-action="tickets">Buy Tickets</Link>
          <Link to="/competitions" data-auth-required data-auth-action="fantasy">Join Fantasy</Link>
        </section>

        <Footer />
      </main>
    </>
  );
}

export default SportsPage;