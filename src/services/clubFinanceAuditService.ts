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
  actorEmail?: string;
  action: string;
  category?: string;
  categoryDisplay?: string;
  target: string;
  targetEmail?: string;
  timestamp: string;
  path?: string;
  method?: string;
  statusCode?: number | null;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditTrailData {
  entries: AuditLogEntry[];
  count?: number;
  limit?: number;
  offset?: number;
}

export interface AuditTrailParams extends DateRangeParams {
  category?: string;
  action?: string;
  search?: string;
  page?: number;
  page_size?: number;
  limit?: number;
  offset?: number;
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
/* Audit trail log                                                     */
/* ------------------------------------------------------------------ */

export async function getAuditTrail(
  clubId: number,
  params?: AuditTrailParams,
): Promise<AuditTrailData> {
  const { data } = await apiClient.get(
    `${financeBase(clubId)}/audit-trail/`,
    { params: cleanParams(params) },
  );
  return normalizeAuditTrailData(data);
}

type RawAuditEntry = Record<string, unknown>;

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readNumber(value: unknown) {
  return typeof value === "number" ? value : null;
}

function readObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function normalizeAuditEntry(entry: RawAuditEntry): AuditLogEntry {
  const actor = readObject(entry.actor);
  const targetUser = readObject(entry.target_user);
  const details = readObject(entry.details);
  const metadata = readObject(entry.metadata) ?? details;

  const actorName =
    readString(entry.actorName) ||
    readString(entry.actor_name) ||
    readString(actor?.full_name) ||
    readString(actor?.name) ||
    readString(entry.actor_email) ||
    readString(actor?.email) ||
    "System";

  const target =
    readString(entry.target) ||
    readString(entry.targetName) ||
    readString(entry.target_name) ||
    readString(entry.target_user_email) ||
    readString(targetUser?.full_name) ||
    readString(targetUser?.name) ||
    readString(targetUser?.email) ||
    readString(entry.path) ||
    "League OS";

  return {
    id: String(entry.id ?? crypto.randomUUID()),
    actorName,
    actorEmail: readString(entry.actorEmail) || readString(entry.actor_email),
    action: readString(entry.action, "audit_event"),
    category: readString(entry.category),
    categoryDisplay:
      readString(entry.categoryDisplay) || readString(entry.category_display),
    target,
    targetEmail:
      readString(entry.targetEmail) || readString(entry.target_user_email),
    timestamp:
      readString(entry.timestamp) ||
      readString(entry.created_at) ||
      readString(entry.updated_at),
    path: readString(entry.path),
    method: readString(entry.method),
    statusCode:
      readNumber(entry.statusCode) ?? readNumber(entry.status_code),
    ipAddress:
      readString(entry.ipAddress) || readString(entry.ip_address),
    metadata,
  };
}

function normalizeAuditTrailData(payload: unknown): AuditTrailData {
  const response = readObject(payload);
  const rawEntries =
    (Array.isArray(payload) && payload) ||
    (Array.isArray(response?.entries) && response.entries) ||
    (Array.isArray(response?.results) && response.results) ||
    [];

  return {
    entries: rawEntries
      .filter((entry): entry is RawAuditEntry =>
        Boolean(readObject(entry)),
      )
      .map((entry) => normalizeAuditEntry(entry)),
    count: readNumber(response?.count) ?? undefined,
    limit: readNumber(response?.limit) ?? undefined,
    offset: readNumber(response?.offset) ?? undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Income & expense summary (dashboard-style view)                     */
/* ------------------------------------------------------------------ */

export interface IncomeExpenseStats {
  totalIncome: FinanceStat;
  totalExpenses: FinanceStat;
  netProfit: FinanceStat;
  operatingCosts: FinanceStat;
  sponsorshipIncome: FinanceStat;
  membershipIncome: FinanceStat;
}

export interface IncomeSourceSlice {
  source: string; // e.g. "Ticket Sales", "Sponsorships", "Memberships", "Others"
  amount: number;
  share: number; // 0..1
  color: string;
}

export interface CashFlowPoint {
  month: string;
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
}

export interface ExpenseBreakdownRow {
  category: string;
  amount: number;
  percentOfExpenses: number; // 0..100
}

export interface FinancialSummaryRow {
  month: string;
  income: number;
  expenses: number;
  netProfit: number;
}

export type IncomeExpenseTrendPeriod =
  | "thisYear"
  | "last12Months"
  | "lastYear";

export interface IncomeExpenseSummaryData {
  stats: IncomeExpenseStats;
  incomeVsExpenseTrend: IncomeExpensePoint[]; // reuses existing { month, income, expense }
  incomeSources: IncomeSourceSlice[];
  totalIncomeSources: number;
  monthlyCashFlow: CashFlowPoint[];
  expenseBreakdown: ExpenseBreakdownRow[];
  financialSummary: FinancialSummaryRow[];
}

export interface IncomeExpenseSummaryParams extends DateRangeParams {
  trend_period?: IncomeExpenseTrendPeriod;
}

export async function getIncomeExpenseSummary(
  clubId: number,
  params?: IncomeExpenseSummaryParams,
): Promise<IncomeExpenseSummaryData> {
  const { data } = await apiClient.get(
    `${financeBase(clubId)}/income-expense/`,
    { params },
  );
  return data;
}


/* ------------------------------------------------------------------ */
/* Invoices & receipts                                                 */
/* ------------------------------------------------------------------ */

// Strips "ALL" / empty-string sentinel values so the backend only ever
// sees real filters, never the frontend's "no filter" placeholder.
//
// NOTE: constrained to `T extends object` (not `Record<string, unknown>`)
// so callers can pass interfaces like `DateRangeParams & { status?: ... }`
// that don't declare an index signature. We cast through
// `Record<string, unknown>` internally instead of requiring the caller's
// type to structurally satisfy it.
function cleanParams<T extends object>(params?: T): Partial<T> | undefined {
  if (!params) return undefined;

  const entries = Object.entries(params as Record<string, unknown>).filter(
    ([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string" && (value === "" || value === "ALL")) {
        return false;
      }
      return true;
    },
  );

  return Object.fromEntries(entries) as Partial<T>;
}

export async function getInvoices(
  clubId: number,
  params?: DateRangeParams & {
    status?: InvoiceStatus | "ALL";
    search?: string;
    page?: number;
    page_size?: number;
  },
): Promise<InvoicesData> {
  const { data } = await apiClient.get(`${financeBase(clubId)}/invoices/`, {
    params: cleanParams(params),
  });
  return data;
}

/**
 * Triggers the backend to (re)send the invoice/receipt to the billed
 * party's email on file. Used by the "Send Email" action in the
 * Receipt Preview panel.
 */
export async function sendInvoiceReceiptEmail(
  clubId: number,
  invoiceId: string,
): Promise<{ sent: boolean }> {
  const { data } = await apiClient.post(
    `${financeBase(clubId)}/invoices/${encodeURIComponent(invoiceId)}/send-receipt/`,
    {},
  );
  return data;
}

export { getApiErrorMessage };
