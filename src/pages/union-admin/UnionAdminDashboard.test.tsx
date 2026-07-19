import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UnionAdminDashboard from "./UnionAdminDashboard";

const serviceMock = vi.hoisted(() => ({
  getMyUnionWorkspaces: vi.fn(),
  intersectUnionWorkspaceOptions: vi.fn(),
  getUnionDashboardOverview: vi.fn(),
  getUnionOperationsDashboard: vi.fn(),
  getUnionFinanceDashboard: vi.fn(),
  getUnionWorkspaceUsers: vi.fn(),
  createUnionWorkspaceUser: vi.fn(),
  switchUnionWorkspace: vi.fn(),
}));

vi.mock("../../services/unionAdminService", async () => {
  const actual = await vi.importActual<typeof import("../../services/unionAdminService")>(
    "../../services/unionAdminService",
  );
  return { ...actual, ...serviceMock };
});

vi.mock("../../hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ isLoading: false }),
}));

vi.mock("../../store/authStore", () => ({
  useAuthStore: (selector: (state: { user: unknown }) => unknown) =>
    selector({
      user: {
        dashboard_access: {
          version: 1,
          default_entitlement_id: "union-workspace-1",
          entitlements: [
            {
              id: "union-workspace-1",
              dashboard: "UNION_WORKSPACE",
              route: "/dashboard/union-admin",
              scope_type: "UNION_WORKSPACE",
              scope_id: 1,
              workspace_role: "UNION_ADMIN",
              permissions: [
                "union.dashboard.view",
                "union.users.manage",
                "union.competitions.manage",
                "union.teams.manage",
              ],
            },
          ],
        },
      },
    }),
}));

vi.mock("../../components/UnionAdminManagementWorkflow/UnionAdminManagementWorkflow", () => ({ default: () => <div /> }));
vi.mock("../../components/UnionAdminClubsPanel/UnionAdminClubsPanel", () => ({ default: () => <div /> }));
vi.mock("../../components/UnionAdminRefereesPanel/UnionAdminRefereesPanel", () => ({ default: () => <div /> }));
vi.mock("../../components/OfficialAppointmentsPanel/OfficialAppointmentsPanel", () => ({ default: () => <div /> }));
vi.mock("../../components/LeagueAdminScopesPanel/LeagueAdminScopesPanel", () => ({ default: () => <div /> }));

const workspace = {
  id: 1,
  name: "Union A",
  slug: "union-a",
  acronym: "UA",
  sport: "RUGBY",
  workspaceType: "UNION",
  description: "",
  primaryColor: "#000",
  role: "UNION_ADMIN" as const,
  roleDisplay: "Union Admin",
  permissions: ["union.dashboard.view", "union.users.manage", "union.competitions.manage", "union.teams.manage", "union.players.approve"],
  entitlementId: "union-workspace-1",
  entitlementRoute: "/dashboard/union-admin",
  scopeId: 1,
};

function overviewFor() {
  return {
    workspace,
    summary: {
      active_competitions: 3,
      member_clubs: 2,
      pending_approvals: 0,
      referees: 0,
      upcoming_matches: 0,
    },
    permissions: workspace.permissions,
  };
}

function renderDashboard() {
  return render(<MemoryRouter><UnionAdminDashboard /></MemoryRouter>);
}

describe("UnionAdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.getMyUnionWorkspaces.mockResolvedValue([workspace]);
    serviceMock.intersectUnionWorkspaceOptions.mockReturnValue([workspace]);
    serviceMock.getUnionDashboardOverview.mockResolvedValue(overviewFor());
    serviceMock.getUnionOperationsDashboard.mockResolvedValue({
      workspace: { slug: "union-a", acronym: "UA", name: "Union A", sport: "RUGBY" },
      competitions: [], clubs: [], national_teams: [], registrations: [], referees: [], appointments: [], player_positions: [],
    });
    serviceMock.getUnionWorkspaceUsers.mockResolvedValue({
      count: 0,
      workspace: "union-a",
      results: [],
    });
  });

  it("suppresses unsupported-module stat cards instead of presenting fixed operational figures", async () => {
    renderDashboard();

    await waitFor(() => expect(serviceMock.getUnionDashboardOverview).toHaveBeenCalledWith("union-a"));
    fireEvent.click(screen.getAllByRole("button", { name: "National Teams" })[0]);

    expect(screen.queryByText("Player Pool")).not.toBeInTheDocument();
    expect(screen.queryByText("52")).not.toBeInTheDocument();
  });

  it("keeps a successful overview when the independent workspace-user request fails", async () => {
    serviceMock.getUnionWorkspaceUsers.mockRejectedValue({
      response: { data: { detail: "User directory unavailable." } },
    });

    renderDashboard();

    await waitFor(() => expect(serviceMock.getUnionDashboardOverview).toHaveBeenCalledWith("union-a"));
    fireEvent.click(screen.getAllByRole("button", { name: "Users" })[0]);

    expect(await screen.findByText("User directory unavailable.")).toBeInTheDocument();
    expect(screen.queryByText(/workspace overview could not be loaded/i)).not.toBeInTheDocument();
  });

  it("does not request finance before the finance tab is selected", async () => {
    renderDashboard();

    await waitFor(() => expect(serviceMock.getUnionDashboardOverview).toHaveBeenCalledWith("union-a"));
    await waitFor(() => expect(serviceMock.getUnionFinanceDashboard).not.toHaveBeenCalled());
  });

  it("shows only safe overview metrics and never promotes placeholder Club, approval, or official values", async () => {
    serviceMock.getUnionOperationsDashboard.mockResolvedValue({
      workspace: { slug: "union-a", acronym: "UA", name: "Union A", sport: "RUGBY" },
      competitions: [],
      clubs: [{ id: "generated", name: "KOBS Rugby Club", players: 52 }],
      national_teams: [{ team: "National XV", category: "Senior", players: 52, staff: 8, status: "Active" }],
      registrations: [{ applicant: "Generated Applicant", club: "KOBS Rugby Club" }],
      referees: [{ name: "Generated Referee" }],
      appointments: [{ match: "Generated Fixture" }],
      player_positions: [],
    });

    renderDashboard();

    expect(await screen.findByText("Active Competitions")).toBeInTheDocument();
    expect(screen.getByText("Upcoming Matches")).toBeInTheDocument();
    expect(screen.queryByText("Clubs / Teams")).not.toBeInTheDocument();
    expect(screen.queryByText("Pending Approvals")).not.toBeInTheDocument();
    expect(screen.queryByText("Officials")).not.toBeInTheDocument();
    expect(screen.queryByText("KOBS Rugby Club")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "National Teams" })[0]);
    expect(screen.getByText("No maintained National Team management API is available for this workspace.")).toBeInTheDocument();
    expect(screen.queryByText("National XV")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Registrations" })[0]);
    expect(screen.getByText("No maintained registration approval API is available for this workspace.")).toBeInTheDocument();
    expect(screen.queryByText("Generated Applicant")).not.toBeInTheDocument();
    expect(screen.queryByText("Generated Referee")).not.toBeInTheDocument();
    expect(screen.queryByText("Generated Fixture")).not.toBeInTheDocument();
  });

  it("keeps an overview failure inside Overview and does not display zero metric cards", async () => {
    serviceMock.getUnionDashboardOverview.mockRejectedValue(new Error("unavailable"));

    renderDashboard();

    expect(await screen.findByText("Workspace overview could not be loaded.")).toBeInTheDocument();
    expect(screen.queryByText("Active Competitions")).not.toBeInTheDocument();
    expect(screen.queryByText("Club Entries")).not.toBeInTheDocument();
  });

  it.each([
    ["a wrong non-empty workspace envelope", { count: 1, workspace: "union-b", results: [{ workspace_slug: "union-b" }] }],
    ["a wrong empty workspace envelope", { count: 0, workspace: "union-b", results: [] }],
    ["a malformed workspace envelope", { count: 0, workspace: "union-a", results: null }],
    ["a result with a mismatched workspace slug", { count: 1, workspace: "union-a", results: [{ workspace_slug: "union-b" }] }],
  ])("rejects %s", async (_label, response) => {
    serviceMock.getUnionWorkspaceUsers.mockResolvedValue(response);

    renderDashboard();
    await screen.findByText("Active Competitions");
    fireEvent.click(screen.getAllByRole("button", { name: "Users" })[0]);

    expect(await screen.findByText("Workspace users could not be loaded.")).toBeInTheDocument();
  });

  it.each([
    ["a response workspace mismatch", { workspace: "union-b", membership: { workspace_slug: "union-a" } }],
    ["a membership workspace mismatch", { workspace: "union-a", membership: { workspace_slug: "union-b" } }],
  ])("does not show workspace-user success after %s", async (_label, response) => {
    serviceMock.createUnionWorkspaceUser.mockResolvedValue(response);
    renderDashboard();
    await screen.findByText("Active Competitions");
    fireEvent.click(screen.getAllByRole("button", { name: "Users" })[0]);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@example.com" } });
    fireEvent.submit(screen.getByRole("button", { name: "Add user" }).closest("form")!);

    expect(await screen.findByText("The workspace user could not be added.")).toBeInTheDocument();
    expect(screen.queryByText("Workspace user access was added.")).not.toBeInTheDocument();
  });

  it("issues one request for two immediate workspace-user submissions", async () => {
    serviceMock.createUnionWorkspaceUser.mockResolvedValue({
      workspace: "union-a",
      membership: { workspace_slug: "union-a" },
    });
    renderDashboard();
    await screen.findByText("Active Competitions");
    fireEvent.click(screen.getAllByRole("button", { name: "Users" })[0]);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@example.com" } });
    const form = screen.getByRole("button", { name: "Add user" }).closest("form")!;

    fireEvent.submit(form);
    fireEvent.submit(form);

    await waitFor(() => expect(serviceMock.createUnionWorkspaceUser).toHaveBeenCalledTimes(1));
  });

  it("does not show Fan navigation without an explicit FAN entitlement", async () => {
    renderDashboard();

    await screen.findByText("Active Competitions");
    expect(screen.queryByRole("link", { name: "Open Fan Dashboard" })).not.toBeInTheDocument();
  });
});
