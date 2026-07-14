import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  addSponsorAccountMember,
  becomeSponsor,
  createSponsorAgreement,
  getSponsorAccount,
  getSponsorAccountMembers,
  getSponsorAccounts,
  getSponsorAgreement,
  getSponsorAgreementPayments,
  getSponsorAgreementPaymentSchedules,
  getSponsorAgreements,
  getSponsorPackage,
  getSponsorPackageBenefits,
  getSponsorPackages,
  initializeSponsorFlutterwavePayment,
  verifySponsorFlutterwavePayment,
} from './sponsorshipService';

const apiClientMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('./apiClient.js', () => ({
  default: apiClientMock,
}));

describe('sponsorshipService', () => {
  beforeEach(() => {
    apiClientMock.get.mockReset();
    apiClientMock.post.mockReset();
  });

  it('registers an existing user as a sponsor', async () => {
    const payload = {
      sponsor_type:
        'CORPORATE' as const,
      name: 'Orbimaps Limited',
      registration_country: 'UG',
      tin: '1234567890',
    };

    apiClientMock.post.mockResolvedValue({
      data: {},
    });

    await becomeSponsor(payload);

    expect(
      apiClientMock.post,
    ).toHaveBeenCalledWith(
      '/accounts/become-sponsor/',
      payload,
    );
  });

  it('loads sponsor accounts', async () => {
    apiClientMock.get.mockResolvedValue({
      data: {
        count: 0,
        results: [],
      },
    });

    await getSponsorAccounts();

    expect(
      apiClientMock.get,
    ).toHaveBeenCalledWith(
      '/sponsorships/accounts/',
    );
  });

  it('loads one sponsor account', async () => {
    apiClientMock.get.mockResolvedValue({
      data: {},
    });

    await getSponsorAccount(12);

    expect(
      apiClientMock.get,
    ).toHaveBeenCalledWith(
      '/sponsorships/accounts/12/',
    );
  });

  it('loads sponsor account members', async () => {
    apiClientMock.get.mockResolvedValue({
      data: {
        count: 0,
        results: [],
      },
    });

    await getSponsorAccountMembers(12);

    expect(
      apiClientMock.get,
    ).toHaveBeenCalledWith(
      '/sponsorships/accounts/12/members/',
    );
  });

  it('adds a corporate sponsor member', async () => {
    const payload = {
      email: 'finance@example.com',
      member_role:
        'FINANCE' as const,
    };

    apiClientMock.post.mockResolvedValue({
      data: {},
    });

    await addSponsorAccountMember(
      12,
      payload,
    );

    expect(
      apiClientMock.post,
    ).toHaveBeenCalledWith(
      '/sponsorships/accounts/12/members/',
      payload,
    );
  });

  it('loads approved sponsorship packages with filters', async () => {
    const params = {
      owner_type: 'CLUB',
      category: 'GENERAL',
    };

    apiClientMock.get.mockResolvedValue({
      data: {
        count: 0,
        results: [],
      },
    });

    await getSponsorPackages(params);

    expect(
      apiClientMock.get,
    ).toHaveBeenCalledWith(
      '/sponsorships/packages/',
      { params },
    );
  });

  it('loads one sponsorship package', async () => {
    apiClientMock.get.mockResolvedValue({
      data: {},
    });

    await getSponsorPackage(31);

    expect(
      apiClientMock.get,
    ).toHaveBeenCalledWith(
      '/sponsorships/packages/31/',
    );
  });

  it('loads package benefits', async () => {
    apiClientMock.get.mockResolvedValue({
      data: {
        count: 0,
        results: [],
      },
    });

    await getSponsorPackageBenefits(31);

    expect(
      apiClientMock.get,
    ).toHaveBeenCalledWith(
      '/sponsorships/packages/31/benefits/',
    );
  });

  it('loads sponsor agreements with filters', async () => {
    const params = {
      sponsor_account: 12,
      status:
        'ACTIVE' as const,
    };

    apiClientMock.get.mockResolvedValue({
      data: {
        count: 0,
        results: [],
      },
    });

    await getSponsorAgreements(params);

    expect(
      apiClientMock.get,
    ).toHaveBeenCalledWith(
      '/sponsorships/agreements/',
      { params },
    );
  });

  it('loads one sponsor agreement', async () => {
    apiClientMock.get.mockResolvedValue({
      data: {},
    });

    await getSponsorAgreement(44);

    expect(
      apiClientMock.get,
    ).toHaveBeenCalledWith(
      '/sponsorships/agreements/44/',
    );
  });

  it('creates a sponsor agreement', async () => {
    const payload = {
      sponsor_account: 12,
      sponsor_package: 31,
      agreement_type:
        'CASH' as const,
      payment_source:
        'PLATFORM' as const,
      payment_model:
        'ONE_TIME' as const,
    };

    apiClientMock.post.mockResolvedValue({
      data: {},
    });

    await createSponsorAgreement(payload);

    expect(
      apiClientMock.post,
    ).toHaveBeenCalledWith(
      '/sponsorships/agreements/',
      payload,
    );
  });

  it('loads agreement payment schedules', async () => {
    apiClientMock.get.mockResolvedValue({
      data: {
        count: 0,
        results: [],
      },
    });

    await getSponsorAgreementPaymentSchedules(
      44,
    );

    expect(
      apiClientMock.get,
    ).toHaveBeenCalledWith(
      '/sponsorships/agreements/44/payment-schedules/',
    );
  });

  it('loads agreement payments', async () => {
    apiClientMock.get.mockResolvedValue({
      data: {
        count: 0,
        results: [],
      },
    });

    await getSponsorAgreementPayments(44);

    expect(
      apiClientMock.get,
    ).toHaveBeenCalledWith(
      '/sponsorships/agreements/44/payments/',
    );
  });

  it('initializes Flutterwave sponsorship checkout', async () => {
    const payload = {
      payment_schedule: 51,
      amount_paid: '500000.00',
    };

    apiClientMock.post.mockResolvedValue({
      data: {},
    });

    await initializeSponsorFlutterwavePayment(
      44,
      payload,
    );

    expect(
      apiClientMock.post,
    ).toHaveBeenCalledWith(
      '/sponsorships/agreements/44/flutterwave/initialize/',
      payload,
    );
  });

  it('verifies a Flutterwave sponsorship payment', async () => {
    apiClientMock.get.mockResolvedValue({
      data: {},
    });

    await verifySponsorFlutterwavePayment(
      'SPONSOR-44-123',
    );

    expect(
      apiClientMock.get,
    ).toHaveBeenCalledWith(
      '/sponsorships/flutterwave/verify/',
      {
        params: {
          tx_ref: 'SPONSOR-44-123',
        },
      },
    );
  });
});
