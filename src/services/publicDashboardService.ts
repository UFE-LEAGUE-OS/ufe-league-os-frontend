import apiClient from "./apiClient.js";

export interface PublicClubApi {
    id: number;
    name: string;
    slug: string;
    short_name?: string;
    sport?: string;
    sport_display?: string;
    logo?: string | null;
    logo_url?: string;
    banner?: string | null;
    banner_url?: string;
    primary_color?: string;
    secondary_color?: string;
    created_at?: string;
}

export interface PublicCompetitionApi {
    id: number;
    name: string;
    slug: string;
    season?: string;
    league?: number;
    league_name?: string;
    is_active?: boolean;
    start_date?: string;
    end_date?: string;
    created_at?: string;
}

export interface PublicStandingApi {
    id: number;
    club: number;
    club_name: string;
    club_slug: string;
    position: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
    points: number;
    form: string | string[];
}

export interface PublicFixtureApi {
    id: number;
    competition: number;
    competition_name: string;
    home_club: number;
    home_club_name: string;
    home_club_slug: string;
    home_club_logo_url: string;
    away_club: number;
    away_club_name: string;
    away_club_slug: string;
    away_club_logo_url: string;
    status: string;
    match_date: string;
    venue: string;
    round?: string;
    home_score?: number | null;
    away_score?: number | null;
    created_at?: string;
}

export async function getPublicClubs(): Promise<PublicClubApi[]> {
    const response = await apiClient.get<PublicClubApi[]>(
        "/dashboards/public/clubs/",
    );

    return response.data;
}

export interface PublicFixtureFilters {
    clubId?: number;
    competitionId?: number;
}

function buildFixtureQuery(filters?: PublicFixtureFilters) {
    const params = new URLSearchParams();

    if (filters?.clubId) {
        params.set("club", String(filters.clubId));
    }

    if (filters?.competitionId) {
        params.set("competition", String(filters.competitionId));
    }

    const query = params.toString();

    return query ? `?${query}` : "";
}

export async function getPublicFixtures(
    filters?: PublicFixtureFilters,
): Promise<PublicFixtureApi[]> {
    const response = await apiClient.get<PublicFixtureApi[]>(
        `/dashboards/public/fixtures/${buildFixtureQuery(filters)}`,
    );

    return response.data;
}

export async function getPublicCompetitions(): Promise<PublicCompetitionApi[]> {
    const response = await apiClient.get<PublicCompetitionApi[]>(
        "/dashboards/public/competitions/",
    );

    return response.data;
}

export async function getPublicStandings(
    competitionId: number,
): Promise<PublicStandingApi[]> {
    const response = await apiClient.get<PublicStandingApi[]>(
        `/dashboards/public/standings/?competition=${competitionId}`,
    );

    return response.data;
}
