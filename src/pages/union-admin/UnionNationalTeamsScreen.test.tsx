import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import UnionNationalTeamsScreen from "./UnionNationalTeamsScreen";

const service = vi.hoisted(() => ({
  getUnionNationalTeams: vi.fn(), getUnionNationalTeamMembers: vi.fn(),
  createUnionNationalTeam: vi.fn(), createUnionNationalTeamMember: vi.fn(),
  updateUnionNationalTeam: vi.fn(), updateUnionNationalTeamMember: vi.fn(),
  deleteUnionNationalTeamMember: vi.fn(),
}));
vi.mock("../../services/unionAdminService", () => service);

const team = { id: 4, workspace: 1, workspace_slug: "uru", workspace_acronym: "URU", name: "Uganda Women", slug: "uganda-women", category: "Senior", gender: "Women", age_group: "Senior", head_coach: "Coach A", status: "ACTIVE", status_display: "Active", players: 1, staff: 0, notes: "", is_active: true, created_by: 1, created_at: "", updated_at: "" };
const member = { id: 8, team: 4, team_name: team.name, user: null, user_email: null, club: 3, club_name: "Kampala Club", full_name: "Amina Kato", member_type: "PLAYER", member_type_display: "Player", role: "Wing", status: "ACTIVE", status_display: "Active", notes: "", created_at: "", updated_at: "" };

describe("UnionNationalTeamsScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.getUnionNationalTeams.mockResolvedValue({ count: 1, results: [team] });
    service.getUnionNationalTeamMembers.mockResolvedValue({ count: 1, results: [member] });
  });

  it("renders workspace teams and roster records", async () => {
    render(<UnionNationalTeamsScreen workspaceSlug="uru" workspaceName="Uganda Rugby Union" canManage />);
    expect(screen.getByText("Loading National Teams…")).toBeInTheDocument();
    expect((await screen.findAllByText("Uganda Women")).length).toBeGreaterThan(0);
    expect(await screen.findByText("Amina Kato")).toBeInTheDocument();
    expect(service.getUnionNationalTeams).toHaveBeenCalledWith("uru");
    expect(service.getUnionNationalTeamMembers).toHaveBeenCalledWith(4, "uru");
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
  });

  it("reloads cleanly when the workspace changes", async () => {
    const view = render(<UnionNationalTeamsScreen workspaceSlug="uru" workspaceName="URU" canManage />);
    await screen.findByText("Amina Kato");
    service.getUnionNationalTeams.mockResolvedValue({ count: 0, results: [] });
    view.rerender(<UnionNationalTeamsScreen workspaceSlug="fufa" workspaceName="FUFA" canManage />);
    await waitFor(() => expect(service.getUnionNationalTeams).toHaveBeenCalledWith("fufa"));
    expect(await screen.findByText("No National Teams")).toBeInTheDocument();
    expect(screen.queryByText("Amina Kato")).not.toBeInTheDocument();
  });

  it("filters by status and shows a filtered-empty state", async () => {
    render(<UnionNationalTeamsScreen workspaceSlug="uru" workspaceName="URU" canManage />);
    await screen.findByText("Amina Kato");
    fireEvent.change(screen.getByLabelText("Team status filter"), { target: { value: "INACTIVE" } });
    expect(screen.getByText("No teams match")).toBeInTheDocument();
  });

  it("creates a member with the selected workspace", async () => {
    service.createUnionNationalTeamMember.mockResolvedValue({ ...member, id: 9, full_name: "New Player" });
    render(<UnionNationalTeamsScreen workspaceSlug="uru" workspaceName="URU" canManage />);
    await screen.findByText("Amina Kato");
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "New Player" } });
    fireEvent.click(screen.getByRole("button", { name: "Add member" }));
    await waitFor(() => expect(service.createUnionNationalTeamMember).toHaveBeenCalledWith(4, expect.objectContaining({ workspace: "uru", full_name: "New Player" })));
  });

  it("shows permission errors and hides mutation forms for read-only users", async () => {
    service.getUnionNationalTeams.mockRejectedValue({ response: { status: 403 } });
    render(<UnionNationalTeamsScreen workspaceSlug="uru" workspaceName="URU" canManage={false} />);
    expect(await screen.findByText(/do not have permission/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create team" })).not.toBeInTheDocument();
  });
});
