import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UnionAdminClubsPanel from "./UnionAdminClubsPanel";

const serviceMock = vi.hoisted(() => ({
  getUnionAdminClubs: vi.fn(),
  createUnionAdminClub: vi.fn(),
  updateUnionAdminClub: vi.fn(),
  deleteUnionAdminClub: vi.fn(),
}));

vi.mock("../../services/unionAdminService", () => serviceMock);

describe("UnionAdminClubsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      expect(serviceMock.getUnionAdminClubs).toHaveBeenCalledWith("union-a", "");
    });

    expect(screen.getByText("No clubs are affiliated with this workspace yet.")).toBeInTheDocument();
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

    expect(screen.queryByRole("button", { name: /add club/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /edit club/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete if unattached/i })).not.toBeInTheDocument();
  });

  it("does not let a stale club list overwrite a newer workspace", async () => {
    let resolveUnionA: (value: unknown) => void = () => undefined;
    let resolveUnionB: (value: unknown) => void = () => undefined;
    const unionA = new Promise((resolve) => { resolveUnionA = resolve; });
    const unionB = new Promise((resolve) => { resolveUnionB = resolve; });
    serviceMock.getUnionAdminClubs.mockReturnValueOnce(unionA).mockReturnValueOnce(unionB);

    const { rerender } = render(
      <UnionAdminClubsPanel workspaceSlug="union-a" workspaceLabel="Union A" sport="RUGBY" canManageClubs />,
    );
    rerender(
      <UnionAdminClubsPanel workspaceSlug="union-b" workspaceLabel="Union B" sport="RUGBY" canManageClubs />,
    );

    resolveUnionB([
      { id: 2, name: "Union B Club", slug: "union-b-club", short_name: "", sport: "RUGBY", sport_display: "Rugby", logo_url: null, banner_url: null, primary_color: "", secondary_color: "", admin: null, admin_name: "", admin_email: "", teams: 0, players: 0, compliance: "Review", memberships: [], created_at: "" },
    ]);
    expect(await screen.findAllByText("Union B Club")).not.toHaveLength(0);

    resolveUnionA([
      { id: 1, name: "Union A Club", slug: "union-a-club", short_name: "", sport: "RUGBY", sport_display: "Rugby", logo_url: null, banner_url: null, primary_color: "", secondary_color: "", admin: null, admin_name: "", admin_email: "", teams: 0, players: 0, compliance: "Review", memberships: [], created_at: "" },
    ]);
    await waitFor(() => expect(screen.queryByText("Union A Club")).not.toBeInTheDocument());
    expect(screen.getAllByText("Union B Club")).not.toHaveLength(0);
  });

  it("filters the directory by real league membership status", async () => {
    serviceMock.getUnionAdminClubs.mockResolvedValue([
      { id: 1, name: "Active Club", slug: "active", short_name: "", sport: "RUGBY", sport_display: "Rugby", logo_url: null, banner_url: null, primary_color: "", secondary_color: "", admin: 1, admin_name: "Admin", admin_email: "admin@example.com", teams: 1, players: 2, compliance: "Logo needed", memberships: [{ id: 10, status: "ACTIVE", status_display: "Active", league_name: "Premier", season_name: "2026" }], created_at: "" },
      { id: 2, name: "Invited Club", slug: "invited", short_name: "", sport: "RUGBY", sport_display: "Rugby", logo_url: null, banner_url: null, primary_color: "", secondary_color: "", admin: null, admin_name: "", admin_email: "", teams: 0, players: 0, compliance: "Admin needed", memberships: [{ id: 11, status: "INVITED", status_display: "Invited", league_name: "Premier", season_name: "2026" }], created_at: "" },
    ]);
    render(<UnionAdminClubsPanel workspaceSlug="union-a" workspaceLabel="Union A" sport="RUGBY" canManageClubs />);
    await screen.findAllByText("Active Club");
    fireEvent.change(screen.getByLabelText("Affiliation status"), { target: { value: "INVITED" } });
    expect(screen.queryByText("Active Club")).not.toBeInTheDocument();
    expect(screen.getAllByText("Invited Club")).not.toHaveLength(0);
  });

  it("shows a permission error with retry without substituting records", async () => {
    serviceMock.getUnionAdminClubs.mockRejectedValue({ response: { data: { detail: "You do not have permission." } } });
    render(<UnionAdminClubsPanel workspaceSlug="union-a" workspaceLabel="Union A" sport="RUGBY" canManageClubs={false} />);
    expect(await screen.findByText("You do not have permission.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.queryByText(/KOBS/)).not.toBeInTheDocument();
  });

  it("creates a club with the active workspace slug", async () => {
    serviceMock.getUnionAdminClubs.mockResolvedValue([]);
    serviceMock.createUnionAdminClub.mockResolvedValue({ id: 4, name: "New Club" });
    render(<UnionAdminClubsPanel workspaceSlug="union-a" workspaceLabel="Union A" sport="RUGBY" canManageClubs />);
    await screen.findByText("No clubs are affiliated with this workspace yet.");
    fireEvent.click(screen.getByRole("button", { name: "Add Club" }));
    fireEvent.change(screen.getByLabelText("Club name"), { target: { value: "New Club" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Club" }));
    await waitFor(() => expect(serviceMock.createUnionAdminClub).toHaveBeenCalledWith(expect.objectContaining({ workspace: "union-a", name: "New Club" })));
  });
});
