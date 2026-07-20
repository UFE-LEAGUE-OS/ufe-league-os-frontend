import {
  BarChart3,
  CalendarDays,
  MessageSquare,
  QrCode,
  RefreshCw,
  Settings as SettingsIcon,
  ShieldCheck,
  Ticket,
  TicketCheck,
  Wallet,
  ChevronDown,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AdminWorkspaceLayout, {
  type AdminWorkspaceNavItem,
  WorkspaceEmpty,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
  WorkspaceStatGrid,
  adminWorkspaceStyles as styles,
  formatWorkspaceDate,
} from "../../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
import {
  getApiErrorMessage,
  getTicketingOfficerWorkspace,
  type TicketingOfficerWorkspaceData,
} from "../../../services/adminWorkspaceService";
import { useAuthStore } from "../../../store/authStore";
import { useClubWorkspaceStore } from "../../../store/clubWorkspaceStore";
import { resolveActiveClubWorkspace } from "../../../utils/clubWorkspace";

// ---------------------------------------------------------------------------
// Nav shape
// ---------------------------------------------------------------------------
// Top-level tabs stay flat (AdminWorkspaceLayout is unchanged). "Tickets" owns
// its own local submenu (Dashboard / Events / Orders / Check-in) rendered
// inside this component, matching the restricted-subflow mockup.

type TabKey =
  | "overview"
  | "events"
  | "tickets"
  | "communications"
  | "settings";

type TicketsSubTabKey = "dashboard" | "events" | "orders" | "checkin";

const navItems: AdminWorkspaceNavItem<TabKey>[] = [
  { key: "overview", label: "Dashboard", icon: BarChart3 },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "tickets", label: "Tickets", icon: TicketCheck },
  { key: "communications", label: "Communications", icon: MessageSquare },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

const ticketsSubNav: Array<{
  key: TicketsSubTabKey;
  label: string;
  icon: AdminWorkspaceNavItem<TabKey>["icon"];
}> = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "orders", label: "Orders", icon: ClipboardList },
  { key: "checkin", label: "Check-in", icon: QrCode },
];

export default function TicketingOfficerDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [ticketsSubTab, setTicketsSubTab] =
    useState<TicketsSubTabKey>("dashboard");
  const [ticketsMenuOpen, setTicketsMenuOpen] = useState(true);
  const user = useAuthStore((state) => state.user);
  const selectedEntitlementId = useClubWorkspaceStore(
    (state) => state.selectedEntitlementId,
  );
  const activeWorkspace = useMemo(
    () =>
      resolveActiveClubWorkspace(
        user?.dashboard_access,
        selectedEntitlementId,
        "TICKETING_OFFICER",
      ),
    [selectedEntitlementId, user?.dashboard_access],
  );

  const [data, setData] =
    useState<TicketingOfficerWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWorkspace = useCallback(async () => {
    if (!activeWorkspace) {
      setData(null);
      setIsLoading(false);
      setError(
        "A valid Club ticketing workspace entitlement is required.",
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setData(
        await getTicketingOfficerWorkspace(
          `club:${activeWorkspace.scope_id}`,
        ),
      );
    } catch (loadError) {
      setData(null);
      setError(
        getApiErrorMessage(
          loadError,
          "The ticketing workspace could not be loaded.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const stats = useMemo(
    () => [
      {
        label: "Active Events",
        value: data?.summary.active_events ?? 0,
        detail: "Ticketed upcoming matches",
        icon: CalendarDays,
      },
      {
        label: "Tickets Sold",
        value: data?.summary.tickets_sold ?? 0,
        detail: "All events",
        icon: Ticket,
      },
      {
        label: "Pending Issues",
        value: data?.summary.pending_issues ?? 0,
        detail: "Rejected or exceptional scans",
        icon: Wallet,
      },
      {
        label: "Checked In",
        value: data?.summary.checked_in ?? 0,
        detail: "Scanned at gate",
        icon: TicketCheck,
      },
    ],
    [data],
  );

  // ---------------------------------------------------------------------
  // Sub-sections
  // ---------------------------------------------------------------------

  function renderUpcomingEvents() {
    if (!data?.events?.length) {
      return (
        <WorkspaceEmpty
          title="No upcoming events"
          description="Scheduled fixtures with ticket sales will appear here."
        />
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.events.map((event) => {
          const sold = event.tickets_sold;
          const checkedIn = event.checked_in;
          const pct = sold > 0 ? Math.min(100, (checkedIn / sold) * 100) : 0;

          return (
            <div
              key={event.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <strong>{event.label}</strong>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  {formatWorkspaceDate(event.match_date)} ·{" "}
                  {event.venue || "TBC"}
                </div>
              </div>

              <div style={{ textAlign: "right", minWidth: 120 }}>
                <div style={{ fontWeight: 600 }}>
                  {sold} sold · {checkedIn} checked in
                </div>
                <div
                  style={{
                    marginTop: 6,
                    height: 6,
                    width: 120,
                    borderRadius: 999,
                    background: "var(--border)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: "var(--purple)",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          className={styles.publicLink}
          onClick={() => setActiveTab("events")}
          style={{ alignSelf: "center", marginTop: 4 }}
        >
          View all events
        </button>
      </div>
    );
  }

  function renderSalesOverview() {
    if (!data?.events?.length) {
      return (
        <WorkspaceEmpty
          title="No sales data yet"
          description="Ticket sales by event will chart here once sales start coming in."
        />
      );
    }

    const chartData = data.events.map((event) => ({
      event: event.label,
      sold: event.tickets_sold,
    }));

    return (
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="event" stroke="var(--muted)" fontSize={12} />
            <YAxis
              stroke="var(--muted)"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
              }}
            />
            <Bar dataKey="sold" fill="var(--green)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  function renderRecentOrders() {
    if (!data?.recent_logs?.length) {
      return (
        <WorkspaceEmpty
          title="No entry logs"
          description="Validation attempts will appear here after the first ticket is scanned."
        />
      );
    }

    return (
      <div className={styles.tableShell}>
        <table>
          <thead>
            <tr>
              <th>Match</th>
              <th>Officer</th>
              <th>Result</th>
              <th>Message</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {data.recent_logs.map((log) => (
              <tr key={log.id}>
                <td>{log.match}</td>
                <td>{log.scanned_by}</td>
                <td>{log.result_display}</td>
                <td>{log.message || "—"}</td>
                <td>{formatWorkspaceDate(log.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          type="button"
          className={styles.publicLink}
          onClick={() => setTicketsSubTabAndOpen("orders")}
          style={{ display: "block", margin: "12px auto 0" }}
        >
          View all logs
        </button>
      </div>
    );
  }

  function setTicketsSubTabAndOpen(sub: TicketsSubTabKey) {
    setActiveTab("tickets");
    setTicketsSubTab(sub);
    setTicketsMenuOpen(true);
  }

  function renderOverview() {
    return (
      <>
        <WorkspaceStatGrid stats={stats} />

        <WorkspacePanel
          eyebrow="Ticketing"
          title="Upcoming events"
          description="Sales progress for the next fixtures."
        >
          {renderUpcomingEvents()}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Ticketing"
          title="Sales overview"
          description="Tickets sold by event."
        >
          {renderSalesOverview()}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Ticketing"
          title="Recent entry logs"
          description="The latest ticket validation activity for this club."
        >
          {renderRecentOrders()}
        </WorkspacePanel>
      </>
    );
  }

  function renderPlaceholder(title: string, description: string) {
    return (
      <WorkspacePanel eyebrow="Ticketing Officer" title={title} description={description}>
        <WorkspaceEmpty
          title={`${title} is not yet built out`}
          description="This section will surface full detail here. For now, use the sidebar to check back once it ships."
        />
      </WorkspacePanel>
    );
  }

  // ---------------------------------------------------------------------
  // Tickets tab (with its own local submenu)
  // ---------------------------------------------------------------------

  function renderTicketsSection() {
    return (
      <>
        <div
          className={styles.tableShell}
          style={{ padding: 0, marginBottom: 16 }}
        >
          <button
            type="button"
            onClick={() => setTicketsMenuOpen((open) => !open)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "none",
              border: "none",
              color: "var(--text)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <TicketCheck size={16} />
              Tickets
            </span>
            {ticketsMenuOpen ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          {ticketsMenuOpen ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                padding: "0 16px 14px",
              }}
            >
              {ticketsSubNav.map((sub) => {
                const Icon = sub.icon;
                const isActive = sub.key === ticketsSubTab;

                return (
                  <button
                    key={sub.key}
                    type="button"
                    onClick={() => setTicketsSubTab(sub.key)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 999,
                      border: "1px solid var(--border)",
                      background: isActive ? "var(--purple)" : "var(--card)",
                      color: isActive ? "#fff" : "var(--text)",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    <Icon size={14} />
                    {sub.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {ticketsSubTab === "dashboard" ? (
          <>
            <WorkspaceStatGrid stats={stats} />
            <WorkspacePanel
              eyebrow="Tickets"
              title="Sales overview"
              description="Tickets sold by event."
            >
              {renderSalesOverview()}
            </WorkspacePanel>
          </>
        ) : null}

        {ticketsSubTab === "events" ? (
          <WorkspacePanel
            eyebrow="Tickets"
            title="Events"
            description="Every event with ticket sales enabled."
          >
            {renderUpcomingEvents()}
          </WorkspacePanel>
        ) : null}

        {ticketsSubTab === "orders" ? (
          <WorkspacePanel
            eyebrow="Tickets"
            title="Entry logs"
            description="Ticket validation activity across every event."
          >
            {renderRecentOrders()}
          </WorkspacePanel>
        ) : null}

        {ticketsSubTab === "checkin" ? (
          <WorkspacePanel
            eyebrow="Tickets"
            title="Check-in"
            description="Scan or search tickets at the gate."
          >
            <WorkspaceEmpty
              title="Check-in scanner not yet wired up"
              description="This will connect to the gate-scanning flow once it's built."
            />
          </WorkspacePanel>
        ) : null}
      </>
    );
  }

  // ---------------------------------------------------------------------
  // Top-level tab routing
  // ---------------------------------------------------------------------

  let content;

  if (isLoading && !data) {
    content = <WorkspaceLoading label="Loading ticketing workspace…" />;
  } else if (error && !data) {
    content = <WorkspaceError message={error} onRetry={loadWorkspace} />;
  } else if (activeTab === "events") {
    content = renderPlaceholder(
      "Events",
      "Browse and manage every club event.",
    );
  } else if (activeTab === "tickets") {
    content = renderTicketsSection();
  } else if (activeTab === "communications") {
    content = renderPlaceholder(
      "Communications",
      "Messages and alerts related to ticketing.",
    );
  } else if (activeTab === "settings") {
    content = renderPlaceholder("Settings", "Ticketing configuration.");
  } else {
    content = renderOverview();
  }

  return (
    <AdminWorkspaceLayout<TabKey>
      workspaceTitle={data?.selected_scope.name ?? "Ticketing Officer"}
      workspaceSubtitle={
        data
          ? `${data.selected_scope.sport} ticketing`
          : "Ticketing & sales access"
      }
      eyebrow="Ticketing Officer"
      title="Ticketing Dashboard"
      description="Manage events, ticket sales, orders, and gate check-in for your club."
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
