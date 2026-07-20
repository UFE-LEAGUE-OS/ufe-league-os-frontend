import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  BarChart3,
  CalendarDays,
  ScanLine,
  TicketCheck,
  Users,
  Wallet,
} from "lucide-react";
import { MemoryRouter } from "react-router-dom";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { useAuthStore } from "../../store/authStore";
import type { ActiveClubWorkspace } from "../../utils/clubWorkspace";

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

type ClubTabKey =
  | "overview"
  | "finances"
  | "teams"
  | "ticketing"
  | "scanner"
  | "unannotated";

const clubNavItems: AdminWorkspaceNavItem<ClubTabKey>[] = [
  {
    key: "overview",
    label: "Overview",
    icon: BarChart3,
    requiredClubPermissions: ["dashboard.club_admin"],
    clubWorkspaceFamily: "CLUB_ADMIN",
  },
  {
    key: "finances",
    label: "Finances",
    icon: Wallet,
    requiredClubPermissions: [
      "club.finance.view",
      "club.finance.manage",
    ],
  },
  {
    key: "teams",
    label: "Teams",
    icon: Users,
    requiredClubPermissions: ["club.squad.manage"],
  },
  {
    key: "ticketing",
    label: "Tickets",
    icon: TicketCheck,
    requiredClubPermissions: ["club.ticketing.manage"],
    clubWorkspaceFamily: [
      "CLUB_ADMIN",
      "TICKETING_OFFICER",
    ],
  },
  {
    key: "scanner",
    label: "Ticket Scanner",
    icon: ScanLine,
    requiredClubPermissions: ["club.ticketing.validate"],
    clubWorkspaceFamily: [
      "CLUB_ADMIN",
      "TICKETING_OFFICER",
    ],
  },
  {
    key: "unannotated",
    label: "Unannotated",
    icon: CalendarDays,
  },
];

function activeClubWorkspace(
  overrides: Partial<ActiveClubWorkspace> = {},
): ActiveClubWorkspace {
  return {
    entitlement_id: "club-scope-7",
    dashboard: "CLUB_ADMIN",
    route: "/dashboard/club-admin",
    scope_type: "CLUB",
    scope_id: 7,
    workspace_role: "TREASURER",
    permissions: ["club.finance.view"],
    ...overrides,
  };
}

describe("AdminWorkspaceLayout", () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      accessStatus: "unauthenticated",
      requiresEmailVerification: false,
    });
  });

  it("does not provide a Fan switch without an explicit Fan entitlement", () => {
    useAuthStore.setState({
      accessToken: "access-token",
      user: {
        dashboard_access: {
          version: 1,
          default_entitlement_id: "union-1",
          entitlements: [{
            id: "union-1",
            dashboard: "UNION_WORKSPACE",
            route: "/dashboard/union-admin",
            scope_type: "UNION_WORKSPACE",
            scope_id: 1,
            workspace_role: "OWNER",
            permissions: [],
          }],
        },
      },
      accessStatus: "ready",
    });

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

    expect(screen.queryByRole("link", { name: /fan dashboard/i })).toBeNull();
  });

  it("provides a Fan switch only when the Fan entitlement is explicit", () => {
    useAuthStore.setState({
      accessToken: "access-token",
      user: {
        dashboard_access: {
          version: 1,
          default_entitlement_id: "union-1",
          entitlements: [
            {
              id: "union-1",
              dashboard: "UNION_WORKSPACE",
              route: "/dashboard/union-admin",
              scope_type: "UNION_WORKSPACE",
              scope_id: 1,
              workspace_role: "OWNER",
              permissions: [],
            },
            {
              id: "fan",
              dashboard: "FAN",
              route: "/dashboard/fan",
              scope_type: "ACCOUNT",
              scope_id: 1,
              workspace_role: null,
              permissions: [],
            },
          ],
        },
      },
      accessStatus: "ready",
    });

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

    expect(
      screen.getAllByRole("link", { name: /fan dashboard/i }).some(
        (link) => link.getAttribute("href") === "/dashboard/fan",
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

  it("uses one entitlement-filtered nav for desktop, drawer, and mobile", () => {
    render(
      <MemoryRouter>
        <AdminWorkspaceLayout<ClubTabKey>
          workspaceTitle="KOBS"
          workspaceSubtitle="Rugby club administration"
          eyebrow="Club workspace"
          title="KOBS"
          description="Manage this Club."
          navItems={clubNavItems}
          activeTab="finances"
          onTabChange={vi.fn()}
          activeClubWorkspace={activeClubWorkspace()}
        >
          <p>Finance content</p>
        </AdminWorkspaceLayout>
      </MemoryRouter>,
    );

    expect(
      screen.getAllByRole("button", { name: "Finances" }),
    ).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: "Teams" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Tickets" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Unannotated" }),
    ).toBeNull();
    expect(
      screen.getAllByText(
        "Treasurer · Rugby club administration",
      ).length,
    ).toBeGreaterThan(0);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Open more navigation",
      }),
    );

    expect(
      screen.getAllByRole("button", { name: "Finances" }),
    ).toHaveLength(3);
    expect(
      screen.getByText(
        "KOBS · Treasurer · Rugby club administration",
      ),
    ).toBeInTheDocument();
  });

  it("restricts a Ticketing entitlement to ticketing-family modules", () => {
    render(
      <MemoryRouter>
        <AdminWorkspaceLayout<ClubTabKey>
          workspaceTitle="KOBS"
          workspaceSubtitle="Club ticketing"
          eyebrow="Club workspace"
          title="KOBS"
          description="Manage Club entry."
          navItems={clubNavItems}
          activeTab="ticketing"
          onTabChange={vi.fn()}
          activeClubWorkspace={activeClubWorkspace({
            dashboard: "TICKETING_OFFICER",
            route: "/dashboard/ticketing-officer",
            workspace_role: "TICKETING_OFFICER",
            permissions: [
              "club.ticketing.manage",
              "club.ticketing.validate",
              "club.finance.view",
              "club.squad.manage",
            ],
          })}
        >
          <p>Ticketing content</p>
        </AdminWorkspaceLayout>
      </MemoryRouter>,
    );

    expect(
      screen.getAllByRole("button", { name: "Tickets" }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("button", {
        name: "Ticket Scanner",
      }),
    ).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: "Finances" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Teams" }),
    ).toBeNull();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Open more navigation",
      }),
    );

    expect(
      screen.getAllByRole("button", { name: "Tickets" }),
    ).toHaveLength(3);
    expect(
      screen.getAllByRole("button", {
        name: "Ticket Scanner",
      }),
    ).toHaveLength(3);
  });

  it("fails closed for missing Club permission metadata", () => {
    type FailClosedTab = "unannotated" | "parent" | "child";
    const emptyPermissionNav: AdminWorkspaceNavItem<FailClosedTab>[] = [
      {
        key: "unannotated",
        label: "Unannotated module",
        icon: BarChart3,
        // No requiredClubPermissions property at all - should fail closed
      },
      {
        key: "parent",
        label: "Unannotated parent",
        icon: Users,
        children: [
          {
            key: "child",
            label: "Permitted child",
            icon: Wallet,
            requiredClubPermissions: ["club.finance.view"],
          },
        ],
      },
    ];

    render(
      <MemoryRouter>
        <AdminWorkspaceLayout<FailClosedTab>
          workspaceTitle="KOBS"
          workspaceSubtitle="Club administration"
          eyebrow="Club workspace"
          title="KOBS"
          description="Manage this Club."
          navItems={emptyPermissionNav}
          activeTab="unannotated"
          onTabChange={vi.fn()}
          activeClubWorkspace={activeClubWorkspace({
            permissions: ["dashboard.club_admin"],
          })}
        >
          <p>Safe content state</p>
        </AdminWorkspaceLayout>
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("button", {
        name: "Unannotated module",
      }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", {
        name: "Unannotated parent",
      }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", {
        name: "Permitted child",
      }),
    ).toBeNull();
  });
});
