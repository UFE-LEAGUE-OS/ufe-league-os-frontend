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

export async function getPublicFixtures(): Promise<PublicFixtureApi[]> {
    const response = await apiClient.get<PublicFixtureApi[]>(
        "/dashboards/public/fixtures/",
    );

    return response.data;
}
