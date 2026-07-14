import {
  render,
  screen,
} from '@testing-library/react';
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
import FantasyPage from './FantasyPage';
import {
  fetchFantasyOverview,
} from '../../services/fantasyService';
import type {
  FantasyOverview,
} from '../../services/fantasyService';

vi.mock(
  '../../services/fantasyService',
  () => ({
    fetchFantasyOverview: vi.fn(),
  }),
);

const overview: FantasyOverview = {
  competitions: [
    {
      id: 11,
      name:
        'Nile Special Rugby Fantasy',
      slug:
        'nile-special-rugby-fantasy',
      sport: 'RUGBY',
      sport_label: 'Rugby',
      season: '2025/26',
      status: 'OPEN',
      status_label: 'Open',
      budget: '100.00',
      squad_size: 15,
      lineup_size: 15,
      max_players_per_club: 4,
      rules_summary:
        'Build a rugby squad within budget.',
      teams_count: 18,
      players_count: 45,
      leagues_count: 3,
      linked_competition: {
        id: 7,
        name:
          'Nile Special Rugby Premiership',
        slug:
          'nile-special-rugby-premiership',
        season: '2025/26',
      },
      active_gameweek: {
        id: 5,
        fantasy_competition: 11,
        fantasy_competition_name:
          'Nile Special Rugby Fantasy',
        name: 'Gameweek 2',
        number: 2,
        matches: [],
        matches_count: 0,
        start_at:
          '2026-07-15T10:00:00Z',
        lock_at:
          '2026-07-16T14:00:00Z',
        end_at:
          '2026-07-17T20:00:00Z',
        status: 'OPEN',
        is_locked: false,
        can_submit_lineup: true,
      },
    },
  ],
  public_leagues: [
    {
      id: 3,
      fantasy_competition: 11,
      fantasy_competition_name:
        'Nile Special Rugby Fantasy',
      name: 'KOBS Fans League',
      league_type: 'PUBLIC',
      join_code: 'KOBS1234',
      created_by: 2,
      created_by_email:
        'admin@example.com',
      is_active: true,
      members_count: 8,
      created_at:
        '2026-07-10T10:00:00Z',
    },
  ],
  featured_players: [
    {
      id: 9,
      display_name:
        'Philip Wokorach',
      club_name: 'Heathens RFC',
      position: 'BACK',
      position_label: 'Back',
      final_price: '12.50',
      current_form: '8.20',
      is_available: true,
      availability_note: '',
      fantasy_competition: 11,
      fantasy_competition_name:
        'Nile Special Rugby Fantasy',
    },
  ],
  leaderboard: [
    {
      id: 21,
      name: 'Kampala Warriors',
      owner_name: 'Keith Seruyange',
      fantasy_competition: 11,
      fantasy_competition_name:
        'Nile Special Rugby Fantasy',
      total_points: '124.00',
      current_rank: 1,
      active_squad_count: 15,
    },
  ],
  my_teams: [
    {
      id: 21,
      name: 'Kampala Warriors',
      owner_name: 'Keith Seruyange',
      fantasy_competition: 11,
      fantasy_competition_name:
        'Nile Special Rugby Fantasy',
      total_points: '124.00',
      current_rank: 1,
      active_squad_count: 15,
    },
  ],
  summary: {
    competitions_count: 1,
    public_leagues_count: 1,
    players_count: 45,
    teams_count: 18,
  },
};

describe('FantasyPage', () => {
  beforeEach(() => {
    vi.mocked(
      fetchFantasyOverview,
    ).mockResolvedValue({
      data: overview,
    } as never);
  });

  it(
    'renders the fantasy overview response',
    async () => {
      render(
        <MemoryRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <FantasyPage />
        </MemoryRouter>,
      );

      expect(
        screen.getByText(
          /loading fantasy leagues/i,
        ),
      ).toBeInTheDocument();

      const competitionLabels =
        await screen.findAllByText(
          'Nile Special Rugby Fantasy',
        );

      expect(
        competitionLabels.length,
      ).toBeGreaterThanOrEqual(1);

      expect(
        screen.getByText(
          'Kampala Warriors',
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText('Gameweek 2'),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          /18 fantasy teams/i,
        ),
      ).toBeInTheDocument();

      expect(
        fetchFantasyOverview,
      ).toHaveBeenCalledTimes(1);
    },
  );
});
