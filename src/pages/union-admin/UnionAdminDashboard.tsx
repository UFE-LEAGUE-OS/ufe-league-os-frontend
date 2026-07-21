import {
  BadgeCheck,
  BarChart3,
  LayoutDashboard,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  FileText,
  Layers3,
  LogOut,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  TicketCheck,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  getMyUnionWorkspaces,
  createUnionWorkspaceUser,
  getUnionDashboardOverview,
  getUnionFinanceDashboard,
  getUnionOperationsDashboard,
  getUnionWorkspaceUsers,
  intersectUnionWorkspaceOptions,
  switchUnionWorkspace,
  type AuthorizedUnionWorkspaceOption,
  type UnionDashboardOverview,
  type UnionFinanceDashboard,
  type UnionOperationsDashboard,
  type UnionOperationsPlayerPosition,
  type UnionWorkspaceOption,
  type UnionWorkspacePermission,
  type UnionWorkspaceRole,
  type UnionWorkspaceUser,
  type UnionWorkspaceUsersResult,
} from "../../services/unionAdminService";
import AuthenticatedFooter from "../../components/AuthenticatedFooter/AuthenticatedFooter";
import MobileUnionNavigation from "../../components/MobileUnionNavigation/MobileUnionNavigation";
import UnionAdminClubsPanel from "../../components/UnionAdminClubsPanel/UnionAdminClubsPanel";
import UnionAdminRefereesPanel from "../../components/UnionAdminRefereesPanel/UnionAdminRefereesPanel";
import OfficialAppointmentsPanel from "../../components/OfficialAppointmentsPanel/OfficialAppointmentsPanel";
import UnionMatchOfficialsPanel from "../../components/union-admin/UnionMatchOfficialsPanel";
import {
  UnionNationalTeamsPanel,
  UnionOfficialReadinessPanel,
} from "../../components/UnionOperationalPanels/UnionOperationalPanels";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getEntitlementsForDashboard } from "../../utils/dashboardAccess.js";
import logoHorizontal from "../../assets/logos/league-os-horizontal.png";
import logoMark from "../../assets/league-os-mark.svg";
import styles from "./UnionAdminDashboard.module.css";
import UnionAuditApprovalsScreen from "./UnionAuditApprovalsScreen";
import UnionCommunicationsScreen from "./UnionCommunicationsScreen";
import UnionOverviewScreen from "./UnionOverviewScreen";
import UnionCompetitionsScreen from "./UnionCompetitionsScreen";
import UnionPlayersTransfersScreen from "./UnionPlayersTransfersScreen";
import UnionProfileBrandingScreen from "./UnionProfileBrandingScreen";
import UnionRegistrationsScreen from "./UnionRegistrationsScreen";
import UnionSettingsScreen from "./UnionSettingsScreen";
import UnionSponsorsScreen from "./UnionSponsorsScreen";
import UnionStatisticsRecordsScreen from "./UnionStatisticsRecordsScreen";

type TabKey =
  | "overview"
  | "competitions"
  | "clubs"
  | "nationalTeams"
  | "registrations"
  | "playersTransfers"
  | "matchOfficials"
  | "statistics"
  | "profileBranding"
  | "referees"
  | "appointments"
  | "availability"
  | "matchReports"
  | "documents"
  | "allowances"
  | "profile"
  | "ticketing"
  | "scanner"
  | "entryLogs"
  | "finance"
  | "sponsors"
  | "comms"
  | "users"
  | "audit"
  | "settings";

type ClubView = "directory" | "detail";

type TabDefinition = {
  key: TabKey;
  label: string;
  icon: typeof BarChart3;
  permission?: UnionWorkspacePermission;
  anyPermissions?: UnionWorkspacePermission[];
  matchOfficialOnly?: boolean;
};

type StatCard = {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof BarChart3;
};


type TableColumn<T> = {
  key: string;
  label: string;
  render: (item: T) => string | number | JSX.Element;
};

function assertWorkspaceUsersResult(
  result: UnionWorkspaceUsersResult,
  workspaceSlug: string,
) {
  if (
    !result ||
    typeof result !== "object" ||
    typeof result.workspace !== "string" ||
    result.workspace !== workspaceSlug ||
    !Array.isArray(result.results) ||
    !Number.isInteger(result.count) ||
    result.count < 0 ||
    result.results.some(
      (user) =>
        !user ||
        typeof user.workspace_slug !== "string" ||
        user.workspace_slug !== workspaceSlug,
    )
  ) {
    throw new Error(
      "Workspace users response belongs to a different workspace.",
    );
  }

  return result.results;
}

function assertCreatedWorkspaceUser(
  result: {
    workspace: string;
    membership: UnionWorkspaceUser;
  },
  workspaceSlug: string,
) {
  if (
    !result ||
    result.workspace !== workspaceSlug ||
    !result.membership ||
    result.membership.workspace_slug !== workspaceSlug
  ) {
    throw new Error(
      "Workspace user creation response belongs to a different workspace.",
    );
  }
}

const tabs: TabDefinition[] = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    permission: "union.dashboard.view",
  },
  {
    key: "competitions",
    label: "Competitions",
    icon: Trophy,
    permission: "union.competitions.manage",
  },
  {
    key: "clubs",
    label: "Clubs",
    icon: Building2,
    permission: "union.clubs.manage",
  },
  {
    key: "registrations",
    label: "Registrations",
    icon: ClipboardCheck,
    anyPermissions: [
      "union.registrations.view",
      "union.registrations.manage",
      "union.players.approve",
    ],
  },
  {
    key: "playersTransfers",
    label: "Players & Transfers",
    icon: UserCheck,
    anyPermissions: [
      "union.players.view",
      "union.players.approve",
      "union.transfers.view",
      "union.transfers.approve",
    ],
  },
  {
    key: "nationalTeams",
    label: "National Teams",
    icon: Users,
    permission: "union.teams.manage",
  },
  {
    key: "matchOfficials",
    label: "Match Officials",
    icon: BadgeCheck,
    anyPermissions: [
      "union.referees.manage",
      "union.official.appointments.view",
      "union.official.availability.manage",
      "union.official.reports.manage",
      "union.official.documents.view",
      "union.official.payments.view",
    ],
  },
  {
    key: "statistics",
    label: "Statistics & Records",
    icon: BarChart3,
    permission: "union.reports.view",
  },
  {
    key: "profile",
    label: "My Official Profile",
    icon: UserCheck,
    permission: "union.dashboard.view",
    matchOfficialOnly: true,
  },
  {
    key: "ticketing",
    label: "Ticketing",
    icon: TicketCheck,
    permission: "union.ticketing.manage",
  },
  {
    key: "scanner",
    label: "Scanner",
    icon: TicketCheck,
    permission: "union.ticketing.scan",
  },
  {
    key: "entryLogs",
    label: "Entry Logs",
    icon: FileText,
    permission: "union.ticketing.manage",
  },
  {
    key: "finance",
    label: "Finance",
    icon: DollarSign,
    permission: "union.finance.view",
  },
  {
    key: "sponsors",
    label: "Sponsors",
    icon: Layers3,
    permission: "union.reports.view",
  },
  {
    key: "comms",
    label: "Communications",
    icon: Megaphone,
    permission: "union.communications.manage",
  },
  {
    key: "users",
    label: "Users & Access",
    icon: Users,
    permission: "union.users.manage",
  },
  {
    key: "audit",
    label: "Audit & Approvals",
    icon: FileText,
    permission: "union.reports.view",
  },
  {
    key: "profileBranding",
    label: "Profile & Branding",
    icon: Building2,
    permission: "union.dashboard.view",
  },
  {
    key: "settings",
    label: "Settings",
    icon: ShieldCheck,
    permission: "union.users.manage",
  },
];

const sidebarSections: Array<{ label: string; keys: TabKey[] }> = [
  {
    label: "Operations",
    keys: [
      "overview",
      "competitions",
      "clubs",
      "registrations",
      "playersTransfers",
      "nationalTeams",
      "matchOfficials",
      "statistics",
      "profile",
      "ticketing",
      "scanner",
      "entryLogs",
    ],
  },
  {
    label: "Business",
    keys: ["finance", "comms", "sponsors"],
  },
  {
    label: "Administration",
    keys: ["users", "audit", "profileBranding", "settings"],
  },
];

function canAccessTab(workspace: UnionWorkspaceOption, tab: TabDefinition) {
  return (
    (!tab.permission || workspace.permissions.includes(tab.permission)) &&
    (!tab.anyPermissions ||
      tab.anyPermissions.some((permission) =>
        workspace.permissions.includes(permission),
      )) &&
    (!tab.matchOfficialOnly || isMatchOfficialWorkspace(workspace))
  );
}

function isMatchOfficialWorkspace(workspace: UnionWorkspaceOption) {
  return workspace.role === "MATCH_OFFICIAL";
}

function getWorkspaceInitials(workspace: UnionWorkspaceOption) {
  return workspace.acronym || workspace.name.slice(0, 4).toUpperCase();
}

function getSportPositionGroups(
  sport?: string,
): UnionOperationsPlayerPosition[] {
  const key = (sport || "").trim().toUpperCase().replace(/\s+/g, "_");

  if (key.includes("RUGBY")) {
    return [
      {
        group: "Forwards",
        positions: [
          "Loosehead Prop",
          "Hooker",
          "Tighthead Prop",
          "Lock",
          "Flanker",
          "Number Eight",
        ],
      },
      {
        group: "Backs",
        positions: ["Scrum-half", "Fly-half", "Centre", "Wing", "Fullback"],
      },
    ];
  }

  if (key.includes("FOOTBALL")) {
    return [
      { group: "Goalkeeping", positions: ["Goalkeeper"] },
      {
        group: "Defence",
        positions: ["Right Back", "Centre Back", "Left Back"],
      },
      {
        group: "Midfield",
        positions: [
          "Defensive Midfielder",
          "Central Midfielder",
          "Attacking Midfielder",
        ],
      },
      { group: "Attack", positions: ["Winger", "Striker"] },
    ];
  }

  if (key.includes("BASKETBALL")) {
    return [
      { group: "Backcourt", positions: ["Point Guard", "Shooting Guard"] },
      {
        group: "Frontcourt",
        positions: ["Small Forward", "Power Forward", "Center"],
      },
    ];
  }

  return [
    { group: "General", positions: ["Player", "Official", "Technical Staff"] },
  ];
}

function statusClass(status: string) {
  const lowered = status.toLowerCase();

  if (
    lowered.includes("ready") ||
    lowered.includes("available") ||
    lowered.includes("active")
  ) {
    return styles.success;
  }

  if (lowered.includes("missing") || lowered.includes("restricted")) {
    return styles.warning;
  }

  if (
    lowered.includes("draft") ||
    lowered.includes("planning") ||
    lowered.includes("review")
  ) {
    return styles.info;
  }

  return "";
}

function formatRole(role: UnionWorkspaceRole) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function DataTable<T>({
  columns,
  data,
  emptyLabel = "No records available",
}: {
  columns: TableColumn<T>[];
  data: T[];
  emptyLabel?: string;
}) {
  return (
    <div className={styles.tableShell}>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(item)}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>{emptyLabel}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className={`${styles.statusPill} ${statusClass(label)}`}>
      {label}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: JSX.Element;
}) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actions ? <div className={styles.sectionActions}>{actions}</div> : null}
    </div>
  );
}

function StatGrid({ stats, loading }: { stats: StatCard[]; loading: boolean }) {
  return (
    <div className={styles.statsGrid}>
      {stats.map((card) => {
        const Icon = card.icon;

        return (
          <article className={styles.statCard} key={card.label}>
            <div>
              <span>{card.label}</span>
              <strong>{loading ? "…" : card.value}</strong>
              <small>{card.detail}</small>
            </div>
            <Icon size={30} strokeWidth={2.2} aria-hidden="true" />
          </article>
        );
      })}
    </div>
  );
}

function ModuleButton({
  label,
  detail,
  icon: Icon,
  onClick,
  variant = "ghost",
}: {
  label: string;
  detail?: string;
  icon: typeof BarChart3;
  onClick?: () => void;
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      className={
        variant === "primary" ? styles.primaryAction : styles.secondaryAction
      }
      type="button"
      onClick={onClick}
    >
      <Icon size={18} strokeWidth={2.3} aria-hidden="true" />
      <span>
        <strong>{label}</strong>
        {detail ? <small>{detail}</small> : null}
      </span>
    </button>
  );
}

export default function UnionAdminDashboard() {
  const { isLoading: isLoadingProfile } = useCurrentUser();
  const authenticatedUser = useAuthStore((state) => state.user);
  const dashboardAccess = authenticatedUser?.dashboard_access;
  const unionEntitlements = useMemo(
    () => getEntitlementsForDashboard(dashboardAccess, "UNION_WORKSPACE"),
    [dashboardAccess],
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [workspaces, setWorkspaces] = useState<
    AuthorizedUnionWorkspaceOption[]
  >([]);
  const [activeWorkspaceSlug, setActiveWorkspaceSlug] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [isSwitchingWorkspace, setIsSwitchingWorkspace] = useState(false);
  const [workspaceError, setWorkspaceError] = useState("");
  const [overview, setOverview] = useState<UnionDashboardOverview | null>(null);
  const [workspaceUsers, setWorkspaceUsers] = useState<UnionWorkspaceUser[]>(
    [],
  );
  const [overviewError, setOverviewError] = useState("");
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);
  const [workspaceUsersError, setWorkspaceUsersError] = useState("");
  const [isLoadingWorkspaceUsers, setIsLoadingWorkspaceUsers] = useState(false);
  const [clubView, setClubView] = useState<ClubView>("directory");
  const selectedClubId = "";
  const [financeData, setFinanceData] = useState<UnionFinanceDashboard | null>(
    null,
  );
  const [isLoadingFinance, setIsLoadingFinance] = useState(false);
  const [financeError, setFinanceError] = useState("");
  const [operationsData, setOperationsData] =
    useState<UnionOperationsDashboard | null>(null);
  const [workspaceUserEmail, setWorkspaceUserEmail] = useState("");
  const [workspaceUserRole, setWorkspaceUserRole] =
    useState<UnionWorkspaceRole>("VIEWER");
  const [isCreatingWorkspaceUser, setIsCreatingWorkspaceUser] = useState(false);
  const [workspaceUserNotice, setWorkspaceUserNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadWorkspaces() {
      if (isLoadingProfile && unionEntitlements.length === 0) {
        return;
      }

      setIsLoadingWorkspaces(true);
      setWorkspaceError("");

      if (unionEntitlements.length === 0) {
        setWorkspaces([]);
        setActiveWorkspaceSlug("");
        setWorkspaceError(
          "This account does not have an active Union workspace entitlement.",
        );
        setIsLoadingWorkspaces(false);
        return;
      }

      try {
        const apiWorkspaces = await getMyUnionWorkspaces();

        if (!isMounted) return;

        const authorizedWorkspaces = intersectUnionWorkspaceOptions(
          apiWorkspaces,
          dashboardAccess,
        );

        setWorkspaces(authorizedWorkspaces);

        if (authorizedWorkspaces.length > 0) {
          setActiveWorkspaceSlug((currentSlug) => {
            if (
              currentSlug &&
              authorizedWorkspaces.some(
                (workspace) => workspace.slug === currentSlug,
              )
            ) {
              return currentSlug;
            }

            return authorizedWorkspaces.length === 1
              ? authorizedWorkspaces[0].slug
              : "";
          });
          setWorkspaceError("");
        } else {
          setActiveWorkspaceSlug("");
          setWorkspaceError(
            "No active Union membership matches this account's dashboard entitlements.",
          );
        }
      } catch {
        if (!isMounted) return;

        setWorkspaces([]);
        setActiveWorkspaceSlug("");
        setWorkspaceError(
          "Union workspace access could not be verified. Try again when the service is available.",
        );
      } finally {
        if (isMounted) setIsLoadingWorkspaces(false);
      }
    }

    void loadWorkspaces();

    return () => {
      isMounted = false;
    };
  }, [dashboardAccess, isLoadingProfile, unionEntitlements]);

  const activeWorkspace = workspaces.find(
    (workspace) => workspace.slug === activeWorkspaceSlug,
  );
  const activeWorkspaceRef = useRef<AuthorizedUnionWorkspaceOption | undefined>(
    activeWorkspace,
  );
  const workspaceGenerationRef = useRef(0);
  const workspaceUserSubmissionRef = useRef<number | null>(null);
  const latestSwitchRequestRef = useRef(0);
  activeWorkspaceRef.current = activeWorkspace;

  useEffect(() => {
    workspaceGenerationRef.current += 1;
    workspaceUserSubmissionRef.current = null;

    return () => {
      workspaceGenerationRef.current += 1;
    };
  }, [activeWorkspace?.slug, activeWorkspace?.entitlementId]);

  const availableTabs = useMemo(() => {
    if (!activeWorkspace) return [];

    return tabs.filter((tab) => canAccessTab(activeWorkspace, tab));
  }, [activeWorkspace]);

  useEffect(() => {
    if (!availableTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab("overview");
    }
  }, [activeTab, availableTabs]);

  useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      if (isLoadingWorkspaces || !activeWorkspace?.slug) return;

      setIsLoadingOverview(true);
      setOverviewError("");

      try {
        const nextOverview = await getUnionDashboardOverview(
          activeWorkspace.slug,
        );

        if (!isMounted) return;

        if (nextOverview.workspace.slug !== activeWorkspace.slug) {
          throw new Error(
            "Overview response belongs to a different workspace.",
          );
        }

        setOverview(nextOverview);
      } catch {
        if (!isMounted) return;

        setOverview(null);
        setOverviewError("Workspace overview could not be loaded.");
      } finally {
        if (isMounted) setIsLoadingOverview(false);
      }
    }

    void loadOverview();

    return () => {
      isMounted = false;
    };
  }, [
    activeWorkspace?.slug,
    activeWorkspace?.permissions,
    isLoadingWorkspaces,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function loadWorkspaceUsers() {
      if (isLoadingWorkspaces || !activeWorkspace?.slug) return;

      if (!activeWorkspace.permissions.includes("union.users.manage")) {
        setWorkspaceUsers([]);
        setWorkspaceUsersError("");
        setIsLoadingWorkspaceUsers(false);
        return;
      }

      setIsLoadingWorkspaceUsers(true);
      setWorkspaceUsersError("");

      try {
        const result = await getUnionWorkspaceUsers(activeWorkspace.slug);

        if (!isMounted) return;

        const users = assertWorkspaceUsersResult(result, activeWorkspace.slug);

        setWorkspaceUsers(users);
      } catch (error) {
        if (!isMounted) return;

        setWorkspaceUsers([]);
        const detail =
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as { response?: { data?: { detail?: unknown } } })
            .response?.data?.detail === "string"
            ? (error as { response: { data: { detail: string } } }).response
                .data.detail
            : "Workspace users could not be loaded.";
        setWorkspaceUsersError(detail);
      } finally {
        if (isMounted) setIsLoadingWorkspaceUsers(false);
      }
    }

    void loadWorkspaceUsers();

    return () => {
      isMounted = false;
    };
  }, [
    activeWorkspace?.slug,
    activeWorkspace?.permissions,
    isLoadingWorkspaces,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function loadOperationsData() {
      if (
        isLoadingWorkspaces ||
        !activeWorkspace?.slug ||
        !isMatchOfficialWorkspace(activeWorkspace)
      ) {
        setOperationsData(null);
        return;
      }

      try {
        const data = await getUnionOperationsDashboard(activeWorkspace.slug);

        if (!isMounted) return;

        if (data.workspace.slug !== activeWorkspace.slug) {
          throw new Error(
            "Operations response belongs to a different workspace.",
          );
        }

        setOperationsData(data);
      } catch {
        if (!isMounted) return;

        setOperationsData(null);
      }
    }

    void loadOperationsData();

    return () => {
      isMounted = false;
    };
  }, [activeWorkspace, isLoadingWorkspaces]);

  useEffect(() => {
    let isMounted = true;

    async function loadFinanceData() {
      if (activeTab !== "finance") return;
      if (isLoadingWorkspaces || !activeWorkspace?.slug) return;

      if (!activeWorkspace.permissions.includes("union.finance.view")) {
        setFinanceData(null);
        setFinanceError(
          "You do not have permission to view finance for this workspace.",
        );
        return;
      }

      setIsLoadingFinance(true);

      try {
        const data = await getUnionFinanceDashboard(activeWorkspace.slug);

        if (!isMounted) return;

        if (data.workspace.slug !== activeWorkspace.slug) {
          throw new Error("Finance response belongs to a different workspace.");
        }

        setFinanceData(data);
        setFinanceError("");
      } catch {
        if (!isMounted) return;

        setFinanceData(null);
        setFinanceError(
          "Finance data could not be loaded. Confirm the backend finance endpoint is deployed and the workspace has seeded finance records.",
        );
      } finally {
        if (isMounted) setIsLoadingFinance(false);
      }
    }

    void loadFinanceData();

    return () => {
      isMounted = false;
    };
  }, [
    activeTab,
    activeWorkspace?.slug,
    activeWorkspace?.permissions,
    isLoadingWorkspaces,
  ]);

  async function handleWorkspaceChange(nextSlug: string) {
    const requestedWorkspace = workspaces.find(
      (workspace) => workspace.slug === nextSlug,
    );

    if (!requestedWorkspace) return;

    workspaceGenerationRef.current += 1;
    const switchRequest = ++latestSwitchRequestRef.current;
    workspaceUserSubmissionRef.current = null;
    setIsCreatingWorkspaceUser(false);
    setIsSwitchingWorkspace(true);
    setWorkspaceError("");

    try {
      const result = await switchUnionWorkspace(nextSlug);

      if (latestSwitchRequestRef.current !== switchRequest) return;

      if (
        result.selectedEntitlementId !== requestedWorkspace.entitlementId ||
        String(result.workspace.scopeId) !==
          String(requestedWorkspace.scopeId) ||
        result.workspace.role !== requestedWorkspace.role ||
        result.workspace.slug !== requestedWorkspace.slug
      ) {
        throw new Error("The selected workspace access changed.");
      }

      setOverview(null);
      setWorkspaceUsers([]);
      setOverviewError("");
      setWorkspaceUsersError("");
      setIsLoadingWorkspaceUsers(false);
      setWorkspaceUserEmail("");
      setWorkspaceUserRole("VIEWER");
      setWorkspaceUserNotice("");
      setIsCreatingWorkspaceUser(false);
      setOperationsData(null);
      setFinanceData(null);
      setFinanceError("");
      setWorkspaces((currentWorkspaces) =>
        currentWorkspaces.map((workspace) =>
          workspace.entitlementId === result.selectedEntitlementId
            ? result.workspace
            : workspace,
        ),
      );
      setActiveWorkspaceSlug(result.workspace.slug);
      setActiveTab("overview");
      setClubView("directory");
    } catch {
      if (latestSwitchRequestRef.current !== switchRequest) return;
      setWorkspaceError(
        "That Union workspace could not be verified. Your current workspace has not changed.",
      );
    } finally {
      if (latestSwitchRequestRef.current === switchRequest)
        setIsSwitchingWorkspace(false);
    }
  }

  async function handleCreateWorkspaceUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !activeWorkspace ||
      !workspaceUserEmail.trim() ||
      isSwitchingWorkspace ||
      workspaceUserSubmissionRef.current !== null
    ) {
      return;
    }

    const submittedWorkspaceSlug = activeWorkspace.slug;
    const submittedEntitlementId = activeWorkspace.entitlementId;
    const submittedGeneration = workspaceGenerationRef.current;
    workspaceUserSubmissionRef.current = submittedGeneration;
    const remainsActive = () => {
      const current = activeWorkspaceRef.current;
      return (
        current?.slug === submittedWorkspaceSlug &&
        current.entitlementId === submittedEntitlementId &&
        workspaceGenerationRef.current === submittedGeneration
      );
    };

    setIsCreatingWorkspaceUser(true);
    setWorkspaceUserNotice("");

    try {
      const created = await createUnionWorkspaceUser({
        workspace: submittedWorkspaceSlug,
        email: workspaceUserEmail.trim(),
        role: workspaceUserRole,
      });

      if (!remainsActive()) return;

      assertCreatedWorkspaceUser(created, submittedWorkspaceSlug);

      const usersResult = await getUnionWorkspaceUsers(submittedWorkspaceSlug);

      if (!remainsActive()) return;

      const users = assertWorkspaceUsersResult(
        usersResult,
        submittedWorkspaceSlug,
      );

      setWorkspaceUsers(users);
      setWorkspaceUserEmail("");
      setWorkspaceUserRole("VIEWER");
      setWorkspaceUserNotice("Workspace user access was added.");
    } catch (error) {
      if (!remainsActive()) return;

      const detail =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { detail?: unknown } } })
          .response?.data?.detail === "string"
          ? (error as { response: { data: { detail: string } } }).response.data
              .detail
          : "The workspace user could not be added.";
      setWorkspaceUserNotice(detail);
    } finally {
      if (remainsActive()) setIsCreatingWorkspaceUser(false);
      if (workspaceUserSubmissionRef.current === submittedGeneration) {
        workspaceUserSubmissionRef.current = null;
      }
    }
  }

  function handleLogout() {
    [
      "league_os_access_token",
      "league_os_refresh_token",
      "league_os_user",
      "accessToken",
      "refreshToken",
    ].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    window.location.assign("/login");
  }

  if (!activeWorkspace) {
    const isWaitingForAccess = isLoadingProfile || isLoadingWorkspaces;
    const requiresWorkspaceSelection =
      !isWaitingForAccess && workspaces.length > 1;

    return (
      <>
        <main className={styles.pageShell}>
          <section className={styles.contentArea}>
            <header className={styles.heroHeader}>
              <div className={styles.heroIdentity}>
                <div className={styles.heroMetaRow}>
                  <span className={styles.liveBadge}>
                    <Building2 size={14} strokeWidth={2.4} aria-hidden="true" />
                    Union Workspace
                  </span>
                </div>
                <h1>
                  {isWaitingForAccess
                    ? "Verifying workspace access"
                    : requiresWorkspaceSelection
                      ? "Select a Union workspace"
                      : "Union workspace unavailable"}
                </h1>
                <p>
                  {requiresWorkspaceSelection
                    ? "Choose one of your entitled workspaces to continue."
                    : "League OS only opens workspaces confirmed by your dashboard access contract and active membership."}
                </p>
              </div>
              <div className={styles.headerActions}>
                <Link className={styles.headerActionPrimary} to="/unions">
                  View Unions
                </Link>
              </div>
            </header>

            {workspaceError ? (
              <div className={styles.alertBanner}>{workspaceError}</div>
            ) : null}

            {requiresWorkspaceSelection ? (
              <label
                className={styles.workspaceSelectLabel}
                htmlFor="workspace-access-select"
              >
                Union workspace
                <select
                  id="workspace-access-select"
                  className={styles.workspaceSelect}
                  value=""
                  disabled={isSwitchingWorkspace}
                  onChange={(event) =>
                    void handleWorkspaceChange(event.target.value)
                  }
                >
                  <option value="" disabled>
                    Select a workspace
                  </option>
                  {workspaces.map((workspace) => (
                    <option
                      key={workspace.entitlementId}
                      value={workspace.slug}
                    >
                      {workspace.acronym} - {workspace.roleDisplay}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </section>
        </main>
        <div className={styles.dashboardFooterWrap}>
          <AuthenticatedFooter />
        </div>
      </>
    );
  }

  // The operations endpoint currently contains generated operational rows. Do
  // not present those rows, counts, or labels as workspace data.
  const workspaceClubs: UnionOperationsDashboard["clubs"] = [];
  const workspaceAppointments: UnionOperationsDashboard["appointments"] = [];
  const workspacePlayerPositions = getSportPositionGroups(
    activeWorkspace.sport,
  );
  const currentOfficial = operationsData?.current_official ?? null;

  const selectedClub =
    workspaceClubs.find((club) => club.id === selectedClubId) ??
    workspaceClubs[0];

  const statsByTab: Record<TabKey, StatCard[] | null> = {
    overview: null,
    competitions: null,
    clubs: null,
    nationalTeams: null,
    registrations: null,
    playersTransfers: null,
    matchOfficials: null,
    statistics: null,
    profileBranding: null,
    referees: null,
    appointments: null,
    profile: currentOfficial
      ? [
          {
            label: "Role",
            value: currentOfficial.role,
            detail: "Current official profile",
            icon: BadgeCheck,
          },
          {
            label: "Grade",
            value: currentOfficial.grade,
            detail: "Current official profile",
            icon: ShieldCheck,
          },
          {
            label: "Status",
            value: currentOfficial.status,
            detail: "Current official profile",
            icon: UserCheck,
          },
        ]
      : null,
    finance: financeData
      ? [
          {
            label: "Transactions",
            value: financeData.kpis.transaction_count,
            detail: "Returned by finance",
            icon: DollarSign,
          },
          {
            label: "Payouts",
            value: financeData.kpis.payout_count,
            detail: "Returned by finance",
            icon: ClipboardCheck,
          },
        ]
      : null,
    users:
      !isLoadingWorkspaceUsers && !workspaceUsersError
        ? [
            {
              label: "Workspace Users",
              value: workspaceUsers.length,
              detail: "Returned by backend",
              icon: Users,
            },
            {
              label: "Permissions",
              value: activeWorkspace.permissions.length,
              detail: "Current entitlement",
              icon: CheckCircle2,
            },
          ]
        : null,
    availability: null,
    matchReports: null,
    documents: null,
    allowances: null,
    ticketing: null,
    scanner: null,
    entryLogs: null,
    sponsors: null,
    comms: null,
    audit: null,
    settings: null,
  };

  const activeStats = statsByTab[activeTab];

  function resetSearch(nextTab: TabKey) {
    setActiveTab(nextTab);
  }

  function renderOverview() {
    if (isLoadingOverview) {
      return (
        <div className={styles.emptyState}>Loading workspace overview…</div>
      );
    }

    if (overviewError) {
      return <div className={styles.emptyState}>{overviewError}</div>;
    }

    if (!overview) {
      return (
        <div className={styles.emptyState}>
          Workspace overview is unavailable.
        </div>
      );
    }

    return (
      <UnionOverviewScreen
        workspaceName={activeWorkspace.name}
        workspaceAcronym={activeWorkspace.acronym}
        workspaceSport={activeWorkspace.sport}
        workspaceRoleLabel={
          activeWorkspace.roleDisplay || formatRole(activeWorkspace.role)
        }
        permissions={activeWorkspace.permissions}
        summary={overview.summary}
        workspaceUserCount={workspaceUsers.length}
        grossReceipts={financeData?.kpis.gross_receipts.display}
        pendingPayouts={financeData?.kpis.pending_payouts.display}
        onNavigate={resetSearch}
      />
    );
  }

  function renderClubs() {
    if (clubView === "detail") return renderClubDetail();

    return (
      <div className={styles.contentStack}>
        <UnionAdminClubsPanel
          workspaceSlug={activeWorkspace.slug}
          workspaceLabel={activeWorkspace.name}
          sport={activeWorkspace.sport}
          canManageClubs={activeWorkspace.permissions.includes(
            "union.clubs.manage",
          )}
        />
      </div>
    );
  }

  function renderClubDetail() {
    const positionPool = workspacePlayerPositions.flatMap(
      (group) => group.positions,
    );
    const fallbackPositions = getSportPositionGroups(
      activeWorkspace.sport,
    ).flatMap((group) => group.positions);

    const safePositions =
      positionPool.length > 0 ? positionPool : fallbackPositions;

    const samplePlayers = [
      {
        name: `${selectedClub.name.split(" ")[0]} Player 1`,
        position: safePositions[0] ?? "Player",
        status: "Approved",
      },
      {
        name: `${selectedClub.name.split(" ")[0]} Player 2`,
        position: safePositions[1] ?? safePositions[0] ?? "Player",
        status: "Document review",
      },
      {
        name: `${selectedClub.name.split(" ")[0]} Player 3`,
        position: safePositions[2] ?? safePositions[0] ?? "Player",
        status: "Approved",
      },
    ];

    return (
      <section className={styles.panelLarge}>
        <SectionHeader
          eyebrow="Club detail"
          title={selectedClub.name}
          description={`${selectedClub.category} • ${selectedClub.players} players • ${selectedClub.teams} teams`}
          actions={
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => setClubView("directory")}
            >
              Back to Directory
            </button>
          }
        />
        <div className={styles.tabStrip}>
          {[
            "Profile",
            "Teams",
            "Players",
            "Fixtures",
            "Documents",
            "Admins",
            "Finance",
          ].map((item) => (
            <button
              key={item}
              className={item === "Players" ? styles.activeChip : ""}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <div className={styles.contentSplit}>
          <DataTable
            columns={[
              { key: "name", label: "Player", render: (item) => item.name },
              {
                key: "position",
                label: "Position",
                render: (item) => item.position,
              },
              {
                key: "status",
                label: "Registration",
                render: (item) => <StatusPill label={item.status} />,
              },
            ]}
            data={samplePlayers}
          />
          <aside className={styles.sidePanelCompact}>
            <h3>Club compliance</h3>
            <div className={styles.progressBlock}>
              <span>Documents</span>
              <strong>83%</strong>
              <div>
                <i style={{ width: "83%" }} />
              </div>
            </div>
            <div className={styles.progressBlock}>
              <span>Player registration</span>
              <strong>91%</strong>
              <div>
                <i style={{ width: "91%" }} />
              </div>
            </div>
            <div className={styles.positionFramework}>
              <h3>{activeWorkspace.sport} positions</h3>
              {workspacePlayerPositions.map((group) => (
                <div key={group.group}>
                  <strong>{group.group}</strong>
                  <p>{group.positions.join(" • ")}</p>
                </div>
              ))}
            </div>
            <ModuleButton
              label="Request update"
              icon={Megaphone}
              detail="Send document reminder"
            />
          </aside>
        </div>
      </section>
    );
  }

  function renderNationalTeams() {
    return (
      <UnionNationalTeamsPanel
        workspaceSlug={activeWorkspace.slug}
        workspaceName={activeWorkspace.name}
      />
    );
  }

  function renderReferees() {
    return (
      <UnionAdminRefereesPanel
        workspaceSlug={activeWorkspace.slug}
        workspaceName={activeWorkspace.name}
        workspaceSport={activeWorkspace.sport}
        canManageOfficials={activeWorkspace.permissions.includes(
          "union.referees.manage",
        )}
      />
    );
  }

  function renderAppointments() {
    return (
      <div className={styles.contentStack}>
        {!isMatchOfficialWorkspace(activeWorkspace) ? (
          <UnionOfficialReadinessPanel
            workspaceSlug={activeWorkspace.slug}
            workspaceName={activeWorkspace.name}
          />
        ) : null}
        <OfficialAppointmentsPanel
          mode={
            isMatchOfficialWorkspace(activeWorkspace) ? "official" : "union"
          }
          workspaceSlug={activeWorkspace.slug}
          workspaceName={activeWorkspace.name}
        />
      </div>
    );
  }

  function renderAvailability() {
    return (
      <section className={styles.panelLarge}>
        <SectionHeader
          eyebrow="Availability"
          title="Official availability"
          description="Availability will be shown when the backend provides a workspace-scoped availability contract."
        />
        <div className={styles.emptyState}>
          No availability records or local-only availability controls are shown.
        </div>
      </section>
    );
  }

  function renderMatchReports() {
    return (
      <section className={styles.panelLarge}>
        <SectionHeader
          eyebrow="Reports"
          title="Match reports and incidents"
          description="Officials submit reports; managers review incidents and disciplinary notes."
        />
        <div className={styles.contentSplit}>
          <DataTable
            columns={[
              { key: "match", label: "Match", render: (item) => item.match },
              {
                key: "competition",
                label: "Competition",
                render: (item) => item.competition,
              },
              { key: "role", label: "Role", render: (item) => item.role },
              {
                key: "report",
                label: "Status",
                render: (item) => <StatusPill label={item.report} />,
              },
            ]}
            data={workspaceAppointments}
          />
          <div className={styles.formPanel}>
            <h3>Read-only report status</h3>
            <p>
              Report submission is unavailable until the backend provides an
              authorised report mutation endpoint.
            </p>
          </div>
        </div>
      </section>
    );
  }

  function renderDocuments() {
    return (
      <section className={styles.panelLarge}>
        <SectionHeader
          eyebrow="Documents"
          title="Documents and certification"
          description="Document records are unavailable until a maintained official-document endpoint is provided."
        />
        <div className={styles.emptyState}>
          No official-document API is available for this workspace.
        </div>
      </section>
    );
  }

  function renderAllowances() {
    return (
      <section className={styles.panelLarge}>
        <SectionHeader
          eyebrow="Allowances"
          title="Payments and allowances"
          description="Official allowance records are unavailable until a maintained, authorised payment endpoint is provided."
        />
        <div className={styles.emptyState}>
          No official-payment API is available for this workspace.
        </div>
      </section>
    );
  }

  function renderProfile() {
    if (!currentOfficial) {
      return (
        <section className={styles.panelLarge}>
          <SectionHeader
            eyebrow="Official profile"
            title="Match official profile"
            description="No active Match Official profile was returned for this selected workspace."
          />
          <div className={styles.emptyState}>
            Profile details are unavailable until the workspace links an
            official record to this account.
          </div>
        </section>
      );
    }

    return (
      <section className={styles.panelLarge}>
        <SectionHeader
          eyebrow="Official profile"
          title="Match official profile"
          description="Your active Match Official profile for this selected workspace. Profile editing is not exposed by a maintained self-service API."
        />
        <div className={styles.profileGrid}>
          <div className={styles.profileCard}>
            <div className={styles.avatarLarge}>
              {getWorkspaceInitials(activeWorkspace)}
            </div>
            <h3>{currentOfficial.name}</h3>
            <p>
              {currentOfficial.role} • {currentOfficial.grade} •{" "}
              {activeWorkspace.name}
            </p>
            <StatusPill label={currentOfficial.status} />
          </div>
          <div className={styles.formPanel}>
            <h3>Current assignment information</h3>
            <p>Email: {currentOfficial.email}</p>
            <p>
              Competitions: {currentOfficial.competitions || "Not recorded"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  function renderTicketing() {
    return (
      <section className={styles.panelLarge}>
        <SectionHeader
          eyebrow="Union ticketing"
          title="Union-owned event ticketing"
          description="Ticketing data is available only when a maintained Union ticketing API is supplied for this workspace."
        />
        <div className={styles.emptyState}>
          No Union ticketing events are shown because there is no maintained
          workspace-scoped ticketing endpoint.
        </div>
      </section>
    );
  }

  function renderScanner() {
    return (
      <section className={styles.panelLarge}>
        <SectionHeader
          eyebrow="Scanner"
          title="Ticket scanner"
          description="A scanner will be enabled when the Union ticketing backend provides an authorised event and validation contract."
        />
        <div className={styles.emptyState}>
          Ticket validation is not available yet for this Union workspace.
        </div>
      </section>
    );
  }

  function renderEntryLogs() {
    return (
      <section className={styles.panelLarge}>
        <SectionHeader
          eyebrow="Gate activity"
          title="Entry logs"
          description="Entry logs will appear when the backend exposes a selected-workspace ticketing audit endpoint."
        />
        <div className={styles.emptyState}>
          No Union entry-log API is available.
        </div>
      </section>
    );
  }

  function renderFinance() {
    if (isLoadingFinance) {
      return (
        <section className={styles.panelLarge}>
          <SectionHeader
            eyebrow={`${activeWorkspace.acronym} finance`}
            title="Finance Dashboard"
            description="Loading workspace-scoped finance data."
          />
          <div className={styles.emptyState}>Loading finance data…</div>
        </section>
      );
    }

    if (financeError || !financeData) {
      return (
        <section className={styles.panelLarge}>
          <SectionHeader
            eyebrow={`${activeWorkspace.acronym} finance`}
            title="Finance Dashboard"
            description="Finance records are only shown after the workspace finance endpoint returns an authorised response."
          />
          <div className={styles.emptyState}>
            {financeError ||
              "No finance records are available for this workspace."}
          </div>
        </section>
      );
    }

    const financeKpis = [
      {
        label: "Gross Receipts",
        value: financeData.kpis.gross_receipts.display,
        change: `${financeData.kpis.transaction_count} transaction(s)`,
        detail:
          "Total successful and pending income before failed or reversed payments.",
        tone: "positive",
      },
      {
        label: "Net Settled",
        value: financeData.kpis.net_settled.display,
        change: "Settled",
        detail: "Confirmed cleared funds from completed payment records.",
        tone: "positive",
      },
      {
        label: "Pending Payouts",
        value: financeData.kpis.pending_payouts.display,
        change: `${financeData.kpis.payout_count} payout item(s)`,
        detail:
          "Pending finance reviews, reconciliations and settlement items.",
        tone: "warning",
      },
      {
        label: "Failed / Reversed",
        value: financeData.kpis.failed_reversed.display,
        change: "Needs review",
        detail: "Failed, reversed or disputed payment records.",
        tone: "danger",
      },
    ];

    const monthlyTrend = financeData.monthly_trend;

    const maxFinanceTrend = Math.max(
      1,
      ...monthlyTrend.map((item) => Number(item.value || 0)),
    );

    const revenueMix = financeData.revenue_mix;
    const transactions = financeData.recent_transactions;
    const payouts = financeData.payout_queue;

    return (
      <section className={styles.financeDashboard}>
        <SectionHeader
          eyebrow={`${activeWorkspace.acronym} finance`}
          title="Finance Dashboard"
          description="Track revenue, settlements, payouts, reconciliation items and audit activity for this union workspace."
        />

        <div className={styles.financeKpiGrid}>
          {financeKpis.map((item) => (
            <article className={styles.financeKpiCard} key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small
                className={
                  item.tone === "danger"
                    ? styles.financeDanger
                    : item.tone === "warning"
                      ? styles.financeWarning
                      : styles.financePositive
                }
              >
                {item.change}
              </small>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>

        <div className={styles.financeMainGrid}>
          <article className={styles.financeChartPanel}>
            <div className={styles.financePanelTitle}>
              <div>
                <span>Monthly trend</span>
                <h3>Revenue Growth</h3>
              </div>
              <strong>{financeData.kpis.gross_receipts.display}</strong>
            </div>

            <div className={styles.financeBarChart}>
              {monthlyTrend.length > 0 ? (
                monthlyTrend.map((item) => (
                  <div className={styles.financeBarItem} key={item.label}>
                    <div className={styles.financeBarTrack}>
                      <span
                        style={{
                          height: `${Math.max(
                            8,
                            Math.round(
                              (Number(item.value || 0) / maxFinanceTrend) * 100,
                            ),
                          )}%`,
                        }}
                        title={item.amount.display}
                      />
                    </div>
                    <small>{item.label}</small>
                  </div>
                ))
              ) : (
                <div className={styles.financeEmptyState}>
                  No monthly trend records are available.
                </div>
              )}
            </div>
          </article>

          <article className={styles.financeChartPanel}>
            <div className={styles.financePanelTitle}>
              <div>
                <span>Revenue mix</span>
                <h3>Income Sources</h3>
              </div>
              <strong>{revenueMix.length} stream(s)</strong>
            </div>

            {revenueMix.length > 0 ? (
              <div className={styles.financeMixList}>
                {revenueMix.map((item) => (
                  <div className={styles.financeMixItem} key={item.label}>
                    <div>
                      <strong>{item.label}</strong>
                      <span>{item.amount.display}</span>
                    </div>

                    <div className={styles.financeProgressTrack}>
                      <span style={{ width: `${item.percent}%` }} />
                    </div>

                    <small>{item.percent}%</small>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.financeEmptyState}>
                Revenue mix will appear when finance records are available.
              </div>
            )}
          </article>
        </div>

        <div className={styles.financeTablesGrid}>
          <article className={styles.financeTablePanel}>
            <div className={styles.financePanelTitle}>
              <div>
                <span>Recent activity</span>
                <h3>Transactions</h3>
              </div>
            </div>

            <div className={styles.financeTable}>
              <div className={styles.financeTableHead}>
                <span>Reference</span>
                <span>Source</span>
                <span>Amount</span>
                <span>Status</span>
              </div>

              {transactions.length > 0 ? (
                transactions.map((item) => (
                  <div className={styles.financeTableRow} key={item.reference}>
                    <span>{item.reference}</span>
                    <span>
                      <strong>{item.source}</strong>
                      <small>{item.date}</small>
                    </span>
                    <span>{item.amount.display}</span>
                    <span>{item.status}</span>
                  </div>
                ))
              ) : (
                <div className={styles.financeEmptyState}>
                  No finance transactions found for this workspace yet.
                </div>
              )}
            </div>
          </article>

          <article className={styles.financeTablePanel}>
            <div className={styles.financePanelTitle}>
              <div>
                <span>Payouts</span>
                <h3>Settlement Queue</h3>
              </div>
            </div>

            <div className={styles.financePayoutList}>
              {payouts.length > 0 ? (
                payouts.map((item) => (
                  <div
                    className={styles.financePayoutItem}
                    key={item.reference}
                  >
                    <div>
                      <strong>{item.beneficiary}</strong>
                      <span>{item.category}</span>
                    </div>
                    <div>
                      <strong>{item.amount.display}</strong>
                      <small>{item.status}</small>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.financeEmptyState}>
                  No payout or reconciliation records found yet.
                </div>
              )}
            </div>
          </article>
        </div>

        <div className={styles.financeConnectionPanel}>
          <div className={styles.financePanelTitle}>
            <div>
              <span>Connected backend endpoint</span>
              <h3>/dashboards/union-admin/finance/</h3>
            </div>
            <strong>{financeData.currency}</strong>
          </div>

          <div className={styles.financeConnectionGrid}>
            <article>
              <strong>Payment audit</strong>
              <p>
                Reads workspace-scoped payment records from monitoring/payment
                audit data.
              </p>
            </article>
            <article>
              <strong>Reconciliation</strong>
              <p>
                Reads payout and settlement queues from transaction
                reconciliation data.
              </p>
            </article>
            <article>
              <strong>Workspace permissions</strong>
              <p>
                Only users with union finance permission can view this finance
                dashboard.
              </p>
            </article>
          </div>
        </div>
      </section>
    );
  }

  function renderUsers() {
    const uniqueWorkspaceUsers = Array.from(
      new Map(
        workspaceUsers.map(
          (user) => [user.user_id, user],
        ),
      ).values(),
    );

    const userRows = uniqueWorkspaceUsers.map((user) => ({
      name: user.user_full_name || user.user_email,
      email: user.user_email,
      role: user.role_display,
      permissions: user.effective_permissions.length,
      status: user.is_active ? "Active" : "Inactive",
    }));

    return (
      <section className={styles.panelLarge}>
          <SectionHeader
            eyebrow="Users"
            title="Workspace users and permissions"
            description="Add a user to this workspace and review the backend-provided effective permissions. Updates, removal and ownership transfer are not exposed because their maintained API contracts are unavailable to Union administrators."
          />
          <div className={styles.contentSplit}>
            {isLoadingWorkspaceUsers ? (
              <div className={styles.emptyState}>Loading workspace users…</div>
            ) : workspaceUsersError ? (
              <div className={styles.emptyState}>{workspaceUsersError}</div>
            ) : (
              <DataTable
                columns={[
                  { key: "name", label: "User", render: (item) => item.name },
                  {
                    key: "email",
                    label: "Email",
                    render: (item) => item.email,
                  },
                  { key: "role", label: "Role", render: (item) => item.role },
                  {
                    key: "permissions",
                    label: "Permissions",
                    render: (item) => item.permissions,
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (item) => <StatusPill label={item.status} />,
                  },
                ]}
                data={userRows}
                emptyLabel="No active workspace users were returned."
              />
            )}
            <form
              className={styles.formPanel}
              onSubmit={(event) => void handleCreateWorkspaceUser(event)}
            >
              <h3>Add workspace user</h3>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={workspaceUserEmail}
                  onChange={(event) =>
                    setWorkspaceUserEmail(event.target.value)
                  }
                  placeholder="user@example.com"
                />
              </label>
              <label>
                Workspace role
                <select
                  value={workspaceUserRole}
                  onChange={(event) =>
                    setWorkspaceUserRole(
                      event.target.value as UnionWorkspaceRole,
                    )
                  }
                >
                  {[
                    "VIEWER",
                    "REGISTRAR",
                    "COMPETITIONS_MANAGER",
                    "REFEREE_MANAGER",
                    "MATCH_OFFICIAL",
                    "FINANCE_OFFICER",
                    "COMMUNICATIONS_OFFICER",
                    "TICKETING_OFFICER",
                    "UNION_ADMIN",
                  ].map((role) => (
                    <option key={role} value={role}>
                      {formatRole(role as UnionWorkspaceRole)}
                    </option>
                  ))}
                </select>
              </label>
              {workspaceUserNotice ? <p>{workspaceUserNotice}</p> : null}
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={isCreatingWorkspaceUser}
              >
                {isCreatingWorkspaceUser ? "Adding user..." : "Add user"}
              </button>
            </form>
          </div>
        </section>
);
  }

  function renderActiveTab() {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "competitions":
        return <UnionCompetitionsScreen workspace={activeWorkspace} />;
      case "clubs":
        return renderClubs();
      case "nationalTeams":
        return renderNationalTeams();
      case "registrations":
        return (
          <UnionRegistrationsScreen
            workspaceSlug={activeWorkspace.slug}
            workspaceName={activeWorkspace.name}
          />
        );
      case "playersTransfers":
        return (
          <UnionPlayersTransfersScreen
            workspaceSlug={activeWorkspace.slug}
            workspaceName={activeWorkspace.name}
          />
        );
      case "matchOfficials":
        return (
          <UnionMatchOfficialsPanel
            workspaceSlug={activeWorkspace.slug}
            workspaceName={activeWorkspace.name}
            workspaceSport={activeWorkspace.sport}
            workspaceRole={activeWorkspace.role}
            permissions={activeWorkspace.permissions}
          />
        );
      case "statistics":
        return <UnionStatisticsRecordsScreen />;
      case "profileBranding":
        return <UnionProfileBrandingScreen workspace={activeWorkspace} />;
      case "referees":
        return renderReferees();
      case "appointments":
        return renderAppointments();
      case "availability":
        return renderAvailability();
      case "matchReports":
        return renderMatchReports();
      case "documents":
        return renderDocuments();
      case "allowances":
        return renderAllowances();
      case "profile":
        return renderProfile();
      case "ticketing":
        return renderTicketing();
      case "scanner":
        return renderScanner();
      case "entryLogs":
        return renderEntryLogs();
      case "finance":
        return renderFinance();
      case "sponsors":
        return <UnionSponsorsScreen />;
      case "comms":
        return <UnionCommunicationsScreen />;
      case "users":
        return renderUsers();
      case "audit":
        return (
          <UnionAuditApprovalsScreen
            workspaceSlug={activeWorkspace.slug}
            workspaceName={activeWorkspace.name}
          />
        );
      case "settings":
        return <UnionSettingsScreen workspace={activeWorkspace} />;
      default:
        return renderOverview();
    }
  }

  const groupedSidebarTabs = sidebarSections
    .map((section) => ({
      ...section,
      items: section.keys
        .map((key) => availableTabs.find((tab) => tab.key === key))
        .filter((tab): tab is TabDefinition => Boolean(tab)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      <main
        className={`${styles.pageShell} ${
          isSidebarCollapsed ? styles.collapsedShell : ""
        }`}
      >
        <aside className={styles.sidebar}>
          <button
            className={styles.sidebarToggle}
            type="button"
            onClick={() =>
              setIsSidebarCollapsed((currentValue) => !currentValue)
            }
            aria-label={
              isSidebarCollapsed
                ? "Expand union sidebar"
                : "Collapse union sidebar"
            }
            title={
              isSidebarCollapsed
                ? "Expand union sidebar"
                : "Collapse union sidebar"
            }
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen size={19} strokeWidth={2.4} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={19} strokeWidth={2.4} aria-hidden="true" />
            )}
          </button>

          <Link
            className={styles.logoLink}
            to="/"
            aria-label="Open League OS home"
          >
            <img
              className={styles.logoHorizontal}
              src={logoHorizontal}
              alt="League OS"
            />
            <img
              className={styles.logoMark}
              src={logoMark}
              alt=""
              aria-hidden="true"
            />
          </Link>

          <span className={styles.portalLabel}>Union Workspace</span>

          <div className={styles.workspaceCard}>
            <div className={styles.workspaceAvatar}>
              {getWorkspaceInitials(activeWorkspace)}
            </div>
            <div>
              <strong>{activeWorkspace.name}</strong>
              <span>
                {activeWorkspace.roleDisplay ||
                  formatRole(activeWorkspace.role)}
              </span>
            </div>
          </div>

          <nav className={styles.navList} aria-label="Union workspace modules">
            {groupedSidebarTabs.map((section) => (
              <div className={styles.navGroup} key={section.label}>
                <span className={styles.navGroupLabel}>{section.label}</span>

                {section.items.map((tab) => {
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.key}
                      className={
                        activeTab === tab.key ? styles.activeNavItem : ""
                      }
                      type="button"
                      onClick={() => resetSearch(tab.key)}
                      aria-label={tab.label}
                      title={tab.label}
                    >
                      <Icon size={17} strokeWidth={2.3} aria-hidden="true" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          <button
            className={styles.logoutButton}
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={17} strokeWidth={2.3} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </aside>

        <section className={styles.contentArea}>
          {workspaces.length > 1 ? (
            <div className={styles.workspaceUtilityBar}>
              <span>Active workspace</span>

              <select
                className={styles.utilityWorkspaceSelect}
                value={activeWorkspaceSlug}
                disabled={isSwitchingWorkspace}
                aria-label="Switch Union workspace"
                onChange={(event) =>
                  void handleWorkspaceChange(event.target.value)
                }
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.entitlementId} value={workspace.slug}>
                    {workspace.acronym} · {workspace.roleDisplay}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {workspaceError ? (
            <div className={styles.alertBanner}>{workspaceError}</div>
          ) : null}
          {activeStats ? (
            <StatGrid
              stats={activeStats}
              loading={
                activeTab === "overview"
                  ? isLoadingOverview
                  : activeTab === "finance"
                    ? isLoadingFinance
                    : activeTab === "users"
                      ? isLoadingWorkspaceUsers
                      : false
              }
            />
          ) : null}

          {renderActiveTab()}
        </section>
      </main>

      <div className={styles.dashboardFooterWrap}>
        <AuthenticatedFooter />
      </div>

      <MobileUnionNavigation
        activeKey={activeTab}
        items={availableTabs.map((tab) => ({
          key: tab.key,
          label: tab.label,
          icon: tab.icon,
        }))}
        workspaceName={activeWorkspace.name}
        workspaceRole={activeWorkspace.role}
        onTabChange={(key) => resetSearch(key as TabKey)}
        onLogout={handleLogout}
      />
    </>
  );
}
