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
  it("labels local branding files as preview-only", () => {
    render(<UnionProfileBrandingScreen workspace={workspace} />);

    expect(screen.getByText(/Preview only/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Save branding/ }),
    ).toBeDisabled();
  });
});
