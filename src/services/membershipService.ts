import apiClient from './apiClient.js';

export type BackendClub = {
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
};

export interface BackendMembershipPlan {
  id: number;
  club: number;
  club_name: string;
  name: string;
  description: string;
  tier: string;
  billing_cycle: string;
  price_amount: string;
  currency: string;
  benefits: string[];
  is_active: boolean;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BackendMembershipPlanResponse {
  count: number;
  results: BackendMembershipPlan[];
}

export type MembershipTone = 'purple' | 'orange' | 'blue' | 'green';

export interface MembershipCatalogPlan {
  id: number;
  clubId: number;
  clubName: string;
  clubSlug: string;
  sport: string;
  sportLabel: string;
  name: string;
  tier: string;
  billingCycle: string;
  billingLabel: string;
  priceAmount: number;
  priceLabel: string;
  currency: string;
  logoUrl: string;
  bannerUrl: string;
  description: string;
  benefits: string[];
  popular: boolean;
  tone: MembershipTone;
}

export interface MembershipClubCatalog {
  clubId: number;
  clubName: string;
  clubSlug: string;
  shortName: string;
  sport: string;
  sportLabel: string;
  logoUrl: string;
  bannerUrl: string;
  description: string;
  tierCountLabel: string;
  seasonLabel: string;
  tone: MembershipTone;
  plans: MembershipCatalogPlan[];
}

export const fetchPublicClubs = () =>
  apiClient.get<BackendClub[]>('/dashboards/public/clubs/');

export async function getBackendClubs(): Promise<BackendClub[]> {
  const response = await fetchPublicClubs();
  return response.data;
}

export async function getMembershipPlans(filters?: {
  clubId?: number;
}): Promise<BackendMembershipPlan[]> {
  const params = new URLSearchParams();

  if (filters?.clubId) {
    params.set('club', String(filters.clubId));
  }

  const query = params.toString();
  const response = await apiClient.get<BackendMembershipPlanResponse>(
    `/memberships/plans/${query ? `?${query}` : ''}`,
  );

  return response.data.results;
}

function normaliseSportLabel(club?: BackendClub) {
  const label = club?.sport_display || club?.sport || 'Club';
  const lower = label.toLowerCase();

  if (lower.includes('rugby')) return 'Rugby';
  if (lower.includes('football')) return 'Football';
  if (lower.includes('basketball')) return 'Basketball';

  return label === 'OTHER' ? 'Club' : label;
}

function normaliseSportKey(club?: BackendClub) {
  return normaliseSportLabel(club).toLowerCase();
}

function getToneForSport(sportLabel: string): MembershipTone {
  const lower = sportLabel.toLowerCase();

  if (lower.includes('rugby')) return 'purple';
  if (lower.includes('football')) return 'blue';
  if (lower.includes('basketball')) return 'orange';

  return 'green';
}

function getBillingLabel(value: string) {
  const normalised = value.toUpperCase();

  if (normalised === 'MONTHLY') return 'per month';
  if (normalised === 'QUARTERLY') return 'per quarter';
  if (normalised === 'SEMI_ANNUAL') return 'per half-season';
  if (normalised === 'ANNUAL') return 'per season';

  return value.replaceAll('_', ' ').toLowerCase();
}

export function formatMembershipCurrency(
  amount: number,
  currency = 'UGX',
) {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function isPopularPlan(plan: BackendMembershipPlan) {
  const tier = plan.tier.toUpperCase();
  const name = plan.name.toLowerCase();

  return tier === 'GOLD' || name.includes('gold') || name.includes('courtside');
}

export function buildMembershipCatalog(
  plans: BackendMembershipPlan[],
  clubs: BackendClub[],
): MembershipClubCatalog[] {
  const clubsById = new Map(clubs.map((club) => [club.id, club]));
  const grouped = new Map<number, MembershipCatalogPlan[]>();

  plans.forEach((plan) => {
    const club = clubsById.get(plan.club);
    const sportLabel = normaliseSportLabel(club);
    const tone = getToneForSport(sportLabel);
    const priceAmount = Number(plan.price_amount || 0);
    const benefits = Array.isArray(plan.benefits) ? plan.benefits : [];

    const item: MembershipCatalogPlan = {
      id: plan.id,
      clubId: plan.club,
      clubName: club?.name || plan.club_name,
      clubSlug: club?.slug || String(plan.club),
      sport: normaliseSportKey(club),
      sportLabel,
      name: plan.name,
      tier: plan.tier,
      billingCycle: plan.billing_cycle,
      billingLabel: getBillingLabel(plan.billing_cycle),
      priceAmount,
      priceLabel: formatMembershipCurrency(priceAmount, plan.currency),
      currency: plan.currency,
      logoUrl: club?.logo_url || club?.logo || '',
      bannerUrl: club?.banner_url || club?.banner || '',
      description:
        plan.description ||
        `${plan.name} membership plan for ${club?.name || plan.club_name}.`,
      benefits,
      popular: isPopularPlan(plan),
      tone,
    };

    grouped.set(plan.club, [...(grouped.get(plan.club) || []), item]);
  });

  return Array.from(grouped.entries())
    .map(([clubId, clubPlans]) => {
      const club = clubsById.get(clubId);
      const firstPlan = clubPlans[0];
      const sportLabel = firstPlan?.sportLabel || normaliseSportLabel(club);
      const tone = getToneForSport(sportLabel);
      const clubName = club?.name || firstPlan?.clubName || 'Club';

      return {
        clubId,
        clubName,
        clubSlug: club?.slug || firstPlan?.clubSlug || String(clubId),
        shortName: club?.short_name || clubName,
        sport: normaliseSportKey(club),
        sportLabel,
        logoUrl: club?.logo_url || club?.logo || firstPlan?.logoUrl || '',
        bannerUrl: club?.banner_url || club?.banner || firstPlan?.bannerUrl || '',
        description: `${clubName} has ${clubPlans.length} active membership tier${clubPlans.length === 1 ? '' : 's'} available from the backend.`,
        tierCountLabel: `${clubPlans.length} active tier${clubPlans.length === 1 ? '' : 's'}`,
        seasonLabel: 'Backend membership catalogue',
        tone,
        plans: clubPlans.sort((first, second) => first.priceAmount - second.priceAmount),
      } satisfies MembershipClubCatalog;
    })
    .sort((first, second) => first.clubName.localeCompare(second.clubName));
}

export async function getMembershipCatalog(): Promise<MembershipClubCatalog[]> {
  const [clubs, plans] = await Promise.all([
    getBackendClubs(),
    getMembershipPlans(),
  ]);

  return buildMembershipCatalog(plans, clubs);
}

export async function getMembershipCatalogForClubSlug(
  clubSlug: string,
): Promise<MembershipClubCatalog | null> {
  const catalog = await getMembershipCatalog();

  return catalog.find((club) => club.clubSlug === clubSlug) || null;
}
