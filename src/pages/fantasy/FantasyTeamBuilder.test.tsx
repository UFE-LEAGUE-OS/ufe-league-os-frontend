import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemoryRouter,
} from 'react-router-dom';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import FantasyTeamBuilder from './FantasyTeamBuilder';
import {
  createFantasyTeam,
  fetchFantasyCompetitionDetail,
  fetchFantasyPlayers,
  fetchMyFantasyTeams,
  joinPrivateFantasyLeague,
  updateFantasySquad,
} from '../../services/fantasyService';

vi.mock(
  '../../services/fantasyService',
  () => ({
    createFantasyTeam: vi.fn(),
    fetchFantasyCompetitionDetail:
      vi.fn(),
    fetchFantasyPlayers: vi.fn(),
    fetchMyFantasyTeams: vi.fn(),
    joinPrivateFantasyLeague:
      vi.fn(),
    updateFantasySquad: vi.fn(),
  }),
);

const competition = {
  id: 11,
  name:
    'Nile Special Rugby Fantasy',
  slug:
    'nile-special-rugby-fantasy',
  linked_competition: 7,
  linked_competition_label:
    'Nile Special Rugby Premiership',
  sport: 'RUGBY',
  season: '2025/26',
  status: 'OPEN',
  budget: '20.00',
  squad_size: 2,
  lineup_size: 2,
  max_players_per_club: 2,
  captain_multiplier: '2.00',
  min_player_price: '4.00',
  max_player_price: '15.00',
  default_player_price: '5.00',
  rules_summary:
    'Select two available players.',
  teams_count: 1,
  gameweeks_count: 2,
  created_at:
    '2026-07-10T10:00:00Z',
  updated_at:
    '2026-07-10T10:00:00Z',
};

const playerOne = {
  id: 9,
  fantasy_competition: 11,
  fantasy_competition_name:
    'Nile Special Rugby Fantasy',
  club: 2,
  club_name: 'Heathens RFC',
  display_name: 'Philip Wokorach',
  position: 'FLY_HALF',
  position_label: 'Fly Half',
  calculated_price: '8.00',
  final_price: '8.00',
  price_source: 'AUTO',
  price_source_label:
    'Auto Calculated',
  price_override_reason: '',
  price_locked_at: null,
  previous_stats: {
    total_points: 120,
  },
  current_form: '8.20',
  is_active: true,
  is_available: true,
  availability_note: '',
  created_at:
    '2026-07-10T10:00:00Z',
  updated_at:
    '2026-07-10T10:00:00Z',
};

const playerTwo = {
  ...playerOne,
  id: 10,
  club: 3,
  club_name: 'KOBS RFC',
  display_name: 'Ivan Magomu',
  position: 'CENTRE',
  position_label: 'Centre',
  final_price: '9.00',
  calculated_price: '9.00',
  previous_stats: {
    total_points: 110,
  },
};

const emptyTeam = {
  id: 21,
  owner: 4,
  owner_email:
    'fan@example.com',
  fantasy_competition: 11,
  fantasy_competition_name:
    'Nile Special Rugby Fantasy',
  name: 'Kampala Warriors',
  total_points: '0.00',
  current_rank: null,
  active_squad_count: 0,
  budget_used: '0.00',
  budget_remaining: '20.00',
  squad_players: [],
  created_at:
    '2026-07-10T10:00:00Z',
  updated_at:
    '2026-07-10T10:00:00Z',
};

const savedTeam = {
  ...emptyTeam,
  active_squad_count: 2,
  budget_used: '17.00',
  budget_remaining: '3.00',
  squad_players: [
    {
      id: 101,
      fantasy_team: 21,
      fantasy_player: 9,
      fantasy_player_detail:
        playerOne,
      price_at_selection: '8.00',
      is_active: true,
      joined_at:
        '2026-07-10T10:00:00Z',
      removed_at: null,
    },
    {
      id: 102,
      fantasy_team: 21,
      fantasy_player: 10,
      fantasy_player_detail:
        playerTwo,
      price_at_selection: '9.00',
      is_active: true,
      joined_at:
        '2026-07-10T10:00:00Z',
      removed_at: null,
    },
  ],
};

function renderBuilder(
  entry = '/fantasy/team-builder?competition=11&team=21&league=31',
) {
  return render(
    <MemoryRouter
      initialEntries={[entry]}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <FantasyTeamBuilder />
    </MemoryRouter>,
  );
}

describe('FantasyTeamBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(
      fetchFantasyCompetitionDetail,
    ).mockResolvedValue({
      data: {
        competition,
        gameweeks: [],
        leagues: [],
      },
    } as never);

    vi.mocked(
      fetchFantasyPlayers,
    ).mockResolvedValue({
      data: {
        count: 2,
        results: [
          playerOne,
          playerTwo,
        ],
      },
    } as never);

    vi.mocked(
      fetchMyFantasyTeams,
    ).mockResolvedValue({
      data: {
        count: 1,
        results: [emptyTeam],
      },
    } as never);

    vi.mocked(
      updateFantasySquad,
    ).mockResolvedValue({
      data: {
        message:
          'Fantasy squad updated successfully.',
        team: savedTeam,
      },
    } as never);

    vi.mocked(
      createFantasyTeam,
    ).mockResolvedValue({
      data: {
        message:
          'Fantasy team created successfully.',
        team: emptyTeam,
      },
    } as never);

    vi.mocked(
      joinPrivateFantasyLeague,
    ).mockResolvedValue({
      data: {
        message:
          'Fantasy league joined successfully.',
        membership: {
          id: 44,
          fantasy_league: 31,
          fantasy_league_detail: {
            id: 31,
            fantasy_competition: 11,
            fantasy_competition_name:
              'Nile Special Rugby Fantasy',
            name: 'KOBS Fans League',
            league_type:
              'PRIVATE',
            join_code:
              'KOBS1234',
            created_by: 4,
            created_by_email:
              'fan@example.com',
            is_active: true,
            members_count: 1,
            created_at:
              '2026-07-10T10:00:00Z',
          },
          fantasy_team: 21,
          fantasy_team_name:
            'Kampala Warriors',
          joined_at:
            '2026-07-10T10:00:00Z',
        },
      },
    } as never);
  });

  it(
    'auto-picks and submits a complete real squad',
    async () => {
      const user = userEvent.setup();

      renderBuilder();

      expect(
        screen.getByText(
          /loading team builder/i,
        ),
      ).toBeInTheDocument();

      expect(
        await screen.findByText(
          /build your squad/i,
        ),
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole('button', {
          name: /auto pick/i,
        }),
      );

      await user.click(
        screen.getByRole('button', {
          name: /save squad/i,
        }),
      );

      await waitFor(() => {
        expect(
          updateFantasySquad,
        ).toHaveBeenCalledWith(
          21,
          {
            player_ids:
              expect.arrayContaining([
                9,
                10,
              ]),
          },
        );
      });

      const payload =
        vi.mocked(
          updateFantasySquad,
        ).mock.calls[0]?.[1];

      expect(
        payload?.player_ids,
      ).toHaveLength(2);

      expect(
        await screen.findByText(
          /squad saved/i,
        ),
      ).toBeInTheDocument();
    },
  );

  it(
    'creates a team and joins the supplied private league',
    async () => {
      const user = userEvent.setup();

      vi.mocked(
        fetchMyFantasyTeams,
      ).mockResolvedValue({
        data: {
          count: 0,
          results: [],
        },
      } as never);

      renderBuilder(
        '/fantasy/team-builder?competition=11&league=31&joinCode=KOBS1234',
      );

      const input =
        await screen.findByLabelText(
          /team name/i,
        );

      await user.clear(input);

      await user.type(
        input,
        'Kampala Warriors',
      );

      await user.click(
        screen.getByRole('button', {
          name:
            /create fantasy team/i,
        }),
      );

      await waitFor(() => {
        expect(
          createFantasyTeam,
        ).toHaveBeenCalledWith({
          fantasy_competition_id: 11,
          name: 'Kampala Warriors',
        });
      });

      await waitFor(() => {
        expect(
          joinPrivateFantasyLeague,
        ).toHaveBeenCalledWith({
          fantasy_team_id: 21,
          join_code: 'KOBS1234',
        });
      });

      expect(
        await screen.findByText(
          /created and joined kobs fans league/i,
        ),
      ).toBeInTheDocument();
    },
  );
});
