import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  fetchFantasyOverview,
} from './fantasyService';

const axiosMock = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('./apiClient.js', () => ({
  default: axiosMock,
}));

describe('fantasyService', () => {
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
});
