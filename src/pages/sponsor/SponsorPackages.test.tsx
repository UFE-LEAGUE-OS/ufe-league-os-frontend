import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  createSponsorAgreement,
  getSponsorAccounts,
  getSponsorPackage,
  getSponsorPackages,
  type SponsorPackage,
} from '../../services/sponsorshipService';
import SponsorPackageDetail from './SponsorPackageDetail';
import SponsorPackages from './SponsorPackages';

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
      getSponsorPackages: vi.fn(),
      getSponsorPackage: vi.fn(),
      getSponsorAccounts: vi.fn(),
      createSponsorAgreement:
        vi.fn(),
    };
  },
);

const getPackagesMock =
  vi.mocked(getSponsorPackages);
const getPackageMock =
  vi.mocked(getSponsorPackage);
const getAccountsMock =
  vi.mocked(getSponsorAccounts);
const createAgreementMock =
  vi.mocked(createSponsorAgreement);

const digitalPackage = {
  id: 1,
  name: 'Digital Visibility Partner',
  description:
    'Measurable League OS placements.',
  is_template: true,
  objective: 'VISIBILITY',
  objective_display:
    'Brand Visibility',
  duration_type: 'MONTHLY',
  duration_type_display:
    'Monthly',
  sport: 'GENERAL',
  sport_display: 'All Sports',
  owner_type: 'PLATFORM',
  owner_type_display: 'Platform',
  owner_identifier:
    'league-os-marketplace',
  owner_name:
    'League OS Marketplace',
  scope_type: 'PLATFORM',
  scope_type_display:
    'Platform',
  scope_identifier:
    'choose-property',
  scope_name:
    'Choose a sports property',
  sponsor_type_allowed: 'BOTH',
  sponsor_type_allowed_display:
    'Both',
  category: 'GENERAL',
  category_display: 'General',
  price_amount: '3000000.00',
  currency: 'UGX',
  is_exclusive: false,
  requires_platform_fee: false,
  platform_fee_amount: '0.00',
  activation_rule:
    'AFTER_FIRST_PAYMENT',
  activation_rule_display:
    'After First Payment',
  status: 'ACTIVE',
  status_display: 'Active',
  created_by: null,
  approved_by: null,
  approved_at: null,
  benefits: [
    {
      id: 1,
      sponsor_package: 1,
      benefit_type:
        'HOMEPAGE_AD',
      benefit_type_display:
        'Homepage Advert',
      name: 'League OS placement',
      description:
        'League OS placement',
      quantity: 1,
      discount_percentage:
        '0.00',
      value_amount: '0.00',
      requires_payment_confirmation:
        true,
      is_platform_controlled:
        true,
      created_at:
        '2026-07-14T10:00:00Z',
    },
  ],
  opportunities: [
    {
      id: 11,
      sponsor_package: 1,
      property_type:
        'PLATFORM',
      property_type_display:
        'Platform',
      property_identifier:
        'league-os-digital',
      property_name:
        'League OS Digital Network',
      sport: 'GENERAL',
      sport_display:
        'All Sports',
      location: 'Online',
      price_amount:
        '3500000.00',
      currency: 'UGX',
      starts_at: null,
      ends_at: null,
      status: 'AVAILABLE',
      status_display:
        'Available',
      created_at:
        '2026-07-14T10:00:00Z',
      updated_at:
        '2026-07-14T10:00:00Z',
    },
  ],
  revenue_share_rules: [],
  created_at:
    '2026-07-14T10:00:00Z',
  updated_at:
    '2026-07-14T10:00:00Z',
} as SponsorPackage;

const hospitalityPackage = {
  ...digitalPackage,
  id: 2,
  name: 'VIP Matchday Suite',
  objective: 'HOSPITALITY',
  objective_display: 'Hospitality',
} as SponsorPackage;

describe('Sponsor marketplace', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getPackagesMock.mockResolvedValue(
      {
        data: {
          count: 1,
          results: [
            digitalPackage,
          ],
        },
      } as never,
    );

    getPackageMock.mockResolvedValue(
      {
        data: digitalPackage,
      } as never,
    );

    getAccountsMock.mockResolvedValue(
      {
        data: {
          count: 1,
          results: [
            {
              id: 100,
              sponsor_type:
                'CORPORATE',
              sponsor_type_display:
                'Corporate',
              name: 'Orbimaps Limited',
              registration_country:
                'UG',
              status: 'APPROVED',
              status_display:
                'Approved',
              member_count: 1,
              owner: {
                id: 1,
                email:
                  'sponsor@example.com',
              },
            },
          ],
        },
      } as never,
    );
  });

  it(
    'loads neutral package templates',
    async () => {
      render(
        <MemoryRouter>
          <SponsorPackages />
        </MemoryRouter>,
      );

      expect(
        await screen.findByRole(
          'heading',
          {
            name: /digital visibility partner/i,
          },
        ),
      ).toBeInTheDocument();

      expect(
        getPackagesMock,
      ).toHaveBeenCalledWith({
        is_template: true,
      });

      expect(
        screen.queryByText(
          /league os marketplace/i,
        ),
      ).not.toBeInTheDocument();
    },
  );

  it(
    'pre-filters by objective from the URL (e.g. linked from the sponsorship hub)',
    async () => {
      getPackagesMock.mockResolvedValue(
        {
          data: {
            count: 2,
            results: [
              digitalPackage,
              hospitalityPackage,
            ],
          },
        } as never,
      );

      render(
        <MemoryRouter
          initialEntries={[
            '/sponsor/packages?objective=HOSPITALITY',
          ]}
        >
          <SponsorPackages />
        </MemoryRouter>,
      );

      expect(
        await screen.findByRole(
          'heading',
          {
            name: /vip matchday suite/i,
          },
        ),
      ).toBeInTheDocument();

      expect(
        screen.queryByRole(
          'heading',
          {
            name: /digital visibility partner/i,
          },
        ),
      ).not.toBeInTheDocument();
    },
  );

  it(
    'shows available sports properties on package detail',
    async () => {
      render(
        <MemoryRouter
          initialEntries={[
            '/sponsor/packages/1',
          ]}
        >
          <Routes>
            <Route
              path="/sponsor/packages/:packageId"
              element={
                <SponsorPackageDetail />
              }
            />
          </Routes>
        </MemoryRouter>,
      );

      expect(
        await screen.findByText(
          /league os digital network/i,
        ),
      ).toBeInTheDocument();
    },
  );

  it(
    'submits a property-linked sponsorship request',
    async () => {
      createAgreementMock.mockResolvedValue(
        {
          data: {
            message:
              'Agreement created.',
            agreement: {
              id: 501,
              reference:
                'LOS-SPONSOR-501',
              status:
                'SUBMITTED',
              status_display:
                'Submitted',
            },
          },
        } as never,
      );

      render(
        <MemoryRouter
          initialEntries={[
            '/sponsor/packages/1',
          ]}
        >
          <Routes>
            <Route
              path="/sponsor/packages/:packageId"
              element={
                <SponsorPackageDetail />
              }
            />
          </Routes>
        </MemoryRouter>,
      );

      fireEvent.click(
        await screen.findByRole(
          'button',
          {
            name: /submit sponsorship request/i,
          },
        ),
      );

      await waitFor(() => {
        expect(
          createAgreementMock,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            sponsor_account: 100,
            sponsor_package: 1,
            opportunity: 11,
            payment_source:
              'PLATFORM',
          }),
        );
      });

      expect(
        await screen.findByRole(
          'heading',
          {
            name: /request submitted/i,
          },
        ),
      ).toBeInTheDocument();
    },
  );
});
