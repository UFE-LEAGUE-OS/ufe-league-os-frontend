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
    Search,
    Trophy,
    X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./MyMembershipsPage.module.css";

type MembershipStatus = "Active" | "Expired";
type MembershipTab = "active" | "expired" | "benefits";

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
    status: MembershipStatus;
    validUntil: string;
    memberSince: string;
    memberNumber: string;
    logo: string;
    tone: "purple" | "orange" | "blue" | "green";
    renewalNote: string;
    benefits: string[];
}

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
        renewalNote: "Valid for 11 more months",
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
        renewalNote: "Renewal due soon",
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
        renewalNote: "Expired membership",
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
        description: "Your receipt is available under Payments.",
        date: "12 Apr 2025",
        icon: ReceiptText,
    },
    {
        id: "activity-003",
        title: "Black Pirates membership expired",
        description: "Renew or upgrade from the club membership page.",
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

const allBenefits = activeMemberships.flatMap((membership) =>
    membership.benefits.map((benefit) => ({
        id: `${membership.id}-${benefit}`,
        benefit,
        clubName: membership.clubName,
        logo: membership.logo,
        tier: membership.tier,
    })),
);

function StatusBadge({ status }: { status: MembershipStatus }) {
    return (
        <span className={`${styles.statusBadge} ${styles[status.toLowerCase()]}`}>
            {status === "Active" ? (
                <CheckCircle2 size={14} strokeWidth={2.4} aria-hidden="true" />
            ) : (
                <AlertTriangle size={14} strokeWidth={2.4} aria-hidden="true" />
            )}
            {status}
        </span>
    );
}

function EmptyState({
    title,
    message,
    actionLabel,
    actionTo,
}: {
    title: string;
    message: string;
    actionLabel: string;
    actionTo: string;
}) {
    return (
        <section className={styles.emptyState}>
            <Crown size={42} strokeWidth={2.2} aria-hidden="true" />
            <h2>{title}</h2>
            <p>{message}</p>
            <Link to={actionTo}>{actionLabel}</Link>
        </section>
    );
}

function MembershipCard({ membership }: { membership: ClubMembership }) {
    return (
        <article className={`${styles.membershipCard} ${styles[membership.tone]}`}>
            <div className={styles.cardHeader}>
                <img src={membership.logo} alt="" aria-hidden="true" />

                <div>
                    <h3>{membership.clubName}</h3>
                    <p>{membership.sport}</p>
                </div>

                <StatusBadge status={membership.status} />
            </div>

            <div className={styles.cardTier}>
                <Crown size={34} strokeWidth={2.2} aria-hidden="true" />

                <div>
                    <strong>{membership.tier}</strong>
                    <p>Member since {membership.memberSince}</p>
                    <small>{membership.renewalNote}</small>
                </div>
            </div>

            <div className={styles.memberNumber}>
                <span>Membership Number</span>
                <strong>{membership.memberNumber}</strong>
            </div>

            <div className={styles.cardBodyGrid}>
                <div className={styles.qrBlock}>
                    <QrCode size={66} strokeWidth={2} aria-hidden="true" />
                    <span>Digital Card</span>
                </div>

                <dl>
                    <div>
                        <dt>Valid Until</dt>
                        <dd>{membership.validUntil}</dd>
                    </div>

                    <div>
                        <dt>Club Tier</dt>
                        <dd>{membership.tier}</dd>
                    </div>

                    <div>
                        <dt>Status</dt>
                        <dd>{membership.status}</dd>
                    </div>
                </dl>
            </div>

            <div className={styles.benefitList}>
                {membership.benefits.map((benefit) => (
                    <span key={benefit}>
                        <CheckCircle2 size={15} strokeWidth={2.6} aria-hidden="true" />
                        {benefit}
                    </span>
                ))}
            </div>

            <div className={styles.cardActions}>
                <button type="button">
                    <Download size={16} strokeWidth={2.4} aria-hidden="true" />
                    Download Card
                </button>

                <Link to={`/memberships/${membership.slug}`}>
                    {membership.status === "Expired" ? "Renew Membership" : "Renew / Upgrade"}
                </Link>
            </div>
        </article>
    );
}

function MyMembershipsPage() {
    const [activeTab, setActiveTab] = useState<MembershipTab>("active");
    const [searchQuery, setSearchQuery] = useState("");

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const filteredActiveMemberships = useMemo(
        () =>
            activeMemberships.filter((membership) =>
                `${membership.clubName} ${membership.tier} ${membership.sport}`
                    .toLowerCase()
                    .includes(normalizedSearchQuery),
            ),
        [normalizedSearchQuery],
    );

    const filteredExpiredMemberships = useMemo(
        () =>
            expiredMemberships.filter((membership) =>
                `${membership.clubName} ${membership.tier} ${membership.sport}`
                    .toLowerCase()
                    .includes(normalizedSearchQuery),
            ),
        [normalizedSearchQuery],
    );

    const filteredBenefits = useMemo(
        () =>
            allBenefits.filter((item) =>
                `${item.clubName} ${item.tier} ${item.benefit}`
                    .toLowerCase()
                    .includes(normalizedSearchQuery),
            ),
        [normalizedSearchQuery],
    );

    const summaryCards: SummaryCard[] = [
        {
            label: "Active Memberships",
            value: String(activeMemberships.length),
            detail: "Club memberships",
            icon: Crown,
            tone: "purple",
        },
        {
            label: "Digital Cards",
            value: String(activeMemberships.length),
            detail: "Ready for matchday",
            icon: QrCode,
            tone: "orange",
        },
        {
            label: "Saved Benefits",
            value: String(allBenefits.length),
            detail: "Available perks",
            icon: Gift,
            tone: "blue",
        },
        {
            label: "Renewals",
            value: "1",
            detail: "Needs attention",
            icon: RefreshCw,
            tone: "green",
        },
    ];

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>My Memberships</h1>
                    <p>
                        View club memberships, digital cards, benefits, renewals and
                        membership receipts.
                    </p>
                </div>

                <Link to="/memberships" className={styles.primaryHeaderAction}>
                    <Crown size={18} strokeWidth={2.4} aria-hidden="true" />
                    Explore Memberships
                </Link>
            </header>

            <section className={styles.walletHero}>
                <div>
                    <span className={styles.eyebrow}>Club Membership Wallet</span>
                    <h2>All your club benefits in one place</h2>
                    <p>
                        These are club memberships, not League OS subscriptions. Each card
                        belongs to a club and can unlock benefits, ticket discounts and
                        member-only access.
                    </p>
                </div>

                <div className={styles.heroSearch}>
                    <Search size={18} strokeWidth={2.2} aria-hidden="true" />
                    <input
                        type="search"
                        placeholder="Search club, tier or benefit..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />

                    {searchQuery ? (
                        <button
                            type="button"
                            aria-label="Clear membership search"
                            onClick={() => setSearchQuery("")}
                        >
                            <X size={17} strokeWidth={2.4} />
                        </button>
                    ) : null}
                </div>
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

            <div className={styles.tabs} aria-label="Membership sections">
                <button
                    type="button"
                    className={activeTab === "active" ? styles.activeTab : ""}
                    onClick={() => setActiveTab("active")}
                >
                    Active <span>{activeMemberships.length}</span>
                </button>

                <button
                    type="button"
                    className={activeTab === "expired" ? styles.activeTab : ""}
                    onClick={() => setActiveTab("expired")}
                >
                    Expired <span>{expiredMemberships.length}</span>
                </button>

                <button
                    type="button"
                    className={activeTab === "benefits" ? styles.activeTab : ""}
                    onClick={() => setActiveTab("benefits")}
                >
                    Benefits <span>{allBenefits.length}</span>
                </button>
            </div>

            <div className={styles.layoutGrid}>
                <main className={styles.mainColumn}>
                    {activeTab === "active" ? (
                        <section className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <h2>Active Membership Cards</h2>
                                    <p>
                                        Use these digital cards for club benefits, ticket
                                        discounts and member-only access.
                                    </p>
                                </div>

                                <Link to="/memberships">Compare Club Tiers</Link>
                            </div>

                            {filteredActiveMemberships.length > 0 ? (
                                <div className={styles.cardGrid}>
                                    {filteredActiveMemberships.map((membership) => (
                                        <MembershipCard
                                            membership={membership}
                                            key={membership.id}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="No active memberships found"
                                    message="Try another search or explore club membership tiers."
                                    actionLabel="Explore Memberships"
                                    actionTo="/memberships"
                                />
                            )}
                        </section>
                    ) : null}

                    {activeTab === "expired" ? (
                        <section className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <h2>Expired Memberships</h2>
                                    <p>
                                        Renew or upgrade expired memberships from each club page.
                                    </p>
                                </div>
                            </div>

                            {filteredExpiredMemberships.length > 0 ? (
                                <div className={styles.cardGrid}>
                                    {filteredExpiredMemberships.map((membership) => (
                                        <MembershipCard
                                            membership={membership}
                                            key={membership.id}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="No expired memberships found"
                                    message="Expired memberships will appear here after they lapse."
                                    actionLabel="Explore Memberships"
                                    actionTo="/memberships"
                                />
                            )}
                        </section>
                    ) : null}

                    {activeTab === "benefits" ? (
                        <section className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <h2>Available Benefits</h2>
                                    <p>
                                        Benefits available from your active club memberships.
                                    </p>
                                </div>

                                <Link to="/tickets">Use Ticket Benefits</Link>
                            </div>

                            {filteredBenefits.length > 0 ? (
                                <div className={styles.benefitGrid}>
                                    {filteredBenefits.map((item) => (
                                        <article className={styles.benefitCard} key={item.id}>
                                            <img src={item.logo} alt="" aria-hidden="true" />

                                            <div>
                                                <h3>{item.benefit}</h3>
                                                <p>
                                                    {item.clubName} • {item.tier}
                                                </p>
                                            </div>

                                            <span>Available</span>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="No benefits found"
                                    message="Try another search or activate a club membership."
                                    actionLabel="Explore Memberships"
                                    actionTo="/memberships"
                                />
                            )}
                        </section>
                    ) : null}

                    <section className={styles.paymentNoteCard}>
                        <ReceiptText size={24} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Need a receipt?</h2>
                            <p>
                                Membership payments and checkout references are available
                                from Payments.
                            </p>
                        </div>

                        <Link to="/profile/payments">Open Payments</Link>
                    </section>

                    <section className={`${styles.panel} ${styles.mainRecommendedMemberships}`}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Recommended Memberships</h2>
                                <p>
                                    Suggested club tiers based on your followed clubs and fan interests.
                                </p>
                            </div>

                            <Link to="/memberships">View All Memberships</Link>
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
                                            size={15}
                                            strokeWidth={2.4}
                                            aria-hidden="true"
                                        />
                                        View
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </section>
                    <section className={styles.membershipWideSponsorCard} aria-label="Sponsored membership placement">
                        <div>
                            <span>Sponsored</span>
                            <h2>Club Membership Partner Slot</h2>
                            <p>
                                Promote membership bundles, sponsor offers, club shop discounts,
                                matchday benefits or premium fan experiences here.
                            </p>
                        </div>

                        <Link to="/sponsor/apply">Explore Sponsorship Options →</Link>
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.digitalCardPreview}>
                        <span>Primary Card</span>

                        <img src={activeMemberships[0]?.logo} alt="" aria-hidden="true" />

                        <h2>{activeMemberships[0]?.clubName}</h2>
                        <p>{activeMemberships[0]?.tier}</p>

                        <div className={styles.previewQr}>
                            <QrCode size={92} strokeWidth={2.2} aria-hidden="true" />
                        </div>

                        <small>{activeMemberships[0]?.memberNumber}</small>

                        <Link to={`/memberships/${activeMemberships[0]?.slug}`}>
                            View Card Details
                        </Link>
                    </section>

                    <section className={styles.sidePanel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <CalendarDays size={25} strokeWidth={2.3} aria-hidden="true" />
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
                                                size={18}
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

                    <section className={styles.clubSupportCard}>
                        <Trophy size={46} strokeWidth={2.2} aria-hidden="true" />

                        <div>
                            <h2>Support goes to clubs</h2>
                            <p>
                                Membership payments should go to the club or its approved
                                payment account. League OS stores the fan card and benefits.
                            </p>
                        </div>

                        <Link to="/memberships">Compare Club Tiers →</Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default MyMembershipsPage;
