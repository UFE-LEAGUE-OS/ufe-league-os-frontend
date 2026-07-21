import {
  Activity,
  CalendarDays,
  Dumbbell,
  MessageSquare,
  RefreshCw,
  Settings as SettingsIcon,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import AdminWorkspaceLayout, {
  type AdminWorkspaceNavItem,
  WorkspaceEmpty,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
  adminWorkspaceStyles as styles,
  formatWorkspaceDate,
} from "../../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
import {
  getApiErrorMessage,
  getTeamManagerWorkspace,
  type TeamManagerWorkspaceData,
} from "../../../services/adminWorkspaceService";

type TabKey =
  | "overview"
  | "players"
  | "training"
  | "fixtures"
  | "performance"
  | "communications"
  | "settings";

const navItems: AdminWorkspaceNavItem<TabKey>[] = [
  { key: "overview", label: "My Team", icon: Users },
  { key: "players", label: "Players", icon: Users },
  {
    key: "training",
    label: "Training",
    icon: Dumbbell,
  },
  {
    key: "fixtures",
    label: "Fixtures",
    icon: CalendarDays,
  },
  {
    key: "performance",
    label: "Performance",
    icon: Activity,
  },
  {
    key: "communications",
    label: "Communications",
    icon: MessageSquare,
  },
  {
    key: "settings",
    label: "Settings",
    icon: SettingsIcon,
  },
];

const AVAILABILITY_COLORS: Record<string, string> = {
  Available: "var(--green)",
  Unavailable: "#3b82f6",
  Injured: "#ef4444",
};

export default function TeamManagerDashboard() {
  const [activeTab, setActiveTab] =
    useState<TabKey>("overview");
  const [data, setData] =
    useState<TeamManagerWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setData(await getTeamManagerWorkspace());
    } catch (loadError) {
      setData(null);
      setError(
        getApiErrorMessage(
          loadError,
          "The team workspace could not be loaded.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const availabilitySlices = useMemo(() => {
    if (!data?.player_availability) {
      return [];
    }

    const { available, unavailable, injured } =
      data.player_availability;

    return [
      { name: "Available", value: available },
      { name: "Unavailable", value: unavailable },
      { name: "Injured", value: injured },
    ];
  }, [data]);

  function renderOverview() {
    return (
      <>
        <div className={styles.gridTwo}>
          <WorkspacePanel
            eyebrow="Squad"
            title="My team"
            description="The senior squad you currently manage."
          >
            {data?.team ? (
              <div
                className={styles.scopeCard}
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                {data.team.logo_url ? (
                  <img
                    src={data.team.logo_url}
                    alt=""
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 8,
                      objectFit: "cover",
                    }}
                  />
                ) : null}

                <div>
                  <strong>{data.team.name}</strong>
                  <div>
                    <small>
                      {data.team.player_count} Players
                    </small>
                  </div>
                  <small>{data.club.name}</small>
                </div>
              </div>
            ) : (
              <WorkspaceEmpty
                title="No team assigned"
                description="You are not currently assigned to manage a team."
              />
            )}
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Upcoming"
            title="Next fixture"
            description="The next scheduled match for your team."
          >
            {data?.next_fixture ? (
              <div className={styles.scopeGrid}>
                <article className={styles.scopeCard}>
                  <span>{data.next_fixture.competition}</span>
                  <strong>
                    {data.next_fixture.home_club} vs{" "}
                    {data.next_fixture.away_club}
                  </strong>
                  <small>
                    {formatWorkspaceDate(
                      data.next_fixture.match_date,
                    )}{" "}
                    · {data.next_fixture.venue || "TBC"}
                  </small>
                </article>
              </div>
            ) : (
              <WorkspaceEmpty
                title="No upcoming fixture"
                description="Your team's next match will appear here."
              />
            )}
          </WorkspacePanel>
        </div>

        <div className={styles.gridTwo}>
          <WorkspacePanel
            eyebrow="This week"
            title="Training schedule"
            description="Upcoming training sessions for your team."
            actions={
              <button
                type="button"
                className={styles.publicLink}
                onClick={() => setActiveTab("training")}
              >
                View full schedule
              </button>
            }
          >
            {data?.training_schedule?.length ? (
              <div className={styles.scopeGrid}>
                {data.training_schedule.map((session) => (
                  <article
                    className={styles.scopeCard}
                    key={session.id}
                  >
                    <span>
                      {formatWorkspaceDate(
                        session.scheduled_at,
                      )}
                    </span>
                    <strong>{session.label}</strong>
                    <small>{session.type}</small>
                  </article>
                ))}
              </div>
            ) : (
              <WorkspaceEmpty
                title="No sessions scheduled"
                description="Training sessions you plan will appear here."
              />
            )}
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Squad fitness"
            title="Player availability"
            description="Current availability across your squad."
          >
            {data?.player_availability &&
            data.player_availability.total > 0 ? (
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={availabilitySlices}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {availabilitySlices.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={
                            AVAILABILITY_COLORS[
                              entry.name
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border:
                          "1px solid var(--border)",
                        color: "var(--text)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <WorkspaceEmpty
                title="No availability data"
                description="Player availability will appear here once recorded."
              />
            )}
          </WorkspacePanel>
        </div>

        <WorkspacePanel
          eyebrow="Latest"
          title="Recent team updates"
          description="The latest changes affecting your team."
          actions={
            <button
              type="button"
              className={styles.publicLink}
              onClick={() =>
                setActiveTab("communications")
              }
            >
              View all updates
            </button>
          }
        >
          {data?.recent_updates?.length ? (
            <div className={styles.scopeGrid}>
              {data.recent_updates.map((update) => (
                <article
                  className={styles.scopeCard}
                  key={update.id}
                >
                  <span>
                    {formatWorkspaceDate(
                      update.timestamp,
                    )}
                  </span>
                  <strong>{update.title}</strong>
                  <small>{update.description}</small>
                </article>
              ))}
            </div>
          ) : (
            <WorkspaceEmpty
              title="No recent updates"
              description="Changes to your team will appear here."
            />
          )}
        </WorkspacePanel>
      </>
    );
  }

  function renderPlaceholder(
    title: string,
    description: string,
  ) {
    return (
      <WorkspacePanel
        eyebrow="Team operations"
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
      <WorkspaceLoading label="Loading team workspace…" />
    );
  } else if (error && !data) {
    content = (
      <WorkspaceError
        message={error}
        onRetry={loadWorkspace}
      />
    );
  } else if (activeTab === "players") {
    content = renderPlaceholder(
      "Players",
      "Full squad list and player profiles.",
    );
  } else if (activeTab === "training") {
    content = renderPlaceholder(
      "Training",
      "Full training schedule and session plans.",
    );
  } else if (activeTab === "fixtures") {
    content = renderPlaceholder(
      "Fixtures",
      "Every scheduled fixture for your team.",
    );
  } else if (activeTab === "performance") {
    content = renderPlaceholder(
      "Performance",
      "Player and team performance analytics.",
    );
  } else if (activeTab === "communications") {
    content = renderPlaceholder(
      "Communications",
      "Messages and updates for your team.",
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
      workspaceTitle={data?.club.name ?? "Team Manager"}
      workspaceSubtitle={
        data
          ? `${data.club.sport_display} team operations`
          : "Team management access"
      }
      eyebrow="Team Manager"
      title="Team Manager Dashboard"
      description="Manage your squad, training, and fixtures using live League OS records."
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