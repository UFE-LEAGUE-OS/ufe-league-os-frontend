import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  fetchFantasyCompetitions,
} from '../../services/fantasyService';
import type {
  FantasyCompetitionApi,
} from '../../services/fantasyService';
import styles from './FantasySportSelect.module.css';

const SPORT_PRESENTATION: Record<
  string,
  {
    label: string;
    emoji: string;
    color: string;
  }
> = {
  RUGBY: {
    label: 'Rugby',
    emoji: '🏉',
    color: '#8135FA',
  },
  FOOTBALL: {
    label: 'Football',
    emoji: '⚽',
    color: '#2563eb',
  },
  BASKETBALL: {
    label: 'Basketball',
    emoji: '🏀',
    color: '#f97316',
  },
  OTHER: {
    label: 'Other',
    emoji: '🏆',
    color: '#64748b',
  },
};

const STATUS_PRESENTATION: Record<
  string,
  {
    label: string;
    color: string;
    background: string;
  }
> = {
  OPEN: {
    label: 'Open',
    color: '#22c55e',
    background: 'rgba(34,197,94,0.14)',
  },
  LOCKED: {
    label: 'Locked',
    color: '#fb923c',
    background: 'rgba(249,115,22,0.14)',
  },
  COMPLETED: {
    label: 'Completed',
    color: '#60a5fa',
    background: 'rgba(59,130,246,0.14)',
  },
};

const STATUS_PRIORITY: Record<string, number> = {
  OPEN: 0,
  LOCKED: 1,
  COMPLETED: 2,
};

function getSportPresentation(sport: string) {
  return (
    SPORT_PRESENTATION[sport] ??
    SPORT_PRESENTATION.OTHER
  );
}

function getStatusPresentation(status: string) {
  return (
    STATUS_PRESENTATION[status] ?? {
      label: status,
      color: '#9ca3af',
      background:
        'rgba(156,163,175,0.12)',
    }
  );
}

function sortCompetitions(
  competitions: FantasyCompetitionApi[],
) {
  return [...competitions].sort(
    (left, right) => {
      const statusDifference =
        (STATUS_PRIORITY[left.status] ?? 99) -
        (STATUS_PRIORITY[right.status] ?? 99);

      if (statusDifference !== 0) {
        return statusDifference;
      }

      const sportDifference =
        left.sport.localeCompare(right.sport);

      if (sportDifference !== 0) {
        return sportDifference;
      }

      return left.name.localeCompare(right.name);
    },
  );
}

export default function FantasySportSelect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const requestedCompetitionId =
    Number.parseInt(
      searchParams.get('competition') ?? '',
      10,
    );

  const [competitions, setCompetitions] =
    useState<FantasyCompetitionApi[]>([]);

  const [
    selectedCompetitionId,
    setSelectedCompetitionId,
  ] = useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [reloadKey, setReloadKey] =
    useState(0);

  useEffect(() => {
    let active = true;

    const loadCompetitions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await fetchFantasyCompetitions();

        if (!active) {
          return;
        }

        const visibleCompetitions =
          sortCompetitions(
            response.data.results.filter(
              (competition) =>
                ![
                  'DRAFT',
                  'CANCELLED',
                ].includes(
                  competition.status,
                ),
            ),
          );

        setCompetitions(
          visibleCompetitions,
        );

        setSelectedCompetitionId(
          (currentSelection) => {
            if (
              currentSelection &&
              visibleCompetitions.some(
                (competition) =>
                  competition.id ===
                  currentSelection,
              )
            ) {
              return currentSelection;
            }

            if (
              Number.isInteger(
                requestedCompetitionId,
              ) &&
              visibleCompetitions.some(
                (competition) =>
                  competition.id ===
                  requestedCompetitionId,
              )
            ) {
              return requestedCompetitionId;
            }

            const firstOpenCompetition =
              visibleCompetitions.find(
                (competition) =>
                  competition.status ===
                  'OPEN',
              );

            return (
              firstOpenCompetition?.id ??
              visibleCompetitions[0]?.id ??
              null
            );
          },
        );
      } catch (requestError) {
        console.error(
          'Failed to load fantasy competitions:',
          requestError,
        );

        if (active) {
          setError(
            'We could not load the fantasy competitions.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadCompetitions();

    return () => {
      active = false;
    };
  }, [
    reloadKey,
    requestedCompetitionId,
  ]);

  const selectedCompetition =
    useMemo(
      () =>
        competitions.find(
          (competition) =>
            competition.id ===
            selectedCompetitionId,
        ) ?? null,
      [
        competitions,
        selectedCompetitionId,
      ],
    );

  const canCreateTeam =
    selectedCompetition?.status === 'OPEN';

  const handleContinue = () => {
    if (
      !selectedCompetition ||
      !canCreateTeam
    ) {
      return;
    }

    navigate(
      `/fantasy/create-league?competition=${selectedCompetition.id}`,
    );
  };

  const handleOpenPlayerMarket = () => {
    if (!selectedCompetition) {
      return;
    }

    navigate(
      `/fantasy/player-market?competition=${selectedCompetition.id}`,
    );
  };

  if (loading && competitions.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.stateCard}>
          <RefreshCw
            className={styles.stateSpinner}
            size={30}
          />

          <h2>
            Loading Fantasy Competitions
          </h2>

          <p>
            Fetching the latest competition
            rules and squad settings.
          </p>
        </div>
      </div>
    );
  }

  if (error && competitions.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.stateCard}>
          <AlertCircle size={32} />

          <h2>
            Competitions Unavailable
          </h2>

          <p>{error}</p>

          <button
            className={styles.retryBtn}
            onClick={() =>
              setReloadKey(
                (current) => current + 1,
              )
            }
          >
            Try Again
          </button>

          <button
            className={styles.backBtn}
            onClick={() =>
              navigate('/fantasy')
            }
          >
            Back to Fantasy Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() =>
            navigate('/fantasy')
          }
        >
          ← Back
        </button>

        <div className={styles.steps}>
          <span
            className={
              `${styles.step} ` +
              styles.stepActive
            }
          >
            1 Select Competition
          </span>

          <span
            className={styles.stepArrow}
          >
            ›
          </span>

          <span className={styles.step}>
            2 Create / Join
          </span>

          <span
            className={styles.stepArrow}
          >
            ›
          </span>

          <span className={styles.step}>
            3 Build Team
          </span>
        </div>
      </div>

      <div className={styles.body}>
        <section className={styles.section}>
          <h2
            className={styles.sectionTitle}
          >
            <span className={styles.stepNum}>
              1
            </span>

            Choose a Fantasy Competition
          </h2>

          <p className={styles.sectionSub}>
            Select the real competition for
            which you want to create a fantasy
            team.
          </p>

          {competitions.length === 0 ? (
            <div className={styles.emptyState}>
              <Trophy size={34} />

              <h3>
                No Fantasy Competitions
              </h3>

              <p>
                Open competitions will appear
                here after they have been
                configured by an administrator.
              </p>

              <button
                className={styles.backBtn}
                onClick={() =>
                  navigate('/fantasy')
                }
              >
                Back to Fantasy Hub
              </button>
            </div>
          ) : (
            <div className={styles.sportGrid}>
              {competitions.map(
                (competition) => {
                  const sport =
                    getSportPresentation(
                      competition.sport,
                    );

                  const status =
                    getStatusPresentation(
                      competition.status,
                    );

                  const isSelected =
                    selectedCompetitionId ===
                    competition.id;

                  return (
                    <button
                      key={competition.id}
                      type="button"
                      className={
                        `${styles.sportCard}` +
                        (
                          isSelected
                            ? ` ${styles.sportCardSelected}`
                            : ''
                        )
                      }
                      style={
                        {
                          '--accent':
                            sport.color,
                        } as React.CSSProperties
                      }
                      onClick={() =>
                        setSelectedCompetitionId(
                          competition.id,
                        )
                      }
                    >
                      <div
                        className={
                          styles.competitionHeading
                        }
                      >
                        <span
                          className={
                            styles.sportEmoji
                          }
                        >
                          {sport.emoji}
                        </span>

                        <span
                          className={
                            styles.statusChip
                          }
                          style={{
                            color:
                              status.color,
                            background:
                              status.background,
                          }}
                        >
                          {status.label}
                        </span>
                      </div>

                      <strong
                        className={
                          styles.competitionName
                        }
                      >
                        {competition.name}
                      </strong>

                      <span
                        className={
                          styles.competitionSeason
                        }
                      >
                        {sport.label}
                        {' · '}
                        {competition.season ||
                          'Current Season'}
                      </span>

                      <div
                        className={
                          styles.sportMeta
                        }
                      >
                        <span>
                          <Wallet size={14} />
                          Budget:{' '}
                          {
                            competition.budget
                          }
                          {' '}credits
                        </span>

                        <span>
                          <Users size={14} />
                          Squad:{' '}
                          {
                            competition.squad_size
                          }
                          {' '}players
                        </span>

                        <span>
                          <CheckCircle2
                            size={14}
                          />
                          Lineup:{' '}
                          {
                            competition.lineup_size
                          }
                          {' '}players
                        </span>

                        <span>
                          <ShieldCheck
                            size={14}
                          />
                          Maximum{' '}
                          {
                            competition
                              .max_players_per_club
                          }
                          {' '}per club
                        </span>

                        <span>
                          <Clock size={14} />
                          {
                            competition
                              .gameweeks_count
                          }
                          {' '}gameweeks
                        </span>
                      </div>

                      {isSelected && (
                        <div
                          className={
                            styles.selectedTick
                          }
                        >
                          ✓
                        </div>
                      )}
                    </button>
                  );
                },
              )}
            </div>
          )}
        </section>

        {selectedCompetition && (
          <section
            className={
              `${styles.summary} ` +
              styles.sectionFadeIn
            }
          >
            <div
              className={
                styles.selectionSummary
              }
            >
              <div
                className={
                  styles.summaryInfo
                }
              >
                <span>
                  {
                    getSportPresentation(
                      selectedCompetition.sport,
                    ).emoji
                  }
                  {' '}
                  <strong>
                    {
                      selectedCompetition.name
                    }
                  </strong>
                </span>

                <span>·</span>

                <span>
                  Budget:{' '}
                  <strong>
                    {
                      selectedCompetition
                        .budget
                    }
                    {' '}credits
                  </strong>
                </span>

                <span>·</span>

                <span>
                  Squad:{' '}
                  <strong>
                    {
                      selectedCompetition
                        .squad_size
                    }
                  </strong>
                </span>
              </div>

              <p
                className={
                  styles.linkedCompetition
                }
              >
                Linked to{' '}
                {
                  selectedCompetition
                    .linked_competition_label
                }
              </p>

              {selectedCompetition
                .rules_summary && (
                <p
                  className={
                    styles.rulesSummary
                  }
                >
                  {
                    selectedCompetition
                      .rules_summary
                  }
                </p>
              )}

              {!canCreateTeam && (
                <p
                  className={
                    styles.availabilityMessage
                  }
                >
                  This competition is{' '}
                  {selectedCompetition.status.toLowerCase()}
                  . New team creation is only
                  available for open
                  competitions.
                </p>
              )}
            </div>

            <div
              className={
                styles.selectionActions
              }
            >
              <button
                className={styles.secondaryBtn}
                onClick={
                  handleOpenPlayerMarket
                }
              >
                Browse Players
              </button>

              <button
                className={styles.continueBtn}
                onClick={handleContinue}
                disabled={!canCreateTeam}
              >
                Continue to Create / Join →
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
