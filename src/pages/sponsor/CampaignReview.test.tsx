import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  saveSponsorCampaignDraft,
  submitSponsorCampaign,
} from '../../services/sponsorCampaignService';
import { getSponsorAccounts } from '../../services/sponsorshipService';
import { useSponsorCampaignStore } from '../../store/sponsorCampaignStore';
import CampaignReview from './CampaignReview';

vi.mock(
  '../../components/SponsorSidebar',
  () => ({
    default: () => <aside>Sponsor Sidebar</aside>,
  }),
);

vi.mock(
  '../../services/sponsorCampaignService',
  async () => {
    const actual = await vi.importActual<
      typeof import('../../services/sponsorCampaignService')
    >('../../services/sponsorCampaignService');

    return {
      ...actual,
      saveSponsorCampaignDraft: vi.fn(),
      createSponsorCampaignDraft: vi.fn(),
      submitSponsorCampaign: vi.fn(),
    };
  },
);

vi.mock(
  '../../services/sponsorshipService',
  async () => {
    const actual = await vi.importActual<
      typeof import('../../services/sponsorshipService')
    >('../../services/sponsorshipService');

    return {
      ...actual,
      getSponsorAccounts: vi.fn(),
    };
  },
);

const completeState = {
  campaignId: 1,
  sponsorAccountId: 7,
  status: 'DRAFT' as const,
  info: {
    campaignName: 'Nile Special Brand Awareness',
    property: 'Nile Special Rugby Premiership',
    campaignType: 'Brand Awareness',
    description: 'A test campaign.',
    goals: ['brand-awareness'],
  },
  audience: {
    sports: ['Rugby'],
    leagues: ['Nile Special Rugby Premiership'],
    ageGroups: ['18-24'],
    gender: 'All Genders',
    locations: ['All Uganda'],
    fanInterests: [],
  },
  assets: [
    {
      id: 1,
      file_name: 'banner.png',
      file_url: 'https://cdn.example.com/banner.png',
      file_type: 'image/png',
      size_bytes: 1024,
      placement: '',
      tags: [],
      approval_status: 'pending' as const,
      rejection_reason: null,
      uploaded_at: '2026-07-20T00:00:00Z',
    },
  ],
  placements: ['Landing Page Hero'],
  budget: {
    presetId: 'premium',
    isCustom: false,
    amount: '50,000,000',
    duration: '1year',
    paymentSchedule: 'upfront',
    startDate: '2026-08-01',
    endDate: '2027-07-31',
  },
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/sponsor/campaigns/new/review']}>
      <CampaignReview />
    </MemoryRouter>,
  );
}

describe('CampaignReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSponsorCampaignStore.getState().reset();
  });

  it('blocks submission when required sections are incomplete', async () => {
    renderPage();

    fireEvent.click(screen.getByText('Submit Campaign'));

    await waitFor(() => {
      expect(
        screen.getByText(/complete all required sections/i),
      ).toBeInTheDocument();
    });

    expect(submitSponsorCampaign).not.toHaveBeenCalled();
  });

  it('submits once all sections are complete and the declaration is checked', async () => {
    useSponsorCampaignStore.setState(completeState);

    vi.mocked(getSponsorAccounts).mockResolvedValue({
      data: { count: 1, results: [{ id: 7 }] },
    } as never);
    vi.mocked(saveSponsorCampaignDraft).mockResolvedValue({
      data: { id: 1, status: 'DRAFT' },
    } as never);
    vi.mocked(submitSponsorCampaign).mockResolvedValue({
      data: { id: 1, status: 'SUBMITTED', reference: 'CAM-2026-00001' },
    } as never);

    renderPage();

    fireEvent.click(screen.getByLabelText(/i confirm that all campaign information/i));
    fireEvent.click(screen.getByText('Submit Campaign'));

    await waitFor(() => {
      expect(submitSponsorCampaign).toHaveBeenCalledWith(1);
    });
  });
});
