import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  RefreshCw,
  ShieldCheck,
  Trophy,
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
import OfficialAppointmentsPanel from "../../components/OfficialAppointmentsPanel/OfficialAppointmentsPanel";
import {
  getApiErrorMessage,
  getLeagueAdminWorkspace,
  type LeagueAdminWorkspaceData,
} from "../../services/adminWorkspaceService";

type TabKey =
  | "overview"
  | "fixtures"
  | "results"
  | "officials";

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
    key: "officials",
    label: "Match Officials",
    icon: ClipboardCheck,
  },
];

export default function LeagueAdminDashboard() {
  const [activeTab, setActiveTab] =
    useState<TabKey>("overview");
  const [data, setData] =
    useState<LeagueAdminWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setData(await getLeagueAdminWorkspace());
    } catch (loadError) {
      setData(null);
      setError(
        getApiErrorMessage(
          loadError,
          "The league workspace could not be loaded.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const firstScope = data?.scopes[0] ?? null;

  const workspaceTitle =
    firstScope?.competition?.name ??
    firstScope?.league.name ??
    "League Operations";

  const workspaceSubtitle = firstScope
    ? `${firstScope.role_display} · ${firstScope.league.union}`
    : "Competition-scoped administration";

  const stats = useMemo(
    () => [
      {
        label: "Leagues",
        value: data?.summary.leagues ?? 0,
        detail: "Authorised league scopes",
        icon: Trophy,
      },
      {
        label: "Competitions",
        value: data?.summary.competitions ?? 0,
        detail: "Available competition records",
        icon: ShieldCheck,
      },
      {
        label: "Upcoming Fixtures",
        value: data?.summary.upcoming_fixtures ?? 0,
        detail: "Scheduled within your scope",
        icon: CalendarDays,
      },
      {
        label: "Official Appointments",
        value:
          data?.summary.official_appointments ?? 0,
        detail: "Matchday official assignments",
        icon: CalendarCheck,
      },
    ],
    [data],
  );

  function renderFixtures() {
    const rows = data?.upcoming_fixtures ?? [];

    return (
      <WorkspacePanel
        eyebrow="Competition delivery"
        title="Upcoming fixtures"
        description="Fixtures shown here are restricted to your assigned league or competition scopes."
      >
        {rows.length === 0 ? (
          <WorkspaceEmpty
            title="No upcoming fixtures"
            description="No scheduled fixture records are currently available in this scope."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Fixture</th>
                  <th>Competition</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Round</th>
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
                      <span
                        className={styles.tableSecondary}
                      >
                        {match.league}
                      </span>
                    </td>
                    <td>{match.competition}</td>
                    <td>
                      {formatWorkspaceDate(
                        match.match_date,
                      )}
                    </td>
                    <td>{match.venue || "TBC"}</td>
                    <td>{match.round || "—"}</td>
                    <td>
                      <WorkspaceStatus
                        value={match.status}
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

  function renderResults() {
    const rows = data?.recent_results ?? [];

    return (
      <WorkspacePanel
        eyebrow="Completed matches"
        title="Recent results"
        description="Results are limited to competitions covered by your active administration scopes."
      >
        {rows.length === 0 ? (
          <WorkspaceEmpty
            title="No completed matches"
            description="Completed results will appear here when match records are finalised."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Match</th>
                  <th>Competition</th>
                  <th>Date</th>
                  <th>Score</th>
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
                      <span
                        className={styles.tableSecondary}
                      >
                        {match.venue || "Venue not set"}
                      </span>
                    </td>
                    <td>{match.competition}</td>
                    <td>
                      {formatWorkspaceDate(
                        match.match_date,
                      )}
                    </td>
                    <td>
                      {match.home_score ?? "—"} –{" "}
                      {match.away_score ?? "—"}
                    </td>
                    <td>
                      <WorkspaceStatus
                        value={match.status}
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

  function renderOverview() {
    return (
      <>
        <WorkspaceStatGrid stats={stats} />

        <WorkspacePanel
          eyebrow="Access control"
          title="Your administration scopes"
          description="League-wide access includes every competition. Competition access is restricted to the named competition."
        >
          {data?.scopes.length ? (
            <div className={styles.scopeGrid}>
              {data.scopes.map((scope) => (
                <article
                  className={styles.scopeCard}
                  key={scope.id}
                >
                  <span>{scope.role_display}</span>
                  <strong>
                    {scope.competition?.name ??
                      scope.league.name}
                  </strong>
                  <small>
                    {scope.competition
                      ? `${scope.league.name} · ${scope.competition.season}`
                      : `${scope.league.union} · All competitions`}
                  </small>
                </article>
              ))}
            </div>
          ) : (
            <WorkspaceEmpty
              title="No active scopes"
              description="A union administrator must grant this account a league or competition scope."
            />
          )}
        </WorkspacePanel>

        {renderFixtures()}
      </>
    );
  }

  let content;

  if (isLoading && !data) {
    content = (
      <WorkspaceLoading label="Loading league operations…" />
    );
  } else if (error && !data) {
    content = (
      <WorkspaceError
        message={error}
        onRetry={loadWorkspace}
      />
    );
  } else if (activeTab === "fixtures") {
    content = renderFixtures();
  } else if (activeTab === "results") {
    content = renderResults();
  } else if (activeTab === "officials") {
    content = (
      <OfficialAppointmentsPanel mode="league" />
    );
  } else {
    content = renderOverview();
  }

  return (
    <AdminWorkspaceLayout<TabKey>
      workspaceTitle={workspaceTitle}
      workspaceSubtitle={workspaceSubtitle}
      eyebrow="League / competition administration"
      title="Competition Operations"
      description="Manage fixtures, results and match-official appointments within the precise scopes granted by the parent union."
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      publicPath="/competitions"
      publicLabel="View competitions"
      headerActions={
        <button
          className={styles.publicLink}
          type="button"
          onClick={() => void loadWorkspace()}
          disabled={isLoading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      }
    >
      {error && data ? (
        <div className={styles.validationCard}>
          <strong>Some information may be stale</strong>
          <span>{error}</span>
        </div>
      ) : null}

      {content}
    </AdminWorkspaceLayout>
  );
}
