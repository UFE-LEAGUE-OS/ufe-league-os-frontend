from pathlib import Path

routes_path = Path("src/routes/AppRoutes.tsx")
processing_path = Path("src/pages/memberships/MembershipPaymentProcessingPage.tsx")
service_path = Path("src/services/fanMembershipService.ts")
page_path = Path("src/pages/memberships/MyMembershipsPage.tsx")
css_path = Path("src/pages/memberships/MyMembershipsPage.module.css")

for path in [routes_path, processing_path, service_path, page_path, css_path]:
    if not path.exists():
        raise SystemExit(f"Could not find {path}")

routes = routes_path.read_text()
protected_route = '                    <Route path="/memberships/payment/processing" element={<MembershipPaymentProcessingPage />} />\n'
public_route = '                <Route path="/memberships/payment/processing" element={<MembershipPaymentProcessingPage />} />\n'
routes = routes.replace(protected_route, "")

if public_route not in routes:
    anchor = '                <Route path="/tickets" element={<Tickets />} />\n'
    if anchor in routes:
        routes = routes.replace(anchor, anchor + public_route)
    else:
        raise SystemExit("Could not find public route anchor in AppRoutes.tsx")

routes_path.write_text(routes)

processing_path.write_text('''import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { verifyMembershipPayment } from "../../services/membershipCheckoutService";
import styles from "./MembershipCheckoutPage.module.css";

function MembershipPaymentProcessingPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [message, setMessage] = useState("Confirming your Flutterwave payment...");

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

                localStorage.removeItem("league_os_pending_membership_checkout");
                navigate(
                    `/dashboard/memberships?payment=verification-failed&tx_ref=${encodeURIComponent(txRef)}`,
                    { replace: true },
                );
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
                <Loader2 size={48} strokeWidth={2.3} aria-hidden="true" />
                <div>
                    <h1>Verifying Membership Payment</h1>
                    <p>{message}</p>
                    <p>
                        Keep this page open. League OS will redirect you to your membership
                        dashboard as soon as confirmation is complete.
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
''')

service = service_path.read_text()

if "club_slug: string;" not in service:
    service = service.replace(
        "    club_name: string;\n",
        "    club_name: string;\n    club_slug: string;\n    club_logo_url: string;\n",
    )

if "export interface BackendMembershipSubscriptionsResponse" not in service:
    service = service.replace(
        "export interface BackendMembershipPaymentsResponse {\n    count: number;\n    results: BackendMembershipPayment[];\n}\n",
        '''export interface BackendMembershipPaymentsResponse {
    count: number;
    results: BackendMembershipPayment[];
}

export interface BackendMembershipSubscriptionsResponse {
    count: number;
    results: BackendMembershipSubscription[];
}
''',
    )

if "export async function getMyMemberships" not in service:
    anchor = "export async function getMyMembership(): Promise<BackendMembershipSubscription | null> {"
    service = service.replace(
        anchor,
        '''export async function getMyMemberships(): Promise<BackendMembershipSubscription[]> {
    const response = await apiClient.get<BackendMembershipSubscriptionsResponse>(
        "/memberships/subscriptions/",
    );

    return response.data.results ?? [];
}

''' + anchor,
    )

service_path.write_text(service)

page = page_path.read_text()
page = page.replace(
    "    createMyMembershipCard,\n    getMembershipPayments,\n    getMyMembership,\n",
    "    getMembershipPayments,\n    getMyMemberships,\n",
)
page = page.replace("    slug: string;\n", "    slug: string;\n    subscriptionId: number;\n")
page = page.replace(
    "        id: String(subscription.id),\n        clubName:",
    "        id: String(subscription.id),\n        subscriptionId: subscription.id,\n        clubName:",
)
page = page.replace(
    '        slug: makeSlug(subscription.club_name || activeCard?.club_name || "club-membership"),\n',
    '        slug: subscription.club_slug || makeSlug(subscription.club_name || activeCard?.club_name || "club-membership"),\n',
)
page = page.replace('        logo: "",\n', '        logo: subscription.club_logo_url || "",\n')

old_load = '''        try {
            const subscription = await getMyMembership();

            if (!subscription) {
                setActiveMemberships([]);
                setMembershipPayments([]);
                return;
            }

            const card = subscription.card ?? (await createMyMembershipCard());
            const payments = await getMembershipPayments(subscription.id);

            setActiveMemberships([mapBackendMembership(subscription, card)]);
            setMembershipPayments(payments);
        } catch {'''

new_load = '''        try {
            const subscriptions = await getMyMemberships();
            const activeSubscriptions = subscriptions.filter(
                (subscription) => subscription.status.toUpperCase() === "ACTIVE",
            );
            const payments = await getMembershipPayments();

            setActiveMemberships(
                activeSubscriptions.map((subscription) =>
                    mapBackendMembership(subscription, subscription.card ?? null),
                ),
            );
            setMembershipPayments(payments);
        } catch {'''

if old_load in page:
    page = page.replace(old_load, new_load)

page = page.replace(
    '''<Link to={`/memberships/${primaryMembership.slug}`}>
                            View Card Details
                        </Link>''',
    '''<button type="button" onClick={() => setActiveTab("active")}>
                            View Card Details
                        </button>''',
)

page_path.write_text(page)

css = css_path.read_text()
css = css.replace(".digitalCardPreview a,", ".digitalCardPreview a,\n.digitalCardPreview button,")
css = css.replace(".digitalCardPreview a:hover,", ".digitalCardPreview a:hover,\n.digitalCardPreview button:hover,")

if ".digitalCardPreview button {" not in css:
    css += '''

.digitalCardPreview button {
    width: 100%;
    border: 0;
    cursor: pointer;
}
'''

css_path.write_text(css)

print("Frontend membership payment redirect and multi-card fixes applied.")
