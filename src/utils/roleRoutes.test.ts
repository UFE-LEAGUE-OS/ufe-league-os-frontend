import { describe, expect, it } from 'vitest';
import {
  getDefaultDashboardRoute,
  normalizeRole,
} from './roleRoutes';

describe('role dashboard routing', () => {
  it('normalizes match official role variants', () => {
    expect(normalizeRole('match official')).toBe('MATCH_OFFICIAL');
    expect(normalizeRole('match-official')).toBe('MATCH_OFFICIAL');
  });

  it('routes referees to the restricted official dashboard', () => {
    expect(getDefaultDashboardRoute('REFEREE')).toBe('/dashboard/referee');
  });

  it('routes match officials to the restricted official dashboard', () => {
    expect(getDefaultDashboardRoute('MATCH_OFFICIAL')).toBe(
      '/dashboard/referee',
    );
  });

  it('prefers the official dashboard when the user is also a fan', () => {
    expect(
      getDefaultDashboardRoute(['FAN', 'REFEREE']),
    ).toBe('/dashboard/referee');
  });
});
