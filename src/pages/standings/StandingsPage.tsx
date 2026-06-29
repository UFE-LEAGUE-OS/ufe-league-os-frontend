import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Share2,
  Shield,
  Star,
  Trophy,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { competitionStandings, publicClubs } from '../../data/publicBrowseCatalog';
import styles from './StandingsPage.module.css';

function StandingsPage() {
  const [selectedSport, setSelectedSport] = useState('Rugby');
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('nile-special-rugby');
  const [selectedRound, setSelectedRound] = useState('All Rounds');

  const competitionsBySport = useMemo(() => {
    return competitionStandings.filter((competition) => competition.sport === selectedSport);
  }, [selectedSport]);

  const selectedCompetition =
    competitionsBySport.find((competition) => competition.id === selectedCompetitionId) ??
    competitionsBySport[0] ??
    competitionStandings[0];

  const rows = useMemo(() => selectedCompetition?.rows ?? [], [selectedCompetition]);

  const topPerformers = useMemo(() => {
    const leaders = {
      'nile-special-rugby': [
        ['Ian Munyani', 'KCB Kobs', 12],
        ['Peter Olouch', 'Platinum Heathens', 10],
        ['John Wokorach', 'Black Pirates', 9],
        ['James Odongo', 'Hippos Rugby', 8],
        ['Aaron Ofwoyoth', 'Mongers RC', 8],
      ],
      'enterprise-cup': [
        ['Pius Ogena', 'KCB Kobs', 7],
        ['Ivan Magomu', 'Black Pirates', 6],
        ['Brian Odongo', 'KCB Kobs', 5],
        ['James Musoke', 'Platinum Heathens', 4],
      ],
      'uganda-premier-league': [
        ['Muhammad Shaban', 'KCCA FC', 11],
        ['Patrick Kakande', 'SC Villa', 9],
        ['Milton Karisa', 'Vipers SC', 8],
        ['Allan Okello', 'KCCA FC', 8],
        ['Eric Kambale', 'Express FC', 7],
      ],
      'national-basketball': [
        ['Jimmy Enabu', 'City Oilers', 24],
        ['Deng Geu', 'City Oilers', 21],
        ['Tony Drileba', 'City Oilers', 19],
        ['Peter Cheng', 'Namuwongo Blazers', 18],
        ['Adam Seiko', 'Namuwongo Blazers', 17],
      ],
      'budo-league': [
        ['Keith Seruyange', 'Midnight Express', 9],
        ['Brian Kato', 'Dujay FC', 8],
        ['Dennis Kizza', 'Tooro Titans', 7],
        ['Mark Opio', 'Fort Hoops', 6],
      ],
    } as Record<string, Array<[string, string, number]>>;

    return leaders[selectedCompetition?.id ?? ''] ?? leaders['nile-special-rugby'];
  }, [selectedCompetition?.id]);

  const seasonStats = useMemo(() => {
    const matchesPlayed = rows.reduce((total, row) => total + row.played, 0);
    const totalPoints = rows.reduce((total, row) => total + row.pf, 0);
    const totalTriesOrGoals = rows.reduce((total, row) => total + row.won, 0);

    return {
      totalMatches: rows.length * 15,
      matchesPlayed,
      totalPoints,
      totalTriesOrGoals,
      averagePoints: rows.length ? Math.round(totalPoints / rows.length) : 0,
    };
  }, [rows]);

  function handleSportChange(nextSport: string) {
    const nextCompetitions = competitionStandings.filter((competition) => competition.sport === nextSport);

    setSelectedSport(nextSport);
    setSelectedCompetitionId(nextCompetitions[0]?.id ?? '');
  }

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <div className={styles.breadcrumb}>
          <Link to="/">Home</Link>
          <span>›</span>
          <span>Competitions</span>
          <span>›</span>
          <strong>{selectedCompetition?.name}</strong>
          <span>›</span>
          <strong>Standings</strong>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <section className={styles.sideCard}>
              <h2>Competitions</h2>

              <label className={styles.field}>
                <span>Sport</span>
                <select value={selectedSport} onChange={(event) => handleSportChange(event.target.value)}>
                  <option>Rugby</option>
                  <option>Football</option>
                  <option>Basketball</option>
                </select>
              </label>

              <div className={styles.competitionList}>
                <button type="button" className={styles.sideLink}>
                  <ClipboardList size={16} />
                  All Competitions
                </button>

                {competitionsBySport.map((competition) => (
                  <button
                    key={competition.id}
                    type="button"
                    className={`${styles.sideLink} ${
                      competition.id === selectedCompetition?.id ? styles.activeSideLink : ''
                    }`}
                    onClick={() => setSelectedCompetitionId(competition.id)}
                  >
                    <Shield size={16} />
                    {competition.name}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.sideCard}>
              <h2>Filters</h2>

              <label className={styles.field}>
                <span>Season</span>
                <select defaultValue="2025/26">
                  <option>2025/26</option>
                  <option>2024/25</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>Round</span>
                <select value={selectedRound} onChange={(event) => setSelectedRound(event.target.value)}>
                  <option>All Rounds</option>
                  <option>Current Round</option>
                  <option>Completed Rounds</option>
                </select>
              </label>
            </section>

            <section className={styles.ctaCard}>
              <h2>Follow your favorite teams</h2>
              <p>Get real-time updates and never miss a moment.</p>
              <Link to="/clubs">
                Explore Clubs
                <span>→</span>
              </Link>
            </section>
          </aside>

          <section className={styles.mainContent}>
            <section className={styles.hero}>
              <div className={styles.competitionLogo}>
                <img src={selectedCompetition?.logo} alt={selectedCompetition?.name} />
              </div>

              <div>
                <span className={styles.badge}>{selectedCompetition?.sport}</span>
                <h1>{selectedCompetition?.name}</h1>
                <p>{selectedCompetition?.season} Season</p>
              </div>

              <div className={styles.heroActions}>
                <Link to="/clubs">
                  <Star size={18} />
                  Follow Competition
                </Link>
                <button type="button">
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </section>

            <nav className={styles.tabs}>
              <Link to="/competitions">Overview</Link>
              <Link to="/fixtures">Fixtures</Link>
              <Link to="/results">Results</Link>
              <span className={styles.activeTab}>Standings</span>
              <a href="#top-performers">Top Scorers</a>
              <Link to="/news">News</Link>
            </nav>

            <div className={styles.contentGrid}>
              <section className={styles.tableCard}>
                <div className={styles.tableHeader}>
                  <div>
                    <h2>League Standings</h2>
                    <p>
                      Last updated: 18 May 2025, 10:30 AM
                      {selectedRound !== 'All Rounds' ? ` · ${selectedRound}` : ''}
                    </p>
                  </div>

                  <div className={styles.legend}>
                    <span><i className={styles.greenDot} /> Qualified for Playoffs</span>
                    <span><i className={styles.blueDot} /> Current Round</span>
                    <span><i className={styles.redDot} /> Relegation Zone</span>
                  </div>
                </div>

                <div className={styles.tableWrap}>
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Club</th>
                        <th>P</th>
                        <th>W</th>
                        <th>D</th>
                        <th>L</th>
                        <th>PF</th>
                        <th>PA</th>
                        <th>PD</th>
                        <th>PTS</th>
                        <th>Form</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((row) => {
                        const club = publicClubs.find((item) => item.slug === row.slug);

                        return (
                          <tr key={row.slug}>
                            <td>
                              <span className={styles.position}>{row.position}</span>
                            </td>
                            <td>
                              <Link to={`/clubs/${row.slug}`} className={styles.clubCell}>
                                {club?.logo ? <img src={club.logo} alt="" /> : null}
                                <strong>{club?.name ?? row.club}</strong>
                              </Link>
                            </td>
                            <td>{row.played}</td>
                            <td>{row.won}</td>
                            <td>{row.drawn}</td>
                            <td>{row.lost}</td>
                            <td>{row.pf}</td>
                            <td>{row.pa}</td>
                            <td>{row.pd}</td>
                            <td>
                              <strong className={styles.points}>{row.points}</strong>
                            </td>
                            <td>
                              <span className={styles.formRow}>
                                {row.form.map((result, index) => (
                                  <span
                                    key={`${row.slug}-${result}-${index}`}
                                    className={`${styles.formBadge} ${
                                      result === 'W'
                                        ? styles.win
                                        : result === 'L'
                                          ? styles.loss
                                          : styles.draw
                                    }`}
                                  >
                                    {result}
                                  </span>
                                ))}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className={styles.infoCards}>
                  <article>
                    <Trophy size={28} />
                    <div>
                      <h3>Qualification</h3>
                      <p>Top 4 teams qualify for the Premiership Playoffs.</p>
                    </div>
                  </article>

                  <article>
                    <Shield size={28} />
                    <div>
                      <h3>Relegation</h3>
                      <p>Bottom 2 teams will be relegated or enter playoffs.</p>
                    </div>
                  </article>
                </div>
              </section>

              <aside className={styles.rightRail}>
                <section className={styles.sideCard}>
                  <h2>Season Stats</h2>

                  <div className={styles.statList}>
                    <span>Total Matches <strong>{seasonStats.totalMatches}</strong></span>
                    <span>Matches Played <strong>{seasonStats.matchesPlayed}</strong></span>
                    <span>Total Points <strong>{seasonStats.totalPoints}</strong></span>
                    <span>Average Points <strong>{seasonStats.averagePoints}</strong></span>
                  </div>
                </section>

                <section className={styles.sideCard} id="top-performers">
                  <h2>Top Performers</h2>

                  <div className={styles.performerTabs}>
                    <button type="button" className={styles.activePerformerTab}>Tries</button>
                    <button type="button">Points</button>
                    <button type="button">MOTM</button>
                  </div>

                  <div className={styles.performerList}>
                    {topPerformers.map(([name, club, stat], index) => (
                      <article key={name}>
                        <span>{index + 1}</span>
                        <div>
                          <strong>{name}</strong>
                          <small>{club}</small>
                        </div>
                        <b>{stat}</b>
                      </article>
                    ))}
                  </div>
                </section>
              </aside>
            </div>

            <section className={styles.bottomCta}>
              <Trophy size={58} />
              <div>
                <h2>Never miss a moment</h2>
                <p>Follow your favorite clubs and get notified about matches, results, and standings movement.</p>
              </div>
              <Link to="/clubs">
                Follow Your Clubs
                <span>→</span>
              </Link>
            </section>

            <section className={styles.bottomCta} style={{ marginTop: '1rem' }}>
              <div className={styles.competitionLogo}>
                <img src="https://img.icons8.com/fluency/96/fantasy.png" alt="" style={{ width: 58, height: 58 }} />
              </div>
              <div>
                <h2>Build your fantasy team</h2>
                <p>Pick real players from these standings and compete in fantasy leagues.</p>
              </div>
              <Link to="/fantasy">
                Play Fantasy
                <span>→</span>
              </Link>
            </section>
          </section>
        </div>
        <Footer />
      </main>
    </>
  );
}

export default StandingsPage;