import { beforeEach, describe, expect, it } from 'vitest';

import { useClubWorkspaceStore } from './clubWorkspaceStore';

describe('Club workspace selection store', () => {
  beforeEach(() => {
    sessionStorage.clear();
    useClubWorkspaceStore.setState({
      selectedEntitlementId: null,
    });
  });

  it('retains an explicit entitlement selection during route navigation', () => {
    useClubWorkspaceStore
      .getState()
      .selectEntitlement('club-scope-17');

    expect(
      useClubWorkspaceStore.getState().selectedEntitlementId,
    ).toBe('club-scope-17');
    expect(
      sessionStorage.getItem(
        'league_os_club_workspace_entitlement',
      ),
    ).toBe('club-scope-17');
  });

  it('clears the active workspace without changing an authenticated user', () => {
    useClubWorkspaceStore
      .getState()
      .selectEntitlement('club-scope-17');
    useClubWorkspaceStore.getState().clearSelection();

    expect(
      useClubWorkspaceStore.getState().selectedEntitlementId,
    ).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });
});
