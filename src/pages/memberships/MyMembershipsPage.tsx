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
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    getMembershipPayments,
    getMyMemberships,
    type BackendMembershipCard,
    type BackendMembershipPayment,
    type BackendMembershipSubscription,
} from "../../services/fanMembershipService";
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
    subscriptionId: number;
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

const expiredMemberships: ClubMembership[] = [];

const ACTIVE_MEMBERSHIPS_PER_PAGE = 2;

interface MembershipActivity {
    id: string;
    title: string;
    description: string;
    date: string;
    icon: LucideIcon;
}

const emptyPrimaryMembership: ClubMembership = {
    id: "empty-membership",
    subscriptionId: 0,
    clubName: "No active membership",
    slug: "memberships",
    tier: "Explore Club Memberships",
    sport: "Club Membership",
    status: "Expired",
    validUntil: "Not active",
    memberSince: "Not active",
    memberNumber: "Card pending",
    logo: "",
    tone: "purple",
    renewalNote: "Join a club membership to activate your digital card.",
    benefits: ["Digital membership card", "Club benefits", "Ticket discounts"],
};

function formatBackendDate(value?: string | null) {
    if (!value) {
        return "Date pending";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date pending";
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function makeSlug(value: string) {
    return value
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function normalizeTier(value?: string) {
    if (!value) {
        return "Member";
    }

    return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()} Member`;
}

function getTierBenefits(tier?: string) {
    const normalizedTier = tier?.toUpperCase();

    if (normalizedTier === "GOLD" || normalizedTier === "PLATINUM") {
        return [
            "10% ticket discount",
            "Priority derby tickets",
            "Club shop discount",
            "Member-only events",
        ];
    }

    if (normalizedTier === "SILVER") {
        return [
            "Matchday ticket discount",
            "Digital membership card",
            "Club news alerts",
            "Fan events access",
        ];
    }

    return [
        "Digital membership card",
        "Fixture alerts",
        "Club news",
        "Ticket reminders",
    ];
}

function getMembershipTone(tier?: string): ClubMembership["tone"] {
    const normalizedTier = tier?.toUpperCase();

    if (normalizedTier === "GOLD" || normalizedTier === "PLATINUM") {
        return "purple";
    }

    if (normalizedTier === "SILVER") {
        return "blue";
    }

    if (normalizedTier === "BASIC") {
        return "green";
    }

    return "orange";
}

function buildRenewalNote(validUntil?: string | null) {
    if (!validUntil) {
        return "Renewal date pending";
    }

    const endDate = new Date(validUntil);

    if (Number.isNaN(endDate.getTime())) {
        return "Renewal date pending";
    }

    const differenceMs = endDate.getTime() - Date.now();
    const daysRemaining = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
        return "Expired membership";
    }

    if (daysRemaining <= 30) {
        return "Renewal due soon";
    }

    return `Valid for ${daysRemaining} more days`;
}

function mapBackendMembershipStatus(status: string): MembershipStatus {
    return status.toUpperCase() === "ACTIVE" ? "Active" : "Expired";
}

function mapBackendMembership(
    subscription: BackendMembershipSubscription,
    card?: BackendMembershipCard | null,
): ClubMembership {
    const activeCard = card ?? subscription.card ?? null;
    const tierSource = activeCard?.tier || subscription.plan_name;
    const validUntil = activeCard?.valid_until || subscription.ends_at;
    const memberSince = activeCard?.valid_from || subscription.starts_at || subscription.created_at;

    return {
        id: String(subscription.id),
        subscriptionId: subscription.id,
        clubName: subscription.club_name || activeCard?.club_name || "Club Membership",
        slug: subscription.club_slug || makeSlug(subscription.club_name || activeCard?.club_name || "club-membership"),
        tier: normalizeTier(tierSource),
        sport: "Club Membership",
        status: mapBackendMembershipStatus(subscription.status),
        validUntil: formatBackendDate(validUntil),
        memberSince: formatBackendDate(memberSince),
        memberNumber: activeCard?.card_number || `MEMBERSHIP-${subscription.id}`,
        logo: subscription.club_logo_url || "",
        tone: getMembershipTone(activeCard?.tier || subscription.plan_name),
        renewalNote: buildRenewalNote(validUntil),
        benefits: getTierBenefits(activeCard?.tier || subscription.plan_name),
    };
}

function buildClubInitials(name: string) {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "LO"
    );
}

function buildBenefits(memberships: ClubMembership[]) {
    return memberships.flatMap((membership) =>
        membership.benefits.map((benefit) => ({
            id: `${membership.id}-${benefit}`,
            benefit,
            clubName: membership.clubName,
            logo: membership.logo,
            tier: membership.tier,
        })),
    );
}

function buildRecentActivity(
    memberships: ClubMembership[],
    payments: BackendMembershipPayment[],
): MembershipActivity[] {
    const membershipActivity = memberships.map((membership) => ({
        id: `membership-${membership.id}`,
        title: `${membership.clubName} ${membership.tier} active`,
        description: "Your backend membership subscription is active.",
        date: membership.memberSince,
        icon: CheckCircle2,
    }));

    const paymentActivity = payments.slice(0, 3).map((payment) => ({
        id: `payment-${payment.id}`,
        title: "Membership payment confirmed",
        description: payment.transaction_reference || "Membership payment record",
        date: formatBackendDate(payment.paid_at || payment.created_at),
        icon: ReceiptText,
    }));

    return [...membershipActivity, ...paymentActivity];
}

function ClubLogoMark({
    logo,
    name,
}: {
    logo: string;
    name: string;
}) {
    return logo ? (
        <img src={logo} alt="" aria-hidden="true" />
    ) : (
        <span className={styles.clubInitials}>{buildClubInitials(name)}</span>
    );
}

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
                <ClubLogoMark logo={membership.logo} name={membership.clubName} />

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
    const [activeMemberships, setActiveMemberships] = useState<ClubMembership[]>([]);
    const [activeMembershipPage, setActiveMembershipPage] = useState(1);
    const [membershipPayments, setMembershipPayments] = useState<BackendMembershipPayment[]>([]);
    const [isLoadingMemberships, setIsLoadingMemberships] = useState(true);
    const [membershipError, setMembershipError] = useState("");

    async function loadMemberships() {
        setIsLoadingMemberships(true);
        setMembershipError("");

        try {
            const subscriptions = await getMyMemberships();
            const activeSubscriptions = subscriptions.filter(
                (subscription) => subscription.status.toUpperCase() === "ACTIVE",
            );
            const payments = await getMembershipPayments();

            setActiveMemberships(
                activeSubscriptions.map((subscription) =>
                    mapBackendMembership(subscription, subscription.card ?? null),
                ),
            );
            setMembershipPayments(payments);
        } catch {
            setActiveMemberships([]);
            setMembershipPayments([]);
            setMembershipError(
                "We could not load your backend membership. Confirm the backend is running and you are logged in.",
            );
        } finally {
            setIsLoadingMemberships(false);
        }
    }

    useEffect(() => {
        void loadMemberships();
    }, []);

    const allBenefits = useMemo(
        () => buildBenefits(activeMemberships),
        [activeMemberships],
    );

    const recentMembershipActivity = useMemo(
        () => buildRecentActivity(activeMemberships, membershipPayments),
        [activeMemberships, membershipPayments],
    );

    const primaryMembership = activeMemberships[0] ?? emptyPrimaryMembership;
    const hasActiveMemberships = activeMemberships.length > 0;

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const filteredActiveMemberships = useMemo(
        () =>
            activeMemberships.filter((membership) =>
                `${membership.clubName} ${membership.tier} ${membership.sport}`
                    .toLowerCase()
                    .includes(normalizedSearchQuery),
            ),
        [activeMemberships, normalizedSearchQuery],
    );

    const activeMembershipPageCount = Math.max(
        1,
        Math.ceil(filteredActiveMemberships.length / ACTIVE_MEMBERSHIPS_PER_PAGE),
    );

    const paginatedActiveMemberships = useMemo(() => {
        const startIndex = (activeMembershipPage - 1) * ACTIVE_MEMBERSHIPS_PER_PAGE;

        return filteredActiveMemberships.slice(
            startIndex,
            startIndex + ACTIVE_MEMBERSHIPS_PER_PAGE,
        );
    }, [activeMembershipPage, filteredActiveMemberships]);

    useEffect(() => {
        setActiveMembershipPage(1);
    }, [normalizedSearchQuery]);

    useEffect(() => {
        if (activeMembershipPage > activeMembershipPageCount) {
            setActiveMembershipPage(activeMembershipPageCount);
        }
    }, [activeMembershipPage, activeMembershipPageCount]);

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
        [allBenefits, normalizedSearchQuery],
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
            value: String(
                activeMemberships.filter((membership) =>
                    membership.renewalNote.toLowerCase().includes("renewal due"),
                ).length,
            ),
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

            {isLoadingMemberships || membershipError ? (
                <section className={styles.membershipSyncMessage}>
                    <RefreshCw size={19} strokeWidth={2.4} aria-hidden="true" />

                    <div>
                        <h2>
                            {isLoadingMemberships
                                ? "Loading backend memberships"
                                : "Membership sync issue"}
                        </h2>
                        <p>
                            {isLoadingMemberships
                                ? "Checking your active club membership and digital card."
                                : membershipError}
                        </p>
                    </div>

                    {!isLoadingMemberships ? (
                        <button type="button" onClick={loadMemberships}>
                            Retry
                        </button>
                    ) : null}
                </section>
            ) : null}

            {!isLoadingMemberships && !membershipError && !hasActiveMemberships ? (
                <section className={styles.membershipEmptyBanner}>
                    <div className={styles.membershipEmptyIcon}>
                        <Crown size={34} strokeWidth={2.3} aria-hidden="true" />
                    </div>

                    <div>
                        <span>No active club membership</span>
                        <h2>Your membership wallet is ready</h2>
                        <p>
                            Join a club membership to activate your digital card, benefits,
                            ticket discounts and renewal reminders.
                        </p>
                    </div>

                    <Link to="/memberships">Explore Memberships</Link>
                </section>
            ) : null}

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
                                <>
                                    <div className={styles.cardGrid}>
                                        {paginatedActiveMemberships.map((membership) => (
                                            <MembershipCard
                                                membership={membership}
                                                key={membership.id}
                                            />
                                        ))}
                                    </div>

                                    {activeMembershipPageCount > 1 ? (
                                        <div className={styles.membershipPagination}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveMembershipPage((pageNumber) =>
                                                        Math.max(1, pageNumber - 1),
                                                    )
                                                }
                                                disabled={activeMembershipPage === 1}
                                            >
                                                Previous
                                            </button>

                                            <div>
                                                {Array.from(
                                                    { length: activeMembershipPageCount },
                                                    (_, index) => index + 1,
                                                ).map((pageNumber) => (
                                                    <button
                                                        type="button"
                                                        key={pageNumber}
                                                        className={
                                                            pageNumber === activeMembershipPage
                                                                ? styles.activeMembershipPage
                                                                : ""
                                                        }
                                                        onClick={() =>
                                                            setActiveMembershipPage(pageNumber)
                                                        }
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveMembershipPage((pageNumber) =>
                                                        Math.min(
                                                            activeMembershipPageCount,
                                                            pageNumber + 1,
                                                        ),
                                                    )
                                                }
                                                disabled={
                                                    activeMembershipPage ===
                                                    activeMembershipPageCount
                                                }
                                            >
                                                Next
                                            </button>
                                        </div>
                                    ) : null}
                                </>
                            ) : (
                                <EmptyState
                                    title={
                                        hasActiveMemberships
                                            ? "No active memberships found"
                                            : "No active memberships yet"
                                    }
                                    message={
                                        hasActiveMemberships
                                            ? "Try another search or explore club membership tiers."
                                            : "Join a club membership to activate your digital card and benefits."
                                    }
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
                                            <ClubLogoMark logo={item.logo} name={item.clubName} />

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
                                    title={
                                        hasActiveMemberships
                                            ? "No benefits found"
                                            : "No membership benefits yet"
                                    }
                                    message={
                                        hasActiveMemberships
                                            ? "Try another search or activate another club membership."
                                            : "Membership benefits will appear after you activate a club membership."
                                    }
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

                        <ClubLogoMark
                            logo={primaryMembership.logo}
                            name={primaryMembership.clubName}
                        />

                        <h2>{primaryMembership.clubName}</h2>
                        <p>{primaryMembership.tier}</p>

                        <div className={styles.previewQr}>
                            <QrCode size={92} strokeWidth={2.2} aria-hidden="true" />
                        </div>

                        <small>{primaryMembership.memberNumber}</small>

                        <button type="button" onClick={() => setActiveTab("active")}>
                            View Card Details
                        </button>
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
