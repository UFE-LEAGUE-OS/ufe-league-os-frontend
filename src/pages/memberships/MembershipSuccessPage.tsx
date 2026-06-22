import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Crown,
    Download,
    Gift,
    QrCode,
    ReceiptText,
    ShieldCheck,
    Ticket,
    Trophy,
    Users,
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import styles from "./MembershipSuccessPage.module.css";

const successMemberships = [
    {
        slug: "kobs",
        clubName: "KCB KOBS",
        sport: "Rugby Club",
        logo: "/assets/clubs/kobs.jpg",
        memberNumber: "KOBS-GOLD-2025-0018",
        validUntil: "18 May 2026",
        season: "2025/2026 Season",
        tiers: [
            { id: "kobs-bronze", name: "Bronze Member", price: 50000 },
            { id: "kobs-gold", name: "Gold Member", price: 120000 },
            { id: "kobs-platinum", name: "Platinum Member", price: 250000 },
        ],
        benefits: [
            "10% ticket discount",
            "Priority derby tickets",
            "Digital membership card",
            "Member-only club events",
        ],
    },
    {
        slug: "sc-villa",
        clubName: "SC Villa",
        sport: "Football Club",
        logo: "/assets/clubs/sc-villa.png",
        memberNumber: "SCV-SILVER-2025-0142",
        validUntil: "12 Aug 2025",
        season: "2025/2026 Season",
        tiers: [
            { id: "villa-bronze", name: "Bronze Member", price: 40000 },
            { id: "villa-silver", name: "Silver Member", price: 80000 },
            { id: "villa-gold", name: "Gold Member", price: 160000 },
        ],
        benefits: [
            "Matchday ticket discount",
            "Digital membership card",
            "Club news alerts",
            "Fan event access",
        ],
    },
    {
        slug: "city-oilers",
        clubName: "City Oilers",
        sport: "Basketball Club",
        logo: "/assets/clubs/city-oilers.png",
        memberNumber: "OILERS-COURT-2025-0031",
        validUntil: "30 Nov 2025",
        season: "2025 NBL Season",
        tiers: [
            { id: "oilers-fan", name: "Fan Member", price: 70000 },
            { id: "oilers-courtside", name: "Courtside Member", price: 150000 },
        ],
        benefits: [
            "Priority NBL tickets",
            "Courtside event access",
            "Club merchandise offers",
            "Member reward points",
        ],
    },
    {
        slug: "vipers-sc",
        clubName: "Vipers SC",
        sport: "Football Club",
        logo: "/assets/clubs/vipers-sc.png",
        memberNumber: "VIPERS-FAN-2025-0094",
        validUntil: "30 Jun 2026",
        season: "2025/2026 Season",
        tiers: [
            { id: "vipers-fan", name: "Fan Member", price: 60000 },
            { id: "vipers-premium", name: "Premium Member", price: 130000 },
        ],
        benefits: [
            "Club alerts",
            "Ticket reminders",
            "Digital fan card",
            "Sponsor offers",
        ],
    },
    {
        slug: "black-pirates",
        clubName: "Black Pirates",
        sport: "Rugby Club",
        logo: "/assets/clubs/black-pirates.png",
        memberNumber: "BP-BRONZE-2025-0062",
        validUntil: "30 Jun 2026",
        season: "2025/2026 Season",
        tiers: [
            { id: "pirates-bronze", name: "Bronze Member", price: 50000 },
            { id: "pirates-gold", name: "Gold Member", price: 120000 },
        ],
        benefits: [
            "Digital member card",
            "Fixture alerts",
            "Club news",
            "Ticket reminders",
        ],
    },
    {
        slug: "kcca-fc",
        clubName: "KCCA FC",
        sport: "Football Club",
        logo: "/assets/clubs/kcca-fc.png",
        memberNumber: "KCCA-FAMILY-2025-0025",
        validUntil: "30 Jun 2026",
        season: "2025/2026 Season",
        tiers: [
            { id: "kcca-fan", name: "Fan Member", price: 55000 },
            { id: "kcca-family", name: "Family Member", price: 100000 },
        ],
        benefits: [
            "Family ticket offers",
            "Club news",
            "Digital cards",
            "Match reminders",
        ],
    },
    {
        slug: "impis-rfc",
        clubName: "IMPIS RFC",
        sport: "Rugby Club",
        logo: "/assets/clubs/impis-rfc.jpg",
        memberNumber: "IMPIS-FAN-2025-0048",
        validUntil: "30 Jun 2026",
        season: "2025/2026 Season",
        tiers: [{ id: "impis-fan", name: "Fan Member", price: 40000 }],
        benefits: [
            "Digital membership card",
            "Fixture alerts",
            "Club news",
            "Ticket reminders",
        ],
    },
    {
        slug: "platinum-heathens",
        clubName: "Platinum Credit Heathens",
        sport: "Rugby Club",
        logo: "/assets/clubs/platinum-heathens.jpg",
        memberNumber: "HEATHENS-GOLD-2025-0075",
        validUntil: "30 Jun 2026",
        season: "2025/2026 Season",
        tiers: [{ id: "heathens-gold", name: "Gold Member", price: 120000 }],
        benefits: [
            "Digital membership card",
            "Priority rugby tickets",
            "Club event invitations",
            "Merchandise offers",
        ],
    },
    {
        slug: "namuwongo-blazers",
        clubName: "Namuwongo Blazers",
        sport: "Basketball Club",
        logo: "/assets/clubs/namuwongo-blazers.png",
        memberNumber: "BLAZERS-FAN-2025-0019",
        validUntil: "30 Nov 2025",
        season: "2025 NBL Season",
        tiers: [{ id: "blazers-fan", name: "Fan Member", price: 60000 }],
        benefits: [
            "Digital membership card",
            "NBL fixture alerts",
            "Ticket reminders",
            "Fan rewards",
        ],
    },
];

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency: "UGX",
        maximumFractionDigits: 0,
    }).format(amount);
}

function MembershipSuccessPage() {
    const { clubSlug } = useParams();
    const [searchParams] = useSearchParams();

    const membership = successMemberships.find((item) => item.slug === clubSlug);
    const tierFromQuery = searchParams.get("tier");

    if (!membership) {
        return (
            <section className={styles.page}>
                <div className={styles.notFoundCard}>
                    <ShieldCheck size={48} strokeWidth={2.3} aria-hidden="true" />

                    <div>
                        <h1>Membership success page not found</h1>
                        <p>
                            We could not find that club membership confirmation page. Return
                            to the membership directory and choose another club.
                        </p>
                    </div>

                    <Link to="/memberships">Back to Club Memberships</Link>
                </div>
            </section>
        );
    }

    const selectedTier =
        membership.tiers.find((tier) => tier.id === tierFromQuery) ??
        membership.tiers[0];

    const serviceFee = Math.round(selectedTier.price * 0.03);
    const totalAmount = selectedTier.price + serviceFee;
    const paymentReference = `LOS-${membership.slug.toUpperCase()}-2025-001`;

    return (
        <section className={styles.page}>
            <Link to="/memberships" className={styles.backLink}>
                <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
                Back to Club Memberships
            </Link>

            <header className={styles.successHero}>
                <span className={styles.successIcon}>
                    <CheckCircle2 size={54} strokeWidth={2.3} aria-hidden="true" />
                </span>

                <div>
                    <p>Payment Successful</p>
                    <h1>{membership.clubName} Membership Activated</h1>
                    <span>
                        Your {selectedTier.name} club membership has been created and your
                        digital card is ready.
                    </span>
                </div>
            </header>

            <div className={styles.layoutGrid}>
                <main className={styles.mainColumn}>
                    <section className={styles.membershipCard}>
                        <div className={styles.cardTop}>
                            <img src={membership.logo} alt="" aria-hidden="true" />

                            <div>
                                <h2>{membership.clubName}</h2>
                                <p>{membership.sport}</p>
                            </div>

                            <span>Active</span>
                        </div>

                        <div className={styles.tierBlock}>
                            <Crown size={34} strokeWidth={2.2} aria-hidden="true" />

                            <div>
                                <strong>{selectedTier.name}</strong>
                                <p>{membership.season}</p>
                                <small>Valid until {membership.validUntil}</small>
                            </div>
                        </div>

                        <div className={styles.memberNumber}>
                            <span>Membership Number</span>
                            <strong>{membership.memberNumber}</strong>
                        </div>

                        <div className={styles.digitalCard}>
                            <span>
                                <QrCode size={72} strokeWidth={1.8} aria-hidden="true" />
                            </span>

                            <div>
                                <h3>Digital Membership Card</h3>
                                <p>
                                    Show this card when claiming club benefits, ticket discounts or
                                    member-only access.
                                </p>
                            </div>
                        </div>

                        <div className={styles.cardActions}>
                            <button type="button">
                                <Download size={16} strokeWidth={2.4} aria-hidden="true" />
                                Download Card
                            </button>

                            <Link to="/dashboard/memberships">Open My Club Memberships</Link>
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Membership Benefits Activated</h2>
                                <p>
                                    These benefits are now available through your club membership.
                                </p>
                            </div>
                        </div>

                        <div className={styles.benefitGrid}>
                            {membership.benefits.map((benefit) => (
                                <article className={styles.benefitCard} key={benefit}>
                                    <CheckCircle2
                                        size={22}
                                        strokeWidth={2.6}
                                        aria-hidden="true"
                                    />
                                    <span>{benefit}</span>
                                </article>
                            ))}
                        </div>
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.receiptCard}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <ReceiptText size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Payment Receipt</h2>
                                <p>Mock receipt summary for this frontend flow.</p>
                            </div>
                        </div>

                        <div className={styles.receiptList}>
                            <article>
                                <span>Club</span>
                                <strong>{membership.clubName}</strong>
                            </article>

                            <article>
                                <span>Membership Tier</span>
                                <strong>{selectedTier.name}</strong>
                            </article>

                            <article>
                                <span>Membership Price</span>
                                <strong>{formatCurrency(selectedTier.price)}</strong>
                            </article>

                            <article>
                                <span>Service Fee</span>
                                <strong>{formatCurrency(serviceFee)}</strong>
                            </article>

                            <article className={styles.totalRow}>
                                <span>Total Paid</span>
                                <strong>{formatCurrency(totalAmount)}</strong>
                            </article>

                            <article>
                                <span>Reference</span>
                                <strong>{paymentReference}</strong>
                            </article>
                        </div>

                        <Link to="/profile/payments" className={styles.primarySideLink}>
                            View Payments &amp; Receipts
                        </Link>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <Gift size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Next Steps</h2>
                                <p>Use your membership across the fan experience.</p>
                            </div>
                        </div>

                        <div className={styles.nextStepsList}>
                            <Link to="/dashboard/memberships">
                                <Crown size={18} strokeWidth={2.4} aria-hidden="true" />
                                View digital membership cards
                            </Link>

                            <Link to="/tickets">
                                <Ticket size={18} strokeWidth={2.4} aria-hidden="true" />
                                Find member ticket discounts
                            </Link>

                            <Link to="/profile/clubs">
                                <Users size={18} strokeWidth={2.4} aria-hidden="true" />
                                Manage followed clubs
                            </Link>

                            <Link to="/dashboard/fan">
                                <Trophy size={18} strokeWidth={2.4} aria-hidden="true" />
                                Return to fan dashboard
                            </Link>
                        </div>
                    </section>

                    <section className={styles.warningCard}>
                        <CalendarDays size={42} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Renewal reminder</h2>
                            <p>
                                This membership is valid until {membership.validUntil}. Renewal
                                reminders should appear in Notifications later.
                            </p>
                        </div>

                        <Link to="/profile/notifications">Manage Notifications</Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default MembershipSuccessPage;