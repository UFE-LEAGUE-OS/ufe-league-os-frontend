import apiClient from './apiClient.js';

export type SponsorType = 'INDIVIDUAL' | 'CORPORATE';

export type BecomeSponsorPayload = {
  sponsor_type: SponsorType;
  name: string;
  registration_country?: string;
  brn?: string;
  tin?: string;
};

export type SponsorAccountResponse = {
  id: number;
  sponsor_type: SponsorType;
  sponsor_type_display: string;
  name: string;
  registration_country: string;
  brn?: string;
  tin?: string;
  status: string;
  status_display: string;
  member_count: number;
  owner: {
    id: number | string;
    email?: string;
    full_name?: string;
    first_name?: string;
  };
};

export const becomeSponsor = (payload: BecomeSponsorPayload) =>
  apiClient.post<SponsorAccountResponse>('/accounts/become-sponsor/', payload);

export const getSponsorAccounts = () =>
  apiClient.get<{ count: number; results: SponsorAccountResponse[] }>(
    '/sponsorships/accounts/'
  );