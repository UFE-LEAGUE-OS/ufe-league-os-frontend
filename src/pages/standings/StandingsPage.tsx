import { useEffect, useMemo, useState } from 'react';
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
import {
  getPublicClubs,
  getPublicCompetitions,
  getPublicStandings,
  type PublicClubApi,
  type PublicCompetitionApi,
  type PublicStandingApi,
} from '../../services/publicDashboardService';
import styles from './StandingsPage.module.css';

interface CompetitionStandingTable {
  competition: PublicCompetitionApi;
  rows: PublicStandingApi[];
  sport: string;
  sportDisplay: string;
}

function normalizeSport(value?: string) {
  return value?.trim().toUpperCase() || 'OTHER';
}

function formatSportLabel(value?: string) {
  const normalized = normalizeSport(value);

  return normalized
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getFormArray(form?: PublicStandingApi['form']): string[] {
  if (Array.isArray(form)) {
    return form.filter(Boolean).map((item) => String(item).trim().toUpperCase());
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

function buildClubLookup(clubs: PublicClubApi[]) {
  return new Map(clubs.map((club) => [club.slug, club]));
}

function getCompetitionSport(rows: PublicStandingApi[], clubLookup: Map<string, PublicClubApi>) {
  const firstClub = rows
    .map((row) => clubLookup.get(row.club_slug))
    .find((club): club is PublicClubApi => Boolean(club));

  const sport = normalizeSport(firstClub?.sport);

  return {
    sport,
    sportDisplay: firstClub?.sport_display || formatSportLabel(sport),
  };
}

function StandingsPage() {
  const [tables, setTables] = useState<CompetitionStandingTable[]>([]);
  const [clubs, setClubs] = useState<PublicClubApi[]>([]);
  const [selectedSport, setSelectedSport] = useState('All Sports');
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<number | null>(null);
  const [selectedSeason, setSelectedSeason] = useState('All Seasons');
  const [selectedRound, setSelectedRound] = useState('All Rounds');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStandings() {
      try {
        setIsLoading(true);
        setError(null);

        const [competitionData, clubData] = await Promise.all([
          getPublicCompetitions(),
          getPublicClubs(),
        ]);

        const clubLookup = buildClubLookup(clubData);

        const loadedTables = await Promise.all(
          competitionData.map(async (competition) => {
            const rows = await getPublicStandings(competition.id);
            const sportDetails = getCompetitionSport(rows, clubLookup);

            return {
              competition,
              rows,
              ...sportDetails,
            } satisfies CompetitionStandingTable;
          }),
        );

        if (!isMounted) {
          return;
        }

        const tablesWithRows = loadedTables.filter((table) => table.rows.length > 0);

        setClubs(clubData);
        setTables(tablesWithRows);
        setSelectedCompetitionId((current) => current ?? tablesWithRows[0]?.competition.id ?? null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load backend standings data.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadStandings();

    return () => {
      isMounted = false;
    };
  }, []);

  const clubLookup = useMemo(() => buildClubLookup(clubs), [clubs]);

  const seasons = useMemo(() => {
    const values = tables
      .map((table) => table.competition.season)
      .filter((season): season is string => Boolean(season));

    return ['All Seasons', ...Array.from(new Set(values))];
  }, [tables]);

  const sportOptions = useMemo(() => {
    const values = tables.map((table) => table.sportDisplay).filter(Boolean);

    return ['All Sports', ...Array.from(new Set(values))];
  }, [tables]);

  const filteredCompetitions = useMemo(() => {
    return tables.filter((table) => {
      const sportMatches = selectedSport === 'All Sports' || table.sportDisplay === selectedSport;
      const seasonMatches = selectedSeason === 'All Seasons' || table.competition.season === selectedSeason;

      return sportMatches && seasonMatches;
    });
  }, [selectedSeason, selectedSport, tables]);

  useEffect(() => {
    if (!filteredCompetitions.length) {
      setSelectedCompetitionId(null);
      return;
    }

    const selectedExists = filteredCompetitions.some(
      (table) => table.competition.id === selectedCompetitionId,
    );

    if (!selectedExists) {
      setSelectedCompetitionId(filteredCompetitions[0].competition.id);
    }
  }, [filteredCompetitions, selectedCompetitionId]);

  const selectedTable = useMemo(() => {
    return (
      filteredCompetitions.find((table) => table.competition.id === selectedCompetitionId) ??
      filteredCompetitions[0] ??
      null
    );
  }, [filteredCompetitions, selectedCompetitionId]);

  const selectedCompetition = selectedTable?.competition ?? null;
  const rows = selectedTable?.rows ?? [];

  const tableLeaders = useMemo(() => {
    return [...rows]
      .sort((first, second) => {
        if (second.points !== first.points) return second.points - first.points;
        if (second.goal_difference !== first.goal_difference) {
          return second.goal_difference - first.goal_difference;
        }
        return second.goals_for - first.goals_for;
      })
      .slice(0, 5);
  }, [rows]);

  const seasonStats = useMemo(() => {
    const totalTeamAppearances = rows.reduce((total, row) => total + row.played, 0);
    const totalPointsFor = rows.reduce((total, row) => total + row.goals_for, 0);
    const totalWins = rows.reduce((total, row) => total + row.won, 0);

    return {
      totalMatches: Math.round(totalTeamAppearances / 2),
      teams: rows.length,
      totalPointsFor,
      totalWins,
      averagePointsFor: rows.length ? Math.round(totalPointsFor / rows.length) : 0,
    };
  }, [rows]);

  function handleSportChange(nextSport: string) {
    setSelectedSport(nextSport);
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
          <strong>{selectedCompetition?.name ?? 'Backend Standings'}</strong>
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
                  {sportOptions.map((sport) => (
                    <option key={sport}>{sport}</option>
                  ))}
                </select>
              </label>

              <div className={styles.competitionList}>
                <button type="button" className={styles.sideLink} onClick={() => setSelectedSport('All Sports')}>
                  <ClipboardList size={16} />
                  All Competitions
                </button>

                {filteredCompetitions.map((table) => (
                  <button
                    key={table.competition.id}
                    type="button"
                    className={`${styles.sideLink} ${
                      table.competition.id === selectedCompetition?.id ? styles.activeSideLink : ''
                    }`}
                    onClick={() => setSelectedCompetitionId(table.competition.id)}
                  >
                    <Shield size={16} />
                    {table.competition.name}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.sideCard}>
              <h2>Filters</h2>

              <label className={styles.field}>
                <span>Season</span>
                <select value={selectedSeason} onChange={(event) => setSelectedSeason(event.target.value)}>
                  {seasons.map((season) => (
                    <option key={season}>{season}</option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span>Round</span>
                <select value={selectedRound} onChange={(event) => setSelectedRound(event.target.value)}>
                  <option>All Rounds</option>
                  <option disabled>Round filtering pending backend API</option>
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
              <div className={styles.competitionLogo} aria-hidden="true">
                <Trophy size={54} />
              </div>

              <div>
                <span className={styles.badge}>{selectedTable?.sportDisplay ?? 'Backend'}</span>
                <h1>{selectedCompetition?.name ?? 'League Standings'}</h1>
                <p>{selectedCompetition?.season ?? 'Database-backed standings'}</p>
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
              <a href="#top-performers">Top Clubs</a>
              <Link to="/news">News</Link>
            </nav>

            <div className={styles.contentGrid}>
              <section className={styles.tableCard}>
                <div className={styles.tableHeader}>
                  <div>
                    <h2>League Standings</h2>
                    <p>
                      Source: backend database
                      {selectedRound !== 'All Rounds' ? ` · ${selectedRound}` : ''}
                    </p>
                  </div>

                  <div className={styles.legend}>
                    <span><i className={styles.greenDot} /> Top positions</span>
                    <span><i className={styles.blueDot} /> Current table</span>
                    <span><i className={styles.redDot} /> Lower table</span>
                  </div>
                </div>

                {isLoading ? (
                  <div className={styles.sideCard}>
                    <h2>Loading standings</h2>
                    <p>Fetching competition tables from the backend.</p>
                  </div>
                ) : error ? (
                  <div className={styles.sideCard}>
                    <h2>Could not load standings</h2>
                    <p>{error}</p>
                  </div>
                ) : rows.length ? (
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
                          const club = clubLookup.get(row.club_slug);
                          const formItems = getFormArray(row.form);

                          return (
                            <tr key={`${selectedCompetition?.id}-${row.club_slug}`}>
                              <td>
                                <span className={styles.position}>{row.position}</span>
                              </td>
                              <td>
                                <Link to={`/clubs/${row.club_slug}`} className={styles.clubCell}>
                                  {club?.logo_url ? <img src={club.logo_url} alt="" /> : null}
                                  <strong>{row.club_name}</strong>
                                </Link>
                              </td>
                              <td>{row.played}</td>
                              <td>{row.won}</td>
                              <td>{row.drawn}</td>
                              <td>{row.lost}</td>
                              <td>{row.goals_for}</td>
                              <td>{row.goals_against}</td>
                              <td>{row.goal_difference}</td>
                              <td>
                                <strong className={styles.points}>{row.points}</strong>
                              </td>
                              <td>
                                <span className={styles.formRow}>
                                  {formItems.length ? (
                                    formItems.map((result, index) => (
                                      <span
                                        key={`${row.club_slug}-${result}-${index}`}
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
                                    ))
                                  ) : (
                                    <span>—</span>
                                  )}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={styles.sideCard}>
                    <h2>No standings found</h2>
                    <p>The backend returned no standings for the selected competition.</p>
                  </div>
                )}

                <div className={styles.infoCards}>
                  <article>
                    <Trophy size={28} />
                    <div>
                      <h3>Database table</h3>
                      <p>Positions, records, points and form are loaded from the backend standings endpoint.</p>
                    </div>
                  </article>

                  <article>
                    <Shield size={28} />
                    <div>
                      <h3>Competition rules</h3>
                      <p>Qualification and relegation rules need a backend rules API before they are shown here.</p>
                    </div>
                  </article>
                </div>
              </section>

              <aside className={styles.rightRail}>
                <section className={styles.sideCard}>
                  <h2>Season Stats</h2>

                  <div className={styles.statList}>
                    <span>Teams <strong>{seasonStats.teams}</strong></span>
                    <span>Matches Played <strong>{seasonStats.totalMatches}</strong></span>
                    <span>Total PF <strong>{seasonStats.totalPointsFor}</strong></span>
                    <span>Total Wins <strong>{seasonStats.totalWins}</strong></span>
                    <span>Average PF <strong>{seasonStats.averagePointsFor}</strong></span>
                  </div>
                </section>

                <section className={styles.sideCard} id="top-performers">
                  <h2>Top Clubs</h2>

                  <div className={styles.performerTabs}>
                    <button type="button" className={styles.activePerformerTab}>Points</button>
                    <button type="button" disabled>Scorers API Pending</button>
                    <button type="button" disabled>MOTM API Pending</button>
                  </div>

                  <div className={styles.performerList}>
                    {tableLeaders.map((row, index) => (
                      <article key={`${row.club_slug}-leader`}>
                        <span>{index + 1}</span>
                        <div>
                          <strong>{row.club_name}</strong>
                          <small>{row.won}W · {row.drawn}D · {row.lost}L</small>
                        </div>
                        <b>{row.points}</b>
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
              <Trophy size={58} />
              <div>
                <h2>Build your fantasy team</h2>
                <p>Fantasy player data needs to be connected to the backend fantasy player endpoints next.</p>
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
