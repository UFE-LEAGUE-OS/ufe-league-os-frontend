import {
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  MessageSquare,
  Settings as SettingsIcon,
  RefreshCw,
  ShieldCheck,
  TicketCheck,
  Trophy,
  Users,
  Wallet,
  FileBarChart,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminWorkspaceLayout, {
  type AdminWorkspaceNavItem,
  WorkspaceEmpty,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
  WorkspaceStatGrid,
  adminWorkspaceStyles as styles,
  formatWorkspaceDate,
} from "../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
import {
  getApiErrorMessage,
  getCustomAdminWorkspace,
  type CustomAdminPermissionKey,
  type CustomAdminWorkspaceData,
} from "../../services/adminWorkspaceService";

type TabKey =
  | "overview"
  | "members"
  | "teams"
  | "matches"
  | "finances"
  | "tickets"
  | "facilities"
  | "reports"
  | "communications"
  | "settings";

const PERMISSION_LABELS: Record<
  CustomAdminPermissionKey,
  string
> = {
  view_members: "View Members",
  manage_teams: "Manage Teams",
  view_matches: "View Matches",
  manage_finances: "Manage Finances",
  manage_tickets: "Manage Tickets",
  manage_facilities: "Manage Facilities",
  view_reports: "View Reports",
  manage_communications: "Manage Communications",
};

const NAV_ITEM_DEFINITIONS: Array<{
  key: TabKey;
  label: string;
  icon: AdminWorkspaceNavItem<TabKey>["icon"];
  permission?: CustomAdminPermissionKey;
}> = [
  { key: "overview", label: "Dashboard", icon: BarChart3 },
  {
    key: "members",
    label: "Members",
    icon: Users,
    permission: "view_members",
  },
  {
    key: "teams",
    label: "Teams",
    icon: Trophy,
    permission: "manage_teams",
  },
  {
    key: "matches",
    label: "Matches",
    icon: CalendarDays,
    permission: "view_matches",
  },
  {
    key: "finances",
    label: "Finances",
    icon: Wallet,
    permission: "manage_finances",
  },
  {
    key: "tickets",
    label: "Tickets",
    icon: TicketCheck,
    permission: "manage_tickets",
  },
  {
    key: "facilities",
    label: "Facilities",
    icon: Building2,
    permission: "manage_facilities",
  },
  {
    key: "reports",
    label: "Reports",
    icon: FileBarChart,
    permission: "view_reports",
  },
  {
    key: "communications",
    label: "Communications",
    icon: MessageSquare,
    permission: "manage_communications",
  },
  {
    key: "settings",
    label: "Settings",
    icon: SettingsIcon,
  },
];

export default function CustomAdminDashboard() {
  const [activeTab, setActiveTab] =
    useState<TabKey>("overview");
  const [data, setData] =
    useState<CustomAdminWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setData(await getCustomAdminWorkspace());
    } catch (loadError) {
      setData(null);
      setError(
        getApiErrorMessage(
          loadError,
          "The custom admin workspace could not be loaded.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  // Only show nav items the user actually has permission for.
  // Items with no `permission` (Dashboard, Settings) are always visible.
  const navItems: AdminWorkspaceNavItem<TabKey>[] = useMemo(
    () =>
      NAV_ITEM_DEFINITIONS.filter(
        (item) =>
          !item.permission ||
          data?.permissions?.[item.permission],
      ).map((item) => ({
        key: item.key,
        label: item.label,
        icon: item.icon,
      })),
    [data],
  );

  // Guard against landing on a tab the user lost permission for
  // (e.g. permissions changed since the last load).
  useEffect(() => {
    const stillVisible = navItems.some(
      (item) => item.key === activeTab,
    );

    if (!stillVisible && navItems.length > 0) {
      setActiveTab(navItems[0].key);
    }
  }, [navItems, activeTab]);

  const stats = useMemo(
    () => [
      {
        label: "Total Members",
        value: data?.summary.total_members ?? 0,
        detail: "Club members",
        icon: Users,
      },
      {
        label: "Teams",
        value: data?.summary.teams ?? 0,
        detail: "Active club teams",
        icon: Trophy,
      },
      {
        label: "Active Matches",
        value: data?.summary.active_matches ?? 0,
        detail: "Live & upcoming",
        icon: CalendarDays,
      },
      {
        label: "Open Reports",
        value: data?.summary.open_reports ?? 0,
        detail: "Awaiting review",
        icon: FileBarChart,
      },
    ],
    [data],
  );

  function renderOverview() {
    const permissionEntries = Object.entries(
      PERMISSION_LABELS,
    ) as Array<
      [CustomAdminPermissionKey, string]
    >;

    return (
      <>
        <WorkspaceStatGrid stats={stats} />

        <div className={styles.gridTwo}>
          <WorkspacePanel
            eyebrow="Access control"
            title="My permissions"
            description="What you're currently able to view and manage for this club."
          >
            <div className={styles.tableShell}>
              <table>
                <tbody>
                  {permissionEntries.map(
                    ([key, label]) => {
                      const granted = Boolean(
                        data?.permissions?.[key],
                      );

                      return (
                        <tr key={key}>
                          <td>{label}</td>
                          <td
                            style={{
                              textAlign: "right",
                              width: 40,
                            }}
                          >
                            {granted ? (
                              <Check
                                size={18}
                                color="var(--green)"
                                aria-label="Granted"
                              />
                            ) : (
                              <X
                                size={18}
                                color="var(--muted)"
                                aria-label="Not granted"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Club activity"
            title="Recent activity"
            description="The latest updates across your club."
            actions={
              <button
                type="button"
                className={styles.publicLink}
                onClick={() =>
                  data?.permissions?.view_reports
                    ? setActiveTab("reports")
                    : undefined
                }
              >
                View all activity
              </button>
            }
          >
            {data?.recent_activity?.length ? (
              <div className={styles.scopeGrid}>
                {data.recent_activity.map((activity) => (
                  <article
                    className={styles.scopeCard}
                    key={activity.id}
                  >
                    <span>
                      {formatWorkspaceDate(
                        activity.timestamp,
                      )}
                    </span>
                    <strong>{activity.title}</strong>
                    <small>{activity.description}</small>
                  </article>
                ))}
              </div>
            ) : (
              <WorkspaceEmpty
                title="No recent activity"
                description="Updates you have permission to see will appear here."
              />
            )}
          </WorkspacePanel>
        </div>
      </>
    );
  }

  function renderPlaceholder(
    title: string,
    description: string,
  ) {
    return (
      <WorkspacePanel
        eyebrow="Permission based"
        title={title}
        description={description}
      >
        <WorkspaceEmpty
          title={`${title} is not yet built out`}
          description="This section will surface full detail here once available."
        />
      </WorkspacePanel>
    );
  }

  let content;

  if (isLoading && !data) {
    content = (
      <WorkspaceLoading label="Loading your workspace…" />
    );
  } else if (error && !data) {
    content = (
      <WorkspaceError
        message={error}
        onRetry={loadWorkspace}
      />
    );
  } else if (
    activeTab !== "overview" &&
    activeTab !== "settings"
  ) {
    const definition = NAV_ITEM_DEFINITIONS.find(
      (item) => item.key === activeTab,
    );

    content = renderPlaceholder(
      definition?.label ?? "Section",
      "Detail for this section will appear here.",
    );
  } else if (activeTab === "settings") {
    content = renderPlaceholder(
      "Settings",
      "Your account and notification preferences.",
    );
  } else {
    content = renderOverview();
  }

  return (
    <AdminWorkspaceLayout<TabKey>
      workspaceTitle={data?.club.name ?? "Custom Admin"}
      workspaceSubtitle={
        data
          ? `${data.club.sport_display} club administration`
          : "Permission-based access"
      }
      eyebrow="Custom Admin"
      title="Dashboard"
      description="Your view is limited to the areas of the club you've been granted access to."
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerActions={
        <button
          type="button"
          className={styles.publicLink}
          disabled={isLoading}
          onClick={() => void loadWorkspace()}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      }
    >
      {error && data ? (
        <div className={styles.validationCard}>
          <ShieldCheck size={18} />
          <strong>Some information may be stale</strong>
          <span>{error}</span>
        </div>
      ) : null}

      {content}
    </AdminWorkspaceLayout>
  );
}