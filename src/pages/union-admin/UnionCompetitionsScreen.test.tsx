import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UnionWorkspaceOption } from "../../services/unionAdminService";
import UnionCompetitionsScreen from "./UnionCompetitionsScreen";

const service = vi.hoisted(() => ({
  getUnionCompetitionIdentities: vi.fn(), getUnionCompetitionEditions: vi.fn(),
  getUnionAdminManagementLeagues: vi.fn(), getUnionAdminManagementSeasons: vi.fn(),
  getUnionAdminManagementCompetitions: vi.fn(), getUnionAdminLeagueClubMemberships: vi.fn(),
  createUnionCompetitionIdentity: vi.fn(), createUnionCompetitionEdition: vi.fn(),
  createUnionCompetitionWorkflow: vi.fn(), getUnionCompetitionEligibleAdministrators: vi.fn(),
  transitionUnionCompetitionEdition: vi.fn(), generateUnionAdminFixtures: vi.fn(),
}));
vi.mock("../../services/unionAdminService", () => service);

const workspace: UnionWorkspaceOption = { id: 1, name: "Uganda Rugby Union", slug: "uru", acronym: "URU", sport: "RUGBY", workspaceType: "FEDERATION", description: "National rugby workspace", primaryColor: "#7244df", role: "UNION_ADMIN", roleDisplay: "Union Admin", permissions: ["union.dashboard.view", "union.competitions.manage"] };
const identity = { id: 7, union: 1, union_name: workspace.name, primary_league: 4, primary_league_name: "Premiership", name: "National Rugby Premiership", slug: "national-rugby-premiership", sport: "RUGBY", competition_type: "LEAGUE", description: "Top flight", branding: {}, default_format: {}, default_eligibility_rules: {}, tier: 1, higher_competition: null, is_active: true, editions_count: 1, created_at: "", updated_at: "" };
const edition = { id: 8, identity: 7, identity_name: identity.name, competition: 9, competition_id: 9, competition_slug: "premiership-2027", season: 3, season_name: "2027", status: "REGISTRATION_OPEN", registration_opens_at: null, registration_closes_at: null, entry_fee: "0.00", currency: "UGX", rules: {}, structure: {}, eligibility_rules: {}, copied_from: null, published_at: null, published_by: null, published_by_email: null, created_at: "", updated_at: "", allowed_transitions: ["REGISTRATION_CLOSED", "CANCELLED"] };

describe("UnionCompetitionsScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.getUnionCompetitionIdentities.mockResolvedValue({ count: 1, results: [identity] });
    service.getUnionCompetitionEditions.mockResolvedValue({ count: 1, results: [edition] });
    service.getUnionAdminManagementLeagues.mockResolvedValue([{ id: 4, name: "Premiership" }]);
    service.getUnionAdminManagementSeasons.mockResolvedValue([{ id: 3, league: 4, name: "2027" }]);
    service.getUnionAdminManagementCompetitions.mockResolvedValue([{ id: 9, league: 4, name: identity.name, season_id: 3, matches_count: 0, clubs_count: 2 }]);
    service.getUnionAdminLeagueClubMemberships.mockResolvedValue([]);
    service.getUnionCompetitionEligibleAdministrators.mockResolvedValue([]);
  });

  it("loads backend records for the active workspace and renders the maintained interface", async () => {
    render(<UnionCompetitionsScreen workspace={workspace} />);
    expect(screen.getByText("Loading competitions…")).toBeInTheDocument();
    expect((await screen.findAllByText(identity.name)).length).toBeGreaterThan(0);
    expect(service.getUnionCompetitionIdentities).toHaveBeenCalledWith("uru");
    expect(screen.queryByText(/Development demo/)).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
  });

  it("reloads and clears old records when the workspace changes", async () => {
    const { rerender } = render(<UnionCompetitionsScreen workspace={workspace} />);
    await screen.findAllByText(identity.name);
    service.getUnionCompetitionIdentities.mockResolvedValue({ count: 0, results: [] });
    rerender(<UnionCompetitionsScreen workspace={{ ...workspace, id: 2, slug: "fufa", name: "FUFA" }} />);
    await waitFor(() => expect(service.getUnionCompetitionIdentities).toHaveBeenCalledWith("fufa"));
    expect(await screen.findByText("No competitions yet")).toBeInTheDocument();
  });

  it("calls the edition lifecycle endpoint with the workspace slug", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    service.transitionUnionCompetitionEdition.mockResolvedValue({ ...edition, status: "REGISTRATION_CLOSED" });
    render(<UnionCompetitionsScreen workspace={workspace} />);
    await screen.findAllByText(identity.name);
    fireEvent.click(screen.getByRole("tab", { name: "Publication & Lifecycle" }));
    fireEvent.click(await screen.findByRole("button", { name: "Move to registration closed" }));
    await waitFor(() =>
      expect(service.transitionUnionCompetitionEdition).toHaveBeenCalledWith(
        "uru",
        8,
        "REGISTRATION_CLOSED",
        "",
      ),
    );
  });

  it("shows honest empty and permission-denied states", async () => {
    service.getUnionCompetitionIdentities.mockRejectedValue({ response: { status: 403 } });
    render(<UnionCompetitionsScreen workspace={workspace} />);
    expect(await screen.findByText(/do not have permission/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
