import {
    AlertTriangle,
    ArrowLeft,
    CreditCard,
    HelpCircle,
    Lock,
    RefreshCw,
    ReceiptText,
    ShieldCheck,
    Smartphone,
    XCircle,
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import styles from "./MembershipFailedPage.module.css";

const failedMemberships = [
    {
        slug: "kobs",
        clubName: "KCB KOBS",
        sport: "Rugby Club",
        logo: "/assets/clubs/kobs.jpg",
        defaultTier: "Gold Member",
        supportReference: "KOBS-MEM-FAILED-001",
    },
    {
        slug: "sc-villa",
        clubName: "SC Villa",
        sport: "Football Club",
        logo: "/assets/clubs/sc-villa.png",
        defaultTier: "Silver Member",
        supportReference: "SCV-MEM-FAILED-001",
    },
    {
        slug: "city-oilers",
        clubName: "City Oilers",
        sport: "Basketball Club",
        logo: "/assets/clubs/city-oilers.png",
        defaultTier: "Courtside Member",
        supportReference: "OILERS-MEM-FAILED-001",
    },
    {
        slug: "vipers-sc",
        clubName: "Vipers SC",
        sport: "Football Club",
        logo: "/assets/clubs/vipers-sc.png",
        defaultTier: "Fan Member",
        supportReference: "VIPERS-MEM-FAILED-001",
    },
    {
        slug: "black-pirates",
        clubName: "Black Pirates",
        sport: "Rugby Club",
        logo: "/assets/clubs/black-pirates.png",
        defaultTier: "Bronze Member",
        supportReference: "PIRATES-MEM-FAILED-001",
    },
    {
        slug: "kcca-fc",
        clubName: "KCCA FC",
        sport: "Football Club",
        logo: "/assets/clubs/kcca-fc.png",
        defaultTier: "Family Member",
        supportReference: "KCCA-MEM-FAILED-001",
    },
    {
        slug: "impis-rfc",
        clubName: "IMPIS RFC",
        sport: "Rugby Club",
        logo: "/assets/clubs/impis-rfc.jpg",
        defaultTier: "Fan Member",
        supportReference: "IMPIS-MEM-FAILED-001",
    },
    {
        slug: "platinum-heathens",
        clubName: "Platinum Credit Heathens",
        sport: "Rugby Club",
        logo: "/assets/clubs/platinum-heathens.jpg",
        defaultTier: "Gold Member",
        supportReference: "HEATHENS-MEM-FAILED-001",
    },
    {
        slug: "namuwongo-blazers",
        clubName: "Namuwongo Blazers",
        sport: "Basketball Club",
        logo: "/assets/clubs/namuwongo-blazers.png",
        defaultTier: "Fan Member",
        supportReference: "BLAZERS-MEM-FAILED-001",
    },
];

function MembershipFailedPage() {
    const { clubSlug } = useParams();
    const [searchParams] = useSearchParams();

    const membership = failedMemberships.find((item) => item.slug === clubSlug);
    const reasonFromQuery = searchParams.get("reason");

    if (!membership) {
        return (
            <section className={styles.page}>
                <div className={styles.notFoundCard}>
                    <AlertTriangle size={48} strokeWidth={2.3} aria-hidden="true" />

                    <div>
                        <h1>Failed payment page not found</h1>
                        <p>
                            We could not find that club membership payment page. Return to
                            the membership directory and choose another club.
                        </p>
                    </div>

                    <Link to="/memberships">Back to Club Memberships</Link>
                </div>
            </section>
        );
    }

    const failureReason =
        reasonFromQuery ??
        "The payment was not completed or could not be confirmed by the payment provider.";

    return (
        <section className={styles.page}>
            <Link to={`/memberships/${membership.slug}/checkout`} className={styles.backLink}>
                <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
                Back to Checkout
            </Link>

            <header className={styles.failedHero}>
                <span className={styles.failedIcon}>
                    <XCircle size={54} strokeWidth={2.3} aria-hidden="true" />
                </span>

                <div>
                    <p>Payment Not Completed</p>
                    <h1>{membership.clubName} Membership Was Not Activated</h1>
                    <span>
                        Your club membership has not been created because payment confirmation
                        was not received.
                    </span>
                </div>
            </header>

            <div className={styles.layoutGrid}>
                <main className={styles.mainColumn}>
                    <section className={styles.failureCard}>
                        <div className={styles.clubHeader}>
                            <img src={membership.logo} alt="" aria-hidden="true" />

                            <div>
                                <h2>{membership.clubName}</h2>
                                <p>
                                    {membership.defaultTier} • {membership.sport}
                                </p>
                            </div>

                            <span>Failed</span>
                        </div>

                        <div className={styles.reasonBlock}>
                            <AlertTriangle size={34} strokeWidth={2.3} aria-hidden="true" />

                            <div>
                                <h3>Why this may have happened</h3>
                                <p>{failureReason}</p>
                            </div>
                        </div>

                        <div className={styles.actionGrid}>
                            <Link to={`/memberships/${membership.slug}/checkout`}>
                                <RefreshCw size={18} strokeWidth={2.4} aria-hidden="true" />
                                Retry Checkout
                            </Link>

                            <Link to={`/memberships/${membership.slug}`}>
                                View Membership Tiers
                            </Link>

                            <Link to="/profile/payments">
                                Check Payments &amp; Receipts
                            </Link>
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>What to check before retrying</h2>
                                <p>
                                    These checks help avoid duplicate failed payments and make the
                                    support process easier.
                                </p>
                            </div>
                        </div>

                        <div className={styles.checkGrid}>
                            <article>
                                <Smartphone size={24} strokeWidth={2.4} aria-hidden="true" />
                                <div>
                                    <h3>Confirm mobile money approval</h3>
                                    <p>
                                        Make sure you approved the payment prompt on your phone
                                        before closing checkout.
                                    </p>
                                </div>
                            </article>

                            <article>
                                <CreditCard size={24} strokeWidth={2.4} aria-hidden="true" />
                                <div>
                                    <h3>Check card or payment limits</h3>
                                    <p>
                                        Some failed attempts happen because of daily transaction
                                        limits or declined card authorization.
                                    </p>
                                </div>
                            </article>

                            <article>
                                <ReceiptText size={24} strokeWidth={2.4} aria-hidden="true" />
                                <div>
                                    <h3>Check if money was deducted</h3>
                                    <p>
                                        If money was deducted but membership was not activated,
                                        contact support with the reference below.
                                    </p>
                                </div>
                            </article>

                            <article>
                                <Lock size={24} strokeWidth={2.4} aria-hidden="true" />
                                <div>
                                    <h3>Do not enter payment details here</h3>
                                    <p>
                                        Payment method selection and sensitive payment details
                                        should remain inside Flutterwave checkout.
                                    </p>
                                </div>
                            </article>
                        </div>
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.supportCard}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <HelpCircle size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Need help?</h2>
                                <p>Use this reference when contacting support.</p>
                            </div>
                        </div>

                        <div className={styles.referenceBox}>
                            <span>Support Reference</span>
                            <strong>{membership.supportReference}</strong>
                        </div>

                        <Link to="/profile/support" className={styles.primarySideLink}>
                            Contact Support
                        </Link>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <ShieldCheck size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Membership status</h2>
                                <p>Your membership is still inactive.</p>
                            </div>
                        </div>

                        <div className={styles.statusList}>
                            <article>
                                <span>Payment status</span>
                                <strong>Not confirmed</strong>
                            </article>

                            <article>
                                <span>Membership status</span>
                                <strong>Not activated</strong>
                            </article>

                            <article>
                                <span>Digital card</span>
                                <strong>Not issued</strong>
                            </article>
                        </div>
                    </section>

                    <section className={styles.warningCard}>
                        <AlertTriangle size={42} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Avoid duplicate payments</h2>
                            <p>
                                If your account was charged, do not retry immediately. First check
                                Payments & Receipts or contact support.
                            </p>
                        </div>

                        <Link to="/profile/payments">Open Payments &amp; Receipts</Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default MembershipFailedPage;