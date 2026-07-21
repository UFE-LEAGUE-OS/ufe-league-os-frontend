import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import UnionPlayersTransfersScreen from "./UnionPlayersTransfersScreen";

describe("UnionPlayersTransfersScreen", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps API mode honest when no maintained workflow is connected", () => {
    vi.stubEnv("VITE_UNION_DEMO_MODE", "false");
    render(<UnionPlayersTransfersScreen />);

    expect(screen.getByText("Not connected yet")).toBeInTheDocument();
    expect(screen.queryByText("Amina Kato")).not.toBeInTheDocument();
  });

  it("supports demo-mode player and transfer navigation", () => {
    vi.stubEnv("VITE_UNION_DEMO_MODE", "true");
    render(<UnionPlayersTransfersScreen />);

    expect(screen.getByText("Amina Kato")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Transfers" }));
    expect(screen.getByText(/Permanent transfer/)).toBeInTheDocument();
  });
});
