import apiClient from "./apiClient";
import type { DashboardAccess } from "../types/dashboardAccess.js";
import {
  getEntitlementsForDashboard,
  validateDashboardAccess,
} from "../utils/dashboardAccess.js";

export type UnionWorkspacePermission =
  | "union.dashboard.view"
  | "union.competitions.manage"
  | "union.clubs.manage"
  | "union.players.approve"
  | "union.referees.manage"
  | "union.finance.view"
  | "union.reports.view"
  | "union.communications.manage"
  | "union.users.manage"
  | "union.official.appointments.view"
  | "union.official.reports.manage"
  | "union.official.availability.manage"
  | "union.official.documents.view"
  | "union.official.payments.view"
  | "union.ticketing.manage"
  | "union.ticketing.scan"
  | "union.teams.manage"
  | (string & {});

export type UnionWorkspaceRole =
  | "OWNER"
  | "UNION_ADMIN"
  | "COMPETITIONS_MANAGER"
  | "REGISTRAR"
  | "REFEREE_MANAGER"
  | "FINANCE_OFFICER"
  | "COMMUNICATIONS_OFFICER"
  | "MATCH_OFFICIAL"
  | "TICKETING_OFFICER"
  | "VIEWER";

export interface UnionWorkspaceOption {
  id: number;
  name: string;
  slug: string;
  acronym: string;
  sport: string;
  workspaceType: string;
  description: string;
  primaryColor: string;
  role: UnionWorkspaceRole;
  roleDisplay: string;
  permissions: UnionWorkspacePermission[];
}

export interface AuthorizedUnionWorkspaceOption extends UnionWorkspaceOption {
  entitlementId: string;
  entitlementRoute: string;
  scopeId: string | number;
}

interface BackendUnionWorkspace {
  id: number;
  name: string;
  slug: string;
  acronym: string;
  sport: string;
  workspace_type: string;
  description: string;
  primary_color: string;
}

interface BackendUnionWorkspaceMembership {
  id: number;
  role: UnionWorkspaceRole;
  role_display: string;
  effective_permissions: string[];
  workspace: BackendUnionWorkspace;
}

interface BackendUnionWorkspaceSwitchResponse extends BackendUnionWorkspaceMembership {
  selected_entitlement_id: unknown;
  dashboard_access: unknown;
}

interface BackendUnionWorkspacesResponse {
  count: number;
  results: BackendUnionWorkspaceMembership[];
}

export interface UnionDashboardSummary {
  leagues?: number;
  active_competitions: number;
  member_clubs: number;
  national_teams?: number;
  pending_approvals: number;
  referees: number;
  upcoming_matches?: number;
}

export interface UnionDashboardOverview {
  workspace: UnionWorkspaceOption;
  summary: UnionDashboardSummary;
  permissions: UnionWorkspacePermission[];
}

interface BackendUnionDashboardOverview {
  workspace: BackendUnionWorkspaceMembership;
  summary: UnionDashboardSummary;
  permissions: UnionWorkspacePermission[];
}

export interface UnionWorkspaceUser {
  id: number;
  user_id: number;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  user_full_name: string;
  workspace_slug: string;
  workspace_acronym: string;
  role: UnionWorkspaceRole;
  role_display: string;
  effective_permissions: UnionWorkspacePermission[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnionWorkspaceUsersResult {
  count: number;
  workspace: string;
  results: UnionWorkspaceUser[];
}

export interface CreateUnionWorkspaceUserPayload {
  workspace: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  role: UnionWorkspaceRole;
  password?: string;
}

export interface CreateUnionWorkspaceUserResponse {
  created_user: boolean;
  created_membership: boolean;
  temporary_password?: string;
  workspace: string;
  membership: UnionWorkspaceUser;
}

function sortedPermissions(values: unknown): UnionWorkspacePermission[] {
  if (!Array.isArray(values)) return [];

  return Array.from(
    new Set(
      values.filter(
        (permission): permission is string =>
          typeof permission === "string" && Boolean(permission),
      ),
    ),
  ).sort();
}

function isUnionWorkspaceRole(value: unknown): value is UnionWorkspaceRole {
  return (
    typeof value === "string" &&
    [
      "OWNER",
      "UNION_ADMIN",
      "COMPETITIONS_MANAGER",
      "REGISTRAR",
      "REFEREE_MANAGER",
      "FINANCE_OFFICER",
      "COMMUNICATIONS_OFFICER",
      "MATCH_OFFICIAL",
      "TICKETING_OFFICER",
      "VIEWER",
    ].includes(value)
  );
}

function mapMembership(
  item: BackendUnionWorkspaceMembership,
): UnionWorkspaceOption {
  return {
    id: item.workspace.id,
    name: item.workspace.name,
    slug: item.workspace.slug,
    acronym: item.workspace.acronym,
    sport: item.workspace.sport,
    workspaceType: item.workspace.workspace_type,
    description: item.workspace.description,
    primaryColor: item.workspace.primary_color || "#7b3ff2",
    role: item.role,
    roleDisplay: item.role_display,
    permissions: sortedPermissions(item.effective_permissions),
  };
}

export function intersectUnionWorkspaceOptions(
  workspaces: UnionWorkspaceOption[],
  dashboardAccess: unknown,
): AuthorizedUnionWorkspaceOption[] {
  const workspacesById = new Map(
    workspaces.map((workspace) => [String(workspace.id), workspace]),
  );
  const seenScopes = new Set<string>();

  return getEntitlementsForDashboard(dashboardAccess, "UNION_WORKSPACE")
    .filter(
      (entitlement) =>
        entitlement.scope_type === "UNION_WORKSPACE" &&
        entitlement.scope_id !== null,
    )
    .sort((left, right) =>
      String(left.scope_id).localeCompare(String(right.scope_id), undefined, {
        numeric: true,
      }),
    )
    .flatMap((entitlement) => {
      const scopeKey = String(entitlement.scope_id);
      const workspace = workspacesById.get(scopeKey);

      if (
        seenScopes.has(scopeKey) ||
        !workspace ||
        !isUnionWorkspaceRole(entitlement.workspace_role) ||
        entitlement.workspace_role !== workspace.role
      ) {
        return [];
      }

      seenScopes.add(scopeKey);

      const membershipPermissions = new Set(workspace.permissions);
      const permissions = sortedPermissions(
        entitlement.permissions.filter((permission) =>
          membershipPermissions.has(permission),
        ),
      );

      return [
        {
          ...workspace,
          role: entitlement.workspace_role,
          permissions,
          entitlementId: entitlement.id,
          entitlementRoute: entitlement.route,
          scopeId: entitlement.scope_id as string | number,
        },
      ];
    });
}

export async function getMyUnionWorkspaces(): Promise<UnionWorkspaceOption[]> {
  const response = await apiClient.get<BackendUnionWorkspacesResponse>(
    "/dashboards/union-admin/workspaces/",
  );

  return response.data.results.map(mapMembership);
}

export interface UnionWorkspaceSwitchResult {
  workspace: AuthorizedUnionWorkspaceOption;
  selectedEntitlementId: string;
  dashboardAccess: DashboardAccess;
}

export async function switchUnionWorkspace(
  workspaceSlug: string,
): Promise<UnionWorkspaceSwitchResult> {
  const response = await apiClient.post<BackendUnionWorkspaceSwitchResponse>(
    "/dashboards/union-admin/switch-workspace/",
    { workspace: workspaceSlug },
  );

  const dashboardAccess = validateDashboardAccess(
    response.data.dashboard_access,
  );
  const selectedEntitlementId = response.data.selected_entitlement_id;

  if (
    !dashboardAccess ||
    typeof selectedEntitlementId !== "string" ||
    !selectedEntitlementId
  ) {
    throw new Error(
      "The workspace switch response did not include valid access.",
    );
  }

  const workspace = intersectUnionWorkspaceOptions(
    [mapMembership(response.data)],
    dashboardAccess,
  ).find((option) => option.entitlementId === selectedEntitlementId);

  if (!workspace) {
    throw new Error(
      "The selected workspace is not authorized by dashboard access.",
    );
  }

  return {
    workspace,
    selectedEntitlementId,
    dashboardAccess,
  };
}

export async function getUnionDashboardOverview(
  workspaceSlug: string,
): Promise<UnionDashboardOverview> {
  const response = await apiClient.get<BackendUnionDashboardOverview>(
    `/dashboards/union-admin/workspace/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );

  return {
    workspace: mapMembership(response.data.workspace),
    summary: response.data.summary,
    permissions: response.data.permissions ?? [],
  };
}

export async function getUnionWorkspaceUsers(
  workspaceSlug: string,
): Promise<UnionWorkspaceUsersResult> {
  const response = await apiClient.get<UnionWorkspaceUsersResult>(
    `/dashboards/union-admin/workspace-users/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );

  return response.data;
}

export async function createUnionWorkspaceUser(
  payload: CreateUnionWorkspaceUserPayload,
): Promise<CreateUnionWorkspaceUserResponse> {
  const response = await apiClient.post<CreateUnionWorkspaceUserResponse>(
    "/dashboards/union-admin/workspace-users/",
    payload,
  );

  return response.data;
}

export interface UnionFinanceMoney {
  raw: string;
  display: string;
}

export interface UnionFinanceDashboard {
  workspace: {
    slug: string;
    acronym: string;
    name: string;
  };
  currency: string;
  kpis: {
    gross_receipts: UnionFinanceMoney;
    net_settled: UnionFinanceMoney;
    pending_payouts: UnionFinanceMoney;
    failed_reversed: UnionFinanceMoney;
    transaction_count: number;
    payout_count: number;
  };
  monthly_trend: Array<{
    label: string;
    value: number;
    amount: UnionFinanceMoney;
  }>;
  revenue_mix: Array<{
    label: string;
    amount: UnionFinanceMoney;
    percent: number;
  }>;
  recent_transactions: Array<{
    reference: string;
    source: string;
    amount: UnionFinanceMoney;
    status: string;
    date: string;
    stream: string;
  }>;
  payout_queue: Array<{
    beneficiary: string;
    category: string;
    amount: UnionFinanceMoney;
    status: string;
    reference: string;
  }>;
}

export async function getUnionFinanceDashboard(
  workspaceSlug: string,
): Promise<UnionFinanceDashboard> {
  const response = await apiClient.get<UnionFinanceDashboard>(
    `/dashboards/union-admin/finance/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );

  return response.data;
}

export interface UnionOperationsCompetition {
  id: string;
  name: string;
  type?: string;
  format: string;
  season: string;
  clubs: number;
  matches: number;
  status: string;
  phase?: string;
  entryWindow?: string;
  registrationStatus?: string;
  fixtureStatus?: string;
  nextFixture?: string;
  officialsNeeded?: number;
  reportsDue?: number;
  nextAction: string;
}

export interface UnionOperationsClub {
  id: string;
  name: string;
  category: string;
  teams: number;
  players: number;
  compliance: string;
  admin: string;
}

export interface UnionOperationsNationalTeam {
  team: string;
  category: string;
  players: number;
  staff: number;
  status: string;
}

export interface UnionOperationsRegistration {
  applicant: string;
  club: string;
  type: string;
  submitted: string;
  status: string;
  reviewer: string;
}

export interface UnionOperationsReferee {
  name: string;
  role: string;
  grade: string;
  status: string;
  competitions: string;
  nextMatch: string;
}

export interface UnionOperationsAppointment {
  id?: number;
  match: string;
  competition: string;
  date: string;
  venue: string;
  role: string;
  status?: string;
  report: string;
}

export interface UnionOperationsCurrentOfficial {
  id: number;
  name: string;
  email: string;
  role: string;
  grade: string;
  status: string;
  competitions: string;
  union: string;
}

export interface UnionOperationsPlayerPosition {
  group: string;
  positions: string[];
}

export interface UnionOperationsDashboard {
  workspace: {
    slug: string;
    acronym: string;
    name: string;
    sport: string;
  };
  competitions: UnionOperationsCompetition[];
  clubs: UnionOperationsClub[];
  national_teams: UnionOperationsNationalTeam[];
  registrations: UnionOperationsRegistration[];
  referees: UnionOperationsReferee[];
  current_official?: UnionOperationsCurrentOfficial | null;
  appointments: UnionOperationsAppointment[];
  player_positions: UnionOperationsPlayerPosition[];
}

export async function getUnionOperationsDashboard(
  workspaceSlug: string,
): Promise<UnionOperationsDashboard> {
  const response = await apiClient.get<UnionOperationsDashboard>(
    `/dashboards/union-admin/operations/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );

  return response.data;
}

export interface UnionAuthoritativePlayerRegistration {
  id: number;
  workspace: number;
  player: number;
  union_player_number: string;
  player_name: string;
  club: number;
  club_name: string;
  team: number | null;
  team_name: string | null;
  season: number | null;
  source_registration: number | null;
  status: string;
  registration_type: string;
  effective_from: string;
  effective_to: string | null;
  approved_by: number | null;
  approved_by_name: string | null;
  approved_at: string | null;
  decision_reason: string;
  predecessor: number | null;
  created_at: string;
  updated_at: string;
}

export interface UnionPlayerRegistrationSubmission {
  id: number;
  registration_number: string;
  full_name: string;
  union_player_number: string | null;
  club: number;
  club_name: string;
  team: number;
  team_name: string;
  season_record: number | null;
  registration_type: string;
  submission_status: string;
  submission_revision: number;
  submitted_at: string | null;
  assigned_reviewer: number | null;
  assigned_reviewer_name: string | null;
  reviewed_at: string | null;
  warning_count: number;
  blocking_error_count: number;
}

export interface UnionPlayerEligibility {
  id: number;
  status: string;
  player: number;
  union_player_number: string;
  player_name: string;
  club: number;
  club_name: string;
  team: number | null;
  team_name: string | null;
  registration: number;
  registration_type: string;
  competition_identity: number;
  competition_name: string;
  competition_edition: number;
  edition_name: string;
  season: number;
  season_name: string;
  source_submission: number | null;
  source_submission_status: string | null;
  eligible_from: string | null;
  eligible_until: string | null;
  review_warning_count: number;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnionPlayerTransfer {
  id: number;
  status: string;
  transfer_type: string;
  player: number;
  union_player_number: string;
  player_name: string;
  source_registration: number;
  source_club: number;
  source_club_name: string;
  destination_club: number;
  destination_club_name: string;
  destination_team: number | null;
  destination_team_name: string | null;
  effective_on: string;
  loan_end_on: string | null;
  source_club_response_status: string;
  player_consent_status: string;
  initiated_by: number | null;
  initiated_by_name: string | null;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  submission_revision: number;
  submitted_at: string | null;
  last_resubmitted_at: string | null;
  activated_at: string | null;
  returned_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnionPlayerRecordsQuery {
  search?: string;
  status?: string;
  transferType?: string;
}

function unionPlayerRecordsParams(
  workspaceSlug: string,
  query: UnionPlayerRecordsQuery = {},
) {
  const params = new URLSearchParams({ workspace: workspaceSlug });

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.status && query.status !== "ALL") {
    params.append("status", query.status);
  }
  if (query.transferType) {
    params.set("transfer_type", query.transferType);
  }

  return params.toString();
}

export async function getUnionAuthoritativePlayerRegistrations(
  workspaceSlug: string,
  query: UnionPlayerRecordsQuery = {},
): Promise<UnionAdminListResponse<UnionAuthoritativePlayerRegistration>> {
  const response = await apiClient.get<
    UnionAdminListResponse<UnionAuthoritativePlayerRegistration>
  >(
    `/dashboards/union-admin/player-registrations/?${unionPlayerRecordsParams(
      workspaceSlug,
      query,
    )}`,
  );
  return response.data;
}

export async function getUnionPlayerRegistrationSubmissions(
  workspaceSlug: string,
  query: UnionPlayerRecordsQuery = {},
): Promise<UnionAdminListResponse<UnionPlayerRegistrationSubmission>> {
  const params = new URLSearchParams({ workspace: workspaceSlug });
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.status && query.status !== "ALL") {
    params.append("submission_status", query.status);
  }
  const response = await apiClient.get<
    UnionAdminListResponse<UnionPlayerRegistrationSubmission>
  >(
    `/dashboards/union-admin/player-registration-submissions/?${params.toString()}`,
  );
  return response.data;
}

export async function getUnionPlayerEligibilities(
  workspaceSlug: string,
  query: UnionPlayerRecordsQuery = {},
): Promise<UnionAdminListResponse<UnionPlayerEligibility>> {
  const response = await apiClient.get<
    UnionAdminListResponse<UnionPlayerEligibility>
  >(
    `/dashboards/union-admin/player-eligibilities/?${unionPlayerRecordsParams(
      workspaceSlug,
      query,
    )}`,
  );
  return response.data;
}

export async function getUnionPlayerTransfers(
  workspaceSlug: string,
  query: UnionPlayerRecordsQuery = {},
): Promise<UnionAdminListResponse<UnionPlayerTransfer>> {
  const response = await apiClient.get<
    UnionAdminListResponse<UnionPlayerTransfer>
  >(
    `/dashboards/union-admin/player-transfers/?${unionPlayerRecordsParams(
      workspaceSlug,
      query,
    )}`,
  );
  return response.data;
}

export type UnionApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface UnionApprovalRecord {
  id: number;
  workspace: number;
  subject_type: string;
  subject_id: number;
  action: string;
  status: UnionApprovalStatus;
  requested_by: number | null;
  requested_by_email: string | null;
  reviewed_by: number | null;
  reviewed_by_email: string | null;
  reason: string;
  decision_reason: string;
  metadata: Record<string, unknown>;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnionAuditEventRecord {
  id: number;
  workspace: number;
  actor: number | null;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface UnionReviewCommentRecord {
  id: number;
  workspace: number;
  subject_type: string;
  subject_id: number;
  author: number | null;
  author_email: string | null;
  body: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnionDocumentReferenceRecord {
  id: number;
  workspace: number;
  subject_type: string;
  subject_id: number;
  document_type: string;
  title: string;
  file_url: string;
  uploaded_by: number | null;
  uploaded_by_email: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface UnionGovernanceQuery {
  status?: string;
  action?: string;
  subjectType?: string;
  subjectId?: number;
  documentType?: string;
}

function unionGovernanceParams(
  workspaceSlug: string,
  query: UnionGovernanceQuery = {},
) {
  const params = new URLSearchParams({
    workspace: workspaceSlug,
    page_size: "100",
  });

  if (query.status && query.status !== "ALL") {
    params.set("status", query.status);
  }
  if (query.action?.trim()) {
    params.set("action", query.action.trim());
  }
  if (query.subjectType?.trim()) {
    params.set("subject_type", query.subjectType.trim());
  }
  if (query.subjectId !== undefined) {
    params.set("subject_id", String(query.subjectId));
  }
  if (query.documentType?.trim()) {
    params.set("document_type", query.documentType.trim());
  }

  return params.toString();
}

export async function getUnionApprovals(
  workspaceSlug: string,
  query: UnionGovernanceQuery = {},
): Promise<UnionAdminListResponse<UnionApprovalRecord>> {
  const response = await apiClient.get<
    UnionAdminListResponse<UnionApprovalRecord>
  >(
    `/dashboards/union-admin/approvals/?${unionGovernanceParams(
      workspaceSlug,
      query,
    )}`,
  );
  return response.data;
}

export async function reviewUnionApproval(
  workspaceSlug: string,
  approvalId: number,
  payload: {
    decision: "APPROVED" | "REJECTED";
    decision_reason?: string;
  },
): Promise<UnionApprovalRecord> {
  const response = await apiClient.post<UnionApprovalRecord>(
    `/dashboards/union-admin/approvals/${approvalId}/`,
    { workspace: workspaceSlug, ...payload },
  );
  return response.data;
}

export async function getUnionAuditEvents(
  workspaceSlug: string,
  query: UnionGovernanceQuery = {},
): Promise<UnionAdminListResponse<UnionAuditEventRecord>> {
  const response = await apiClient.get<
    UnionAdminListResponse<UnionAuditEventRecord>
  >(
    `/dashboards/union-admin/audit-events/?${unionGovernanceParams(
      workspaceSlug,
      query,
    )}`,
  );
  return response.data;
}

export async function getUnionReviewComments(
  workspaceSlug: string,
  query: UnionGovernanceQuery = {},
): Promise<UnionAdminListResponse<UnionReviewCommentRecord>> {
  const response = await apiClient.get<
    UnionAdminListResponse<UnionReviewCommentRecord>
  >(
    `/dashboards/union-admin/review-comments/?${unionGovernanceParams(
      workspaceSlug,
      query,
    )}`,
  );
  return response.data;
}

export async function getUnionDocumentReferences(
  workspaceSlug: string,
  query: UnionGovernanceQuery = {},
): Promise<UnionAdminListResponse<UnionDocumentReferenceRecord>> {
  const response = await apiClient.get<
    UnionAdminListResponse<UnionDocumentReferenceRecord>
  >(
    `/dashboards/union-admin/documents/?${unionGovernanceParams(
      workspaceSlug,
      query,
    )}`,
  );
  return response.data;
}

export type UnionNationalTeamStatus =
  "ACTIVE" | "CAMP" | "SELECTION" | "INACTIVE";
export type UnionNationalTeamMemberType = "PLAYER" | "STAFF";
export type UnionNationalTeamMemberStatus =
  "ACTIVE" | "INJURED" | "UNAVAILABLE" | "RELEASED";
export type UnionRegistrationApplicationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "DOCUMENTS_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN";

export interface UnionNationalTeam {
  id: number;
  workspace: number;
  workspace_slug: string;
  workspace_acronym: string;
  name: string;
  slug: string;
  category: string;
  gender: string;
  age_group: string;
  head_coach: string;
  status: UnionNationalTeamStatus;
  status_display: string;
  players: number;
  staff: number;
  notes: string;
  is_active: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface UnionNationalTeamMember {
  id: number;
  team: number;
  team_name: string;
  user: number | null;
  user_email: string | null;
  club: number | null;
  club_name: string | null;
  full_name: string;
  member_type: UnionNationalTeamMemberType;
  member_type_display: string;
  role: string;
  status: UnionNationalTeamMemberStatus;
  status_display: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface UnionRegistrationApplication {
  id: number;
  workspace: number;
  workspace_slug: string;
  workspace_acronym: string;
  application_type: string;
  application_type_display: string;
  club: number;
  club_name: string;
  club_slug: string;
  team: number | null;
  team_name: string | null;
  competition: number | null;
  competition_name: string | null;
  player_registration: number | null;
  applicant_name: string;
  registration_number: string;
  status: UnionRegistrationApplicationStatus;
  status_display: string;
  documents_complete: boolean;
  submitted_by: number | null;
  submitted_by_email: string | null;
  submitted_at: string;
  reviewed_by: number | null;
  reviewed_by_email: string | null;
  reviewed_at: string | null;
  reviewer_notes: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UnionOfficialReadinessFixture {
  id: number;
  match: string;
  competition: string;
  match_date: string;
  venue: string;
  assignment_count: number;
  accepted_count: number;
  pending_response_count: number;
  declined_count: number;
  readiness:
    | "NO_ASSIGNMENTS"
    | "PENDING_RESPONSES"
    | "HAS_ACCEPTED_ASSIGNMENTS"
    | "REVIEW_REQUIRED";
}

export interface UnionOfficialReadiness {
  workspace: {
    slug: string;
    acronym: string;
    name: string;
  };
  summary: {
    officials_total: number;
    officials_available: number;
    officials_unavailable: number;
    officials_suspended: number;
    upcoming_fixtures: number;
    fixtures_without_assignments: number;
    fixtures_with_pending_responses: number;
  };
  fixtures: UnionOfficialReadinessFixture[];
  officials: UnionAdminMatchOfficial[];
}

export interface CreateUnionNationalTeamPayload {
  workspace: string;
  name: string;
  category: string;
  gender?: string;
  age_group?: string;
  head_coach?: string;
  status?: UnionNationalTeamStatus;
  notes?: string;
  is_active?: boolean;
}

export interface CreateUnionNationalTeamMemberPayload {
  workspace: string;
  full_name: string;
  member_type?: UnionNationalTeamMemberType;
  role?: string;
  status?: UnionNationalTeamMemberStatus;
  club?: number | null;
  user?: number | null;
  notes?: string;
}

export async function getUnionNationalTeams(
  workspaceSlug: string,
): Promise<UnionAdminListResponse<UnionNationalTeam>> {
  const response = await apiClient.get<
    UnionAdminListResponse<UnionNationalTeam>
  >(
    `/dashboards/union-admin/national-teams/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );
  return response.data;
}

export async function createUnionNationalTeam(
  payload: CreateUnionNationalTeamPayload,
): Promise<UnionNationalTeam> {
  const response = await apiClient.post<UnionNationalTeam>(
    "/dashboards/union-admin/national-teams/",
    payload,
  );
  return response.data;
}

export async function updateUnionNationalTeam(
  teamId: number,
  workspaceSlug: string,
  payload: Partial<Omit<CreateUnionNationalTeamPayload, "workspace">>,
): Promise<UnionNationalTeam> {
  const response = await apiClient.patch<UnionNationalTeam>(
    `/dashboards/union-admin/national-teams/${teamId}/`,
    { workspace: workspaceSlug, ...payload },
  );
  return response.data;
}

export async function deleteUnionNationalTeam(
  teamId: number,
  workspaceSlug: string,
): Promise<void> {
  await apiClient.delete(`/dashboards/union-admin/national-teams/${teamId}/`, {
    data: { workspace: workspaceSlug },
  });
}

export async function getUnionNationalTeamMembers(
  teamId: number,
  workspaceSlug: string,
): Promise<UnionAdminListResponse<UnionNationalTeamMember>> {
  const response = await apiClient.get<
    UnionAdminListResponse<UnionNationalTeamMember>
  >(
    `/dashboards/union-admin/national-teams/${teamId}/members/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );
  return response.data;
}

export async function createUnionNationalTeamMember(
  teamId: number,
  payload: CreateUnionNationalTeamMemberPayload,
): Promise<UnionNationalTeamMember> {
  const response = await apiClient.post<UnionNationalTeamMember>(
    `/dashboards/union-admin/national-teams/${teamId}/members/`,
    payload,
  );
  return response.data;
}

export async function updateUnionNationalTeamMember(
  teamId: number,
  memberId: number,
  workspaceSlug: string,
  payload: Partial<Omit<CreateUnionNationalTeamMemberPayload, "workspace">>,
): Promise<UnionNationalTeamMember> {
  const response = await apiClient.patch<UnionNationalTeamMember>(
    `/dashboards/union-admin/national-teams/${teamId}/members/${memberId}/`,
    { workspace: workspaceSlug, ...payload },
  );
  return response.data;
}

export async function deleteUnionNationalTeamMember(
  teamId: number,
  memberId: number,
  workspaceSlug: string,
): Promise<void> {
  await apiClient.delete(
    `/dashboards/union-admin/national-teams/${teamId}/members/${memberId}/`,
    { data: { workspace: workspaceSlug } },
  );
}

export async function getUnionRegistrationApplications(
  workspaceSlug: string,
): Promise<UnionAdminListResponse<UnionRegistrationApplication>> {
  const response = await apiClient.get<
    UnionAdminListResponse<UnionRegistrationApplication>
  >(
    `/dashboards/union-admin/registration-applications/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );
  return response.data;
}

export async function updateUnionRegistrationApplication(
  applicationId: number,
  workspaceSlug: string,
  payload: Partial<
    Pick<
      UnionRegistrationApplication,
      "status" | "documents_complete" | "reviewer_notes" | "metadata"
    >
  >,
): Promise<UnionRegistrationApplication> {
  const response = await apiClient.patch<UnionRegistrationApplication>(
    `/dashboards/union-admin/registration-applications/${applicationId}/`,
    { workspace: workspaceSlug, ...payload },
  );
  return response.data;
}

export async function getUnionOfficialReadiness(
  workspaceSlug: string,
): Promise<UnionOfficialReadiness> {
  const response = await apiClient.get<UnionOfficialReadiness>(
    `/dashboards/union-admin/official-readiness/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );
  return response.data;
}

// UNION ADMIN MANAGEMENT API START

export type UnionAdminListResponse<T> = {
  count: number;
  results: T[];
};

export interface UnionAdminLeagueOption {
  id: number;
  name: string;
  slug: string;
  union: number | null;
  union_name: string | null;
  sport: string;
  description: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface UnionAdminSeasonRecord {
  id: number;
  league: number;
  league_name: string;
  name: string;
  slug: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnionAdminCompetitionRecord {
  id: number;
  league: number;
  league_name: string;
  name: string;
  slug: string;
  season: string;
  season_id: number | null;
  season_name: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  matches_count: number;
  clubs_count: number;
  created_at: string;
  updated_at: string;
}

export type UnionAdminClubMembershipStatus =
  "ACTIVE" | "PROMOTED" | "RELEGATED" | "WITHDRAWN" | "INVITED" | "SUSPENDED";

export interface UnionAdminLeagueClubMembership {
  id: number;
  league: number;
  league_name: string;
  league_slug: string;
  club: number;
  club_name: string;
  club_slug: string;
  club_short_name: string;
  season: number | null;
  season_name: string | null;
  status: UnionAdminClubMembershipStatus;
  status_display: string;
  promoted_from_league: number | null;
  promoted_from_league_name: string | null;
  relegated_to_league: number | null;
  relegated_to_league_name: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface UnionAdminGeneratedFixture {
  id: number;
  competition: number;
  competition_name: string;
  home_club: number;
  home_club_name: string;
  away_club: number;
  away_club_name: string;
  status: string;
  match_date: string;
  venue: string;
  round: string;
}

export interface UnionAdminFixtureVenuePayload {
  name: string;
  pitches: string[];
}

export interface UnionAdminFixtureBye {
  round: string;
  club: number;
  club_name: string;
}

export interface UnionAdminFixtureScheduleRules {
  start_date: string;
  match_days: string[];
  interval_days: number;
  first_kickoff_time: string;
  time_slots: string[];
  match_duration_minutes: number;
  turnaround_minutes: number;
  max_games_per_day: number;
  venues: UnionAdminFixtureVenuePayload[];
  excluded_dates: string[];
  home_and_away: boolean;
}

export interface UnionAdminFixtureGenerationResult {
  competition: UnionAdminCompetitionRecord;
  created_count: number;
  schedule_rules?: UnionAdminFixtureScheduleRules;
  byes?: UnionAdminFixtureBye[];
  fixtures: UnionAdminGeneratedFixture[];
}

export interface CreateUnionAdminSeasonPayload {
  workspace: string;
  league: number;
  name: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface CreateUnionAdminCompetitionPayload {
  workspace: string;
  league: number;
  name: string;
  season?: number;
  season_label?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface CreateUnionAdminLeagueClubPayload {
  workspace: string;
  league: number;
  club: string | number;
  season?: number;
  status?: UnionAdminClubMembershipStatus;
  notes?: string;
}

export interface BulkAddUnionAdminLeagueClubPayload {
  workspace: string;
  league: number;
  season: number;
  club_ids: Array<string | number>;
  status?: UnionAdminClubMembershipStatus;
  notes?: string;
}

export interface BulkAddUnionAdminLeagueClubResult {
  created: number;
  updated: number;
  missing_club_ids: number[];
  results: UnionAdminLeagueClubMembership[];
}

export interface UpdateUnionAdminLeagueClubPayload {
  workspace: string;
  status?: UnionAdminClubMembershipStatus;
  notes?: string;
}

export interface PromoteRelegateUnionAdminClubPayload {
  workspace: string;
  club: string | number;
  from_league: number;
  to_league: number;
  season?: number;
  target_season?: number;
  movement: "PROMOTED" | "RELEGATED";
  notes?: string;
}

export interface GenerateUnionAdminFixturesPayload {
  workspace: string;
  competition: number;
  start_date?: string;
  kickoff_time?: string;
  first_kickoff_time?: string;
  time_slots?: string[];
  match_days?: string[];
  interval_days?: number;
  match_duration_minutes?: number;
  turnaround_minutes?: number;
  max_games_per_day?: number;
  home_and_away?: boolean;
  clear_existing?: boolean;
  venue?: string;
  venues?: UnionAdminFixtureVenuePayload[];
  excluded_dates?: string[];
  rest_weeks?: string[];
}

export interface RescheduleUnionAdminFixturePayload {
  workspace: string;
  scheduled_date?: string;
  kickoff_time?: string;
  match_date?: string;
  venue?: string;
  pitch?: string;
  status?: string;
  round?: string;
  reason?: string;
}

export interface RescheduleUnionAdminFixtureResult {
  previous: {
    match_date: string;
    venue: string;
    round: string;
    status: string;
  };
  updated: UnionAdminGeneratedFixture;
  reason: string;
}

export async function getUnionAdminManagementLeagues(
  workspaceSlug: string,
): Promise<UnionAdminLeagueOption[]> {
  const response = await apiClient.get<
    UnionAdminListResponse<UnionAdminLeagueOption>
  >(
    `/dashboards/union-admin/leagues/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );

  return response.data.results ?? [];
}

export async function getUnionAdminManagementSeasons(
  workspaceSlug: string,
): Promise<UnionAdminSeasonRecord[]> {
  const response = await apiClient.get<
    UnionAdminListResponse<UnionAdminSeasonRecord>
  >(
    `/dashboards/union-admin/seasons/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );

  return response.data.results ?? [];
}

export async function createUnionAdminSeason(
  payload: CreateUnionAdminSeasonPayload,
): Promise<UnionAdminSeasonRecord> {
  const response = await apiClient.post<UnionAdminSeasonRecord>(
    "/dashboards/union-admin/seasons/",
    payload,
  );

  return response.data;
}

export async function getUnionAdminManagementCompetitions(
  workspaceSlug: string,
): Promise<UnionAdminCompetitionRecord[]> {
  const response = await apiClient.get<
    UnionAdminListResponse<UnionAdminCompetitionRecord>
  >(
    `/dashboards/union-admin/competitions/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );

  return response.data.results ?? [];
}

export async function createUnionAdminCompetition(
  payload: CreateUnionAdminCompetitionPayload,
): Promise<UnionAdminCompetitionRecord> {
  const response = await apiClient.post<UnionAdminCompetitionRecord>(
    "/dashboards/union-admin/competitions/",
    payload,
  );

  return response.data;
}

export async function getUnionAdminLeagueClubMemberships(
  workspaceSlug: string,
): Promise<UnionAdminLeagueClubMembership[]> {
  const response = await apiClient.get<
    UnionAdminListResponse<UnionAdminLeagueClubMembership>
  >(
    `/dashboards/union-admin/league-clubs/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );

  return response.data.results ?? [];
}

export async function createUnionAdminLeagueClubMembership(
  payload: CreateUnionAdminLeagueClubPayload,
): Promise<UnionAdminLeagueClubMembership> {
  const response = await apiClient.post<UnionAdminLeagueClubMembership>(
    "/dashboards/union-admin/league-clubs/",
    payload,
  );

  return response.data;
}

export async function bulkAddUnionAdminLeagueClubMemberships(
  payload: BulkAddUnionAdminLeagueClubPayload,
): Promise<BulkAddUnionAdminLeagueClubResult> {
  const response = await apiClient.post<BulkAddUnionAdminLeagueClubResult>(
    "/dashboards/union-admin/league-clubs/bulk-add/",
    payload,
  );

  return response.data;
}

export async function updateUnionAdminLeagueClubMembership(
  membershipId: number,
  payload: UpdateUnionAdminLeagueClubPayload,
): Promise<UnionAdminLeagueClubMembership> {
  const response = await apiClient.patch<UnionAdminLeagueClubMembership>(
    `/dashboards/union-admin/league-clubs/${membershipId}/`,
    payload,
  );

  return response.data;
}

export async function removeUnionAdminLeagueClubMembership(
  membershipId: number,
  workspaceSlug: string,
): Promise<UnionAdminLeagueClubMembership> {
  const response = await apiClient.delete<UnionAdminLeagueClubMembership>(
    `/dashboards/union-admin/league-clubs/${membershipId}/`,
    {
      data: {
        workspace: workspaceSlug,
        notes: "Removed from league by union admin.",
      },
    },
  );

  return response.data;
}

export async function promoteRelegateUnionAdminClub(
  payload: PromoteRelegateUnionAdminClubPayload,
): Promise<{
  source: UnionAdminLeagueClubMembership;
  target: UnionAdminLeagueClubMembership;
}> {
  const response = await apiClient.post<{
    source: UnionAdminLeagueClubMembership;
    target: UnionAdminLeagueClubMembership;
  }>("/dashboards/union-admin/promote-relegate/", payload);

  return response.data;
}

export async function generateUnionAdminFixtures(
  payload: GenerateUnionAdminFixturesPayload,
): Promise<UnionAdminFixtureGenerationResult> {
  const response = await apiClient.post<UnionAdminFixtureGenerationResult>(
    "/dashboards/union-admin/generate-fixtures/",
    payload,
  );

  return response.data;
}

export async function rescheduleUnionAdminFixture(
  fixtureId: number,
  payload: RescheduleUnionAdminFixturePayload,
): Promise<RescheduleUnionAdminFixtureResult> {
  const response = await apiClient.patch<RescheduleUnionAdminFixtureResult>(
    `/dashboards/union-admin/fixtures/${fixtureId}/reschedule/`,
    payload,
  );

  return response.data;
}

// UNION ADMIN MANAGEMENT API END

// UNION ADMIN CLUBS API START

export interface UnionAdminClubMembershipSummary {
  id: number;
  league: number;
  league_name: string;
  season: number | null;
  season_name: string | null;
  status: string;
  status_display: string;
  promoted_from_league_name: string | null;
  relegated_to_league_name: string | null;
  notes: string;
}

export interface UnionAdminClubRecord {
  id: number;
  name: string;
  slug: string;
  short_name: string;
  sport: string;
  sport_display: string;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string;
  secondary_color: string;
  admin: number | null;
  admin_name: string;
  admin_email: string;
  teams: number;
  players: number;
  compliance: string;
  memberships: UnionAdminClubMembershipSummary[];
  created_at: string;
}

export interface UpsertUnionAdminClubPayload {
  workspace: string;
  name?: string;
  short_name?: string;
  sport?: string;
  primary_color?: string;
  secondary_color?: string;
  admin_email?: string;
}

export async function getUnionAdminClubs(
  workspaceSlug: string,
  query = "",
): Promise<UnionAdminClubRecord[]> {
  const params = new URLSearchParams({ workspace: workspaceSlug });

  if (query.trim()) {
    params.set("q", query.trim());
  }

  const response = await apiClient.get<
    UnionAdminListResponse<UnionAdminClubRecord>
  >(`/dashboards/union-admin/clubs/?${params.toString()}`);

  return response.data.results ?? [];
}

export async function createUnionAdminClub(
  payload: UpsertUnionAdminClubPayload,
): Promise<UnionAdminClubRecord> {
  const response = await apiClient.post<UnionAdminClubRecord>(
    "/dashboards/union-admin/clubs/",
    payload,
  );

  return response.data;
}

export async function updateUnionAdminClub(
  clubId: number,
  payload: UpsertUnionAdminClubPayload,
): Promise<UnionAdminClubRecord> {
  const response = await apiClient.patch<UnionAdminClubRecord>(
    `/dashboards/union-admin/clubs/${clubId}/`,
    payload,
  );

  return response.data;
}

export async function deleteUnionAdminClub(
  clubId: number,
  workspaceSlug: string,
): Promise<void> {
  await apiClient.delete(`/dashboards/union-admin/clubs/${clubId}/`, {
    data: { workspace: workspaceSlug },
  });
}

// UNION ADMIN CLUBS API END

// UNION ADMIN REFEREES API START

export type UnionAdminOfficialStatus =
  "AVAILABLE" | "UNAVAILABLE" | "SUSPENDED" | "RETIRED";

export interface UnionAdminOfficialRoleOption {
  value: string;
  label: string;
}

export interface UnionAdminOfficialNextMatch {
  id: number;
  label: string;
  competition: string;
  match_date: string;
  venue: string;
  role_type: string;
  role_type_display: string;
  status: string;
  status_display: string;
}

export interface UnionAdminMatchOfficial {
  id: number;
  union: number;
  user: number | null;
  user_email?: string;
  full_name: string;
  email: string;
  phone_number: string;
  role_type: string;
  role_type_display: string;
  certification_level: string;
  primary_sport: string;
  competitions: string;
  status: UnionAdminOfficialStatus;
  status_display: string;
  notes: string;
  assignment_count: number;
  next_match: UnionAdminOfficialNextMatch | null;
  created_at: string;
  updated_at: string;
}

export interface UnionAdminMatchOfficialsResponse {
  count: number;
  sport: string;
  role_options: UnionAdminOfficialRoleOption[];
  results: UnionAdminMatchOfficial[];
}

export interface UpsertUnionAdminMatchOfficialPayload {
  workspace: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  role_type?: string;
  certification_level?: string;
  primary_sport?: string;
  competitions?: string;
  status?: UnionAdminOfficialStatus;
  notes?: string;
}

export async function getUnionAdminMatchOfficials(
  workspaceSlug: string,
  query = "",
): Promise<UnionAdminMatchOfficialsResponse> {
  const params = new URLSearchParams({ workspace: workspaceSlug });

  if (query.trim()) {
    params.set("q", query.trim());
  }

  const response = await apiClient.get<UnionAdminMatchOfficialsResponse>(
    `/dashboards/union-admin/referees/?${params.toString()}`,
  );

  return response.data;
}

export async function createUnionAdminMatchOfficial(
  payload: UpsertUnionAdminMatchOfficialPayload,
): Promise<UnionAdminMatchOfficial> {
  const response = await apiClient.post<UnionAdminMatchOfficial>(
    "/dashboards/union-admin/referees/",
    payload,
  );

  return response.data;
}

export async function updateUnionAdminMatchOfficial(
  officialId: number,
  payload: UpsertUnionAdminMatchOfficialPayload,
): Promise<UnionAdminMatchOfficial> {
  const response = await apiClient.patch<UnionAdminMatchOfficial>(
    `/dashboards/union-admin/referees/${officialId}/`,
    payload,
  );

  return response.data;
}

export async function deleteUnionAdminMatchOfficial(
  officialId: number,
  workspaceSlug: string,
): Promise<void> {
  await apiClient.delete(`/dashboards/union-admin/referees/${officialId}/`, {
    data: { workspace: workspaceSlug },
  });
}

// UNION ADMIN REFEREES API END
