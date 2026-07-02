import apiClient from './apiClient.js';

export type BackendProfileVisibility = 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE';

export interface InterestPreference {
  id: number;
  user: number;
  interested_in_clubs: boolean;
  interested_in_leagues: boolean;
  interested_in_unions: boolean;
  interested_in_national_teams: boolean;
  interested_in_transfers: boolean;
  interested_in_highlights: boolean;
  interested_in_tickets: boolean;
  interested_in_merchandise: boolean;
  profile_visibility: BackendProfileVisibility;
  show_followed_teams: boolean;
  show_attended_matches: boolean;
  activity_visibility: BackendProfileVisibility;
  created_at: string;
  updated_at: string;
}

export interface InterestPreferencePayload {
  interested_in_clubs?: boolean;
  interested_in_leagues?: boolean;
  interested_in_unions?: boolean;
  interested_in_national_teams?: boolean;
  interested_in_transfers?: boolean;
  interested_in_highlights?: boolean;
  interested_in_tickets?: boolean;
  interested_in_merchandise?: boolean;
  profile_visibility?: BackendProfileVisibility;
  show_followed_teams?: boolean;
  show_attended_matches?: boolean;
  activity_visibility?: BackendProfileVisibility;
}

export async function getInterestPreferences(): Promise<InterestPreference> {
  const response = await apiClient.get<InterestPreference>('/accounts/interests/');
  return response.data;
}

export async function updateInterestPreferences(
  payload: InterestPreferencePayload,
): Promise<InterestPreference> {
  const response = await apiClient.patch<InterestPreference>(
    '/accounts/interests/',
    payload,
  );

  return response.data;
}
