import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  MemoryRouter,
} from 'react-router-dom';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  getSponsorAccounts,
  getSponsorAgreements,
  initializeSponsorFlutterwavePayment,
  type SponsorAccountResponse,
  type SponsorAgreement,
  type SponsorPayment,
} from '../../services/sponsorshipService';
import {
  redirectToExternalUrl,
} from '../../utils/externalNavigation';
import SponsorPayments from './SponsorPayments';

vi.mock(
  '../../components/SponsorSidebar',
  () => ({
    default: () => (
      <aside>Sponsor Sidebar</aside>
    ),
  }),
);

vi.mock(
  '../../services/sponsorshipService',
  async () => {
    const actual = await vi.importActual<
      typeof import('../../services/sponsorshipService')
    >(
      '../../services/sponsorshipService',
    );

    return {
      ...actual,
      getSponsorAccounts: vi.fn(),
      getSponsorAgreements:
        vi.fn(),
      initializeSponsorFlutterwavePayment:
        vi.fn(),
    };
  },
);

vi.mock(
  '../../utils/externalNavigation',
  () => ({
    redirectToExternalUrl:
      vi.fn(),
  }),
);

const getSponsorAccountsMock =
  vi.mocked(getSponsorAccounts);
const getSponsorAgreementsMock =
  vi.mocked(getSponsorAgreements);
const initializePaymentMock =
  vi.mocked(
    initializeSponsorFlutterwavePayment,
  );
const redirectMock = vi.mocked(
  redirectToExternalUrl,
);

const account = {
  id: 101,
  sponsor_type: 'CORPORATE',
  sponsor_type_display:
    'Corporate',
  name: 'Orbimaps Limited',
  registration_country: 'UG',
  status: 'APPROVED',
  status_display: 'Approved',
  member_count: 2,
  owner: {
    id: 1,
    email:
      'orbimaps.sponsor.demo@leagueos.local',
  },
} as SponsorAccountResponse;

const agreement = {
  id: 201,
  sponsor_account: 101,
  sponsor_account_detail:
    account,
  sponsor_package: 301,
  sponsor_package_detail: {
    id: 301,
    name: 'KOBS Digital Partner',
    owner_name:
      'KOBS Rugby Club',
  },
  reference:
    'DEMO-SP-ORBIMAPS-KOBS-2026',
  payment_source: 'PLATFORM',
  payment_source_display:
    'Platform',
  payment_model: 'ONE_TIME',
  payment_model_display:
    'One Time',
  total_value: '8000000.00',
  currency: 'UGX',
  starts_at:
    '2026-07-01T00:00:00Z',
  ends_at:
    '2027-06-30T00:00:00Z',
  status: 'APPROVED',
  status_display: 'Approved',
  benefits_tier: 'DIGITAL',
  benefits_tier_display:
    'Digital',
  payment_schedules: [
    {
      id: 401,
      agreement: 201,
      schedule_type:
        'ONE_TIME',
      schedule_type_display:
        'One Time',
      sequence_number: 1,
      due_date: '2026-07-30',
      period_start: null,
      period_end: null,
      amount_due: '8000000.00',
      currency: 'UGX',
      status: 'PENDING',
      status_display: 'Pending',
      created_at:
        '2026-07-14T10:00:00Z',
      updated_at:
        '2026-07-14T10:00:00Z',
    },
  ],
  payments: [],
  revenue_share_rules: [],
  revenue_distributions: [],
  workflow_events: [],
  signed_at: '2026-07-14T10:00:00Z',
  created_at:
    '2026-07-14T10:00:00Z',
  updated_at:
    '2026-07-14T10:00:00Z',
} as SponsorAgreement;

function mockPageData(
  agreements = [agreement],
) {
  getSponsorAccountsMock.mockResolvedValue(
    {
      data: {
        count: 1,
        results: [account],
      },
    } as never,
  );

  getSponsorAgreementsMock.mockResolvedValue(
    {
      data: {
        count:
          agreements.length,
        results: agreements,
      },
    } as never,
  );
}

function renderPage() {
  return render(
    <MemoryRouter
      initialEntries={[
        '/sponsor/payments',
      ]}
    >
      <SponsorPayments />
    </MemoryRouter>,
  );
}

describe('SponsorPayments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it(
    'loads sponsor agreements, schedules and payment totals',
    async () => {
      mockPageData();

      renderPage();

      expect(
        await screen.findByRole(
          'heading',
          {
            name: /kobs digital partner/i,
          },
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          /demo-sp-orbimaps-kobs-2026/i,
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          /payment 1/i,
        ),
      ).toBeInTheDocument();

      expect(
        getSponsorAgreementsMock,
      ).toHaveBeenCalledWith({
        sponsor_account: 101,
      });
    },
  );

  it(
    'initializes Flutterwave and stores the pending checkout',
    async () => {
      mockPageData();

      const payment = {
        id: 501,
        agreement: 201,
        payment_schedule: 401,
        amount_paid:
          '8000000.00',
        currency: 'UGX',
        payment_method:
          'FLUTTERWAVE',
        payment_method_display:
          'Flutterwave',
        transaction_reference:
          'LOS-SPONSOR-201-TEST',
        provider:
          'FLUTTERWAVE',
        checkout_url:
          'https://checkout.flutterwave.com/test',
        status: 'PENDING',
        status_display:
          'Pending',
        created_at:
          '2026-07-14T10:00:00Z',
      } as SponsorPayment;

      initializePaymentMock.mockResolvedValue(
        {
          data: {
            message:
              'Flutterwave payment initialized successfully.',
            checkout_url:
              payment.checkout_url,
            tx_ref:
              payment.transaction_reference,
            payment,
          },
        } as never,
      );

      renderPage();

      fireEvent.click(
        await screen.findByRole(
          'button',
          {
            name: /pay with flutterwave/i,
          },
        ),
      );

      await waitFor(() => {
        expect(
          initializePaymentMock,
        ).toHaveBeenCalledWith(
          201,
          {
            payment_schedule: 401,
            amount_paid:
              '8000000.00',
          },
        );
      });

      expect(
        redirectMock,
      ).toHaveBeenCalledWith(
        payment.checkout_url,
      );

      expect(
        localStorage.getItem(
          'league_os_pending_sponsor_checkout',
        ),
      ).toContain(
        'LOS-SPONSOR-201-TEST',
      );
    },
  );

  it(
    'routes to the agreement sign page instead of Flutterwave when unsigned',
    async () => {
      mockPageData([
        { ...agreement, signed_at: null },
      ]);

      renderPage();

      expect(
        await screen.findByRole(
          'button',
          {
            name: /review & sign agreement/i,
          },
        ),
      ).toBeInTheDocument();

      expect(
        screen.queryByRole(
          'button',
          {
            name: /pay with flutterwave/i,
          },
        ),
      ).not.toBeInTheDocument();

      expect(
        initializePaymentMock,
      ).not.toHaveBeenCalled();
    },
  );

  it(
    'shows an empty agreement state',
    async () => {
      mockPageData([]);

      renderPage();

      expect(
        await screen.findByRole(
          'heading',
          {
            name: /no agreements found/i,
          },
        ),
      ).toBeInTheDocument();
    },
  );
});
