import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createUnionAdminMatchOfficial,
  deleteUnionAdminMatchOfficial,
  getUnionDashboardOverview,
  getUnionFinanceDashboard,
  getUnionAdminMatchOfficials,
  getUnionNationalTeams,
  createUnionNationalTeam,
  getUnionNationalTeamMembers,
  createUnionNationalTeamMember,
  getUnionRegistrationApplications,
  updateUnionRegistrationApplication,
  getUnionOfficialReadiness,
  getUnionOperationsDashboard,
  getUnionWorkspaceUsers,
  intersectUnionWorkspaceOptions,
  switchUnionWorkspace,
  updateUnionAdminMatchOfficial,
} from "./unionAdminService.js";

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("./apiClient.js", () => ({
  default: apiMock,
}));

describe("unionAdminService referee management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads sport-specific match officials with an optional search query", async () => {
    apiMock.get.mockResolvedValue({
      data: { count: 0, sport: "RUGBY", role_options: [], results: [] },
    });

    await getUnionAdminMatchOfficials("uru", "centre referee");

    expect(apiMock.get).toHaveBeenCalledWith(
      "/dashboards/union-admin/referees/?workspace=uru&q=centre+referee",
    );
  });

  it("creates, updates and removes union match officials through the management endpoints", async () => {
    const payload = {
      workspace: "uru",
      full_name: "Amina Official",
      role_type: "CENTRE_REFEREE",
      primary_sport: "RUGBY",
    };

    apiMock.post.mockResolvedValue({ data: { id: 7 } });
    apiMock.patch.mockResolvedValue({ data: { id: 7 } });
    apiMock.delete.mockResolvedValue({ data: {} });

    await createUnionAdminMatchOfficial(payload);
    await updateUnionAdminMatchOfficial(7, payload);
    await deleteUnionAdminMatchOfficial(7, "uru");

    expect(apiMock.post).toHaveBeenCalledWith(
      "/dashboards/union-admin/referees/",
      payload,
    );
    expect(apiMock.patch).toHaveBeenCalledWith(
      "/dashboards/union-admin/referees/7/",
      payload,
    );
    expect(apiMock.delete).toHaveBeenCalledWith(
      "/dashboards/union-admin/referees/7/",
      { data: { workspace: "uru" } },
    );
  });
});

describe("unionAdminService dashboard access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const membership = {
    id: 22,
    name: "Uganda Rugby Union",
    slug: "uru",
    acronym: "URU",
    sport: "RUGBY",
    workspaceType: "FEDERATION",
    description: "Rugby federation",
    primaryColor: "#7b3ff2",
    role: "TICKETING_OFFICER" as const,
    roleDisplay: "Ticketing Officer",
    permissions: [
      "union.ticketing.scan",
      "union.dashboard.view",
      "union.ticketing.manage",
    ],
  };

  const dashboardAccess = {
    version: 1,
    default_entitlement_id: "union-workspace-22",
    entitlements: [
      {
        id: "union-workspace-22",
        dashboard: "UNION_WORKSPACE",
        route: "/dashboard/union-admin",
        scope_type: "UNION_WORKSPACE",
        scope_id: 22,
        workspace_role: "TICKETING_OFFICER",
        permissions: [
          "union.ticketing.scan",
          "union.permission.not-in-membership",
          "union.dashboard.view",
        ],
      },
    ],
  };

  it("intersects membership data with the exact entitlement scope and role", () => {
    expect(
      intersectUnionWorkspaceOptions(
        [
          membership,
          {
            ...membership,
            id: 99,
            slug: "not-entitled",
          },
        ],
        dashboardAccess,
      ),
    ).toEqual([
      {
        ...membership,
        entitlementId: "union-workspace-22",
        entitlementRoute: "/dashboard/union-admin",
        scopeId: 22,
        permissions: [
          "union.dashboard.view",
          "union.ticketing.scan",
        ],
      },
    ]);
  });

  it("fails closed when the membership role differs from the entitlement role", () => {
    expect(
      intersectUnionWorkspaceOptions(
        [{ ...membership, role: "VIEWER" }],
        dashboardAccess,
      ),
    ).toEqual([]);
  });

  it("validates the selected entitlement returned by a workspace switch", async () => {
    apiMock.post.mockResolvedValue({
      data: {
        id: 7,
        role: membership.role,
        role_display: membership.roleDisplay,
        effective_permissions: membership.permissions,
        workspace: {
          id: membership.id,
          name: membership.name,
          slug: membership.slug,
          acronym: membership.acronym,
          sport: membership.sport,
          workspace_type: membership.workspaceType,
          description: membership.description,
          primary_color: membership.primaryColor,
        },
        selected_entitlement_id: "union-workspace-22",
        dashboard_access: dashboardAccess,
      },
    });

    const result = await switchUnionWorkspace("uru");

    expect(apiMock.post).toHaveBeenCalledWith(
      "/dashboards/union-admin/switch-workspace/",
      { workspace: "uru" },
    );
    expect(result.selectedEntitlementId).toBe("union-workspace-22");
    expect(result.workspace.role).toBe("TICKETING_OFFICER");
    expect(result.workspace.permissions).toEqual([
      "union.dashboard.view",
      "union.ticketing.scan",
    ]);
  });

  it("rejects a switch response without matching dashboard access", async () => {
    apiMock.post.mockResolvedValue({
      data: {
        id: 7,
        role: membership.role,
        role_display: membership.roleDisplay,
        effective_permissions: membership.permissions,
        workspace: {
          id: membership.id,
          name: membership.name,
          slug: membership.slug,
          acronym: membership.acronym,
          sport: membership.sport,
          workspace_type: membership.workspaceType,
          description: membership.description,
          primary_color: membership.primaryColor,
        },
        selected_entitlement_id: "union-workspace-22",
        dashboard_access: {
          version: 1,
          default_entitlement_id: null,
          entitlements: [],
        },
      },
    });

    await expect(switchUnionWorkspace("uru")).rejects.toThrow(
      "selected workspace is not authorized",
    );
  });
});

describe("unionAdminService workspace-scoped dashboards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the selected workspace slug for every overview, operations, finance and users request", async () => {
    apiMock.get
      .mockResolvedValueOnce({
        data: {
          workspace: {
            id: 1,
            role: "VIEWER",
            role_display: "Viewer",
            effective_permissions: [],
            workspace: {
              id: 1,
              name: "Union",
              slug: "union & league",
              acronym: "UL",
              sport: "RUGBY",
              workspace_type: "UNION",
              description: "",
              primary_color: "",
            },
          },
          summary: {},
          permissions: [],
        },
      })
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({
        data: { count: 0, workspace: "union & league", results: [] },
      });

    await getUnionDashboardOverview("union & league");
    await getUnionOperationsDashboard("union & league");
    await getUnionFinanceDashboard("union & league");
    const users = await getUnionWorkspaceUsers("union & league");

    expect(apiMock.get).toHaveBeenNthCalledWith(
      1,
      "/dashboards/union-admin/workspace/?workspace=union%20%26%20league",
    );
    expect(apiMock.get).toHaveBeenNthCalledWith(
      2,
      "/dashboards/union-admin/operations/?workspace=union%20%26%20league",
    );
    expect(apiMock.get).toHaveBeenNthCalledWith(
      3,
      "/dashboards/union-admin/finance/?workspace=union%20%26%20league",
    );
    expect(apiMock.get).toHaveBeenNthCalledWith(
      4,
      "/dashboards/union-admin/workspace-users/?workspace=union%20%26%20league",
    );
    expect(users).toEqual({
      count: 0,
      workspace: "union & league",
      results: [],
    });
  });
});


describe("unionAdminService maintained Union operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses workspace-scoped National Team and roster endpoints", async () => {
    apiMock.get.mockResolvedValue({ data: { count: 0, results: [] } });
    apiMock.post.mockResolvedValue({ data: { id: 1 } });

    await getUnionNationalTeams("union & league");
    await createUnionNationalTeam({
      workspace: "union & league",
      name: "National XV",
      category: "Senior Men",
    });
    await getUnionNationalTeamMembers(7, "union & league");
    await createUnionNationalTeamMember(7, {
      workspace: "union & league",
      full_name: "Amina Player",
    });

    expect(apiMock.get).toHaveBeenNthCalledWith(
      1,
      "/dashboards/union-admin/national-teams/?workspace=union%20%26%20league",
    );
    expect(apiMock.post).toHaveBeenNthCalledWith(
      1,
      "/dashboards/union-admin/national-teams/",
      {
        workspace: "union & league",
        name: "National XV",
        category: "Senior Men",
      },
    );
    expect(apiMock.get).toHaveBeenNthCalledWith(
      2,
      "/dashboards/union-admin/national-teams/7/members/?workspace=union%20%26%20league",
    );
    expect(apiMock.post).toHaveBeenNthCalledWith(
      2,
      "/dashboards/union-admin/national-teams/7/members/",
      {
        workspace: "union & league",
        full_name: "Amina Player",
      },
    );
  });

  it("loads and reviews registration applications and official readiness", async () => {
    apiMock.get.mockResolvedValue({ data: { count: 0, results: [] } });
    apiMock.patch.mockResolvedValue({ data: { id: 9 } });

    await getUnionRegistrationApplications("uru");
    await updateUnionRegistrationApplication(9, "uru", {
      status: "APPROVED",
      documents_complete: true,
      reviewer_notes: "Verif ed",
    });
    await getUnionOfficialReadiness("uru");

    expect(apiMock.get).toHaveBeenNthCalledWith(
      1,
      "/dashboards/union-admin/registration-applications/?workspace=uru",
    );
    expect(apiMock.patch).toHaveBeenCalledWith(
      "/dashboards/union-admin/registration-applications/9/",
      {
        workspace: "uru",
        status: "APPROVED",
        documents_complete: true,
        reviewer_notes: "Verif ed",
      },
    );
    expect(apiMock.get).toHaveBeenNthCalledWith(
      2,
      "/dashboards/union-admin/official-readiness/?workspace=uru",
    );
  });
});
