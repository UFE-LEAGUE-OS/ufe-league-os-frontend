import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { verifyMembershipPayment } from "../../services/membershipCheckoutService";
import styles from "./MembershipCheckoutPage.module.css";

function MembershipPaymentProcessingPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const pendingCheckout = useMemo(() => {
        const stored = localStorage.getItem("league_os_pending_membership_checkout");

        if (!stored) return null;

        try {
            return JSON.parse(stored) as {
                tx_ref?: string;
                club_slug?: string;
                tier_id?: string;
            };
        } catch {
            return null;
        }
    }, []);

    const txRef =
        searchParams.get("tx_ref") ||
        searchParams.get("reference") ||
        (location.state as { tx_ref?: string } | null)?.tx_ref ||
        pendingCheckout?.tx_ref ||
        "";

    const clubSlug =
        (location.state as { club_slug?: string } | null)?.club_slug ||
        pendingCheckout?.club_slug ||
        "kobs";

    const tierId =
        (location.state as { tier_id?: string } | null)?.tier_id ||
        pendingCheckout?.tier_id ||
        "kobs-gold";

    useEffect(() => {
        let isMounted = true;

        const timeoutId = window.setTimeout(() => {
            async function verifyPayment() {
                if (!txRef) {
                    navigate(`/memberships/${clubSlug}/failed?reason=Missing payment reference`, {
                        replace: true,
                    });
                    return;
                }

                try {
                    await verifyMembershipPayment(txRef);

                    if (!isMounted) return;

                    localStorage.removeItem("league_os_pending_membership_checkout");

                    navigate(`/memberships/${clubSlug}/success?tier=${tierId}`, {
                        replace: true,
                    });
                } catch {
                    if (!isMounted) return;

                    navigate(
                        `/memberships/${clubSlug}/failed?reason=Flutterwave payment verification failed`,
                        { replace: true },
                    );
                }
            }

            void verifyPayment();
        }, 0);

        return () => {
            isMounted = false;
            window.clearTimeout(timeoutId);
        };
    }, [clubSlug, navigate, tierId, txRef]);

    return (
        <section className={styles.page}>
            <div className={styles.notFoundCard}>
                <Loader2 size={48} strokeWidth={2.3} aria-hidden="true" />
                <div>
                    <h1>Verifying Membership Payment</h1>
                    <p>
                        Please wait while League OS confirms your Flutterwave payment and
                        activates your digital membership card.
                    </p>
                </div>
                <span>
                    <ShieldCheck size={18} strokeWidth={2.3} aria-hidden="true" />
                    Secure Flutterwave verification
                </span>
            </div>
        </section>
    );
}

export default MembershipPaymentProcessingPage;
