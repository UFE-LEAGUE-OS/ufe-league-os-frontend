import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AlertCircle,
  Check,
  CircleCheck,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  createFantasyTeam,
  fetchFantasyCompetitionDetail,
  fetchFantasyPlayers,
  fetchMyFantasyTeams,
  joinPrivateFantasyLeague,
  updateFantasySquad,
} from '../../services/fantasyService';
import type {
  FantasyCompetitionApi,
  FantasyPlayerApi,
  FantasyTeamApi,
} from '../../services/fantasyService';
import styles from './FantasyTeamBuilder.module.css';

type FormationRow = {
  row: string;
  positions: string[];
};

type SquadSlot = {
  row: string;
  pos: string;
  slotId: string;
};

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

const BASE_FORMATIONS: Record<
  string,
  FormationRow[]
> = {
  RUGBY: [
    {
      row: 'Front Row',
      positions: ['PR', 'HK', 'PR'],
    },
    {
      row: 'Second Row',
      positions: ['LK', 'LK'],
    },
    {
      row: 'Back Row',
      positions: ['BR', 'BR', 'BR'],
    },
    {
      row: 'Half Backs',
      positions: ['SH', 'FH'],
    },
    {
      row: 'Centres',
      positions: ['CTR', 'CTR'],
    },
    {
      row: 'Back Three',
      positions: ['WG', 'FB', 'WG'],
    },
  ],
  FOOTBALL: [
    {
      row: 'Goalkeeper',
      positions: ['GK'],
    },
    {
      row: 'Defence',
      positions: [
        'DEF',
        'DEF',
        'DEF',
        'DEF',
      ],
    },
    {
      row: 'Midfield',
      positions: ['MID', 'MID', 'MID'],
    },
    {
      row: 'Attack',
      positions: ['FWD', 'FWD', 'FWD'],
    },
  ],
  BASKETBALL: [
    {
      row: 'Guards',
      positions: ['G', 'G'],
    },
    {
      row: 'Forwards',
      positions: ['F', 'F'],
    },
    {
      row: 'Centre',
      positions: ['C'],
    },
  ],
};



const POSITION_COLORS: Record<
  string,
  string
> = {
  PROP: '#7c3aed',
  HOOKER: '#2563eb',
  LOCK: '#059669',
  BACK_ROW: '#d97706',
  SCRUM_HALF: '#0891b2',
  FLY_HALF: '#7c3aed',
  CENTRE: '#059669',
  WING: '#f97316',
  FULLBACK: '#8b5cf6',
  GOALKEEPER: '#1d4ed8',
  DEFENDER: '#059669',
  MIDFIELDER: '#d97706',
  FORWARD: '#dc2626',
  GUARD: '#7c3aed',
  FORWARD_BASKETBALL: '#d97706',
  CENTER_BASKETBALL: '#dc2626',
  UTILITY: '#64748b',
};

function parsePositiveId(
  value: string | null,
) {
  const parsed = Number.parseInt(
    value ?? '',
    10,
  );

  return Number.isInteger(parsed) &&
    parsed > 0
    ? parsed
    : null;
}

function sportPresentation(
  sport: string,
) {
  return (
    SPORT_PRESENTATION[sport] ?? {
      label: 'Other',
      emoji: '🏆',
    }
  );
}

function buildFormation(
  sport: string,
  squadSize: number,
): FormationRow[] {
  const base =
    BASE_FORMATIONS[sport] ?? [];

  const rows: FormationRow[] = [];
  let remaining = squadSize;

  for (const row of base) {
    if (remaining <= 0) {
      break;
    }

    const count = Math.min(
      remaining,
      row.positions.length,
    );

    rows.push({
      row: row.row,
      positions: row.positions.slice(
        0,
        count,
      ),
    });

    remaining -= count;
  }

  if (remaining > 0) {
    rows.push({
      row:
        rows.length > 0
          ? 'Bench'
          : 'Squad',
      positions: Array.from(
        { length: remaining },
        () => 'SUB',
      ),
    });
  }

  return rows;
}

function buildSlots(
  formation: FormationRow[],
): SquadSlot[] {
  const counters: Record<
    string,
    number
  > = {};

  return formation.flatMap((row) =>
    row.positions.map((pos) => {
      counters[pos] =
        (counters[pos] ?? 0) + 1;

      return {
        row: row.row,
        pos,
        slotId:
          `${row.row}-${pos}-` +
          counters[pos],
      };
    }),
  );
}

function numericValue(
  value: string | number,
) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function previousPoints(
  player: FantasyPlayerApi,
) {
  const keys = [
    'total_points',
    'fantasy_points',
    'points',
    'score',
  ];

  for (const key of keys) {
    const value =
      player.previous_stats[key];

    if (
      typeof value === 'number' ||
      typeof value === 'string'
    ) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return numericValue(
    player.current_form,
  );
}

function playerValue(
  player: FantasyPlayerApi,
) {
  const price = Math.max(
    numericValue(player.final_price),
    1,
  );

  return (
    previousPoints(player) +
    numericValue(player.current_form) * 5
  ) / price;
}

function initials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  return (
    `${parts[0]?.[0] ?? ''}` +
    `${parts.at(-1)?.[0] ?? ''}`
  ).toUpperCase();
}

function shortName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return parts.at(-1) ?? name;
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

function mapTeamSquadToSlots(
  team: FantasyTeamApi,
  slots: SquadSlot[],
) {
  const nextSquad: Record<
    string,
    FantasyPlayerApi
  > = {};

  team.squad_players
    .filter((entry) => entry.is_active)
    .slice(0, slots.length)
    .forEach((entry, index) => {
      const slot = slots[index];

      if (slot) {
        nextSquad[slot.slotId] =
          entry.fantasy_player_detail;
      }
    });

  return nextSquad;
}

export default function FantasyTeamBuilder() {
  const navigate = useNavigate();
  const [searchParams] =
    useSearchParams();

  const competitionId =
    parsePositiveId(
      searchParams.get('competition'),
    );

  const requestedTeamId =
    parsePositiveId(
      searchParams.get('team'),
    );

  const leagueId =
    searchParams.get('league')?.trim() ??
    '';

  const privateJoinCode =
    searchParams
      .get('joinCode')
      ?.trim()
      .toUpperCase() ?? '';

  const [
    competition,
    setCompetition,
  ] =
    useState<FantasyCompetitionApi | null>(
      null,
    );

  const [team, setTeam] =
    useState<FantasyTeamApi | null>(
      null,
    );

  const [players, setPlayers] =
    useState<FantasyPlayerApi[]>([]);

  const [squad, setSquad] =
    useState<
      Record<string, FantasyPlayerApi>
    >({});

  const [teamName, setTeamName] =
    useState('');

  const [activeSlot, setActiveSlot] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState('');

  const [positionFilter, setPositionFilter] =
    useState('ALL');

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [
    createdTeamNotice,
    setCreatedTeamNotice,
  ] = useState<string | null>(null);

  const [reloadKey, setReloadKey] =
    useState(0);

  const validCompetitionId =
    competitionId !== null;

  useEffect(() => {
    let active = true;

    if (!competitionId) {
      setLoadError(
        'No valid fantasy competition was selected.',
      );
      setLoading(false);

      return () => {
        active = false;
      };
    }

    const loadBuilder = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        setActionError(null);

        const [
          competitionResponse,
          playersResponse,
          teamsResponse,
        ] = await Promise.all([
          fetchFantasyCompetitionDetail(
            competitionId,
          ),
          fetchFantasyPlayers(
            competitionId,
            {
              available: 'true',
            },
          ),
          fetchMyFantasyTeams(),
        ]);

        if (!active) {
          return;
        }

        const loadedCompetition =
          competitionResponse.data
            .competition;

        const loadedPlayers =
          playersResponse.data.results;

        const candidateTeams =
          teamsResponse.data.results.filter(
            (candidate) =>
              candidate
                .fantasy_competition ===
              competitionId,
          );

        const requestedTeam =
          requestedTeamId
            ? candidateTeams.find(
                (candidate) =>
                  candidate.id ===
                  requestedTeamId,
              )
            : null;

        const resolvedTeam =
          requestedTeam ??
          candidateTeams[0] ??
          null;

        const loadedFormation =
          buildFormation(
            loadedCompetition.sport,
            loadedCompetition.squad_size,
          );

        const loadedSlots =
          buildSlots(loadedFormation);

        setCompetition(
          loadedCompetition,
        );

        setPlayers(loadedPlayers);
        setTeam(resolvedTeam);

        setSquad(
          resolvedTeam
            ? mapTeamSquadToSlots(
                resolvedTeam,
                loadedSlots,
              )
            : {},
        );

        setTeamName(
          resolvedTeam?.name ??
            `My ${
              sportPresentation(
                loadedCompetition.sport,
              ).label
            } Team`,
        );

        setSaved(false);
      } catch (requestError) {
        console.error(
          'Failed to load fantasy team builder:',
          requestError,
        );

        if (active) {
          setLoadError(
            getApiErrorMessage(
              requestError,
              'We could not load the fantasy team builder.',
            ),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadBuilder();

    return () => {
      active = false;
    };
  }, [
    competitionId,
    reloadKey,
    requestedTeamId,
  ]);

  const formation = useMemo(
    () =>
      competition
        ? buildFormation(
            competition.sport,
            competition.squad_size,
          )
        : [],
    [competition],
  );

  const allSlots = useMemo(
    () => buildSlots(formation),
    [formation],
  );

  const currentSport = competition
    ? sportPresentation(
        competition.sport,
      )
    : sportPresentation('OTHER');

  const squadPlayers =
    Object.values(squad);

  const budget = numericValue(
    competition?.budget ?? 0,
  );

  const spent = squadPlayers.reduce(
    (total, player) =>
      total +
      numericValue(player.final_price),
    0,
  );

  const remaining =
    budget - spent;

  const budgetPercentage =
    budget > 0
      ? Math.min(
          (spent / budget) * 100,
          100,
        )
      : 0;

  const filledSlots =
    squadPlayers.length;

  const totalSlots =
    competition?.squad_size ?? 0;

  const clubCounts: Record<
    string,
    number
  > = {};

  for (const player of squadPlayers) {
    const key = String(player.club);

    clubCounts[key] =
      (clubCounts[key] ?? 0) + 1;
  }

  const topClub =
    Object.entries(clubCounts).sort(
      (left, right) =>
        right[1] - left[1],
    )[0];

  const topClubName = topClub
    ? squadPlayers.find(
        (player) =>
          String(player.club) ===
          topClub[0],
      )?.club_name
    : null;

  const rowSummary = formation.map(
    (row) => {
      const rowSlots =
        allSlots.filter(
          (slot) =>
            slot.row === row.row,
        );

      const filled =
        rowSlots.filter(
          (slot) =>
            Boolean(squad[slot.slotId]),
        ).length;

      return {
        label: row.row.toUpperCase(),
        filled,
        total: rowSlots.length,
      };
    },
  );

  const selectedPlayersAvailable =
    squadPlayers.every(
      (player) =>
        player.is_active &&
        player.is_available,
    );

  const clubLimitValid =
    Object.values(clubCounts).every(
      (count) =>
        count <=
        (competition
          ?.max_players_per_club ?? 0),
    );

  const squadSizeValid =
    filledSlots === totalSlots;

  const budgetValid =
    remaining >= -0.001;

  const isValid =
    Boolean(team) &&
    squadSizeValid &&
    clubLimitValid &&
    budgetValid &&
    selectedPlayersAvailable;

  const positionOptions =
    useMemo(() => {
      const positions = new Map<
        string,
        string
      >();

      for (const player of players) {
        positions.set(
          player.position,
          player.position_label,
        );
      }

      return Array.from(
        positions.entries(),
      )
        .map(([value, label]) => ({
          value,
          label,
        }))
        .sort((left, right) =>
          left.label.localeCompare(
            right.label,
          ),
        );
    }, [players]);

  const activePlayer = activeSlot
    ? squad[activeSlot]
    : undefined;

  const replacementBudget =
    remaining +
    (activePlayer
      ? numericValue(
          activePlayer.final_price,
        )
      : 0);

  const replacementClubCounts = {
    ...clubCounts,
  };

  if (activePlayer) {
    const key = String(
      activePlayer.club,
    );

    replacementClubCounts[key] =
      Math.max(
        (replacementClubCounts[key] ??
          1) - 1,
        0,
      );
  }

  const usedPlayerIds = new Set(
    squadPlayers
      .filter(
        (player) =>
          player.id !== activePlayer?.id,
      )
      .map((player) => player.id),
  );

  const normalizedSearch =
    search.trim().toLowerCase();

  const playerPool = players
    .filter(
      (player) =>
        !usedPlayerIds.has(player.id),
    )
    .filter(
      (player) =>
        player.is_active &&
        player.is_available,
    )
    .filter(
      (player) =>
        positionFilter === 'ALL' ||
        player.position ===
          positionFilter,
    )
    .filter(
      (player) =>
        !normalizedSearch ||
        player.display_name
          .toLowerCase()
          .includes(normalizedSearch) ||
        player.club_name
          .toLowerCase()
          .includes(normalizedSearch),
    )
    .filter(
      (player) =>
        numericValue(
          player.final_price,
        ) <= replacementBudget + 0.001,
    )
    .filter(
      (player) =>
        (replacementClubCounts[
          String(player.club)
        ] ?? 0) <
        (competition
          ?.max_players_per_club ??
          Number.MAX_SAFE_INTEGER),
    )
    .sort(
      (left, right) =>
        playerValue(right) -
          playerValue(left) ||
        numericValue(
          left.final_price,
        ) -
          numericValue(
            right.final_price,
          ),
    );

  const assignPlayer = (
    slotId: string,
    player: FantasyPlayerApi,
  ) => {
    setSquad((current) => ({
      ...current,
      [slotId]: player,
    }));

    setActiveSlot(null);
    setActionError(null);
    setSaved(false);
  };

  const removePlayer = (
    slotId: string,
  ) => {
    setSquad((current) => {
      const next = { ...current };

      delete next[slotId];

      return next;
    });

    setActionError(null);
    setSaved(false);
  };

  const clearSquad = () => {
    setSquad({});
    setActiveSlot(null);
    setActionError(null);
    setSaved(false);
  };

  const autoPick = () => {
    if (!competition) {
      return;
    }

    const nextSquad = {
      ...squad,
    };

    let budgetLeft =
      competition
        ? numericValue(
            competition.budget,
          ) -
          Object.values(
            nextSquad,
          ).reduce(
            (total, player) =>
              total +
              numericValue(
                player.final_price,
              ),
            0,
          )
        : 0;

    const usedIds = new Set(
      Object.values(nextSquad).map(
        (player) => player.id,
      ),
    );

    const autoClubCounts: Record<
      string,
      number
    > = {};

    for (
      const player of Object.values(
        nextSquad,
      )
    ) {
      const key = String(player.club);

      autoClubCounts[key] =
        (autoClubCounts[key] ?? 0) + 1;
    }

    for (const slot of allSlots) {
      if (nextSquad[slot.slotId]) {
        continue;
      }

      const candidates = players
        .filter(
          (player) =>
            player.is_active &&
            player.is_available,
        )
        .filter(
          (player) =>
            !usedIds.has(player.id),
        )
        .filter(
          (player) =>
            numericValue(
              player.final_price,
            ) <= budgetLeft + 0.001,
        )
        .filter(
          (player) =>
            (autoClubCounts[
              String(player.club)
            ] ?? 0) <
            competition
              .max_players_per_club,
        )
        .sort(
          (left, right) =>
            playerValue(right) -
              playerValue(left) ||
            numericValue(
              left.final_price,
            ) -
              numericValue(
                right.final_price,
              ),
        );

      const selected = candidates[0];

      if (!selected) {
        continue;
      }

      nextSquad[slot.slotId] =
        selected;

      usedIds.add(selected.id);

      const clubKey = String(
        selected.club,
      );

      autoClubCounts[clubKey] =
        (autoClubCounts[clubKey] ??
          0) + 1;

      budgetLeft -= numericValue(
        selected.final_price,
      );
    }

    setSquad(nextSquad);
    setSaved(false);

    if (
      Object.keys(nextSquad).length <
      competition.squad_size
    ) {
      setActionError(
        'Auto Pick could not complete the squad with the currently available players, budget and club limits.',
      );
    } else {
      setActionError(null);
    }
  };

  const handleCreateTeam =
    async () => {
      const cleanName =
        teamName.trim();

      if (
        !competition ||
        !cleanName
      ) {
        return;
      }

      try {
        setCreating(true);
        setActionError(null);
        setCreatedTeamNotice(null);

        const response =
          await createFantasyTeam({
            fantasy_competition_id:
              competition.id,
            name: cleanName,
          });

        const createdTeam =
          response.data.team;

        setTeam(createdTeam);
        setSquad({});
        setTeamName(createdTeam.name);

        let notice =
          'Your fantasy team was created successfully.';

        if (privateJoinCode) {
          try {
            const joinResponse =
              await joinPrivateFantasyLeague({
                fantasy_team_id:
                  createdTeam.id,
                join_code:
                  privateJoinCode,
              });

            notice =
              `Your team was created and joined ` +
              `${joinResponse.data.membership.fantasy_league_detail.name}.`;
          } catch (joinError) {
            console.error(
              'Team created but private league joining failed:',
              joinError,
            );

            setActionError(
              'Your team was created, but it could not be added to the private league automatically. You can join it later using the private code.',
            );
          }
        }

        setCreatedTeamNotice(notice);
      } catch (requestError) {
        console.error(
          'Failed to create fantasy team:',
          requestError,
        );

        setActionError(
          getApiErrorMessage(
            requestError,
            'The fantasy team could not be created.',
          ),
        );
      } finally {
        setCreating(false);
      }
    };

  const handleSaveSquad =
    async () => {
      if (
        !team ||
        !competition ||
        !isValid
      ) {
        return;
      }

      const playerIds = allSlots
        .map(
          (slot) =>
            squad[slot.slotId]?.id,
        )
        .filter(
          (
            playerId,
          ): playerId is number =>
            typeof playerId ===
            'number',
        );

      try {
        setSaving(true);
        setActionError(null);

        const response =
          await updateFantasySquad(
            team.id,
            {
              player_ids: playerIds,
            },
          );

        const updatedTeam =
          response.data.team;

        setTeam(updatedTeam);

        setSquad(
          mapTeamSquadToSlots(
            updatedTeam,
            allSlots,
          ),
        );

        setSaved(true);
        setActiveSlot(null);
      } catch (requestError) {
        console.error(
          'Failed to save fantasy squad:',
          requestError,
        );

        setActionError(
          getApiErrorMessage(
            requestError,
            'The fantasy squad could not be saved.',
          ),
        );
      } finally {
        setSaving(false);
      }
    };

  const openPlayerMarket = () => {
    if (
      !competition ||
      !team
    ) {
      return;
    }

    const query =
      new URLSearchParams({
        competition: String(
          competition.id,
        ),
        team: String(team.id),
        budget: Math.max(
          remaining,
          0,
        ).toFixed(2),
      });

    if (leagueId) {
      query.set(
        'league',
        leagueId,
      );
    }

    navigate(
      `/fantasy/player-market?${query.toString()}`,
    );
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.stateCard}>
          <RefreshCw
            className={styles.stateSpinner}
            size={32}
          />

          <h2>
            Loading Team Builder
          </h2>

          <p>
            Fetching the competition,
            available players and your
            existing fantasy team.
          </p>
        </div>
      </div>
    );
  }

  if (
    loadError ||
    !competition
  ) {
    return (
      <div className={styles.page}>
        <div className={styles.stateCard}>
          <AlertCircle size={34} />

          <h2>
            Team Builder Unavailable
          </h2>

          <p>
            {loadError ??
              'Fantasy competition not found.'}
          </p>

          <div
            className={styles.stateActions}
          >
            <button
              className={styles.continueBtn}
              disabled={
                !validCompetitionId
              }
              onClick={() =>
                setReloadKey(
                  (current) =>
                    current + 1,
                )
              }
            >
              Try Again
            </button>

            <button
              className={styles.secondaryBtn}
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

  const leagueLabel = leagueId
    ? `League #${leagueId}`
    : competition.name;

  return (
    <div className={styles.page}>
      <div className={styles.topNav}>
        <div className={styles.breadcrumb}>
          <span
            onClick={() =>
              navigate('/fantasy')
            }
            className={styles.breadLink}
          >
            Fantasy
          </span>

          <span
            className={styles.breadSep}
          >
            ›
          </span>

          <span
            onClick={() =>
              navigate(
                `/fantasy/select?competition=${competition.id}`,
              )
            }
            className={styles.breadLink}
          >
            {competition.name}
          </span>

          <span
            className={styles.breadSep}
          >
            ›
          </span>

          <span>{leagueLabel}</span>
        </div>

        <div
          className={styles.topNavActions}
        >
          <div
            className={
              styles.competitionBadge
            }
          >
            <span
              className={
                styles.compBadgeEmoji
              }
            >
              {currentSport.emoji}
            </span>

            <span>
              {currentSport.label}
            </span>
          </div>

          {team && !saved && (
            <>
              <button
                type="button"
                className={
                  styles.autoPickBtn
                }
                disabled={
                  players.length === 0
                }
                onClick={autoPick}
              >
                <Sparkles size={16} />
                Auto Pick
              </button>

              <button
                type="button"
                className={styles.clearBtn}
                disabled={
                  filledSlots === 0
                }
                onClick={clearSquad}
              >
                <Trash2 size={16} />
                Clear Squad
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.pageHeader}>
        <div className={styles.leagueBadge}>
          <div
            className={
              styles.leagueBadgeIcon
            }
          >
            <Trophy size={32} />
          </div>

          <div>
            <h1>
              {team
                ? 'BUILD YOUR SQUAD'
                : 'CREATE YOUR TEAM'}
            </h1>

            <p>
              {competition.name}
              {' · '}
              {competition.season ||
                'Current Season'}
              {' · '}
              {competition.status}
            </p>
          </div>
        </div>
      </div>

      {actionError && (
        <div
          className={styles.apiError}
          role="alert"
        >
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {!team ? (
        <div
          className={
            styles.teamSetupCard
          }
        >
          <div
            className={
              styles.teamSetupHeader
            }
          >
            <div
              className={
                styles.teamSetupIcon
              }
            >
              {currentSport.emoji}
            </div>

            <div>
              <h2>
                Create Your Fantasy Team
              </h2>

              <p>
                One team can be created per
                fantasy competition.
              </p>
            </div>
          </div>

          <div
            className={
              styles.teamSetupStats
            }
          >
            <div>
              <Wallet size={18} />
              <span>Budget</span>
              <strong>
                {competition.budget}
                {' '}credits
              </strong>
            </div>

            <div>
              <Users size={18} />
              <span>Squad</span>
              <strong>
                {
                  competition
                    .squad_size
                }
                {' '}players
              </strong>
            </div>

            <div>
              <Shield size={18} />
              <span>Club limit</span>
              <strong>
                {
                  competition
                    .max_players_per_club
                }
                {' '}players
              </strong>
            </div>
          </div>

          <div
            className={
              styles.teamSetupField
            }
          >
            <label
              htmlFor="fantasy-team-name"
            >
              Team name
            </label>

            <input
              id="fantasy-team-name"
              type="text"
              maxLength={120}
              value={teamName}
              placeholder="Enter your fantasy team name"
              onChange={(event) =>
                setTeamName(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter'
                ) {
                  void handleCreateTeam();
                }
              }}
            />
          </div>

          {competition.status !==
            'OPEN' && (
            <div
              className={
                styles.setupWarning
              }
            >
              <AlertCircle size={17} />

              This competition is not open
              for new team creation.
            </div>
          )}

          <div
            className={
              styles.teamSetupActions
            }
          >
            <button
              className={
                styles.continueBtn
              }
              disabled={
                !teamName.trim() ||
                creating ||
                competition.status !==
                  'OPEN'
              }
              onClick={
                handleCreateTeam
              }
            >
              {creating
                ? 'Creating Team…'
                : 'Create Fantasy Team'}
            </button>

            <button
              className={
                styles.secondaryBtn
              }
              onClick={() =>
                navigate(
                  `/fantasy/create-league?competition=${competition.id}`,
                )
              }
            >
              Back to League Options
            </button>
          </div>
        </div>
      ) : saved ? (
        <div className={styles.savedState}>
          <div
            className={styles.savedIcon}
          >
            ✅
          </div>

          <h2>Squad Saved!</h2>

          <p>
            <strong>{team.name}</strong>
            {' '}now has
            {' '}
            {team.active_squad_count}
            {' '}active players for
            {' '}
            <strong>
              {competition.name}
            </strong>
            .
          </p>

          <div
            className={
              styles.savedActions
            }
          >
            <button
              className={
                styles.continueBtn
              }
              onClick={() =>
                navigate('/fantasy')
              }
            >
              Back to Fantasy Hub
            </button>

            <button
              className={
                styles.secondaryBtn
              }
              onClick={() =>
                setSaved(false)
              }
            >
              Edit Squad
            </button>
          </div>
        </div>
      ) : players.length === 0 ? (
        <div
          className={
            styles.emptyDataState
          }
        >
          <Users size={36} />

          <h2>No Players Available</h2>

          <p>
            Active and available players
            must be configured for this
            competition before a squad can
            be built.
          </p>
        </div>
      ) : (
        <>
          {createdTeamNotice && (
            <div
              className={
                styles.apiSuccess
              }
            >
              <CircleCheck size={18} />
              <span>
                {createdTeamNotice}
              </span>
            </div>
          )}

          <div
            className={
              styles.suggestedShapeNote
            }
          >
            The pitch is a visual squad
            layout. Final validation uses
            the competition’s real squad
            size, budget, availability and
            club-limit rules.
          </div>

          <div
            className={styles.mainLayout}
          >
            <div
              className={
                styles.leftSidebar
              }
            >
              <div
                className={
                  styles.sideWidget
                }
              >
                <div
                  className={
                    styles.sideWidgetLabel
                  }
                >
                  BUDGET
                </div>

                <div
                  className={
                    styles.budgetDisplay
                  }
                >
                  <div
                    className={
                      styles.budgetRing
                    }
                  >
                    <svg
                      viewBox="0 0 40 40"
                      className={
                        styles.ringsvg
                      }
                    >
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="4"
                      />

                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="none"
                        stroke="#8135FA"
                        strokeWidth="4"
                        strokeDasharray={
                          `${budgetPercentage} 100`
                        }
                        strokeLinecap="round"
                        transform="rotate(-90 20 20)"
                      />
                    </svg>

                    <span
                      className={
                        styles.ringLabel
                      }
                    >
                      <Wallet size={20} />
                    </span>
                  </div>

                  <div>
                    <div
                      className={
                        styles.budgetTotal
                      }
                    >
                      {budget.toFixed(2)}
                    </div>

                    <div
                      className={
                        styles.budgetCurrency
                      }
                    >
                      CREDITS
                    </div>
                  </div>
                </div>

                <div
                  className={
                    styles.budgetRemaining
                  }
                >
                  <span
                    className={
                      styles
                        .budgetRemainingLabel
                    }
                  >
                    Remaining Budget
                  </span>

                  <span
                    className={
                      styles
                        .budgetRemainingValue
                    }
                    style={{
                      color:
                        remaining < 0
                          ? '#ef4444'
                          : '#22c55e',
                    }}
                  >
                    {remaining.toFixed(2)}
                  </span>

                  <span
                    className={
                      styles
                        .budgetRemainingCurrency
                    }
                  >
                    Credits
                  </span>
                </div>
              </div>

              <div
                className={
                  styles.sideWidget
                }
              >
                <div
                  className={
                    styles.sideWidgetLabel
                  }
                >
                  SQUAD SIZE
                </div>

                <div
                  className={
                    styles.squadSizeDisplay
                  }
                >
                  <span
                    className={
                      styles
                        .squadSizeIcon
                    }
                  >
                    <Users size={20} />
                  </span>

                  <div
                    className={
                      styles
                        .squadSizeCount
                    }
                  >
                    <strong>
                      {filledSlots}
                    </strong>
                    {' '}/ {totalSlots}
                  </div>
                </div>

                <div
                  className={
                    styles
                      .squadSizeRemaining
                  }
                >
                  {Math.max(
                    totalSlots -
                      filledSlots,
                    0,
                  )}
                  {' '}players remaining
                </div>
              </div>

              <div
                className={
                  styles.sideWidget
                }
              >
                <div
                  className={
                    styles.sideWidgetLabel
                  }
                >
                  MAX PLAYERS PER CLUB
                </div>

                <div
                  className={
                    styles.clubLimit
                  }
                >
                  <span
                    className={
                      styles.clubLimitIcon
                    }
                  >
                    <Shield size={20} />
                  </span>

                  <div
                    className={
                      styles.clubLimitNum
                    }
                  >
                    <strong>
                      {topClub?.[1] ?? 0}
                    </strong>

                    <span>
                      Max
                      {' '}
                      {
                        competition
                          .max_players_per_club
                      }
                    </span>
                  </div>
                </div>

                {topClub &&
                  topClubName && (
                  <div
                    className={
                      styles.topClubRow
                    }
                  >
                    You have
                    {' '}
                    {topClub[1]}
                    {' '}players from
                    {' '}
                    <strong>
                      {topClubName}
                    </strong>
                  </div>
                )}
              </div>

              <button
                className={
                  styles.viewMarketBtn
                }
                onClick={openPlayerMarket}
              >
                View Player Market ↗
              </button>
            </div>

            <div
              className={styles.pitchArea}
            >
              <div
                className={styles.pitch}
              >
                <div
                  className={
                    styles.pitchCenter
                  }
                />

                <div
                  className={
                    styles.pitchLine
                  }
                  style={{ top: '22%' }}
                />

                <div
                  className={
                    styles.pitchLine
                  }
                  style={{ top: '44%' }}
                />

                <div
                  className={
                    styles.pitchLine
                  }
                  style={{ top: '66%' }}
                />

                <div
                  className={
                    styles.pitchLine
                  }
                  style={{ top: '88%' }}
                />

                {formation.map((row) => {
                  const rowSlots =
                    allSlots.filter(
                      (slot) =>
                        slot.row ===
                        row.row,
                    );

                  return (
                    <div
                      key={row.row}
                      className={
                        styles.pitchRow
                      }
                    >
                      {rowSlots.map(
                        (slot) => {
                          const player =
                            squad[
                              slot.slotId
                            ];

                          const isActive =
                            activeSlot ===
                            slot.slotId;

                          const color =
                            player
                              ? POSITION_COLORS[
                                  player
                                    .position
                                ] ??
                                '#8135FA'
                              : '#8135FA';

                          return (
                            <div
                              key={
                                slot.slotId
                              }
                              className={
                                `${styles.pitchSlot}` +
                                (
                                  isActive
                                    ? ` ${styles.pitchSlotActive}`
                                    : ''
                                )
                              }
                              onClick={() =>
                                setActiveSlot(
                                  isActive
                                    ? null
                                    : slot.slotId,
                                )
                              }
                            >
                              {player ? (
                                <div
                                  className={
                                    styles.playerCard
                                  }
                                >
                                  <button
                                    type="button"
                                    className={
                                      styles.removeX
                                    }
                                    aria-label={
                                      `Remove ${player.display_name}`
                                    }
                                    onClick={(
                                      event,
                                    ) => {
                                      event.stopPropagation();

                                      removePlayer(
                                        slot.slotId,
                                      );
                                    }}
                                  >
                                    <X
                                      size={14}
                                    />
                                  </button>

                                  <div
                                    className={
                                      styles
                                        .playerCardAvatar
                                    }
                                    style={{
                                      background:
                                        color,
                                    }}
                                  >
                                    {initials(
                                      player.display_name,
                                    )}
                                  </div>

                                  <div
                                    className={
                                      styles
                                        .playerCardName
                                    }
                                  >
                                    {shortName(
                                      player.display_name,
                                    )}
                                  </div>

                                  <div
                                    className={
                                      styles
                                        .playerCardClub
                                    }
                                  >
                                    {
                                      player
                                        .club_name
                                    }
                                  </div>

                                  <div
                                    className={
                                      styles
                                        .playerCardCost
                                    }
                                    style={{
                                      background:
                                        color,
                                    }}
                                  >
                                    {
                                      player
                                        .final_price
                                    }
                                    {' '}CR
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className={
                                    styles.emptySlot
                                  }
                                  style={{
                                    borderColor:
                                      color,
                                  }}
                                >
                                  <span
                                    className={
                                      styles
                                        .emptySlotPos
                                    }
                                    style={{
                                      color,
                                    }}
                                  >
                                    {slot.pos}
                                  </span>

                                  <span
                                    className={
                                      styles
                                        .emptySlotPlus
                                    }
                                  >
                                    <Plus
                                      size={16}
                                    />
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  );
                })}
              </div>

              <div
                className={
                  styles.pitchFooter
                }
              >
                <button
                  className={
                    styles.addPlayerBtn
                  }
                  onClick={() => {
                    const emptySlot =
                      allSlots.find(
                        (slot) =>
                          !squad[
                            slot.slotId
                          ],
                      );

                    if (emptySlot) {
                      setActiveSlot(
                        emptySlot.slotId,
                      );
                    }
                  }}
                >
                  + Add Player
                </button>

                <span
                  className={
                    styles.pitchHint
                  }
                >
                  Select a slot and choose
                  an available player.
                </span>
              </div>
            </div>

            <div
              className={
                styles.rightSidebar
              }
            >
              <div
                className={
                  styles.sideWidget
                }
              >
                <div
                  className={
                    styles.sideWidgetLabel
                  }
                >
                  SQUAD SUMMARY

                  <span
                    className={
                      styles.summaryCount
                    }
                  >
                    {filledSlots} /{' '}
                    {totalSlots}
                  </span>
                </div>

                {rowSummary.map(
                  (row) => (
                    <div
                      key={row.label}
                      className={
                        styles.summaryRow
                      }
                    >
                      <div
                        className={
                          styles
                            .summaryRowLeft
                        }
                      >
                        <div
                          className={
                            `${styles.summaryDot}` +
                            (
                              row.filled ===
                              row.total
                                ? ` ${styles.summaryDotFull}`
                                : ''
                            )
                          }
                        />

                        <span>
                          {row.label}
                          {' '}(
                          {row.filled}/
                          {row.total})
                        </span>
                      </div>

                      <div
                        className={
                          styles.summaryBar
                        }
                      >
                        <div
                          className={
                            styles
                              .summaryBarFill
                          }
                          style={{
                            width:
                              `${
                                row.total > 0
                                  ? (
                                      row.filled /
                                      row.total
                                    ) * 100
                                  : 0
                              }%`,
                            background:
                              row.filled ===
                              row.total
                                ? '#22c55e'
                                : '#8135FA',
                          }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div
                className={
                  styles.sideWidget
                }
                style={{
                  marginTop: 12,
                }}
              >
                <div
                  className={
                    styles.sideWidgetLabel
                  }
                >
                  BUDGET BREAKDOWN
                </div>

                <div
                  className={
                    styles.budgetBreakdown
                  }
                >
                  <div
                    className={styles.bbRow}
                  >
                    <span>
                      Total Budget
                    </span>

                    <span>
                      {budget.toFixed(2)}
                      {' '}CR
                    </span>
                  </div>

                  <div
                    className={styles.bbRow}
                  >
                    <span>Spent</span>

                    <span
                      style={{
                        color:
                          '#f97316',
                      }}
                    >
                      {spent.toFixed(2)}
                      {' '}CR
                    </span>
                  </div>

                  <div
                    className={styles.bbRow}
                  >
                    <span>Remaining</span>

                    <span
                      style={{
                        color:
                          budgetValid
                            ? '#22c55e'
                            : '#ef4444',
                      }}
                    >
                      {remaining.toFixed(2)}
                      {' '}CR
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.sideWidget
                }
                style={{
                  marginTop: 12,
                }}
              >
                <div
                  className={
                    styles.sideWidgetLabel
                  }
                >
                  SQUAD VALIDATION
                </div>

                <div
                  className={
                    styles.validationList
                  }
                >
                  <div
                    className={
                      `${styles.valItem} ` +
                      (
                        squadSizeValid
                          ? styles.valOk
                          : styles.valErr
                      )
                    }
                  >
                    {squadSizeValid
                      ? (
                        <Check
                          size={14}
                        />
                      )
                      : (
                        <X size={14} />
                      )}
                    Exactly
                    {' '}
                    {totalSlots}
                    {' '}players required
                  </div>

                  <div
                    className={
                      `${styles.valItem} ` +
                      (
                        clubLimitValid
                          ? styles.valOk
                          : styles.valErr
                      )
                    }
                  >
                    {clubLimitValid
                      ? (
                        <Check
                          size={14}
                        />
                      )
                      : (
                        <X size={14} />
                      )}
                    Max
                    {' '}
                    {
                      competition
                        .max_players_per_club
                    }
                    {' '}players per club
                  </div>

                  <div
                    className={
                      `${styles.valItem} ` +
                      (
                        budgetValid
                          ? styles.valOk
                          : styles.valErr
                      )
                    }
                  >
                    {budgetValid
                      ? (
                        <Check
                          size={14}
                        />
                      )
                      : (
                        <X size={14} />
                      )}
                    Within competition
                    budget
                  </div>

                  <div
                    className={
                      `${styles.valItem} ` +
                      (
                        selectedPlayersAvailable
                          ? styles.valOk
                          : styles.valErr
                      )
                    }
                  >
                    {selectedPlayersAvailable
                      ? (
                        <CircleCheck
                          size={14}
                        />
                      )
                      : (
                        <X size={14} />
                      )}
                    All selected players are
                    available
                  </div>
                </div>
              </div>

              <button
                className={
                  `${styles.continueBtn}` +
                  (
                    isValid
                      ? ` ${styles.continueBtnActive}`
                      : ''
                  )
                }
                disabled={
                  !isValid || saving
                }
                onClick={
                  handleSaveSquad
                }
              >
                {saving
                  ? 'Saving Squad…'
                  : 'Save Squad'}
              </button>

              {!isValid && (
                <p
                  className={
                    styles.continueNote
                  }
                >
                  Complete every validation
                  rule before saving.
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {team &&
        !saved &&
        activeSlot && (
        <div
          className={
            styles.marketDrawer
          }
        >
          <div
            className={
              styles.marketHeader
            }
          >
            <div>
              <strong>
                Player Market
              </strong>

              <span
                className={
                  styles.marketPos
                }
              >
                {' '}— select a player
              </span>
            </div>

            <button
              className={
                styles.marketClose
              }
              aria-label="Close player market"
              onClick={() =>
                setActiveSlot(null)
              }
            >
              <X size={16} />
            </button>
          </div>

          <div
            className={
              styles.marketControls
            }
          >
            <input
              className={
                styles.marketSearch
              }
              type="text"
              placeholder="Search players or clubs..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              autoFocus
            />

            <div
              className={
                styles.marketPosFilters
              }
            >
              <button
                className={
                  `${styles.marketPosBtn}` +
                  (
                    positionFilter ===
                    'ALL'
                      ? ` ${styles.marketPosBtnActive}`
                      : ''
                  )
                }
                onClick={() =>
                  setPositionFilter(
                    'ALL',
                  )
                }
              >
                All
              </button>

              {positionOptions.map(
                (position) => (
                  <button
                    key={
                      position.value
                    }
                    className={
                      `${styles.marketPosBtn}` +
                      (
                        positionFilter ===
                        position.value
                          ? ` ${styles.marketPosBtnActive}`
                          : ''
                      )
                    }
                    onClick={() =>
                      setPositionFilter(
                        position.value,
                      )
                    }
                  >
                    {position.label}
                  </button>
                ),
              )}
            </div>
          </div>

          <div
            className={
              styles.marketList
            }
          >
            {playerPool.length === 0 && (
              <div
                className={
                  styles.marketEmpty
                }
              >
                No players meet the current
                search, budget and club-limit
                rules.
              </div>
            )}

            {playerPool.map((player) => {
              const color =
                POSITION_COLORS[
                  player.position
                ] ?? '#8135FA';

              return (
                <div
                  key={player.id}
                  className={
                    styles.marketPlayer
                  }
                  onClick={() =>
                    assignPlayer(
                      activeSlot,
                      player,
                    )
                  }
                >
                  <div
                    className={
                      styles
                        .marketPlayerAvatar
                    }
                    style={{
                      background: color,
                    }}
                  >
                    {initials(
                      player.display_name,
                    )}
                  </div>

                  <div
                    className={
                      styles
                        .marketPlayerInfo
                    }
                  >
                    <strong>
                      {
                        player
                          .display_name
                      }
                    </strong>

                    <span>
                      {player.club_name}
                      {' · '}
                      <span
                        style={{
                          color,
                        }}
                      >
                        {
                          player
                            .position_label
                        }
                      </span>
                    </span>
                  </div>

                  <div
                    className={
                      styles
                        .marketPlayerStats
                    }
                  >
                    <span
                      className={
                        styles.marketPts
                      }
                    >
                      {Math.round(
                        previousPoints(
                          player,
                        ),
                      )}
                      {' '}pts
                    </span>

                    <span
                      className={
                        styles.marketForm
                      }
                    >
                      Form:
                      {' '}
                      {
                        player
                          .current_form
                      }
                    </span>
                  </div>

                  <div
                    className={
                      styles
                        .marketPlayerCost
                    }
                  >
                    {player.final_price}
                    {' '}CR
                  </div>

                  <button
                    className={
                      styles.marketAddBtn
                    }
                    aria-label={
                      `Add ${player.display_name}`
                    }
                  >
                    <Plus size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
