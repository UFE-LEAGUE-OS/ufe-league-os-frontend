import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
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
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    getMembershipCatalog,
    type MembershipCatalogPlan,
    type MembershipClubCatalog,
    type MembershipTone,
} from "../../services/membershipService";
import styles from "./ExploreMembershipsPage.module.css";

interface SummaryCard {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
    tone: MembershipTone;
}

function getSportFilters(catalog: MembershipClubCatalog[]) {
    const sports = Array.from(
        new Set(catalog.map((item) => item.sportLabel).filter(Boolean)),
    ).sort();

    return ["All", ...sports];
}

function countUniqueBenefits(plans: MembershipCatalogPlan[]) {
    return new Set(plans.flatMap((plan) => plan.benefits)).size;
}

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "LO";
}

function buildSummaryCards(
    catalog: MembershipClubCatalog[],
    plans: MembershipCatalogPlan[],
): SummaryCard[] {
    return [
        {
            label: "Club Memberships",
            value: String(plans.length),
            detail: "Active backend membership plans",
            icon: Crown,
            tone: "purple",
        },
        {
            label: "Active Clubs",
            value: String(catalog.length),
            detail: "Clubs with visible membership tiers",
            icon: ShieldCheck,
            tone: "orange",
        },
        {
            label: "Fan Benefits",
            value: String(countUniqueBenefits(plans)),
            detail: "Unique benefits from backend plans",
            icon: Star,
            tone: "blue",
        },
        {
            label: "My Memberships",
            value: "Open",
            detail: "View your backend membership card data",
            icon: Users,
            tone: "green",
        },
    ];
}

function ExploreMembershipsPage() {
    const [catalog, setCatalog] = useState<MembershipClubCatalog[]>([]);
    const [selectedSport, setSelectedSport] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [clubsPerPage, setClubsPerPage] = useState(6);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let active = true;

        async function loadMemberships() {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const data = await getMembershipCatalog();

                if (!active) return;

                setCatalog(data);
            } catch {
                if (!active) return;

                setErrorMessage(
                    "Could not load backend membership plans. Please try again or contact support.",
                );
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        void loadMemberships();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [clubsPerPage, searchQuery, selectedSport]);

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const allPlans = useMemo(
        () => catalog.flatMap((club) => club.plans),
        [catalog],
    );

    const sportFilters = useMemo(() => getSportFilters(catalog), [catalog]);

    const summaryCards = useMemo(
        () => buildSummaryCards(catalog, allPlans),
        [allPlans, catalog],
    );

    const filteredClubs = useMemo(() => {
        return catalog.filter((club) => {
            const matchesSport =
                selectedSport === "All" || club.sportLabel === selectedSport;

            const searchableText = [
                club.clubName,
                club.shortName,
                club.sportLabel,
                club.description,
                club.plans.map((plan) => `${plan.name} ${plan.tier} ${plan.description}`).join(" "),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !normalizedSearchQuery ||
                searchableText.includes(normalizedSearchQuery);

            return matchesSport && matchesSearch;
        });
    }, [catalog, normalizedSearchQuery, selectedSport]);

    const totalPages = Math.max(1, Math.ceil(filteredClubs.length / clubsPerPage));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const firstVisibleClubNumber = filteredClubs.length
        ? (safeCurrentPage - 1) * clubsPerPage + 1
        : 0;
    const lastVisibleClubNumber = Math.min(
        safeCurrentPage * clubsPerPage,
        filteredClubs.length,
    );

    const paginatedClubs = useMemo(() => {
        const startIndex = (safeCurrentPage - 1) * clubsPerPage;
        return filteredClubs.slice(startIndex, startIndex + clubsPerPage);
    }, [clubsPerPage, filteredClubs, safeCurrentPage]);

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
                {isLoading
                    ? "Loading membership plans from the League OS backend..."
                    : errorMessage ||
                    `${allPlans.length} backend membership plans across ${catalog.length} clubs.`}
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

                    {isLoading ? (
                        <section className={styles.membershipGrid}>
                            <article className={`${styles.membershipCard} ${styles.purple}`}>
                                <div className={styles.tierBlock}>
                                    <Crown size={30} strokeWidth={2.2} aria-hidden="true" />
                                    <div>
                                        <strong>Loading backend memberships</strong>
                                        <p>Please wait while League OS loads membership plans.</p>
                                    </div>
                                </div>
                            </article>
                        </section>
                    ) : null}

                    {!isLoading && errorMessage ? (
                        <section className={styles.membershipGrid}>
                            <article className={`${styles.membershipCard} ${styles.orange}`}>
                                <div className={styles.tierBlock}>
                                    <ShieldCheck size={30} strokeWidth={2.2} aria-hidden="true" />
                                    <div>
                                        <strong>Backend memberships unavailable</strong>
                                        <p>{errorMessage}</p>
                                    </div>
                                </div>
                            </article>
                        </section>
                    ) : null}

                    {!isLoading && !errorMessage ? (
                        <section className={styles.membershipGrid}>
                            {paginatedClubs.map((club) => {
                                const featuredPlan =
                                    club.plans.find((plan) => plan.popular) || club.plans[0];
                                const startingPlan = club.plans[0];
                                const visibleBenefits = Array.from(
                                    new Set(club.plans.flatMap((plan) => plan.benefits)),
                                ).slice(0, 4);

                                return (
                                    <article
                                        className={`${styles.membershipCard} ${styles[club.tone]}`}
                                        key={club.clubId}
                                    >
                                        <span className={styles.popularBadge}>
                                            <Star size={14} strokeWidth={2.7} aria-hidden="true" />
                                            {club.tierCountLabel}
                                        </span>

                                        <div className={styles.clubHeader}>
                                            <div className={styles.clubAvatar}>
                                                {club.logoUrl ? (
                                                    <img
                                                        src={club.logoUrl}
                                                        alt=""
                                                        aria-hidden="true"
                                                        onError={(event) => {
                                                            event.currentTarget.style.display = "none";
                                                        }}
                                                    />
                                                ) : null}
                                                <span aria-hidden="true">
                                                    {getInitials(club.shortName || club.clubName)}
                                                </span>
                                            </div>

                                            <div>
                                                <h2>{club.clubName}</h2>
                                                <p>{club.sportLabel} Club</p>
                                            </div>
                                        </div>

                                        <div className={styles.tierBlock}>
                                            <Crown size={30} strokeWidth={2.2} aria-hidden="true" />

                                            <div>
                                                <strong>
                                                    From {startingPlan?.priceLabel || "backend pricing"}
                                                </strong>
                                                <p>
                                                    {club.tierCountLabel} <span>available</span>
                                                </p>
                                                {featuredPlan ? (
                                                    <small>Popular tier: {featuredPlan.name}</small>
                                                ) : null}
                                            </div>
                                        </div>

                                        <p className={styles.description}>{club.description}</p>

                                        <div className={styles.tierPreviewList}>
                                            {club.plans.map((plan) => (
                                                <span key={plan.id}>
                                                    {plan.tier || plan.name} · {plan.priceLabel}
                                                </span>
                                            ))}
                                        </div>

                                        <div className={styles.benefitList}>
                                            {visibleBenefits.length > 0 ? (
                                                visibleBenefits.map((benefit) => (
                                                    <span key={benefit}>
                                                        <CheckCircle2
                                                            size={15}
                                                            strokeWidth={2.6}
                                                            aria-hidden="true"
                                                        />
                                                        {benefit}
                                                    </span>
                                                ))
                                            ) : (
                                                <span>
                                                    <CheckCircle2
                                                        size={15}
                                                        strokeWidth={2.6}
                                                        aria-hidden="true"
                                                    />
                                                    Backend benefits pending for this club
                                                </span>
                                            )}
                                        </div>

                                        <div className={styles.cardActions}>
                                            <Link
                                                to={`/memberships/${club.clubSlug}${featuredPlan ? `?plan=${featuredPlan.id}` : ""}`}
                                            >
                                                View Club Tiers
                                            </Link>
                                            {featuredPlan ? (
                                                <Link
                                                    to={`/memberships/${club.clubSlug}/checkout?plan=${featuredPlan.id}`}
                                                >
                                                    Join Club
                                                </Link>
                                            ) : null}
                                        </div>
                                    </article>
                                );
                            })}
                        </section>
                    ) : null}

                    {!isLoading && !errorMessage && filteredClubs.length > 0 ? (
                        <section className={styles.paginationPanel} aria-label="Membership pagination">
                            <div>
                                <strong>Showing clubs {firstVisibleClubNumber}-{lastVisibleClubNumber}</strong>
                                <span>of {filteredClubs.length} backend clubs</span>
                            </div>

                            <label className={styles.perPageControl}>
                                Clubs per page
                                <select
                                    value={clubsPerPage}
                                    onChange={(event) => setClubsPerPage(Number(event.target.value))}
                                >
                                    <option value={6}>6</option>
                                    <option value={9}>9</option>
                                    <option value={12}>12</option>
                                    <option value={30}>30</option>
                                </select>
                            </label>

                            <div className={styles.paginationButtons}>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={safeCurrentPage === 1}
                                    aria-label="Previous membership clubs page"
                                >
                                    <ChevronLeft size={18} strokeWidth={2.5} aria-hidden="true" />
                                    Previous
                                </button>

                                <span>
                                    Page {safeCurrentPage} of {totalPages}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                                    }
                                    disabled={safeCurrentPage === totalPages}
                                    aria-label="Next membership clubs page"
                                >
                                    Next
                                    <ChevronRight size={18} strokeWidth={2.5} aria-hidden="true" />
                                </button>
                            </div>
                        </section>
                    ) : null}

                    {!isLoading && !errorMessage && filteredClubs.length === 0 ? (
                        <section className={styles.membershipGrid}>
                            <article className={`${styles.membershipCard} ${styles.blue}`}>
                                <div className={styles.tierBlock}>
                                    <Search size={30} strokeWidth={2.2} aria-hidden="true" />
                                    <div>
                                        <strong>No backend membership clubs found</strong>
                                        <p>Try another sport filter or search term.</p>
                                    </div>
                                </div>
                            </article>
                        </section>
                    ) : null}
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
                                    <p>Select a club and membership tier from the backend.</p>
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
                                <p>Benefits are loaded from each backend membership tier.</p>
                            </div>
                        </div>

                        <div className={styles.benefitSummary}>
                            {Array.from(
                                new Set(allPlans.flatMap((plan) => plan.benefits)),
                            )
                                .slice(0, 6)
                                .map((benefit) => (
                                    <span key={benefit}>{benefit}</span>
                                ))}
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