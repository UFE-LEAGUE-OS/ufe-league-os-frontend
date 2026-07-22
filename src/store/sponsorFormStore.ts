import { create } from 'zustand';

export type CorporateVerificationDocType = 'incorporation' | 'tin' | 'logo';

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

const initialCorporateDocuments: Record<
  CorporateVerificationDocType,
  File | null
> = {
  incorporation: null,
  tin: null,
  logo: null,
};

type SponsorFormStore = {
  corporate: CorporateSponsorFormData;
  individual: IndividualSponsorFormData;
  // The sponsor account doesn't exist until the Review step calls
  // becomeSponsor(), so verification files can't be uploaded to an
  // account id at the Verification step — they're held here and
  // uploaded once the account id is known.
  corporateDocuments: Record<CorporateVerificationDocType, File | null>;
  updateCorporate: (patch: Partial<CorporateSponsorFormData>) => void;
  updateIndividual: (patch: Partial<IndividualSponsorFormData>) => void;
  updateCorporateDocuments: (
    patch: Partial<Record<CorporateVerificationDocType, File | null>>,
  ) => void;
  resetCorporate: () => void;
  resetIndividual: () => void;
};

export const useSponsorFormStore = create<SponsorFormStore>()((set) => ({
  corporate: initialCorporate,
  individual: initialIndividual,
  corporateDocuments: initialCorporateDocuments,

  updateCorporate: (patch) =>
    set((state) => ({ corporate: { ...state.corporate, ...patch } })),

  updateIndividual: (patch) =>
    set((state) => ({ individual: { ...state.individual, ...patch } })),

  updateCorporateDocuments: (patch) =>
    set((state) => ({
      corporateDocuments: { ...state.corporateDocuments, ...patch },
    })),

  resetCorporate: () =>
    set({
      corporate: initialCorporate,
      corporateDocuments: initialCorporateDocuments,
    }),
  resetIndividual: () => set({ individual: initialIndividual }),
}));