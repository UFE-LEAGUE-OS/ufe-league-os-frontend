import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { useAuthStore } from "../../store/authStore";
import { useClubWorkspaceStore } from "../../store/clubWorkspaceStore";
import type {
  DashboardAccess,
  DashboardEntitlement,
} from "../../types/dashboardAccess";
import ClubAdminDashboard from "./ClubAdminDashboard";

const getSelectedClubWorkspaceMock = vi.hoisted(() =>
  vi.fn(),
);
const getClubSubscriptionsMock = vi.hoisted(() =>
  vi.fn(),
);
const getClubMembershipPlansMock = vi.hoisted(() =>
  vi.fn(),
);

vi.mock("../../services/adminWorkspaceService", () => ({
  getSelectedClubWorkspace: getSelectedClubWorkspaceMock,
  getApiErrorMessage: (_error: unknown, fallback: string) =>
    fallback,
}));

vi.mock("../../services/membershipService", () => ({
  getClubSubscriptions: getClubSubscriptionsMock,
  getClubMembershipPlans: getClubMembershipPlansMock,
  createMembershipPlan: vi.fn(),
  updateMembershipPlan: vi.fn(),
  formatMembershipCurrency: (value: number) => String(value),
}));

vi.mock("../../services/clubTicketingService", () => ({
  createTicketType: vi.fn(),
  formatTicketCurrency: (value: number) => String(value),
  getClubSalesSummary: vi.fn(),
  getMatchGateConfig: vi.fn(),
  getMatchTicketTypes: vi.fn(),
  saveMatchGateConfig: vi.fn(),
  setTicketTypeStatus: vi.fn(),
  updateTicketType: vi.fn(),
}));

vi.mock("./BrandingEditor", () => ({
  default: () => <p>Branding editor</p>,
}));
vi.mock("./ClubProfileEdit", () => ({
  default: () => <p>Club profile editor</p>,
}));
vi.mock("./MediaAssetLibrary", () => ({
  default: () => <p>Media assets</p>,
}));
vi.mock("./PublicClubPagePreview", () => ({
  default: () => <p>Public Club preview</p>,
}));
vi.mock("./UserManagement", () => ({
  default: () => <p>User management module</p>,
}));
vi.mock("./VenueManagement", () => ({
  default: () => <p>Venue management</p>,
}));

function entitlement(
  id: string,
  scopeId: number,
  workspaceRole: string,
  permissions: string[],
  dashboard: "CLUB_ADMIN" | "TICKETING_OFFICER" =
    "CLUB_ADMIN",
): DashboardEntitlement {
  return {
    id,
    dashboard,
    route:
      dashboard === "TICKETING_OFFICER"
        ? "/dashboard/ticketing-officer"
        : "/dashboard/club-admin",
    scope_type: "CLUB",
    scope_id: scopeId,
    workspace_role: workspaceRole,
    permissions,
  };
}

function access(
  entitlements: DashboardEntitlement[],
): DashboardAccess {
  return {
    version: 1,
    default_entitlement_id: entitlements[0]?.id ?? null,
    entitlements,
  };
}

function workspaceData(scopeId: number) {
  return {
    scope_type: "CLUB" as const,
    club: {
      id: scopeId,
      name: `Club ${scopeId}`,
      short_name: `C${scopeId}`,
      slug: `club-${scopeId}`,
      sport: "FOOTBALL",
      sport_display: "Football",
      logo_url: null,
      primary_color: "",
      secondary_color: "",
    },
    summary: {
      competitions: 0,
      upcoming_fixtures: 0,
      completed_matches: 0,
      club_users: 0,
      ticket_types: 0,
      tickets_sold: 0,
      checked_in: 0,
    },
    league_memberships: [],
    upcoming_fixtures: [],
    recent_results: [],
    ticket_events: [],
    staff: [],
  };
}

function setAccess(contract: DashboardAccess) {
  useAuthStore.setState({
    user: {
      id: 14,
      dashboard_access: contract,
    },
    accessToken: "access-token",
    refreshToken: "refresh-token",
    requiresEmailVerification: false,
    accessStatus: "ready",
  });
}

function renderDashboard(
  initialPath = "/dashboard/club-admin",
) {
  return render(
    <MemoryRouter
      initialEntries={[initialPath]}
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <Routes>
        <Route
          path="/dashboard/club-admin/*"
          element={<ClubAdminDashboard />}
        />
        <Route
          path="/dashboard/ticketing-officer/*"
          element={<ClubAdminDashboard />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  useClubWorkspaceStore.setState({
    selectedEntitlementId: null,
  });
  getSelectedClubWorkspaceMock.mockImplementation(
    (workspace: { scope_id: number }) =>
      Promise.resolve(workspaceData(workspace.scope_id)),
  );
  getClubSubscriptionsMock.mockResolvedValue([]);
  getClubMembershipPlansMock.mockResolvedValue([]);
});

describe("shared Club workspace", () => {
  it("automatically loads the one valid Club entitlement", async () => {
    const club = entitlement(
      "club-7",
      7,
      "TREASURER",
      ["club.finance.view"],
    );
    setAccess(access([club]));

    renderDashboard();

    await waitFor(() => {
      expect(
        getSelectedClubWorkspaceMock,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          entitlement_id: "club-7",
          scope_id: 7,
          permissions: ["club.finance.view"],
        }),
      );
    });
    expect(
      screen.getAllByRole("button", {
        name: "Finances",
      }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryAllByRole("button", {
        name: /user & permission management/i,
      }),
    ).toHaveLength(0);
  });

  it("requires explicit selection when multiple Club entitlements exist", async () => {
    const contract = access([
      entitlement(
        "club-7",
        7,
        "TREASURER",
        ["club.finance.view"],
      ),
      entitlement(
        "club-22",
        22,
        "TEAM_MANAGER",
        ["club.squad.manage"],
      ),
    ]);
    setAccess(contract);

    renderDashboard();

    expect(
      screen.getByText("Choose a Club workspace"),
    ).toBeInTheDocument();
    expect(
      getSelectedClubWorkspaceMock,
    ).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", {
        name: /club 22.*team manager/i,
      }),
    );

    await waitFor(() => {
      expect(
        getSelectedClubWorkspaceMock,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          entitlement_id: "club-22",
          scope_id: 22,
          permissions: ["club.squad.manage"],
        }),
      );
    });
    expect(
      useClubWorkspaceStore.getState()
        .selectedEntitlementId,
    ).toBe("club-22");
  });

  it("reloads the selected scope without combining permissions", async () => {
    const first = entitlement(
      "club-7",
      7,
      "TREASURER",
      ["club.finance.view"],
    );
    const second = entitlement(
      "club-22",
      22,
      "TEAM_MANAGER",
      ["club.squad.manage"],
    );
    setAccess(access([first, second]));
    useClubWorkspaceStore.setState({
      selectedEntitlementId: first.id,
    });

    renderDashboard();

    await screen.findByRole("combobox", {
      name: "Club workspace",
    });
    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Club workspace",
      }),
      { target: { value: second.id } },
    );

    await waitFor(() => {
      expect(
        getSelectedClubWorkspaceMock,
      ).toHaveBeenLastCalledWith(
        expect.objectContaining({
          entitlement_id: second.id,
          scope_id: 22,
          permissions: ["club.squad.manage"],
        }),
      );
    });
    expect(
      screen.queryAllByRole("button", {
        name: "Finances",
      }),
    ).toHaveLength(0);
    expect(
      screen.getAllByRole("button", {
        name: "Teams",
      }).length,
    ).toBeGreaterThan(0);
  });

  it("limits a Club Ticketing entitlement to ticketing navigation", async () => {
    const ticketing = entitlement(
      "club-ticketing-8",
      8,
      "TICKETING_OFFICER",
      [
        "club.events.manage",
        "club.profile.view",
        "club.reports.view",
        "club.ticketing.manage",
        "club.ticketing.validate",
        "dashboard.ticketing_officer",
      ],
      "TICKETING_OFFICER",
    );
    setAccess(access([ticketing]));

    renderDashboard("/dashboard/ticketing-officer");

    expect(
      (
        await screen.findAllByRole("button", {
          name: "Tickets",
        })
      ).length,
    ).toBeGreaterThan(0);
    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Tickets",
      })[0],
    );
    expect(
      screen.getByRole("button", {
        name: "Ticket Scanner",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Entry Logs",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryAllByRole("button", {
        name: "Matches",
      }),
    ).toHaveLength(0);
    expect(
      screen.queryAllByRole("button", {
        name: "Reports",
      }),
    ).toHaveLength(0);
  });

  it("fails closed for an invalid stored entitlement selection", () => {
    setAccess(
      access([
        entitlement(
          "club-7",
          7,
          "TREASURER",
          ["club.finance.view"],
        ),
      ]),
    );
    useClubWorkspaceStore.setState({
      selectedEntitlementId: "club-missing",
    });

    renderDashboard();

    expect(
      screen.getByText(
        "Club workspace access is unavailable",
      ),
    ).toBeInTheDocument();
    expect(
      getSelectedClubWorkspaceMock,
    ).not.toHaveBeenCalled();
  });
});
