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
    RefreshCw,
    Search,
    ShieldCheck,
    TicketCheck,
    Trophy,
    UserCheck,
    Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import UnionAdminBudgetOversight from "./UnionAdminBudgetOversight";
import UnionAdminPaymentApprovals from "./UnionAdminPaymentApprovals";
import UnionAdminInvoiceVerification from "./UnionAdminInvoiceVerification";
import UnionAdminPayoutAuthorizations from "./UnionAdminPayoutAuthorizations";
import UnionAdminTransactionReview from "./UnionAdminTransactionReview";
import UnionAdminAuditLogs from "./UnionAdminAuditLogs";
import {
    getMyUnionWorkspaces,
    getUnionDashboardOverview,
    getUnionFinanceDashboard,
    getUnionOperationsDashboard,
    getUnionWorkspaceUsers,
    switchUnionWorkspace,
    type UnionDashboardOverview,
    type UnionFinanceDashboard,
    type UnionOperationsDashboard,
    type UnionOperationsPlayerPosition,
    type UnionWorkspaceOption,
    type UnionWorkspacePermission,
    type UnionWorkspaceRole,
    type UnionWorkspaceUser,
} from "../../services/unionAdminService";
import AuthenticatedFooter from "../../components/AuthenticatedFooter/AuthenticatedFooter";
import MobileUnionNavigation from "../../components/MobileUnionNavigation/MobileUnionNavigation";
import UnionAdminManagementWorkflow from "../../components/UnionAdminManagementWorkflow/UnionAdminManagementWorkflow";
import UnionAdminClubsPanel from "../../components/UnionAdminClubsPanel/UnionAdminClubsPanel";
import logoHorizontal from "../../assets/logos/league-os-horizontal.png";
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
    roles?: UnionWorkspaceRole[];
};

type Summary = {
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

type TableColumn<T> = {
    key: string;
    label: string;
    render: (item: T) => string | number | JSX.Element;
};

type CompetitionRecord = {
    id: string;
    name: string;
    type?: string;
    format: string;
    season: string;
    clubs: number;
    matches: number;
    status: string;
    phase?: string;
    entryWindow?: string;
    registrationStatus?: string;
    fixtureStatus?: string;
    nextFixture?: string;
    officialsNeeded?: number;
    reportsDue?: number;
    nextAction: string;
};

type ClubRecord = {
    id: string;
    name: string;
    category: string;
    teams: number;
    players: number;
    compliance: string;
    admin: string;
};

type RefereeRecord = {
    name: string;
    role: string;
    grade: string;
    status: string;
    competitions: string;
    nextMatch: string;
};

type AppointmentRecord = {
    match: string;
    competition: string;
    date: string;
    venue: string;
    role: string;
    report: string;
};

type RegistrationRecord = {
    applicant: string;
    club: string;
    type: string;
    submitted: string;
    status: string;
    reviewer: string;
};

const fallbackPermissions: UnionWorkspacePermission[] = [
    "union.dashboard.view",
    "union.competitions.manage",
    "union.clubs.manage",
    "union.players.approve",
    "union.referees.manage",
    "union.finance.view",
    "union.reports.view",
    "union.communications.manage",
    "union.users.manage",
    "union.official.appointments.view",
    "union.official.reports.manage",
    "union.official.availability.manage",
    "union.official.documents.view",
    "union.official.payments.view",
    "union.ticketing.manage",
    "union.ticketing.scan",
    "union.teams.manage",
];

const fallbackWorkspaces: UnionWorkspaceOption[] = [
    {
        id: 0,
        name: "Workspace Preview",
        slug: "workspace-preview",
        acronym: "WORK",
        sport: "Multi-sport",
        workspaceType: "Preview Workspace",
        description:
            "Neutral fallback workspace used only when live workspace access is unavailable.",
        primaryColor: "#7b3ff2",
        role: "OWNER",
        roleDisplay: "Workspace Owner",
        permissions: fallbackPermissions,
    },
];

const tabs: TabDefinition[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    {
        key: "competitions",
        label: "Competitions",
        icon: Trophy,
        permission: "union.competitions.manage",
        roles: ["OWNER", "UNION_ADMIN", "COMPETITIONS_MANAGER"],
    },
    {
        key: "clubs",
        label: "Clubs",
        icon: Building2,
        permission: "union.clubs.manage",
        roles: ["OWNER", "UNION_ADMIN", "COMPETITIONS_MANAGER", "REGISTRAR"],
    },
    {
        key: "nationalTeams",
        label: "National Teams",
        icon: Users,
        permission: "union.teams.manage",
        roles: ["OWNER", "UNION_ADMIN", "COMPETITIONS_MANAGER"],
    },
    {
        key: "registrations",
        label: "Registrations",
        icon: ClipboardCheck,
        permission: "union.players.approve",
        roles: ["OWNER", "UNION_ADMIN", "REGISTRAR"],
    },
    {
        key: "referees",
        label: "Referees",
        icon: BadgeCheck,
        permission: "union.referees.manage",
        roles: ["OWNER", "UNION_ADMIN", "REFEREE_MANAGER"],
    },
    {
        key: "appointments",
        label: "Appointments",
        icon: CalendarDays,
        permission: "union.official.appointments.view",
        roles: ["OWNER", "UNION_ADMIN", "REFEREE_MANAGER", "MATCH_OFFICIAL"],
    },
    {
        key: "availability",
        label: "Availability",
        icon: UserCheck,
        permission: "union.official.availability.manage",
        roles: ["REFEREE_MANAGER", "MATCH_OFFICIAL"],
    },
    {
        key: "matchReports",
        label: "Match Reports",
        icon: FileText,
        permission: "union.official.reports.manage",
        roles: ["OWNER", "UNION_ADMIN", "REFEREE_MANAGER", "MATCH_OFFICIAL"],
    },
    {
        key: "documents",
        label: "Documents",
        icon: FileText,
        permission: "union.official.documents.view",
        roles: ["REFEREE_MANAGER", "MATCH_OFFICIAL"],
    },
    {
        key: "allowances",
        label: "Allowances",
        icon: DollarSign,
        permission: "union.official.payments.view",
        roles: ["MATCH_OFFICIAL", "FINANCE_OFFICER"],
    },
    { key: "profile", label: "Profile", icon: UserCheck, roles: ["MATCH_OFFICIAL"] },
    {
        key: "ticketing",
        label: "Ticketing",
        icon: TicketCheck,
        permission: "union.ticketing.manage",
        roles: ["OWNER", "UNION_ADMIN", "TICKETING_OFFICER"],
    },
    {
        key: "scanner",
        label: "Scanner",
        icon: TicketCheck,
        permission: "union.ticketing.scan",
        roles: ["TICKETING_OFFICER"],
    },
    {
        key: "entryLogs",
        label: "Entry Logs",
        icon: FileText,
        permission: "union.ticketing.manage",
        roles: ["OWNER", "UNION_ADMIN", "TICKETING_OFFICER"],
    },
    {
        key: "finance",
        label: "Finance",
        icon: DollarSign,
        permission: "union.finance.view",
        roles: ["OWNER", "UNION_ADMIN", "FINANCE_OFFICER"],
    },
    {
        key: "sponsors",
        label: "Sponsors",
        icon: Layers3,
        permission: "union.reports.view",
        roles: ["OWNER", "UNION_ADMIN", "FINANCE_OFFICER"],
    },
    {
        key: "comms",
        label: "Comms",
        icon: Megaphone,
        permission: "union.communications.manage",
        roles: ["OWNER", "UNION_ADMIN", "COMMUNICATIONS_OFFICER"],
    },
    {
        key: "users",
        label: "Users",
        icon: Users,
        permission: "union.users.manage",
        roles: ["OWNER", "UNION_ADMIN"],
    },
    {
        key: "audit",
        label: "Audit Logs",
        icon: FileText,
        permission: "union.reports.view",
        roles: ["OWNER", "UNION_ADMIN"],
    },
    {
        key: "settings",
        label: "Settings",
        icon: ShieldCheck,
        permission: "union.users.manage",
        roles: ["OWNER", "UNION_ADMIN"],
    },
];

const UNION_WORKSPACE_STORAGE_KEY = "league_os_selected_union_workspace";

const competitions: CompetitionRecord[] = [
    {
        id: "nile-special",
        name: "Nile Special Rugby League",
        format: "15s league",
        season: "2026",
        clubs: 12,
        matches: 66,
        status: "Active",
        nextAction: "Assign officials",
    },
    {
        id: "uganda-cup",
        name: "Uganda Cup",
        format: "Knockout",
        season: "2026",
        clubs: 16,
        matches: 15,
        status: "Draft",
        nextAction: "Open entries",
    },
    {
        id: "rugby-sevens",
        name: "Rugby 7s Series",
        format: "Multi-round 7s",
        season: "2026",
        clubs: 12,
        matches: 84,
        status: "Planning",
        nextAction: "Generate rounds",
    },
    {
        id: "womens-league",
        name: "Women’s Rugby League",
        format: "15s league",
        season: "2026",
        clubs: 8,
        matches: 28,
        status: "Review",
        nextAction: "Eligibility checks",
    },
];

const clubs: ClubRecord[] = [
    {
        id: "kobs",
        name: "KOBS Rugby Club",
        category: "Senior club",
        teams: 3,
        players: 68,
        compliance: "Ready",
        admin: "Club Secretary",
    },
    {
        id: "heathens",
        name: "Heathens RFC",
        category: "Senior club",
        teams: 4,
        players: 74,
        compliance: "Ready",
        admin: "Team Manager",
    },
    {
        id: "pirates",
        name: "Black Pirates",
        category: "Senior club",
        teams: 3,
        players: 61,
        compliance: "Missing docs",
        admin: "Club Admin",
    },
    {
        id: "rhinos",
        name: "Rhinos Rugby Club",
        category: "Senior club",
        teams: 2,
        players: 44,
        compliance: "Review",
        admin: "Registrar",
    },
    {
        id: "impis",
        name: "Makerere Impis",
        category: "University club",
        teams: 2,
        players: 52,
        compliance: "Ready",
        admin: "Sports Tutor",
    },
];

const registrations: RegistrationRecord[] = [
    {
        applicant: "Daniel Okello",
        club: "KOBS Rugby Club",
        type: "New player",
        submitted: "Today",
        status: "Needs review",
        reviewer: "Registrar",
    },
    {
        applicant: "Patrick Ocen",
        club: "Black Pirates",
        type: "Transfer",
        submitted: "Yesterday",
        status: "Documents missing",
        reviewer: "Registrar",
    },
    {
        applicant: "Sarah Namutebi",
        club: "Women’s Rugby League",
        type: "Squad registration",
        submitted: "2 days ago",
        status: "Ready to approve",
        reviewer: "Union Admin",
    },
];

const referees: RefereeRecord[] = [
    {
        name: "John Referee",
        role: "Centre Referee",
        grade: "Level 2",
        status: "Available",
        competitions: "League, Cup, 7s",
        nextMatch: "KOBS vs Heathens",
    },
    {
        name: "Amina Official",
        role: "Assistant Referee",
        grade: "Level 1",
        status: "Available",
        competitions: "League, Women’s League",
        nextMatch: "Pirates vs Rhinos",
    },
    {
        name: "Michael Assessor",
        role: "Match Assessor",
        grade: "Assessor",
        status: "Restricted",
        competitions: "League",
        nextMatch: "Pending assignment",
    },
];

const appointments: AppointmentRecord[] = [
    {
        match: "KOBS vs Heathens",
        competition: "Nile Special Rugby League",
        date: "Sat 18 Jul, 4:00 PM",
        venue: "Legends Rugby Grounds",
        role: "Centre Referee",
        report: "Due after match",
    },
    {
        match: "Pirates vs Rhinos",
        competition: "Nile Special Rugby League",
        date: "Sun 19 Jul, 3:00 PM",
        venue: "Kings Park Arena",
        role: "Assistant Referee",
        report: "Not started",
    },
    {
        match: "Uganda 7s Trial",
        competition: "Rugby 7s Series",
        date: "Wed 22 Jul, 10:00 AM",
        venue: "Kyadondo Rugby Club",
        role: "Match Commissioner",
        report: "Pending",
    },
];

function canAccessTab(workspace: UnionWorkspaceOption, tab: TabDefinition) {
    const hasPermission = tab.permission ? workspace.permissions.includes(tab.permission) : false;
    const hasRole = tab.roles?.includes(workspace.role) ?? false;

    if (!tab.permission && !tab.roles?.length) return true;

    return hasPermission || hasRole;
}

function getSummary(overview: UnionDashboardOverview | null): Summary {
    return {
        activeCompetitions: overview?.summary.active_competitions ?? 0,
        memberClubs: overview?.summary.member_clubs ?? 0,
        pendingApprovals: overview?.summary.pending_approvals ?? 0,
        referees: overview?.summary.referees ?? 0,
        upcomingMatches: overview?.summary.upcoming_matches ?? 0,
    };
}

function resolvePreferredWorkspaceSlug(workspaces: UnionWorkspaceOption[]) {
    const savedSlug = localStorage.getItem(UNION_WORKSPACE_STORAGE_KEY);

    if (savedSlug && workspaces.some((workspace) => workspace.slug === savedSlug)) {
        return savedSlug;
    }

    return workspaces[0]?.slug ?? "";
}

function isMatchOfficialWorkspace(workspace: UnionWorkspaceOption) {
    return workspace.role === "MATCH_OFFICIAL";
}

function isTicketingWorkspace(workspace: UnionWorkspaceOption) {
    return workspace.role === "TICKETING_OFFICER";
}

function getWorkspaceTitle(workspace: UnionWorkspaceOption) {
    if (isMatchOfficialWorkspace(workspace)) return `${workspace.acronym} Match Official Workspace`;
    if (isTicketingWorkspace(workspace)) return `${workspace.acronym} Ticketing Workspace`;

    return `${workspace.acronym} Union Workspace`;
}

function getWorkspaceIntro(workspace: UnionWorkspaceOption) {
    if (isMatchOfficialWorkspace(workspace)) {
        return `Manage appointments, availability, reports, documents and allowances under ${workspace.name}.`;
    }

    if (isTicketingWorkspace(workspace)) {
        return `Manage assigned matchday scanning, entry logs and attendance records under ${workspace.name}.`;
    }

    return `Manage ${workspace.name} through workspace-level access. Your view changes based on your role and permissions.`;
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
    const [workspaces, setWorkspaces] = useState<UnionWorkspaceOption[]>(fallbackWorkspaces);
    const [activeWorkspaceSlug, setActiveWorkspaceSlug] = useState(() =>
        resolvePreferredWorkspaceSlug(fallbackWorkspaces),
    );
    const [activeTab, setActiveTab] = useState<TabKey>("overview");
    const [financeSubTab, setFinanceSubTab] = useState<"dashboard" | "budget" | "payments" | "invoices" | "payouts" | "transactions" | "audit">("dashboard");
    const [isApiBacked, setIsApiBacked] = useState(false);
    const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
    const [workspaceError, setWorkspaceError] = useState("");
    const [overview, setOverview] = useState<UnionDashboardOverview | null>(null);
    const [workspaceUsers, setWorkspaceUsers] = useState<UnionWorkspaceUser[]>([]);
    const [workspaceDataError, setWorkspaceDataError] = useState("");
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [competitionView, setCompetitionView] = useState<CompetitionView>("list");
    const [selectedCompetitionId, setSelectedCompetitionId] = useState(competitions[0].id);
    const [clubView, setClubView] = useState<ClubView>("directory");
    const [selectedClubId, setSelectedClubId] = useState(clubs[0].id);
    const [fixtureStep, setFixtureStep] = useState(3);
    const [reportNotes, setReportNotes] = useState("");
    const [messageDraft, setMessageDraft] = useState("");
    const [financeData, setFinanceData] = useState<UnionFinanceDashboard | null>(null);
    const [isLoadingFinance, setIsLoadingFinance] = useState(false);
    const [financeError, setFinanceError] = useState("");
    const [operationsData, setOperationsData] = useState<UnionOperationsDashboard | null>(null);
    const [operationsError, setOperationsError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadWorkspaces() {
            try {
                const apiWorkspaces = await getMyUnionWorkspaces();

                if (!isMounted) return;

                if (apiWorkspaces.length > 0) {
                    setWorkspaces(apiWorkspaces);
                    setActiveWorkspaceSlug(resolvePreferredWorkspaceSlug(apiWorkspaces));
                    setIsApiBacked(true);
                    setWorkspaceError("");
                } else {
                    setWorkspaces(fallbackWorkspaces);
                    setActiveWorkspaceSlug(resolvePreferredWorkspaceSlug(fallbackWorkspaces));
                    setIsApiBacked(false);
                    setWorkspaceError("No union workspaces are attached to this account yet.");
                }
            } catch {
                if (!isMounted) return;

                setWorkspaces(fallbackWorkspaces);
                setActiveWorkspaceSlug(resolvePreferredWorkspaceSlug(fallbackWorkspaces));
                setIsApiBacked(false);
                setWorkspaceError("Using preview data because workspace access could not be loaded.");
            } finally {
                if (isMounted) setIsLoadingWorkspaces(false);
            }
        }

        void loadWorkspaces();

        return () => {
            isMounted = false;
        };
    }, []);

    const activeWorkspace =
        workspaces.find((workspace) => workspace.slug === activeWorkspaceSlug) ?? workspaces[0];

    const availableTabs = useMemo(() => {
        return tabs.filter((tab) => canAccessTab(activeWorkspace, tab));
    }, [activeWorkspace]);

    useEffect(() => {
        if (!availableTabs.some((tab) => tab.key === activeTab)) {
            setActiveTab("overview");
        }
    }, [activeTab, availableTabs]);

    useEffect(() => {
        let isMounted = true;

        async function loadWorkspaceData() {
            if (isLoadingWorkspaces || !activeWorkspace?.slug) return;

            setIsLoadingOverview(true);

            try {
                const nextOverview = await getUnionDashboardOverview(activeWorkspace.slug);

                if (!isMounted) return;

                setOverview(nextOverview);
                setWorkspaceDataError("");

                if (activeWorkspace.permissions.includes("union.users.manage")) {
                    const users = await getUnionWorkspaceUsers(activeWorkspace.slug);

                    if (!isMounted) return;

                    setWorkspaceUsers(users);
                } else {
                    setWorkspaceUsers([]);
                }
            } catch {
                if (!isMounted) return;

                setOverview(null);
                setWorkspaceUsers([]);
                setWorkspaceDataError("Workspace data could not be loaded. Showing safe values.");
            } finally {
                if (isMounted) setIsLoadingOverview(false);
            }
        }

        void loadWorkspaceData();

        return () => {
            isMounted = false;
        };
    }, [activeWorkspace?.slug, activeWorkspace?.permissions, isLoadingWorkspaces]);

    useEffect(() => {
        let isMounted = true;

        async function loadOperationsData() {
            if (isLoadingWorkspaces || !activeWorkspace?.slug) return;

            try {
                const data = await getUnionOperationsDashboard(activeWorkspace.acronym || activeWorkspace.slug);

                if (!isMounted) return;

                setOperationsData(data);
                setOperationsError("");
            } catch {
                if (!isMounted) return;

                setOperationsData(null);
                setOperationsError(
                    "Workspace operations data could not be loaded. Showing safe preview records.",
                );
            }
        }

        void loadOperationsData();

        return () => {
            isMounted = false;
        };
    }, [activeWorkspace?.acronym, activeWorkspace?.slug, isLoadingWorkspaces]);

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
                const data = await getUnionFinanceDashboard(activeWorkspace.acronym || activeWorkspace.slug);

                if (!isMounted) return;

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
    }, [activeTab, activeWorkspace?.acronym, activeWorkspace?.slug, activeWorkspace?.permissions, isLoadingWorkspaces]);

    async function handleWorkspaceChange(nextSlug: string) {
        localStorage.setItem(UNION_WORKSPACE_STORAGE_KEY, nextSlug);
        setActiveWorkspaceSlug(nextSlug);
        setActiveTab("overview");
        setCompetitionView("list");
        setClubView("directory");

        try {
            await switchUnionWorkspace(nextSlug);
        } catch {
            // The local switch still works; protected endpoints will validate access.
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

    const summary = getSummary(overview);
    const workspaceCompetitions = operationsData?.competitions?.length
        ? operationsData.competitions
        : competitions;
    const workspaceClubs = operationsData?.clubs?.length ? operationsData.clubs : clubs;
    const workspaceNationalTeams = operationsData?.national_teams ?? [];
    const workspaceRegistrations = operationsData?.registrations?.length
        ? operationsData.registrations
        : registrations;
    const workspaceReferees = operationsData?.referees?.length ? operationsData.referees : referees;
    const workspaceAppointments = operationsData?.appointments?.length
        ? operationsData.appointments
        : appointments;
    const workspacePlayerPositions = operationsData?.player_positions?.length
        ? operationsData.player_positions
        : getSportPositionGroups(activeWorkspace.sport);

    const selectedCompetition =
        workspaceCompetitions.find((competition) => competition.id === selectedCompetitionId) ?? workspaceCompetitions[0];
    const selectedClub = workspaceClubs.find((club) => club.id === selectedClubId) ?? workspaceClubs[0];

    const totalCompetitionMatches = workspaceCompetitions.reduce(
        (total, competition) => total + Number(competition.matches || 0),
        0,
    );

    const totalCompetitionActions = workspaceCompetitions.filter((competition) =>
        `${competition.nextAction} ${competition.fixtureStatus ?? ""} ${competition.registrationStatus ?? ""}`
            .toLowerCase()
            .match(/generate|assign|review|open|pending|need/),
    ).length;

    const filteredCompetitions = workspaceCompetitions.filter((competition) =>
        `${competition.name} ${competition.type ?? ""} ${competition.format} ${competition.season} ${competition.status} ${competition.fixtureStatus ?? ""}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
    );


    const statsByTab: Record<TabKey, StatCard[]> = {
        overview: [
            {
                label: "Active Competitions",
                value: summary.activeCompetitions,
                detail: `${activeWorkspace.sport} competitions`,
                icon: Trophy,
            },
            {
                label: "Clubs / Teams",
                value: summary.memberClubs,
                detail: "Registered members",
                icon: Building2,
            },
            {
                label: "Pending Approvals",
                value: summary.pendingApprovals,
                detail: "Need admin action",
                icon: ClipboardCheck,
            },
            {
                label: "Officials",
                value: summary.referees,
                detail: "Referees and match officials",
                icon: BadgeCheck,
            },
        ],
        competitions: [
            { label: "Competitions", value: workspaceCompetitions.length, detail: "League, cup and series records", icon: Trophy },
            { label: "Matches", value: totalCompetitionMatches, detail: "Total planned match records", icon: CalendarDays },
            { label: "Club Entries", value: summary.memberClubs, detail: "Eligible competition entries", icon: Building2 },
            { label: "Actions", value: totalCompetitionActions, detail: "Fixture, result and report queues", icon: ClipboardCheck },
        ],
        clubs: [
            { label: "Clubs / Teams", value: summary.memberClubs, detail: "Live backend count", icon: Building2 },
            { label: "Club Admins", value: 12, detail: "Workspace-linked contacts", icon: Users },
            { label: "Compliance", value: "9/12", detail: "Ready for competition entry", icon: ShieldCheck },
            { label: "Players", value: 299, detail: "Sample registered player pool", icon: UserCheck },
        ],
        nationalTeams: [
            { label: "Teams", value: 4, detail: "Senior, women, sevens, U20", icon: Users },
            { label: "Player Pool", value: 52, detail: "Eligible selected athletes", icon: UserCheck },
            { label: "Fixtures", value: 3, detail: "Union-owned events", icon: CalendarDays },
            { label: "Staff", value: 11, detail: "Coaches and officials", icon: BadgeCheck },
        ],
        registrations: [
            { label: "Pending", value: registrations.length, detail: "Needs registrar review", icon: ClipboardCheck },
            { label: "Transfers", value: 1, detail: "Inter-club requests", icon: RefreshCw },
            { label: "Documents", value: 5, detail: "Missing or expiring", icon: FileText },
            { label: "Approvals", value: 18, detail: "Approved this month", icon: CheckCircle2 },
        ],
        referees: [
            { label: "Officials", value: summary.referees || workspaceReferees.length, detail: "Union-managed official pool", icon: BadgeCheck },
            { label: "Available", value: 2, detail: "Ready for appointment", icon: UserCheck },
            { label: "Assignments", value: workspaceAppointments.length, detail: "Upcoming matches", icon: CalendarDays },
            { label: "Reports", value: 2, detail: "Due after matchday", icon: FileText },
        ],
        appointments: [
            { label: "Appointments", value: workspaceAppointments.length, detail: "Upcoming assignments", icon: CalendarDays },
            { label: "Competitions", value: summary.activeCompetitions || 3, detail: "Assignment pools", icon: Trophy },
            { label: "Accepted", value: 2, detail: "Confirmed officials", icon: CheckCircle2 },
            { label: "Reports Due", value: 2, detail: "Post-match duties", icon: FileText },
        ],
        availability: [
            { label: "Available Slots", value: 6, detail: "This week", icon: UserCheck },
            { label: "Blocked Dates", value: 2, detail: "Unavailable windows", icon: CalendarDays },
            { label: "Travel Zones", value: 3, detail: "Preferred assignment areas", icon: Layers3 },
            { label: "Status", value: "Open", detail: "Can receive appointments", icon: BadgeCheck },
        ],
        matchReports: [
            { label: "Reports Due", value: 2, detail: "Awaiting submission", icon: FileText },
            { label: "Reviewed", value: 6, detail: "Approved this month", icon: CheckCircle2 },
            { label: "Incidents", value: 1, detail: "Disciplinary follow-up", icon: ClipboardCheck },
            { label: "Returned", value: 0, detail: "Needs correction", icon: RefreshCw },
        ],
        documents: [
            { label: "Documents", value: 5, detail: "Official records", icon: FileText },
            { label: "Certifications", value: 3, detail: "Level and licence", icon: BadgeCheck },
            { label: "Expiring", value: 1, detail: "Renewal needed", icon: ClipboardCheck },
            { label: "Eligibility", value: "Valid", detail: "Can be appointed", icon: ShieldCheck },
        ],
        allowances: [
            { label: "Pending", value: 2, detail: "Awaiting finance", icon: DollarSign },
            { label: "Paid", value: 5, detail: "Confirmed records", icon: CheckCircle2 },
            { label: "Claims", value: 3, detail: "Upcoming appointments", icon: CalendarDays },
            { label: "Receipts", value: 4, detail: "Downloadable", icon: FileText },
        ],
        profile: [
            { label: "Role", value: "Referee", detail: "Primary official type", icon: BadgeCheck },
            { label: "Grade", value: "Level 2", detail: "Certification level", icon: ShieldCheck },
            { label: "Pools", value: 3, detail: "Allowed competitions", icon: Trophy },
            { label: "Status", value: "Active", detail: "Appointment eligible", icon: UserCheck },
        ],
        ticketing: [
            { label: "Assigned Events", value: 2, detail: "Union-owned matches", icon: CalendarDays },
            { label: "Tickets Sold", value: 1280, detail: "Sample matchday volume", icon: TicketCheck },
            { label: "Gate Officers", value: 6, detail: "Assigned scanners", icon: Users },
            { label: "Entry Logs", value: 0, detail: "Today", icon: FileText },
        ],
        scanner: [
            { label: "Mode", value: "QR", detail: "Scanner ready", icon: TicketCheck },
            { label: "Valid", value: 0, detail: "Accepted entries", icon: CheckCircle2 },
            { label: "Rejected", value: 0, detail: "Invalid scans", icon: FileText },
            { label: "Sync", value: "Online", detail: "Ready to record", icon: BadgeCheck },
        ],
        entryLogs: [
            { label: "Entries", value: 0, detail: "Recorded admissions", icon: FileText },
            { label: "Manual Checks", value: 0, detail: "Fallback validations", icon: ClipboardCheck },
            { label: "Events", value: 2, detail: "Assigned matches", icon: CalendarDays },
            { label: "Audit", value: "On", detail: "Gate actions tracked", icon: ShieldCheck },
        ],
        finance: [
            { label: "Revenue Streams", value: 5, detail: "Fees, tickets, sponsors", icon: DollarSign },
            { label: "Pending Payouts", value: 2, detail: "Needs review", icon: ClipboardCheck },
            { label: "Receipts", value: 12, detail: "This month", icon: FileText },
            { label: "Audit Checks", value: 3, detail: "Finance trail", icon: ShieldCheck },
        ],
        sponsors: [
            { label: "Packages", value: 4, detail: "Available inventory", icon: Layers3 },
            { label: "Campaigns", value: 3, detail: "Active placements", icon: Megaphone },
            { label: "Beneficiaries", value: summary.memberClubs, detail: "Clubs and teams", icon: Building2 },
            { label: "Reports", value: 6, detail: "ROI summaries", icon: BarChart3 },
        ],
        comms: [
            { label: "Audiences", value: 6, detail: "Clubs, fans, officials", icon: Users },
            { label: "Drafts", value: 2, detail: "Pending review", icon: FileText },
            { label: "Sent", value: 18, detail: "This month", icon: Megaphone },
            { label: "Match Alerts", value: 3, detail: "Upcoming fixtures", icon: CalendarDays },
        ],
        users: [
            { label: "Workspace Users", value: workspaceUsers.length, detail: "Returned by backend", icon: Users },
            { label: "Roles", value: 9, detail: "Workspace role types", icon: ShieldCheck },
            { label: "Permissions", value: activeWorkspace.permissions.length, detail: "Current user", icon: CheckCircle2 },
            { label: "Owner", value: activeWorkspace.acronym, detail: activeWorkspace.roleDisplay, icon: UserCheck },
        ],
        audit: [
            { label: "Events", value: 24, detail: "Recent workspace actions", icon: FileText },
            { label: "Modules", value: 8, detail: "Tracked areas", icon: Layers3 },
            { label: "User Actions", value: workspaceUsers.length, detail: "Access changes", icon: Users },
            { label: "Exports", value: 3, detail: "Governance reports", icon: BarChart3 },
        ],
        settings: [
            { label: "Workspace", value: activeWorkspace.acronym, detail: activeWorkspace.workspaceType, icon: ShieldCheck },
            { label: "Profile", value: isApiBacked ? "Live" : "Preview", detail: "Public directory state", icon: Layers3 },
            { label: "Rules", value: 7, detail: "Configured defaults", icon: ClipboardCheck },
            { label: "Roles", value: 9, detail: "Permission templates", icon: Users },
        ],
    };

    const activeStats = statsByTab[activeTab];

    function resetSearch(nextTab: TabKey) {
        setSearchQuery("");
        setActiveTab(nextTab);
    }

    function renderOverview() {
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

        const financeGross = financeData?.kpis.gross_receipts.display ?? "UGX 0";
        const financePending = financeData?.kpis.pending_payouts.display ?? "UGX 0";

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
        ];

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

                {operationsError ? <div className={styles.alertBanner}>{operationsError}</div> : null}

                <UnionAdminManagementWorkflow
                    workspaceSlug={activeWorkspace.slug}
                    workspaceLabel={activeWorkspace.name}
                    clubs={workspaceClubs.map((club) => ({
                        id: String(club.id),
                        name: club.name,
                    }))}
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
                    fallbackClubs={workspaceClubs}
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
                    description="Manage national teams as union-owned teams, not normal clubs."
                    actions={<button className={styles.primaryButton} type="button">Create Team</button>}
                />
                <div className={styles.contentSplit}>
                    <DataTable
                        columns={[
                            { key: "team", label: "Team", render: (item) => item.team },
                            { key: "category", label: "Category", render: (item) => item.category },
                            { key: "players", label: "Players", render: (item) => item.players },
                            { key: "staff", label: "Staff", render: (item) => item.staff },
                            { key: "status", label: "Status", render: (item) => <StatusPill label={item.status} /> },
                        ]}
                        data={workspaceNationalTeams}
                    />
                    <aside className={styles.actionRail}>
                        <h3>National team structure</h3>
                        <p>
                            Teams belong to the union workspace and can use union ticketing, union officials,
                            sponsor inventory and public profiles.
                        </p>
                        <ModuleButton label="Open player pool" icon={UserCheck} detail="Select from eligible clubs" />
                    </aside>
                </div>
            </section>
        );
    }

    function renderRegistrations() {
        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Approval centre"
                    title="Registrations"
                    description="Review player registrations, transfers, squad submissions and document checks."
                />
                <div className={styles.contentSplit}>
                    <DataTable
                        columns={[
                            { key: "applicant", label: "Applicant", render: (item) => item.applicant },
                            { key: "club", label: "Club", render: (item) => item.club },
                            { key: "type", label: "Type", render: (item) => item.type },
                            { key: "submitted", label: "Submitted", render: (item) => item.submitted },
                            { key: "status", label: "Status", render: (item) => <StatusPill label={item.status} /> },
                            { key: "reviewer", label: "Reviewer", render: (item) => item.reviewer },
                        ]}
                        data={workspaceRegistrations}
                    />
                    <form className={styles.formPanel}>
                        <h3>Review decision</h3>
                        <label>
                            Decision
                            <select>
                                <option>Approve</option>
                                <option>Request changes</option>
                                <option>Reject</option>
                            </select>
                        </label>
                        <label>
                            Notes to club
                            <textarea placeholder="Add registrar notes" />
                        </label>
                        <button className={styles.primaryButton} type="button">
                            Save Decision
                        </button>
                    </form>
                </div>
            </section>
        );
    }

    function renderReferees() {
        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Official management"
                    title="Referees and match officials"
                    description="The union creates and grades officials. Competitions can then assign them to matches."
                    actions={<button className={styles.primaryButton} type="button">Create Official</button>}
                />
                <div className={styles.contentSplit}>
                    <DataTable
                        columns={[
                            { key: "name", label: "Official", render: (item) => item.name },
                            { key: "role", label: "Role", render: (item) => item.role },
                            { key: "grade", label: "Certification", render: (item) => item.grade },
                            { key: "competitions", label: "Pools", render: (item) => item.competitions },
                            { key: "nextMatch", label: "Next Match", render: (item) => item.nextMatch },
                            { key: "status", label: "Status", render: (item) => <StatusPill label={item.status} /> },
                        ]}
                        data={workspaceReferees}
                    />
                    <form className={styles.formPanel}>
                        <h3>Create official account</h3>
                        <label>
                            Email
                            <input placeholder="official@example.com" />
                        </label>
                        <label>
                            Role type
                            <select>
                                <option>Centre Referee</option>
                                <option>Assistant Referee</option>
                                <option>Match Commissioner</option>
                                <option>Assessor</option>
                                <option>Scorer / Table Official</option>
                            </select>
                        </label>
                        <label>
                            Certification level
                            <select>
                                <option>Level 1</option>
                                <option>Level 2</option>
                                <option>Assessor</option>
                            </select>
                        </label>
                        <button className={styles.primaryButton} type="button">
                            Prepare Account
                        </button>
                    </form>
                </div>
            </section>
        );
    }

    function renderAppointments() {
        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Official appointments"
                    title={isMatchOfficialWorkspace(activeWorkspace) ? "My appointments" : "Appointments"}
                    description="Officials belong to the union but can be assigned to different competitions and matches."
                />
                <div className={styles.contentSplit}>
                    <DataTable
                        columns={[
                            { key: "match", label: "Match", render: (item) => item.match },
                            { key: "competition", label: "Competition", render: (item) => item.competition },
                            { key: "date", label: "Date", render: (item) => item.date },
                            { key: "venue", label: "Venue", render: (item) => item.venue },
                            { key: "role", label: "Role", render: (item) => item.role },
                            { key: "report", label: "Report", render: (item) => <StatusPill label={item.report} /> },
                        ]}
                        data={workspaceAppointments}
                    />
                    <aside className={styles.actionRail}>
                        <h3>Next match assigned</h3>
                        <p>KOBS vs Heathens</p>
                        <p>Legends Rugby Grounds • Centre Referee • Report due after match</p>
                        <div className={styles.buttonColumn}>
                            <button className={styles.primaryButton} type="button">Accept Appointment</button>
                            <button className={styles.secondaryButton} type="button">Open Match Detail</button>
                        </div>
                    </aside>
                </div>
            </section>
        );
    }

    function renderAvailability() {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const slots = ["Morning", "Afternoon", "Evening"];

        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Availability"
                    title="Official availability"
                    description="Officials can mark when they are available. Referee managers use this to assign matches."
                />
                <div className={styles.availabilityGrid}>
                    <div />
                    {days.map((day) => <strong key={day}>{day}</strong>)}
                    {slots.map((slot) => (
                        <>
                            <strong key={`${slot}-label`}>{slot}</strong>
                            {days.map((day, index) => (
                                <button
                                    key={`${slot}-${day}`}
                                    className={(slot === "Afternoon" && index > 4) || (slot === "Evening" && index === 2) ? styles.availableSlot : ""}
                                    type="button"
                                >
                                    {(slot === "Afternoon" && index > 4) || (slot === "Evening" && index === 2) ? "Available" : "—"}
                                </button>
                            ))}
                        </>
                    ))}
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
                            { key: "competition", label: "Competition", render: (item) => item.competition },
                            { key: "role", label: "Role", render: (item) => item.role },
                            { key: "report", label: "Status", render: (item) => <StatusPill label={item.report} /> },
                        ]}
                        data={workspaceAppointments}
                    />
                    <form className={styles.formPanel}>
                        <h3>Submit match report</h3>
                        <label>
                            Final score
                            <input placeholder="KOBS 24 - 18 Heathens" />
                        </label>
                        <label>
                            Incidents / cards / injuries
                            <textarea
                                value={reportNotes}
                                onChange={(event) => setReportNotes(event.target.value)}
                                placeholder="Enter report notes"
                            />
                        </label>
                        <button className={styles.primaryButton} type="button">
                            Save Report Draft
                        </button>
                    </form>
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
                    description="Manage official licences, identity documents, safeguarding certificates and expiry status."
                    actions={<button className={styles.primaryButton} type="button">Upload Document</button>}
                />
                <DataTable
                    columns={[
                        { key: "doc", label: "Document", render: (item) => item.doc },
                        { key: "owner", label: "Owner", render: (item) => item.owner },
                        { key: "expires", label: "Expires", render: (item) => item.expires },
                        { key: "status", label: "Status", render: (item) => <StatusPill label={item.status} /> },
                    ]}
                    data={[
                        { doc: "Referee Level 2 Certificate", owner: "John Referee", expires: "2027", status: "Valid" },
                        { doc: "Safeguarding Certificate", owner: "Amina Official", expires: "2 months", status: "Expiring soon" },
                        { doc: "National ID", owner: "Michael Assessor", expires: "Verified", status: "Valid" },
                    ]}
                />
            </section>
        );
    }

    function renderAllowances() {
        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Allowances"
                    title="Payments and allowances"
                    description="Track match official allowances, payment status, receipts and finance review."
                />
                <DataTable
                    columns={[
                        { key: "match", label: "Match", render: (item) => item.match },
                        { key: "official", label: "Official", render: (item) => item.official },
                        { key: "amount", label: "Amount", render: (item) => item.amount },
                        { key: "status", label: "Status", render: (item) => <StatusPill label={item.status} /> },
                    ]}
                    data={[
                        { match: "KOBS vs Heathens", official: "John Referee", amount: "UGX 150,000", status: "Pending" },
                        { match: "Pirates vs Rhinos", official: "Amina Official", amount: "UGX 90,000", status: "Approved" },
                        { match: "Mongers vs Impis", official: "Michael Assessor", amount: "UGX 120,000", status: "Paid" },
                    ]}
                />
            </section>
        );
    }

    function renderProfile() {
        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Official profile"
                    title="Match official profile"
                    description="The same user account can keep a fan profile and access a restricted official workspace."
                />
                <div className={styles.profileGrid}>
                    <div className={styles.profileCard}>
                        <div className={styles.avatarLarge}>JR</div>
                        <h3>John Referee</h3>
                        <p>Centre Referee • Level 2 • Uganda Rugby Union</p>
                        <StatusPill label="Active" />
                    </div>
                    <form className={styles.formPanel}>
                        <label>
                            Role type
                            <select defaultValue="Centre Referee">
                                <option>Centre Referee</option>
                                <option>Assistant Referee</option>
                                <option>Match Commissioner</option>
                                <option>Assessor</option>
                            </select>
                        </label>
                        <label>
                            Assigned competition pools
                            <textarea defaultValue="Nile Special Rugby League, Uganda Cup, Rugby 7s Series" />
                        </label>
                        <button className={styles.primaryButton} type="button">Save Profile</button>
                    </form>
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
                    description="Ticketing officers can support national team games and union-owned events in the same workspace."
                />
                <div className={styles.contentSplit}>
                    <DataTable
                        columns={[
                            { key: "event", label: "Event", render: (item) => item.event },
                            { key: "date", label: "Date", render: (item) => item.date },
                            { key: "sold", label: "Sold", render: (item) => item.sold },
                            { key: "status", label: "Status", render: (item) => <StatusPill label={item.status} /> },
                        ]}
                        data={[
                            { event: "Uganda Rugby Cranes vs Kenya", date: "Sat 25 Jul", sold: 1280, status: "Scanner ready" },
                            { event: "Uganda 7s Trial Day", date: "Wed 22 Jul", sold: 420, status: "Setup" },
                        ]}
                    />
                    <ModuleButton label="Open Scanner" icon={TicketCheck} variant="primary" onClick={() => setActiveTab("scanner")} />
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
                    description="Validate QR tickets, wrong-match tickets, already-used tickets and manual fallback checks."
                />
                <div className={styles.scannerLayout}>
                    <div className={styles.scannerBox}>
                        <TicketCheck size={64} strokeWidth={2.2} />
                        <strong>Ready to scan</strong>
                        <span>Camera scanner placeholder for assigned union events.</span>
                        <button className={styles.primaryButton} type="button">Start Scan</button>
                    </div>
                    <form className={styles.formPanel}>
                        <h3>Manual check-in</h3>
                        <label>
                            Ticket code
                            <input placeholder="LOS-TKT-0001" />
                        </label>
                        <button className={styles.secondaryButton} type="button">Search Ticket</button>
                    </form>
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
                    description="Every scan, manual check and override should be auditable by match, officer and timestamp."
                    actions={<button className={styles.secondaryButton} type="button">Export Logs</button>}
                />
                <DataTable
                    columns={[
                        { key: "time", label: "Time", render: (item) => item.time },
                        { key: "gate", label: "Gate", render: (item) => item.gate },
                        { key: "ticket", label: "Ticket", render: (item) => item.ticket },
                        { key: "officer", label: "Officer", render: (item) => item.officer },
                        { key: "result", label: "Result", render: (item) => <StatusPill label={item.result} /> },
                    ]}
                    data={[
                        { time: "Not started", gate: "Main", ticket: "—", officer: "Ticketing Officer", result: "Awaiting scans" },
                    ]}
                />
            </section>
        );
    }

    function renderFinanceSubmenuContent() {
        switch (financeSubTab) {
            case "budget":
                return <UnionAdminBudgetOversight />;
            case "payments":
                return <UnionAdminPaymentApprovals />;
            case "invoices":
                return <UnionAdminInvoiceVerification />;
            case "payouts":
                return <UnionAdminPayoutAuthorizations />;
            case "transactions":
                return <UnionAdminTransactionReview />;
            case "audit":
                return <UnionAdminAuditLogs />;
            default:
                return renderFinance();
        }
    }

    function renderFinance() {
        const financeKpis = [
            {
                label: "Gross Receipts",
                value: financeData?.kpis.gross_receipts.display ?? "UGX 0",
                change: `${financeData?.kpis.transaction_count ?? 0} transaction(s)`,
                detail: "Total successful and pending income before failed or reversed payments.",
                tone: "positive",
            },
            {
                label: "Net Settled",
                value: financeData?.kpis.net_settled.display ?? "UGX 0",
                change: "Settled",
                detail: "Confirmed cleared funds from completed payment records.",
                tone: "positive",
            },
            {
                label: "Pending Payouts",
                value: financeData?.kpis.pending_payouts.display ?? "UGX 0",
                change: `${financeData?.kpis.payout_count ?? 0} payout item(s)`,
                detail: "Pending finance reviews, reconciliations and settlement items.",
                tone: "warning",
            },
            {
                label: "Failed / Reversed",
                value: financeData?.kpis.failed_reversed.display ?? "UGX 0",
                change: "Needs review",
                detail: "Failed, reversed or disputed payment records.",
                tone: "danger",
            },
        ];

        const monthlyTrend =
            financeData?.monthly_trend && financeData.monthly_trend.length > 0
                ? financeData.monthly_trend
                : [
                      {
                          label: "No data",
                          value: 1,
                          amount: { raw: "0.00", display: "UGX 0" },
                      },
                  ];

        const maxFinanceTrend = Math.max(
            1,
            ...monthlyTrend.map((item) => Number(item.value || 0)),
        );

        const revenueMix = financeData?.revenue_mix ?? [];
        const transactions = financeData?.recent_transactions ?? [];
        const payouts = financeData?.payout_queue ?? [];

        return (
            <section className={styles.financeDashboard}>
                <SectionHeader
                    eyebrow={`${activeWorkspace.acronym} finance`}
                    title="Finance Dashboard"
                    description="Track revenue, settlements, payouts, reconciliation items and audit activity for this union workspace."
                    actions={
                        <div className={styles.sectionActions}>
                            <button className={styles.secondaryButton} type="button">
                                Export CSV
                            </button>
                            <button className={styles.primaryButton} type="button">
                                Review Payouts
                            </button>
                        </div>
                    }
                />

                {financeError ? (
                    <div className={styles.alertBanner}>{financeError}</div>
                ) : null}

                {isLoadingFinance ? (
                    <div className={styles.alertBanner}>Loading finance data…</div>
                ) : null}

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
                                {financeData?.kpis.gross_receipts.display ?? "UGX 0"}
                            </strong>
                        </div>

                        <div className={styles.financeBarChart}>
                            {monthlyTrend.map((item) => (
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
                            ))}
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
                        <strong>{financeData?.currency ?? "UGX"}</strong>
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
                    title="Sponsor management"
                    description="Manage sponsor packages, campaigns, placements, assets, beneficiary mapping and ROI reports."
                    actions={<button className={styles.primaryButton} type="button">Create Package</button>}
                />
                <DataTable
                    columns={[
                        { key: "package", label: "Package", render: (item) => item.package },
                        { key: "inventory", label: "Inventory", render: (item) => item.inventory },
                        { key: "beneficiary", label: "Beneficiary", render: (item) => item.beneficiary },
                        { key: "status", label: "Status", render: (item) => <StatusPill label={item.status} /> },
                    ]}
                    data={[
                        { package: "League Title Sponsor", inventory: "Fixtures, standings, tickets", beneficiary: "Union", status: "Available" },
                        { package: "National Team Partner", inventory: "Team profile, matchday, banners", beneficiary: "National Teams", status: "Draft" },
                        { package: "Club Support Campaign", inventory: "Club pages and match placements", beneficiary: "Clubs", status: "Active" },
                    ]}
                />
            </section>
        );
    }

    function renderComms() {
        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Communications"
                    title="Communications centre"
                    description="Send announcements, circulars, matchday updates and targeted notifications."
                />
                <div className={styles.contentSplit}>
                    <form className={styles.formPanel}>
                        <h3>Create announcement</h3>
                        <label>
                            Audience
                            <select>
                                <option>All clubs</option>
                                <option>Club admins</option>
                                <option>Officials</option>
                                <option>Fans</option>
                                <option>Sponsors</option>
                            </select>
                        </label>
                        <label>
                            Message
                            <textarea
                                value={messageDraft}
                                onChange={(event) => setMessageDraft(event.target.value)}
                                placeholder="Write announcement"
                            />
                        </label>
                        <button className={styles.primaryButton} type="button">Send Preview</button>
                    </form>
                    <DataTable
                        columns={[
                            { key: "title", label: "Message", render: (item) => item.title },
                            { key: "audience", label: "Audience", render: (item) => item.audience },
                            { key: "status", label: "Status", render: (item) => <StatusPill label={item.status} /> },
                        ]}
                        data={[
                            { title: "Fixture change notice", audience: "Club admins", status: "Sent" },
                            { title: "Registration reminder", audience: "Clubs", status: "Draft" },
                            { title: "Matchday gate update", audience: "Ticketing officers", status: "Scheduled" },
                        ]}
                    />
                </div>
            </section>
        );
    }

    function renderUsers() {
        const userRows = workspaceUsers.length > 0
            ? workspaceUsers.map((user) => ({
                name: user.user_full_name || user.user_email,
                email: user.user_email,
                role: user.role_display,
                permissions: user.effective_permissions.length,
                status: user.is_active ? "Active" : "Inactive",
            }))
            : [
                {
                    name: "No live workspace users returned yet",
                    email: "Attach users through backend API",
                    role: activeWorkspace.roleDisplay,
                    permissions: activeWorkspace.permissions.length,
                    status: "Preview",
                },
            ];

        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Users"
                    title="Workspace users and permissions"
                    description="Invite users, assign roles, review permissions and deactivate access without adding extra dashboards."
                    actions={<button className={styles.primaryButton} type="button">Invite User</button>}
                />
                <div className={styles.contentSplit}>
                    <DataTable
                        columns={[
                            { key: "name", label: "User", render: (item) => item.name },
                            { key: "email", label: "Email", render: (item) => item.email },
                            { key: "role", label: "Role", render: (item) => item.role },
                            { key: "permissions", label: "Permissions", render: (item) => item.permissions },
                            { key: "status", label: "Status", render: (item) => <StatusPill label={item.status} /> },
                        ]}
                        data={userRows}
                    />
                    <aside className={styles.actionRail}>
                        <h3>Role templates</h3>
                        {[
                            "Registrar → Registrations only",
                            "Referee Manager → Officials and reports",
                            "Match Official → Appointments, reports, profile",
                            "Ticketing Officer → Scanner and logs",
                        ].map((item) => <p key={item}>{item}</p>)}
                    </aside>
                </div>
            </section>
        );
    }

    function renderAudit() {
        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Governance"
                    title="Audit logs"
                    description="Track sensitive workspace actions across users, finance, registrations, ticketing and settings."
                    actions={<button className={styles.secondaryButton} type="button">Export Audit</button>}
                />
                <DataTable
                    columns={[
                        { key: "time", label: "Time", render: (item) => item.time },
                        { key: "module", label: "Module", render: (item) => item.module },
                        { key: "action", label: "Action", render: (item) => item.action },
                        { key: "actor", label: "Actor", render: (item) => item.actor },
                        { key: "status", label: "Status", render: (item) => <StatusPill label={item.status} /> },
                    ]}
                    data={[
                        { time: "Today", module: "Competitions", action: "Fixture draft created", actor: "Competitions Manager", status: "Recorded" },
                        { time: "Yesterday", module: "Users", action: "Role permissions reviewed", actor: "Workspace Owner", status: "Recorded" },
                        { time: "2 days ago", module: "Registrations", action: "Player approved", actor: "Registrar", status: "Recorded" },
                    ]}
                />
            </section>
        );
    }

    function renderSettings() {
        return (
            <section className={styles.panelLarge}>
                <SectionHeader
                    eyebrow="Settings"
                    title="Workspace settings"
                    description="Manage public profile, role defaults, governance rules and module behaviour."
                />
                <div className={styles.contentSplit}>
                    <form className={styles.formPanel}>
                        <label>
                            Workspace name
                            <input defaultValue={activeWorkspace.name} />
                        </label>
                        <label>
                            Public description
                            <textarea defaultValue={activeWorkspace.description} />
                        </label>
                        <label>
                            Public profile visibility
                            <select defaultValue="public">
                                <option value="public">Public</option>
                                <option value="hidden">Hidden</option>
                            </select>
                        </label>
                        <button className={styles.primaryButton} type="button">Save Settings</button>
                    </form>
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
            case "finance": return renderFinanceSubmenuContent();
            case "sponsors": return renderSponsors();
            case "comms": return renderComms();
            case "users": return renderUsers();
            case "audit": return renderAudit();
            case "settings": return renderSettings();
            default: return renderOverview();
        }
    }


    return (
        <>
            <main className={styles.pageShell}>
            <aside className={styles.sidebar}>
                <Link className={styles.logoLink} to="/dashboard/fan">
                    <img src={logoHorizontal} alt="League OS" />
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
                    onChange={(event) => void handleWorkspaceChange(event.target.value)}
                >
                    {workspaces.map((workspace) => (
                        <option key={workspace.slug} value={workspace.slug}>
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
                                className={activeTab === tab.key ? styles.activeNavItem : ""}
                                type="button"
                                onClick={() => resetSearch(tab.key)}
                            >
                                <Icon size={17} strokeWidth={2.3} aria-hidden="true" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <button className={styles.logoutButton} type="button" onClick={handleLogout}>
                    <LogOut size={17} strokeWidth={2.3} aria-hidden="true" />
                    <span>Log out</span>
                </button>
            </aside>

            <section className={styles.contentArea}>
                <header className={styles.heroHeader}>
                    <div>
                        <span className={styles.liveBadge}>Live Workspace Access</span>
                        <h1>{getWorkspaceTitle(activeWorkspace)}</h1>
                        <p>{getWorkspaceIntro(activeWorkspace)}</p>
                    </div>
                    <div className={styles.headerActions}>
                        <Link to="/unions">View Public Page</Link>
                        <Link to="/dashboard/fan">Back to Fan Dashboard</Link>
                    </div>
                </header>

                {workspaceError ? <div className={styles.alertBanner}>{workspaceError}</div> : null}
                {workspaceDataError ? <div className={styles.alertBanner}>{workspaceDataError}</div> : null}
                {operationsError ? <div className={styles.alertBanner}>{operationsError}</div> : null}

                <StatGrid stats={activeStats} loading={isLoadingOverview} />

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
                workspaceRole={activeWorkspace.roleDisplay || formatRole(activeWorkspace.role)}
                onTabChange={(key) => resetSearch(key as TabKey)}
                onLogout={handleLogout}
            />
        </>
    );
}
