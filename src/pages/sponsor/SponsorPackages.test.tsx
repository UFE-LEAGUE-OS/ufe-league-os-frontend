import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
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
import SponsorPackages from './SponsorPackages';
import SponsorPackageDetail from './SponsorPackageDetail';
import {
  createSponsorAgreement,
  getSponsorAccounts,
  getSponsorPackage,
  getSponsorPackages,
  type SponsorAccountResponse,
  type SponsorAgreement,
  type SponsorPackage,
} from '../../services/sponsorshipService';

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
      getSponsorPackages: vi.fn(),
      getSponsorPackage: vi.fn(),
      getSponsorAccounts: vi.fn(),
      createSponsorAgreement: vi.fn(),
    };
  },
);

const packageFixture = {
  id: 31,
  name: 'KOBS Digital Partner',
  description:
    'Support KOBS while receiving digital visibility.',
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
  is_exclusive: true,
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
  benefits: [
    {
      id: 91,
      sponsor_package: 31,
      benefit_type:
        'LOGO_PLACEMENT',
      benefit_type_display:
        'Logo Placement',
      name: 'Digital logo placement',
      description:
        'Logo placement across club pages.',
      quantity: 1,
      discount_percentage: '0.00',
      value_amount: '0.00',
      requires_payment_confirmation:
        true,
      is_platform_controlled: true,
      created_at:
        '2026-07-14T10:00:00Z',
    },
  ],
  revenue_share_rules: [],
  created_at:
    '2026-07-14T10:00:00Z',
  updated_at:
    '2026-07-14T10:00:00Z',
} satisfies SponsorPackage;

const accountFixture = {
  id: 12,
  sponsor_type: 'CORPORATE',
  sponsor_type_display:
    'Corporate',
  name: 'Orbimaps Limited',
  registration_country: 'UG',
  brn: 'BRN-123',
  tin: '1234567890',
  status: 'APPROVED',
  status_display: 'Approved',
  member_count: 1,
  owner: {
    id: 7,
    email: 'keith@example.com',
    full_name: 'Keith Seruyange',
  },
} satisfies SponsorAccountResponse;

const agreementFixture = {
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
  starts_at: null,
  ends_at: null,
  status: 'DRAFT',
  status_display: 'Draft',
  platform_fee_required: false,
  platform_fee_amount: '0.00',
  platform_fee_status:
    'NOT_REQUIRED',
  platform_fee_status_display:
    'Not Required',
  platform_activation_allowed:
    false,
  benefits_tier: 'DIGITAL',
  benefits_tier_display: 'Digital',
  activation_rule:
    'ADMIN_APPROVAL',
  activation_rule_display:
    'Admin Approval',
  waiver_status: '',
  waiver_reason: '',
  waived_by: null,
  waived_at: null,
  created_by: 7,
  approved_by: null,
  approved_at: null,
  proof_reference: '',
  notes: '',
  payment_schedules: [],
  payments: [],
  revenue_share_rules: [],
  revenue_distributions: [],
  workflow_events: [],
  created_at:
    '2026-07-14T10:00:00Z',
  updated_at:
    '2026-07-14T10:00:00Z',
} satisfies SponsorAgreement;

describe('SponsorPackages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    'loads sponsorship packages from the API',
    async () => {
      vi.mocked(
        getSponsorPackages,
      ).mockResolvedValue({
        data: {
          count: 1,
          results: [
            packageFixture,
          ],
        },
      } as never);

      render(
        <MemoryRouter>
          <SponsorPackages />
        </MemoryRouter>,
      );

      expect(
        await screen.findByText(
          'KOBS Digital Partner',
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'Digital logo placement',
        ),
      ).toBeInTheDocument();

      expect(
        getSponsorPackages,
      ).toHaveBeenCalledTimes(1);
    },
  );

  it(
    'creates an agreement from a real package and sponsor account',
    async () => {
      vi.mocked(
        getSponsorPackage,
      ).mockResolvedValue({
        data: packageFixture,
      } as never);

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
        createSponsorAgreement,
      ).mockResolvedValue({
        data: {
          message:
            'Agreement created.',
          agreement:
            agreementFixture,
        },
      } as never);

      render(
        <MemoryRouter
          initialEntries={[
            '/sponsor/packages/31',
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
          'KOBS Digital Partner',
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          'option',
          {
            name:
              'Orbimaps Limited — Approved',
          },
        ),
      ).toBeInTheDocument();

      fireEvent.click(
        screen.getByRole(
          'button',
          {
            name:
              'Start Sponsorship',
          },
        ),
      );

      await waitFor(() => {
        expect(
          createSponsorAgreement,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            sponsor_account: 12,
            sponsor_package: 31,
            payment_source:
              'PLATFORM',
            payment_model:
              'ONE_TIME',
          }),
        );
      });

      expect(
        await screen.findByText(
          'Agreement Created',
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'SP-2026-0044',
        ),
      ).toBeInTheDocument();
    },
  );
});
