import apiClient from './apiClient';
import { getMatchTicketTypes, type TicketTypeApi } from './ticketCheckoutService';

export {
  getMatchTicketTypes,
  type TicketTypeApi,
  type MatchTicketTypesResponse,
} from './ticketCheckoutService';

export type TicketTypeStatus = 'DRAFT' | 'ON_SALE' | 'CLOSED';

export type CreateTicketTypePayload = {
  name: string;
  description: string;
  price: string;
  currency: string;
  quantity_available: number;
  sale_start_at?: string | null;
  sale_end_at?: string | null;
};

/**
 * ASSUMED endpoint — no create route exists for ticket types yet.
 * See club-005-backend-requirements.md handed to the backend team.
 */
export async function createTicketType(
  matchId: number,
  payload: CreateTicketTypePayload,
): Promise<TicketTypeApi> {
  const response = await apiClient.post<TicketTypeApi>(
    `/ticketing/matches/${matchId}/ticket-types/`,
    payload,
  );

  return response.data;
}

/**
 * ASSUMED endpoint — reused for pricing edits, inventory quantity edits,
 * and status flips (publish/go-live), since the backend model already
 * carries all of these fields on the same ticket-type record.
 */
export async function updateTicketType(
  ticketTypeId: number,
  payload: Partial<CreateTicketTypePayload & { status: TicketTypeStatus }>,
): Promise<TicketTypeApi> {
  const response = await apiClient.patch<TicketTypeApi>(
    `/ticketing/ticket-types/${ticketTypeId}/`,
    payload,
  );

  return response.data;
}

export async function setTicketTypeStatus(
  ticketTypeId: number,
  status: TicketTypeStatus,
): Promise<TicketTypeApi> {
  return updateTicketType(ticketTypeId, { status });
}

/* -------------------------------------------------------------------------- */
/* Home gate / venue configuration — entirely new resource, no backend model */
/* exists for this today. See club-005-backend-requirements.md.              */
/* -------------------------------------------------------------------------- */

export interface MatchGateConfig {
  match: number;
  gate_name: string;
  capacity: number | null;
  notes: string;
  is_ticketing_enabled: boolean;
  updated_at?: string;
}

export type GateConfigPayload = Omit<MatchGateConfig, 'updated_at'>;

export async function getMatchGateConfig(
  matchId: number,
): Promise<MatchGateConfig | null> {
  try {
    const response = await apiClient.get<MatchGateConfig>(
      `/ticketing/matches/${matchId}/gate-config/`,
    );

    return response.data;
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      (error as { response?: { status?: number } }).response?.status === 404
    ) {
      return null;
    }

    throw error;
  }
}

export async function saveMatchGateConfig(
  matchId: number,
  payload: GateConfigPayload,
): Promise<MatchGateConfig> {
  const response = await apiClient.put<MatchGateConfig>(
    `/ticketing/matches/${matchId}/gate-config/`,
    payload,
  );

  return response.data;
}

/* -------------------------------------------------------------------------- */
/* Sales performance — computed client-side; no aggregation endpoint exists. */
/* -------------------------------------------------------------------------- */

export interface MatchSalesSummary {
  match_id: number;
  match_label: string;
  match_date: string;
  ticket_types: TicketTypeApi[];
  revenue: number;
  tickets_sold: number;
  quantity_available: number;
  sell_through_rate: number;
}

export function summarizeMatchSales(
  match: { id: number; label: string; match_date: string },
  ticketTypes: TicketTypeApi[],
): MatchSalesSummary {
  const revenue = ticketTypes.reduce(
    (sum, ticketType) => sum + Number(ticketType.price || 0) * ticketType.quantity_sold,
    0,
  );

  const ticketsSold = ticketTypes.reduce(
    (sum, ticketType) => sum + ticketType.quantity_sold,
    0,
  );

  const quantityAvailable = ticketTypes.reduce(
    (sum, ticketType) => sum + ticketType.quantity_available,
    0,
  );

  return {
    match_id: match.id,
    match_label: match.label,
    match_date: match.match_date,
    ticket_types: ticketTypes,
    revenue,
    tickets_sold: ticketsSold,
    quantity_available: quantityAvailable,
    sell_through_rate: quantityAvailable > 0 ? ticketsSold / quantityAvailable : 0,
  };
}

export async function getClubSalesSummary(
  homeMatches: Array<{ id: number; label: string; match_date: string }>,
): Promise<MatchSalesSummary[]> {
  const summaries = await Promise.all(
    homeMatches.map(async (match) => {
      try {
        const { ticket_types } = await getMatchTicketTypes(match.id);
        return summarizeMatchSales(match, ticket_types);
      } catch {
        return summarizeMatchSales(match, []);
      }
    }),
  );

  return summaries;
}

export function formatTicketCurrency(amount: number, currency = 'UGX') {
  return `${currency} ${amount.toLocaleString()}`;
}
