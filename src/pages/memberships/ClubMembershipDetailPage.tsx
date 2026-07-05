import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Crown,
    FileText,
    Lock,
    QrCode,
    ShieldCheck,
    ShoppingCart,
    Star,
    Trophy,
    Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
    getMembershipCatalogForClubSlug,
    type MembershipClubCatalog,
} from "../../services/membershipService";
import styles from "./ClubMembershipDetailPage.module.css";

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "LO";
}

function ClubMembershipDetailPage() {
    const { clubSlug = "" } = useParams();
    const [searchParams] = useSearchParams();
    const requestedPlanId = searchParams.get("plan");

    const [membership, setMembership] = useState<MembershipClubCatalog | null>(null);
    const [selectedTierId, setSelectedTierId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let active = true;

        async function loadMembership() {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const data = await getMembershipCatalogForClubSlug(clubSlug);

                if (!active) return;

                setMembership(data);
            } catch {
                if (!active) return;

                setErrorMessage(
                    "Could not load this club membership from the backend.",
                );
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        void loadMembership();

        return () => {
            active = false;
        };
    }, [clubSlug]);

    useEffect(() => {
        if (!membership || membership.plans.length === 0) return;

        const requestedTier = requestedPlanId
            ? membership.plans.find((tier) => String(tier.id) === requestedPlanId)
            : null;
        const popularTier = membership.plans.find((tier) => tier.popular);
        const fallbackTier = membership.plans[0];
        const nextTier = requestedTier || popularTier || fallbackTier;

        if (nextTier && !membership.plans.some((tier) => String(tier.id) === selectedTierId)) {
            setSelectedTierId(String(nextTier.id));
        }
    }, [membership, requestedPlanId, selectedTierId]);

    const selectedTier = useMemo(() => {
        if (!membership) return null;

        return (
            membership.plans.find((tier) => String(tier.id) === selectedTierId) ||
            membership.plans[0] ||
            null
        );
    }, [membership, selectedTierId]);

    const startingPriceLabel = useMemo(
        () => membership?.plans[0]?.priceLabel || "Backend pricing",
        [membership],
    );

    const tierSummaryLabel = useMemo(
        () => membership?.plans.map((tier) => tier.tier || tier.name).join(" • ") || "",
        [membership],
    );

    if (isLoading) {
        return (
            <section className={styles.page}>
                <div className={styles.notFoundCard}>
                    <Crown size={48} strokeWidth={2.3} aria-hidden="true" />

                    <div>
                        <h1>Loading club membership</h1>
                        <p>League OS is loading this club membership from the backend.</p>
                    </div>

                    <Link to="/memberships">Back to Club Memberships</Link>
                </div>
            </section>
        );
    }

    if (!membership || !selectedTier || errorMessage) {
        return (
            <section className={styles.page}>
                <div className={styles.notFoundCard}>
                    <AlertTriangle size={48} strokeWidth={2.3} aria-hidden="true" />

                    <div>
                        <h1>Club membership not found</h1>
                        <p>
                            {errorMessage ||
                                "We could not find that club membership page in the backend catalogue."}
                        </p>
                    </div>

                    <Link to="/memberships">Back to Club Memberships</Link>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.page}>
            <Link to="/memberships" className={styles.backLink}>
                <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
                Back to Club Memberships
            </Link>

            <header className={styles.heroCard}>
                <div className={styles.clubIdentity}>
                    <div className={styles.clubLogo}>
                        {membership.logoUrl ? (
                            <img
                                src={membership.logoUrl}
                                alt=""
                                aria-hidden="true"
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                }}
                            />
                        ) : null}
                        <span aria-hidden="true">
                            {getInitials(membership.shortName || membership.clubName)}
                        </span>
                    </div>

                    <div className={styles.clubCopy}>
                        <span className={styles.clubBadge}>{membership.sportLabel} Club</span>
                        <h1>{membership.clubName}</h1>
                        <p>{membership.description}</p>

                        <div className={styles.heroMeta}>
                            <span>{membership.tierCountLabel}</span>
                            <span>From {startingPriceLabel}</span>
                            {tierSummaryLabel ? <span>{tierSummaryLabel}</span> : null}
                        </div>
                    </div>
                </div>

                <div className={styles.heroStats}>
                    <article>
                        <strong>{membership.tierCountLabel}</strong>
                        <span>Backend tiers</span>
                    </article>

                    <article>
                        <strong>From {startingPriceLabel}</strong>
                        <span>Starting price</span>
                    </article>
                </div>
            </header>

            <section className={styles.explainerCard}>
                <span>
                    <ShieldCheck size={34} strokeWidth={2.3} aria-hidden="true" />
                </span>

                <div>
                    <h2>This membership belongs to {membership.clubName}</h2>
                    <p>
                        League OS helps with discovery, checkout, receipts and the digital
                        card. The membership product, tier rules and benefits are owned by
                        the club and loaded from the backend database.
                    </p>
                </div>

                <Link to="/profile/payments">Payments &amp; Receipts</Link>
            </section>

            <div className={styles.layoutGrid}>
                <main className={styles.mainColumn}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Choose Membership Tier</h2>
                                <p>
                                    Select the club tier you want to join, renew or upgrade to.
                                </p>
                            </div>
                        </div>

                        <div className={styles.tierGrid}>
                            {membership.plans.map((tier) => (
                                <button
                                    type="button"
                                    className={`${styles.tierCard} ${selectedTier.id === tier.id ? styles.selectedTier : ""
                                        }`}
                                    key={tier.id}
                                    onClick={() => setSelectedTierId(String(tier.id))}
                                >
                                    {tier.popular ? (
                                        <span className={styles.popularBadge}>
                                            <Star size={14} strokeWidth={2.7} aria-hidden="true" />
                                            Popular
                                        </span>
                                    ) : null}

                                    <Crown size={34} strokeWidth={2.2} aria-hidden="true" />

                                    <div>
                                        <h3>{tier.name}</h3>
                                        <strong>{tier.priceLabel}</strong>
                                        <p>{tier.billingLabel}</p>
                                        <small>{tier.description}</small>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>{selectedTier.name} Benefits</h2>
                                <p>
                                    Benefits are club-specific and loaded from the selected
                                    backend membership tier.
                                </p>
                            </div>
                        </div>

                        <div className={styles.benefitGrid}>
                            {selectedTier.benefits.length > 0 ? (
                                selectedTier.benefits.map((benefit) => (
                                    <article className={styles.benefitCard} key={benefit}>
                                        <CheckCircle2
                                            size={22}
                                            strokeWidth={2.6}
                                            aria-hidden="true"
                                        />
                                        <span>{benefit}</span>
                                    </article>
                                ))
                            ) : (
                                <article className={styles.benefitCard}>
                                    <CheckCircle2
                                        size={22}
                                        strokeWidth={2.6}
                                        aria-hidden="true"
                                    />
                                    <span>Backend benefits are pending for this tier.</span>
                                </article>
                            )}
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>What Happens After Checkout?</h2>
                                <p>
                                    This is the intended membership purchase flow when backend and
                                    Flutterwave checkout are connected.
                                </p>
                            </div>
                        </div>

                        <div className={styles.flowGrid}>
                            <article>
                                <span>1</span>
                                <div>
                                    <h3>Select tier</h3>
                                    <p>Choose the club membership tier you want.</p>
                                </div>
                            </article>

                            <article>
                                <span>2</span>
                                <div>
                                    <h3>Checkout securely</h3>
                                    <p>Flutterwave handles available payment options.</p>
                                </div>
                            </article>

                            <article>
                                <span>3</span>
                                <div>
                                    <h3>Confirm payment</h3>
                                    <p>League OS records the gateway reference and status.</p>
                                </div>
                            </article>

                            <article>
                                <span>4</span>
                                <div>
                                    <h3>Activate membership</h3>
                                    <p>Your club membership and digital card become available.</p>
                                </div>
                            </article>
                        </div>
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.checkoutCard}>
                        <div className={styles.checkoutHeader}>
                            {membership.logoUrl ? (
                                <img
                                    src={membership.logoUrl}
                                    alt=""
                                    aria-hidden="true"
                                    onError={(event) => {
                                        event.currentTarget.style.display = "none";
                                    }}
                                />
                            ) : null}

                            <div>
                                <h2>{membership.clubName}</h2>
                                <p>{selectedTier.name}</p>
                            </div>
                        </div>

                        <div className={styles.priceBlock}>
                            <span>Membership Price</span>
                            <strong>{selectedTier.priceLabel}</strong>
                            <small>{selectedTier.billingLabel}</small>
                        </div>

                        <div className={styles.checkoutSummary}>
                            <article>
                                <Trophy size={18} strokeWidth={2.3} aria-hidden="true" />
                                <span>{membership.sportLabel} Club</span>
                            </article>

                            <article>
                                <CalendarDays size={18} strokeWidth={2.3} aria-hidden="true" />
                                <span>Plan ID: {selectedTier.id}</span>
                            </article>

                            <article>
                                <Users size={18} strokeWidth={2.3} aria-hidden="true" />
                                <span>{membership.tierCountLabel}</span>
                            </article>
                        </div>

                        <Link
                            to={`/memberships/${membership.clubSlug}/checkout?plan=${selectedTier.id}`}
                            className={styles.checkoutButton}
                        >
                            <ShoppingCart size={18} strokeWidth={2.4} aria-hidden="true" />
                            Continue to Checkout
                        </Link>

                        <Link to="/dashboard/memberships" className={styles.secondaryButton}>
                            View My Memberships
                        </Link>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <Lock size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Checkout Security</h2>
                                <p>Payment method selection happens during checkout.</p>
                            </div>
                        </div>

                        <div className={styles.securityList}>
                            <article>
                                <CheckCircle2 size={18} strokeWidth={2.5} aria-hidden="true" />
                                <span>Do not store raw card or mobile money details.</span>
                            </article>

                            <article>
                                <CheckCircle2 size={18} strokeWidth={2.5} aria-hidden="true" />
                                <span>Record payment reference and status only.</span>
                            </article>

                            <article>
                                <CheckCircle2 size={18} strokeWidth={2.5} aria-hidden="true" />
                                <span>Activate membership after successful confirmation.</span>
                            </article>
                        </div>
                    </section>


                    <section className={styles.supportCard}>
                        <QrCode size={42} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Digital card after purchase</h2>
                            <p>
                                Once active, your club membership card will be available in My
                                Club Memberships.
                            </p>
                        </div>

                        <Link to="/dashboard/memberships">Open My Cards</Link>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <FileText size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Club Rules</h2>
                                <p>Rules shown here should come from club policy in a future API.</p>
                            </div>
                        </div>

                        <div className={styles.rulesList}>
                            <span>Memberships are seasonal unless stated otherwise.</span>
                            <span>Benefits depend on club and tier availability.</span>
                            <span>Refunds follow club policy and payment provider rules.</span>
                        </div>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default ClubMembershipDetailPage;