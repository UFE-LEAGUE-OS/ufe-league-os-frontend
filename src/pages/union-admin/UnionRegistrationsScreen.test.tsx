import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import UnionRegistrationsScreen from "./UnionRegistrationsScreen";

describe("UnionRegistrationsScreen", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("shows the demo review queue and selected registration detail", () => {
    vi.stubEnv("VITE_UNION_DEMO_MODE", "true");
    render(
      <UnionRegistrationsScreen
        workspaceSlug="uru"
        workspaceName="Uganda Rugby Union"
      />,
    );

    expect(screen.getAllByText("Amina Kato")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: /Daniel Okello/ }));
    expect(
      screen.getByRole("heading", { name: "Daniel Okello" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Competition Registrar")).toBeInTheDocument();
  });
});
