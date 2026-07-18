import { render, screen, within } from "@testing-library/react";
import { BarChart3, DollarSign, FileText, TicketCheck } from "lucide-react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "../../store/authStore";

import MobileUnionNavigation from "./MobileUnionNavigation";

const items = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "finance", label: "Finance", icon: DollarSign },
  { key: "scanner", label: "Scanner", icon: TicketCheck },
  { key: "entryLogs", label: "Entry Logs", icon: FileText },
  { key: "ticketing", label: "Ticketing", icon: TicketCheck },
];

describe("MobileUnionNavigation", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      accessStatus: "unauthenticated",
    });
  });

  it("does not expose a Fan link without an explicit route", () => {
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
  });

  it("shows the Fan link only when the validated route is supplied", () => {
    useAuthStore.setState({
      user: {
        dashboard_access: {
          version: 1,
          default_entitlement_id: "fan",
          entitlements: [
            {
              id: "fan",
              dashboard: "FAN",
              route: "/dashboard/fan",
              scope_type: "ACCOUNT",
              scope_id: 8,
              workspace_role: null,
              permissions: [],
            },
          ],
        },
      },
      accessToken: "access-token",
      accessStatus: "ready",
    });

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
      screen.getByRole("link", { name: /fan dashboard/i }),
    ).toHaveAttribute("href", "/dashboard/fan");
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
