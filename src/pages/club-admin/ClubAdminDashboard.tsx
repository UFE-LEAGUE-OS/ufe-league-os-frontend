import {
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Download,
  FileBarChart,
  Layers,
  Megaphone,
  MessageSquare,
  RefreshCw,
  Settings as SettingsIcon,
  ShieldCheck,
  TicketCheck,
  Trophy,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AdminWorkspaceLayout, {
  type AdminWorkspaceNavGroup,
  WorkspaceEmpty,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
  WorkspaceStatGrid,
  WorkspaceStatus,
  adminWorkspaceStyles as styles,
  formatWorkspaceDate,
} from "../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
import {
  getApiErrorMessage,
  getClubAdminWorkspace,
  type ClubAdminWorkspaceData,
} from "../../services/adminWorkspaceService";

type TabKey =
  | "overview"
  | "membership"
  | "membershipDirectory"
  | "membershipRenewals"
  | "membershipTiers"
  | "membershipRequests"
  | "membershipReports"
  | "teams"
  | "matches"
  | "finances"
  | "ticketing"
  | "facilities"
  | "profileBranding"
  | "sponsorshipMatchday"
  | "compliance"
  | "reports"
  | "communications"
  | "clubUsers"
  | "settings";

const navItems: AdminWorkspaceNavGroup<TabKey>[] = [
  {
    label: "Overview",
    items: [
      { key: "overview", label: "Dashboard", icon: BarChart3 },
    ],
  },
  {
    label: "Club Operations",
    items: [
      {
        key: "membership",
        label: "Membership",
        icon: CreditCard,
        children: [
          {
            key: "membershipDirectory",
            label: "Members Directory",
            icon: Users,
          },
          {
            key: "membershipRenewals",
            label: "Renewals & Expiry",
            icon: RefreshCw,
          },
          {
            key: "membershipTiers",
            label: "Tiers & Pricing",
            icon: Layers,
          },
          {
            key: "membershipRequests",
            label: "Requests Queue",
            icon: ClipboardList,
          },
          {
            key: "membershipReports",
            label: "Export Reports",
            icon: Download,
          },
        ],
      },
      { key: "teams", label: "Teams", icon: Trophy },
      { key: "matches", label: "Matches", icon: CalendarDays },
      { key: "finances", label: "Finances", icon: Wallet },
      { key: "ticketing", label: "Tickets", icon: TicketCheck },
      { key: "facilities", label: "Facilities", icon: Building2 },
    ],
  },
  {
    label: "Governance",
    items: [
      {
        key: "profileBranding",
        label: "Profile & Branding",
        icon: UserCircle,
      },
      {
        key: "sponsorshipMatchday",
        label: "Sponsorship & Matchday Operations",
        icon: Megaphone,
      },
      { key: "compliance", label: "Compliance", icon: ShieldCheck },
    ],
  },
  {
    label: "Administration",
    items: [
      { key: "reports", label: "Reports", icon: FileBarChart },
      {
        key: "communications",
        label: "Communications",
        icon: MessageSquare,
      },
      { key: "clubUsers", label: "Club Users", icon: Users },
      { key: "settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

export default function ClubAdminDashboard() {
  const [activeTab, setActiveTab] =
    useState<TabKey>("overview");
  const [data, setData] =
    useState<ClubAdminWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Membership's five sub-pages now render inline, in this same
  // workspace shell, the same way "User Management" expands in the
  // super-admin sidebar — so tab changes no longer need to navigate
  // away to a standalone route/page.
  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
  }, []);

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setData(await getClubAdminWorkspace());
    } catch (loadError) {
      setData(null);
      setError(
        getApiErrorMessage(
          loadError,
          "The club workspace could not be loaded.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const stats = useMemo(
    () => [
      {
        label: "Competitions",
        value: data?.summary.competitions ?? 0,
        detail: "Competitions featuring this club",
        icon: Trophy,
      },
      {
        label: "Upcoming Fixtures",
        value: data?.summary.upcoming_fixtures ?? 0,
        detail: "Scheduled club matches",
        icon: CalendarDays,
      },
      {
        label: "Tickets Sold",
        value: data?.summary.tickets_sold ?? 0,
        detail: "Issued match tickets",
        icon: TicketCheck,
      },
      {
        label: "Club Users",
        value: data?.summary.club_users ?? 0,
        detail: "Accounts attached to the club",
        icon: Users,
      },
    ],
    [data],
  );

  function renderFixtureTable(
    rows: ClubAdminWorkspaceData["upcoming_fixtures"],
    mode: "fixture" | "result",
  ) {
    if (rows.length === 0) {
      return (
        <WorkspaceEmpty
          title={
            mode === "fixture"
              ? "No upcoming fixtures"
              : "No completed results"
          }
          description={
            mode === "fixture"
              ? "Scheduled matches involving this club will appear here."
              : "Completed match results will appear here."
          }
        />
      );
    }

    return (
      <div className={styles.tableShell}>
        <table>
          <thead>
            <tr>
              <th>Match</th>
              <th>Competition</th>
              <th>Date</th>
              <th>Venue</th>
              {mode === "result" ? <th>Score</th> : null}
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((match) => (
              <tr key={match.id}>
                <td>
                  <span className={styles.tablePrimary}>
                    {match.label}
                  </span>
                  <span className={styles.tableSecondary}>
                    {match.league}
                  </span>
                </td>
                <td>{match.competition}</td>
                <td>
                  {formatWorkspaceDate(match.match_date)}
                </td>
                <td>{match.venue || "TBC"}</td>
                {mode === "result" ? (
                  <td>
                    {match.home_score ?? "—"} –{" "}
                    {match.away_score ?? "—"}
                  </td>
                ) : null}
                <td>
                  <WorkspaceStatus value={match.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderFinancialChart() {
    return data?.financial_overview?.length ? (
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data.financial_overview}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
            />
            <XAxis dataKey="month" stroke="var(--muted)" />
            <YAxis stroke="var(--muted)" />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            />
            <Legend />
            <Bar
              dataKey="income"
              fill="var(--green)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expense"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <WorkspaceEmpty
        title="No financial data"
        description="Income and expense records will appear here once available."
      />
    );
  }

  function renderOverview() {
    return (
      <>
        <WorkspaceStatGrid stats={stats} />

        <div className={styles.gridTwo}>
          <WorkspacePanel
            eyebrow="League participation"
            title="League memberships"
            description="Current league and season relationships recorded for this club."
          >
            {data?.league_memberships.length ? (
              <div className={styles.scopeGrid}>
                {data.league_memberships.map(
                  (membership) => (
                    <article
                      className={styles.scopeCard}
                      key={membership.id}
                    >
                      <span>
                        {membership.status_display}
                      </span>
                      <strong>{membership.league}</strong>
                      <small>
                        {membership.season ??
                          "No season assigned"}
                      </small>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <WorkspaceEmpty
                title="No league memberships"
                description="This club is not currently linked to a league season."
              />
            )}
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Ticketing readiness"
            title="Matchday access"
            description="Live ticket inventory and check-in totals for matches involving this club."
          >
            <div className={styles.scopeGrid}>
              <article className={styles.scopeCard}>
                <span>Ticket types</span>
                <strong>
                  {data?.summary.ticket_types ?? 0}
                </strong>
                <small>Configured inventory records</small>
              </article>

              <article className={styles.scopeCard}>
                <span>Checked in</span>
                <strong>
                  {data?.summary.checked_in ?? 0}
                </strong>
                <small>Tickets admitted at the gate</small>
              </article>
            </div>
          </WorkspacePanel>
        </div>

        <div className={styles.gridTwo}>
          <WorkspacePanel
            eyebrow="Club activity"
            title="Recent activity"
            description="The latest updates across your club."
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
                description="Updates like new members, results, and payments will appear here."
              />
            )}
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Club finances"
            title="Financial overview"
            description="Income vs expense across recent months."
            actions={
              <button
                type="button"
                className={styles.publicLink}
                onClick={() => setActiveTab("finances")}
              >
                View full finances
              </button>
            }
          >
            {renderFinancialChart()}
          </WorkspacePanel>
        </div>

        <WorkspacePanel
          eyebrow="Next matches"
          title="Upcoming fixtures"
          description="The next scheduled matches involving your club."
          actions={
            <button
              type="button"
              className={styles.publicLink}
              onClick={() => setActiveTab("matches")}
            >
              View all matches
            </button>
          }
        >
          {renderFixtureTable(
            data?.upcoming_fixtures ?? [],
            "fixture",
          )}
        </WorkspacePanel>
      </>
    );
  }

  function renderMatches() {
    return (
      <>
        <WorkspacePanel
          eyebrow="Club schedule"
          title="Upcoming fixtures"
          description="Every scheduled fixture involving this club."
        >
          {renderFixtureTable(
            data?.upcoming_fixtures ?? [],
            "fixture",
          )}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Club performance"
          title="Recent results"
          description="Completed match records involving this club."
        >
          {renderFixtureTable(
            data?.recent_results ?? [],
            "result",
          )}
        </WorkspacePanel>
      </>
    );
  }

  function renderFinances() {
    return (
      <WorkspacePanel
        eyebrow="Club finances"
        title="Financial overview"
        description="Income vs expense across recent months."
      >
        {renderFinancialChart()}
      </WorkspacePanel>
    );
  }

  function renderTicketing() {
    const events = data?.ticket_events ?? [];

    return (
      <WorkspacePanel
        eyebrow="Club ticketing"
        title="Ticketed match events"
        description="Inventory and admission figures for matches involving this club."
      >
        {events.length === 0 ? (
          <WorkspaceEmpty
            title="No ticketed events"
            description="No upcoming matches currently have ticket inventory configured."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Ticket Types</th>
                  <th>Sold</th>
                  <th>Checked In</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span className={styles.tablePrimary}>
                        {event.label}
                      </span>
                      <span
                        className={styles.tableSecondary}
                      >
                        {event.competition}
                      </span>
                    </td>
                    <td>
                      {formatWorkspaceDate(
                        event.match_date,
                      )}
                    </td>
                    <td>{event.ticket_types}</td>
                    <td>{event.tickets_sold}</td>
                    <td>{event.checked_in}</td>
                    <td>
                      <WorkspaceStatus
                        value={event.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderStaff() {
    const staff = data?.staff ?? [];

    return (
      <WorkspacePanel
        eyebrow="Club access"
        title="Club administrators and officers"
        description="Active administrative and ticketing users attached to this club."
      >
        {staff.length === 0 ? (
          <WorkspaceEmpty
            title="No club users"
            description="No administrative accounts are currently attached to this club."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {staff.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className={styles.tablePrimary}>
                        {user.name}
                      </span>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.role_display}</td>
                    <td>
                      <WorkspaceStatus value="ACTIVE" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderPlaceholder(
    title: string,
    description: string,
  ) {
    return (
      <WorkspacePanel
        eyebrow="Club administration"
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
      <WorkspaceLoading label="Loading club operations…" />
    );
  } else if (error && !data) {
    content = (
      <WorkspaceError
        message={error}
        onRetry={loadWorkspace}
      />
    );
  } else if (activeTab === "membershipDirectory") {
    content = renderPlaceholder(
      "Members Directory",
      "Browse and manage every member on your club roster.",
    );
  } else if (activeTab === "membershipRenewals") {
    content = renderPlaceholder(
      "Renewals & Expiry",
      "Track upcoming membership renewals and lapsed accounts.",
    );
  } else if (activeTab === "membershipTiers") {
    content = renderPlaceholder(
      "Tiers & Pricing",
      "Configure membership tiers, benefits, and pricing.",
    );
  } else if (activeTab === "membershipRequests") {
    content = renderPlaceholder(
      "Requests Queue",
      "Review pending membership applications and change requests.",
    );
  } else if (activeTab === "membershipReports") {
    content = renderPlaceholder(
      "Export Reports",
      "Generate and download membership reports.",
    );
  } else if (activeTab === "teams") {
    content = renderPlaceholder(
      "Teams",
      "Manage all teams belonging to this club.",
    );
  } else if (activeTab === "matches") {
    content = renderMatches();
  } else if (activeTab === "finances") {
    content = renderFinances();
  } else if (activeTab === "ticketing") {
    content = renderTicketing();
  } else if (activeTab === "facilities") {
    content = renderPlaceholder(
      "Facilities",
      "Manage grounds and facilities for this club.",
    );
  } else if (activeTab === "profileBranding") {
    content = renderPlaceholder(
      "Profile & Branding",
      "Manage your club's public profile, logo, and colors.",
    );
  } else if (activeTab === "sponsorshipMatchday") {
    content = renderPlaceholder(
      "Sponsorship & Matchday Operations",
      "Manage sponsors and matchday operational details.",
    );
  } else if (activeTab === "compliance") {
    content = renderPlaceholder(
      "Compliance",
      "Track club compliance and regulatory requirements.",
    );
  } else if (activeTab === "reports") {
    content = renderPlaceholder(
      "Reports",
      "Analytics and reports for this club.",
    );
  } else if (activeTab === "communications") {
    content = renderPlaceholder(
      "Communications",
      "Messages and alerts for this club.",
    );
  } else if (activeTab === "clubUsers") {
    content = renderStaff();
  } else if (activeTab === "settings") {
    content = renderPlaceholder(
      "Settings",
      "Club-wide configuration and preferences.",
    );
  } else {
    content = renderOverview();
  }

  return (
    <AdminWorkspaceLayout<TabKey>
      workspaceTitle={data?.club.name ?? "Club Operations"}
      workspaceSubtitle={
        data
          ? `${data.club.sport_display} club administration`
          : "Club-scoped access"
      }
      eyebrow="Club administration"
      title={data?.club.name ?? "Club Operations"}
      description="Review your club’s competitions, fixtures, ticketing activity and administrative users using live League OS records."
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      publicPath={
        data ? `/clubs/${data.club.slug}` : "/clubs"
      }
      publicLabel="View club page"
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