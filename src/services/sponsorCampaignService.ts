import apiClient from './apiClient.js';

export type CampaignStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'REJECTED';

export interface SponsorCampaignAudience {
  sports: string[];
  leagues: string[];
  age_groups: string[];
  gender: string;
  locations: string[];
  fan_interests: string[];
}

export interface SponsorCampaignBudget {
  amount: string;
  is_custom_amount: boolean;
  duration: string;
  payment_schedule: string;
  starts_at: string | null;
  ends_at: string | null;
}

export interface SponsorCampaignAsset {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  size_bytes: number;
  placement: string;
  uploaded_at: string;
}

export interface SponsorCampaign {
  id: number;
  sponsor_account: number;
  name: string;
  property: string;
  campaign_type: string;
  description: string;
  goals: string[];
  audience: SponsorCampaignAudience;
  budget: SponsorCampaignBudget;
  placement_preferences: string[];
  assets: SponsorCampaignAsset[];
  status: CampaignStatus;
  reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface SponsorCampaignDraftPayload {
  sponsor_account: number;
  name?: string;
  property?: string;
  campaign_type?: string;
  description?: string;
  goals?: string[];
  audience?: Partial<SponsorCampaignAudience>;
  budget?: Partial<SponsorCampaignBudget>;
  placement_preferences?: string[];
}

export const createSponsorCampaignDraft = (
  payload: SponsorCampaignDraftPayload,
) =>
  apiClient.post<SponsorCampaign>(
    '/sponsorships/campaigns/',
    payload,
  );

export const saveSponsorCampaignDraft = (
  campaignId: number,
  payload: SponsorCampaignDraftPayload,
) =>
  apiClient.put<SponsorCampaign>(
    `/sponsorships/campaigns/${campaignId}/`,
    payload,
  );

export const getSponsorCampaign = (
  campaignId: number,
) =>
  apiClient.get<SponsorCampaign>(
    `/sponsorships/campaigns/${campaignId}/`,
  );

export const submitSponsorCampaign = (
  campaignId: number,
) =>
  apiClient.post<SponsorCampaign>(
    `/sponsorships/campaigns/${campaignId}/submit/`,
  );

export const uploadSponsorCampaignAsset = (
  campaignId: number,
  file: File,
  placement?: string,
) => {
  const formData = new FormData();
  formData.append('file', file);
  if (placement) {
    formData.append('placement', placement);
  }

  return apiClient.post<SponsorCampaignAsset>(
    `/sponsorships/campaigns/${campaignId}/assets/`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
};

export const deleteSponsorCampaignAsset = (
  campaignId: number,
  assetId: number,
) =>
  apiClient.delete(
    `/sponsorships/campaigns/${campaignId}/assets/${assetId}/`,
  );
