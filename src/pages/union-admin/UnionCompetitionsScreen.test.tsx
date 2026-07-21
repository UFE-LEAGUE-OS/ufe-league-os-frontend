import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { UnionWorkspaceOption } from "../../services/unionAdminService";
import UnionCompetitionsScreen from "./UnionCompetitionsScreen";

const workspace: UnionWorkspaceOption = {
  id: 1,
  name: "Uganda Rugby Union",
  slug: "uru",
  acronym: "URU",
  sport: "RUGBY",
  workspaceType: "FEDERATION",
  description: "National rugby workspace",
  primaryColor: "#7244df",
  role: "UNION_ADMIN",
  roleDisplay: "Union Admin",
  permissions: ["union.dashboard.view", "union.competitions.manage"],
};

describe("UnionCompetitionsScreen", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("shows the competition directory, identity, editions, and lifecycle in demo mode", () => {
    vi.stubEnv("VITE_UNION_DEMO_MODE", "true");
    render(<UnionCompetitionsScreen workspace={workspace} />);

    fireEvent.click(
      screen.getByRole("button", { name: /National Rugby Premiership/ }),
    );
    expect(screen.getByText("national-rugby-premiership")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("tab", { name: "Editions / Seasons" }),
    );
    expect(screen.getByText("2027 Premiership")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("tab", { name: "Publication & Lifecycle" }),
    );
    expect(
      screen.getByRole("button", { name: "Close registration (demo)" }),
    ).toBeInTheDocument();
  });
});
