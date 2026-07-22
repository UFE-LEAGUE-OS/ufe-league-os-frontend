import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CorporateSponsorDashboard from './CorporateSponsorDashboard';
import {
  getSponsorAccounts,
  getSponsorAgreements,
  type SponsorAccountResponse,
  type SponsorAgreement,
  type SponsorPackage,
} from '../../services/sponsorshipService';
import { getSponsorCampaigns } from '../../services/sponsorCampaignService';

vi.mock(
  '../../components/SponsorSidebar',
  () => ({
    default: () => (
      <aside data-testid="sponsor-sidebar" />
    ),
  }),
);

vi.mock(
  '../../services/sponsorshipService',
  async () => {
    const actual = await vi.importActual<
      typeof import(
        '../../services/sponsorshipService'
      )
    >(
      '../../services/sponsorshipService',
    );

    return {
      ...actual,
      getSponsorAccounts: vi.fn(),
      getSponsorAgreements: vi.fn(),
    };
  },
);

vi.mock(
  '../../services/sponsorCampaignService',
  async () => {
    const actual = await vi.importActual<
      typeof import(
        '../../services/sponsorCampaignService'
      )
    >(
      '../../services/sponsorCampaignService',
    );

    return {
      ...actual,
      getSponsorCampaigns: vi.fn(),
    };
  },
);

const accountFixture = {
  id: 12,
  sponsor_type: 'CORPORATE',
  sponsor_type_display:
    'Corporate',
  name: 'Orbimaps Limited',
  registration_country: 'UG',
  brn: 'BRN-123',
  tin: '1000000000',
  status: 'APPROVED',
  status_display: 'Approved',
  member_count: 3,
  owner: {
    id: 7,
    email: 'keith@example.com',
    full_name: 'Keith Seruyange',
  },
} satisfies SponsorAccountResponse;

const packageFixture = {
  id: 31,
  name: 'KOBS Digital Partner',
  description:
    'Support KOBS Rugby Club.',
  owner_type: 'CLUB',
  owner_type_display: 'Club',
  owner_identifier: 'kobs',
  owner_name: 'KOBS Rugby Club',
  scope_type: 'CLUB',
  scope_type_display: 'Club',
  scope_identifier: 'kobs',
  scope_name: 'KOBS Rugby Club',
  sponsor_type_allowed: 'BOTH',
  sponsor_type_allowed_display: 'Both',
  category: 'GENERAL',
  category_display: 'General',
  price_amount: '5000000.00',
  currency: 'UGX',
  is_exclusive: false,
  requires_platform_fee: false,
  platform_fee_amount: '0.00',
  activation_rule:
    'AFTER_ADMIN_APPROVAL',
  activation_rule_display:
    'After Admin Approval',
  status: 'ACTIVE',
  status_display: 'Active',
  created_by: null,
  approved_by: null,
  approved_at: null,
  benefits: [],
  revenue_share_rules: [],
  created_at:
    '2026-07-14T10:00:00Z',
  updated_at:
    '2026-07-14T10:00:00Z',
} as SponsorPackage;

const activeAgreement = {
  id: 44,
  sponsor_account: 12,
  sponsor_account_detail:
    accountFixture,
  sponsor_package: 31,
  sponsor_package_detail:
    packageFixture,
  reference: 'SP-2026-0044',
  agreement_type: 'CASH',
  agreement_type_display: 'Cash',
  payment_source: 'PLATFORM',
  payment_source_display:
    'Paid Through Platform',
  payment_model: 'ONE_TIME',
  payment_model_display:
    'One-time',
  total_value: '5000000.00',
  currency: 'UGX',
  starts_at: '2026-07-01',
  ends_at: '2027-06-30',
  status: 'ACTIVE',
  status_display: 'Active',
  payments: [
    {
      id: 71,
      agreement: 44,
      payment_schedule: null,
      amount_paid: '2000000.00',
      currency: 'UGX',
      payment_method: 'FLUTTERWAVE',
      payment_method_display:
        'Flutterwave',
      transaction_reference:
        'SPONSOR-44-71',
      provider: 'FLUTTERWAVE',
      provider_transaction_id:
        'FW-71',
      provider_status:
        'successful',
      checkout_url: '',
      checkout_initialized_at:
        null,
      paid_at:
        '2026-07-14T10:00:00Z',
      status: 'CONFIRMED',
      status_display: 'Confirmed',
      proof_url: '',
      notes: '',
      recorded_by: null,
      confirmed_by: null,
      confirmed_at:
        '2026-07-14T10:00:00Z',
      revenue_distributions: [],
      created_at:
        '2026-07-14T10:00:00Z',
    },
  ],
  payment_schedules: [],
  revenue_share_rules: [],
  revenue_distributions: [],
  workflow_events: [],
  created_at:
    '2026-07-01T10:00:00Z',
  updated_at:
    '2026-07-14T10:00:00Z',
} as SponsorAgreement;

const pendingAgreement = {
  ...activeAgreement,
  id: 45,
  reference: 'SP-2026-0045',
  total_value: '3000000.00',
  status: 'SUBMITTED',
  status_display: 'Submitted',
  payments: [],
} as SponsorAgreement;

const activeCampaign = {
  id: 901,
  sponsor_account: 12,
  agreement_id: 44,
  name: 'Matchday Activation',
  status: 'ACTIVE',
} as never;

const draftCampaign = {
  id: 902,
  sponsor_account: 12,
  agreement_id: null,
  name: 'Untitled Campaign',
  status: 'DRAFT',
} as never;

describe(
  'CorporateSponsorDashboard',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(getSponsorCampaigns).mockResolvedValue({
        data: { count: 0, results: [] },
      } as never);
    });

    it(
      'loads real sponsor account and agreement totals',
      async () => {
        vi.mocked(
          getSponsorAccounts,
        ).mockResolvedValue({
          data: {
            count: 1,
            results: [
              accountFixture,
            ],
          },
        } as never);

        vi.mocked(
          getSponsorAgreements,
        ).mockResolvedValue({
          data: {
            count: 2,
            results: [
              activeAgreement,
              pendingAgreement,
            ],
          },
        } as never);

        render(
          <MemoryRouter
            initialEntries={[
              '/sponsor/dashboard?agreement=44',
            ]}
          >
            <CorporateSponsorDashboard />
          </MemoryRouter>,
        );

        expect(
          await screen.findByText(
            'Orbimaps Limited',
          ),
        ).toBeInTheDocument();

        await waitFor(() => {
          expect(
            getSponsorAgreements,
          ).toHaveBeenCalledWith({
            sponsor_account: 12,
          });
        });

        expect(
          screen.getByText(
            'Active Sponsorships',
          ).parentElement,
        ).toHaveTextContent('1');

        expect(
          screen.getByText(
            'Pending Actions',
          ).parentElement,
        ).toHaveTextContent('1');

        expect(
          screen.getByText(
            'Committed Value',
          ).parentElement,
        ).toHaveTextContent(
          'UGX 8,000,000',
        );

        expect(
          screen.getByText(
            'Confirmed Payments',
          ).parentElement,
        ).toHaveTextContent(
          'UGX 2,000,000',
        );

        expect(
          screen.getAllByText(
            'KOBS Digital Partner',
          ).length,
        ).toBeGreaterThan(0);
      },
    );

    it(
      'shows the active campaign count from real campaign data',
      async () => {
        vi.mocked(
          getSponsorAccounts,
        ).mockResolvedValue({
          data: {
            count: 1,
            results: [
              accountFixture,
            ],
          },
        } as never);

        vi.mocked(
          getSponsorAgreements,
        ).mockResolvedValue({
          data: {
            count: 1,
            results: [
              activeAgreement,
            ],
          },
        } as never);

        vi.mocked(
          getSponsorCampaigns,
        ).mockResolvedValue({
          data: {
            count: 2,
            results: [
              activeCampaign,
              draftCampaign,
            ],
          },
        } as never);

        render(
          <MemoryRouter>
            <CorporateSponsorDashboard />
          </MemoryRouter>,
        );

        expect(
          await screen.findByText(
            'Orbimaps Limited',
          ),
        ).toBeInTheDocument();

        await waitFor(() => {
          expect(
            getSponsorCampaigns,
          ).toHaveBeenCalledWith({
            sponsor_account: 12,
          });
        });

        await waitFor(() => {
          expect(
            screen.getByText(
              'Active Campaigns',
            ).parentElement,
          ).toHaveTextContent('1');
        });

        expect(
          screen.getByText(
            'Active Campaigns',
          ).parentElement,
        ).toHaveTextContent(
          '2 campaigns total',
        );
      },
    );

    it(
      'shows sponsor onboarding when the user has no sponsor accounts',
      async () => {
        vi.mocked(
          getSponsorAccounts,
        ).mockResolvedValue({
          data: {
            count: 0,
            results: [],
          },
        } as never);

        render(
          <MemoryRouter>
            <CorporateSponsorDashboard />
          </MemoryRouter>,
        );

        expect(
          await screen.findByText(
            'No sponsor account yet',
          ),
        ).toBeInTheDocument();

        expect(
          getSponsorAgreements,
        ).not.toHaveBeenCalled();
      },
    );
  },
);
