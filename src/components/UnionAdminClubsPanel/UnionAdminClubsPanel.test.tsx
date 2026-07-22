import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UnionAdminClubsPanel from "./UnionAdminClubsPanel";

const serviceMock = vi.hoisted(() => ({
  getUnionAdminClubs: vi.fn(),
  createUnionAdminClub: vi.fn(),
  updateUnionAdminClub: vi.fn(),
  deleteUnionAdminClub: vi.fn(),
  getUnionGovernanceOptions: vi.fn(),
  getUnionAdminManagementLeagues: vi.fn(),
  getUnionAdminManagementSeasons: vi.fn(),
  provisionUnionClubAdministrator: vi.fn(),
}));

vi.mock("../../services/unionAdminService", () => serviceMock);

describe("UnionAdminClubsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.getUnionAdminManagementLeagues.mockResolvedValue([]);
    serviceMock.getUnionAdminManagementSeasons.mockResolvedValue([]);
    serviceMock.getUnionGovernanceOptions.mockResolvedValue({
      workspace: {
        slug: "union-a",
        name: "Union A",
        sport: "RUGBY",
        is_multi_sport: false,
      },
      supported_sports: [{ value: "RUGBY", label: "Rugby" }],
      competition_types: [],
      competition_format_types: [],
      sport_variants: { RUGBY: [] },
      format_templates: { RUGBY: [] },
      league_administrator_roles: [],
      competition_administrator_roles: [],
      club_administrator_roles: [
        { value: "CLUB_ADMIN", label: "Club Administrator" },
      ],
      club_affiliation_statuses: [
        { value: "APPLICATION_SUBMITTED", label: "Application submitted" },
        { value: "ACTIVE", label: "Active" },
        { value: "SUSPENDED", label: "Suspended" },
      ],
      league_membership_statuses: [
        { value: "INVITED", label: "Invited" },
        { value: "ACTIVE", label: "Active" },
      ],
    });
  });

  it("shows a neutral empty result instead of operational fallback clubs", async () => {
    serviceMock.getUnionAdminClubs.mockResolvedValue([]);

    render(
      <UnionAdminClubsPanel
        workspaceSlug="union-a"
        workspaceLabel="Union A"
        sport="RUGBY"
        canManageClubs
      />,
    );

    await waitFor(() => {
      expect(serviceMock.getUnionAdminClubs).toHaveBeenCalledWith(
        "union-a",
        "",
      );
    });

    expect(
      screen.getByText("No clubs are affiliated with this workspace yet."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/KOBS Rugby Club/i)).not.toBeInTheDocument();
  });

  it("hides every club mutation control without union.clubs.manage", async () => {
    serviceMock.getUnionAdminClubs.mockResolvedValue([
      {
        id: 1,
        name: "Union A Club",
        slug: "union-a-club",
        short_name: "UAC",
        sport: "RUGBY",
        sport_display: "Rugby",
        logo_url: null,
        banner_url: null,
        primary_color: "",
        secondary_color: "",
        admin: null,
        admin_name: "",
        admin_email: "",
        teams: 0,
        players: 0,
        compliance: "Review",
        memberships: [],
        created_at: "",
      },
    ]);

    render(
      <UnionAdminClubsPanel
        workspaceSlug="union-a"
        workspaceLabel="Union A"
        sport="RUGBY"
        canManageClubs={false}
      />,
    );

    await screen.findAllByText("Union A Club");

    expect(
      screen.queryByRole("button", { name: /add club/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /edit club/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete if unattached/i }),
    ).not.toBeInTheDocument();
  });

  it("does not let a stale club list overwrite a newer workspace", async () => {
    let resolveUnionA: (value: unknown) => void = () => undefined;
    let resolveUnionB: (value: unknown) => void = () => undefined;
    const unionA = new Promise((resolve) => {
      resolveUnionA = resolve;
    });
    const unionB = new Promise((resolve) => {
      resolveUnionB = resolve;
    });
    serviceMock.getUnionAdminClubs
      .mockReturnValueOnce(unionA)
      .mockReturnValueOnce(unionB);

    const { rerender } = render(
      <UnionAdminClubsPanel
        workspaceSlug="union-a"
        workspaceLabel="Union A"
        sport="RUGBY"
        canManageClubs
      />,
    );
    rerender(
      <UnionAdminClubsPanel
        workspaceSlug="union-b"
        workspaceLabel="Union B"
        sport="RUGBY"
        canManageClubs
      />,
    );

    resolveUnionB([
      {
        id: 2,
        name: "Union B Club",
        slug: "union-b-club",
        short_name: "",
        sport: "RUGBY",
        sport_display: "Rugby",
        logo_url: null,
        banner_url: null,
        primary_color: "",
        secondary_color: "",
        admin: null,
        admin_name: "",
        admin_email: "",
        teams: 0,
        players: 0,
        compliance: "Review",
        memberships: [],
        created_at: "",
      },
    ]);
    expect(await screen.findAllByText("Union B Club")).not.toHaveLength(0);

    resolveUnionA([
      {
        id: 1,
        name: "Union A Club",
        slug: "union-a-club",
        short_name: "",
        sport: "RUGBY",
        sport_display: "Rugby",
        logo_url: null,
        banner_url: null,
        primary_color: "",
        secondary_color: "",
        admin: null,
        admin_name: "",
        admin_email: "",
        teams: 0,
        players: 0,
        compliance: "Review",
        memberships: [],
        created_at: "",
      },
    ]);
    await waitFor(() =>
      expect(screen.queryByText("Union A Club")).not.toBeInTheDocument(),
    );
    expect(screen.getAllByText("Union B Club")).not.toHaveLength(0);
  });

  it("filters the directory by real affiliation status", async () => {
    serviceMock.getUnionAdminClubs.mockResolvedValue([
      {
        id: 1,
        name: "Active Club",
        slug: "active",
        short_name: "",
        sport: "RUGBY",
        sport_display: "Rugby",
        logo_url: null,
        banner_url: null,
        primary_color: "",
        secondary_color: "",
        admin: 1,
        admin_name: "Admin",
        admin_email: "admin@example.com",
        teams: 1,
        players: 2,
        compliance: "Logo needed",
        affiliation_status: "ACTIVE",
        memberships: [
          {
            id: 10,
            status: "ACTIVE",
            status_display: "Active",
            league_name: "Premier",
            season_name: "2026",
          },
        ],
        created_at: "",
      },
      {
        id: 2,
        name: "Suspended Club",
        slug: "invited",
        short_name: "",
        sport: "RUGBY",
        sport_display: "Rugby",
        logo_url: null,
        banner_url: null,
        primary_color: "",
        secondary_color: "",
        admin: null,
        admin_name: "",
        admin_email: "",
        teams: 0,
        players: 0,
        compliance: "Admin needed",
        affiliation_status: "SUSPENDED",
        memberships: [
          {
            id: 11,
            status: "INVITED",
            status_display: "Invited",
            league_name: "Premier",
            season_name: "2026",
          },
        ],
        created_at: "",
      },
    ]);
    render(
      <UnionAdminClubsPanel
        workspaceSlug="union-a"
        workspaceLabel="Union A"
        sport="RUGBY"
        canManageClubs
      />,
    );
    await screen.findAllByText("Active Club");
    fireEvent.change(screen.getByLabelText("Affiliation status"), {
      target: { value: "SUSPENDED" },
    });
    expect(screen.queryByText("Active Club")).not.toBeInTheDocument();
    expect(screen.getAllByText("Suspended Club")).not.toHaveLength(0);
  });

  it("shows a permission error with retry without substituting records", async () => {
    serviceMock.getUnionAdminClubs.mockRejectedValue({
      response: { data: { detail: "You do not have permission." } },
    });
    render(
      <UnionAdminClubsPanel
        workspaceSlug="union-a"
        workspaceLabel="Union A"
        sport="RUGBY"
        canManageClubs={false}
      />,
    );
    expect(
      await screen.findByText("You do not have permission."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.queryByText(/KOBS/)).not.toBeInTheDocument();
  });

  it("creates a club with the active workspace slug", async () => {
    serviceMock.getUnionAdminClubs.mockResolvedValue([]);
    serviceMock.createUnionAdminClub.mockResolvedValue({
      club: { id: 4, name: "New Club" },
      affiliation: {},
      league_membership: null,
      administrator_scope: {},
      account: { created_user: false },
    });
    render(
      <UnionAdminClubsPanel
        workspaceSlug="union-a"
        workspaceLabel="Union A"
        sport="RUGBY"
        canManageClubs
      />,
    );
    await screen.findByText("No clubs are affiliated with this workspace yet.");
    fireEvent.click(
      screen.getByRole("tab", { name: "Create / Edit Club" }),
    );
    fireEvent.change(screen.getByLabelText("Club name"), {
      target: { value: "New Club" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.change(screen.getByLabelText("Administrator email"), {
      target: { value: "admin@example.test" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Create Club" }));
    await waitFor(() =>
      expect(serviceMock.createUnionAdminClub).toHaveBeenCalledWith(
        expect.objectContaining({ workspace: "union-a", name: "New Club" }),
      ),
    );
  });
});
