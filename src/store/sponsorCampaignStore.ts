import { create } from 'zustand';
import {
  createSponsorCampaignDraft,
  getSponsorCampaign,
  saveSponsorCampaignDraft,
  submitSponsorCampaign,
  type CampaignStatus,
  type SponsorCampaign,
  type SponsorCampaignAsset,
  type SponsorCampaignAudience,
  type SponsorCampaignBudget,
  type SponsorCampaignDraftPayload,
} from '../services/sponsorCampaignService';
import { getSponsorAccounts } from '../services/sponsorshipService';

export type CampaignInfoFormData = {
  campaignName: string;
  property: string;
  campaignType: string;
  description: string;
  goals: string[];
};

export type CampaignAudienceFormData = {
  sports: string[];
  leagues: string[];
  ageGroups: string[];
  gender: string;
  locations: string[];
  fanInterests: string[];
};

export type CampaignBudgetFormData = {
  presetId: string;
  isCustom: boolean;
  amount: string;
  duration: string;
  paymentSchedule: string;
  startDate: string;
  endDate: string;
};

const initialInfo: CampaignInfoFormData = {
  campaignName: '',
  property: '',
  campaignType: '',
  description: '',
  goals: [],
};

const initialAudience: CampaignAudienceFormData = {
  sports: [],
  leagues: [],
  ageGroups: [],
  gender: '',
  locations: [],
  fanInterests: [],
};

const initialBudget: CampaignBudgetFormData = {
  presetId: 'premium',
  isCustom: false,
  amount: '50,000,000',
  duration: '1year',
  paymentSchedule: 'upfront',
  startDate: '',
  endDate: '',
};

const audienceFromApi = (audience: SponsorCampaignAudience): CampaignAudienceFormData => ({
  sports: audience.sports ?? [],
  leagues: audience.leagues ?? [],
  ageGroups: audience.age_groups ?? [],
  gender: audience.gender ?? '',
  locations: audience.locations ?? [],
  fanInterests: audience.fan_interests ?? [],
});

const budgetFromApi = (budget: SponsorCampaignBudget): CampaignBudgetFormData => ({
  presetId: budget.is_custom_amount ? 'custom' : 'premium',
  isCustom: budget.is_custom_amount,
  amount: budget.amount,
  duration: budget.duration,
  paymentSchedule: budget.payment_schedule,
  startDate: budget.starts_at ?? '',
  endDate: budget.ends_at ?? '',
});

type SponsorCampaignStore = {
  campaignId: number | null;
  sponsorAccountId: number | null;
  agreementId: number | null;
  status: CampaignStatus | null;
  info: CampaignInfoFormData;
  audience: CampaignAudienceFormData;
  assets: SponsorCampaignAsset[];
  placements: string[];
  budget: CampaignBudgetFormData;
  saving: boolean;
  hydrating: boolean;
  error: string | null;

  updateInfo: (patch: Partial<CampaignInfoFormData>) => void;
  updateAudience: (patch: Partial<CampaignAudienceFormData>) => void;
  updatePlacements: (placements: string[]) => void;
  updateBudget: (patch: Partial<CampaignBudgetFormData>) => void;
  addAsset: (asset: SponsorCampaignAsset) => void;
  removeAsset: (assetId: number) => void;
  setAgreementId: (agreementId: number | null) => void;
  startFromAgreement: (
    sponsorAccountId: number,
    agreementId: number,
  ) => void;
  hydrate: (campaignId: number) => Promise<SponsorCampaign>;
  saveDraft: () => Promise<SponsorCampaign>;
  submit: () => Promise<SponsorCampaign>;
  reset: () => void;
};

export const useSponsorCampaignStore = create<SponsorCampaignStore>()((set, get) => ({
  campaignId: null,
  sponsorAccountId: null,
  agreementId: null,
  status: null,
  info: initialInfo,
  audience: initialAudience,
  assets: [],
  placements: [],
  budget: initialBudget,
  saving: false,
  hydrating: false,
  error: null,

  updateInfo: (patch) =>
    set((state) => ({ info: { ...state.info, ...patch } })),

  updateAudience: (patch) =>
    set((state) => ({ audience: { ...state.audience, ...patch } })),

  updatePlacements: (placements) => set({ placements }),

  updateBudget: (patch) =>
    set((state) => ({ budget: { ...state.budget, ...patch } })),

  addAsset: (asset) =>
    set((state) => ({ assets: [...state.assets, asset] })),

  removeAsset: (assetId) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== assetId),
    })),

  setAgreementId: (agreementId) => set({ agreementId }),

  startFromAgreement: (sponsorAccountId, agreementId) =>
    set({
      campaignId: null,
      sponsorAccountId,
      agreementId,
      status: null,
      info: initialInfo,
      audience: initialAudience,
      assets: [],
      placements: [],
      budget: initialBudget,
      saving: false,
      hydrating: false,
      error: null,
    }),

  hydrate: async (campaignId) => {
    set({ hydrating: true, error: null });

    try {
      const response = await getSponsorCampaign(campaignId);
      const campaign = response.data;

      set({
        campaignId: campaign.id,
        sponsorAccountId: campaign.sponsor_account,
        agreementId: campaign.agreement_id,
        status: campaign.status,
        info: {
          campaignName: campaign.name,
          property: campaign.property,
          campaignType: campaign.campaign_type,
          description: campaign.description,
          goals: campaign.goals,
        },
        audience: audienceFromApi(campaign.audience),
        assets: campaign.assets,
        placements: campaign.placement_preferences,
        budget: budgetFromApi(campaign.budget),
        hydrating: false,
      });

      return campaign;
    } catch (err) {
      set({
        hydrating: false,
        error: 'We could not load this campaign. Please try again.',
      });
      throw err;
    }
  },

  saveDraft: async () => {
    const state = get();

    let sponsorAccountId = state.sponsorAccountId;
    if (sponsorAccountId == null) {
      const accountsResponse = await getSponsorAccounts();
      const account = accountsResponse.data.results[0];
      if (!account) {
        set({ error: 'No sponsor account found for this user.' });
        throw new Error('No sponsor account found for this user.');
      }
      sponsorAccountId = account.id;
    }

    const payload: SponsorCampaignDraftPayload = {
      sponsor_account: sponsorAccountId,
      agreement_id: state.agreementId,
      name: state.info.campaignName,
      property: state.info.property,
      campaign_type: state.info.campaignType,
      description: state.info.description,
      goals: state.info.goals,
      audience: {
        sports: state.audience.sports,
        leagues: state.audience.leagues,
        age_groups: state.audience.ageGroups,
        gender: state.audience.gender,
        locations: state.audience.locations,
        fan_interests: state.audience.fanInterests,
      },
      budget: {
        amount: state.budget.amount,
        is_custom_amount: state.budget.isCustom,
        duration: state.budget.duration,
        payment_schedule: state.budget.paymentSchedule,
        starts_at: state.budget.startDate || null,
        ends_at: state.budget.endDate || null,
      },
      placement_preferences: state.placements,
    };

    set({ saving: true, error: null, sponsorAccountId });

    try {
      const response = state.campaignId == null
        ? await createSponsorCampaignDraft(payload)
        : await saveSponsorCampaignDraft(state.campaignId, payload);

      set({
        campaignId: response.data.id,
        status: response.data.status,
        saving: false,
      });

      return response.data;
    } catch (err) {
      set({
        saving: false,
        error: 'We could not save your campaign draft. Please try again.',
      });
      throw err;
    }
  },

  submit: async () => {
    const state = get();

    if (state.campaignId == null) {
      const error = 'Save the campaign as a draft before submitting.';
      set({ error });
      throw new Error(error);
    }

    set({ saving: true, error: null });

    try {
      const response = await submitSponsorCampaign(state.campaignId);
      set({ status: response.data.status, saving: false });
      return response.data;
    } catch (err) {
      set({
        saving: false,
        error: 'We could not submit your campaign. Please try again.',
      });
      throw err;
    }
  },

  reset: () =>
    set({
      campaignId: null,
      sponsorAccountId: null,
      agreementId: null,
      status: null,
      info: initialInfo,
      audience: initialAudience,
      assets: [],
      placements: [],
      budget: initialBudget,
      saving: false,
      hydrating: false,
      error: null,
    }),
}));
