import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UnionAdminManagementWorkflow from "./UnionAdminManagementWorkflow";

const serviceMock = vi.hoisted(() => ({
  getUnionAdminClubs: vi.fn(),
  getUnionAdminManagementLeagues: vi.fn(),
  getUnionAdminManagementSeasons: vi.fn(),
  getUnionAdminManagementCompetitions: vi.fn(),
  getUnionAdminLeagueClubMemberships: vi.fn(),
  createUnionAdminCompetition: vi.fn(),
  createUnionAdminSeason: vi.fn(),
  bulkAddUnionAdminLeagueClubMemberships: vi.fn(),
  generateUnionAdminFixtures: vi.fn(),
  promoteRelegateUnionAdminClub: vi.fn(),
  removeUnionAdminLeagueClubMembership: vi.fn(),
  rescheduleUnionAdminFixture: vi.fn(),
  updateUnionAdminLeagueClubMembership: vi.fn(),
}));

vi.mock("../../services/unionAdminService", () => serviceMock);

describe("UnionAdminManagementWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.getUnionAdminManagementLeagues.mockResolvedValue([{ id: 1, name: "Union A League", sport: "RUGBY" }]);
    serviceMock.getUnionAdminManagementSeasons.mockResolvedValue([{ id: 2, name: "2026", league_name: "Union A League", league: 1 }]);
    serviceMock.getUnionAdminManagementCompetitions.mockResolvedValue([]);
    serviceMock.getUnionAdminLeagueClubMemberships.mockResolvedValue([]);
    serviceMock.getUnionAdminClubs.mockResolvedValue([{ id: 9, name: "Maintained Club" }]);
  });

  it("loads real Club options from the maintained Club endpoint", async () => {
    render(<UnionAdminManagementWorkflow workspaceSlug="union-a" workspaceLabel="Union A" />);

    await waitFor(() => expect(serviceMock.getUnionAdminClubs).toHaveBeenCalledWith("union-a"));
    fireEvent.click(screen.getByRole("button", { name: "Add / Remove Club" }));
    expect(await screen.findByText("Maintained Club")).toBeInTheDocument();
  });

  it("clears prior workspace options before loading the next Union", async () => {
    const { rerender } = render(<UnionAdminManagementWorkflow workspaceSlug="union-a" workspaceLabel="Union A" />);
    fireEvent.click(await screen.findByRole("button", { name: "Add / Remove Club" }));
    expect(await screen.findByText("Maintained Club")).toBeInTheDocument();
    serviceMock.getUnionAdminClubs.mockResolvedValue([{ id: 10, name: "Union B Club" }]);
    rerender(<UnionAdminManagementWorkflow workspaceSlug="union-b" workspaceLabel="Union B" />);

    fireEvent.click(screen.getByRole("button", { name: "Add / Remove Club" }));
    expect(await screen.findByText("Union B Club")).toBeInTheDocument();
    expect(screen.queryByText("Maintained Club")).not.toBeInTheDocument();
  });
});
