import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  createFantasyLeague,
  fetchAvailableFantasyLeagues,
  fetchFantasyCompetitionDetail,
  fetchFantasyCompetitions,
  fetchFantasyOverview,
  fetchMyFantasyTeams,
  joinPrivateFantasyLeague,
} from './fantasyService';

const axiosMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('./apiClient.js', () => ({
  default: axiosMock,
}));

describe('fantasyService', () => {
  beforeEach(() => {
    axiosMock.get.mockReset();
    axiosMock.post.mockReset();
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

  it(
    'loads one fantasy competition',
    async () => {
      axiosMock.get.mockResolvedValue({
        data: {},
      });

      await fetchFantasyCompetitionDetail(
        11,
      );

      expect(
        axiosMock.get,
      ).toHaveBeenCalledWith(
        '/fantasy/competitions/11/',
      );
    },
  );

  it(
    'loads the authenticated users teams',
    async () => {
      axiosMock.get.mockResolvedValue({
        data: {
          count: 0,
          results: [],
        },
      });

      await fetchMyFantasyTeams();

      expect(
        axiosMock.get,
      ).toHaveBeenCalledWith(
        '/fantasy/teams/me/',
      );
    },
  );

  it(
    'loads available public leagues',
    async () => {
      axiosMock.get.mockResolvedValue({
        data: {
          count: 0,
          limit: 50,
          offset: 0,
          results: [],
        },
      });

      const params = {
        competition: 11,
        league_type:
          'PUBLIC' as const,
        limit: 50,
        offset: 0,
      };

      await fetchAvailableFantasyLeagues(
        params,
      );

      expect(
        axiosMock.get,
      ).toHaveBeenCalledWith(
        '/fantasy/leagues/available/',
        { params },
      );
    },
  );

  it(
    'creates a fantasy league',
    async () => {
      axiosMock.post.mockResolvedValue({
        data: {},
      });

      const payload = {
        fantasy_competition_id: 11,
        name: 'KOBS Fans League',
        league_type:
          'PRIVATE' as const,
      };

      await createFantasyLeague(payload);

      expect(
        axiosMock.post,
      ).toHaveBeenCalledWith(
        '/fantasy/leagues/',
        payload,
      );
    },
  );

  it(
    'joins a private fantasy league',
    async () => {
      axiosMock.post.mockResolvedValue({
        data: {},
      });

      const payload = {
        fantasy_team_id: 21,
        join_code: 'KOBS1234',
      };

      await joinPrivateFantasyLeague(
        payload,
      );

      expect(
        axiosMock.post,
      ).toHaveBeenCalledWith(
        '/fantasy/leagues/join/',
        payload,
      );
    },
  );
});
