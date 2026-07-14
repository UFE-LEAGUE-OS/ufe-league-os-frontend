import apiClient from './apiClient.js';

export type SponsorType =
  | 'INDIVIDUAL'
  | 'CORPORATE';

export type SponsorAccountStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export type SponsorMemberRole =
  | 'OWNER'
  | 'ADMIN'
  | 'FINANCE'
  | 'VIEWER';

export type SponsorPackageStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'ARCHIVED';

export type SponsorAgreementStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'PENDING_PAYMENT'
  | 'ACTIVE'
  | 'PAUSED'
  | 'EXPIRED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type SponsorPaymentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type SponsorPaymentScheduleStatus =
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'WAIVED'
  | 'CANCELLED';

export interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

export interface SponsorUserSummary {
  id: number | string;
  email?: string;
  username?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  role?: string;
  is_sponsor?: boolean;
  sponsor_type?: SponsorType | null;
}

export interface SponsorDashboardRoute {
  role: string;
  role_display: string;
  route: string;
  backend_route: string;
}

export interface BecomeSponsorPayload {
  sponsor_type: SponsorType;
  name: string;
  registration_country?: string;
  brn?: string;
  tin?: string;
}

export interface SponsorAccountResponse {
  id: number;
  sponsor_type: SponsorType;
  sponsor_type_display: string;
  name: string;
  registration_country: string;
  brn?: string | null;
  tin?: string | null;
  status: SponsorAccountStatus;
  status_display: string;
  member_count: number;
  owner: SponsorUserSummary;
  created_at?: string;
  updated_at?: string;
}

export interface BecomeSponsorResponse {
  message: string;
  user: SponsorUserSummary;
  sponsor_account: SponsorAccountResponse;
  dashboard_routes: SponsorDashboardRoute[];
}

export interface SponsorAccountMember {
  id: number;
  user: SponsorUserSummary;
  member_role: SponsorMemberRole;
  member_role_display: string;
  is_active: boolean;
  created_at: string;
}

export interface AddSponsorMemberPayload {
  email: string;
  member_role:
    | 'ADMIN'
    | 'FINANCE'
    | 'VIEWER';
}

export interface AddSponsorMemberResponse {
  message: string;
  member: SponsorAccountMember;
}

export interface SponsorBenefit {
  id: number;
  sponsor_package: number;
  benefit_type: string;
  benefit_type_display: string;
  name: string;
  description: string;
  quantity: number;
  discount_percentage: string;
  value_amount: string;
  requires_payment_confirmation: boolean;
  is_platform_controlled: boolean;
  created_at: string;
}

export interface SponsorRevenueShareRule {
  id: number;
  sponsor_package: number | null;
  agreement: number | null;
  recipient_type: string;
  recipient_type_display: string;
  recipient_identifier: string;
  recipient_name: string;
  percentage: string;
  fixed_amount: string;
  is_platform_share: boolean;
  created_at: string;
}

export interface SponsorPackage {
  id: number;
  name: string;
  description: string;
  owner_type: string;
  owner_type_display: string;
  owner_identifier: string;
  owner_name: string;
  scope_type: string;
  scope_type_display: string;
  scope_identifier: string;
  scope_name: string;
  sponsor_type_allowed:
    | SponsorType
    | 'BOTH';
  sponsor_type_allowed_display: string;
  category: string;
  category_display: string;
  price_amount: string;
  currency: string;
  is_exclusive: boolean;
  requires_platform_fee: boolean;
  platform_fee_amount: string;
  activation_rule: string;
  activation_rule_display: string;
  status: SponsorPackageStatus;
  status_display: string;
  created_by: number | null;
  created_by_email?: string | null;
  approved_by: number | null;
  approved_by_email?: string | null;
  approved_at: string | null;
  benefits: SponsorBenefit[];
  revenue_share_rules:
    SponsorRevenueShareRule[];
  created_at: string;
  updated_at: string;
}

export interface SponsorPackageFilters {
  owner_type?: string;
  scope_type?: string;
  category?: string;
  status?: SponsorPackageStatus;
}

export interface SponsorPaymentSchedule {
  id: number;
  agreement: number;
  schedule_type: string;
  schedule_type_display: string;
  sequence_number: number;
  due_date: string;
  period_start: string | null;
  period_end: string | null;
  amount_due: string;
  currency: string;
  status: SponsorPaymentScheduleStatus;
  status_display: string;
  created_at: string;
  updated_at: string;
}

export interface SponsorRevenueDistribution {
  id: number;
  payment: number;
  agreement: number;
  recipient_type: string;
  recipient_type_display: string;
  recipient_identifier: string;
  recipient_name: string;
  amount: string;
  currency: string;
  status: string;
  status_display: string;
  created_at: string;
}

export interface SponsorPayment {
  id: number;
  agreement: number;
  payment_schedule: number | null;
  amount_paid: string;
  currency: string;
  payment_method: string;
  payment_method_display: string;
  transaction_reference: string;
  provider: string;
  provider_transaction_id: string;
  provider_status: string;
  checkout_url: string;
  checkout_initialized_at: string | null;
  paid_at: string | null;
  status: SponsorPaymentStatus;
  status_display: string;
  proof_url: string;
  notes: string;
  recorded_by: number | null;
  recorded_by_email?: string | null;
  confirmed_by: number | null;
  confirmed_by_email?: string | null;
  confirmed_at: string | null;
  revenue_distributions:
    SponsorRevenueDistribution[];
  created_at: string;
}

export interface SponsorWorkflowEvent {
  id: number;
  sponsor_package: number | null;
  agreement: number | null;
  payment: number | null;
  actor: number | null;
  actor_email?: string | null;
  event_type: string;
  event_type_display: string;
  from_status: string;
  to_status: string;
  note: string;
  created_at: string;
}

export interface SponsorAgreement {
  id: number;
  sponsor_account: number;
  sponsor_account_detail:
    SponsorAccountResponse;
  sponsor_package: number;
  sponsor_package_detail: SponsorPackage;
  reference: string;
  agreement_type: string;
  agreement_type_display: string;
  payment_source: string;
  payment_source_display: string;
  payment_model: string;
  payment_model_display: string;
  total_value: string;
  currency: string;
  starts_at: string | null;
  ends_at: string | null;
  status: SponsorAgreementStatus;
  status_display: string;
  platform_fee_required: boolean;
  platform_fee_amount: string;
  platform_fee_status: string;
  platform_fee_status_display: string;
  platform_activation_allowed: boolean;
  benefits_tier: string;
  benefits_tier_display: string;
  activation_rule: string;
  activation_rule_display: string;
  waiver_status: string;
  waiver_reason: string;
  waived_by: number | null;
  waived_by_email?: string | null;
  waived_at: string | null;
  created_by: number | null;
  created_by_email?: string | null;
  approved_by: number | null;
  approved_by_email?: string | null;
  approved_at: string | null;
  proof_reference: string;
  notes: string;
  payment_schedules:
    SponsorPaymentSchedule[];
  payments: SponsorPayment[];
  revenue_share_rules:
    SponsorRevenueShareRule[];
  revenue_distributions:
    SponsorRevenueDistribution[];
  workflow_events:
    SponsorWorkflowEvent[];
  created_at: string;
  updated_at: string;
}

export interface SponsorAgreementFilters {
  sponsor_account?: number;
  sponsor_package?: number;
  status?: SponsorAgreementStatus;
  payment_source?: string;
}

export interface CreateSponsorAgreementPayload {
  sponsor_account: number;
  sponsor_package: number;
  agreement_type?:
    | 'CASH'
    | 'IN_KIND'
    | 'EXISTING_CONTRACT'
    | 'PLATFORM_ADVERT';
  payment_source?:
    | 'PLATFORM'
    | 'OFF_PLATFORM'
    | 'IN_KIND'
    | 'EXISTING_CONTRACT'
    | 'FREE';
  payment_model?:
    | 'ONE_TIME'
    | 'RECURRING'
    | 'INSTALLMENT'
    | 'EXTERNAL'
    | 'FREE';
  total_value?: string;
  currency?: string;
  starts_at?: string | null;
  ends_at?: string | null;
  benefits_tier?:
    | 'BASIC'
    | 'DIGITAL'
    | 'PREMIUM'
    | 'REVENUE_SHARE';
  notes?: string;
}

export interface CreateSponsorAgreementResponse {
  message: string;
  agreement: SponsorAgreement;
}

export interface FlutterwaveInitializePayload {
  payment_schedule?: number;
  amount_paid?: string;
}

export interface FlutterwaveInitializeResponse {
  message: string;
  checkout_url: string;
  tx_ref: string;
  payment: SponsorPayment;
}

export interface FlutterwaveVerifyResponse {
  message: string;
  payment: SponsorPayment;
  revenue_distributions:
    SponsorRevenueDistribution[];
}

export const becomeSponsor = (
  payload: BecomeSponsorPayload,
) =>
  apiClient.post<BecomeSponsorResponse>(
    '/accounts/become-sponsor/',
    payload,
  );

export const getSponsorAccounts = () =>
  apiClient.get<
    PaginatedResponse<SponsorAccountResponse>
  >('/sponsorships/accounts/');

export const getSponsorAccount = (
  accountId: number,
) =>
  apiClient.get<SponsorAccountResponse>(
    `/sponsorships/accounts/${accountId}/`,
  );

export const getSponsorAccountMembers = (
  accountId: number,
) =>
  apiClient.get<
    PaginatedResponse<SponsorAccountMember>
  >(
    `/sponsorships/accounts/${accountId}/members/`,
  );

export const addSponsorAccountMember = (
  accountId: number,
  payload: AddSponsorMemberPayload,
) =>
  apiClient.post<AddSponsorMemberResponse>(
    `/sponsorships/accounts/${accountId}/members/`,
    payload,
  );

export const getSponsorPackages = (
  params?: SponsorPackageFilters,
) =>
  apiClient.get<
    PaginatedResponse<SponsorPackage>
  >(
    '/sponsorships/packages/',
    { params },
  );

export const getSponsorPackage = (
  packageId: number,
) =>
  apiClient.get<SponsorPackage>(
    `/sponsorships/packages/${packageId}/`,
  );

export const getSponsorPackageBenefits = (
  packageId: number,
) =>
  apiClient.get<
    PaginatedResponse<SponsorBenefit>
  >(
    `/sponsorships/packages/${packageId}/benefits/`,
  );

export const getSponsorAgreements = (
  params?: SponsorAgreementFilters,
) =>
  apiClient.get<
    PaginatedResponse<SponsorAgreement>
  >(
    '/sponsorships/agreements/',
    { params },
  );

export const getSponsorAgreement = (
  agreementId: number,
) =>
  apiClient.get<SponsorAgreement>(
    `/sponsorships/agreements/${agreementId}/`,
  );

export const createSponsorAgreement = (
  payload: CreateSponsorAgreementPayload,
) =>
  apiClient.post<CreateSponsorAgreementResponse>(
    '/sponsorships/agreements/',
    payload,
  );

export const getSponsorAgreementPaymentSchedules =
  (
    agreementId: number,
  ) =>
    apiClient.get<
      PaginatedResponse<SponsorPaymentSchedule>
    >(
      `/sponsorships/agreements/${agreementId}/payment-schedules/`,
    );

export const getSponsorAgreementPayments = (
  agreementId: number,
) =>
  apiClient.get<
    PaginatedResponse<SponsorPayment>
  >(
    `/sponsorships/agreements/${agreementId}/payments/`,
  );

export const initializeSponsorFlutterwavePayment =
  (
    agreementId: number,
    payload:
      FlutterwaveInitializePayload = {},
  ) =>
    apiClient.post<FlutterwaveInitializeResponse>(
      `/sponsorships/agreements/${agreementId}/flutterwave/initialize/`,
      payload,
    );

export const verifySponsorFlutterwavePayment =
  (
    transactionReference: string,
  ) =>
    apiClient.get<FlutterwaveVerifyResponse>(
      '/sponsorships/flutterwave/verify/',
      {
        params: {
          tx_ref: transactionReference,
        },
      },
    );
