import {
    ArrowRight,
    BadgeCheck,
    Building2,
    CalendarClock,
    ClipboardCheck,
    DollarSign,
    Layers3,
    ShieldAlert,
    Trophy,
    Users,
    Workflow,
    type LucideIcon,
} from "lucide-react";

import type {
    UnionDashboardSummary,
    UnionWorkspacePermission,
} from "../../services/unionAdminService";
import styles from "./UnionOverviewScreen.module.css";

type OverviewTab =
    | "competitions"
    | "clubs"
    | "registrations"
    | "playersTransfers"
    | "nationalTeams"
    | "matchOfficials"
    | "finance"
    | "users"
    | "comms";

interface Indicator {
    label: string;
    value: string | number;
    detail: string;
    icon: LucideIcon;
}

interface QuickAction {
    tab: OverviewTab;
    title: string;
    description: string;
    icon: LucideIcon;
}

export interface UnionOverviewScreenProps {
    workspaceName: string;
    workspaceAcronym: string;
    workspaceSport: string;
    workspaceRoleLabel: string;
    permissions: UnionWorkspacePermission[];
    summary: UnionDashboardSummary;
    workspaceUserCount: number;
    grossReceipts?: string;
    pendingPayouts?: string;
    onNavigate: (tab: OverviewTab) => void;
}

function hasAnyPermission(
    permissions: UnionWorkspacePermission[],
    required: UnionWorkspacePermission[],
) {
    return required.some((permission) => permissions.includes(permission));
}

export default function UnionOverviewScreen({
    workspaceName,
    workspaceAcronym,
    workspaceSport,
    workspaceRoleLabel,
    permissions,
    summary,
    workspaceUserCount,
    grossReceipts,
    pendingPayouts,
    onNavigate,
}: UnionOverviewScreenProps) {
    const indicators: Indicator[] = [
        {
            label: "Competitions",
            value: summary.active_competitions ?? 0,
            detail: "Active and maintained records",
            icon: Trophy,
        },
        {
            label: "Member Clubs",
            value: summary.member_clubs ?? 0,
            detail: "Affiliated workspace clubs",
            icon: Building2,
        },
        {
            label: "Approvals",
            value: summary.pending_approvals ?? 0,
            detail: "Items awaiting review",
            icon: ClipboardCheck,
        },
        {
            label: "Officials",
            value: summary.referees ?? 0,
            detail: "Maintained official pool",
            icon: BadgeCheck,
        },
        {
            label: "National Teams",
            value: summary.national_teams ?? 0,
            detail: "Representative teams",
            icon: Users,
        },
        {
            label: "Upcoming Matches",
            value: summary.upcoming_matches ?? 0,
            detail: "Fixtures requiring readiness",
            icon: CalendarClock,
        },
    ];

    const actions: QuickAction[] = [];

    if (permissions.includes("union.competitions.manage")) {
        actions.push({
            tab: "competitions",
            title: "Manage competitions",
            description:
                "Create competitions, add seasons, manage club entries and prepare fixtures.",
            icon: Trophy,
        });
    }

    if (permissions.includes("union.clubs.manage")) {
        actions.push({
            tab: "clubs",
            title: "Review club governance",
            description:
                "Inspect affiliations, participation readiness and club records.",
            icon: Building2,
        });
    }

    if (
        hasAnyPermission(permissions, [
            "union.registrations.view",
            "union.registrations.manage",
            "union.players.approve",
        ])
    ) {
        actions.push({
            tab: "registrations",
            title: "Process registrations",
            description:
                "Review registration applications, evidence and approval decisions.",
            icon: ClipboardCheck,
        });
    }

    if (
        hasAnyPermission(permissions, [
            "union.players.view",
            "union.players.approve",
            "union.transfers.view",
            "union.transfers.approve",
        ])
    ) {
        actions.push({
            tab: "playersTransfers",
            title: "Players & transfers",
            description:
                "Review player identities, eligibility and transfer activity.",
            icon: Workflow,
        });
    }

    if (
        hasAnyPermission(permissions, [
            "union.referees.manage",
            "union.official.appointments.view",
            "union.official.availability.manage",
            "union.official.reports.manage",
        ])
    ) {
        actions.push({
            tab: "matchOfficials",
            title: "Check official readiness",
            description:
                "Monitor appointments, certification, availability and reporting.",
            icon: BadgeCheck,
        });
    }

    if (permissions.includes("union.teams.manage")) {
        actions.push({
            tab: "nationalTeams",
            title: "Manage national teams",
            description:
                "Review representative teams, squads and operational readiness.",
            icon: Users,
        });
    }

    return (
        <div className={styles.screen}>
            <header className={styles.heroPanel}>
                <div className={styles.heroTop}>
                    <div className={styles.heroIdentity}>
                        <div className={styles.heroMeta}>
                            <span className={styles.heroBadge}>
                                <Layers3 size={14} aria-hidden="true" />
                                Workspace command centre
                            </span>

                            <span className={styles.heroContext}>
                                {workspaceAcronym} · {workspaceSport} ·{" "}
                                {workspaceRoleLabel}
                            </span>
                        </div>

                        <h1>{workspaceName}</h1>

                        <p>
                            Monitor competition delivery, club governance,
                            registrations, match officials and the priority work
                            requiring attention across this workspace.
                        </p>
                    </div>

                    <div className={styles.headerActionRow}>
                        <button
                            type="button"
                            className={styles.headerButton}
                            onClick={() => onNavigate("competitions")}
                        >
                            Open competitions
                            <ArrowRight size={15} aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <section
                    className={styles.indicatorGrid}
                    aria-label="Key workspace indicators"
                >
                    {indicators.map((indicator) => {
                        const Icon = indicator.icon;

                        return (
                            <article
                                key={indicator.label}
                                className={styles.indicatorCard}
                            >
                                <div className={styles.indicatorIcon}>
                                    <Icon size={18} aria-hidden="true" />
                                </div>

                                <div className={styles.indicatorText}>
                                    <span>{indicator.label}</span>
                                    <strong>{indicator.value}</strong>
                                    <small>{indicator.detail}</small>
                                </div>
                            </article>
                        );
                    })}
                </section>
            </header>

            <div className={styles.mainGrid}>
                <section className={styles.panel}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <span>Quick actions</span>
                            <h2>Continue workspace management</h2>
                            <p>
                                Open the modules most likely to require operational
                                attention.
                            </p>
                        </div>
                    </div>

                    <div className={styles.quickActionGrid}>
                        {actions.slice(0, 6).map((action) => {
                            const Icon = action.icon;

                            return (
                                <button
                                    key={action.title}
                                    type="button"
                                    className={styles.actionCard}
                                    onClick={() => onNavigate(action.tab)}
                                >
                                    <div className={styles.actionIcon}>
                                        <Icon size={18} aria-hidden="true" />
                                    </div>

                                    <div className={styles.actionCopy}>
                                        <strong>{action.title}</strong>
                                        <p>{action.description}</p>
                                    </div>

                                    <ArrowRight size={16} aria-hidden="true" />
                                </button>
                            );
                        })}
                    </div>
                </section>

                <aside className={styles.panel}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <span>Priority inbox</span>
                            <h2>Attention required</h2>
                            <p>
                                A short summary of items that may need action today.
                            </p>
                        </div>
                    </div>

                    <div className={styles.priorityList}>
                        <article className={styles.priorityItem}>
                            <div className={styles.priorityIcon}>
                                <ShieldAlert size={17} aria-hidden="true" />
                            </div>

                            <div>
                                <strong>
                                    {summary.pending_approvals ?? 0} approvals
                                    pending
                                </strong>
                                <p>
                                    Registration and governance decisions are awaiting
                                    review.
                                </p>
                            </div>
                        </article>

                        <article className={styles.priorityItem}>
                            <div className={styles.priorityIcon}>
                                <CalendarClock size={17} aria-hidden="true" />
                            </div>

                            <div>
                                <strong>
                                    {summary.upcoming_matches ?? 0} upcoming matches
                                </strong>
                                <p>
                                    Review appointments, venues and matchday readiness.
                                </p>
                            </div>
                        </article>

                        <article className={styles.priorityItem}>
                            <div className={styles.priorityIcon}>
                                <BadgeCheck size={17} aria-hidden="true" />
                            </div>

                            <div>
                                <strong>
                                    {summary.referees ?? 0} officials in the pool
                                </strong>
                                <p>
                                    Confirm appointment coverage and document validity.
                                </p>
                            </div>
                        </article>
                    </div>
                </aside>

                <section className={styles.panel}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <span>Finance snapshot</span>
                            <h2>Workspace finance</h2>
                        </div>
                    </div>

                    <div className={styles.financeSummary}>
                        <article className={styles.financeRow}>
                            <div>
                                <DollarSign size={18} aria-hidden="true" />
                                <span>Gross receipts</span>
                            </div>
                            <strong>{grossReceipts ?? "Not loaded"}</strong>
                        </article>

                        <article className={styles.financeRow}>
                            <div>
                                <ClipboardCheck size={18} aria-hidden="true" />
                                <span>Pending payouts</span>
                            </div>
                            <strong>{pendingPayouts ?? "Not loaded"}</strong>
                        </article>

                        <article className={styles.financeRow}>
                            <div>
                                <Users size={18} aria-hidden="true" />
                                <span>Workspace users</span>
                            </div>
                            <strong>{workspaceUserCount}</strong>
                        </article>
                    </div>

                    <button
                        type="button"
                        className={styles.headerButton}
                        onClick={() => onNavigate("finance")}
                    >
                        Open finance
                        <ArrowRight size={15} aria-hidden="true" />
                    </button>
                </section>

                <section className={styles.panel}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <span>Management paths</span>
                            <h2>Recommended next steps</h2>
                        </div>
                    </div>

                    <div className={styles.linkStack}>
                        <button
                            type="button"
                            className={styles.linkRow}
                            onClick={() => onNavigate("competitions")}
                        >
                            <span>
                                <strong>Competition setup</strong>
                                <small>
                                    Create competitions, seasons and delivery plans.
                                </small>
                            </span>
                            <ArrowRight size={15} aria-hidden="true" />
                        </button>

                        <button
                            type="button"
                            className={styles.linkRow}
                            onClick={() => onNavigate("playersTransfers")}
                        >
                            <span>
                                <strong>Players & transfers</strong>
                                <small>
                                    Review identity, eligibility and transfer decisions.
                                </small>
                            </span>
                            <ArrowRight size={15} aria-hidden="true" />
                        </button>

                        <button
                            type="button"
                            className={styles.linkRow}
                            onClick={() => onNavigate("users")}
                        >
                            <span>
                                <strong>Users & access</strong>
                                <small>
                                    Manage workspace roles and permission assignments.
                                </small>
                            </span>
                            <ArrowRight size={15} aria-hidden="true" />
                        </button>

                        <button
                            type="button"
                            className={styles.linkRow}
                            onClick={() => onNavigate("comms")}
                        >
                            <span>
                                <strong>Communications</strong>
                                <small>
                                    Share updates with clubs, officials and stakeholders.
                                </small>
                            </span>
                            <ArrowRight size={15} aria-hidden="true" />
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
