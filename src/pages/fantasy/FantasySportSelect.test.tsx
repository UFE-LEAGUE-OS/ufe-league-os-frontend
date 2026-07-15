import {
  render,
  screen,
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
import FantasySportSelect from './FantasySportSelect';
import {
  fetchFantasyCompetitions,
} from '../../services/fantasyService';

vi.mock(
  '../../services/fantasyService',
  () => ({
    fetchFantasyCompetitions: vi.fn(),
  }),
);

function CreateJoinProbe() {
  const [params] = useSearchParams();

  return (
    <div>
      Create or join competition{' '}
      {params.get('competition')}
    </div>
  );
}

describe('FantasySportSelect', () => {
  beforeEach(() => {
    vi.mocked(
      fetchFantasyCompetitions,
    ).mockResolvedValue({
      data: {
        count: 1,
        results: [
          {
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
          },
        ],
      },
    } as never);
  });

  it(
    'loads and forwards the selected competition',
    async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter
          initialEntries={[
            '/fantasy/select?competition=11',
          ]}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route
              path="/fantasy/select"
              element={
                <FantasySportSelect />
              }
            />

            <Route
              path="/fantasy/create-league"
              element={<CreateJoinProbe />}
            />
          </Routes>
        </MemoryRouter>,
      );

      expect(
        screen.getByText(
          /loading fantasy competitions/i,
        ),
      ).toBeInTheDocument();

      const competitionNames =
        await screen.findAllByText(
          'Nile Special Rugby Fantasy',
        );

      expect(
        competitionNames.length,
      ).toBeGreaterThanOrEqual(1);

      expect(
        screen.getByText(
          /build a rugby squad within budget/i,
        ),
      ).toBeInTheDocument();

      expect(
        fetchFantasyCompetitions,
      ).toHaveBeenCalledTimes(1);

      await user.click(
        screen.getByRole('button', {
          name:
            /continue to create \/ join/i,
        }),
      );

      expect(
        await screen.findByText(
          'Create or join competition 11',
        ),
      ).toBeInTheDocument();
    },
  );
});
