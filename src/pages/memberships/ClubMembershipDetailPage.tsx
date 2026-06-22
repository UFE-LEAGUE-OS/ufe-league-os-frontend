import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Crown,
    FileText,
    Lock,
    QrCode,
    ReceiptText,
    ShieldCheck,
    ShoppingCart,
    Star,
    Trophy,
    Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "./ClubMembershipDetailPage.module.css";
import Footer from '../../components/Footer';

const clubMemberships = [
    {
        slug: "kobs",
        clubName: "KCB KOBS",
        sport: "Rugby Club",
        logo: "/assets/clubs/kobs.jpg",
        description:
            "Become an official KCB KOBS club member and access rugby matchday benefits, priority derby tickets, club events and supporter rewards.",
        memberCount: "1,240 members",
        season: "2025/2026 Season",
        tone: "purple",
        tiers: [
            {
                id: "kobs-bronze",
                name: "Bronze Member",
                price: "UGX 50,000",
                billing: "per season",
                popular: false,
                description: "Entry supporter tier for KCB KOBS fans.",
                benefits: [
                    "Digital membership card",
                    "Fixture and result alerts",
                    "Club news updates",
                    "Ticket release reminders",
                ],
            },
            {
                id: "kobs-gold",
                name: "Gold Member",
                price: "UGX 120,000",
                billing: "per season",
                popular: true,
                description: "Premium supporter tier with ticket and event benefits.",
                benefits: [
                    "10% ticket discount",
                    "Priority derby tickets",
                    "Digital membership card",
                    "Member-only club events",
                    "Club shop discount",
                ],
            },
            {
                id: "kobs-platinum",
                name: "Platinum Member",
                price: "UGX 250,000",
                billing: "per season",
                popular: false,
                description: "Top-tier KCB KOBS supporter experience.",
                benefits: [
                    "VIP matchday access",
                    "Priority finals tickets",
                    "Club merchandise pack",
                    "Sponsor event invitations",
                    "Premium digital badge",
                ],
            },
        ],
    },
    {
        slug: "sc-villa",
        clubName: "SC Villa",
        sport: "Football Club",
        logo: "/assets/clubs/sc-villa.png",
        description:
            "Join SC Villa as an official club member and unlock football matchday benefits, supporter rewards and club updates.",
        memberCount: "3,840 members",
        season: "2025/2026 Season",
        tone: "blue",
        tiers: [
            {
                id: "villa-bronze",
                name: "Bronze Member",
                price: "UGX 40,000",
                billing: "per season",
                popular: false,
                description: "Basic SC Villa supporter membership.",
                benefits: [
                    "Digital membership card",
                    "Club news alerts",
                    "Fixture reminders",
                    "Fan rewards eligibility",
                ],
            },
            {
                id: "villa-silver",
                name: "Silver Member",
                price: "UGX 80,000",
                billing: "per season",
                popular: true,
                description: "Supporter tier with matchday and fan event benefits.",
                benefits: [
                    "Matchday ticket discount",
                    "Digital membership card",
                    "Club news alerts",
                    "Fan event access",
                    "Priority ticket reminders",
                ],
            },
            {
                id: "villa-gold",
                name: "Gold Member",
                price: "UGX 160,000",
                billing: "per season",
                popular: false,
                description: "Premium SC Villa supporter membership.",
                benefits: [
                    "Priority home match tickets",
                    "Member-only club events",
                    "Merchandise discount",
                    "Digital gold card",
                    "Sponsor offers",
                ],
            },
        ],
    },
    {
        slug: "city-oilers",
        clubName: "City Oilers",
        sport: "Basketball Club",
        logo: "/assets/clubs/city-oilers.png",
        description:
            "Support City Oilers with club membership benefits around NBL games, courtside experiences and basketball fan rewards.",
        memberCount: "780 members",
        season: "2025 NBL Season",
        tone: "orange",
        tiers: [
            {
                id: "oilers-fan",
                name: "Fan Member",
                price: "UGX 70,000",
                billing: "per season",
                popular: false,
                description: "Basketball supporter membership for City Oilers fans.",
                benefits: [
                    "Digital membership card",
                    "NBL fixture alerts",
                    "Ticket reminders",
                    "Club news",
                ],
            },
            {
                id: "oilers-courtside",
                name: "Courtside Member",
                price: "UGX 150,000",
                billing: "per season",
                popular: true,
                description: "Enhanced basketball fan experience.",
                benefits: [
                    "Priority NBL tickets",
                    "Courtside event access",
                    "Club merchandise offers",
                    "Member reward points",
                    "Digital courtside card",
                ],
            },
        ],
    },
    {
        slug: "vipers-sc",
        clubName: "Vipers SC",
        sport: "Football Club",
        logo: "/assets/clubs/vipers-sc.png",
        description:
            "Join Vipers SC club membership to receive football updates, ticket benefits and supporter rewards.",
        memberCount: "2,910 members",
        season: "2025/2026 Season",
        tone: "green",
        tiers: [
            {
                id: "vipers-fan",
                name: "Fan Member",
                price: "UGX 60,000",
                billing: "per season",
                popular: true,
                description: "Entry membership for Vipers supporters.",
                benefits: [
                    "Club alerts",
                    "Ticket reminders",
                    "Digital fan card",
                    "Sponsor offers",
                ],
            },
            {
                id: "vipers-premium",
                name: "Premium Member",
                price: "UGX 130,000",
                billing: "per season",
                popular: false,
                description: "Premium Vipers supporter benefits.",
                benefits: [
                    "Priority ticket access",
                    "Fan event invitations",
                    "Digital premium card",
                    "Club merchandise offers",
                ],
            },
        ],
    },
    {
        slug: "black-pirates",
        clubName: "Black Pirates",
        sport: "Rugby Club",
        logo: "/assets/clubs/black-pirates.png",
        description:
            "Support Black Pirates Rugby Club with official club membership, digital cards and rugby fan benefits.",
        memberCount: "940 members",
        season: "2025/2026 Season",
        tone: "purple",
        tiers: [
            {
                id: "pirates-bronze",
                name: "Bronze Member",
                price: "UGX 50,000",
                billing: "per season",
                popular: true,
                description: "Starter club membership for Pirates fans.",
                benefits: [
                    "Digital member card",
                    "Fixture alerts",
                    "Club news",
                    "Ticket reminders",
                ],
            },
            {
                id: "pirates-gold",
                name: "Gold Member",
                price: "UGX 120,000",
                billing: "per season",
                popular: false,
                description: "Enhanced rugby supporter tier.",
                benefits: [
                    "Priority derby tickets",
                    "Club event access",
                    "Merchandise offers",
                    "Digital gold card",
                ],
            },
        ],
    },
    {
        slug: "kcca-fc",
        clubName: "KCCA FC",
        sport: "Football Club",
        logo: "/assets/clubs/kcca-fc.png",
        description:
            "Become a KCCA FC member and access football supporter benefits, ticket offers and family membership options.",
        memberCount: "2,150 members",
        season: "2025/2026 Season",
        tone: "blue",
        tiers: [
            {
                id: "kcca-fan",
                name: "Fan Member",
                price: "UGX 55,000",
                billing: "per season",
                popular: false,
                description: "Basic KCCA FC supporter membership.",
                benefits: [
                    "Digital fan card",
                    "Fixture alerts",
                    "Club news",
                    "Ticket reminders",
                ],
            },
            {
                id: "kcca-family",
                name: "Family Member",
                price: "UGX 100,000",
                billing: "per season",
                popular: true,
                description: "Family-focused supporter membership.",
                benefits: [
                    "Family ticket offers",
                    "Club news",
                    "Digital cards",
                    "Match reminders",
                    "Sponsor offers",
                ],
            },
        ],
    },
    {
        slug: "impis-rfc",
        clubName: "IMPIS RFC",
        sport: "Rugby Club",
        logo: "/assets/clubs/impis-rfc.jpg",
        description:
            "Join IMPIS RFC as a supporter and receive rugby updates, club benefits and official membership recognition.",
        memberCount: "520 members",
        season: "2025/2026 Season",
        tone: "orange",
        tiers: [
            {
                id: "impis-fan",
                name: "Fan Member",
                price: "UGX 40,000",
                billing: "per season",
                popular: true,
                description: "Starter membership for IMPIS RFC fans.",
                benefits: [
                    "Digital membership card",
                    "Fixture alerts",
                    "Club news",
                    "Ticket reminders",
                ],
            },
        ],
    },
    {
        slug: "platinum-heathens",
        clubName: "Platinum Credit Heathens",
        sport: "Rugby Club",
        logo: "/assets/clubs/platinum-heathens.jpg",
        description:
            "Support Heathens Rugby Club with official membership benefits, matchday access and club updates.",
        memberCount: "1,480 members",
        season: "2025/2026 Season",
        tone: "green",
        tiers: [
            {
                id: "heathens-gold",
                name: "Gold Member",
                price: "UGX 120,000",
                billing: "per season",
                popular: true,
                description: "Premium membership for Heathens rugby supporters.",
                benefits: [
                    "Digital membership card",
                    "Priority rugby tickets",
                    "Club event invitations",
                    "Merchandise offers",
                ],
            },
        ],
    },
    {
        slug: "namuwongo-blazers",
        clubName: "Namuwongo Blazers",
        sport: "Basketball Club",
        logo: "/assets/clubs/namuwongo-blazers.png",
        description:
            "Join Namuwongo Blazers membership to follow basketball fixtures, receive benefits and access supporter rewards.",
        memberCount: "650 members",
        season: "2025 NBL Season",
        tone: "orange",
        tiers: [
            {
                id: "blazers-fan",
                name: "Fan Member",
                price: "UGX 60,000",
                billing: "per season",
                popular: true,
                description: "Supporter membership for Blazers basketball fans.",
                benefits: [
                    "Digital membership card",
                    "NBL fixture alerts",
                    "Ticket reminders",
                    "Fan rewards",
                ],
            },
        ],
    },
];

function ClubMembershipDetailPage() {
    const { clubSlug } = useParams();
    const membership = clubMemberships.find((item) => item.slug === clubSlug);

    const initialTierId =
        membership?.tiers.find((tier) => tier.popular)?.id ??
        membership?.tiers[0]?.id ??
        "";

    const [selectedTierId, setSelectedTierId] = useState(initialTierId);

    if (!membership) {
        return (
            <section className={styles.page}>
                <div className={styles.notFoundCard}>
                    <AlertTriangle size={48} strokeWidth={2.3} aria-hidden="true" />

                    <div>
                        <h1>Club membership not found</h1>
                        <p>
                            We could not find that club membership page. Please return to the
                            club membership directory and choose another club.
                        </p>
                    </div>

                    <Link to="/memberships">Back to Club Memberships</Link>
                </div>
            </section>
        );
    }

    const selectedTier =
        membership.tiers.find((tier) => tier.id === selectedTierId) ??
        membership.tiers[0];

    return (
        <section className={styles.page}>
            <Link to="/memberships" className={styles.backLink}>
                <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
                Back to Club Memberships
            </Link>

            <header className={styles.heroCard}>
                <div className={styles.clubIdentity}>
                    <img src={membership.logo} alt="" aria-hidden="true" />

                    <div>
                        <span>{membership.sport}</span>
                        <h1>{membership.clubName} Membership</h1>
                        <p>{membership.description}</p>
                    </div>
                </div>

                <div className={styles.heroStats}>
                    <article>
                        <strong>{membership.memberCount}</strong>
                        <span>Current members</span>
                    </article>

                    <article>
                        <strong>{membership.season}</strong>
                        <span>Membership season</span>
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
                        the club.
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
                            {membership.tiers.map((tier) => (
                                <button
                                    type="button"
                                    className={`${styles.tierCard} ${selectedTier.id === tier.id ? styles.selectedTier : ""
                                        }`}
                                    key={tier.id}
                                    onClick={() => setSelectedTierId(tier.id)}
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
                                        <strong>{tier.price}</strong>
                                        <p>{tier.billing}</p>
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
                                    Benefits are club-specific and may differ between membership
                                    tiers.
                                </p>
                            </div>
                        </div>

                        <div className={styles.benefitGrid}>
                            {selectedTier.benefits.map((benefit) => (
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
                  <Footer />
      </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.checkoutCard}>
                        <div className={styles.checkoutHeader}>
                            <img src={membership.logo} alt="" aria-hidden="true" />

                            <div>
                                <h2>{membership.clubName}</h2>
                                <p>{selectedTier.name}</p>
                            </div>
                        </div>

                        <div className={styles.priceBlock}>
                            <span>Membership Price</span>
                            <strong>{selectedTier.price}</strong>
                            <small>{selectedTier.billing}</small>
                        </div>

                        <div className={styles.checkoutSummary}>
                            <article>
                                <Trophy size={18} strokeWidth={2.3} aria-hidden="true" />
                                <span>{membership.sport}</span>
                            </article>

                            <article>
                                <CalendarDays size={18} strokeWidth={2.3} aria-hidden="true" />
                                <span>{membership.season}</span>
                            </article>

                            <article>
                                <Users size={18} strokeWidth={2.3} aria-hidden="true" />
                                <span>{membership.memberCount}</span>
                            </article>
                        </div>

                        <Link
                            to={`/memberships/${membership.slug}/checkout`}
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

                    <section className={styles.warningCard}>
                        <ReceiptText size={42} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Receipts are stored separately</h2>
                            <p>
                                After payment, receipts and Flutterwave references should appear
                                under Payments & Receipts.
                            </p>
                        </div>

                        <Link to="/profile/payments">View Receipts</Link>
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
                                <p>Rules shown here are examples for the frontend mockup.</p>
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