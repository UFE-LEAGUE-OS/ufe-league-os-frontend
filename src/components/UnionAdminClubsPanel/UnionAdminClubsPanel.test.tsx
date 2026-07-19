import { render, screen, waitFor } from "@testing-library/react";
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

    expect(screen.getByText("No clubs found.")).toBeInTheDocument();
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
});
