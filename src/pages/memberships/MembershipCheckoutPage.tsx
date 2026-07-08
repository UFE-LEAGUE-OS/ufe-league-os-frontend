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
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { initializeMembershipCheckout } from "../../services/membershipCheckoutService";
import {
    formatMembershipCurrency,
    getMembershipCatalogForClubSlug,
    type MembershipClubCatalog,
} from "../../services/membershipService";
import styles from "./MembershipCheckoutPage.module.css";

function MembershipCheckoutPage() {
    const { clubSlug = "" } = useParams();
    const [searchParams] = useSearchParams();
    const requestedPlanId = searchParams.get("plan");
    const navigate = useNavigate();
    const { currentUser } = useCurrentUser();

    const [membership, setMembership] = useState<MembershipClubCatalog | null>(null);
    const [selectedTierId, setSelectedTierId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [fullName, setFullName] = useState(
        currentUser.name && currentUser.name !== "Fan" ? currentUser.name : "",
    );
    const [email, setEmail] = useState(
        currentUser.email && currentUser.email !== "No email available"
            ? currentUser.email
            : "",
    );
    const [phone, setPhone] = useState(
        currentUser.phoneNumber && currentUser.phoneNumber !== "No phone number added"
            ? currentUser.phoneNumber
            : "",
    );
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                    "Could not load this membership checkout from the backend.",
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

    if (isLoading) {
        return (
            <section className={styles.page}>
                <div className={styles.notFoundCard}>
                    <Loader2 size={48} strokeWidth={2.3} aria-hidden="true" />
                    <div>
                        <h1>Loading checkout</h1>
                        <p>League OS is loading the selected membership plan from the backend.</p>
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
                        <h1>Checkout page not found</h1>
                        <p>
                            {errorMessage ||
                                "We could not find that club membership checkout in the backend catalogue."}
                        </p>
                    </div>
                    <Link to="/memberships">Back to Club Memberships</Link>
                </div>
            </section>
        );
    }

    const serviceFee = Math.round(selectedTier.priceAmount * 0.03);
    const totalAmount = selectedTier.priceAmount + serviceFee;

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
                plan: selectedTier.id,
            });

            localStorage.setItem(
                "league_os_pending_membership_checkout",
                JSON.stringify({
                    tx_ref: response.tx_ref,
                    club_slug: membership.clubSlug,
                    tier_id: String(selectedTier.id),
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
                    club_slug: membership.clubSlug,
                    tier_id: String(selectedTier.id),
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
            <Link
                to={`/memberships/${membership.clubSlug}?plan=${selectedTier.id}`}
                className={styles.backLink}
            >
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
                        The platform creates a backend checkout request using the selected
                        membership plan ID, receives payment confirmation, then activates the
                        club membership.
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
                                <p>Choose the backend club tier you want to purchase, renew or upgrade.</p>
                            </div>
                        </div>

                        <div className={styles.tierGrid}>
                            {membership.plans.map((tier) => (
                                <button
                                    type="button"
                                    className={`${styles.tierCard} ${selectedTier.id === tier.id ? styles.selectedTier : ""}`}
                                    key={tier.id}
                                    onClick={() => setSelectedTierId(String(tier.id))}
                                >
                                    <Crown size={28} strokeWidth={2.2} aria-hidden="true" />
                                    <div>
                                        <h3>{tier.name}</h3>
                                        <strong>{tier.priceLabel}</strong>
                                        <p>{tier.billingLabel}</p>
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
                                    <p>League OS sends the selected backend plan ID.</p>
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
                                <p>{membership.sportLabel} Club</p>
                            </div>
                        </div>

                        <div className={styles.selectedTierBlock}>
                            <Crown size={32} strokeWidth={2.2} aria-hidden="true" />
                            <div>
                                <span>Selected Tier</span>
                                <strong>{selectedTier.name}</strong>
                                <small>Backend plan ID: {selectedTier.id}</small>
                            </div>
                        </div>

                        <div className={styles.priceList}>
                            <article>
                                <span>Membership price</span>
                                <strong>{selectedTier.priceLabel}</strong>
                            </article>
                            <article>
                                <span>Estimated service fee</span>
                                <strong>
                                    {formatMembershipCurrency(serviceFee, selectedTier.currency)}
                                </strong>
                            </article>
                            <article className={styles.totalRow}>
                                <span>Total</span>
                                <strong>
                                    {formatMembershipCurrency(totalAmount, selectedTier.currency)}
                                </strong>
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