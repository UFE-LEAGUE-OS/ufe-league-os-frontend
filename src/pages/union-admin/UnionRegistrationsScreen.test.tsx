import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import UnionRegistrationsScreen from "./UnionRegistrationsScreen";

const service = vi.hoisted(() => ({
  getUnionPlayerRegistrationSubmissions: vi.fn(),
  getUnionPlayerRegistrationSubmissionDetail: vi.fn(),
  assignUnionPlayerRegistrationReviewer: vi.fn(),
  startUnionPlayerRegistrationReview: vi.fn(),
  requestUnionPlayerRegistrationChanges: vi.fn(),
  approveUnionPlayerRegistration: vi.fn(),
  rejectUnionPlayerRegistration: vi.fn(),
}));

vi.mock("../../services/unionAdminService", () => service);

const submission = {
  id: 41,
  registration_number: "REG-0041",
  full_name: "Amina Kato",
  union_player_number: null,
  club: 3,
  club_name: "Kampala Rugby Club",
  team: 8,
  team_name: "Kampala Women",
  season_record: 4,
  registration_type: "NEW_REGISTRATION",
  submission_status: "UNDER_REVIEW",
  submission_revision: 2,
  submitted_at: "2026-07-18T10:00:00Z",
  assigned_reviewer: 9,
  assigned_reviewer_name: "Union Registrar",
  reviewed_at: null,
  warning_count: 1,
  blocking_error_count: 0,
};

const detail = {
  ...submission,
  first_name: "Amina",
  last_name: "Kato",
  date_of_birth: "2001-04-10",
  nationality: "Ugandan",
  position: "Wing",
  secondary_positions: [],
  player_type: "SENIOR",
  jersey_number: 11,
  height_cm: "170.0",
  weight_kg: "65.0",
  preferred_foot: "RIGHT",
  registered_date: null,
  expiry_date: null,
  transfer_window: "",
  previous_club: "",
  contract_until: null,
  is_captain: false,
  is_vice_captain: false,
  union_player: null,
  permanent_player_summary: null,
  requested_competition_editions: [15],
  supporting_documents: [{ name: "Passport reference" }],
  club_notes: "Verified by club registrar",
  submitted_by: 5,
  submitted_by_name: "Club Registrar",
  last_resubmitted_at: null,
  change_request_reason: "",
  union_decision_reason: "",
  automatic_validation: {
    blocking_errors: [],
    review_warnings: [
      { code: "DOB_CHECK", field: "date_of_birth", message: "Confirm age category.", severity: "WARNING" },
    ],
    passed_checks: [
      { code: "DOCS", field: "supporting_documents", message: "Documents supplied.", severity: "PASS" },
    ],
  },
  withdrawal_reason: "",
  authoritative_registration_summary: null,
  created_at: "2026-07-18T10:00:00Z",
  updated_at: "2026-07-18T10:00:00Z",
};

function renderScreen(props: Partial<React.ComponentProps<typeof UnionRegistrationsScreen>> = {}) {
  return render(
    <UnionRegistrationsScreen
      workspaceSlug="uru"
      workspaceName="Uganda Rugby Union"
      canManage
      canApprove
      {...props}
    />,
  );
}

describe("UnionRegistrationsScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.getUnionPlayerRegistrationSubmissions.mockResolvedValue({ count: 1, results: [submission] });
    service.getUnionPlayerRegistrationSubmissionDetail.mockResolvedValue(detail);
  });

  it("loads workspace records and displays maintained submission details", async () => {
    renderScreen();
    expect(screen.getByText("Loading registration submissions…")).toBeInTheDocument();
    expect(await screen.findByText("Amina Kato")).toBeInTheDocument();
    expect(await screen.findByText("Passport reference")).toBeInTheDocument();
    expect(screen.getByText("New Union player identity")).toBeInTheDocument();
    expect(screen.getByText("Confirm age category.")).toBeInTheDocument();
    expect(service.getUnionPlayerRegistrationSubmissions).toHaveBeenCalledWith("uru", { search: "", status: "ALL" });
    expect(service.getUnionPlayerRegistrationSubmissionDetail).toHaveBeenCalledWith("uru", 41);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    expect(screen.queryByText(/Development demo|Daniel Okello/)).not.toBeInTheDocument();
  });

  it("shows an honest empty and filtered-empty state", async () => {
    service.getUnionPlayerRegistrationSubmissions.mockResolvedValue({ count: 0, results: [] });
    renderScreen();
    expect(await screen.findByText("No registration submissions")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "REJECTED" } });
    expect(await screen.findByText("No submissions match")).toBeInTheDocument();
  });

  it("shows retryable API and permission-denied states", async () => {
    service.getUnionPlayerRegistrationSubmissions.mockRejectedValue({ response: { status: 403 } });
    renderScreen();
    expect(await screen.findByText(/do not have permission/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("reloads with a cleared selection when the workspace changes", async () => {
    const view = renderScreen();
    await screen.findByText("Passport reference");
    service.getUnionPlayerRegistrationSubmissions.mockResolvedValue({ count: 0, results: [] });
    view.rerender(
      <UnionRegistrationsScreen workspaceSlug="fufa" workspaceName="FUFA" canManage canApprove />,
    );
    await waitFor(() => expect(service.getUnionPlayerRegistrationSubmissions).toHaveBeenCalledWith("fufa", { search: "", status: "ALL" }));
    expect(await screen.findByText("No registration submissions")).toBeInTheDocument();
    expect(screen.queryByText("Passport reference")).not.toBeInTheDocument();
  });

  it("sends search and status filters to the queue endpoint", async () => {
    renderScreen();
    await screen.findByText("Amina Kato");
    fireEvent.change(screen.getByLabelText("Search submissions"), { target: { value: "Amina" } });
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "UNDER_REVIEW" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() => expect(service.getUnionPlayerRegistrationSubmissions).toHaveBeenCalledWith("uru", { search: "Amina", status: "UNDER_REVIEW" }));
  });

  it("uses the review comment as the change-request reason", async () => {
    service.requestUnionPlayerRegistrationChanges.mockResolvedValue({ ...detail, submission_status: "CHANGES_REQUESTED" });
    renderScreen();
    await screen.findByText("Passport reference");
    fireEvent.change(screen.getByLabelText("Review comment / decision reason"), { target: { value: "Please replace the identity scan." } });
    fireEvent.click(screen.getByRole("button", { name: "Request changes" }));
    await waitFor(() => expect(service.requestUnionPlayerRegistrationChanges).toHaveBeenCalledWith("uru", 41, "Please replace the identity scan."));
  });

  it("confirms and submits an approval decision", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    service.approveUnionPlayerRegistration.mockResolvedValue({ submission: { ...detail, submission_status: "APPROVED" }, authoritative_registration: null, automatic_validation: detail.automatic_validation, idempotent_replay: false, eligibility_review_required: true });
    renderScreen();
    await screen.findByText("Passport reference");
    fireEvent.change(screen.getByLabelText("Review comment / decision reason"), { target: { value: "Evidence verified." } });
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    await waitFor(() => expect(service.approveUnionPlayerRegistration).toHaveBeenCalledWith("uru", 41, "Evidence verified."));
  });

  it("keeps actions hidden for read-only users", async () => {
    renderScreen({ canManage: false, canApprove: false });
    expect(await screen.findByText(/read-only access/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });
});
