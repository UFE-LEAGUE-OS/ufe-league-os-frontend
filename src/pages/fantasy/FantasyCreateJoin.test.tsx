import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemoryRouter,
  Route,
  Routes,
  useSearchParams,
} from 'react-router-dom';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import FantasyCreateJoin from './FantasyCreateJoin';
import {
  createFantasyLeague,
  fetchAvailableFantasyLeagues,
  fetchFantasyCompetitionDetail,
  fetchMyFantasyTeams,
  joinPrivateFantasyLeague,
} from '../../services/fantasyService';

vi.mock(
  '../../services/fantasyService',
  () => ({
    createFantasyLeague: vi.fn(),
    fetchAvailableFantasyLeagues:
      vi.fn(),
    fetchFantasyCompetitionDetail:
      vi.fn(),
    fetchMyFantasyTeams: vi.fn(),
    joinPrivateFantasyLeague: vi.fn(),
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
  budget: '100.00',
  squad_size: 15,
  lineup_size: 15,
  max_players_per_club: 4,
  captain_multiplier: '2.00',
  min_player_price: '4.00',
  max_player_price: '15.00',
  default_player_price: '5.00',
  rules_summary:
    'Build a rugby squad within budget.',
  teams_count: 18,
  gameweeks_count: 12,
  created_at:
    '2026-07-10T10:00:00Z',
  updated_at:
    '2026-07-10T10:00:00Z',
};

const team = {
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
  budget_remaining: '100.00',
  squad_players: [],
  created_at:
    '2026-07-10T10:00:00Z',
  updated_at:
    '2026-07-10T10:00:00Z',
};

const privateLeague = {
  id: 31,
  fantasy_competition: 11,
  fantasy_competition_name:
    'Nile Special Rugby Fantasy',
  name: 'KOBS Fans League',
  league_type:
    'PRIVATE' as const,
  join_code: 'KOBS1234',
  created_by: 4,
  created_by_email:
    'fan@example.com',
  is_active: true,
  members_count: 0,
  created_at:
    '2026-07-10T10:00:00Z',
};

const membership = {
  id: 41,
  fantasy_league: 31,
  fantasy_league_detail:
    privateLeague,
  fantasy_team: 21,
  fantasy_team_name:
    'Kampala Warriors',
  joined_at:
    '2026-07-10T10:00:00Z',
};

function TeamBuilderProbe() {
  const [params] = useSearchParams();

  return (
    <div>
      Team builder competition{' '}
      {params.get('competition')}
      {' '}team {params.get('team')}
      {' '}league {params.get('league')}
    </div>
  );
}

function renderPage() {
  return render(
    <MemoryRouter
      initialEntries={[
        '/fantasy/create-league?competition=11',
      ]}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route
          path="/fantasy/create-league"
          element={<FantasyCreateJoin />}
        />

        <Route
          path="/fantasy/team-builder"
          element={<TeamBuilderProbe />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('FantasyCreateJoin', () => {
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
      fetchMyFantasyTeams,
    ).mockResolvedValue({
      data: {
        count: 1,
        results: [team],
      },
    } as never);

    vi.mocked(
      fetchAvailableFantasyLeagues,
    ).mockResolvedValue({
      data: {
        count: 0,
        limit: 50,
        offset: 0,
        results: [],
      },
    } as never);

    vi.mocked(
      createFantasyLeague,
    ).mockResolvedValue({
      data: {
        message:
          'Fantasy league created successfully.',
        league: privateLeague,
      },
    } as never);

    vi.mocked(
      joinPrivateFantasyLeague,
    ).mockResolvedValue({
      data: {
        message:
          'Fantasy league joined successfully.',
        membership,
      },
    } as never);
  });

  it(
    'creates a private league and adds the existing team',
    async () => {
      const user = userEvent.setup();

      renderPage();

      expect(
        screen.getByText(
          /loading league options/i,
        ),
      ).toBeInTheDocument();

      expect(
        await screen.findByText(
          /your competition team/i,
        ),
      ).toBeInTheDocument();

      await user.type(
        screen.getByLabelText(
          /league name/i,
        ),
        'KOBS Fans League',
      );

      await user.click(
        screen.getByRole('button', {
          name: /^create league$/i,
        }),
      );

      await waitFor(() => {
        expect(
          createFantasyLeague,
        ).toHaveBeenCalledWith({
          fantasy_competition_id: 11,
          name: 'KOBS Fans League',
          league_type: 'PRIVATE',
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
          /league created/i,
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText('KOBS1234'),
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole('button', {
          name:
            /continue to team builder/i,
        }),
      );

      expect(
        await screen.findByText(
          'Team builder competition 11 team 21 league 31',
        ),
      ).toBeInTheDocument();
    },
  );

  it(
    'joins an existing private league using the competition team',
    async () => {
      const user = userEvent.setup();

      renderPage();

      await screen.findByText(
        /your competition team/i,
      );

      await user.click(
        screen.getByRole('button', {
          name: /join a league/i,
        }),
      );

      await user.type(
        screen.getByLabelText(
          /private league code/i,
        ),
        'KOBS1234',
      );

      await user.click(
        screen.getByRole('button', {
          name:
            /join private league/i,
        }),
      );

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
          /private league joined/i,
        ),
      ).toBeInTheDocument();
    },
  );
});
