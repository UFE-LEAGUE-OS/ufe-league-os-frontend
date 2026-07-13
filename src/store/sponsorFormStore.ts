import { create } from 'zustand';

export type CorporateSponsorFormData = {
  companyName: string;
  companyEmail: string;
  phone: string;
  altPhone: string;
  country: string;
  city: string;
  industry: string;
  website: string;
  brn: string;
  tin: string;
  contactTitle: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  contactRole: string;
  contactLinkedin: string;
  contactIsPrimary: boolean;
};

export type IndividualSponsorFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  reason: string;
  selectedSports: string[];
  preferredBudget: string;
  sponsorshipTypes: string[];
  goals: string[];
  duration: string;
};

const initialCorporate: CorporateSponsorFormData = {
  companyName: '',
  companyEmail: '',
  phone: '',
  altPhone: '',
  country: 'Uganda',
  city: '',
  industry: '',
  website: '',
  brn: '',
  tin: '',
  contactTitle: '',
  contactFirstName: '',
  contactLastName: '',
  contactEmail: '',
  contactPhone: '',
  contactRole: '',
  contactLinkedin: '',
  contactIsPrimary: true,
};

const initialIndividual: IndividualSponsorFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: 'Uganda',
  city: '',
  reason: '',
  selectedSports: [],
  preferredBudget: '',
  sponsorshipTypes: [],
  goals: [],
  duration: '',
};

type SponsorFormStore = {
  corporate: CorporateSponsorFormData;
  individual: IndividualSponsorFormData;
  updateCorporate: (patch: Partial<CorporateSponsorFormData>) => void;
  updateIndividual: (patch: Partial<IndividualSponsorFormData>) => void;
  resetCorporate: () => void;
  resetIndividual: () => void;
};

export const useSponsorFormStore = create<SponsorFormStore>()((set) => ({
  corporate: initialCorporate,
  individual: initialIndividual,

  updateCorporate: (patch) =>
    set((state) => ({ corporate: { ...state.corporate, ...patch } })),

  updateIndividual: (patch) =>
    set((state) => ({ individual: { ...state.individual, ...patch } })),

  resetCorporate: () => set({ corporate: initialCorporate }),
  resetIndividual: () => set({ individual: initialIndividual }),
}));