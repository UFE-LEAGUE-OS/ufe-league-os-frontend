export interface CampaignPlacementOption {
  id: string;
  desc: string;
}

export const placementOptions: CampaignPlacementOption[] = [
  { id: 'Landing Page Hero', desc: 'Homepage hero banner' },
  { id: 'Fixtures Page Card', desc: 'Sponsored fixture highlight' },
  { id: 'Team Profile Banner', desc: 'Partner banner on team pages' },
  { id: 'Match Center Branding', desc: 'In-game branding & overlays' },
  { id: 'Membership Section', desc: 'Sponsor tile in membership' },
  { id: 'Ticketing Flow Branding', desc: 'Branding in ticket purchase flow' },
];
