import apiClient from './apiClient.js';

export type BackendClub = {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
};

export const fetchPublicClubs = () =>
  apiClient.get<BackendClub[]>('/dashboards/public/clubs/');
