import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    Crown,
    Download,
    ExternalLink,
    Gift,
    QrCode,
    ReceiptText,
    RefreshCw,
    ShieldCheck,
    Star,
    Ticket,
    Trophy,
    Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./MyMembershipsPage.module.css";

interface SummaryCard {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
    tone: "purple" | "orange" | "blue" | "green";
}

interface ClubMembership {
    id: string;
    clubName: string;
    slug: string;
    tier: string;
    sport: string;
    status: "Active" | "Expired";
    validUntil: string;
    memberSince: string;
    memberNumber: string;
    logo: string;
    tone: "purple" | "orange" | "blue" | "green";
    benefits: string[];
}

const summaryCards: SummaryCard[] = [
    {
        label: "Active Memberships",
        value: "2",
        detail: "KCB KOBS and SC Villa",
        icon: Crown,
        tone: "purple",
    },
    {
        label: "Digital Cards",
        value: "2",
        detail: "Ready for matchday use",
        icon: QrCode,
        tone: "orange",
    },
    {
        label: "Saved Benefits",
        value: "8",
        detail: "Ticket discounts and rewards",
        icon: Gift,
        tone: "blue",
    },
    {
        label: "Renewals",
        value: "1",
        detail: "SC Villa due soon",
        icon: RefreshCw,
        tone: "green",
    },
];

const activeMemberships: ClubMembership[] = [
    {
        id: "kobs-gold",
        clubName: "KCB KOBS",
        slug: "kobs",
        tier: "Gold Member",
        sport: "Rugby Club",
        status: "Active",
        validUntil: "18 May 2026",
        memberSince: "18 May 2025",
        memberNumber: "KOBS-GOLD-2025-0018",
        logo: "/assets/clubs/kobs.jpg",
        tone: "purple",
        benefits: [
            "10% ticket discount",
            "Priority derby tickets",
            "Club shop discount",
            "Member-only events",
        ],
    },
    {
        id: "villa-silver",
        clubName: "SC Villa",
        slug: "sc-villa",
        tier: "Silver Member",
        sport: "Football Club",
        status: "Active",
        validUntil: "12 Aug 2025",
        memberSince: "12 Apr 2025",
        memberNumber: "SCV-SILVER-2025-0142",
        logo: "/assets/clubs/sc-villa.png",
        tone: "blue",
        benefits: [
            "Matchday ticket discount",
            "Digital membership card",
            "Club news alerts",
            "Fan events access",
        ],
    },
];

const expiredMemberships: ClubMembership[] = [
    {
        id: "pirates-bronze-expired",
        clubName: "Black Pirates",
        slug: "black-pirates",
        tier: "Bronze Member",
        sport: "Rugby Club",
        status: "Expired",
        validUntil: "08 Jan 2025",
        memberSince: "08 Jan 2024",
        memberNumber: "BP-BRONZE-2024-0027",
        logo: "/assets/clubs/black-pirates.png",
        tone: "orange",
        benefits: [
            "Digital member card",
            "Fixture alerts",
            "Club news",
            "Ticket reminders",
        ],
    },
];

const recentMembershipActivity = [
    {
        id: "activity-001",
        title: "KCB KOBS Gold Membership activated",
        description: "Your club membership payment was confirmed.",
        date: "18 May 2025",
        icon: CheckCircle2,
    },
    {
        id: "activity-002",
        title: "SC Villa Silver Membership receipt issued",
        description: "Your receipt is available under Payments & Receipts.",
        date: "12 Apr 2025",
        icon: ReceiptText,
    },
    {
        id: "activity-003",
        title: "Black Pirates membership expired",
        description: "You can renew or upgrade from the club membership detail page.",
        date: "08 Jan 2025",
        icon: AlertTriangle,
    },
];

const recommendedMemberships = [
    {
        id: "city-oilers",
        clubName: "City Oilers",
        tier: "Courtside Member",
        sport: "Basketball Club",
        price: "UGX 150,000",
        slug: "city-oilers",
        logo: "/assets/clubs/city-oilers.png",
    },
    {
        id: "vipers",
        clubName: "Vipers SC",
        tier: "Fan Member",
        sport: "Football Club",
        price: "UGX 60,000",
        slug: "vipers-sc",
        logo: "/assets/clubs/vipers-sc.png",
    },
];

function MyMembershipsPage() {
    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>My Club Memberships</h1>
                    <p>
                        View your active club memberships, digital cards, member benefits,
                        renewals and receipts.
                    </p>
                </div>

                <Link to="/memberships" className={styles.primaryHeaderAction}>
                    <Crown size={18} strokeWidth={2.4} aria-hidden="true" />
                    Explore Club Memberships
                </Link>
            </header>

            <section className={styles.explainerCard}>
                <span>
                    <ShieldCheck size={34} strokeWidth={2.3} aria-hidden="true" />
                </span>

                <div>
                    <h2>These are club memberships, not League OS subscriptions</h2>
                    <p>
                        League OS helps you manage memberships purchased from clubs. Each
                        membership belongs to a specific club and has its own tier, card,
                        benefits and renewal status.
                    </p>
                </div>

                <Link to="/profile/payments">View Payments &amp; Receipts</Link>
            </section>

            <section className={styles.summaryGrid} aria-label="Membership summary">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            className={`${styles.summaryCard} ${styles[card.tone]}`}
                            key={card.label}
                        >
                            <div>
                                <p>{card.label}</p>
                                <strong>{card.value}</strong>
                                <span>{card.detail}</span>
                            </div>

                            <Icon size={38} strokeWidth={2.1} aria-hidden="true" />
                        </article>
                    );
                })}
            </section>

            <div className={styles.layoutGrid}>
                <main className={styles.mainColumn}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Active Membership Cards</h2>
                                <p>
                                    Use these digital cards for club benefits, ticket discounts
                                    and member-only access.
                                </p>
                            </div>

                            <Link to="/memberships">Compare Club Tiers</Link>
                        </div>

                        <div className={styles.cardGrid}>
                            {activeMemberships.map((membership) => (
                                <article
                                    className={`${styles.membershipCard} ${styles[membership.tone]
                                        }`}
                                    key={membership.id}
                                >
                                    <div className={styles.cardTop}>
                                        <img src={membership.logo} alt="" aria-hidden="true" />

                                        <div>
                                            <h3>{membership.clubName}</h3>
                                            <p>{membership.sport}</p>
                                        </div>

                                        <span className={styles.activeBadge}>
                                            {membership.status}
                                        </span>
                                    </div>

                                    <div className={styles.cardTier}>
                                        <Crown size={34} strokeWidth={2.2} aria-hidden="true" />

                                        <div>
                                            <strong>{membership.tier}</strong>
                                            <p>Member since {membership.memberSince}</p>
                                            <small>Valid until {membership.validUntil}</small>
                                        </div>
                                    </div>

                                    <div className={styles.memberNumber}>
                                        <span>Membership No.</span>
                                        <strong>{membership.memberNumber}</strong>
                                    </div>

                                    <div className={styles.qrBlock}>
                                        <span>
                                            <QrCode size={58} strokeWidth={1.9} aria-hidden="true" />
                                        </span>

                                        <div>
                                            <strong>Digital Membership Card</strong>
                                            <p>
                                                Show this card when claiming club benefits or member
                                                ticket discounts.
                                            </p>
                                        </div>
                                    </div>

                                    <div className={styles.benefitList}>
                                        {membership.benefits.map((benefit) => (
                                            <span key={benefit}>
                                                <CheckCircle2
                                                    size={15}
                                                    strokeWidth={2.6}
                                                    aria-hidden="true"
                                                />
                                                {benefit}
                                            </span>
                                        ))}
                                    </div>

                                    <div className={styles.cardActions}>
                                        <button type="button">
                                            <Download
                                                size={16}
                                                strokeWidth={2.4}
                                                aria-hidden="true"
                                            />
                                            Download Card
                                        </button>

                                        <Link to={`/memberships/${membership.slug}`}>
                                            Renew / Upgrade
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Expired Memberships</h2>
                                <p>
                                    Expired club memberships can be renewed or upgraded from the
                                    specific club membership page.
                                </p>
                            </div>
                        </div>

                        <div className={styles.expiredList}>
                            {expiredMemberships.map((membership) => (
                                <article className={styles.expiredItem} key={membership.id}>
                                    <img src={membership.logo} alt="" aria-hidden="true" />

                                    <div>
                                        <h3>{membership.clubName}</h3>
                                        <p>
                                            {membership.tier} • Expired on {membership.validUntil}
                                        </p>
                                        <small>{membership.memberNumber}</small>
                                    </div>

                                    <span className={styles.expiredBadge}>
                                        {membership.status}
                                    </span>

                                    <Link to={`/memberships/${membership.slug}`}>Renew</Link>
                                </article>
                            ))}
                        </div>
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <Gift size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Available Benefits</h2>
                                <p>Benefits from your active club memberships.</p>
                            </div>
                        </div>

                        <div className={styles.benefitSummary}>
                            <span>
                                <Ticket size={16} strokeWidth={2.4} aria-hidden="true" />
                                10% KOBS ticket discount
                            </span>
                            <span>
                                <Star size={16} strokeWidth={2.4} aria-hidden="true" />
                                Priority derby tickets
                            </span>
                            <span>
                                <Users size={16} strokeWidth={2.4} aria-hidden="true" />
                                Member-only club events
                            </span>
                            <span>
                                <Trophy size={16} strokeWidth={2.4} aria-hidden="true" />
                                SC Villa fan events
                            </span>
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <CalendarDays size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Membership Activity</h2>
                                <p>Recent membership and receipt updates.</p>
                            </div>
                        </div>

                        <div className={styles.activityList}>
                            {recentMembershipActivity.map((activity) => {
                                const ActivityIcon = activity.icon;

                                return (
                                    <article className={styles.activityItem} key={activity.id}>
                                        <span>
                                            <ActivityIcon
                                                size={19}
                                                strokeWidth={2.4}
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <div>
                                            <h3>{activity.title}</h3>
                                            <p>{activity.description}</p>
                                            <small>{activity.date}</small>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <Crown size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Recommended Memberships</h2>
                                <p>Suggested club tiers based on your followed clubs.</p>
                            </div>
                        </div>

                        <div className={styles.recommendedList}>
                            {recommendedMemberships.map((membership) => (
                                <article
                                    className={styles.recommendedItem}
                                    key={membership.id}
                                >
                                    <img src={membership.logo} alt="" aria-hidden="true" />

                                    <div>
                                        <h3>{membership.clubName}</h3>
                                        <p>
                                            {membership.tier} • {membership.sport}
                                        </p>
                                        <strong>{membership.price}</strong>
                                    </div>

                                    <Link to={`/memberships/${membership.slug}`}>
                                        <ExternalLink
                                            size={16}
                                            strokeWidth={2.4}
                                            aria-hidden="true"
                                        />
                                        View
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className={styles.warningCard}>
                        <ReceiptText size={42} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Need a receipt?</h2>
                            <p>
                                Club membership payments and Flutterwave checkout references are
                                available from Payments & Receipts.
                            </p>
                        </div>

                        <Link to="/profile/payments">Open Payments &amp; Receipts</Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default MyMembershipsPage;