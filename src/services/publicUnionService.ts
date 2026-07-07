import apiClient from "./apiClient.js";

export interface PublicUnionApi {
    id: number;
    name: string;
    slug: string;
    logo?: string | null;
    description?: string;
    website?: string;
    founded_year?: number | null;
    country?: string;
    created_at?: string;
}

export async function getPublicUnions(): Promise<PublicUnionApi[]> {
    const response = await apiClient.get<PublicUnionApi[]>("/dashboards/public/unions/");

    return response.data;
}
