import apiClient from "./apiClient";
import type { ActiveClubWorkspace } from "../utils/clubWorkspace";
import { getStoredUser } from "../utils/tokenManager";
import type { AuthenticatedUser } from "../types/dashboardAccess";

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

export interface ClubActivityItem {
  id: number | string;
  title: string;
  description: string;
  timestamp: string;
}

export interface ClubFinancialPoint {
  month: string;
  income: number;
  expense: number;
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
  recent_activity?: ClubActivityItem[];
  financial_overview?: ClubFinancialPoint[];
  ticketing_scope?: TicketingScope;
  ticketing_logs?: TicketingLog[];
  ticketing_pending_issues?: number;
}

export interface TreasurerTransaction {
  id: number | string;
  label: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  created_at: string;
}

export interface TreasurerExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface TreasurerWorkspaceData {
  scope_type: "TREASURER";
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
    club_balance: number;
    total_income: number;
    total_expenses: number;
    pending_payments: number;
    pending_payments_count: number;
    budget_used: number;
    budget_total: number;
  };
  income_vs_expense: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  recent_transactions: TreasurerTransaction[];
  expense_breakdown: TreasurerExpenseCategory[];
}

export interface ChairmanWorkspaceData {
  scope_type: "CHAIRMAN";
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
    total_members: number;
    teams: number;
    active_matches: number;
    club_balance: number;
  };
  club_overview: {
    founded: number;
    total_players: number;
    active_sponsors: number;
    leagues: number;
  };
}

/* -------------------------------------------------------------------------- */
/* Club Budgets (Treasurer draft/submit, Chairman approve/reject/override)    */
/* -------------------------------------------------------------------------- */

export type ClubBudgetStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED";

export interface ClubBudgetCategoryAllocation {
  id: number | string;
  category: string;
  allocated: number;
}

export interface ClubBudget {
  id: number | null;
  club_id: number;
  season: string;
  status: ClubBudgetStatus;
  total_allocated: number;
  categories: ClubBudgetCategoryAllocation[];
  submitted_by: string | null;
  submitted_at: string | null;
  decided_by: string | null;
  decided_at: string | null;
  decision_note: string | null;
  updated_at: string | null;
}

export interface ClubBudgetDraftPayload {
  season?: string;
  categories: Array<{
    id?: number | string;
    category: string;
    allocated: number;
  }>;
}

/**
 * Treasurer: load the club's current budget (whatever state it is in).
 */
export async function getTreasurerBudget(): Promise<ClubBudget> {
  const response = await apiClient.get<ClubBudget>(
    "/dashboards/treasurer/budget/",
  );

  return response.data;
}

/**
 * Treasurer: save category allocations as a draft. Safe to call
 * repeatedly; does not change the approval status other than
 * ensuring the budget is editable (DRAFT).
 */
export async function saveTreasurerBudgetDraft(
  payload: ClubBudgetDraftPayload,
): Promise<ClubBudget> {
  const response = await apiClient.put<ClubBudget>(
    "/dashboards/treasurer/budget/",
    payload,
  );

  return response.data;
}

/**
 * Treasurer: submit the current draft to the chairman for approval.
 */
export async function submitTreasurerBudgetForApproval(): Promise<ClubBudget> {
  const response = await apiClient.post<ClubBudget>(
    "/dashboards/treasurer/budget/submit/",
  );

  return response.data;
}

/**
 * Chairman: load the club's current budget for review.
 */
export async function getChairmanBudget(): Promise<ClubBudget> {
  const response = await apiClient.get<ClubBudget>(
    "/dashboards/chairman/budget/",
  );

  return response.data;
}

/**
 * Chairman: approve a budget that is pending approval.
 */
export async function approveChairmanBudget(): Promise<ClubBudget> {
  const response = await apiClient.post<ClubBudget>(
    "/dashboards/chairman/budget/approve/",
  );

  return response.data;
}

/**
 * Chairman: reject a budget that is pending approval, with a note
 * explaining why so the treasurer can revise it.
 */
export async function rejectChairmanBudget(
  note: string,
): Promise<ClubBudget> {
  const response = await apiClient.post<ClubBudget>(
    "/dashboards/chairman/budget/reject/",
    { note },
  );

  return response.data;
}

/**
 * Chairman: override the budget directly, setting allocations and
 * marking it approved immediately, bypassing the treasurer workflow.
 */
export async function overrideChairmanBudget(
  payload: ClubBudgetDraftPayload & { note?: string },
): Promise<ClubBudget> {
  const response = await apiClient.put<ClubBudget>(
    "/dashboards/chairman/budget/override/",
    payload,
  );

  return response.data;
}

export type CustomAdminPermissionKey =
  | "view_members"
  | "manage_teams"
  | "view_matches"
  | "manage_finances"
  | "manage_tickets"
  | "manage_facilities"
  | "view_reports"
  | "manage_communications";

export interface CustomAdminWorkspaceData {
  scope_type: "CUSTOM_ADMIN";
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
    total_members: number;
    teams: number;
    active_matches: number;
    open_reports: number;
  };
  permissions: Partial<
    Record<CustomAdminPermissionKey, boolean>
  >;
  recent_activity: ClubActivityItem[];
}

export interface TeamManagerTrainingSession {
  id: number | string;
  label: string;
  type: string;
  scheduled_at: string;
}

export interface TeamManagerWorkspaceData {
  scope_type: "TEAM_MANAGER";
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
  team: {
    id: number;
    name: string;
    slug: string;
    logo_url: string | null;
    player_count: number;
  } | null;
  next_fixture: {
    id: number;
    competition: string;
    home_club: string;
    away_club: string;
    match_date: string;
    venue: string;
  } | null;
  training_schedule: TeamManagerTrainingSession[];
  player_availability: {
    available: number;
    unavailable: number;
    injured: number;
    total: number;
  };
  recent_updates: ClubActivityItem[];
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
        response?: { data?: unknown };
      }
    ).response;

    const message = getFirstApiMessage(response?.data);
    if (message) {
      return message;
    }
  }

  return fallback;
}

function getFirstApiMessage(value: unknown, field?: string): string | null {
  if (typeof value === "string" && value.trim()) {
    const trimmed = value.trim();
    if (/^<!doctype html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
      return null;
    }

    return field && !["detail", "message", "non_field_errors"].includes(field)
      ? `${formatApiErrorField(field)}: ${trimmed}`
      : trimmed;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = getFirstApiMessage(item, field);
      if (message) return message;
    }
  }

  if (value && typeof value === "object") {
    for (const [key, nestedValue] of Object.entries(
      value as Record<string, unknown>,
    )) {
      const message = getFirstApiMessage(nestedValue, key);
      if (message) return message;
    }
  }

  return null;
}

function formatApiErrorField(field: string): string {
  return field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function getLeagueAdminWorkspace(): Promise<LeagueAdminWorkspaceData> {
  const response = await apiClient.get<LeagueAdminWorkspaceData>(
    "/dashboards/league-admin/workspace/",
  );

  return response.data;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeClubScopeId(scopeId: string | number) {
  if (
    typeof scopeId === "number" &&
    Number.isFinite(scopeId)
  ) {
    return String(scopeId);
  }

  if (typeof scopeId === "string" && scopeId.trim()) {
    return scopeId.trim();
  }

  throw new Error("A valid selected Club workspace scope is required.");
}

function assertSelectedClubWorkspace(
  value: unknown,
  selectedScopeId: string,
): asserts value is ClubAdminWorkspaceData {
  if (
    !isRecord(value) ||
    value.scope_type !== "CLUB" ||
    !isRecord(value.club) ||
    !isFiniteNumber(value.club.id) ||
    String(value.club.id) !== selectedScopeId
  ) {
    throw new Error(
      "The Club workspace response did not match the selected Club workspace.",
    );
  }
}

export async function getClubAdminWorkspace(
  scopeId?: string | number,
): Promise<ClubAdminWorkspaceData> {
  // Compatibility bridge for legacy page modules while they migrate to the
  // selected-entitlement loader. Never fall back to a user-linked Club: an
  // omitted scope must fail before an API request is made.
  if (scopeId === undefined) {
    throw new Error(
      "A valid selected Club workspace scope is required.",
    );
  }

  const selectedScopeId = normalizeClubScopeId(scopeId);
  // The current backend still resolves this endpoint from the user-linked
  // Club. Send the selected scope for the maintained contract, then reject
  // the response below if the backend did not actually honor that selection.
  try {
    const response = await apiClient.get<unknown>(
      `/dashboards/club-admin/workspace/?club_id=${encodeURIComponent(
        selectedScopeId,
      )}`,
    );

    assertSelectedClubWorkspace(
      response.data,
      selectedScopeId,
    );

    return response.data;
  } catch (error) {
    return getLegacyClubAdminWorkspace(selectedScopeId, error);
  }
}

async function getLegacyClubAdminWorkspace(
  selectedScopeId: string,
  originalError: unknown,
): Promise<ClubAdminWorkspaceData> {
  try {
    const response = await apiClient.get<{
      user?: AuthenticatedUser | null;
    }>("/dashboards/club-admin/");
    const user =
      response.data.user ??
      getStoredUser<AuthenticatedUser>();
    const club =
      user && typeof user.club === "object" && user.club !== null
        ? user.club as { id?: unknown; name?: unknown }
        : null;
    const clubId =
      typeof club?.id === "number" || typeof club?.id === "string"
        ? Number(club.id)
        : Number(selectedScopeId);

    if (!Number.isFinite(clubId)) {
      throw originalError;
    }

    return {
      scope_type: "CLUB",
      club: {
        id: clubId,
        name:
          typeof club?.name === "string" && club.name.trim()
            ? club.name
            : "Club Operations",
        short_name: "",
        slug: "",
        sport: "FOOTBALL",
        sport_display: "Football",
        logo_url: null,
        primary_color: "",
        secondary_color: "",
      },
      summary: {
        competitions: 0,
        upcoming_fixtures: 0,
        completed_matches: 0,
        club_users: 0,
        ticket_types: 0,
        tickets_sold: 0,
        checked_in: 0,
      },
      league_memberships: [],
      upcoming_fixtures: [],
      recent_results: [],
      ticket_events: [],
      staff: [],
      recent_activity: [],
      financial_overview: [],
      ticketing_logs: [],
      ticketing_pending_issues: 0,
    };
  } catch {
    throw originalError;
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNullableFiniteNumber(
  value: unknown,
): value is number | null {
  return value === null || isFiniteNumber(value);
}

function isTicketingScope(value: unknown): value is TicketingScope {
  if (!isRecord(value)) return false;

  return (
    typeof value.key === "string" &&
    (value.scope_type === "CLUB" ||
      value.scope_type === "UNION") &&
    isFiniteNumber(value.id) &&
    typeof value.name === "string" &&
    typeof value.short_name === "string" &&
    typeof value.sport === "string"
  );
}

function isTicketingEvent(value: unknown): value is TicketingEvent {
  if (!isRecord(value)) return false;

  return (
    isFiniteNumber(value.id) &&
    typeof value.label === "string" &&
    isFiniteNumber(value.competition_id) &&
    typeof value.competition === "string" &&
    isFiniteNumber(value.league_id) &&
    typeof value.league === "string" &&
    isFiniteNumber(value.home_club_id) &&
    typeof value.home_club === "string" &&
    isFiniteNumber(value.away_club_id) &&
    typeof value.away_club === "string" &&
    typeof value.match_date === "string" &&
    typeof value.venue === "string" &&
    typeof value.round === "string" &&
    typeof value.status === "string" &&
    isNullableFiniteNumber(value.home_score) &&
    isNullableFiniteNumber(value.away_score) &&
    isFiniteNumber(value.ticket_types) &&
    isFiniteNumber(value.tickets_sold) &&
    isFiniteNumber(value.checked_in)
  );
}

function isTicketingLog(value: unknown): value is TicketingLog {
  if (!isRecord(value)) return false;

  return (
    isFiniteNumber(value.id) &&
    (value.match_id === null ||
      isFiniteNumber(value.match_id)) &&
    typeof value.match === "string" &&
    typeof value.scanned_by === "string" &&
    typeof value.result === "string" &&
    typeof value.result_display === "string" &&
    typeof value.message === "string" &&
    typeof value.created_at === "string"
  );
}

function assertSelectedClubTicketingWorkspace(
  value: unknown,
  selectedScopeId: string,
): asserts value is TicketingOfficerWorkspaceData {
  if (
    !isRecord(value) ||
    !Array.isArray(value.available_scopes) ||
    !value.available_scopes.every(isTicketingScope) ||
    !isTicketingScope(value.selected_scope) ||
    value.selected_scope.scope_type !== "CLUB" ||
    String(value.selected_scope.id) !== selectedScopeId ||
    value.selected_scope.key !== `club:${selectedScopeId}` ||
    !value.available_scopes.some(
      (scope) =>
        scope.scope_type === "CLUB" &&
        String(scope.id) === selectedScopeId &&
        scope.key === `club:${selectedScopeId}`,
    ) ||
    !isRecord(value.summary) ||
    !isFiniteNumber(value.summary.active_events) ||
    !isFiniteNumber(value.summary.tickets_sold) ||
    !isFiniteNumber(value.summary.checked_in) ||
    !isFiniteNumber(value.summary.pending_issues) ||
    !Array.isArray(value.events) ||
    !value.events.every(isTicketingEvent) ||
    !Array.isArray(value.recent_logs) ||
    !value.recent_logs.every(isTicketingLog)
  ) {
    throw new Error(
      "The ticketing response did not match the selected Club workspace.",
    );
  }
}

function mapClubTicketingWorkspace(
  data: TicketingOfficerWorkspaceData,
): ClubAdminWorkspaceData {
  const scope = data.selected_scope;
  const ticketTypes = data.events.reduce(
    (total, event) => total + event.ticket_types,
    0,
  );

  return {
    scope_type: "CLUB",
    club: {
      id: scope.id,
      name: scope.name,
      short_name: scope.short_name,
      slug: "",
      sport: scope.sport,
      sport_display: scope.sport,
      logo_url: null,
      primary_color: "",
      secondary_color: "",
    },
    summary: {
      competitions: new Set(
        data.events.map((event) => event.competition_id),
      ).size,
      upcoming_fixtures: data.summary.active_events,
      completed_matches: 0,
      club_users: 0,
      ticket_types: ticketTypes,
      tickets_sold: data.summary.tickets_sold,
      checked_in: data.summary.checked_in,
    },
    league_memberships: [],
    upcoming_fixtures: [...data.events],
    recent_results: [],
    ticket_events: [...data.events],
    staff: [],
    ticketing_scope: { ...scope },
    ticketing_logs: [...data.recent_logs],
    ticketing_pending_issues: data.summary.pending_issues,
  };
}

export async function getSelectedClubWorkspace(
  workspace: ActiveClubWorkspace,
): Promise<ClubAdminWorkspaceData> {
  const selectedScopeId = normalizeClubScopeId(
    workspace.scope_id,
  );

  if (
    workspace.scope_type !== "CLUB" ||
    !workspace.entitlement_id ||
    !Array.isArray(workspace.permissions) ||
    !workspace.permissions.every(
      (permission) => typeof permission === "string",
    )
  ) {
    throw new Error(
      "The selected Club workspace entitlement is invalid.",
    );
  }

  if (workspace.dashboard === "CLUB_ADMIN") {
    const normalClubRoles = new Set([
      "CLUB_ADMIN",
      "CHAIRMAN",
      "TREASURER",
      "TEAM_MANAGER",
      "CUSTOM",
      "CUSTOM_ADMIN",
    ]);

    if (
      workspace.route !== "/dashboard/club-admin" ||
      !normalClubRoles.has(workspace.workspace_role) ||
      !workspace.permissions.includes(
        "dashboard.club_admin",
      )
    ) {
      throw new Error(
        "The selected Club workspace entitlement is invalid.",
      );
    }

    return getClubAdminWorkspace(selectedScopeId);
  }

  if (
    workspace.dashboard !== "TICKETING_OFFICER" ||
    workspace.route !== "/dashboard/ticketing-officer" ||
    workspace.workspace_role !== "TICKETING_OFFICER" ||
    !workspace.permissions.includes(
      "dashboard.ticketing_officer",
    )
  ) {
    throw new Error(
      "The selected Club workspace entitlement is invalid.",
    );
  }

  const ticketingWorkspace =
    await getTicketingOfficerWorkspace(
      `club:${selectedScopeId}`,
    );

  assertSelectedClubTicketingWorkspace(
    ticketingWorkspace,
    selectedScopeId,
  );

  return mapClubTicketingWorkspace(ticketingWorkspace);
}

export async function getCustomAdminWorkspace(): Promise<CustomAdminWorkspaceData> {
  const response = await apiClient.get<CustomAdminWorkspaceData>(
    "/dashboards/custom-admin/workspace/",
  );

  return response.data;
}

export async function getChairmanWorkspace(): Promise<ChairmanWorkspaceData> {
  const response = await apiClient.get<ChairmanWorkspaceData>(
    "/dashboards/chairman/workspace/",
  );

  return response.data;
}

export async function getTreasurerWorkspace(): Promise<TreasurerWorkspaceData> {
  const response = await apiClient.get<TreasurerWorkspaceData>(
    "/dashboards/treasurer/workspace/",
  );

  return response.data;
}

export async function getTeamManagerWorkspace(): Promise<TeamManagerWorkspaceData> {
  const response = await apiClient.get<TeamManagerWorkspaceData>(
    "/dashboards/team-manager/workspace/",
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
