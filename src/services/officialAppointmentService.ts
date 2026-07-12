import apiClient from "./apiClient";

export type OfficialAppointmentStatus =
  | "PROPOSED"
  | "ASSIGNED"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED";

export type LeagueAdminScopeRole =
  | "LEAGUE_ADMIN"
  | "COMPETITION_ADMIN"
  | "OFFICIALS_COORDINATOR"
  | "VIEWER";

export interface LeagueAdminScope {
  id: number;
  user: number;
  user_email: string;
  user_full_name: string;
  league: number;
  league_name: string;
  league_slug: string;
  union_id: number;
  union_name: string;
  competition: number | null;
  competition_name: string | null;
  competition_slug: string | null;
  role: LeagueAdminScopeRole;
  role_display: string;
  can_manage_appointments: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OfficialAppointment {
  id: number;
  match: number;
  match_label: string;
  league: number;
  league_name: string;
  competition: number;
  competition_name: string;
  competition_season: string;
  match_date: string;
  venue: string;
  round: string;
  home_club: number;
  home_club_name: string;
  away_club: number;
  away_club_name: string;
  official: number;
  official_user: number | null;
  official_name: string;
  official_email: string;
  role_type: string;
  role_type_display: string;
  status: OfficialAppointmentStatus;
  status_display: string;
  notes: string;
  response_note: string;
  responded_at: string | null;
  assigned_by: number | null;
  assigned_by_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentFixture {
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
  round?: string;
}

export interface AppointmentOfficial {
  id: number;
  full_name: string;
  email: string;
  role_type: string;
  role_type_display: string;
  certification_level: string;
  primary_sport: string;
  status: string;
  status_display: string;
}

export interface OfficialRoleOption {
  value: string;
  label: string;
}

type ListResponse<T> = {
  count: number;
  results: T[];
};

type OfficialsResponse = ListResponse<AppointmentOfficial> & {
  role_options: OfficialRoleOption[];
};

export interface CreateAppointmentPayload {
  match: number;
  official: number;
  role_type: string;
  status?: "PROPOSED" | "ASSIGNED";
  notes?: string;
}

export async function getLeagueAdminScopes(): Promise<LeagueAdminScope[]> {
  const response = await apiClient.get<ListResponse<LeagueAdminScope>>(
    "/dashboards/league-admin/scopes/",
  );
  return response.data.results ?? [];
}

export async function getLeagueAdminFixtures(params?: {
  league?: number;
  competition?: number;
}): Promise<AppointmentFixture[]> {
  const query = new URLSearchParams();
  if (params?.league) query.set("league", String(params.league));
  if (params?.competition) query.set("competition", String(params.competition));

  const response = await apiClient.get<ListResponse<AppointmentFixture>>(
    `/dashboards/league-admin/fixtures/?${query.toString()}`,
  );
  return response.data.results ?? [];
}

export async function getLeagueAdminOfficials(params?: {
  league?: number;
  competition?: number;
}): Promise<OfficialsResponse> {
  const query = new URLSearchParams();
  if (params?.league) query.set("league", String(params.league));
  if (params?.competition) query.set("competition", String(params.competition));

  const response = await apiClient.get<OfficialsResponse>(
    `/dashboards/league-admin/match-officials/?${query.toString()}`,
  );
  return response.data;
}

export async function getLeagueAdminAppointments(params?: {
  league?: number;
  competition?: number;
  status?: OfficialAppointmentStatus;
}): Promise<OfficialAppointment[]> {
  const query = new URLSearchParams();
  if (params?.league) query.set("league", String(params.league));
  if (params?.competition) query.set("competition", String(params.competition));
  if (params?.status) query.set("status", params.status);

  const response = await apiClient.get<ListResponse<OfficialAppointment>>(
    `/dashboards/league-admin/fixture-official-appointments/?${query.toString()}`,
  );
  return response.data.results ?? [];
}

export async function createLeagueAdminAppointment(
  payload: CreateAppointmentPayload,
): Promise<OfficialAppointment> {
  const response = await apiClient.post<OfficialAppointment>(
    "/dashboards/league-admin/fixture-official-appointments/",
    payload,
  );
  return response.data;
}

export async function updateLeagueAdminAppointment(
  appointmentId: number,
  payload: {
    role_type?: string;
    status?: "PROPOSED" | "ASSIGNED" | "CANCELLED";
    notes?: string;
  },
): Promise<OfficialAppointment> {
  const response = await apiClient.patch<OfficialAppointment>(
    `/dashboards/league-admin/fixture-official-appointments/${appointmentId}/`,
    payload,
  );
  return response.data;
}

export async function getUnionAdminAppointments(
  workspaceSlug: string,
): Promise<OfficialAppointment[]> {
  const response = await apiClient.get<ListResponse<OfficialAppointment>>(
    `/dashboards/union-admin/fixture-official-appointments/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );
  return response.data.results ?? [];
}

export async function createUnionAdminAppointment(
  workspaceSlug: string,
  payload: CreateAppointmentPayload,
): Promise<OfficialAppointment> {
  const response = await apiClient.post<OfficialAppointment>(
    "/dashboards/union-admin/fixture-official-appointments/",
    { workspace: workspaceSlug, ...payload },
  );
  return response.data;
}

export async function updateUnionAdminAppointment(
  workspaceSlug: string,
  appointmentId: number,
  payload: {
    status?: "PROPOSED" | "ASSIGNED" | "CANCELLED";
    role_type?: string;
    notes?: string;
  },
): Promise<OfficialAppointment> {
  const response = await apiClient.patch<OfficialAppointment>(
    `/dashboards/union-admin/fixture-official-appointments/${appointmentId}/`,
    { workspace: workspaceSlug, ...payload },
  );
  return response.data;
}

export async function getMyOfficialAppointments(): Promise<OfficialAppointment[]> {
  const response = await apiClient.get<ListResponse<OfficialAppointment>>(
    "/dashboards/match-official/appointments/",
  );
  return response.data.results ?? [];
}

export async function respondToOfficialAppointment(
  appointmentId: number,
  payload: {
    status: "ACCEPTED" | "DECLINED";
    response_note?: string;
  },
): Promise<OfficialAppointment> {
  const response = await apiClient.patch<OfficialAppointment>(
    `/dashboards/match-official/appointments/${appointmentId}/response/`,
    payload,
  );
  return response.data;
}

export interface UpsertLeagueAdminScopePayload {
  workspace: string;
  email?: string;
  user?: number;
  league: number;
  competition?: number | null;
  role: LeagueAdminScopeRole;
  is_active?: boolean;
}

export async function getUnionAdminLeagueScopes(
  workspaceSlug: string,
): Promise<LeagueAdminScope[]> {
  const response = await apiClient.get<ListResponse<LeagueAdminScope>>(
    `/dashboards/union-admin/league-admin-scopes/?workspace=${encodeURIComponent(workspaceSlug)}`,
  );
  return response.data.results ?? [];
}

export async function createUnionAdminLeagueScope(
  payload: UpsertLeagueAdminScopePayload,
): Promise<LeagueAdminScope> {
  const response = await apiClient.post<LeagueAdminScope>(
    "/dashboards/union-admin/league-admin-scopes/",
    payload,
  );
  return response.data;
}

export async function updateUnionAdminLeagueScope(
  workspaceSlug: string,
  scopeId: number,
  payload: Partial<Pick<UpsertLeagueAdminScopePayload, "role" | "is_active">>,
): Promise<LeagueAdminScope> {
  const response = await apiClient.patch<LeagueAdminScope>(
    `/dashboards/union-admin/league-admin-scopes/${scopeId}/`,
    { workspace: workspaceSlug, ...payload },
  );
  return response.data;
}

export async function deleteUnionAdminLeagueScope(
  workspaceSlug: string,
  scopeId: number,
): Promise<void> {
  await apiClient.delete(
    `/dashboards/union-admin/league-admin-scopes/${scopeId}/`,
    { data: { workspace: workspaceSlug } },
  );
}
