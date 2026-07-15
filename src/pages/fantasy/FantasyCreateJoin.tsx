import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Globe2,
  LockKeyhole,
  RefreshCw,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  createFantasyLeague,
  fetchAvailableFantasyLeagues,
  fetchFantasyCompetitionDetail,
  fetchMyFantasyTeams,
  joinPrivateFantasyLeague,
} from '../../services/fantasyService';
import type {
  FantasyCompetitionApi,
  FantasyLeagueMembershipApi,
  FantasyLeagueSummary,
  FantasyTeamApi,
} from '../../services/fantasyService';
import styles from './FantasyCreateJoin.module.css';

type Tab = 'create' | 'join';
type LeagueType = 'PUBLIC' | 'PRIVATE';

type ApiErrorShape = {
  response?: {
    data?: unknown;
  };
};

const SPORT_PRESENTATION: Record<
  string,
  {
    label: string;
    emoji: string;
  }
> = {
  RUGBY: {
    label: 'Rugby',
    emoji: '🏉',
  },
  FOOTBALL: {
    label: 'Football',
    emoji: '⚽',
  },
  BASKETBALL: {
    label: 'Basketball',
    emoji: '🏀',
  },
  OTHER: {
    label: 'Other',
    emoji: '🏆',
  },
};

function sportPresentation(sport: string) {
  return (
    SPORT_PRESENTATION[sport] ??
    SPORT_PRESENTATION.OTHER
  );
}

function extractErrorMessage(
  value: unknown,
): string | null {
  if (
    typeof value === 'string' &&
    value.trim()
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message =
        extractErrorMessage(item);

      if (message) {
        return message;
      }
    }
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    for (
      const item of Object.values(
        value as Record<string, unknown>,
      )
    ) {
      const message =
        extractErrorMessage(item);

      if (message) {
        return message;
      }
    }
  }

  return null;
}

function getApiErrorMessage(
  error: unknown,
  fallback: string,
) {
  const data = (
    error as ApiErrorShape
  ).response?.data;

  return (
    extractErrorMessage(data) ??
    fallback
  );
}

export default function FantasyCreateJoin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const competitionId =
    Number.parseInt(
      searchParams.get('competition') ?? '',
      10,
    );

  const [tab, setTab] =
    useState<Tab>('create');

  const [
    competition,
    setCompetition,
  ] =
    useState<FantasyCompetitionApi | null>(
      null,
    );

  const [teams, setTeams] =
    useState<FantasyTeamApi[]>([]);

  const [
    publicLeagues,
    setPublicLeagues,
  ] = useState<FantasyLeagueSummary[]>(
    [],
  );

  const [leagueName, setLeagueName] =
    useState('');

  const [leagueType, setLeagueType] =
    useState<LeagueType>('PRIVATE');

  const [joinCode, setJoinCode] =
    useState('');

  const [
    createdLeague,
    setCreatedLeague,
  ] =
    useState<FantasyLeagueSummary | null>(
      null,
    );

  const [
    joinedMembership,
    setJoinedMembership,
  ] =
    useState<FantasyLeagueMembershipApi | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [joining, setJoining] =
    useState(false);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [reloadKey, setReloadKey] =
    useState(0);

  const validCompetitionId =
    Number.isInteger(competitionId) &&
    competitionId > 0;

  useEffect(() => {
    let active = true;

    if (!validCompetitionId) {
      setLoadError(
        'No valid fantasy competition was selected.',
      );
      setLoading(false);
      return () => {
        active = false;
      };
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const [
          competitionResponse,
          teamsResponse,
          leaguesResponse,
        ] = await Promise.all([
          fetchFantasyCompetitionDetail(
            competitionId,
          ),
          fetchMyFantasyTeams(),
          fetchAvailableFantasyLeagues({
            competition: competitionId,
            league_type: 'PUBLIC',
            limit: 50,
            offset: 0,
          }),
        ]);

        if (!active) {
          return;
        }

        setCompetition(
          competitionResponse.data
            .competition,
        );

        setTeams(
          teamsResponse.data.results,
        );

        setPublicLeagues(
          leaguesResponse.data.results,
        );
      } catch (requestError) {
        console.error(
          'Failed to load fantasy create/join data:',
          requestError,
        );

        if (active) {
          setLoadError(
            getApiErrorMessage(
              requestError,
              'We could not load this fantasy competition.',
            ),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, [
    competitionId,
    reloadKey,
    validCompetitionId,
  ]);

  const competitionTeam = useMemo(
    () =>
      teams.find(
        (team) =>
          team.fantasy_competition ===
          competitionId,
      ) ?? null,
    [competitionId, teams],
  );

  const currentSport = competition
    ? sportPresentation(
        competition.sport,
      )
    : SPORT_PRESENTATION.OTHER;

  const teamBuilderUrl = (
    league?: FantasyLeagueSummary | null,
    membership?: FantasyLeagueMembershipApi | null,
  ) => {
    const params = new URLSearchParams({
      competition: String(competitionId),
    });

    if (competitionTeam) {
      params.set(
        'team',
        String(competitionTeam.id),
      );
    }

    const leagueId =
      membership?.fantasy_league ??
      league?.id;

    if (leagueId) {
      params.set(
        'league',
        String(leagueId),
      );
    }

    const code =
      league?.join_code ??
      membership
        ?.fantasy_league_detail
        .join_code;

    if (code) {
      params.set('joinCode', code);
    }

    return (
      `/fantasy/team-builder?` +
      params.toString()
    );
  };

  const handleCreate = async () => {
    const cleanName = leagueName.trim();

    if (
      !competition ||
      !cleanName
    ) {
      return;
    }

    try {
      setCreating(true);
      setActionError(null);
      setJoinedMembership(null);

      const response =
        await createFantasyLeague({
          fantasy_competition_id:
            competition.id,
          name: cleanName,
          league_type: leagueType,
        });

      const league =
        response.data.league;

      setCreatedLeague(league);

      if (
        league.league_type ===
          'PRIVATE' &&
        league.join_code &&
        competitionTeam
      ) {
        try {
          const joinResponse =
            await joinPrivateFantasyLeague({
              fantasy_team_id:
                competitionTeam.id,
              join_code:
                league.join_code,
            });

          setJoinedMembership(
            joinResponse.data.membership,
          );
        } catch (joinError) {
          console.error(
            'League created but automatic membership failed:',
            joinError,
          );

          setActionError(
            'The league was created, but your existing team could not be added automatically. Use the displayed private code to join.',
          );
        }
      }
    } catch (requestError) {
      console.error(
        'Failed to create fantasy league:',
        requestError,
      );

      setActionError(
        getApiErrorMessage(
          requestError,
          'The fantasy league could not be created.',
        ),
      );
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    const cleanCode =
      joinCode.trim().toUpperCase();

    if (
      !competitionTeam ||
      cleanCode.length < 4
    ) {
      return;
    }

    try {
      setJoining(true);
      setActionError(null);

      const response =
        await joinPrivateFantasyLeague({
          fantasy_team_id:
            competitionTeam.id,
          join_code: cleanCode,
        });

      setJoinedMembership(
        response.data.membership,
      );

      setJoinCode('');
    } catch (requestError) {
      console.error(
        'Failed to join private fantasy league:',
        requestError,
      );

      setActionError(
        getApiErrorMessage(
          requestError,
          'The private fantasy league could not be joined.',
        ),
      );
    } finally {
      setJoining(false);
    }
  };

  const resetCreateForm = () => {
    setCreatedLeague(null);
    setJoinedMembership(null);
    setLeagueName('');
    setActionError(null);
  };

  const resetJoinForm = () => {
    setJoinedMembership(null);
    setJoinCode('');
    setActionError(null);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.stateCard}>
          <RefreshCw
            className={styles.stateSpinner}
            size={30}
          />

          <h2>
            Loading League Options
          </h2>

          <p>
            Fetching the competition,
            your team and available
            leagues.
          </p>
        </div>
      </div>
    );
  }

  if (loadError || !competition) {
    return (
      <div className={styles.page}>
        <div className={styles.stateCard}>
          <AlertCircle size={32} />

          <h2>
            League Options Unavailable
          </h2>

          <p>
            {loadError ??
              'Fantasy competition not found.'}
          </p>

          <div
            className={
              styles.successActions
            }
          >
            <button
              className={styles.primaryBtn}
              onClick={() =>
                setReloadKey(
                  (value) => value + 1,
                )
              }
              disabled={
                !validCompetitionId
              }
            >
              Try Again
            </button>

            <button
              className={
                styles.secondaryBtn
              }
              onClick={() =>
                navigate(
                  '/fantasy/select',
                )
              }
            >
              Select Competition
            </button>
          </div>
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
            navigate(
              `/fantasy/select?competition=${competition.id}`,
            )
          }
        >
          ← Back
        </button>

        <div className={styles.steps}>
          <span className={styles.step}>
            1 Select Competition
          </span>

          <span
            className={styles.stepArrow}
          >
            ›
          </span>

          <span
            className={
              `${styles.step} ` +
              styles.stepActive
            }
          >
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

      <div className={styles.contextPill}>
        <span>
          {currentSport.emoji}{' '}
          {competition.name}
        </span>

        <span className={styles.dot}>
          ·
        </span>

        <span>
          {competition.season ||
            'Current Season'}
        </span>

        <span className={styles.dot}>
          ·
        </span>

        <span>
          Budget: {competition.budget}
          {' '}credits
        </span>

        <span className={styles.dot}>
          ·
        </span>

        <span>
          Squad: {
            competition.squad_size
          }
        </span>
      </div>

      <div className={styles.body}>
        {competitionTeam ? (
          <div
            className={styles.teamNotice}
          >
            <CheckCircle2 size={19} />

            <div>
              <strong>
                Your competition team:
                {' '}
                {competitionTeam.name}
              </strong>

              <span>
                Team #{competitionTeam.id}
                {' · '}
                {
                  competitionTeam
                    .active_squad_count
                }
                {' '}players selected
              </span>
            </div>
          </div>
        ) : (
          <div
            className={
              styles.teamNoticeWarning
            }
          >
            <AlertCircle size={19} />

            <div>
              <strong>
                You do not have a team for
                this competition yet.
              </strong>

              <span>
                You can create a league now,
                but a fantasy team is required
                before joining a private
                league.
              </span>
            </div>

            <button
              className={
                styles.secondaryBtn
              }
              onClick={() =>
                navigate(
                  teamBuilderUrl(),
                )
              }
            >
              Create Team First
            </button>
          </div>
        )}

        {actionError && (
          <div
            className={styles.apiError}
            role="alert"
          >
            <AlertCircle size={18} />
            <span>{actionError}</span>
          </div>
        )}

        <div className={styles.tabs}>
          <button
            className={
              `${styles.tab}` +
              (
                tab === 'create'
                  ? ` ${styles.tabActive}`
                  : ''
              )
            }
            onClick={() => {
              setTab('create');
              setActionError(null);
            }}
          >
            🏆 Create New League
          </button>

          <button
            className={
              `${styles.tab}` +
              (
                tab === 'join'
                  ? ` ${styles.tabActive}`
                  : ''
              )
            }
            onClick={() => {
              setTab('join');
              setActionError(null);
            }}
          >
            🔗 Join a League
          </button>
        </div>

        {tab === 'create' && (
          <div className={styles.panel}>
            {createdLeague ? (
              <div
                className={
                  styles.successState
                }
              >
                <div
                  className={
                    styles.successIcon
                  }
                >
                  🎉
                </div>

                <h3>League Created!</h3>

                <p>
                  <strong>
                    {createdLeague.name}
                  </strong>
                  {' '}has been created for
                  {' '}
                  {competition.name}.
                </p>

                <div
                  className={
                    styles.successDetail
                  }
                >
                  <span>
                    {createdLeague
                      .league_type ===
                    'PRIVATE'
                      ? (
                        <LockKeyhole
                          size={16}
                        />
                      )
                      : (
                        <Globe2
                          size={16}
                        />
                      )}
                    {
                      createdLeague
                        .league_type
                    }
                  </span>

                  <span>
                    <Users size={16} />
                    {
                      createdLeague
                        .members_count
                    }
                    {' '}members
                  </span>
                </div>

                {createdLeague.join_code && (
                  <div
                    className={
                      styles.codeBox
                    }
                  >
                    <small>
                      PRIVATE JOIN CODE
                    </small>

                    <strong>
                      {
                        createdLeague
                          .join_code
                      }
                    </strong>

                    <span>
                      Share this code with
                      invited managers.
                    </span>
                  </div>
                )}

                {joinedMembership && (
                  <div
                    className={
                      styles.membershipSuccess
                    }
                  >
                    <CheckCircle2
                      size={18}
                    />
                    {
                      joinedMembership
                        .fantasy_team_name
                    }
                    {' '}was added to the
                    league.
                  </div>
                )}

                {!competitionTeam &&
                  createdLeague
                    .league_type ===
                    'PRIVATE' && (
                    <p>
                      Build your fantasy team
                      next, then use the join
                      code above to enter this
                      private league.
                    </p>
                  )}

                <div
                  className={
                    styles.successActions
                  }
                >
                  <button
                    className={
                      styles.primaryBtn
                    }
                    onClick={() =>
                      navigate(
                        teamBuilderUrl(
                          createdLeague,
                          joinedMembership,
                        ),
                      )
                    }
                  >
                    Continue to Team Builder →
                  </button>

                  <button
                    className={
                      styles.secondaryBtn
                    }
                    onClick={
                      resetCreateForm
                    }
                  >
                    Create Another League
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3
                  className={
                    styles.panelTitle
                  }
                >
                  Set Up Your League
                </h3>

                <div
                  className={
                    styles.formGrid
                  }
                >
                  <div
                    className={
                      styles.field
                    }
                  >
                    <label
                      htmlFor="fantasy-league-name"
                    >
                      League Name *
                    </label>

                    <input
                      id="fantasy-league-name"
                      type="text"
                      placeholder="e.g. KOBS Fans Mini League"
                      value={leagueName}
                      maxLength={160}
                      onChange={(event) =>
                        setLeagueName(
                          event.target.value,
                        )
                      }
                    />
                  </div>

                  <div
                    className={
                      `${styles.field} ` +
                      styles.fieldRow
                    }
                  >
                    <label>
                      League Privacy
                    </label>

                    <div
                      className={
                        styles.toggleRow
                      }
                    >
                      <button
                        type="button"
                        className={
                          `${styles.toggleBtn}` +
                          (
                            leagueType ===
                            'PUBLIC'
                              ? ` ${styles.toggleBtnActive}`
                              : ''
                          )
                        }
                        onClick={() =>
                          setLeagueType(
                            'PUBLIC',
                          )
                        }
                      >
                        <Globe2
                          size={15}
                        />
                        Public
                      </button>

                      <button
                        type="button"
                        className={
                          `${styles.toggleBtn}` +
                          (
                            leagueType ===
                            'PRIVATE'
                              ? ` ${styles.toggleBtnActive}`
                              : ''
                          )
                        }
                        onClick={() =>
                          setLeagueType(
                            'PRIVATE',
                          )
                        }
                      >
                        <LockKeyhole
                          size={15}
                        />
                        Private
                      </button>
                    </div>
                  </div>
                </div>

                {leagueName.trim() && (
                  <div
                    className={
                      styles.leaguePreview
                    }
                  >
                    <div
                      className={
                        styles
                          .leaguePreviewIcon
                      }
                    >
                      {currentSport.emoji}
                    </div>

                    <div>
                      <strong>
                        {leagueName.trim()}
                      </strong>

                      <p>
                        {competition.name}
                        {' · '}
                        {leagueType ===
                        'PRIVATE'
                          ? 'Private with join code'
                          : 'Public and discoverable'}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  className={
                    styles.primaryBtn
                  }
                  onClick={handleCreate}
                  disabled={
                    !leagueName.trim() ||
                    creating
                  }
                >
                  {creating
                    ? 'Creating League…'
                    : 'Create League'}
                </button>
              </>
            )}
          </div>
        )}

        {tab === 'join' && (
          <div className={styles.panel}>
            {joinedMembership ? (
              <div
                className={
                  styles.successState
                }
              >
                <div
                  className={
                    styles.successIcon
                  }
                >
                  🎉
                </div>

                <h3>
                  Private League Joined!
                </h3>

                <p>
                  <strong>
                    {
                      joinedMembership
                        .fantasy_team_name
                    }
                  </strong>
                  {' '}has joined
                  {' '}
                  <strong>
                    {
                      joinedMembership
                        .fantasy_league_detail
                        .name
                    }
                  </strong>
                  .
                </p>

                <div
                  className={
                    styles.successActions
                  }
                >
                  <button
                    className={
                      styles.primaryBtn
                    }
                    onClick={() =>
                      navigate(
                        teamBuilderUrl(
                          joinedMembership
                            .fantasy_league_detail,
                          joinedMembership,
                        ),
                      )
                    }
                  >
                    Continue to Team Builder →
                  </button>

                  <button
                    className={
                      styles.secondaryBtn
                    }
                    onClick={resetJoinForm}
                  >
                    Join Another League
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={
                    styles.joinCodeSection
                  }
                >
                  <h3
                    className={
                      styles.panelTitle
                    }
                  >
                    Join by Private Code
                  </h3>

                  <p
                    className={
                      styles.panelDescription
                    }
                  >
                    A team belonging to this
                    competition is required.
                  </p>

                  <div
                    className={
                      styles.codeRow
                    }
                  >
                    <input
                      className={
                        styles.codeInput
                      }
                      type="text"
                      aria-label="Private league code"
                      placeholder="Enter private league code"
                      maxLength={20}
                      value={joinCode}
                      disabled={!competitionTeam}
                      onChange={(event) =>
                        setJoinCode(
                          event.target.value
                            .toUpperCase(),
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                          'Enter'
                        ) {
                          void handleJoin();
                        }
                      }}
                    />

                    <button
                      className={
                        styles.primaryBtn
                      }
                      onClick={handleJoin}
                      disabled={
                        !competitionTeam ||
                        joinCode.trim()
                          .length < 4 ||
                        joining
                      }
                    >
                      {joining
                        ? 'Joining…'
                        : 'Join Private League'}
                    </button>
                  </div>
                </div>

                <div
                  className={styles.divider}
                >
                  <span>
                    public leagues for this
                    competition
                  </span>
                </div>

                <div>
                  <div
                    className={
                      styles.publicHeader
                    }
                  >
                    <div>
                      <h3
                        className={
                          styles.panelTitle
                        }
                      >
                        Public Leagues
                      </h3>

                      <p
                        className={
                          styles
                            .panelDescription
                        }
                      >
                        Browse currently active
                        public leagues.
                      </p>
                    </div>

                    <span
                      className={
                        styles.publicCount
                      }
                    >
                      {publicLeagues.length}
                      {' '}available
                    </span>
                  </div>

                  {publicLeagues.length ===
                  0 ? (
                    <div
                      className={
                        styles.emptyState
                      }
                    >
                      <Trophy size={30} />

                      <h4>
                        No Public Leagues
                      </h4>

                      <p>
                        Create the first public
                        league for this
                        competition.
                      </p>
                    </div>
                  ) : (
                    <div
                      className={
                        styles.publicLeagueGrid
                      }
                    >
                      {publicLeagues.map(
                        (league) => (
                          <article
                            key={league.id}
                            className={
                              styles.publicLeagueCard
                            }
                          >
                            <div
                              className={
                                styles
                                  .publicLeagueTop
                              }
                            >
                              <div
                                className={
                                  styles
                                    .publicLeagueBadge
                                }
                              >
                                {league.name
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>

                              <span
                                className={
                                  styles
                                    .statusTag
                                }
                              >
                                <Globe2
                                  size={13}
                                />
                                Public
                              </span>
                            </div>

                            <h4>
                              {league.name}
                            </h4>

                            <p>
                              {
                                league
                                  .fantasy_competition_name
                              }
                            </p>

                            <div
                              className={
                                styles
                                  .publicLeagueMeta
                              }
                            >
                              <span>
                                <Users
                                  size={14}
                                />
                                {
                                  league
                                    .members_count
                                }
                                {' '}members
                              </span>

                              <span>
                                <Wallet
                                  size={14}
                                />
                                Free
                              </span>
                            </div>

                            <small>
                              Public league
                              membership will
                              be connected after
                              the backend exposes
                              a public join
                              action.
                            </small>
                          </article>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
