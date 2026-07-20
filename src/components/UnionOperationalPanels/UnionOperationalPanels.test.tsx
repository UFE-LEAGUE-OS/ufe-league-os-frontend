import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  UnionNationalTeamsPanel,
  UnionOfficialReadinessPanel,
  UnionRegistrationsPanel,
} from "./UnionOperationalPanels";

const serviceMock = vi.hoisted(() => ({
  getUnionNationalTeams: vi.fn(),
  createUnionNationalTeam: vi.fn(),
  updateUnionNationalTeam: vi.fn(),
  getUnionNationalTeamMembers: vi.fn(),
  createUnionNationalTeamMember: vi.fn(),
  getUnionRegistrationApplications: vi.fn(),
  updateUnionRegistrationApplication: vi.fn(),
  getUnionOfficialReadiness: vi.fn(),
}));

vi.mock("../../services/unionAdminService", async () => {
  const actual = await vi.importActual<typeof import("../../services/unionAdminService")>(
    "../../services/unionAdminService",
  );
  return { ...actual, ...serviceMock };
});

const team = {
  id: 5,
  workspace: 1,
  workspace_slug: "uru",
  workspace_acronym: "URU",
  name: "Rugby Cranes",
  slug: "rugby-cranes",
  category: "Senior Men",
  gender: "Men",
  age_group: "Senior",
  head_coach: "Coach",
  status: "ACTIVE" as const,
  status_display: "Active",
  players: 1,
  staff: 0,
  notes: "",
  is_active: true,
  created_by: 1,
  created_at: "2026-07-19T08:00:00Z",
  updated_at: "2026-07-19T08:00:00Z",
};

const application = {
  id: 9,
  workspace: 1,
  workspace_slug: "uru",
  workspace_acronym: "URU",
  application_type: "NEW_PLAYER",
  application_type_display: "New Player",
  club: 3,
  club_name: "KOBS",
  club_slug: "kobs",
  team: null,
  team_name: null,
  competition: null,
  competition_name: null,
  player_registration: null,
  applicant_name: "Amina Player",
  registration_number: "URU-009",
  status: "PENDING" as const,
  status_display: "Pending",
  documents_complete: false,
  submitted_by: 2,
  submitted_by_email: "club@example.com",
  submitted_at: "2026-07-19T08:00:00Z",
  reviewed_by: null,
  reviewed_by_email: null,
  reviewed_at: null,
  reviewer_notes: "",
  metadata: {},
  created_at: "2026-07-19T08:00:00Z",
  updated_at: "2026-07-19T08:00:00Z",
};

describe("Union operational panels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.getUnionNationalTeams.mockResolvedValue({ count: 1, results: [team] });
    serviceMock.getUnionNationalTeamMembers.mockResolvedValue({ count: 0, results: [] });
    serviceMock.getUnionRegistrationApplications.mockResolvedValue({ count: 1, results: [application] });
    serviceMock.getUnionOfficialReadiness.mockResolvedValue({
      workspace: { slug: "uru", acronym: "URU", name: "Uganda Rugby Union" },
      summary: {
        officials_total: 8,
        officials_available: 6,
        officials_unavailable: 1,
        officials_suspended: 1,
        upcoming_fixtures: 2,
        fixtures_without_assignments: 1,
        fixtures_with_pending_responses: 1,
      },
      fixtures: [
        {
          id: 11,
          match: "KOBS vs Heathens",
          competition: "Nile Special Rugby League",
          match_date: "2026-07-25T14:00:00Z",
          venue: "Legends",
          assignment_count: 2,
          accepted_count: 1,
          pending_response_count: 1,
          declined_count: 0,
          readiness: "PENDING_RESPONSES",
        },
      ],
      officials: [],
    });
  });

  it("loads maintained National Teams and adds a roster member", async () => {
    serviceMock.createUnionNationalTeamMember.mockResolvedValue({
      id: 14,
      team: 5,
      team_name: "Rugby Cranes",
      user: null,
      user_email: null,
      club: null,
      club_name: null,
      full_name: "Keith Player",
      member_type: "PLAYER",
      member_type_display: "Player",
      role: "Flanker",
      status: "ACTIVE",
      status_display: "Active",
      notes: "",
      created_at: "2026-07-19T08:00:00Z",
      updated_at: "2026-07-19T08:00:00Z",
    });

    render(<UnionNationalTeamsPanel workspaceSlug="uru" workspaceName="Uganda Rugby Union" />);

    expect(await screen.findByText("Rugby Cranes")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Keith Player" } });
    fireEvent.change(screen.getByLabelText("Role or position"), { target: { value: "Flanker" } });
    fireEvent.click(screen.getByRole("button", { name: "Add member" }));

    await waitFor(() =>
      expect(serviceMock.createUnionNationalTeamMember).toHaveBeenCalledWith(5, {
        workspace: "uru",
        full_name: "Keith Player",
        member_type: "PLAYER",
        role: "Flanker",
      }),
    );
    expect(await screen.findByText("Keith Player")).toBeInTheDocument();
  });

  it("does not show a delayed National Team response from the previous workspace", async () => {
    let resolveOld: (value: unknown) => void = () => undefined;
    serviceMock.getUnionNationalTeams
      .mockReturnValueOnce(new Promise((resolve) => { resolveOld = resolve; }))
      .mockResolvedValueOnce({ count: 0, results: [] });

    const view = render(<UnionNationalTeamsPanel workspaceSlug="uru" workspaceName="URU" />);
    view.rerender(<UnionNationalTeamsPanel workspaceSlug="fufa" workspaceName="FUFA" />);

    await screen.findByText("No maintained National Teams exist for this workspace.");
    resolveOld({ count: 1, results: [team] });

    await waitFor(() => expect(screen.queryByText("Rugby Cranes")).not.toBeInTheDocument());
  });

  it("reviews a maintained registration with documents and reviewer notes", async () => {
    serviceMock.updateUnionRegistrationApplication.mockResolvedValue({
      ...application,
      status: "APPROVED",
      status_display: "Approved",
      documents_complete: true,
      reviewer_notes: "Documents verified",
      reviewed_at: "2026-07-19T09:00:00Z",
    });

    render(<UnionRegistrationsPanel workspaceSlug="uru" workspaceName="Uganda Rugby Union" />);

    expect(await screen.findByText("Amina Player")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Required documents are complete"));
    fireEvent.change(screen.getByLabelText("Reviewer notes"), { target: { value: "Documents verified" } });
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() =>
      expect(serviceMock.updateUnionRegistrationApplication).toHaveBeenCalledWith(9, "uru", {
        status: "APPROVED",
        documents_complete: true,
        reviewer_notes: "Documents verified",
      }),
    );
    expect(await screen.findByText("Amina Player is now approved.")).toBeInTheDocument();
  });

  it("shows maintained official readiness and fixture coverage", async () => {
    render(<UnionOfficialReadinessPanel workspaceSlug="uru" workspaceName="Uganda Rugby Union" />);

    expect(await screen.findByText("KOBS vs Heathens")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Pending Responses")).toBeInTheDocument();
    expect(serviceMock.getUnionOfficialReadiness).toHaveBeenCalledWith("uru");
  });
});
