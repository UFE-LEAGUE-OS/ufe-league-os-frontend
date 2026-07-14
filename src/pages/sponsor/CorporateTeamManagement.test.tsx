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
  addSponsorAccountMember,
  getSponsorAccountMembers,
  getSponsorAccounts,
  type SponsorAccountMember,
  type SponsorAccountResponse,
} from '../../services/sponsorshipService';
import { useAuthStore } from '../../store/authStore';
import CorporateTeamManagement from './CorporateTeamManagement';

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
      getSponsorAccountMembers:
        vi.fn(),
      addSponsorAccountMember:
        vi.fn(),
    };
  },
);

const getSponsorAccountsMock =
  vi.mocked(getSponsorAccounts);
const getSponsorAccountMembersMock =
  vi.mocked(
    getSponsorAccountMembers,
  );
const addSponsorAccountMemberMock =
  vi.mocked(addSponsorAccountMember);

const corporateAccount = {
  id: 101,
  sponsor_type: 'CORPORATE',
  sponsor_type_display: 'Corporate',
  name: 'Orbimaps Limited',
  registration_country: 'UG',
  brn: 'DEMO-ORBIMAPS-BRN-2026',
  tin: 'DEMO-ORBIMAPS-TIN-2026',
  status: 'APPROVED',
  status_display: 'Approved',
  member_count: 2,
  owner: {
    id: 1,
    email:
      'orbimaps.sponsor.demo@leagueos.local',
    full_name: 'Orbimaps Sponsor',
    is_sponsor: true,
    sponsor_type: 'CORPORATE',
  },
  created_at:
    '2026-07-14T10:00:00Z',
  updated_at:
    '2026-07-14T10:00:00Z',
} satisfies SponsorAccountResponse;

const individualAccount = {
  ...corporateAccount,
  id: 202,
  sponsor_type: 'INDIVIDUAL',
  sponsor_type_display: 'Individual',
  name: 'Keith Individual Sponsor',
  brn: null,
  tin: null,
  owner: {
    id: 20,
    email:
      'keith.sponsor.demo@leagueos.local',
    full_name: 'Keith Sponsor',
    is_sponsor: true,
    sponsor_type: 'INDIVIDUAL',
  },
} satisfies SponsorAccountResponse;

const ownerMember = {
  id: 1001,
  user: {
    id: 1,
    email:
      'orbimaps.sponsor.demo@leagueos.local',
    full_name: 'Orbimaps Sponsor',
    is_sponsor: true,
    sponsor_type: 'CORPORATE',
  },
  member_role: 'OWNER',
  member_role_display: 'Owner',
  is_active: true,
  created_at:
    '2026-07-14T10:00:00Z',
} satisfies SponsorAccountMember;

const financeMember = {
  id: 1002,
  user: {
    id: 2,
    email:
      'orbimaps.finance.demo@leagueos.local',
    full_name: 'Orbimaps Finance',
    is_sponsor: true,
    sponsor_type: 'CORPORATE',
  },
  member_role: 'FINANCE',
  member_role_display: 'Finance',
  is_active: true,
  created_at:
    '2026-07-14T10:00:00Z',
} satisfies SponsorAccountMember;

function renderPage() {
  return render(
    <MemoryRouter
      initialEntries={['/sponsor/team']}
    >
      <CorporateTeamManagement />
    </MemoryRouter>,
  );
}

function mockCorporateTeam(
  members: SponsorAccountMember[] = [
    ownerMember,
    financeMember,
  ],
) {
  getSponsorAccountsMock.mockResolvedValue(
    {
      data: {
        count: 1,
        results: [corporateAccount],
      },
    } as never,
  );

  getSponsorAccountMembersMock.mockResolvedValue(
    {
      data: {
        count: members.length,
        results: members,
      },
    } as never,
  );
}

describe(
  'CorporateTeamManagement',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
      localStorage.clear();
      useAuthStore
        .getState()
        .clearAuth();

      useAuthStore
        .getState()
        .setAuth({
          user: {
            id: 1,
            email:
              'orbimaps.sponsor.demo@leagueos.local',
            role: 'SPONSOR',
            sponsor_type:
              'CORPORATE',
          },
          access: 'access-token',
          refresh: 'refresh-token',
          requiresEmailVerification:
            false,
        });
    });

    it(
      'loads the corporate account and real team members',
      async () => {
        mockCorporateTeam();

        renderPage();

        expect(
          await screen.findByRole(
            'heading',
            {
              name: /orbimaps limited team/i,
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'orbimaps.finance.demo@leagueos.local',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Orbimaps Sponsor',
          ),
        ).toBeInTheDocument();

        expect(
          getSponsorAccountMembersMock,
        ).toHaveBeenCalledWith(101);
      },
    );

    it(
      'adds an existing League OS user to the corporate account',
      async () => {
        mockCorporateTeam([
          ownerMember,
        ]);

        const newMember = {
          id: 1003,
          user: {
            id: 3,
            email:
              'new.admin@leagueos.local',
            full_name:
              'New Sponsor Admin',
          },
          member_role: 'ADMIN',
          member_role_display:
            'Admin',
          is_active: true,
          created_at:
            '2026-07-14T10:00:00Z',
        } satisfies SponsorAccountMember;

        addSponsorAccountMemberMock.mockResolvedValue(
          {
            data: {
              message:
                'Sponsor account member added successfully.',
              member: newMember,
            },
          } as never,
        );

        renderPage();

        const addTeamMemberButton =
          await screen.findByRole(
            'button',
            {
              name: /add team member/i,
            },
          );

        fireEvent.click(
          addTeamMemberButton,
        );

        fireEvent.change(
          screen.getByLabelText(
            /member email/i,
          ),
          {
            target: {
              value:
                'new.admin@leagueos.local',
            },
          },
        );

        fireEvent.change(
          screen.getByLabelText(
            /member role/i,
          ),
          {
            target: {
              value: 'ADMIN',
            },
          },
        );

        fireEvent.click(
          screen.getByRole('button', {
            name: /^add member$/i,
          }),
        );

        await waitFor(() => {
          expect(
            addSponsorAccountMemberMock,
          ).toHaveBeenCalledWith(
            101,
            {
              email:
                'new.admin@leagueos.local',
              member_role: 'ADMIN',
            },
          );
        });

        expect(
          await screen.findByText(
            'new.admin@leagueos.local',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            /member added successfully/i,
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'shows read-only team access to finance members',
      async () => {
        useAuthStore
          .getState()
          .setAuth({
            user: {
              id: 2,
              email:
                'orbimaps.finance.demo@leagueos.local',
              role: 'SPONSOR',
              sponsor_type:
                'CORPORATE',
            },
            access: 'access-token',
            refresh:
              'refresh-token',
            requiresEmailVerification:
              false,
          });

        mockCorporateTeam();

        renderPage();

        expect(
          await screen.findByText(
            /finance role gives you read-only access/i,
          ),
        ).toBeInTheDocument();

        expect(
          screen.queryByRole(
            'button',
            {
              name: /add team member/i,
            },
          ),
        ).not.toBeInTheDocument();
      },
    );

    it(
      'shows an individual sponsor information state when no corporate account exists',
      async () => {
        getSponsorAccountsMock.mockResolvedValue(
          {
            data: {
              count: 1,
              results: [
                individualAccount,
              ],
            },
          } as never,
        );

        renderPage();

        expect(
          await screen.findByRole(
            'heading',
            {
              name: /corporate team management is not available/i,
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            /individual account/i,
          ),
        ).toBeInTheDocument();

        expect(
          getSponsorAccountMembersMock,
        ).not.toHaveBeenCalled();
      },
    );
  },
);
