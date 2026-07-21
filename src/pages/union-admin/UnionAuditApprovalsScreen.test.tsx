import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getUnionApprovals,
  getUnionAuditEvents,
  getUnionDocumentReferences,
  getUnionReviewComments,
  reviewUnionApproval,
} from "../../services/unionAdminService";
import UnionAuditApprovalsScreen from "./UnionAuditApprovalsScreen";

vi.mock("../../services/unionAdminService", () => ({
  getUnionApprovals: vi.fn(),
  getUnionAuditEvents: vi.fn(),
  getUnionDocumentReferences: vi.fn(),
  getUnionReviewComments: vi.fn(),
  reviewUnionApproval: vi.fn(),
}));

const workspaceProps = {
  workspaceSlug: "uru",
  workspaceName: "Uganda Rugby Union",
};

const pendingApproval = {
  id: 7,
  workspace: 1,
  subject_type: "player_registration",
  subject_id: 42,
  action: "player.registration.approve",
  status: "PENDING" as const,
  requested_by: 4,
  requested_by_email: "club.admin@leagueos.test",
  reviewed_by: null,
  reviewed_by_email: null,
  reason: "Player registration review required.",
  decision_reason: "",
  metadata: { demo_key: "coverage" },
  reviewed_at: null,
  created_at: "2026-07-21T10:00:00Z",
  updated_at: "2026-07-21T10:00:00Z",
};

const emptyResponse = { count: 0, results: [] };

describe("UnionAuditApprovalsScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUnionApprovals).mockResolvedValue({
      count: 1,
      results: [pendingApproval],
    });
    vi.mocked(getUnionAuditEvents).mockResolvedValue({
      count: 1,
      results: [
        {
          id: 10,
          workspace: 1,
          actor: 5,
          actor_email: "uru.registrar@leagueos.test",
          action: "player.registration.approved",
          target_type: "union_player_registration",
          target_id: 42,
          metadata: { source: "workflow" },
          created_at: "2026-07-21T11:00:00Z",
        },
      ],
    });
    vi.mocked(getUnionReviewComments).mockResolvedValue(emptyResponse);
    vi.mocked(getUnionDocumentReferences).mockResolvedValue(emptyResponse);
    vi.mocked(reviewUnionApproval).mockResolvedValue({
      ...pendingApproval,
      status: "APPROVED",
      reviewed_by: 6,
      reviewed_by_email: "uru.owner@leagueos.test",
      decision_reason: "Verified and approved.",
      reviewed_at: "2026-07-21T12:00:00Z",
    });
  });

  it("loads the approval queue from the backend", async () => {
    render(<UnionAuditApprovalsScreen {...workspaceProps} />);

    expect(
      await screen.findByRole("heading", {
        name: "Player Registration Approve",
        level: 3,
      }),
    ).toBeInTheDocument();
    expect(getUnionApprovals).toHaveBeenCalledWith("uru", { status: "ALL" });
    expect(screen.queryByText("Development demo")).not.toBeInTheDocument();
  });

  it("submits an approval decision to the backend", async () => {
    render(<UnionAuditApprovalsScreen {...workspaceProps} />);
    await screen.findByRole("button", { name: "Approve request" });

    fireEvent.change(screen.getByLabelText("Decision reason"), {
      target: { value: "Verified and approved." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Approve request" }));

    await waitFor(() => {
      expect(reviewUnionApproval).toHaveBeenCalledWith("uru", 7, {
        decision: "APPROVED",
        decision_reason: "Verified and approved.",
      });
    });
    expect(
      await screen.findByText("The approval request was approved."),
    ).toBeInTheDocument();
  });

  it("loads immutable audit events when the audit tab is selected", async () => {
    render(<UnionAuditApprovalsScreen {...workspaceProps} />);
    await screen.findByRole("heading", {
      name: "Player Registration Approve",
      level: 3,
    });

    fireEvent.click(screen.getByRole("tab", { name: "Audit Events" }));

    await waitFor(() => {
      expect(getUnionAuditEvents).toHaveBeenCalledWith("uru");
    });
    expect(
      await screen.findByRole("heading", {
        name: "Player Registration Approved",
        level: 3,
      }),
    ).toBeInTheDocument();
  });

  it("shows an honest empty state when the backend returns no approvals", async () => {
    vi.mocked(getUnionApprovals).mockResolvedValue(emptyResponse);

    render(<UnionAuditApprovalsScreen {...workspaceProps} />);

    expect(await screen.findByText("No governance records")).toBeInTheDocument();
  });
});
