import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import UnionStatisticsRecordsScreen from "./UnionStatisticsRecordsScreen";

const getUnionDashboardOverview = vi.hoisted(() => vi.fn());
vi.mock("../../services/unionAdminService", () => ({ getUnionDashboardOverview }));

const summary = { active_competitions: 3, member_clubs: 8, national_teams: 2, pending_approvals: 4, referees: 22, upcoming_matches: 6 };

describe("UnionStatisticsRecordsScreen", () => {
  beforeEach(() => { vi.clearAllMocks(); getUnionDashboardOverview.mockResolvedValue({ summary }); });

  it("renders only backend workspace aggregate values", async () => {
    render(<UnionStatisticsRecordsScreen workspaceSlug="uru" workspaceName="Uganda Rugby Union" />);
    expect(screen.getByText("Loading workspace statistics…")).toBeInTheDocument();
    expect(await screen.findByText("22")).toBeInTheDocument();
    expect(getUnionDashboardOverview).toHaveBeenCalledWith("uru");
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    expect(screen.queryByText(/Development demo|record holder/i)).not.toBeInTheDocument();
  });

  it("reloads without retaining another workspace summary", async () => {
    const view = render(<UnionStatisticsRecordsScreen workspaceSlug="uru" workspaceName="URU" />);
    await screen.findByText("22");
    getUnionDashboardOverview.mockResolvedValue({ summary: { ...summary, referees: 5 } });
    view.rerender(<UnionStatisticsRecordsScreen workspaceSlug="fufa" workspaceName="FUFA" />);
    await waitFor(() => expect(getUnionDashboardOverview).toHaveBeenCalledWith("fufa"));
    expect(await screen.findByText("5")).toBeInTheDocument();
    expect(screen.queryByText("22")).not.toBeInTheDocument();
  });

  it("shows a retryable permission state", async () => {
    getUnionDashboardOverview.mockRejectedValue({ response: { status: 403 } });
    render(<UnionStatisticsRecordsScreen workspaceSlug="uru" workspaceName="URU" />);
    expect(await screen.findByText(/do not have permission/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
