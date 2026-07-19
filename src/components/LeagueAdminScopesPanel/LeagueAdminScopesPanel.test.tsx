import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LeagueAdminScopesPanel from "./LeagueAdminScopesPanel";

const unionMock = vi.hoisted(() => ({
  getUnionAdminManagementLeagues: vi.fn(),
  getUnionAdminManagementCompetitions: vi.fn(),
}));
const scopeMock = vi.hoisted(() => ({ getUnionAdminLeagueScopes: vi.fn() }));

vi.mock("../../services/unionAdminService", () => unionMock);
vi.mock("../../services/officialAppointmentService", () => scopeMock);

describe("LeagueAdminScopesPanel workspace scope", () => {
  it("replaces old league options when the Union workspace changes", async () => {
    scopeMock.getUnionAdminLeagueScopes.mockResolvedValue([]);
    unionMock.getUnionAdminManagementCompetitions.mockResolvedValue([]);
    unionMock.getUnionAdminManagementLeagues.mockResolvedValueOnce([{ id: 1, name: "Union A League" }]).mockResolvedValueOnce([{ id: 2, name: "Union B League" }]);
    const { rerender } = render(<LeagueAdminScopesPanel workspaceSlug="union-a" />);
    expect(await screen.findByText("Union A League")).toBeInTheDocument();
    rerender(<LeagueAdminScopesPanel workspaceSlug="union-b" />);
    expect(await screen.findByText("Union B League")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Union A League")).not.toBeInTheDocument());
  });
});
