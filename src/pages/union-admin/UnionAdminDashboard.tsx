import {
    BadgeCheck,
    BarChart3,
    Building2,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    DollarSign,
    FileText,
    Layers3,
    LogOut,
    Megaphone,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
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
import UnionAdminManagementWorkflow from "../../components/UnionAdminManagementWorkflow/UnionAdminManagementWorkflow";
import UnionAdminClubsPanel from "../../components/UnionAdminClubsPanel/UnionAdminClubsPanel";
import UnionAdminRefereesPanel from "../../components/UnionAdminRefereesPanel/UnionAdminRefereesPanel";
import OfficialAppointmentsPanel from "../../components/OfficialAppointmentsPanel/OfficialAppointmentsPanel";
import LeagueAdminScopesPanel from "../../components/LeagueAdminScopesPanel/LeagueAdminScopesPanel";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getEntitlementsForDashboard } from "../../utils/dashboardAccess.js";
import logoHorizontal from "../../assets/logos/league-os-horizontal.png";
import logoMark from "../../assets/league-os-mark.svg";
import styles from "./UnionAdminDashboard.module.css";

type TabKey =
    | "overview"
    | "competitions"
    | "clubs"
    | "nationalTeams"
    | "registrations"
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

type CompetitionView = "list" | "detail" | "fixtures";
type ClubView = "directory" | "detail";

type TabDefinition = {
    key: TabKey;
    label: string;
    icon: typeof BarChart3;
    permission?: UnionWorkspacePermission;
    matchOfficialOnly?: boolean;
};

type Summary = {
    leagues: number;
    activeCompetitions: number;
    memberClubs: number;
    pendingApprovals: number;
    referees: number;
    upcomingMatches: number;
};

type StatCard = {
    label: string;
    value: string | number;
    detail: string;
    icon: typeof BarChart3;
};

type PageHeaderContent = {
    eyebrow: string;
    title: string;
    description: string;
    publicPath: string;
    publicLabel: string;
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
        throw new Error("Workspace users response belongs to a different workspace.");
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
        throw new Error("Workspace user creation response belongs to a different workspace.");
    }
}

const tabs: TabDefinition[] = [
    {
        key: "overview",
        label: "Overview",
        icon: BarChart3,
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
        key: "nationalTeams",
        label: "National Teams",
        icon: Users,
        permission: "union.teams.manage",
    },
    {
        key: "registrations",
        label: "Registrations",
        icon: ClipboardCheck,
        permission: "union.players.approve",
    },
    {
        key: "referees",
        label: "Referees",
        icon: BadgeCheck,
        permission: "union.referees.manage",
    },
    {
        key: "appointments",
        label: "Appointments",
        icon: CalendarDays,
        permission: "union.official.appointments.view",
    },
    {
        key: "availability",
        label: "Availability",
        icon: UserCheck,
        permission: "union.official.availability.manage",
    },
    {
        key: "matchReports",
        label: "Match Reports",
        icon: FileText,
        permission: "union.official.reports.manage",
    },
    {
        key: "documents",
        label: "Documents",
        icon: FileText,
        permission: "union.official.documents.view",
    },
    {
        key: "allowances",
        label: "Allowances",
        icon: DollarSign,
        permission: "union.official.payments.view",
    },
    {
        key: "profile",
        label: "Profile",
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
        label: "Comms",
        icon: Megaphone,
        permission: "union.communications.manage",
    },
    {
        key: "users",
        label: "Users",
        icon: Users,
        permission: "union.users.manage",
    },
    {
        key: "audit",
        label: "Audit Logs",
        icon: FileText,
        permission: "union.reports.view",
    },
    {
        key: "settings",
        label: "Settings",
        icon: ShieldCheck,
        permission: "union.users.manage",
    },
];

function canAccessTab(workspace: UnionWorkspaceOption, tab: TabDefinition) {
    return (
        (!tab.permission || workspace.permissions.includes(tab.permission)) &&
        (!tab.matchOfficialOnly || isMatchOfficialWorkspace(workspace))
    );
}

function getSummary(overview: UnionDashboardOverview | null): Summary {
    return {
        leagues: overview?.summary.leagues ?? 0,
        activeCompetitions: overview?.summary.active_competitions ?? 0,
        memberClubs: overview?.summary.member_clubs ?? 0,
        pendingApprovals: overview?.summary.pending_approvals ?? 0,
        referees: overview?.summary.referees ?? 0,
        upcomingMatches: overview?.summary.upcoming_matches ?? 0,
    };
}

function isMatchOfficialWorkspace(workspace: UnionWorkspaceOption) {
    return workspace.role === "MATCH_OFFICIAL";
}

function isTicketingWorkspace(workspace: UnionWorkspaceOption) {
    return workspace.role === "TICKETING_OFFICER";
}

function getPageHeaderContent(
    activeTab: TabKey,
    workspace: UnionWorkspaceOption,
): PageHeaderContent {
    const sport = workspace.sport || "sport";
    const unionPage = {
        publicPath: "/unions",
        publicLabel: "View Union Page",
    };

    switch (activeTab) {
        case "overview":
            return {
                eyebrow: "Workspace overview",
                title: isMatchOfficialWorkspace(workspace)
                    ? `${workspace.acronym} Match Official Workspace`
                    : isTicketingWorkspace(workspace)
                      ? `${workspace.acronym} Ticketing Workspace`
                      : `${workspace.acronym} Union Workspace`,
                description: isMatchOfficialWorkspace(workspace)
                    ? `Review your appointments, availability, reports and official records under ${workspace.name}.`
                    : isTicketingWorkspace(workspace)
                      ? `Review matchday scanning, entry logs and attendance activity under ${workspace.name}.`
                      : `Monitor ${workspace.name}, review priority actions and move between the operational areas available to your role.`,
                ...unionPage,
            };
        case "competitions":
            return {
                eyebrow: "Competition operations",
                title: "Competition Management",
                description: `Create and manage ${sport} competitions, seasons, participating clubs, fixtures and competition delivery under ${workspace.name}.`,
                publicPath: "/competitions",
                publicLabel: "View Competitions",
            };
        case "clubs":
            return {
                eyebrow: "Club governance",
                title: "Club Management",
                description: `Manage affiliated clubs, review their records and maintain the club structure governed by ${workspace.name}.`,
                publicPath: "/clubs",
                publicLabel: "View Clubs",
            };
        case "nationalTeams":
            return {
                eyebrow: "Representative teams",
                title: "National Team Operations",
                description: `Coordinate representative squads, player pools, team readiness and national-team activity for ${workspace.name}.`,
                ...unionPage,
            };
        case "registrations":
            return {
                eyebrow: "Player governance",
                title: "Registration & Eligibility",
                description: `Review player registrations, eligibility decisions, transfers and approval queues across ${workspace.name}.`,
                ...unionPage,
            };
        case "referees":
            return {
                eyebrow: "Official management",
                title: "Referee Operations",
                description: `Manage the ${sport} referees and match officials attached to ${workspace.name}, including roles, grades, status and competition pools.`,
                ...unionPage,
            };
        case "appointments":
            return {
                eyebrow: "Match appointments",
                title: "Appointment Control",
                description: `Assign eligible officials to fixtures, monitor appointment responses and maintain complete matchday coverage.`,
                ...unionPage,
            };
        case "availability":
            return {
                eyebrow: "Official readiness",
                title: "Availability Management",
                description: `Track official availability, restrictions and appointment readiness across upcoming ${sport} matchdays.`,
                ...unionPage,
            };
        case "matchReports":
            return {
                eyebrow: "Post-match workflow",
                title: "Matchday Reporting",
                description: `Review submitted reports, follow up overdue records and maintain the official match documentation trail.`,
                ...unionPage,
            };
        case "documents":
            return {
                eyebrow: "Official compliance",
                title: "Documents & Certifications",
                description: `Review certifications, identity records and compliance documents for officials registered under ${workspace.name}.`,
                ...unionPage,
            };
        case "allowances":
            return {
                eyebrow: "Official payments",
                title: "Allowances & Claims",
                description: `Track match-official allowances, payment status and supporting records for completed appointments.`,
                ...unionPage,
            };
        case "profile":
            return {
                eyebrow: "Personal workspace",
                title: "Official Profile",
                description: `Maintain your official profile, qualifications, preferences and contact information under ${workspace.name}.`,
                ...unionPage,
            };
        case "ticketing":
            return {
                eyebrow: "Event access",
                title: "Ticketing Operations",
                description: `Manage ticket inventory, matchday sales and access-control activity for union-owned events.`,
                publicPath: "/tickets",
                publicLabel: "View Tickets",
            };
        case "scanner":
            return {
                eyebrow: "Matchday access",
                title: "Ticket Scanner",
                description: `Validate tickets securely and record entry decisions for the active ${workspace.name} event.`,
                publicPath: "/tickets",
                publicLabel: "View Tickets",
            };
        case "entryLogs":
            return {
                eyebrow: "Attendance control",
                title: "Entry & Attendance Logs",
                description: `Review scan activity, attendance records and entry exceptions across union-managed events.`,
                publicPath: "/tickets",
                publicLabel: "View Tickets",
            };
        case "finance":
            return {
                eyebrow: "Financial governance",
                title: "Finance Oversight",
                description: `Review collections, disbursements, reconciliations and audit-ready financial summaries for ${workspace.name}.`,
                ...unionPage,
            };
        case "sponsors":
            return {
                eyebrow: "Commercial partnerships",
                title: "Sponsorship Management",
                description: `Manage sponsor relationships, agreements, benefits and payment activity connected to ${workspace.name}.`,
                ...unionPage,
            };
        case "comms":
            return {
                eyebrow: "Union communications",
                title: "Communications Centre",
                description: `Prepare announcements, target workspace audiences and coordinate official communications from ${workspace.name}.`,
                ...unionPage,
            };
        case "users":
            return {
                eyebrow: "Access administration",
                title: "Users & Permissions",
                description: `Manage workspace members, roles and permission coverage while preserving accountable access control.`,
                ...unionPage,
            };
        case "audit":
            return {
                eyebrow: "Governance records",
                title: "Audit Trail",
                description: `Review administrative actions, approvals and governance events recorded across the ${workspace.name} workspace.`,
                ...unionPage,
            };
        case "settings":
            return {
                eyebrow: "Workspace configuration",
                title: "Workspace Settings",
                description: `Configure the public profile, governance defaults and operational behaviour of ${workspace.name}.`,
                ...unionPage,
            };
        default:
            return {
                eyebrow: "Live workspace access",
                title: `${workspace.acronym} Union Workspace`,
                description: `Manage ${workspace.name} through workspace-level access.`,
                ...unionPage,
            };
    }
}

function getWorkspaceInitials(workspace: UnionWorkspaceOption) {
    return workspace.acronym || workspace.name.slice(0, 4).toUpperCase();
}


function getSportPositionGroups(sport?: string): UnionOperationsPlayerPosition[] {
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
            { group: "Defence", positions: ["Right Back", "Centre Back", "Left Back"] },
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
            { group: "Frontcourt", positions: ["Small Forward", "Power Forward", "Center"] },
        ];
    }

    return [{ group: "General", positions: ["Player", "Official", "Technical Staff"] }];
}


function statusClass(status: string) {
    const lowered = status.toLowerCase();

    if (lowered.includes("ready") || lowered.includes("available") || lowered.includes("active")) {
        return styles.success;
    }

    if (lowered.includes("missing") || lowered.includes("restricted")) {
        return styles.warning;
    }

    if (lowered.includes("draft") || lowered.includes("planning") || lowered.includes("review")) {
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
    return <span className={`${styles.statusPill} ${statusClass(label)}`}>{label}</span>;
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
            className={variant === "primary" ? styles.primaryAction : styles.secondaryAction}
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
        () =>
            getEntitlementsForDashboard(
                dashboardAccess,
                "UNION_WORKSPACE",
            ),
        [dashboardAccess],
    );
    const fanDashboardRoute = useMemo(
        () =>
            getEntitlementsForDashboard(
                dashboardAccess,
                "FAN",
            )[0]?.route,
        [dashboardAccess],
    );
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [workspaces, setWorkspaces] = useState<AuthorizedUnionWorkspaceOption[]>([]);
    const [activeWorkspaceSlug, setActiveWorkspaceSlug] = useState("");
    const [activeTab, setActiveTab] = useState<TabKey>("overview");
    const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
    const [isSwitchingWorkspace, setIsSwitchingWorkspace] = useState(false);
    const [workspaceError, setWorkspaceError] = useState("");
    const [overview, setOverview] = useState<UnionDashboardOverview | null>(null);
    const [workspaceUsers, setWorkspaceUsers] = useState<UnionWorkspaceUser[]>([]);
    const [overviewError, setOverviewError] = useState("");
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);
    const [workspaceUsersError, setWorkspaceUsersError] = useState("");
    const [isLoadingWorkspaceUsers, setIsLoadingWorkspaceUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [competitionView, setCompetitionView] = useState<CompetitionView>("list");
    const [selectedCompetitionId, setSelectedCompetitionId] = useState("");
    const [clubView, setClubView] = useState<ClubView>("directory");
    const [selectedClubId, setSelectedClubId] = useState("");
    const [fixtureStep, setFixtureStep] = useState(3);
    const [financeData, setFinanceData] = useState<UnionFinanceDashboard | null>(null);
    const [isLoadingFinance, setIsLoadingFinance] = useState(false);
    const [financeError, setFinanceError] = useState("");
    const [operationsData, setOperationsData] = useState<UnionOperationsDashboard | null>(null);
    const [workspaceUserEmail, setWorkspaceUserEmail] = useState("");
    const [workspaceUserRole, setWorkspaceUserRole] = useState<UnionWorkspaceRole>("VIEWER");
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

    const activeWorkspace =
        workspaces.find((workspace) => workspace.slug === activeWorkspaceSlug);
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
                const nextOverview = await getUnionDashboardOverview(activeWorkspace.slug);

                if (!isMounted) return;

                if (nextOverview.workspace.slug !== activeWorkspace.slug) {
                    throw new Error("Overview response belongs to a different workspace.");
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
    }, [activeWorkspace?.slug, activeWorkspace?.permissions, isLoadingWorkspaces]);

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
                    typeof (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail === "string"
                        ? (error as { response: { data: { detail: string } } }).response.data.detail
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
    }, [activeWorkspace?.slug, activeWorkspace?.permissions, isLoadingWorkspaces]);

    useEffect(() => {
        let isMounted = true;

        async function loadOperationsData() {
            if (isLoadingWorkspaces || !activeWorkspace?.slug || !isMatchOfficialWorkspace(activeWorkspace)) {
                setOperationsData(null);
                return;
            }

            try {
                const data = await getUnionOperationsDashboard(activeWorkspace.slug);

                if (!isMounted) return;

                if (data.workspace.slug !== activeWorkspace.slug) {
                    throw new Error("Operations response belongs to a different workspace.");
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
                setFinanceError("You do not have permission to view finance for this workspace.");
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
    }, [activeTab, activeWorkspace?.slug, activeWorkspace?.permissions, isLoadingWorkspaces]);

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
                result.selectedEntitlementId !==
                    requestedWorkspace.entitlementId ||
                String(result.workspace.scopeId) !==
                    String(requestedWorkspace.scopeId) ||
                result.workspace.role !== requestedWorkspace.role
                || result.workspace.slug !== requestedWorkspace.slug
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
            setCompetitionView("list");
            setClubView("directory");
        } catch {
            if (latestSwitchRequestRef.current !== switchRequest) return;
            setWorkspaceError(
                "That Union workspace could not be verified. Your current workspace has not changed.",
            );
        } finally {
            if (latestSwitchRequestRef.current === switchRequest) setIsSwitchingWorkspace(false);
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

            const users = assertWorkspaceUsersResult(usersResult, submittedWorkspaceSlug);

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
                typeof (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail === "string"
                    ? (error as { response: { data: { detail: string } } }).response.data.detail
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
        const isWaitingForAccess =
            isLoadingProfile || isLoadingWorkspaces;
        const requiresWorkspaceSelection =
            !isWaitingForAccess && workspaces.length > 1;

        return (
            <main className={styles.pageShell}>
                <section className={styles.contentArea}>
                    <header className={styles.heroHeader}>
                        <div className={styles.heroIdentity}>
                            <div className={styles.heroMetaRow}>
                                <span className={styles.liveBadge}>
                                    <Building2
                                        size={14}
                                        strokeWidth={2.4}
                                        aria-hidden="true"
                                    />
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
                            <Link
                                className={styles.headerActionPrimary}
                                to="/unions"
                            >
                                View Unions
                            </Link>
                            {fanDashboardRoute ? (
                                <Link
                                    className={styles.headerActionSecondary}
                                    to={fanDashboardRoute}
                                >
                                    Open Fan Dashboard
                                </Link>
                            ) : null}
                        </div>
                    </header>

                    {workspaceError ? (
                        <div className={styles.alertBanner}>
                            {workspaceError}
                        </div>
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
                                    void handleWorkspaceChange(
                                        event.target.value,
                                    )
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
                                        {workspace.acronym} -{" "}
                                        {workspace.roleDisplay}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ) : null}

                    <div className={styles.dashboardFooterWrap}>
                        <AuthenticatedFooter />
                    </div>
                </section>
            </main>
        );
    }

    const summary = getSummary(overview);
    // The operations endpoint currently contains generated operational rows. Do
    // not present those rows, counts, or labels as workspace data.
    const workspaceCompetitions: UnionOperationsDashboard["competitions"] = [];
    const workspaceClubs: UnionOperationsDashboard["clubs"] = [];
    const workspaceRegistrations: UnionOperationsDashboard["registrations"] = [];
    const workspaceReferees: UnionOperationsDashboard["referees"] = [];
    const workspaceAppointments: UnionOperationsDashboard["appointments"] = [];
    const workspacePlayerPositions = getSportPositionGroups(activeWorkspace.sport);
    const currentOfficial = operationsData?.current_official ?? null;

    const selectedCompetition =
        workspaceCompetitions.find((competition) => competition.id === selectedCompetitionId) ?? workspaceCompetitions[0];
    const selectedClub = workspaceClubs.find((club) => club.id === selectedClubId) ?? workspaceClubs[0];

    const filteredCompetitions = workspaceCompetitions.filter((competition) =>
        `${competition.name} ${competition.type ?? ""} ${competition.format} ${competition.season} ${competition.status} ${competition.fixtureStatus ?? ""}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
    );


    const statsByTab: Record<TabKey, StatCard[] | null> = {
        overview: overview
            ? [
                  { label: "Active Competitions", value: summary.activeCompetitions, detail: `${activeWorkspace.sport} competitions`, icon: Trophy },
                  { label: "Upcoming Matches", value: summary.upcomingMatches, detail: "Scheduled matches", icon: CalendarDays },
              ]
            : null,
        competitions: null,
        clubs: null,
        nationalTeams: null,
        registrations: null,
        referees: null,
        appointments: null,
        profile: currentOfficial
            ? [
                  { label: "Role", value: currentOfficial.role, detail: "Current official profile", icon: BadgeCheck },
                  { label: "Grade", value: currentOfficial.grade, detail: "Current official profile", icon: ShieldCheck },
                  { label: "Status", value: currentOfficial.status, detail: "Current official profile", icon: UserCheck },
              ]
            : null,
        finance: financeData
            ? [
                  { label: "Transactions", value: financeData.kpis.transaction_count, detail: "Returned by finance", icon: DollarSign },
                  { label: "Payouts", value: financeData.kpis.payout_count, detail: "Returned by finance", icon: ClipboardCheck },
              ]
            : null,
        users:
            !isLoadingWorkspaceUsers && !workspaceUsersError
                ? [
                      { label: "Workspace Users", value: workspaceUsers.length, detail: "Returned by backend", icon: Users },
                      { label: "Permissions", value: activeWorkspace.permissions.length, detail: "Current entitlement", icon: CheckCircle2 },
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
        setSearchQuery("");
        setActiveTab(nextTab);
    }

    function renderOverview() {
        if (isLoadingOverview) {
            return <div className={styles.emptyState}>Loading workspace overview…</div>;
        }

        if (overviewError) {
            return <div className={styles.emptyState}>{overviewError}</div>;
        }

        if (!overview) {
            return <div className={styles.emptyState}>Workspace overview is unavailable.</div>;
        }

        if (!isMatchOfficialWorkspace(activeWorkspace)) {
            return (
                <div className={styles.overviewLayout}>
                    <section className={styles.panelLarge}>
                        <SectionHeader
                            eyebrow="Workspace overview"
                            title={activeWorkspace.name}
                            description="This overview shows only workspace-scoped metrics returned by the overview endpoint."
                        />
                        <div className={styles.approvalSummaryGrid}>
                            <article>
                                <span>Leagues</span>
                                <strong>{summary.leagues}</strong>
                                <small>Returned by overview</small>
                            </article>
                            <article>
                                <span>Active competitions</span>
                                <strong>{summary.activeCompetitions}</strong>
                                <small>Returned by overview</small>
                            </article>
                            <article>
                                <span>Upcoming matches</span>
                                <strong>{summary.upcomingMatches}</strong>
                                <small>Scheduled matches</small>
                            </article>
                        </div>
                    </section>
                    <aside className={styles.sidePanel}>
                        <SectionHeader
                            eyebrow="Approvals"
                            title="Approval queue unavailable"
                            description="A maintained approval query is required before approval counts or records can be shown."
                        />
                        <div className={styles.emptyState}>No approval data is currently available for this workspace.</div>
                    </aside>
                </div>
            );
        }

        if (isMatchOfficialWorkspace(activeWorkspace)) {
            const nextAppointment = workspaceAppointments[0] ?? null;

            return (
                <div className={styles.overviewLayout}>
                    <section className={styles.panelLarge}>
                        <SectionHeader
                            eyebrow="My official workspace"
                            title={`Welcome${
                                currentOfficial?.name
                                    ? `, ${currentOfficial.name}`
                                    : ""
                            }`}
                            description={`Your ${activeWorkspace.name} workspace only shows your appointments, availability, reports, documents, allowances and official profile.`}
                            actions={
                                <button
                                    className={styles.primaryButton}
                                    type="button"
                                    onClick={() => resetSearch("appointments")}
                                >
                                    View appointments
                                </button>
                            }
                        />

                        <div className={styles.approvalSummaryGrid}>
                            <article>
                                <span>Official role</span>
                                <strong>
                                    {currentOfficial?.role ?? "Not linked"}
                                </strong>
                                <small>
                                    {currentOfficial?.grade ||
                                        "Certification pending"}
                                </small>
                            </article>

                            <article>
                                <span>Federation</span>
                                <strong>{activeWorkspace.acronym}</strong>
                                <small>{activeWorkspace.sport}</small>
                            </article>

                            <article>
                                <span>Status</span>
                                <strong>
                                    {currentOfficial?.status ?? "Pending"}
                                </strong>
                                <small>Appointment eligibility</small>
                            </article>
                        </div>

                        <DataTable
                            columns={[
                                {
                                    key: "match",
                                    label: "Match",
                                    render: (item) => item.match,
                                },
                                {
                                    key: "competition",
                                    label: "Competition",
                                    render: (item) => item.competition,
                                },
                                {
                                    key: "date",
                                    label: "Date",
                                    render: (item) => item.date,
                                },
                                {
                                    key: "venue",
                                    label: "Venue",
                                    render: (item) => item.venue,
                                },
                                {
                                    key: "role",
                                    label: "Role",
                                    render: (item) => item.role,
                                },
                                {
                                    key: "status",
                                    label: "Status",
                                    render: (item) => (
                                        <StatusPill
                                            label={
                                                item.status ?? "Assigned"
                                            }
                                        />
                                    ),
                                },
                            ]}
                            data={workspaceAppointments.slice(0, 5)}
                            emptyLabel="No appointments have been assigned to your official profile yet."
                        />
                    </section>

                    <aside className={styles.sidePanel}>
                        <SectionHeader
                            eyebrow="Next appointment"
                            title={
                                nextAppointment?.match ??
                                "No upcoming match"
                            }
                            description={
                                nextAppointment
                                    ? `${nextAppointment.competition} • ${nextAppointment.date}`
                                    : "Your federation will assign upcoming matches here."
                            }
                        />

                        <div className={styles.leagueSnapshotGrid}>
                            <div>
                                <span>Venue</span>
                                <strong>
                                    {nextAppointment?.venue ?? "TBC"}
                                </strong>
                            </div>

                            <div>
                                <span>Role</span>
                                <strong>
                                    {nextAppointment?.role ??
                                        currentOfficial?.role ??
                                        "TBC"}
                                </strong>
                            </div>

                            <div>
                                <span>Status</span>
                                <strong>
                                    {nextAppointment?.status ??
                                        "Awaiting assignment"}
                                </strong>
                            </div>

                            <div>
                                <span>Report</span>
                                <strong>
                                    {nextAppointment?.report ?? "Not due"}
                                </strong>
                            </div>
                        </div>
                    </aside>
                </div>
            );
        }

        const activeCompetition = workspaceCompetitions[0];
        const activeLeagueName =
            activeCompetition?.name ?? `${activeWorkspace.acronym} active league`;
        const topClubs = workspaceClubs.slice(0, 4);
        const nextFixtures = workspaceAppointments.slice(0, 3);

        const pendingApprovalRows = workspaceRegistrations.slice(0, 5).map((registration, index) => ({
            item: registration.applicant,
            type: registration.type,
            submittedBy: registration.club,
            status: registration.status,
            due: index === 0 ? "Today" : registration.submitted,
        }));

        const pendingApprovalCount = Math.max(
            summary.pendingApprovals,
            workspaceRegistrations.length,
        );

        const totalPlayers = workspaceClubs.reduce(
            (total, club) => total + Number(club.players || 0),
            0,
        );

        const readyClubs = workspaceClubs.filter((club) =>
            club.compliance.toLowerCase().includes("ready"),
        ).length;

        const reviewClubs = Math.max(workspaceClubs.length - readyClubs, 0);

        const assignedOfficials = Math.min(
            workspaceReferees.length,
            workspaceAppointments.length,
        );

        const appointmentsNeedingOfficials = Math.max(
            workspaceAppointments.length - assignedOfficials,
            0,
        );

        const reportsDue = Math.max(
            workspaceAppointments.filter((appointment) =>
                appointment.report.toLowerCase().includes("due"),
            ).length,
            summary.pendingApprovals > 0 ? 1 : 0,
        );

        const fixtureReadiness = activeCompetition
            ? `${activeCompetition.matches} fixtures • ${activeCompetition.status}`
            : "Fixtures will appear once competitions are connected";

        const financeGross = financeData?.kpis.gross_receipts.display ?? "Not loaded";
        const financePending = financeData?.kpis.pending_payouts.display ?? "Not loaded";

        const recommendedActions = [
            {
                label: `Review ${pendingApprovalCount} pending approval${
                    pendingApprovalCount === 1 ? "" : "s"
                }`,
                detail: "Player registrations, club documents and competition approvals.",
                action: "Open approvals",
                tab: "registrations" as TabKey,
            },
            {
                label: `Assign officials to ${
                    appointmentsNeedingOfficials || workspaceAppointments.length
                } match${
                    (appointmentsNeedingOfficials || workspaceAppointments.length) === 1
                        ? ""
                        : "es"
                }`,
                detail: "Make sure upcoming fixtures have referees and match commissioners.",
                action: "Open appointments",
                tab: "appointments" as TabKey,
            },
            {
                label: activeCompetition
                    ? `Check ${activeCompetition.name}`
                    : "Review competition setup",
                detail: fixtureReadiness,
                action: "Open competitions",
                tab: "competitions" as TabKey,
            },
            {
                label: "Review finance queue",
                detail: `${financePending} pending payout or reconciliation value.`,
                action: "Open finance",
                tab: "finance" as TabKey,
            },
        ].filter((item) => availableTabs.some((tab) => tab.key === item.tab));

        return (
            <div className={styles.overviewLayout}>
                <section className={styles.panelLarge}>
                    <SectionHeader
                        eyebrow="Approvals centre"
                        title="Pending approvals"
                        description="A focused queue for registrar, competition and compliance actions that need attention today."
                        actions={
                            <button
                                className={styles.primaryButton}
                                type="button"
                                onClick={() => resetSearch("registrations")}
                            >
                                Open approvals
                            </button>
                        }
                    />

                    <div className={styles.approvalSummaryGrid}>
                        <article>
                            <span>Pending</span>
                            <strong>{pendingApprovalCount}</strong>
                            <small>Needs review</small>
                        </article>
                        <article>
                            <span>Club compliance</span>
                            <strong>{reviewClubs}</strong>
                            <small>Requires follow-up</small>
                        </article>
                        <article>
                            <span>Reports due</span>
                            <strong>{reportsDue}</strong>
                            <small>After matchday</small>
                        </article>
                    </div>

                    <DataTable
                        columns={[
                            { key: "item", label: "Approval Item", render: (item) => item.item },
                            { key: "type", label: "Type", render: (item) => item.type },
                            {
                                key: "submittedBy",
                                label: "Submitted By",
                                render: (item) => item.submittedBy,
                            },
                            {
                                key: "status",
                                label: "Status",
                                render: (item) => <StatusPill label={item.status} />,
                            },
                            { key: "due", label: "Due", render: (item) => item.due },
                        ]}
                        data={pendingApprovalRows}
                        emptyLabel="No pending approval records for this workspace yet."
                    />
                </section>

                <aside className={styles.sidePanel}>
                    <SectionHeader
                        eyebrow="League snapshot"
                        title={activeLeagueName}
                        description="A quick view of the active competition, top clubs, fixture state and next matchday readiness."
                    />

                    <div className={styles.leagueSnapshotGrid}>
                        <div>
                            <span>Season</span>
                            <strong>{activeCompetition?.season ?? "TBC"}</strong>
                        </div>
                        <div>
                            <span>Clubs</span>
                            <strong>{activeCompetition?.clubs ?? workspaceClubs.length}</strong>
                        </div>
                        <div>
                            <span>Fixtures</span>
                            <strong>
                                {activeCompetition?.matches ?? workspaceAppointments.length}
                            </strong>
                        </div>
                        <div>
                            <span>Status</span>
                            <strong>{activeCompetition?.status ?? "Preview"}</strong>
                        </div>
                    </div>

                    <div className={styles.snapshotList}>
                        <h3>Club snapshot</h3>

                        {topClubs.length > 0 ? (
                            topClubs.map((club, index) => (
                                <button
                                    key={club.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedClubId(club.id);
                                        setClubView("detail");
                                        resetSearch("clubs");
                                    }}
                                >
                                    <span>{index + 1}</span>
                                    <strong>{club.name}</strong>
                                    <small>{club.players} players</small>
                                </button>
                            ))
                        ) : (
                            <p>No clubs connected yet.</p>
                        )}
                    </div>
                </aside>

                <section className={styles.overviewInsightsGrid}>
                    <article className={styles.sidePanelCompact}>
                        <SectionHeader
                            eyebrow="Player pool"
                            title={`${totalPlayers} registered players`}
                            description="Snapshot of the workspace player base and registration readiness."
                        />

                        <div className={styles.playerPoolMetrics}>
                            <div>
                                <strong>{workspaceRegistrations.length}</strong>
                                <span>Pending registrations</span>
                            </div>
                            <div>
                                <strong>{readyClubs}</strong>
                                <span>Ready clubs</span>
                            </div>
                            <div>
                                <strong>{reviewClubs}</strong>
                                <span>Compliance reviews</span>
                            </div>
                        </div>
                    </article>

                    <article className={styles.sidePanelCompact}>
                        <SectionHeader
                            eyebrow="Officials coverage"
                            title={`${assignedOfficials}/${
                                workspaceAppointments.length || assignedOfficials
                            } covered`}
                            description="Matchday readiness for referees, assistants and commissioners."
                        />

                        <div className={styles.coverageList}>
                            <span>
                                <strong>{workspaceReferees.length}</strong>
                                Officials in pool
                            </span>
                            <span>
                                <strong>{appointmentsNeedingOfficials}</strong>
                                Matches need assignment
                            </span>
                            <span>
                                <strong>{reportsDue}</strong>
                                Reports due
                            </span>
                        </div>
                    </article>

                    <article className={styles.sidePanelCompact}>
                        <SectionHeader
                            eyebrow="Next fixtures"
                            title="Upcoming matchday"
                            description="The next scheduled fixtures that need operational readiness."
                        />

                        <div className={styles.fixtureMiniList}>
                            {nextFixtures.length > 0 ? (
                                nextFixtures.map((fixture) => (
                                    <button
                                        key={`${fixture.match}-${fixture.date}`}
                                        type="button"
                                        onClick={() => resetSearch("appointments")}
                                    >
                                        <strong>{fixture.match}</strong>
                                        <span>{fixture.competition}</span>
                                        <small>{fixture.date}</small>
                                    </button>
                                ))
                            ) : (
                                <p>No upcoming fixtures found.</p>
                            )}
                        </div>
                    </article>
                </section>

                <section className={styles.panelFull}>
                    <SectionHeader
                        eyebrow="Next best actions"
                        title="Recommended actions"
                        description="Operational prompts based on approvals, fixtures, officials and finance status."
                    />

                    <div className={styles.recommendationGrid}>
                        {recommendedActions.map((item) => (
                            <article key={item.label}>
                                <div>
                                    <strong>{item.label}</strong>
                                    <p>{item.detail}</p>
                                </div>

                                <button type="button" onClick={() => resetSearch(item.tab)}>
                                    {item.action}
                                </button>
                            </article>
                        ))}
                    </div>

                    <div className={styles.financeMiniSummary}>
                        <span>Finance mini summary</span>
                        <strong>{financeGross}</strong>
                        <small>Gross workspace receipts</small>
                        <em>{financePending} pending payout review</em>
                    </div>
                </section>
            </div>
        );
    }

    function renderCompetitions() {
        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow={`${activeWorkspace.acronym} competitions`}
                    title="Competition management"
                    description="Competition, season, membership and fixture workflows use maintained management APIs. Generated operations summaries are not displayed."
                />
                <UnionAdminManagementWorkflow
                    workspaceSlug={activeWorkspace.slug}
                    workspaceLabel={activeWorkspace.name}
                />
            </section>
        );

        if (competitionView === "fixtures") return renderFixtureGenerator();
        if (competitionView === "detail") return renderCompetitionDetail();

        const activeCompetitionCount = workspaceCompetitions.filter((competition) =>
            competition.status.toLowerCase().includes("active"),
        ).length;

        const cupCount = workspaceCompetitions.filter((competition) =>
            `${competition.type ?? ""} ${competition.name}`.toLowerCase().includes("cup"),
        ).length;

        const tournamentCount = workspaceCompetitions.filter((competition) =>
            `${competition.type ?? ""} ${competition.name}`
                .toLowerCase()
                .match(/series|super|playoff|tournament/),
        ).length;

        const leagueCount = workspaceCompetitions.filter((competition) =>
            `${competition.type ?? "league"} ${competition.format}`
                .toLowerCase()
                .includes("league"),
        ).length;

        const selectedSnapshot =
            workspaceCompetitions.find((competition) => competition.id === selectedCompetitionId) ??
            filteredCompetitions[0] ??
            workspaceCompetitions[0];

        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow={`${activeWorkspace.acronym} competitions`}
                    title="Competition control room"
                    description="A backend-connected view of league, cup and tournament records, with fixture readiness, club entries and competition actions."
                    actions={
                        <>
                            <button
                                className={styles.primaryButton}
                                type="button"
                                onClick={() =>
                                    document
                                        .getElementById("union-admin-management-workflow")
                                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                                }
                            >
                                Create Competition
                            </button>
                            <button
                                className={styles.secondaryButton}
                                type="button"
                                onClick={() =>
                                    document
                                        .getElementById("union-admin-management-workflow")
                                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                                }
                            >
                                Generate Fixtures
                            </button>
                        </>
                    }
                />

                <UnionAdminManagementWorkflow
                    workspaceSlug={activeWorkspace.slug}
                    workspaceLabel={activeWorkspace.name}
                />

                <div className={styles.competitionCommandGrid}>
                    <article>
                        <span>Total competitions</span>
                        <strong>{workspaceCompetitions.length}</strong>
                        <small>{activeCompetitionCount} active</small>
                    </article>
                    <article>
                        <span>League records</span>
                        <strong>{leagueCount}</strong>
                        <small>Season-long competitions</small>
                    </article>
                    <article>
                        <span>Cup records</span>
                        <strong>{cupCount}</strong>
                        <small>Knockout competitions</small>
                    </article>
                    <article>
                        <span>Series / tournaments</span>
                        <strong>{tournamentCount}</strong>
                        <small>Super 8, sevens, playoffs</small>
                    </article>
                </div>

                <div className={styles.competitionWorkspaceGrid}>
                    <div className={styles.competitionMainPanel}>
                        <div className={styles.competitionToolbar}>
                            <div className={styles.searchBar}>
                                <Search size={18} />
                                <input
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search league, cup, tournament, season or status"
                                />
                            </div>

                            <div className={styles.filterChips}>
                                <button type="button">All</button>
                                <button type="button">League</button>
                                <button type="button">Cup</button>
                                <button type="button">Tournament</button>
                                <button type="button">Needs fixtures</button>
                            </div>
                        </div>

                        <DataTable
                            columns={[
                                {
                                    key: "name",
                                    label: "Competition",
                                    render: (competition) => (
                                        <button
                                            className={styles.inlineLink}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCompetitionId(competition.id);
                                                setCompetitionView("detail");
                                            }}
                                        >
                                            {competition.name}
                                        </button>
                                    ),
                                },
                                {
                                    key: "type",
                                    label: "Type",
                                    render: (competition) => competition.type ?? competition.format,
                                },
                                { key: "season", label: "Season", render: (competition) => competition.season },
                                { key: "clubs", label: "Entries", render: (competition) => competition.clubs },
                                { key: "matches", label: "Fixtures", render: (competition) => competition.matches },
                                {
                                    key: "nextFixture",
                                    label: "Next Fixture",
                                    render: (competition) => competition.nextFixture ?? "No upcoming fixture",
                                },
                                {
                                    key: "fixtureStatus",
                                    label: "Readiness",
                                    render: (competition) => (
                                        <StatusPill label={competition.fixtureStatus ?? competition.status} />
                                    ),
                                },
                                {
                                    key: "action",
                                    label: "Action",
                                    render: (competition) => (
                                        <button
                                            className={styles.tableActionButton}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCompetitionId(competition.id);
                                                setCompetitionView(
                                                    competition.matches > 0 ? "detail" : "fixtures",
                                                );
                                            }}
                                        >
                                            {competition.nextAction}
                                        </button>
                                    ),
                                },
                            ]}
                            data={filteredCompetitions}
                            emptyLabel="No competitions found for this workspace yet."
                        />
                    </div>

                    <aside className={styles.competitionInfoPanel}>
                        <h3>Competition snapshot</h3>

                        {selectedSnapshot ? (
                            <>
                                <div className={styles.competitionSnapshotTitle}>
                                    <strong>{selectedSnapshot.name}</strong>
                                    <StatusPill label={selectedSnapshot.status} />
                                </div>

                                <div className={styles.competitionMetaGrid}>
                                    <div>
                                        <span>Type</span>
                                        <strong>{selectedSnapshot.type ?? selectedSnapshot.format}</strong>
                                    </div>
                                    <div>
                                        <span>Phase</span>
                                        <strong>{selectedSnapshot.phase ?? "In season"}</strong>
                                    </div>
                                    <div>
                                        <span>Entries</span>
                                        <strong>{selectedSnapshot.clubs}</strong>
                                    </div>
                                    <div>
                                        <span>Fixtures</span>
                                        <strong>{selectedSnapshot.matches}</strong>
                                    </div>
                                </div>

                                <div className={styles.competitionReadinessList}>
                                    <span>
                                        <strong>Entry window</strong>
                                        {selectedSnapshot.entryWindow ?? "Entries open"}
                                    </span>
                                    <span>
                                        <strong>Registration</strong>
                                        {selectedSnapshot.registrationStatus ?? "Open"}
                                    </span>
                                    <span>
                                        <strong>Officials needed</strong>
                                        {selectedSnapshot.officialsNeeded ?? 0}
                                    </span>
                                    <span>
                                        <strong>Reports due</strong>
                                        {selectedSnapshot.reportsDue ?? 0}
                                    </span>
                                </div>

                                <button
                                    className={styles.primaryAction}
                                    type="button"
                                    onClick={() => setCompetitionView("detail")}
                                >
                                    <Trophy size={18} strokeWidth={2.3} aria-hidden="true" />
                                    <span>
                                        <strong>Open competition detail</strong>
                                        <small>Fixtures, teams, officials and reports</small>
                                    </span>
                                </button>
                            </>
                        ) : (
                            <p>No competition selected.</p>
                        )}

                        <div className={styles.positionFramework}>
                            <h3>{activeWorkspace.sport} player positions</h3>
                            {workspacePlayerPositions.map((group) => (
                                <div key={group.group}>
                                    <strong>{group.group}</strong>
                                    <p>{group.positions.join(" • ")}</p>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </section>
        );
    }

    function renderCompetitionDetail() {
        const competitionFixtures = workspaceAppointments.filter((appointment) =>
            appointment.competition
                .toLowerCase()
                .includes(selectedCompetition.name.toLowerCase().slice(0, 12)),
        );
        const visibleFixtures = competitionFixtures.length > 0 ? competitionFixtures : workspaceAppointments;
        const competitionClubs = workspaceClubs.slice(0, Math.max(selectedCompetition.clubs, 4));
        const officialCoverage = visibleFixtures.length
            ? Math.min(workspaceReferees.length, visibleFixtures.length)
            : 0;
        const fixtureCompletion =
            selectedCompetition.fixtureStatus ??
            (selectedCompetition.matches > 0 ? "Published" : "Needs fixtures");

        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Competition detail"
                    title={selectedCompetition.name}
                    description={`${selectedCompetition.type ?? selectedCompetition.format} • ${selectedCompetition.season} • ${selectedCompetition.phase ?? selectedCompetition.status}`}
                    actions={
                        <>
                            <button
                                className={styles.secondaryButton}
                                type="button"
                                onClick={() => setCompetitionView("list")}
                            >
                                Back to List
                            </button>
                            <button
                                className={styles.primaryButton}
                                type="button"
                                onClick={() => setCompetitionView("fixtures")}
                            >
                                Generate Fixtures
                            </button>
                        </>
                    }
                />

                <div className={styles.competitionDetailHero}>
                    <article>
                        <span>Clubs</span>
                        <strong>{selectedCompetition.clubs}</strong>
                        <small>Eligible competition entries</small>
                    </article>
                    <article>
                        <span>Fixtures</span>
                        <strong>{selectedCompetition.matches}</strong>
                        <small>{fixtureCompletion}</small>
                    </article>
                    <article>
                        <span>Officials</span>
                        <strong>
                            {officialCoverage}/{visibleFixtures.length || 0}
                        </strong>
                        <small>Coverage snapshot</small>
                    </article>
                    <article>
                        <span>Reports</span>
                        <strong>{selectedCompetition.reportsDue ?? 0}</strong>
                        <small>Due after matchday</small>
                    </article>
                </div>

                <div className={styles.competitionDetailGrid}>
                    <div className={styles.competitionMainPanel}>
                        <h3 className={styles.blockTitle}>Fixture calendar</h3>
                        <DataTable
                            columns={[
                                { key: "match", label: "Match", render: (appointment) => appointment.match },
                                { key: "date", label: "Date", render: (appointment) => appointment.date },
                                { key: "venue", label: "Venue", render: (appointment) => appointment.venue },
                                { key: "role", label: "Official Role", render: (appointment) => appointment.role },
                                {
                                    key: "report",
                                    label: "Report",
                                    render: (appointment) => <StatusPill label={appointment.report} />,
                                },
                            ]}
                            data={visibleFixtures}
                            emptyLabel="No fixtures have been generated for this competition yet."
                        />

                        <div className={styles.positionFrameworkWide}>
                            <h3>{activeWorkspace.sport} player position framework</h3>
                            <div>
                                {workspacePlayerPositions.map((group) => (
                                    <article key={group.group}>
                                        <strong>{group.group}</strong>
                                        <p>{group.positions.join(" • ")}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>

                    <aside className={styles.competitionSidePanel}>
                        <h3>Eligible clubs</h3>
                        <div className={styles.teamReadinessList}>
                            {competitionClubs.slice(0, 5).map((club) => (
                                <button
                                    key={club.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedClubId(club.id);
                                        setClubView("detail");
                                        resetSearch("clubs");
                                    }}
                                >
                                    <strong>{club.name}</strong>
                                    <span>{club.players} players</span>
                                    <StatusPill label={club.compliance} />
                                </button>
                            ))}
                            {competitionClubs.length > 5 ? (
                                <button
                                    className={styles.viewMoreClubButton}
                                    type="button"
                                    onClick={() => resetSearch("clubs")}
                                >
                                    View more eligible clubs
                                </button>
                            ) : null}
                        </div>

                        <div className={styles.fixtureStatusPanel}>
                            <span>Next fixture</span>
                            <strong>{selectedCompetition.nextFixture ?? "No upcoming fixture"}</strong>
                            <small>{selectedCompetition.nextAction}</small>
                        </div>
                    </aside>
                </div>
            </section>
        );
    }

    function renderFixtureGenerator() {
        const fixtureSteps = ["Competition", "Teams", "Rules", "Venues", "Preview", "Publish"];
        const selectedClubsForPreview = workspaceClubs.slice(0, 6);
        const generatedPreview = [
            {
                round: "Round 1",
                match:
                    selectedClubsForPreview.length >= 2
                        ? `${selectedClubsForPreview[0].name} vs ${selectedClubsForPreview[1].name}`
                        : "Fixture preview pending clubs",
                status: "Draft",
            },
            {
                round: "Round 2",
                match:
                    selectedClubsForPreview.length >= 4
                        ? `${selectedClubsForPreview[2].name} vs ${selectedClubsForPreview[3].name}`
                        : "Fixture preview pending clubs",
                status: "Draft",
            },
            {
                round: "Round 3",
                match:
                    selectedClubsForPreview.length >= 6
                        ? `${selectedClubsForPreview[4].name} vs ${selectedClubsForPreview[5].name}`
                        : "Fixture preview pending clubs",
                status: "Draft",
            },
        ];

        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Fixture generator"
                    title="Generate fixtures"
                    description="Configure competition rules, eligible teams, venues, match windows and constraints before publishing."
                    actions={
                        <button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={() => setCompetitionView("list")}
                        >
                            Back to Competitions
                        </button>
                    }
                />

                <div className={styles.fixtureGeneratorShell}>
                    <div className={styles.fixtureStepperPanel}>
                        {fixtureSteps.map((step, index) => (
                            <button
                                key={step}
                                className={index <= fixtureStep ? styles.completedStep : ""}
                                type="button"
                                onClick={() => setFixtureStep(index)}
                            >
                                <span>{index + 1}</span>
                                <strong>{step}</strong>
                            </button>
                        ))}
                    </div>

                    <form className={styles.fixtureFormPanel}>
                        <label>
                            Competition
                            <select
                                value={selectedCompetition.id}
                                onChange={(event) => setSelectedCompetitionId(event.target.value)}
                            >
                                {workspaceCompetitions.map((competition) => (
                                    <option key={competition.id} value={competition.id}>
                                        {competition.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Format
                            <select defaultValue={selectedCompetition.type ?? "League"}>
                                <option value="League">League</option>
                                <option value="Cup">Cup</option>
                                <option value="Tournament">Tournament</option>
                                <option value="Series">Series</option>
                            </select>
                        </label>
                        <label>
                            Match windows
                            <input defaultValue="Saturday / Sunday" />
                        </label>
                        <label>
                            Venue rule
                            <select defaultValue="home-away">
                                <option value="home-away">Home and away</option>
                                <option value="central-venue">Central venue</option>
                                <option value="regional-pools">Regional pools</option>
                            </select>
                        </label>
                        <label>
                            Blackout dates
                            <textarea defaultValue="National team weekend, stadium maintenance weekend" />
                        </label>
                        <div className={styles.buttonRow}>
                            <button className={styles.primaryButton} type="button">
                                Save Fixture Draft
                            </button>
                            <button className={styles.secondaryButton} type="button">
                                Check Conflicts
                            </button>
                        </div>
                    </form>

                    <div className={styles.fixturePreviewPanel}>
                        <h3 className={styles.blockTitle}>Generated preview</h3>
                        <DataTable
                            columns={[
                                { key: "round", label: "Round", render: (item) => item.round },
                                { key: "match", label: "Fixtures", render: (item) => item.match },
                                { key: "status", label: "Status", render: (item) => <StatusPill label={item.status} /> },
                            ]}
                            data={generatedPreview}
                        />
                        <div className={styles.fixturePublishPanel}>
                            <span>Ready to publish?</span>
                            <p>
                                Publishing should notify clubs, make fixtures visible to fans and
                                send matches to the officials appointment workflow.
                            </p>
                            <div className={styles.buttonRow}>
                                <button className={styles.primaryButton} type="button">
                                    Publish Fixtures
                                </button>
                                <button className={styles.secondaryButton} type="button">
                                    Export CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    function renderClubs() {
        if (clubView === "detail") return renderClubDetail();

        return (
            <section className={styles.panelLarge}>
                <UnionAdminClubsPanel
                    workspaceSlug={activeWorkspace.slug}
                    workspaceLabel={activeWorkspace.name}
                    sport={activeWorkspace.sport}
                    canManageClubs={activeWorkspace.permissions.includes("union.clubs.manage")}
                />
            </section>
        );
    }

    function renderClubDetail() {
        const positionPool = workspacePlayerPositions.flatMap((group) => group.positions);
        const fallbackPositions = getSportPositionGroups(activeWorkspace.sport).flatMap(
            (group) => group.positions,
        );

        const safePositions = positionPool.length > 0 ? positionPool : fallbackPositions;

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
                    {["Profile", "Teams", "Players", "Fixtures", "Documents", "Admins", "Finance"].map((item) => (
                        <button key={item} className={item === "Players" ? styles.activeChip : ""} type="button">
                            {item}
                        </button>
                    ))}
                </div>
                <div className={styles.contentSplit}>
                    <DataTable
                        columns={[
                            { key: "name", label: "Player", render: (item) => item.name },
                            { key: "position", label: "Position", render: (item) => item.position },
                            { key: "status", label: "Registration", render: (item) => <StatusPill label={item.status} /> },
                        ]}
                        data={samplePlayers}
                    />
                    <aside className={styles.sidePanelCompact}>
                        <h3>Club compliance</h3>
                        <div className={styles.progressBlock}>
                            <span>Documents</span>
                            <strong>83%</strong>
                            <div><i style={{ width: "83%" }} /></div>
                        </div>
                        <div className={styles.progressBlock}>
                            <span>Player registration</span>
                            <strong>91%</strong>
                            <div><i style={{ width: "91%" }} /></div>
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
                        <ModuleButton label="Request update" icon={Megaphone} detail="Send document reminder" />
                    </aside>
                </div>
            </section>
        );
    }

    function renderNationalTeams() {
        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Union-owned teams"
                    title="National teams"
                    description="National-team records are unavailable until a maintained workspace-scoped team contract is available."
                />
                <div className={styles.emptyState}>No maintained National Team management API is available for this workspace.</div>
            </section>
        );
    }

    function renderRegistrations() {
        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Approval centre"
                    title="Registrations"
                    description="Registration records are unavailable until a maintained workspace-scoped approvals contract is available."
                />
                <div className={styles.emptyState}>No maintained registration approval API is available for this workspace.</div>
            </section>
        );
    }

    function renderReferees() {
        return (
            <UnionAdminRefereesPanel
                workspaceSlug={activeWorkspace.slug}
                workspaceName={activeWorkspace.name}
                workspaceSport={activeWorkspace.sport}
                canManageOfficials={activeWorkspace.permissions.includes("union.referees.manage")}
            />
        );
    }

    function renderAppointments() {
        return (
            <OfficialAppointmentsPanel
                mode={isMatchOfficialWorkspace(activeWorkspace) ? "official" : "union"}
                workspaceSlug={activeWorkspace.slug}
                workspaceName={activeWorkspace.name}
            />
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
                <div className={styles.emptyState}>No availability records or local-only availability controls are shown.</div>
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
                            { key: "competition", label: "Competition", render: (item) => item.competition },
                            { key: "role", label: "Role", render: (item) => item.role },
                            { key: "report", label: "Status", render: (item) => <StatusPill label={item.report} /> },
                        ]}
                        data={workspaceAppointments}
                    />
                    <div className={styles.formPanel}>
                        <h3>Read-only report status</h3>
                        <p>Report submission is unavailable until the backend provides an authorised report mutation endpoint.</p>
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
                <div className={styles.emptyState}>No official-document API is available for this workspace.</div>
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
                <div className={styles.emptyState}>No official-payment API is available for this workspace.</div>
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
                    <div className={styles.emptyState}>Profile details are unavailable until the workspace links an official record to this account.</div>
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
                        <div className={styles.avatarLarge}>{getWorkspaceInitials(activeWorkspace)}</div>
                        <h3>{currentOfficial.name}</h3>
                        <p>{currentOfficial.role} • {currentOfficial.grade} • {activeWorkspace.name}</p>
                        <StatusPill label={currentOfficial.status} />
                    </div>
                    <div className={styles.formPanel}>
                        <h3>Current assignment information</h3>
                        <p>Email: {currentOfficial.email}</p>
                        <p>Competitions: {currentOfficial.competitions || "Not recorded"}</p>
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
                <div className={styles.emptyState}>No Union ticketing events are shown because there is no maintained workspace-scoped ticketing endpoint.</div>
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
                <div className={styles.emptyState}>Ticket validation is not available yet for this Union workspace.</div>
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
                <div className={styles.emptyState}>No Union entry-log API is available.</div>
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
                        {financeError || "No finance records are available for this workspace."}
                    </div>
                </section>
            );
        }

        const financeKpis = [
            {
                label: "Gross Receipts",
                value: financeData.kpis.gross_receipts.display,
                change: `${financeData.kpis.transaction_count} transaction(s)`,
                detail: "Total successful and pending income before failed or reversed payments.",
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
                detail: "Pending finance reviews, reconciliations and settlement items.",
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
                            <strong>
                                {financeData.kpis.gross_receipts.display}
                            </strong>
                        </div>

                        <div className={styles.financeBarChart}>
                            {monthlyTrend.length > 0 ? monthlyTrend.map((item) => (
                                <div className={styles.financeBarItem} key={item.label}>
                                    <div className={styles.financeBarTrack}>
                                        <span
                                            style={{
                                                height: `${Math.max(
                                                    8,
                                                    Math.round((Number(item.value || 0) / maxFinanceTrend) * 100),
                                                )}%`,
                                            }}
                                            title={item.amount.display}
                                        />
                                    </div>
                                    <small>{item.label}</small>
                                </div>
                            )) : <div className={styles.financeEmptyState}>No monthly trend records are available.</div>}
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
                                    <div className={styles.financePayoutItem} key={item.reference}>
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
                                Reads payout and settlement queues from transaction reconciliation
                                data.
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


    function renderSponsors() {
        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Sponsors"
                    title="Sponsor workspace integration"
                    description="Union sponsorship management is not available in this workspace yet. Corporate Sponsor accounts are not used as a substitute for a Union sponsorship relationship."
                />
                <div className={styles.emptyState}>
                    No maintained Union-specific sponsorship API is available.
                </div>
            </section>
        );
    }

    function renderComms() {
        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Communications"
                    title="Communications integration"
                    description="Announcements and workspace messaging will appear here when a maintained Union communications API is available."
                />
                <div className={styles.emptyState}>
                    No communications records or send action are shown until the backend contract exists.
                </div>
            </section>
        );
    }

    function renderUsers() {
        const userRows = workspaceUsers.map((user) => ({
                name: user.user_full_name || user.user_email,
                email: user.user_email,
                role: user.role_display,
                permissions: user.effective_permissions.length,
                status: user.is_active ? "Active" : "Inactive",
            }));

        return (
            <>
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
                                { key: "email", label: "Email", render: (item) => item.email },
                                { key: "role", label: "Role", render: (item) => item.role },
                                { key: "permissions", label: "Permissions", render: (item) => item.permissions },
                                { key: "status", label: "Status", render: (item) => <StatusPill label={item.status} /> },
                            ]}
                            data={userRows}
                            emptyLabel="No active workspace users were returned."
                        />
                    )}
                    <form className={styles.formPanel} onSubmit={(event) => void handleCreateWorkspaceUser(event)}>
                        <h3>Add workspace user</h3>
                        <label>
                            Email
                            <input
                                required
                                type="email"
                                value={workspaceUserEmail}
                                onChange={(event) => setWorkspaceUserEmail(event.target.value)}
                                placeholder="user@example.com"
                            />
                        </label>
                        <label>
                            Workspace role
                            <select
                                value={workspaceUserRole}
                                onChange={(event) => setWorkspaceUserRole(event.target.value as UnionWorkspaceRole)}
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
                                ].map((role) => <option key={role} value={role}>{formatRole(role as UnionWorkspaceRole)}</option>)}
                            </select>
                        </label>
                        {workspaceUserNotice ? <p>{workspaceUserNotice}</p> : null}
                        <button className={styles.primaryButton} type="submit" disabled={isCreatingWorkspaceUser}>
                            {isCreatingWorkspaceUser ? "Adding user..." : "Add user"}
                        </button>
                    </form>
                </div>
            </section>
            <section className={styles.panelLarge}>
                <LeagueAdminScopesPanel workspaceSlug={activeWorkspace.slug} />
            </section>
            </>
        );
    }

    function renderAudit() {
        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Governance"
                    title="Audit logs"
                    description="Workspace audit records will be shown when a maintained Union audit-log API is available."
                />
                <div className={styles.emptyState}>No workspace audit-log API is available.</div>
            </section>
        );
    }

    function renderSettings() {
        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Settings"
                    title="Workspace settings"
                    description="Workspace settings are read-only until a maintained Union settings update endpoint is available."
                />
                <div className={styles.contentSplit}>
                    <div className={styles.formPanel}>
                        <h3>{activeWorkspace.name}</h3>
                        <p>{activeWorkspace.description || "No workspace description is available."}</p>
                    </div>
                    <aside className={styles.actionRail}>
                        <h3>Default rules</h3>
                        <p>National teams belong under the union workspace.</p>
                        <p>Officials are created under the union and assigned to competitions.</p>
                        <p>Ticketing officers use union ticketing only for union-owned events.</p>
                    </aside>
                </div>
            </section>
        );
    }

    function renderActiveTab() {
        switch (activeTab) {
            case "overview": return renderOverview();
            case "competitions": return renderCompetitions();
            case "clubs": return renderClubs();
            case "nationalTeams": return renderNationalTeams();
            case "registrations": return renderRegistrations();
            case "referees": return renderReferees();
            case "appointments": return renderAppointments();
            case "availability": return renderAvailability();
            case "matchReports": return renderMatchReports();
            case "documents": return renderDocuments();
            case "allowances": return renderAllowances();
            case "profile": return renderProfile();
            case "ticketing": return renderTicketing();
            case "scanner": return renderScanner();
            case "entryLogs": return renderEntryLogs();
            case "finance": return renderFinance();
            case "sponsors": return renderSponsors();
            case "comms": return renderComms();
            case "users": return renderUsers();
            case "audit": return renderAudit();
            case "settings": return renderSettings();
            default: return renderOverview();
        }
    }


    const ActivePageIcon =
        tabs.find((tab) => tab.key === activeTab)?.icon ?? BarChart3;
    const pageHeader = getPageHeaderContent(activeTab, activeWorkspace);

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
                        setIsSidebarCollapsed(
                            (currentValue) => !currentValue,
                        )
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
                        <PanelLeftOpen
                            size={19}
                            strokeWidth={2.4}
                            aria-hidden="true"
                        />
                    ) : (
                        <PanelLeftClose
                            size={19}
                            strokeWidth={2.4}
                            aria-hidden="true"
                        />
                    )}
                </button>

                <Link
                    className={styles.logoLink}
                    to={fanDashboardRoute ?? "/"}
                    aria-label={
                        fanDashboardRoute
                            ? "Open Fan Dashboard"
                            : "Open League OS home"
                    }
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
                    <div className={styles.workspaceAvatar}>{getWorkspaceInitials(activeWorkspace)}</div>
                    <div>
                        <strong>{activeWorkspace.name}</strong>
                        <span>{activeWorkspace.roleDisplay || formatRole(activeWorkspace.role)}</span>
                    </div>
                </div>

                <label className={styles.workspaceSelectLabel} htmlFor="workspace-select">
                    Switch Workspace
                </label>
                <select
                    id="workspace-select"
                    className={styles.workspaceSelect}
                    value={activeWorkspaceSlug}
                    disabled={isSwitchingWorkspace}
                    onChange={(event) => void handleWorkspaceChange(event.target.value)}
                >
                    {workspaces.map((workspace) => (
                        <option key={workspace.entitlementId} value={workspace.slug}>
                            {workspace.acronym} - {workspace.roleDisplay}
                        </option>
                    ))}
                </select>

                <nav className={styles.navList} aria-label="Union workspace modules">
                    {availableTabs.map((tab) => {
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.key}
                                className={
                                    activeTab === tab.key
                                        ? styles.activeNavItem
                                        : ""
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
                <header className={styles.heroHeader}>
                    <div className={styles.heroIdentity}>
                        <div className={styles.heroMetaRow}>
                            <span className={styles.liveBadge}>
                                <ActivePageIcon size={14} strokeWidth={2.4} aria-hidden="true" />
                                {pageHeader.eyebrow}
                            </span>
                            <span className={styles.workspaceContext}>
                                {activeWorkspace.acronym} · {activeWorkspace.sport} · {activeWorkspace.roleDisplay || formatRole(activeWorkspace.role)}
                            </span>
                        </div>
                        <h1>{pageHeader.title}</h1>
                        <p>{pageHeader.description}</p>
                    </div>
                    <div className={styles.headerActions}>
                        <Link className={styles.headerActionPrimary} to={pageHeader.publicPath}>
                            {pageHeader.publicLabel}
                        </Link>
                        {fanDashboardRoute ? (
                            <Link
                                className={styles.headerActionSecondary}
                                to={fanDashboardRoute}
                            >
                                Open Fan Dashboard
                            </Link>
                        ) : null}
                    </div>
                </header>

                {workspaceError ? <div className={styles.alertBanner}>{workspaceError}</div> : null}
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

                <div className={styles.dashboardFooterWrap}>
                    <AuthenticatedFooter />
                </div>
            </section>
            </main>

            <MobileUnionNavigation
                activeKey={activeTab}
                items={availableTabs.map((tab) => ({
                    key: tab.key,
                    label: tab.label,
                    icon: tab.icon,
                }))}
                workspaceName={activeWorkspace.name}
                workspaceRole={activeWorkspace.role}
                fanDashboardRoute={fanDashboardRoute}
                onTabChange={(key) => resetSearch(key as TabKey)}
                onLogout={handleLogout}
            />
        </>
    );
}
