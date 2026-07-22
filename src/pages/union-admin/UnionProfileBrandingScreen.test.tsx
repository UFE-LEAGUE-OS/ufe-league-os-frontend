import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { UnionWorkspaceOption } from "../../services/unionAdminService";
import UnionProfileBrandingScreen from "./UnionProfileBrandingScreen";

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
  permissions: ["union.dashboard.view"],
};

describe("UnionProfileBrandingScreen", () => {
  it("shows maintained workspace identity without non-persisting controls", () => {
    render(<UnionProfileBrandingScreen workspace={workspace} />);

    expect(screen.getByText("Uganda Rugby Union")).toBeInTheDocument();
    expect(screen.getByText("Branding editing unavailable")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Save branding/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
  });
});
