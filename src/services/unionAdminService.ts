import apiClient from "./apiClient";

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
  | "union.teams.manage";

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
  effective_permissions: UnionWorkspacePermission[];
  workspace: BackendUnionWorkspace;
}

interface BackendUnionWorkspacesResponse {
  count: number;
  results: BackendUnionWorkspaceMembership[];
}

export interface UnionDashboardSummary {
  leagues?: number;
  active_competitions: number;
  member_clubs: number;
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

interface UnionWorkspaceUsersResponse {
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

function mapMembership(item: BackendUnionWorkspaceMembership): UnionWorkspaceOption {
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
    permissions: item.effective_permissions ?? [],
  };
}

export async function getMyUnionWorkspaces(): Promise<UnionWorkspaceOption[]> {
  const response = await apiClient.get<BackendUnionWorkspacesResponse>(
    "/dashboards/union-admin/workspaces/",
  );

  return response.data.results.map(mapMembership);
}

export async function switchUnionWorkspace(workspaceSlug: string): Promise<UnionWorkspaceOption> {
  const response = await apiClient.post<BackendUnionWorkspaceMembership>(
    "/dashboards/union-admin/switch-workspace/",
    { workspace: workspaceSlug },
  );

  return mapMembership(response.data);
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
): Promise<UnionWorkspaceUser[]> {
  const response = await apiClient.get<UnionWorkspaceUsersResponse>(
    `/dashboards/union-admin/workspace-users/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );

  return response.data.results ?? [];
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
  match: string;
  competition: string;
  date: string;
  venue: string;
  role: string;
  report: string;
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

