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





// UNION ADMIN MANAGEMENT API START

type UnionAdminListResponse<T> = {
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
  | "ACTIVE"
  | "PROMOTED"
  | "RELEGATED"
  | "WITHDRAWN"
  | "INVITED"
  | "SUSPENDED";

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

export interface UnionAdminFixtureGenerationResult {
  competition: UnionAdminCompetitionRecord;
  created_count: number;
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
  interval_days?: number;
  home_and_away?: boolean;
  clear_existing?: boolean;
  venue?: string;
}

export async function getUnionAdminManagementLeagues(
  workspaceSlug: string,
): Promise<UnionAdminLeagueOption[]> {
  const response = await apiClient.get<UnionAdminListResponse<UnionAdminLeagueOption>>(
    `/dashboards/union-admin/leagues/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );

  return response.data.results ?? [];
}

export async function getUnionAdminManagementSeasons(
  workspaceSlug: string,
): Promise<UnionAdminSeasonRecord[]> {
  const response = await apiClient.get<UnionAdminListResponse<UnionAdminSeasonRecord>>(
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
  const response = await apiClient.get<UnionAdminListResponse<UnionAdminCompetitionRecord>>(
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
  const response = await apiClient.get<UnionAdminListResponse<UnionAdminLeagueClubMembership>>(
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

// UNION ADMIN MANAGEMENT API END





