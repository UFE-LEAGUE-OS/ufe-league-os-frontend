import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getUnionAuthoritativePlayerRegistrations,
  getUnionPlayerEligibilities,
  getUnionPlayerRegistrationSubmissions,
  getUnionPlayerTransfers,
} from "../../services/unionAdminService";
import UnionPlayersTransfersScreen from "./UnionPlayersTransfersScreen";

vi.mock("../../services/unionAdminService", () => ({
  getUnionAuthoritativePlayerRegistrations: vi.fn(),
  getUnionPlayerEligibilities: vi.fn(),
  getUnionPlayerRegistrationSubmissions: vi.fn(),
  getUnionPlayerTransfers: vi.fn(),
}));

const workspaceProps = {
  workspaceSlug: "uru",
  workspaceName: "Uganda Rugby Union",
};

const emptyResponse = { count: 0, results: [] };

describe("UnionPlayersTransfersScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUnionAuthoritativePlayerRegistrations).mockResolvedValue({
      count: 1,
      results: [
        {
          id: 1,
          workspace: 1,
          player: 1,
          union_player_number: "URU-2026-0001",
          player_name: "Amina Kato",
          club: 1,
          club_name: "KCB KOBS",
          team: null,
          team_name: null,
          season: 1,
          source_registration: 1,
          status: "ACTIVE",
          registration_type: "NEW",
          effective_from: "2026-07-01",
          effective_to: null,
          approved_by: 2,
          approved_by_name: "Union Registrar",
          approved_at: "2026-07-02T10:00:00Z",
          decision_reason: "Approved for the season.",
          predecessor: null,
          created_at: "2026-07-01T10:00:00Z",
          updated_at: "2026-07-02T10:00:00Z",
        },
      ],
    });
    vi.mocked(getUnionPlayerRegistrationSubmissions).mockResolvedValue(
      emptyResponse,
    );
    vi.mocked(getUnionPlayerEligibilities).mockResolvedValue(emptyResponse);
    vi.mocked(getUnionPlayerTransfers).mockResolvedValue({
      count: 1,
      results: [
        {
          id: 5,
          status: "UNDER_REVIEW",
          transfer_type: "PERMANENT",
          player: 1,
          union_player_number: "URU-2026-0001",
          player_name: "Amina Kato",
          source_registration: 1,
          source_club: 1,
          source_club_name: "KCB KOBS",
          destination_club: 2,
          destination_club_name: "Heathens",
          destination_team: null,
          destination_team_name: null,
          effective_on: "2026-08-01",
          loan_end_on: null,
          source_club_response_status: "PENDING",
          player_consent_status: "PENDING",
          initiated_by: 3,
          initiated_by_name: "Club Admin",
          reviewed_by: null,
          reviewed_by_name: null,
          reviewed_at: null,
          submission_revision: 1,
          submitted_at: "2026-07-20T10:00:00Z",
          last_resubmitted_at: null,
          activated_at: null,
          returned_at: null,
          completed_at: null,
          created_at: "2026-07-20T10:00:00Z",
          updated_at: "2026-07-20T10:00:00Z",
        },
      ],
    });
  });

  it("loads the authoritative player registry from the backend", async () => {
    render(<UnionPlayersTransfersScreen {...workspaceProps} />);

    expect(
      await screen.findByRole("heading", {
        name: "Amina Kato",
        level: 3,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("URU-2026-0001").length).toBeGreaterThan(0);
    expect(getUnionAuthoritativePlayerRegistrations).toHaveBeenCalledWith(
      "uru",
      { search: "", status: "ALL" },
    );
    expect(screen.queryByText("Development demo")).not.toBeInTheDocument();
  });

  it("loads transfer records when the transfer tab is selected", async () => {
    render(<UnionPlayersTransfersScreen {...workspaceProps} />);
    await screen.findByRole("heading", {
      name: "Amina Kato",
      level: 3,
    });

    fireEvent.click(screen.getByRole("tab", { name: "Transfers" }));

    await waitFor(() => {
      expect(getUnionPlayerTransfers).toHaveBeenCalledWith("uru", {
        search: "",
        status: "ALL",
        transferType: undefined,
      });
    });
    expect(
      await screen.findAllByText("KCB KOBS → Heathens"),
    ).toHaveLength(2);
  });

  it("shows an honest empty state when the backend has no records", async () => {
    vi.mocked(getUnionAuthoritativePlayerRegistrations).mockResolvedValue(
      emptyResponse,
    );

    render(<UnionPlayersTransfersScreen {...workspaceProps} />);

    expect(await screen.findByText("No matching records")).toBeInTheDocument();
  });
});
