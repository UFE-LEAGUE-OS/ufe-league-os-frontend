import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { verifyMembershipPayment } from "../../services/membershipCheckoutService";
import styles from "./MembershipCheckoutPage.module.css";

function MembershipPaymentProcessingPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [message, setMessage] = useState("Confirming your Flutterwave payment...");
    const [hasVerificationError, setHasVerificationError] = useState(false);

    const pendingCheckout = useMemo(() => {
        const stored = localStorage.getItem("league_os_pending_membership_checkout");

        if (!stored) return null;

        try {
            return JSON.parse(stored) as { tx_ref?: string };
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

    const status = (searchParams.get("status") || "").toLowerCase();

    useEffect(() => {
        let isMounted = true;

        async function verifyPayment() {
            if (!txRef) {
                localStorage.removeItem("league_os_pending_membership_checkout");
                navigate("/dashboard/memberships?payment=missing-reference", { replace: true });
                return;
            }

            if (status && !["successful", "success", "succeeded"].includes(status)) {
                localStorage.removeItem("league_os_pending_membership_checkout");
                navigate(
                    `/dashboard/memberships?payment=${encodeURIComponent(status)}&tx_ref=${encodeURIComponent(txRef)}`,
                    { replace: true },
                );
                return;
            }

            try {
                setMessage("Payment received. Activating your membership card...");
                await verifyMembershipPayment(txRef);

                if (!isMounted) return;

                localStorage.removeItem("league_os_pending_membership_checkout");
                navigate(`/dashboard/memberships?payment=success&tx_ref=${encodeURIComponent(txRef)}`, {
                    replace: true,
                });
            } catch {
                if (!isMounted) return;

                setHasVerificationError(true);
                setMessage(
                    "Payment was returned by Flutterwave, but League OS could not verify it automatically.",
                );

                window.setTimeout(() => {
                    navigate(
                        `/dashboard/memberships?payment=verification-failed&tx_ref=${encodeURIComponent(txRef)}`,
                        { replace: true },
                    );
                }, 2500);
            }
        }

        const timeoutId = window.setTimeout(() => {
            void verifyPayment();
        }, 250);

        return () => {
            isMounted = false;
            window.clearTimeout(timeoutId);
        };
    }, [navigate, status, txRef]);

    return (
        <section className={styles.page}>
            <div className={styles.notFoundCard}>
                {hasVerificationError ? (
                    <AlertTriangle size={48} strokeWidth={2.3} aria-hidden="true" />
                ) : (
                    <Loader2 size={48} strokeWidth={2.3} aria-hidden="true" />
                )}

                <div>
                    <h1>Verifying Membership Payment</h1>
                    <p>{message}</p>
                    <p>
                        Transaction reference: <strong>{txRef || "Missing reference"}</strong>
                    </p>
                    <p>
                        League OS will redirect you to your membership dashboard shortly.
                    </p>
                </div>

                <span>
                    <ShieldCheck size={18} strokeWidth={2.3} aria-hidden="true" />
                    Secure Flutterwave verification
                </span>

                <Link to="/dashboard/memberships">
                    Go to Membership Dashboard
                </Link>
            </div>
        </section>
    );
}

export default MembershipPaymentProcessingPage;
