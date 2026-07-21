import { render, screen, within } from "@testing-library/react";
import { BarChart3, DollarSign, FileText, TicketCheck } from "lucide-react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import MobileUnionNavigation from "./MobileUnionNavigation";

const items = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "finance", label: "Finance", icon: DollarSign },
  { key: "scanner", label: "Scanner", icon: TicketCheck },
  { key: "entryLogs", label: "Entry Logs", icon: FileText },
  { key: "ticketing", label: "Ticketing", icon: TicketCheck },
];

describe("MobileUnionNavigation", () => {
  it("keeps Union navigation separate from the Fan dashboard", () => {
    render(
      <MemoryRouter>
        <MobileUnionNavigation
          activeKey="overview"
          items={items}
          workspaceName="Uganda Rugby Union"
          workspaceRole="TICKETING_OFFICER"
          onTabChange={vi.fn()}
          onLogout={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("link", { name: /fan dashboard/i }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /league os home/i }),
    ).toHaveAttribute("href", "/");
  });

  it("uses the exact Ticketing Officer role for restricted primary navigation", () => {
    render(
      <MemoryRouter>
        <MobileUnionNavigation
          activeKey="overview"
          items={items}
          workspaceName="Uganda Rugby Union"
          workspaceRole="TICKETING_OFFICER"
          onTabChange={vi.fn()}
          onLogout={vi.fn()}
        />
      </MemoryRouter>,
    );

    const navigation = screen.getByRole("navigation", {
      name: /union workspace mobile navigation/i,
    });

    expect(
      within(navigation)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Overview", "Ticketing", "Entry Logs", "Scanner", "More"]);
  });
});
