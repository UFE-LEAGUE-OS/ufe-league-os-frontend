import apiClient from "./apiClient.js";

export interface BackendMembershipCard {
    id: number;
    subscription: number;
    user: number;
    user_email: string;
    club: number;
    club_name: string;
    card_number: string;
    qr_code_data: string;
    tier: string;
    billing_cycle: string;
    issued_at: string;
    valid_from: string;
    valid_until: string;
    status: string;
    metadata?: Record<string, unknown>;
}

export interface BackendMembershipSubscription {
    id: number;
    user: number;
    user_email: string;
    plan: number;
    plan_name: string;
    club: number;
    club_name: string;
    status: string;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
    card?: BackendMembershipCard | null;
}

export interface BackendMembershipPayment {
    id: number;
    subscription: number;
    subscription_plan: number | null;
    amount_paid: string;
    currency: string;
    payment_method: string;
    provider: string;
    transaction_reference: string;
    provider_transaction_id: string;
    provider_status: string;
    provider_response?: Record<string, unknown>;
    checkout_url: string;
    paid_at: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface BackendMembershipPaymentsResponse {
    count: number;
    results: BackendMembershipPayment[];
}

function isNotFoundError(error: unknown) {
    return (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { status?: number } }).response === "object" &&
        (error as { response?: { status?: number } }).response?.status === 404
    );
}

export async function getMyMembership(): Promise<BackendMembershipSubscription | null> {
    try {
        const response = await apiClient.get<BackendMembershipSubscription>(
            "/memberships/my-membership/",
        );

        return response.data;
    } catch (error) {
        if (isNotFoundError(error)) {
            return null;
        }

        throw error;
    }
}

export async function createMyMembershipCard(): Promise<BackendMembershipCard | null> {
    try {
        const response = await apiClient.post<BackendMembershipCard>(
            "/memberships/card/",
            {},
        );

        return response.data;
    } catch (error) {
        if (isNotFoundError(error)) {
            return null;
        }

        throw error;
    }
}

export async function getMembershipPayments(
    subscriptionId?: number,
): Promise<BackendMembershipPayment[]> {
    const params = subscriptionId ? { subscription: subscriptionId } : undefined;

    const response = await apiClient.get<BackendMembershipPaymentsResponse>(
        "/memberships/payments/",
        { params },
    );

    return response.data.results ?? [];
}
