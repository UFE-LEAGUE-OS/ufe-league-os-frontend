import {
    CalendarDays,
    CheckCircle2,
    Crown,
    Heart,
    Search,
    ShieldCheck,
    Star,
    Ticket,
    Trophy,
    Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useBackendClubs } from "../../hooks/useBackendClubs";
import styles from "./ExploreMembershipsPage.module.css";

interface MembershipPlan {
    id: string;
    clubName: string;
    slug: string;
    sport: "Rugby" | "Football" | "Basketball";
    tier: string;
    price: string;
    billing: string;
    logo: string;
    description: string;
    memberCount: string;
    popular: boolean;
    tone: "purple" | "orange" | "blue" | "green";
    benefits: string[];
}

interface SummaryCard {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
    tone: "purple" | "orange" | "blue" | "green";
}

const summaryCards: SummaryCard[] = [
    {
        label: "Club Memberships",
        value: "24",
        detail: "Across rugby, football and basketball",
        icon: Crown,
        tone: "purple",
    },
    {
        label: "Active Clubs",
        value: "16",
        detail: "With supporter membership tiers",
        icon: ShieldCheck,
        tone: "orange",
    },
    {
        label: "Fan Benefits",
        value: "80+",
        detail: "Tickets, rewards and events",
        icon: Star,
        tone: "blue",
    },
    {
        label: "My Memberships",
        value: "2",
        detail: "KCB KOBS and SC Villa",
        icon: Users,
        tone: "green",
    },
];

const membershipPlans: MembershipPlan[] = [
    {
        id: "kobs-gold",
        clubName: "KCB KOBS",
        slug: "kobs",
        sport: "Rugby",
        tier: "Gold Member",
        price: "UGX 120,000",
        billing: "per season",
        logo: "/assets/clubs/kobs.jpg",
        description:
            "Premium supporter membership for KCB KOBS fans who want priority access and club benefits.",
        memberCount: "1,240 members",
        popular: true,
        tone: "purple",
        benefits: [
            "10% ticket discount",
            "Priority derby tickets",
            "Digital membership card",
            "Member-only club events",
        ],
    },
    {
        id: "villa-silver",
        clubName: "SC Villa",
        slug: "sc-villa",
        sport: "Football",
        tier: "Silver Member",
        price: "UGX 80,000",
        billing: "per season",
        logo: "/assets/clubs/sc-villa.png",
        description:
            "Support SC Villa and unlock matchday benefits, club news and supporter rewards.",
        memberCount: "3,840 members",
        popular: true,
        tone: "blue",
        benefits: [
            "Matchday ticket discount",
            "Digital membership card",
            "Club news alerts",
            "Fan event access",
        ],
    },
    {
        id: "oilers-courtside",
        clubName: "City Oilers",
        slug: "city-oilers",
        sport: "Basketball",
        tier: "Courtside Member",
        price: "UGX 150,000",
        billing: "per season",
        logo: "/assets/clubs/city-oilers.png",
        description:
            "Basketball membership for fans who want closer access to City Oilers matchday experiences.",
        memberCount: "780 members",
        popular: false,
        tone: "orange",
        benefits: [
            "Priority NBL tickets",
            "Courtside event access",
            "Club merchandise offers",
            "Member reward points",
        ],
    },
    {
        id: "vipers-fan",
        clubName: "Vipers SC",
        slug: "vipers-sc",
        sport: "Football",
        tier: "Fan Member",
        price: "UGX 60,000",
        billing: "per season",
        logo: "/assets/clubs/vipers-sc.png",
        description:
            "Entry supporter membership for Vipers fans who want official club updates and benefits.",
        memberCount: "2,910 members",
        popular: false,
        tone: "green",
        benefits: [
            "Club alerts",
            "Ticket reminders",
            "Digital fan card",
            "Sponsor offers",
        ],
    },
    {
        id: "pirates-bronze",
        clubName: "Black Pirates",
        slug: "black-pirates",
        sport: "Rugby",
        tier: "Bronze Member",
        price: "UGX 50,000",
        billing: "per season",
        logo: "/assets/clubs/black-pirates.png",
        description:
            "Starter club membership for Black Pirates supporters following rugby fixtures and benefits.",
        memberCount: "940 members",
        popular: false,
        tone: "purple",
        benefits: [
            "Digital member card",
            "Fixture alerts",
            "Club news",
            "Ticket reminders",
        ],
    },
    {
        id: "kcca-family",
        clubName: "KCCA FC",
        slug: "kcca-fc",
        sport: "Football",
        tier: "Family Member",
        price: "UGX 100,000",
        billing: "per season",
        logo: "/assets/clubs/kcca-fc.png",
        description:
            "Family-focused club membership for KCCA FC supporters attending matches together.",
        memberCount: "2,150 members",
        popular: false,
        tone: "blue",
        benefits: [
            "Family ticket offers",
            "Club news",
            "Digital cards",
            "Match reminders",
        ],
    },
];

const sportFilters = ["All", "Rugby", "Football", "Basketball"];

function ExploreMembershipsPage() {
    const [selectedSport, setSelectedSport] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const { clubs: backendClubs, isLoading: clubsLoading, errorMessage: clubsErrorMessage } = useBackendClubs();

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const membershipPlansWithBackendNames = useMemo(() => {
        return membershipPlans.map((plan) => {
            const backendClub = backendClubs.find((club) => club.slug === plan.slug);

            return backendClub ? { ...plan, clubName: backendClub.name } : plan;
        });
    }, [backendClubs]);

    const filteredPlans = useMemo(() => {
        return membershipPlansWithBackendNames.filter((plan) => {
            const matchesSport =
                selectedSport === "All" || plan.sport === selectedSport;

            const searchableText = `${plan.clubName} ${plan.sport} ${plan.tier} ${plan.description}`;
            const matchesSearch =
                !normalizedSearchQuery ||
                searchableText.toLowerCase().includes(normalizedSearchQuery);

            return matchesSport && matchesSearch;
        });
    }, [membershipPlansWithBackendNames, normalizedSearchQuery, selectedSport]);

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Explore Club Memberships</h1>
                    <p>
                        Become a member of your favourite clubs, unlock club-specific
                        benefits and manage your memberships through League OS.
                    </p>
                </div>

                <Link to="/dashboard/memberships" className={styles.primaryHeaderAction}>
                    <Crown size={18} strokeWidth={2.4} aria-hidden="true" />
                    My Memberships
                </Link>
            </header>

            <section className={styles.heroCard}>
                <span>
                    <Trophy size={38} strokeWidth={2.3} aria-hidden="true" />
                </span>

                <div>
                    <h2>Club memberships are owned by clubs</h2>
                    <p>
                        League OS helps fans discover membership tiers, pay securely through
                        checkout, receive digital membership cards and access club benefits.
                    </p>
                </div>

                <Link to="/profile/payments">View Payments &amp; Receipts</Link>
            </section>

            <p className={styles.backendNotice}>
                {clubsLoading
                    ? "Syncing clubs from the League OS backend..."
                    : clubsErrorMessage || `${backendClubs.length} clubs loaded from the backend club directory.`}
            </p>

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
                    <section className={styles.filterPanel}>
                        <div className={styles.searchBox}>
                            <Search size={20} strokeWidth={2.3} aria-hidden="true" />

                            <input
                                type="search"
                                placeholder="Search by club, sport or membership tier..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>

                        <div className={styles.filterButtons}>
                            {sportFilters.map((sport) => (
                                <button
                                    type="button"
                                    className={selectedSport === sport ? styles.activeFilter : ""}
                                    key={sport}
                                    onClick={() => setSelectedSport(sport)}
                                >
                                    {sport}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className={styles.membershipGrid}>
                        {filteredPlans.map((plan) => (
                            <article
                                className={`${styles.membershipCard} ${styles[plan.tone]}`}
                                key={plan.id}
                            >
                                {plan.popular ? (
                                    <span className={styles.popularBadge}>
                                        <Star size={14} strokeWidth={2.7} aria-hidden="true" />
                                        Popular
                                    </span>
                                ) : null}

                                <div className={styles.clubHeader}>
                                    <img src={plan.logo} alt="" aria-hidden="true" />

                                    <div>
                                        <h2>{plan.clubName}</h2>
                                        <p>{plan.sport} Club</p>
                                    </div>
                                </div>

                                <div className={styles.tierBlock}>
                                    <Crown size={30} strokeWidth={2.2} aria-hidden="true" />

                                    <div>
                                        <strong>{plan.tier}</strong>
                                        <p>
                                            {plan.price} <span>{plan.billing}</span>
                                        </p>
                                        <small>{plan.memberCount}</small>
                                    </div>
                                </div>

                                <p className={styles.description}>{plan.description}</p>

                                <div className={styles.benefitList}>
                                    {plan.benefits.map((benefit) => (
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
                                    <Link to={`/memberships/${plan.slug}`}>View Details</Link>
                                    <Link to={`/memberships/${plan.slug}`}>Join Club</Link>
                                </div>
                            </article>
                        ))}
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <ShieldCheck size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>How it works</h2>
                                <p>Simple fan journey from club selection to membership card.</p>
                            </div>
                        </div>

                        <div className={styles.stepsList}>
                            <article>
                                <strong>1</strong>
                                <div>
                                    <h3>Choose a club</h3>
                                    <p>Select a club and membership tier.</p>
                                </div>
                            </article>

                            <article>
                                <strong>2</strong>
                                <div>
                                    <h3>Checkout securely</h3>
                                    <p>Payment method selection happens during checkout.</p>
                                </div>
                            </article>

                            <article>
                                <strong>3</strong>
                                <div>
                                    <h3>Get your card</h3>
                                    <p>Receive a digital club membership card and benefits.</p>
                                </div>
                            </article>
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <Ticket size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Membership Benefits</h2>
                                <p>Benefits differ by club and tier.</p>
                            </div>
                        </div>

                        <div className={styles.benefitSummary}>
                            <span>Ticket discounts</span>
                            <span>Priority match access</span>
                            <span>Digital membership cards</span>
                            <span>Club event access</span>
                            <span>Reward points</span>
                            <span>Sponsor offers</span>
                        </div>
                    </section>

                    <section className={styles.warningCard}>
                        <CalendarDays size={42} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Payments use checkout</h2>
                            <p>
                                Fans do not store raw MTN, Airtel or Visa details in League OS.
                                Checkout handles available payment options and League OS records
                                the receipt and membership result.
                            </p>
                        </div>

                        <Link to="/profile/payments">Open Payments &amp; Receipts</Link>
                    </section>

                    <section className={styles.supportCard}>
                        <Heart size={42} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Already following clubs?</h2>
                            <p>
                                Your followed clubs help League OS recommend relevant membership
                                tiers.
                            </p>
                        </div>

                        <Link to="/profile/clubs">View My Clubs →</Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default ExploreMembershipsPage;