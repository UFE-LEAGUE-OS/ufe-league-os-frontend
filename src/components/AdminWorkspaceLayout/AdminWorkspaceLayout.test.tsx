import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  BarChart3,
  CalendarDays,
} from "lucide-react";
import { MemoryRouter } from "react-router-dom";
import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import AdminWorkspaceLayout, {
  type AdminWorkspaceNavItem,
} from "./AdminWorkspaceLayout";

type TabKey = "overview" | "fixtures";

const navItems: AdminWorkspaceNavItem<TabKey>[] = [
  {
    key: "overview",
    label: "Overview",
    icon: BarChart3,
  },
  {
    key: "fixtures",
    label: "Fixtures",
    icon: CalendarDays,
  },
];

describe("AdminWorkspaceLayout", () => {
  it("provides an explicit Fan Dashboard switch", () => {
    render(
      <MemoryRouter>
        <AdminWorkspaceLayout<TabKey>
          workspaceTitle="Test League"
          workspaceSubtitle="League administrator"
          eyebrow="League workspace"
          title="Competition Operations"
          description="Manage competition operations."
          navItems={navItems}
          activeTab="overview"
          onTabChange={vi.fn()}
          publicPath="/competitions"
          publicLabel="View competitions"
        >
          <p>Workspace content</p>
        </AdminWorkspaceLayout>
      </MemoryRouter>,
    );

    const fanLinks = screen.getAllByRole("link", {
      name: /fan dashboard/i,
    });

    expect(
      fanLinks.some(
        (link) =>
          link.getAttribute("href") ===
          "/dashboard/fan",
      ),
    ).toBe(true);
  });

  it("changes workspace tabs through shared navigation", () => {
    const onTabChange = vi.fn();

    render(
      <MemoryRouter>
        <AdminWorkspaceLayout<TabKey>
          workspaceTitle="Test League"
          workspaceSubtitle="League administrator"
          eyebrow="League workspace"
          title="Competition Operations"
          description="Manage competition operations."
          navItems={navItems}
          activeTab="overview"
          onTabChange={onTabChange}
        >
          <p>Workspace content</p>
        </AdminWorkspaceLayout>
      </MemoryRouter>,
    );

    const fixtureButtons = screen.getAllByRole(
      "button",
      {
        name: "Fixtures",
      },
    );

    fireEvent.click(fixtureButtons[0]);

    expect(onTabChange).toHaveBeenCalledWith(
      "fixtures",
    );
  });
});
