import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  fetchFantasyCompetitions,
  fetchFantasyOverview,
} from './fantasyService';

const axiosMock = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('./apiClient.js', () => ({
  default: axiosMock,
}));

describe('fantasyService', () => {
  beforeEach(() => {
    axiosMock.get.mockReset();
  });

  it(
    'loads the optimized fantasy hub endpoint',
    async () => {
      axiosMock.get.mockResolvedValue({
        data: {},
      });

      await fetchFantasyOverview();

      expect(
        axiosMock.get,
      ).toHaveBeenCalledWith(
        '/fantasy/overview/',
      );
    },
  );

  it(
    'loads fantasy competitions with filters',
    async () => {
      axiosMock.get.mockResolvedValue({
        data: {
          count: 0,
          results: [],
        },
      });

      await fetchFantasyCompetitions({
        sport: 'RUGBY',
        status: 'OPEN',
      });

      expect(
        axiosMock.get,
      ).toHaveBeenCalledWith(
        '/fantasy/competitions/',
        {
          params: {
            sport: 'RUGBY',
            status: 'OPEN',
          },
        },
      );
    },
  );
});
