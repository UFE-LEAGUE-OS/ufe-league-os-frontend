import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  UnionAdminLeagueOption,
  UnionAdminSeasonRecord,
  UnionWorkspaceOption,
} from "../../services/unionAdminService";
import CompetitionCreationWizard from "./CompetitionCreationWizard";

const service = vi.hoisted(() => ({
  createUnionCompetitionWorkflow: vi.fn(),
  getUnionCompetitionEligibleAdministrators: vi.fn(),
}));
vi.mock("../../services/unionAdminService", () => service);

const workspace: UnionWorkspaceOption = {
  id: 1, name: "Uganda Rugby Union", slug: "uru", acronym: "URU", sport: "RUGBY",
  workspaceType: "FEDERATION", description: "", primaryColor: "#7244df", role: "UNION_ADMIN",
  roleDisplay: "Union Admin", permissions: ["union.competitions.manage"],
};
const leagues = [{ id: 4, name: "Premiership" }] as UnionAdminLeagueOption[];
const seasons = [{ id: 3, league: 4, name: "2027" }] as UnionAdminSeasonRecord[];

function renderWizard(onError = vi.fn()) {
  render(
    <CompetitionCreationWizard
      workspace={workspace}
      leagues={leagues}
      seasons={seasons}
      identities={[]}
      onCancel={vi.fn()}
      onCreated={vi.fn()}
      onError={onError}
    />,
  );
  return { onError };
}

async function reachReview() {
  fireEvent.change(screen.getByLabelText("Competition name"), { target: { value: "National Championship" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  await screen.findByRole("option", { name: /Competition Owner/ });
  fireEvent.change(screen.getByLabelText("Active workspace user"), { target: { value: "11" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  fireEvent.change(screen.getByLabelText("Season"), { target: { value: "3" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

describe("CompetitionCreationWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.getUnionCompetitionEligibleAdministrators.mockResolvedValue([
      { id: 11, name: "Competition Owner", email: "owner@example.test", workspace_role: "OWNER", effective_permissions: [] },
    ]);
  });

  it("retains entered values when moving backward", async () => {
    renderWizard();
    fireEvent.change(screen.getByLabelText("Competition name"), { target: { value: "National Championship" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByText("Validated competition format")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("Competition name")).toHaveValue("National Championship");
  });

  it("prevents advancing when the current step is invalid", async () => {
    renderWizard();
    fireEvent.change(screen.getByLabelText("Competition name"), { target: { value: "National Championship" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.change(screen.getByLabelText("Maximum clubs"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Maximum clubs must be");
    expect(screen.getByText("Validated competition format")).toBeInTheDocument();
  });

  it("reports a rejected atomic request without implying partial success", async () => {
    const onError = vi.fn();
    service.createUnionCompetitionWorkflow.mockRejectedValue({
      response: { status: 400, data: { identity: { default_format: { maximum_clubs: ["Maximum clubs must be at least the minimum clubs."] } } } },
    });
    renderWizard(onError);
    await reachReview();
    fireEvent.click(screen.getByRole("button", { name: "Create draft competition" }));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(
      "Competition was not created: Maximum clubs must be at least the minimum clubs.",
    ));
  });
});
