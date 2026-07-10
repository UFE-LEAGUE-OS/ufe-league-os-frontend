import apiClient from './apiClient.js';

export interface InitializeMembershipCheckoutResponse {
  message: string;
  payment: {
    id: number;
    transaction_reference: string;
    checkout_url: string;
    status: string;
  };
  subscription: {
    id: number;
    plan_name: string;
    club_name: string;
    status: string;
  };
  tx_ref: string;
  checkout_url: string;
}

export interface InitializeMembershipCheckoutPayload {
  plan?: number;
  subscription?: number;
  demo_plan_code?: string;
  tier_id?: string;
}

export async function initializeMembershipCheckout(
  payload: InitializeMembershipCheckoutPayload,
): Promise<InitializeMembershipCheckoutResponse> {
  const response = await apiClient.post<InitializeMembershipCheckoutResponse>(
    '/memberships/initiate-payment/',
    payload,
  );

  return response.data;
}

export async function verifyMembershipPayment(txRef: string) {
  const response = await apiClient.get(
    `/memberships/flutterwave/verify/?tx_ref=${encodeURIComponent(txRef)}`,
  );

  return response.data;
}
