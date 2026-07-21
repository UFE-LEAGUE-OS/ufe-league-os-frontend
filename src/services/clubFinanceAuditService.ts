// src/services/financeAuditService.ts
//
// Service layer backing the club "Finance & Audit" page
// (see pages/club-admin/finance-audit/FinanceAudit.tsx).
//
// Mirrors the conventions used in userManagementService.ts:
//   1. Uses the shared `apiClient` (axios instance with baseURL + auth
//      header already configured), exported from "./apiClient".
//   2. Re-uses `getApiErrorMessage` from adminWorkspaceService.ts for
//      consistent 403 / validation error surfacing.
//   3. Endpoint paths follow the `/clubs/:clubId/...` shape used
//      elsewhere in the club-admin API. Adjust the *Base() helpers below
//      if your actual DRF routes differ — everything else in this file
//      is independent of the exact URL shape.
//
// NOTE: Membership Payments and Ticketing Payments both have fully
// fleshed-out UIs. Income & expense / invoices / audit trail endpoints
// are still stubs so those tabs can be wired up incrementally without
// touching this file's structure.

import apiClient from "./apiClient";
import { getApiErrorMessage } from "./adminWorkspaceService";

/* ------------------------------------------------------------------ */
/* Shared types                                                        */
/* ------------------------------------------------------------------ */

export type TrendDirection = "up" | "down";

export type FinanceStatFooter =
  | { kind: "trend"; direction: TrendDirection; value: string; caption: string }
  | { kind: "note"; value: string; caption: string };

export interface FinanceStat {
  key: string;
  label: string;
  value: string;
  accent: string;
  sparkline: number[];
  footer: FinanceStatFooter;
}

export interface FinanceOverview {
  stats: FinanceStat[];
}

export interface DateRangeParams {
  start_date?: string; // ISO date, e.g. "2026-06-01"
  end_date?: string; // ISO date, e.g. "2026-07-17"
}

export type PaymentRecordStatus =
  | "COMPLETED"
  | "PENDING"
  | "FAILED"
  | "REFUNDED";

/* ------------------------------------------------------------------ */
/* Membership payments                                                 */
/* ------------------------------------------------------------------ */

export type MembershipPaymentStatus = PaymentRecordStatus;

export interface MembershipPaymentRecord {
  id: string;
  memberName: string;
  memberRef: string;
  plan: string;
  amount: number;
  method: string;
  transactionId: string;
  status: MembershipPaymentStatus;
  paidAt: string;
}

export interface PlanBreakdownSlice {
  plan: string;
  amount: number;
  memberCount: number;
  share: number;
  color: string;
}

export interface MembershipPaymentsSummary {
  totalCollected: number;
  successfulPayments: number;
  pendingPayments: number;
  refunded: number;
}

export interface RevenueTrendPoint {
  date: string; // ISO date, e.g. "2026-07-01"
  amount: number;
}

export interface MonthlyRevenuePoint {
  month: string; // short label, e.g. "Feb"
  amount: number;
}

export interface MembershipPaymentsStats {
  totalRevenue: FinanceStat;
  activeMembers: FinanceStat;
  renewals: FinanceStat;
  expiredMemberships: FinanceStat;
  refunds: FinanceStat;
}

export interface MembershipPaymentsData {
  stats: MembershipPaymentsStats;
  summary: MembershipPaymentsSummary;
  revenueTrend: RevenueTrendPoint[];
  monthlyRevenue: MonthlyRevenuePoint[];
  planBreakdown: PlanBreakdownSlice[];
  payments: MembershipPaymentRecord[];
  availablePlans: string[];
  availablePaymentMethods: string[];
}

export interface MembershipPaymentsParams extends DateRangeParams {
  plan?: string; // "ALL" or a specific plan name
  payment_method?: string; // "ALL" or a specific method
  status?: MembershipPaymentStatus | "ALL";
  search?: string; // matches member, plan, or transaction reference
  page?: number;
  page_size?: number;
}

/* ------------------------------------------------------------------ */
/* Ticketing payments                                                  */
/* ------------------------------------------------------------------ */

export type TicketingPaymentStatus = PaymentRecordStatus;

// Sales trend period toggle shown above the "Ticket Sales Trend" chart.
export type TicketingTrendPeriod = "7d" | "30d" | "90d";

export interface TicketSalesTrendPoint {
  date: string; // ISO date, e.g. "2026-07-01"
  amount: number;
}

export interface PaymentMethodSlice {
  method: string; // e.g. "Mobile Money", "Card Payments", "Bank Transfer"
  amount: number;
  share: number; // 0..1, fraction of total
  color: string;
}

// One row in the "Revenue by Match" list (current period, e.g. "This month").
export interface MatchRevenueSlice {
  matchId: number;
  matchLabel: string; // e.g. "Arua Utd vs Vipers SC"
  amount: number;
  share: number; // 0..1 relative to the highest-earning match, for bar width
}

// One row in the "Upcoming Matches Revenue" table.
export interface UpcomingMatchRevenue {
  matchId: number;
  matchLabel: string;
  matchDate: string; // ISO date
  expectedRevenue: number;
  ticketsSold: number;
  ticketsAvailable: number;
}

export interface TicketingPaymentRecord {
  id: string;
  buyerName: string;
  matchLabel: string;
  ticketsCount: number;
  amount: number;
  method: string;
  status: TicketingPaymentStatus;
  paidAt: string;
}

// The six headline stat cards at the top of the page (Tickets Sold,
// Total Revenue, Online Payments, Mobile Money, Failed Payments,
// Refund Requests), each with a value and a % delta vs. the prior
// 30 days, matching the mockup.
export interface TicketingPaymentsStats {
  ticketsSold: FinanceStat;
  totalRevenue: FinanceStat;
  onlinePayments: FinanceStat;
  mobileMoney: FinanceStat;
  failedPayments: FinanceStat;
  refundRequests: FinanceStat;
}

export interface TicketingPaymentsData {
  stats: TicketingPaymentsStats;
  salesTrend: TicketSalesTrendPoint[];
  paymentMethodBreakdown: PaymentMethodSlice[];
  revenueByMatch: MatchRevenueSlice[];
  upcomingMatchesRevenue: UpcomingMatchRevenue[];
  payments: TicketingPaymentRecord[];
  availableMatches: { id: number; label: string }[];
  availablePaymentMethods: string[];
}

export interface TicketingPaymentsParams extends DateRangeParams {
  match_id?: number;
  payment_method?: string; // "ALL" or a specific method
  status?: TicketingPaymentStatus | "ALL";
  search?: string; // matches buyer name, match, or transaction reference
  trend_period?: TicketingTrendPeriod;
  page?: number;
  page_size?: number;
}

/* ------------------------------------------------------------------ */
/* Income & expense                                                    */
/* ------------------------------------------------------------------ */

export interface IncomeExpensePoint {
  month: string;
  income: number;
  expense: number;
}

export interface IncomeExpenseEntry {
  id: string;
  label: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  recordedAt: string;
}

export interface IncomeExpenseData {
  summary: {
    totalIncome: number;
    totalExpense: number;
    net: number;
  };
  trend: IncomeExpensePoint[];
  entries: IncomeExpenseEntry[];
}

/* ------------------------------------------------------------------ */
/* Invoices & receipts                                                 */
/* ------------------------------------------------------------------ */

export type InvoiceStatus = "PAID" | "OUTSTANDING" | "OVERDUE" | "VOID";

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  billedTo: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  receiptUrl: string | null;
}

export interface InvoicesData {
  summary: {
    outstandingTotal: number;
    outstandingCount: number;
  };
  invoices: InvoiceRecord[];
}

/* ------------------------------------------------------------------ */
/* Audit trail log                                                     */
/* ------------------------------------------------------------------ */

export interface AuditLogEntry {
  id: string;
  actorName: string;
  action: string;
  target: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AuditTrailData {
  entries: AuditLogEntry[];
}

/* ------------------------------------------------------------------ */
/* Endpoint helpers                                                    */
/* ------------------------------------------------------------------ */

const financeBase = (clubId: number) => `/clubs/${clubId}/finance`;

/* ------------------------------------------------------------------ */
/* Overview (top stat cards)                                           */
/* ------------------------------------------------------------------ */

export async function getFinanceOverview(
  clubId: number,
  params?: DateRangeParams,
): Promise<FinanceOverview> {
  const { data } = await apiClient.get(`${financeBase(clubId)}/overview/`, {
    params,
  });
  return data;
}

/* ------------------------------------------------------------------ */
/* Membership payments                                                 */
/* ------------------------------------------------------------------ */

export async function getMembershipPayments(
  clubId: number,
  params?: MembershipPaymentsParams,
): Promise<MembershipPaymentsData> {
  const { data } = await apiClient.get(
    `${financeBase(clubId)}/membership-payments/`,
    { params },
  );
  return data;
}

export async function exportMembershipPayments(
  clubId: number,
  params?: MembershipPaymentsParams,
): Promise<Blob> {
  const { data } = await apiClient.get(
    `${financeBase(clubId)}/membership-payments/export/`,
    { params, responseType: "blob" },
  );
  return data;
}

/* ------------------------------------------------------------------ */
/* Ticketing payments                                                  */
/* ------------------------------------------------------------------ */

export async function getTicketingPayments(
  clubId: number,
  params?: TicketingPaymentsParams,
): Promise<TicketingPaymentsData> {
  const { data } = await apiClient.get(
    `${financeBase(clubId)}/ticketing-payments/`,
    { params },
  );
  return data;
}

export async function exportTicketingPayments(
  clubId: number,
  params?: TicketingPaymentsParams,
): Promise<Blob> {
  const { data } = await apiClient.get(
    `${financeBase(clubId)}/ticketing-payments/export/`,
    { params, responseType: "blob" },
  );
  return data;
}

/* ------------------------------------------------------------------ */
/* Income & expense                                                    */
/* ------------------------------------------------------------------ */

export async function getIncomeExpense(
  clubId: number,
  params?: DateRangeParams,
): Promise<IncomeExpenseData> {
  const { data } = await apiClient.get(
    `${financeBase(clubId)}/income-expense/`,
    { params },
  );
  return data;
}

/* ------------------------------------------------------------------ */
/* Invoices & receipts                                                 */
/* ------------------------------------------------------------------ */

export async function getInvoices(
  clubId: number,
  params?: DateRangeParams & { status?: InvoiceStatus | "ALL" },
): Promise<InvoicesData> {
  const { data } = await apiClient.get(`${financeBase(clubId)}/invoices/`, {
    params,
  });
  return data;
}

/* ------------------------------------------------------------------ */
/* Audit trail log                                                     */
/* ------------------------------------------------------------------ */

export async function getAuditTrail(
  clubId: number,
  params?: DateRangeParams & { page?: number; page_size?: number },
): Promise<AuditTrailData> {
  const { data } = await apiClient.get(
    `${financeBase(clubId)}/audit-trail/`,
    { params },
  );
  return data;
}

export { getApiErrorMessage };