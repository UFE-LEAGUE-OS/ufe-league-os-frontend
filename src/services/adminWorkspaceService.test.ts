import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import apiClient from "./apiClient";
import {
  getClubAdminWorkspace,
  getLeagueAdminWorkspace,
  getSelectedClubWorkspace,
  getTicketingOfficerWorkspace,
  validateWorkspaceTicket,
} from "./adminWorkspaceService";

vi.mock("./apiClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedGet = vi.mocked(apiClient.get);
const mockedPost = vi.mocked(apiClient.post);

describe("adminWorkspaceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the live league admin workspace", async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        scope_type: "LEAGUE",
        scopes: [],
        summary: {
          leagues: 1,
          competitions: 2,
          upcoming_fixtures: 3,
          completed_matches: 4,
          official_appointments: 5,
        },
        upcoming_fixtures: [],
        recent_results: [],
      },
    });

    const result = await getLeagueAdminWorkspace();

    expect(mockedGet).toHaveBeenCalledWith(
      "/dashboards/league-admin/workspace/",
    );
    expect(result.summary.competitions).toBe(2);
  });

  it("loads the club admin workspace", async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        scope_type: "CLUB",
        club: {
          id: 1,
          name: "KOBS",
          short_name: "KOBS",
          slug: "kobs",
          sport: "RUGBY",
          sport_display: "Rugby",
          logo_url: null,
          primary_color: "",
          secondary_color: "",
        },
        summary: {
          competitions: 1,
          upcoming_fixtures: 2,
          completed_matches: 3,
          club_users: 4,
          ticket_types: 5,
          tickets_sold: 6,
          checked_in: 7,
        },
        league_memberships: [],
        upcoming_fixtures: [],
        recent_results: [],
        ticket_events: [],
        staff: [],
        recent_activity: [
          {
            id: 1,
            title: "New member registered",
            description: "John Doe",
            timestamp: "2026-07-10T10:00:00Z",
          },
        ],
        financial_overview: [
          {
            month: "Jun",
            income: 5000,
            expense: 3200,
          },
        ],
      },
    });

    const result = await getClubAdminWorkspace(1);

    expect(mockedGet).toHaveBeenCalledWith(
      "/dashboards/club-admin/workspace/?club_id=1",
    );
    expect(result.club.name).toBe("KOBS");
    expect(result.recent_activity?.[0].title).toBe(
      "New member registered",
    );
    expect(result.financial_overview?.[0].income).toBe(
      5000,
    );
  });

  it("loads a club admin workspace without activity or financial data", async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        scope_type: "CLUB",
        club: {
          id: 2,
          name: "Budo Eagles",
          short_name: "Budo",
          slug: "budo-eagles",
          sport: "FOOTBALL",
          sport_display: "Football",
          logo_url: null,
          primary_color: "",
          secondary_color: "",
        },
        summary: {
          competitions: 2,
          upcoming_fixtures: 2,
          completed_matches: 0,
          club_users: 2,
          ticket_types: 0,
          tickets_sold: 0,
          checked_in: 0,
        },
        league_memberships: [],
        upcoming_fixtures: [],
        recent_results: [],
        ticket_events: [],
        staff: [],
      },
    });

    const result = await getClubAdminWorkspace(2);

    expect(result.recent_activity).toBeUndefined();
    expect(result.financial_overview).toBeUndefined();
  });

  it("fails closed when the Club Admin API returns another Club scope", async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        scope_type: "CLUB",
        club: { id: 99 },
      },
    });

    await expect(getClubAdminWorkspace(2)).rejects.toThrow(
      "selected Club workspace",
    );
  });

  it("fails before requesting when legacy callers omit the selected Club scope", async () => {
    await expect(getClubAdminWorkspace()).rejects.toThrow(
      "selected Club workspace scope",
    );
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it("loads a selected normal Club entitlement without using its role as scope", async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        scope_type: "CLUB",
        club: { id: 5 },
      },
    });

    const result = await getSelectedClubWorkspace({
      entitlement_id: "club-chairman-5",
      dashboard: "CLUB_ADMIN",
      route: "/dashboard/club-admin",
      scope_type: "CLUB",
      scope_id: 5,
      workspace_role: "CHAIRMAN",
      permissions: [
        "dashboard.club_admin",
        "club.admin.manage",
      ],
    });

    expect(mockedGet).toHaveBeenCalledWith(
      "/dashboards/club-admin/workspace/?club_id=5",
    );
    expect(result.club.id).toBe(5);
  });

  it("rejects a forged Club context without its dashboard permission", async () => {
    await expect(
      getSelectedClubWorkspace({
        entitlement_id: "club-treasurer-5",
        dashboard: "CLUB_ADMIN",
        route: "/dashboard/club-admin",
        scope_type: "CLUB",
        scope_id: 5,
        workspace_role: "TREASURER",
        permissions: ["club.finance.view"],
      }),
    ).rejects.toThrow(
      "selected Club workspace entitlement is invalid",
    );
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it("maps a selected Club Ticketing scope into the shared Club shell", async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        available_scopes: [
          {
            key: "club:8",
            scope_type: "CLUB",
            id: 8,
            name: "KOBS",
            short_name: "KOBS",
            sport: "Rugby",
          },
        ],
        selected_scope: {
          key: "club:8",
          scope_type: "CLUB",
          id: 8,
          name: "KOBS",
          short_name: "KOBS",
          sport: "Rugby",
        },
        summary: {
          active_events: 2,
          tickets_sold: 30,
          checked_in: 11,
          pending_issues: 1,
        },
        events: [
          {
            id: 14,
            label: "KOBS vs Heathens",
            competition_id: 3,
            competition: "Premiership",
            league_id: 2,
            league: "Uganda Rugby",
            home_club_id: 8,
            home_club: "KOBS",
            away_club_id: 9,
            away_club: "Heathens",
            match_date: "2026-07-20T15:00:00Z",
            venue: "Legends",
            round: "Round 4",
            status: "SCHEDULED",
            home_score: null,
            away_score: null,
            ticket_types: 3,
            tickets_sold: 30,
            checked_in: 11,
          },
        ],
        recent_logs: [
          {
            id: 20,
            match_id: 14,
            match: "KOBS vs Heathens",
            scanned_by: "officer@example.com",
            result: "VALID",
            result_display: "Valid",
            message: "Ticket admitted.",
            created_at: "2026-07-20T15:01:00Z",
          },
        ],
      },
    });

    const result = await getSelectedClubWorkspace({
      entitlement_id: "club-ticketing-8",
      dashboard: "TICKETING_OFFICER",
      route: "/dashboard/ticketing-officer",
      scope_type: "CLUB",
      scope_id: 8,
      workspace_role: "TICKETING_OFFICER",
      permissions: [
        "dashboard.ticketing_officer",
        "club.ticketing.manage",
      ],
    });

    expect(mockedGet).toHaveBeenCalledWith(
      "/dashboards/ticketing-officer/workspace/?scope=club%3A8",
    );
    expect(result).toMatchObject({
      scope_type: "CLUB",
      club: { id: 8, name: "KOBS" },
      summary: {
        upcoming_fixtures: 2,
        ticket_types: 3,
        tickets_sold: 30,
        checked_in: 11,
      },
      ticketing_scope: {
        key: "club:8",
      },
      ticketing_pending_issues: 1,
    });
    expect(result.ticket_events).toHaveLength(1);
    expect(result.ticketing_logs?.[0].result).toBe("VALID");
  });

  it.each([
    {
      selectedScope: {
        key: "union:8",
        scope_type: "UNION",
        id: 8,
        name: "Union",
        short_name: "U",
        sport: "Rugby",
      },
      expected: "selected Club workspace",
    },
    {
      selectedScope: {
        key: "club:99",
        scope_type: "CLUB",
        id: 99,
        name: "Other Club",
        short_name: "Other",
        sport: "Rugby",
      },
      expected: "selected Club workspace",
    },
  ])(
    "fails closed when Ticketing selects another scope: $selectedScope.key",
    async ({ selectedScope, expected }) => {
      mockedGet.mockResolvedValueOnce({
        data: {
          available_scopes: [selectedScope],
          selected_scope: selectedScope,
          summary: {
            active_events: 0,
            tickets_sold: 0,
            checked_in: 0,
            pending_issues: 0,
          },
          events: [],
          recent_logs: [],
        },
      });

      await expect(
        getSelectedClubWorkspace({
          entitlement_id: "club-ticketing-8",
          dashboard: "TICKETING_OFFICER",
          route: "/dashboard/ticketing-officer",
          scope_type: "CLUB",
          scope_id: 8,
          workspace_role: "TICKETING_OFFICER",
          permissions: [
            "dashboard.ticketing_officer",
            "club.ticketing.manage",
          ],
        }),
      ).rejects.toThrow(expected);
    },
  );

  it("rejects malformed Ticketing event data before mapping it", async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        available_scopes: [
          {
            key: "club:8",
            scope_type: "CLUB",
            id: 8,
            name: "KOBS",
            short_name: "KOBS",
            sport: "Rugby",
          },
        ],
        selected_scope: {
          key: "club:8",
          scope_type: "CLUB",
          id: 8,
          name: "KOBS",
          short_name: "KOBS",
          sport: "Rugby",
        },
        summary: {
          active_events: 1,
          tickets_sold: 0,
          checked_in: 0,
          pending_issues: 0,
        },
        events: [{ id: 14 }],
        recent_logs: [],
      },
    });

    await expect(
      getSelectedClubWorkspace({
        entitlement_id: "club-ticketing-8",
        dashboard: "TICKETING_OFFICER",
        route: "/dashboard/ticketing-officer",
        scope_type: "CLUB",
        scope_id: 8,
        workspace_role: "TICKETING_OFFICER",
        permissions: [
          "dashboard.ticketing_officer",
          "club.ticketing.manage",
        ],
      }),
    ).rejects.toThrow("selected Club workspace");
  });

  it("loads a selected ticketing scope", async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        available_scopes: [],
        selected_scope: {
          key: "union:1",
          scope_type: "UNION",
          id: 1,
          name: "Uganda Rugby Union",
          short_name: "URU",
          sport: "Rugby",
        },
        summary: {
          active_events: 0,
          tickets_sold: 0,
          checked_in: 0,
          pending_issues: 0,
        },
        events: [],
        recent_logs: [],
      },
    });

    await getTicketingOfficerWorkspace("union:1");

    expect(mockedGet).toHaveBeenCalledWith(
      "/dashboards/ticketing-officer/workspace/?scope=union%3A1",
    );
  });

  it("strips the QR prefix before validation", async () => {
    mockedPost.mockResolvedValueOnce({
      data: {
        result: "VALID",
        message: "Ticket validated.",
      },
    });

    await validateWorkspaceTicket({
      scannedCode: "LOS-TICKET:abc-123",
      matchId: 8,
    });

    expect(mockedPost).toHaveBeenCalledWith(
      "/ticketing/validate/",
      {
        scanned_code: "abc-123",
        match_id: 8,
      },
    );
  });
});
