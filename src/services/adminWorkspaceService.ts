import apiClient from "./apiClient";

export interface AdminWorkspaceMatch {
  id: number;
  label: string;
  competition_id: number;
  competition: string;
  league_id: number;
  league: string;
  home_club_id: number;
  home_club: string;
  away_club_id: number;
  away_club: string;
  match_date: string;
  venue: string;
  round: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
}

export interface LeagueAdminWorkspaceScope {
  id: number;
  role: string;
  role_display: string;
  can_manage_appointments: boolean;
  league: {
    id: number;
    name: string;
    slug: string;
    union: string;
  };
  competition: {
    id: number;
    name: string;
    slug: string;
    season: string;
  } | null;
}

export interface LeagueAdminWorkspaceData {
  scope_type: "LEAGUE";
  scopes: LeagueAdminWorkspaceScope[];
  summary: {
    leagues: number;
    competitions: number;
    upcoming_fixtures: number;
    completed_matches: number;
    official_appointments: number;
  };
  upcoming_fixtures: AdminWorkspaceMatch[];
  recent_results: AdminWorkspaceMatch[];
}

export interface ClubAdminWorkspaceData {
  scope_type: "CLUB";
  club: {
    id: number;
    name: string;
    short_name: string;
    slug: string;
    sport: string;
    sport_display: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
  };
  summary: {
    competitions: number;
    upcoming_fixtures: number;
    completed_matches: number;
    club_users: number;
    ticket_types: number;
    tickets_sold: number;
    checked_in: number;
  };
  league_memberships: Array<{
    id: number;
    league: string;
    league_slug: string;
    season: string | null;
    status: string;
    status_display: string;
  }>;
  upcoming_fixtures: AdminWorkspaceMatch[];
  recent_results: AdminWorkspaceMatch[];
  ticket_events: TicketingEvent[];
  staff: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    role_display: string;
  }>;
}

export interface TicketingEvent extends AdminWorkspaceMatch {
  ticket_types: number;
  tickets_sold: number;
  checked_in: number;
}

export interface TicketingScope {
  key: string;
  scope_type: "UNION" | "CLUB";
  id: number;
  name: string;
  short_name: string;
  sport: string;
}

export interface TicketingLog {
  id: number;
  match_id: number | null;
  match: string;
  scanned_by: string;
  result: string;
  result_display: string;
  message: string;
  created_at: string;
}

export interface TicketingOfficerWorkspaceData {
  available_scopes: TicketingScope[];
  selected_scope: TicketingScope;
  summary: {
    active_events: number;
    tickets_sold: number;
    checked_in: number;
    pending_issues: number;
  };
  events: TicketingEvent[];
  recent_logs: TicketingLog[];
}

export interface TicketValidationResult {
  id?: number;
  result: string;
  result_display?: string;
  message: string;
  created_at?: string;
  ticket?: {
    id: number;
    status: string;
    ticket_code: string;
    match: number;
    match_label?: string;
    owner_email?: string;
    ticket_type_name?: string;
  };
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: string;
            message?: string;
            non_field_errors?: string[];
          };
        };
      }
    ).response;

    if (response?.data?.detail) {
      return response.data.detail;
    }

    if (response?.data?.message) {
      return response.data.message;
    }

    if (response?.data?.non_field_errors?.length) {
      return response.data.non_field_errors[0];
    }
  }

  return fallback;
}

export async function getLeagueAdminWorkspace(): Promise<LeagueAdminWorkspaceData> {
  const response = await apiClient.get<LeagueAdminWorkspaceData>(
    "/dashboards/league-admin/workspace/",
  );

  return response.data;
}

export async function getClubAdminWorkspace(): Promise<ClubAdminWorkspaceData> {
  const response = await apiClient.get<ClubAdminWorkspaceData>(
    "/dashboards/club-admin/workspace/",
  );

  return response.data;
}

export async function getTicketingOfficerWorkspace(
  scopeKey?: string,
): Promise<TicketingOfficerWorkspaceData> {
  const query = scopeKey
    ? `?scope=${encodeURIComponent(scopeKey)}`
    : "";

  const response =
    await apiClient.get<TicketingOfficerWorkspaceData>(
      `/dashboards/ticketing-officer/workspace/${query}`,
    );

  return response.data;
}

export async function validateWorkspaceTicket(payload: {
  scannedCode: string;
  matchId?: number;
}): Promise<TicketValidationResult> {
  const cleanedCode = payload.scannedCode
    .trim()
    .replace(/^LOS-TICKET:/i, "");

  const response = await apiClient.post<TicketValidationResult>(
    "/ticketing/validate/",
    {
      scanned_code: cleanedCode,
      ...(payload.matchId
        ? { match_id: payload.matchId }
        : {}),
    },
  );

  return response.data;
}
