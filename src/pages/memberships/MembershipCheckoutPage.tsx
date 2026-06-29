import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Crown,
    FileText,
    Lock,
    Loader2,
    Mail,
    Phone,
    ReceiptText,
    ShieldCheck,
    ShoppingCart,
    Smartphone,
    User,
} from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { initializeMembershipCheckout } from "../../services/membershipCheckoutService";
import styles from "./MembershipCheckoutPage.module.css";

const checkoutMemberships = [
    {
        slug: "kobs",
        clubName: "KCB KOBS",
        sport: "Rugby Club",
        logo: "/assets/clubs/kobs.jpg",
        season: "2025/2026 Season",
        tone: "purple",
        tiers: [
            { id: "kobs-bronze", name: "Bronze Member", price: 50000, popular: false },
            { id: "kobs-gold", name: "Gold Member", price: 120000, popular: true },
            { id: "kobs-platinum", name: "Platinum Member", price: 250000, popular: false },
        ],
    },
    {
        slug: "sc-villa",
        clubName: "SC Villa",
        sport: "Football Club",
        logo: "/assets/clubs/sc-villa.png",
        season: "2025/2026 Season",
        tone: "blue",
        tiers: [
            { id: "villa-bronze", name: "Bronze Member", price: 40000, popular: false },
            { id: "villa-silver", name: "Silver Member", price: 80000, popular: true },
            { id: "villa-gold", name: "Gold Member", price: 160000, popular: false },
        ],
    },
    {
        slug: "city-oilers",
        clubName: "City Oilers",
        sport: "Basketball Club",
        logo: "/assets/clubs/city-oilers.png",
        season: "2025 NBL Season",
        tone: "orange",
        tiers: [
            { id: "oilers-fan", name: "Fan Member", price: 70000, popular: false },
            { id: "oilers-courtside", name: "Courtside Member", price: 150000, popular: true },
        ],
    },
    {
        slug: "vipers-sc",
        clubName: "Vipers SC",
        sport: "Football Club",
        logo: "/assets/clubs/vipers-sc.png",
        season: "2025/2026 Season",
        tone: "green",
        tiers: [
            { id: "vipers-fan", name: "Fan Member", price: 60000, popular: true },
            { id: "vipers-premium", name: "Premium Member", price: 130000, popular: false },
        ],
    },
    {
        slug: "black-pirates",
        clubName: "Black Pirates",
        sport: "Rugby Club",
        logo: "/assets/clubs/black-pirates.png",
        season: "2025/2026 Season",
        tone: "purple",
        tiers: [
            { id: "pirates-bronze", name: "Bronze Member", price: 50000, popular: true },
            { id: "pirates-gold", name: "Gold Member", price: 120000, popular: false },
        ],
    },
    {
        slug: "kcca-fc",
        clubName: "KCCA FC",
        sport: "Football Club",
        logo: "/assets/clubs/kcca-fc.png",
        season: "2025/2026 Season",
        tone: "blue",
        tiers: [
            { id: "kcca-fan", name: "Fan Member", price: 55000, popular: false },
            { id: "kcca-family", name: "Family Member", price: 100000, popular: true },
        ],
    },
    {
        slug: "impis-rfc",
        clubName: "IMPIS RFC",
        sport: "Rugby Club",
        logo: "/assets/clubs/impis-rfc.jpg",
        season: "2025/2026 Season",
        tone: "orange",
        tiers: [
            { id: "impis-fan", name: "Fan Member", price: 40000, popular: true },
        ],
    },
    {
        slug: "platinum-heathens",
        clubName: "Platinum Credit Heathens",
        sport: "Rugby Club",
        logo: "/assets/clubs/platinum-heathens.jpg",
        season: "2025/2026 Season",
        tone: "green",
        tiers: [
            { id: "heathens-gold", name: "Gold Member", price: 120000, popular: true },
        ],
    },
    {
        slug: "namuwongo-blazers",
        clubName: "Namuwongo Blazers",
        sport: "Basketball Club",
        logo: "/assets/clubs/namuwongo-blazers.png",
        season: "2025 NBL Season",
        tone: "orange",
        tiers: [
            { id: "blazers-fan", name: "Fan Member", price: 60000, popular: true },
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

function MembershipCheckoutPage() {
    const { clubSlug } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useCurrentUser();

    const membership = checkoutMemberships.find((item) => item.slug === clubSlug);

    const defaultTierId =
        membership?.tiers.find((tier) => tier.popular)?.id ??
        membership?.tiers[0]?.id ??
        "";

    const [selectedTierId, setSelectedTierId] = useState(defaultTierId);
    const [fullName, setFullName] = useState(
        currentUser.name && currentUser.name !== "Fan" ? currentUser.name : ""
    );
    const [email, setEmail] = useState(
        currentUser.email && currentUser.email !== "No email available" ? currentUser.email : ""
    );
    const [phone, setPhone] = useState(
        currentUser.phoneNumber && currentUser.phoneNumber !== "No phone number added" ? currentUser.phoneNumber : ""
    );
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!membership) {
        return (
            <section className={styles.page}>
                <div className={styles.notFoundCard}>
                    <AlertTriangle size={48} strokeWidth={2.3} aria-hidden="true" />
                    <div>
                        <h1>Checkout page not found</h1>
                        <p>
                            We could not find that club membership checkout. Please return to
                            the membership directory and choose another club.
                        </p>
                    </div>
                    <Link to="/memberships">Back to Club Memberships</Link>
                </div>
            </section>
        );
    }

    const membershipSlug = membership.slug;

    const selectedTier =
        membership.tiers.find((tier) => tier.id === selectedTierId) ??
        membership.tiers[0];

    const selectedTierIdForRedirect = selectedTier.id;

    const serviceFee = Math.round(selectedTier.price * 0.03);
    const totalAmount = selectedTier.price + serviceFee;

    async function handleCheckoutSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!acceptedTerms) {
            setStatusMessage("Please accept the club membership terms before checkout.");
            return;
        }

        setIsSubmitting(true);
        setStatusMessage("");

        try {
            const response = await initializeMembershipCheckout({
                demo_plan_code: selectedTier.id,
            });

            localStorage.setItem(
                "league_os_pending_membership_checkout",
                JSON.stringify({
                    tx_ref: response.tx_ref,
                    club_slug: membershipSlug,
                    tier_id: selectedTierIdForRedirect,
                    payment_id: response.payment.id,
                    subscription_id: response.subscription.id,
                }),
            );

            if (response.checkout_url) {
                window.location.assign(response.checkout_url);
                return;
            }

            navigate("/memberships/payment/processing", {
                replace: true,
                state: {
                    tx_ref: response.tx_ref,
                    club_slug: membershipSlug,
                    tier_id: selectedTierIdForRedirect,
                },
            });
        } catch {
            setStatusMessage(
                "Membership checkout could not be initialized. Please try again or contact support.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className={styles.page}>
            <Link to={`/memberships/${membership.slug}`} className={styles.backLink}>
                <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
                Back to {membership.clubName} Membership
            </Link>

            <header className={styles.pageHeader}>
                <div>
                    <span>Club Membership Checkout</span>
                    <h1>{membership.clubName}</h1>
                    <p>
                        Review your selected club membership tier before continuing to secure
                        checkout.
                    </p>
                </div>
                <img src={membership.logo} alt="" aria-hidden="true" />
            </header>

            {statusMessage ? (
                <div className={styles.statusMessage} role="status">
                    <CheckCircle2 size={19} strokeWidth={2.4} aria-hidden="true" />
                    {statusMessage}
                </div>
            ) : null}

            <section className={styles.explainerCard}>
                <span>
                    <ShieldCheck size={34} strokeWidth={2.3} aria-hidden="true" />
                </span>
                <div>
                    <h2>Payment method selection happens in Flutterwave checkout</h2>
                    <p>
                        League OS should not store raw card, mobile money or bank details.
                        The platform should create a checkout request, receive payment
                        confirmation, then activate the club membership.
                    </p>
                </div>
                <Link to="/profile/payments">View Payments &amp; Receipts</Link>
            </section>

            <div className={styles.layoutGrid}>
                <main className={styles.mainColumn}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Confirm Membership Tier</h2>
                                <p>Choose the club tier you want to purchase, renew or upgrade.</p>
                            </div>
                        </div>

                        <div className={styles.tierGrid}>
                            {membership.tiers.map((tier) => (
                                <button
                                    type="button"
                                    className={`${styles.tierCard} ${selectedTier.id === tier.id ? styles.selectedTier : ""}`}
                                    key={tier.id}
                                    onClick={() => setSelectedTierId(tier.id)}
                                >
                                    <Crown size={28} strokeWidth={2.2} aria-hidden="true" />
                                    <div>
                                        <h3>{tier.name}</h3>
                                        <strong>{formatCurrency(tier.price)}</strong>
                                        <p>per season</p>
                                    </div>
                                    {tier.popular ? <span>Popular</span> : null}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Member Details</h2>
                                <p>
                                    These details will be used to create your club membership
                                    record and digital card.
                                </p>
                            </div>
                        </div>

                        <form className={styles.checkoutForm} onSubmit={handleCheckoutSubmit}>
                            <label>
                                <span>Full Name</span>
                                <div>
                                    <User size={18} strokeWidth={2.3} aria-hidden="true" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(event) => setFullName(event.target.value)}
                                    />
                                </div>
                            </label>

                            <label>
                                <span>Email Address</span>
                                <div>
                                    <Mail size={18} strokeWidth={2.3} aria-hidden="true" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                    />
                                </div>
                            </label>

                            <label>
                                <span>Phone Number</span>
                                <div>
                                    <Phone size={18} strokeWidth={2.3} aria-hidden="true" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                    />
                                </div>
                            </label>

                            <label className={styles.termsRow}>
                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={() =>
                                        setAcceptedTerms((currentValue) => !currentValue)
                                    }
                                />
                                <span>
                                    I confirm that I am purchasing a club membership from{" "}
                                    <strong>{membership.clubName}</strong>. League OS will manage
                                    the checkout record, receipt and digital card.
                                </span>
                            </label>

                            <button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} strokeWidth={2.4} aria-hidden="true" />
                                        Redirecting...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={18} strokeWidth={2.4} aria-hidden="true" />
                                        Pay with Flutterwave
                                    </>
                                )}
                            </button>
                        </form>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Checkout Flow</h2>
                                <p>
                                    This is how the final backend and payment integration should
                                    work.
                                </p>
                            </div>
                        </div>

                        <div className={styles.flowGrid}>
                            <article>
                                <span>1</span>
                                <div>
                                    <h3>Create checkout request</h3>
                                    <p>League OS sends selected tier and member details.</p>
                                </div>
                            </article>
                            <article>
                                <span>2</span>
                                <div>
                                    <h3>Redirect to Flutterwave</h3>
                                    <p>Flutterwave handles available payment options.</p>
                                </div>
                            </article>
                            <article>
                                <span>3</span>
                                <div>
                                    <h3>Confirm payment</h3>
                                    <p>Webhook or verification updates the payment status.</p>
                                </div>
                            </article>
                            <article>
                                <span>4</span>
                                <div>
                                    <h3>Activate membership</h3>
                                    <p>Digital card and club benefits become available.</p>
                                </div>
                            </article>
                        </div>
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.orderCard}>
                        <div className={styles.orderHeader}>
                            <img src={membership.logo} alt="" aria-hidden="true" />
                            <div>
                                <h2>{membership.clubName}</h2>
                                <p>{membership.sport}</p>
                            </div>
                        </div>

                        <div className={styles.selectedTierBlock}>
                            <Crown size={32} strokeWidth={2.2} aria-hidden="true" />
                            <div>
                                <span>Selected Tier</span>
                                <strong>{selectedTier.name}</strong>
                                <small>{membership.season}</small>
                            </div>
                        </div>

                        <div className={styles.priceList}>
                            <article>
                                <span>Membership price</span>
                                <strong>{formatCurrency(selectedTier.price)}</strong>
                            </article>
                            <article>
                                <span>Estimated service fee</span>
                                <strong>{formatCurrency(serviceFee)}</strong>
                            </article>
                            <article className={styles.totalRow}>
                                <span>Total</span>
                                <strong>{formatCurrency(totalAmount)}</strong>
                            </article>
                        </div>

                        <div className={styles.gatewayNotice}>
                            <Lock size={20} strokeWidth={2.4} aria-hidden="true" />
                            <p>
                                Final payment method and available channels will be handled by
                                Flutterwave checkout.
                            </p>
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <Smartphone size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>
                            <div>
                                <h2>Supported at Checkout</h2>
                                <p>Do not collect these details in this page.</p>
                            </div>
                        </div>

                        <div className={styles.methodList}>
                            <span>Mobile money options</span>
                            <span>Card checkout</span>
                            <span>Bank transfer where available</span>
                            <span>Payment status verification</span>
                        </div>
                    </section>

                    <section className={styles.warningCard}>
                        <ReceiptText size={42} strokeWidth={2.3} aria-hidden="true" />
                        <div>
                            <h2>Receipt after payment</h2>
                            <p>
                                Once payment is confirmed, the receipt and gateway reference
                                should appear in Payments & Receipts.
                            </p>
                        </div>
                        <Link to="/profile/payments">Open Payments &amp; Receipts</Link>
                    </section>

                    <section className={styles.supportCard}>
                        <FileText size={42} strokeWidth={2.3} aria-hidden="true" />
                        <div>
                            <h2>Membership record</h2>
                            <p>
                                After successful checkout, the digital card should appear in My
                                Club Memberships.
                            </p>
                        </div>
                        <Link to="/dashboard/memberships">Open My Memberships</Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default MembershipCheckoutPage;