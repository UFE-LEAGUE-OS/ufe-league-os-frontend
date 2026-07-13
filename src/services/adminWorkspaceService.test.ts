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

    const result = await getClubAdminWorkspace();

    expect(mockedGet).toHaveBeenCalledWith(
      "/dashboards/club-admin/workspace/",
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

    const result = await getClubAdminWorkspace();

    expect(result.recent_activity).toBeUndefined();
    expect(result.financial_overview).toBeUndefined();
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