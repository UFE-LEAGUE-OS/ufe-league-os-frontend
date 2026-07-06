from pathlib import Path

page_path = Path("src/pages/memberships/MyMembershipsPage.tsx")
processing_path = Path("src/pages/memberships/MembershipPaymentProcessingPage.tsx")
routes_path = Path("src/routes/AppRoutes.tsx")
css_path = Path("src/pages/memberships/MyMembershipsPage.module.css")

for path in [page_path, processing_path, routes_path, css_path]:
    if not path.exists():
        raise SystemExit(f"Could not find {path}")

# ---------------------------------------------------------------------
# 1) Make payment processing page visible and robust.
# ---------------------------------------------------------------------
processing_path.write_text('''import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
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
''')

# ---------------------------------------------------------------------
# 2) Ensure payment processing route is public.
# ---------------------------------------------------------------------
routes = routes_path.read_text()

protected_route = '                    <Route path="/memberships/payment/processing" element={<MembershipPaymentProcessingPage />} />\n'
public_route = '                <Route path="/memberships/payment/processing" element={<MembershipPaymentProcessingPage />} />\n'

routes = routes.replace(protected_route, "")

if public_route not in routes:
    anchor = '                <Route path="/tickets/payment/processing" element={<TicketPaymentProcessingPage />} />\n'

    if anchor in routes:
        routes = routes.replace(anchor, public_route + anchor)
    else:
        fallback_anchor = '                <Route path="/tickets" element={<Tickets />} />\n'

        if fallback_anchor not in routes:
            raise SystemExit("Could not find a safe public route anchor in AppRoutes.tsx")

        routes = routes.replace(fallback_anchor, fallback_anchor + public_route)

routes_path.write_text(routes)

# ---------------------------------------------------------------------
# 3) Limit active membership cards to 2 per page.
# ---------------------------------------------------------------------
page = page_path.read_text()

if "const ACTIVE_MEMBERSHIPS_PER_PAGE = 2;" not in page:
    page = page.replace(
        "const expiredMemberships: ClubMembership[] = [];\n",
        "const expiredMemberships: ClubMembership[] = [];\n\nconst ACTIVE_MEMBERSHIPS_PER_PAGE = 2;\n",
    )

if '    subscriptionId: number;\n' in page and '    subscriptionId: 0,\n' not in page:
    page = page.replace(
        '    id: "empty-membership",\n    clubName: "No active membership",\n',
        '    id: "empty-membership",\n    subscriptionId: 0,\n    clubName: "No active membership",\n',
    )

if "const [activeMembershipPage, setActiveMembershipPage]" not in page:
    page = page.replace(
        "    const [activeMemberships, setActiveMemberships] = useState<ClubMembership[]>([]);\n",
        "    const [activeMemberships, setActiveMemberships] = useState<ClubMembership[]>([]);\n"
        "    const [activeMembershipPage, setActiveMembershipPage] = useState(1);\n",
    )

if "const activeMembershipPageCount =" not in page:
    marker = '''    const filteredExpiredMemberships = useMemo(
        () =>
            expiredMemberships.filter((membership) =>
                `${membership.clubName} ${membership.tier} ${membership.sport}`
                    .toLowerCase()
                    .includes(normalizedSearchQuery),
            ),
        [normalizedSearchQuery],
    );
'''

    insert = '''    const activeMembershipPageCount = Math.max(
        1,
        Math.ceil(filteredActiveMemberships.length / ACTIVE_MEMBERSHIPS_PER_PAGE),
    );

    const paginatedActiveMemberships = useMemo(() => {
        const startIndex = (activeMembershipPage - 1) * ACTIVE_MEMBERSHIPS_PER_PAGE;

        return filteredActiveMemberships.slice(
            startIndex,
            startIndex + ACTIVE_MEMBERSHIPS_PER_PAGE,
        );
    }, [activeMembershipPage, filteredActiveMemberships]);

    useEffect(() => {
        setActiveMembershipPage(1);
    }, [normalizedSearchQuery]);

    useEffect(() => {
        if (activeMembershipPage > activeMembershipPageCount) {
            setActiveMembershipPage(activeMembershipPageCount);
        }
    }, [activeMembershipPage, activeMembershipPageCount]);

'''

    if marker not in page:
        raise SystemExit("Could not find filteredExpiredMemberships marker.")

    page = page.replace(marker, insert + marker)

old_active_cards = '''                            {filteredActiveMemberships.length > 0 ? (
                                <div className={styles.cardGrid}>
                                    {filteredActiveMemberships.map((membership) => (
                                        <MembershipCard
                                            membership={membership}
                                            key={membership.id}
                                        />
                                    ))}
                                </div>
                            ) : ('''

new_active_cards = '''                            {filteredActiveMemberships.length > 0 ? (
                                <>
                                    <div className={styles.cardGrid}>
                                        {paginatedActiveMemberships.map((membership) => (
                                            <MembershipCard
                                                membership={membership}
                                                key={membership.id}
                                            />
                                        ))}
                                    </div>

                                    {activeMembershipPageCount > 1 ? (
                                        <div className={styles.membershipPagination}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveMembershipPage((pageNumber) =>
                                                        Math.max(1, pageNumber - 1),
                                                    )
                                                }
                                                disabled={activeMembershipPage === 1}
                                            >
                                                Previous
                                            </button>

                                            <div>
                                                {Array.from(
                                                    { length: activeMembershipPageCount },
                                                    (_, index) => index + 1,
                                                ).map((pageNumber) => (
                                                    <button
                                                        type="button"
                                                        key={pageNumber}
                                                        className={
                                                            pageNumber === activeMembershipPage
                                                                ? styles.activeMembershipPage
                                                                : ""
                                                        }
                                                        onClick={() =>
                                                            setActiveMembershipPage(pageNumber)
                                                        }
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveMembershipPage((pageNumber) =>
                                                        Math.min(
                                                            activeMembershipPageCount,
                                                            pageNumber + 1,
                                                        ),
                                                    )
                                                }
                                                disabled={
                                                    activeMembershipPage ===
                                                    activeMembershipPageCount
                                                }
                                            >
                                                Next
                                            </button>
                                        </div>
                                    ) : null}
                                </>
                            ) : ('''

if old_active_cards not in page:
    raise SystemExit("Could not find active membership card grid block.")

page = page.replace(old_active_cards, new_active_cards)

page_path.write_text(page)

# ---------------------------------------------------------------------
# 4) Add pagination styling.
# ---------------------------------------------------------------------
css = css_path.read_text()

if ".membershipPagination" not in css:
    css += '''

.membershipPagination {
    margin-top: 22px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
}

.membershipPagination > div {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.membershipPagination button {
    min-width: 38px;
    min-height: 38px;
    border-radius: 12px;
    padding: 0 14px;

    color: rgba(255, 255, 255, 0.82);
    background: rgba(11, 18, 32, 0.82);
    border: 1px solid rgba(255, 255, 255, 0.13);

    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
}

.membershipPagination button:hover:not(:disabled),
.membershipPagination button:focus-visible:not(:disabled) {
    transform: translateY(-1px);
    border-color: rgba(249, 115, 22, 0.58);
    color: #ffffff;
}

.membershipPagination button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.membershipPagination .activeMembershipPage {
    color: #ffffff;
    background: linear-gradient(135deg, #7c3aed, #f97316);
    border-color: rgba(255, 255, 255, 0.18);
}
'''

css_path.write_text(css)

print("Payment processing page and two-card membership pagination updated.")
