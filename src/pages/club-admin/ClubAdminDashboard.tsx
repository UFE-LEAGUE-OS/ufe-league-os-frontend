import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  TicketCheck,
  Trophy,
  Users,
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
  | "fixtures"
  | "results"
  | "ticketing"
  | "staff";

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
  {
    key: "results",
    label: "Results",
    icon: CheckCircle2,
  },
  {
    key: "ticketing",
    label: "Ticketing",
    icon: TicketCheck,
  },
  {
    key: "staff",
    label: "Club Users",
    icon: Users,
  },
];

export default function ClubAdminDashboard() {
  const [activeTab, setActiveTab] =
    useState<TabKey>("overview");
  const [data, setData] =
    useState<ClubAdminWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

        <WorkspacePanel
          eyebrow="Next matches"
          title="Upcoming fixtures"
          description="The next scheduled matches involving your club."
        >
          {renderFixtureTable(
            data?.upcoming_fixtures ?? [],
            "fixture",
          )}
        </WorkspacePanel>
      </>
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
  } else if (activeTab === "fixtures") {
    content = (
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
    );
  } else if (activeTab === "results") {
    content = (
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
    );
  } else if (activeTab === "ticketing") {
    content = renderTicketing();
  } else if (activeTab === "staff") {
    content = renderStaff();
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
      onTabChange={setActiveTab}
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
