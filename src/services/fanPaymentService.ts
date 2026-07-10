import apiClient from './apiClient.js';

export interface BackendPaymentItem {
  id: string;
  source: string;
  source_id?: number;
  payment_type: string;
  payment_type_label: string;
  amount: string | number;
  currency: string;
  status: string;
  status_label: string;
  reference: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at?: string;
}

export interface WalletSummary {
  stored_balance_enabled: boolean;
  balance: string | number;
  balance_note: string;
  currency: string;
  total_spent: string | number;
  successful_payments_count: number;
  pending_payments_count: number;
  failed_payments_count: number;
  refunded_payments_count: number;
  tickets_count: number;
  memberships_count: number;
  sponsorships_count: number;
  recent_payments: BackendPaymentItem[];
  tickets: unknown[];
  memberships: unknown[];
  sponsorships: unknown[];
}

export interface PaymentHistoryResponse {
  count: number;
  limit: number;
  offset: number;
  results: BackendPaymentItem[];
}

export async function getFanWalletSummary(limit = 10): Promise<WalletSummary> {
  const response = await apiClient.get<WalletSummary>('/accounts/wallet/', {
    params: { limit },
  });

  return response.data;
}

export async function getFanPaymentHistory(limit = 50): Promise<PaymentHistoryResponse> {
  const response = await apiClient.get<PaymentHistoryResponse>('/accounts/payments/', {
    params: { limit },
  });

  return response.data;
}
