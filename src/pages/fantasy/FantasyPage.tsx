import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Gamepad2,
  Medal,
  RefreshCw,
  Trophy,
  User,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import styles from './FantasyPage.module.css';
import fantasyHero from '../../assets/fantasylandingpage.png';
import { fetchFantasyOverview } from '../../services/fantasyService';
import type {
  FantasyCompetitionOverview,
  FantasyOverview,
} from '../../services/fantasyService';

type TabId =
  | 'overview'
  | 'myteam'
  | 'leagues'
  | 'players'
  | 'standings';

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: <User size={24} />,
    title: 'Pick Your Squad',
    desc: 'Select players within your competition budget.',
  },
  {
    step: 2,
    icon: <CalendarDays size={24} />,
    title: 'Set Your Lineup',
    desc: 'Choose your captain and starting lineup each gameweek.',
  },
  {
    step: 3,
    icon: <BarChart3 size={24} />,
    title: 'Earn Points',
    desc: 'Players score points from real match performance.',
  },
  {
    step: 4,
    icon: <RefreshCw size={24} />,
    title: 'Manage Your Team',
    desc: 'Update your squad before each gameweek deadline.',
  },
  {
    step: 5,
    icon: <Trophy size={24} />,
    title: 'Climb The Rankings',
    desc: 'Compete in public and private fantasy leagues.',
  },
];

const STATUS_STYLE: Record<
  string,
  { bg: string; color: string }
> = {
  OPEN: {
    bg: 'rgba(34,197,94,0.15)',
    color: '#22c55e',
  },
  LOCKED: {
    bg: 'rgba(249,115,22,0.15)',
    color: '#fb923c',
  },
  UPCOMING: {
    bg: 'rgba(156,163,175,0.12)',
    color: '#9ca3af',
  },
  COMPLETED: {
    bg: 'rgba(59,130,246,0.15)',
    color: '#60a5fa',
  },
};

const SPORT_ACCENT: Record<string, string> = {
  RUGBY: '#8135FA',
  FOOTBALL: '#2563eb',
  BASKETBALL: '#f97316',
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-UG').format(value);
}

function formatPoints(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? formatNumber(parsed)
    : '0';
}

function formatDeadline(value?: string | null) {
  if (!value) {
    return 'No deadline set';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'Deadline unavailable';
  }

  return new Intl.DateTimeFormat('en-UG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Kampala',
    timeZoneName: 'short',
  }).format(parsed);
}

function competitionAccent(
  competition: FantasyCompetitionOverview,
) {
  return SPORT_ACCENT[competition.sport] ?? '#8135FA';
}

const emptyOverview: FantasyOverview = {
  competitions: [],
  public_leagues: [],
  featured_players: [],
  leaderboard: [],
  my_teams: [],
  summary: {
    competitions_count: 0,
    public_leagues_count: 0,
    players_count: 0,
    teams_count: 0,
  },
};

export default function FantasyPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState<TabId>('overview');

  const [overview, setOverview] =
    useState<FantasyOverview | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadOverview = async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await fetchFantasyOverview();

        if (active) {
          setOverview(response.data);
        }
      } catch (requestError) {
        console.error(
          'Failed to load fantasy overview:',
          requestError,
        );

        if (active) {
          setError(
            'We could not load the fantasy hub. Please try again.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadOverview();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const data = overview ?? emptyOverview;

  const activeCompetition = useMemo(
    () =>
      data.competitions.find(
        (competition) =>
          competition.active_gameweek,
      ) ??
      data.competitions[0] ??
      null,
    [data.competitions],
  );

  const myTeam = data.my_teams[0] ?? null;

  const myTeamIds = useMemo(
    () =>
      new Set(
        data.my_teams.map((team) => team.id),
      ),
    [data.my_teams],
  );

  const gameweek =
    activeCompetition?.active_gameweek ?? null;

  const tabs: {
    id: TabId;
    label: string;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
    },
    {
      id: 'myteam',
      label: 'My Team',
    },
    {
      id: 'leagues',
      label: 'Leagues',
    },
    {
      id: 'players',
      label: 'Players',
    },
    {
      id: 'standings',
      label: 'Standings',
    },
  ];

  const openCompetition = (
    competitionId?: number,
  ) => {
    const query = competitionId
      ? `?competition=${competitionId}`
      : '';

    navigate(`/fantasy/select${query}`);
  };

  if (loading && !overview) {
    return (
      <div
        className={`${styles.page} ${styles.statePage}`}
        role="status"
        aria-live="polite"
      >
        <div className={styles.stateCard}>
          <RefreshCw
            className={styles.stateSpinner}
            size={28}
          />

          <h2>Loading Fantasy Leagues</h2>

          <p>
            Fetching competitions, teams and
            leaderboards.
          </p>
        </div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div
        className={`${styles.page} ${styles.statePage}`}
        role="alert"
      >
        <div className={styles.stateCard}>
          <AlertCircle size={30} />

          <h2>Fantasy Hub Unavailable</h2>

          <p>{error}</p>

          <button
            className={styles.btnPrimary}
            onClick={() =>
              setReloadKey((value) => value + 1)
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Zap size={18} />
            FANTASY LEAGUES
          </div>

          <h1>
            BUILD YOUR SQUAD.
            <br />
            <span>BEAT THE LEAGUE.</span>
          </h1>

          <p>
            Create your ultimate fantasy team
            across Rugby, Football and Basketball.
            <br />
            Compete with fans across Uganda and
            climb the rankings.
          </p>

          <div className={styles.heroBtns}>
            <button
              className={styles.btnPrimary}
              onClick={() =>
                openCompetition(
                  activeCompetition?.id,
                )
              }
              disabled={
                data.competitions.length === 0
              }
            >
              Create Team →
            </button>

            <button
              className={styles.btnOutline}
              onClick={() =>
                setActiveTab('overview')
              }
            >
              Explore Competitions
            </button>
          </div>

          <div className={styles.heroBadges}>
            <span>
              <Gamepad2 size={16} />
              {data.summary.competitions_count}
              {' '}ACTIVE COMPETITIONS
              <br />
              <small>
                Across supported sports
              </small>
            </span>

            <span>
              <Users size={16} />
              {formatNumber(
                data.summary.teams_count,
              )}
              {' '}FANTASY TEAMS
              <br />
              <small>
                Created by League OS fans
              </small>
            </span>

            <span>
              <Trophy size={16} />
              {formatNumber(
                data.summary
                  .public_leagues_count,
              )}
              {' '}PUBLIC LEAGUES
              <br />
              <small>
                Open competitions to join
              </small>
            </span>

            <span>
              <CheckCircle2 size={16} />
              {formatNumber(
                data.summary.players_count,
              )}
              {' '}AVAILABLE PLAYERS
              <br />
              <small>
                Competition-linked rosters
              </small>
            </span>
          </div>
        </div>

        <div className={styles.heroImageWrap}>
          <img
            src={fantasyHero}
            alt="Fantasy players"
            className={styles.heroImage}
          />
        </div>

        <div className={styles.gwChip}>
          <div className={styles.gwChipLabel}>
            {gameweek?.name ??
              'Fantasy Season'}
          </div>

          <div
            className={styles.gwChipDeadline}
          >
            Deadline:{' '}
            {formatDeadline(gameweek?.lock_at)}
          </div>

          <div className={styles.gwChipBadge}>
            {gameweek?.status ??
              activeCompetition?.status_label ??
              'NO OPEN GAMEWEEK'}
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={
              `${styles.tab}` +
              (
                activeTab === tab.id
                  ? ` ${styles.tabActive}`
                  : ''
              )
            }
            onClick={() =>
              setActiveTab(tab.id)
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {error && (
          <div
            className={styles.inlineNotice}
            role="status"
          >
            <AlertCircle size={18} />

            <span>
              {error} Showing the last available
              fantasy data.
            </span>

            <button
              onClick={() =>
                setReloadKey(
                  (value) => value + 1,
                )
              }
            >
              Retry
            </button>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            <div className={styles.section}>
              <div
                className={styles.sectionHead}
              >
                <h2>
                  Featured Competitions
                </h2>

                <span
                  className={styles.sectionCount}
                >
                  {data.competitions.length}
                  {' '}available
                </span>
              </div>

              {data.competitions.length ===
              0 ? (
                <div
                  className={styles.emptyState}
                >
                  <Trophy size={30} />

                  <h3>
                    No fantasy competitions
                    are open
                  </h3>

                  <p>
                    Open and locked
                    competitions will appear
                    here when configured.
                  </p>
                </div>
              ) : (
                <div
                  className={styles.compCards}
                >
                  {data.competitions.map(
                    (competition) => {
                      const status =
                        STATUS_STYLE[
                          competition.status
                        ] ??
                        STATUS_STYLE.UPCOMING;

                      const accent =
                        competitionAccent(
                          competition,
                        );

                      return (
                        <article
                          key={competition.id}
                          className={
                            styles.compCard
                          }
                          style={
                            {
                              '--accent':
                                accent,
                            } as React.CSSProperties
                          }
                        >
                          <div
                            className={
                              styles.compCardTop
                            }
                          >
                            <div
                              className={
                                styles
                                  .compLogoPlaceholder
                              }
                              style={{
                                background:
                                  accent,
                              }}
                            >
                              {competition
                                .sport_label
                                .charAt(0)}
                            </div>

                            <div>
                              <div
                                className={
                                  styles.compName
                                }
                              >
                                {
                                  competition.name
                                }
                              </div>

                              <div
                                className={
                                  styles
                                    .compSeason
                                }
                              >
                                {
                                  competition
                                    .sport_label
                                }
                                {' · '}
                                {
                                  competition
                                    .season
                                }
                              </div>

                              <span
                                className={
                                  styles
                                    .compStatus
                                }
                                style={{
                                  background:
                                    status.bg,
                                  color:
                                    status.color,
                                }}
                              >
                                {
                                  competition
                                    .status_label
                                }
                              </span>
                            </div>
                          </div>

                          <div
                            className={
                              styles.compMeta
                            }
                          >
                            <span>
                              <Users
                                size={14}
                              />
                              {formatNumber(
                                competition
                                  .teams_count,
                              )}
                              {' '}teams
                            </span>

                            <span>
                              <Wallet
                                size={14}
                              />
                              {
                                competition
                                  .budget
                              }
                              {' '}credits
                            </span>

                            <span>
                              <User size={14} />
                              Squad of{' '}
                              {
                                competition
                                  .squad_size
                              }
                            </span>

                            <span>
                              <Clock size={14} />
                              {formatDeadline(
                                competition
                                  .active_gameweek
                                  ?.lock_at,
                              )}
                            </span>
                          </div>

                          <button
                            className={
                              styles.compBtn
                            }
                            onClick={() =>
                              openCompetition(
                                competition.id,
                              )
                            }
                          >
                            {competition.status ===
                            'OPEN'
                              ? 'Play Now'
                              : 'View Competition'}
                            {' '}→
                          </button>
                        </article>
                      );
                    },
                  )}
                </div>
              )}
            </div>

            <div className={styles.section}>
              <div
                className={styles.sectionHead}
              >
                <h2>How Fantasy Works</h2>
              </div>

              <div className={styles.howRow}>
                {HOW_IT_WORKS.map(
                  (item, index) => (
                    <div
                      key={item.step}
                      className={styles.howStep}
                    >
                      <div
                        className={styles.howNum}
                      >
                        {item.step}
                      </div>

                      <div
                        className={
                          styles.howIcon
                        }
                      >
                        {item.icon}
                      </div>

                      <div
                        className={
                          styles.howTitle
                        }
                      >
                        {item.title}
                      </div>

                      <div
                        className={
                          styles.howDesc
                        }
                      >
                        {item.desc}
                      </div>

                      {index <
                        HOW_IT_WORKS.length -
                          1 && (
                        <div
                          className={
                            styles.howArrow
                          }
                        >
                          →
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div
              className={styles.overviewSide}
            >
              <div className={styles.widget}>
                <div
                  className={styles.widgetHead}
                >
                  My Team
                </div>

                {myTeam ? (
                  <div
                    className={
                      styles.myTeamSnap
                    }
                  >
                    <div
                      className={
                        styles.myTeamName
                      }
                    >
                      {myTeam.name}
                    </div>

                    <div
                      className={
                        styles.myTeamComp
                      }
                    >
                      {
                        myTeam
                          .fantasy_competition_name
                      }
                    </div>

                    <div
                      className={
                        styles.myTeamStats
                      }
                    >
                      <div>
                        <strong>
                          {
                            myTeam
                              .active_squad_count
                          }
                        </strong>
                        <span>Players</span>
                      </div>

                      <div>
                        <strong>
                          {formatPoints(
                            myTeam.total_points,
                          )}
                        </strong>
                        <span>Total</span>
                      </div>

                      <div>
                        <strong>
                          {myTeam.current_rank
                            ? `#${myTeam.current_rank}`
                            : '—'}
                        </strong>
                        <span>Rank</span>
                      </div>
                    </div>

                    <button
                      className={
                        styles.btnPrimary
                      }
                      style={{
                        width: '100%',
                        marginTop: 12,
                      }}
                      onClick={() =>
                        setActiveTab('myteam')
                      }
                    >
                      View Team →
                    </button>
                  </div>
                ) : (
                  <div
                    className={
                      styles.compactEmptyState
                    }
                  >
                    <p>
                      You have not created a
                      fantasy team yet.
                    </p>

                    <button
                      className={
                        styles.btnPrimary
                      }
                      onClick={() =>
                        openCompetition(
                          activeCompetition?.id,
                        )
                      }
                      disabled={
                        data.competitions
                          .length === 0
                      }
                    >
                      Create Your First Team
                    </button>
                  </div>
                )}
              </div>

              <div
                className={styles.widget}
                style={{ marginTop: 14 }}
              >
                <div
                  className={styles.widgetHead}
                >
                  Fantasy Platform
                </div>

                <div
                  className={styles.summaryGrid}
                >
                  <div>
                    <strong>
                      {
                        data.summary
                          .competitions_count
                      }
                    </strong>
                    <span>Competitions</span>
                  </div>

                  <div>
                    <strong>
                      {formatNumber(
                        data.summary
                          .public_leagues_count,
                      )}
                    </strong>
                    <span>Public Leagues</span>
                  </div>

                  <div>
                    <strong>
                      {formatNumber(
                        data.summary
                          .players_count,
                      )}
                    </strong>
                    <span>Players</span>
                  </div>

                  <div>
                    <strong>
                      {formatNumber(
                        data.summary
                          .teams_count,
                      )}
                    </strong>
                    <span>Teams</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'myteam' &&
          (
            myTeam ? (
              <div
                className={styles.myTeamPage}
              >
                <div
                  className={
                    styles.myTeamHeader
                  }
                >
                  <div>
                    <h2>{myTeam.name}</h2>
                    <p>
                      {
                        myTeam
                          .fantasy_competition_name
                      }
                    </p>
                  </div>

                  <div
                    className={
                      styles
                        .myTeamHeaderStats
                    }
                  >
                    <div>
                      <strong>
                        {
                          myTeam
                            .active_squad_count
                        }
                      </strong>
                      <span>
                        Squad Players
                      </span>
                    </div>

                    <div>
                      <strong>
                        {formatPoints(
                          myTeam.total_points,
                        )}
                      </strong>
                      <span>Total Points</span>
                    </div>

                    <div>
                      <strong>
                        {myTeam.current_rank
                          ? `#${myTeam.current_rank}`
                          : '—'}
                      </strong>
                      <span>Overall Rank</span>
                    </div>
                  </div>
                </div>

                <div
                  className={styles.emptyState}
                >
                  <CheckCircle2 size={30} />

                  <h3>
                    Your fantasy team is active
                  </h3>

                  <p>
                    The detailed squad and
                    lineup view will be connected
                    in the next integration step.
                  </p>

                  <button
                    className={
                      styles.btnPrimary
                    }
                    onClick={() =>
                      openCompetition(
                        myTeam
                          .fantasy_competition,
                      )
                    }
                  >
                    View Competition
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={styles.emptyState}
              >
                <User size={32} />

                <h2>No Fantasy Team Yet</h2>

                <p>
                  Select an open competition to
                  create your first team.
                </p>

                <button
                  className={styles.btnPrimary}
                  onClick={() =>
                    openCompetition(
                      activeCompetition?.id,
                    )
                  }
                  disabled={
                    data.competitions.length ===
                    0
                  }
                >
                  Explore Competitions
                </button>
              </div>
            )
          )}

        {activeTab === 'leagues' && (
          <div className={styles.section}>
            <div
              className={styles.sectionHead}
            >
              <h2>Public Fantasy Leagues</h2>

              <span
                className={styles.sectionCount}
              >
                {data.public_leagues.length}
                {' '}featured
              </span>
            </div>

            {data.public_leagues.length ===
            0 ? (
              <div
                className={styles.emptyState}
              >
                <Trophy size={30} />

                <h3>
                  No public leagues available
                </h3>

                <p>
                  Public leagues will appear
                  here when administrators
                  create them.
                </p>
              </div>
            ) : (
              <div
                className={styles.leagueGrid}
              >
                {data.public_leagues.map(
                  (league) => (
                    <article
                      key={league.id}
                      className={
                        styles.leagueCard
                      }
                    >
                      <div
                        className={
                          styles.leagueBadge
                        }
                      >
                        {league.name
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3>{league.name}</h3>
                        <p>
                          {
                            league
                              .fantasy_competition_name
                          }
                        </p>
                      </div>

                      <div
                        className={
                          styles.leagueMeta
                        }
                      >
                        <span>
                          <Users size={15} />
                          {formatNumber(
                            league.members_count,
                          )}
                          {' '}members
                        </span>

                        <span>
                          <Trophy size={15} />
                          {league.league_type}
                        </span>
                      </div>

                      <button
                        className={
                          styles.btnOutline
                        }
                        onClick={() =>
                          navigate(
                            `/fantasy/create-league?competition=${league.fantasy_competition}`,
                          )
                        }
                      >
                        View Options
                      </button>
                    </article>
                  ),
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'players' && (
          <div className={styles.section}>
            <div
              className={styles.sectionHead}
            >
              <h2>Featured Players</h2>

              <span
                className={styles.sectionCount}
              >
                Live player preview
              </span>
            </div>

            {data.featured_players.length ===
            0 ? (
              <div
                className={styles.emptyState}
              >
                <Users size={30} />

                <h3>No players available</h3>

                <p>
                  Players will appear after
                  competition rosters are
                  configured.
                </p>
              </div>
            ) : (
              <div
                className={styles.featuredGrid}
              >
                {data.featured_players.map(
                  (player) => (
                    <article
                      key={player.id}
                      className={
                        styles.featuredPlayer
                      }
                    >
                      <div
                        className={
                          styles.featuredAvatar
                        }
                      >
                        {player.display_name
                          .charAt(0)}
                      </div>

                      <div>
                        <h3>
                          {player.display_name}
                        </h3>

                        <p>
                          {player.club_name}
                          {' · '}
                          {
                            player
                              .position_label
                          }
                        </p>
                      </div>

                      <div
                        className={
                          styles.featuredStats
                        }
                      >
                        <span>
                          <strong>
                            {
                              player
                                .final_price
                            }
                          </strong>
                          {' '}credits
                        </span>

                        <span>
                          Form{' '}
                          {player.current_form}
                        </span>
                      </div>

                      <button
                        className={
                          styles.btnOutline
                        }
                        onClick={() =>
                          navigate(
                            `/fantasy/player-market?competition=${player.fantasy_competition}`,
                          )
                        }
                      >
                        Open Market
                      </button>
                    </article>
                  ),
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'standings' && (
          <div>
            <div
              className={styles.sectionHead}
              style={{ marginBottom: 16 }}
            >
              <h2>Overall Standings</h2>

              <span
                className={styles.sectionCount}
              >
                Top {data.leaderboard.length}
              </span>
            </div>

            {data.leaderboard.length === 0 ? (
              <div
                className={styles.emptyState}
              >
                <Medal size={30} />

                <h3>No rankings yet</h3>

                <p>
                  Standings will appear after
                  fantasy teams begin scoring.
                </p>
              </div>
            ) : (
              <div className={styles.widget}>
                <div
                  className={styles.leaderHead}
                >
                  <span>#</span>
                  <span></span>
                  <span>Manager / Team</span>
                  <span>Squad</span>
                  <span>Total</span>
                </div>

                {data.leaderboard.map(
                  (entry, index) => {
                    const rank =
                      entry.current_rank ??
                      index + 1;

                    return (
                      <div
                        key={entry.id}
                        className={
                          `${styles.leaderRow}` +
                          (
                            myTeamIds.has(
                              entry.id,
                            )
                              ? ` ${styles.leaderRowMe}`
                              : ''
                          )
                        }
                      >
                        <span
                          className={
                            styles.leaderRank
                          }
                        >
                          {rank <= 3
                            ? (
                              <Medal
                                size={18}
                              />
                            )
                            : rank}
                        </span>

                        <div
                          className={
                            styles
                              .leaderAvatar
                          }
                        >
                          {entry.owner_name
                            .charAt(0)}
                        </div>

                        <div
                          className={
                            styles.leaderInfo
                          }
                        >
                          <strong>
                            {
                              entry.owner_name
                            }
                          </strong>

                          <small>
                            {entry.name}
                            {' · '}
                            {
                              entry
                                .fantasy_competition_name
                            }
                          </small>
                        </div>

                        <span
                          style={{
                            color: '#9ca3af',
                            fontSize: 13,
                          }}
                        >
                          {
                            entry
                              .active_squad_count
                          }
                        </span>

                        <span
                          className={
                            styles.leaderPts
                          }
                        >
                          {formatPoints(
                            entry.total_points,
                          )}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
