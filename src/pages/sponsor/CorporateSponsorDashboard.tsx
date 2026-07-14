import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  FiAlertCircle,
  FiCalendar,
  FiChevronRight,
  FiCreditCard,
  FiDollarSign,
  FiGrid,
  FiHelpCircle,
  FiMapPin,
  FiRefreshCw,
  FiShield,
  FiUser,
  FiUsers,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import {
  getSponsorAccounts,
  getSponsorAgreements,
  type SponsorAccountResponse,
  type SponsorAgreement,
} from '../../services/sponsorshipService';
import '../../styles/pages/landing.css';
import './CorporateSponsorDashboard.css';

type ApiErrorShape = {
  response?: {
    data?: unknown;
  };
};

type QuickAction = {
  icon: typeof FiGrid;
  title: string;
  desc: string;
  route: string;
  corporateOnly?: boolean;
};

const quickActions: QuickAction[] = [
  {
    icon: FiGrid,
    title: 'Browse Packages',
    desc: 'Discover approved sponsorship opportunities.',
    route: '/sponsor/packages',
  },
  {
    icon: FiUsers,
    title: 'Manage Team',
    desc: 'Manage corporate sponsor members and access.',
    route: '/sponsor/team',
    corporateOnly: true,
  },
  {
    icon: FiUser,
    title: 'Sponsor Profile',
    desc: 'Review your sponsor account information.',
    route: '/sponsor/profile',
  },
  {
    icon: FiHelpCircle,
    title: 'Help & Support',
    desc: 'Get assistance with your sponsorship account.',
    route: '/sponsor/support',
  },
];

const pendingStatuses = new Set([
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'PENDING_PAYMENT',
]);

function extractErrorMessage(
  value: unknown,
): string | null {
  if (
    typeof value === 'string' &&
    value.trim()
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message =
        extractErrorMessage(item);

      if (message) {
        return message;
      }
    }
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    for (
      const item of Object.values(
        value as Record<string, unknown>,
      )
    ) {
      const message =
        extractErrorMessage(item);

      if (message) {
        return message;
      }
    }
  }

  return null;
}

function getApiErrorMessage(
  error: unknown,
  fallback: string,
) {
  const data = (
    error as ApiErrorShape
  ).response?.data;

  return (
    extractErrorMessage(data) ??
    fallback
  );
}

function numericValue(
  value: string | number | null | undefined,
) {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function formatMoney(
  amount: number,
  currency: string,
) {
  return `${currency} ${new Intl.NumberFormat(
    'en-UG',
    {
      maximumFractionDigits: 0,
    },
  ).format(amount)}`;
}

function formatDate(
  value: string | null | undefined,
) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    'en-UG',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  ).format(date);
}

function agreementDateRange(
  agreement: SponsorAgreement,
) {
  if (
    agreement.starts_at &&
    agreement.ends_at
  ) {
    return `${formatDate(
      agreement.starts_at,
    )} - ${formatDate(
      agreement.ends_at,
    )}`;
  }

  if (agreement.starts_at) {
    return `Starts ${formatDate(
      agreement.starts_at,
    )}`;
  }

  if (agreement.ends_at) {
    return `Ends ${formatDate(
      agreement.ends_at,
    )}`;
  }

  return `Created ${formatDate(
    agreement.created_at,
  )}`;
}

function countryLabel(
  country: string,
) {
  const countries: Record<
    string,
    string
  > = {
    UG: 'Uganda',
    KE: 'Kenya',
    TZ: 'Tanzania',
    RW: 'Rwanda',
    SS: 'South Sudan',
  };

  return (
    countries[country.toUpperCase()] ??
    country
  );
}

function accountInitials(
  name: string,
) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join('');

  return initials || 'S';
}

function packageIcon(
  agreement: SponsorAgreement,
) {
  const scope =
    agreement.sponsor_package_detail
      ?.scope_type;

  switch (scope) {
    case 'PLAYER':
      return '🏅';
    case 'CLUB':
      return '🛡️';
    case 'TEAM':
      return '👥';
    case 'LEAGUE':
    case 'COMPETITION':
      return '🏆';
    case 'EVENT':
    case 'MATCH':
      return '🎟️';
    case 'UNION':
      return '🏛️';
    default:
      return '⭐';
  }
}

function agreementStatusClass(
  status: string,
) {
  if (status === 'ACTIVE') {
    return 'csd-status-active';
  }

  if (
    status === 'REJECTED' ||
    status === 'CANCELLED'
  ) {
    return 'csd-status-negative';
  }

  if (
    status === 'COMPLETED' ||
    status === 'EXPIRED'
  ) {
    return 'csd-status-neutral';
  }

  return 'csd-status-pending';
}

function accountStatusClass(
  status: string,
) {
  if (status === 'APPROVED') {
    return '';
  }

  if (status === 'REJECTED') {
    return 'csd-account-badge-rejected';
  }

  return 'csd-account-badge-pending';
}

function confirmedPaidValue(
  agreement: SponsorAgreement,
) {
  return agreement.payments
    .filter(
      (payment) =>
        payment.status === 'CONFIRMED',
    )
    .reduce(
      (total, payment) =>
        total +
        numericValue(
          payment.amount_paid,
        ),
      0,
    );
}

export default function CorporateSponsorDashboard() {
  const navigate = useNavigate();
  const [searchParams] =
    useSearchParams();

  const requestedAccountId =
    Number.parseInt(
      searchParams.get('account') ??
        '',
      10,
    );

  const requestedAgreementId =
    Number.parseInt(
      searchParams.get('agreement') ??
        '',
      10,
    );

  const [
    accounts,
    setAccounts,
  ] =
    useState<SponsorAccountResponse[]>(
      [],
    );

  const [
    selectedAccountId,
    setSelectedAccountId,
  ] =
    useState<number | null>(null);

  const [
    agreements,
    setAgreements,
  ] = useState<SponsorAgreement[]>([]);

  const [
    accountsLoading,
    setAccountsLoading,
  ] = useState(true);

  const [
    agreementsLoading,
    setAgreementsLoading,
  ] = useState(false);

  const [
    accountsError,
    setAccountsError,
  ] =
    useState<string | null>(null);

  const [
    agreementsError,
    setAgreementsError,
  ] =
    useState<string | null>(null);

  const [reloadKey, setReloadKey] =
    useState(0);

  useEffect(() => {
    let active = true;

    const loadAccounts = async () => {
      setAccountsLoading(true);
      setAccountsError(null);

      try {
        const response =
          await getSponsorAccounts();

        if (!active) {
          return;
        }

        const results =
          response.data.results;

        // Keep the dashboard in its loading state while the
        // selected account's agreements are being requested.
        setAgreementsLoading(
          results.length > 0,
        );

        setAccounts(results);

        setSelectedAccountId(
          (current) => {
            if (
              current !== null &&
              results.some(
                (account) =>
                  account.id ===
                  current,
              )
            ) {
              return current;
            }

            if (
              Number.isInteger(
                requestedAccountId,
              ) &&
              requestedAccountId > 0 &&
              results.some(
                (account) =>
                  account.id ===
                  requestedAccountId,
              )
            ) {
              return requestedAccountId;
            }

            return (
              results[0]?.id ?? null
            );
          },
        );
      } catch (loadError) {
        if (!active) {
          return;
        }

        setAccounts([]);
        setSelectedAccountId(null);
        setAgreementsLoading(false);

        setAccountsError(
          getApiErrorMessage(
            loadError,
            'We could not load your sponsor accounts.',
          ),
        );
      } finally {
        if (active) {
          setAccountsLoading(false);
        }
      }
    };

    void loadAccounts();

    return () => {
      active = false;
    };
  }, [
    reloadKey,
    requestedAccountId,
  ]);

  useEffect(() => {
    let active = true;

    if (selectedAccountId === null) {
      setAgreements([]);
      setAgreementsLoading(false);
      setAgreementsError(null);

      return () => {
        active = false;
      };
    }

    const loadAgreements =
      async () => {
        setAgreementsLoading(true);
        setAgreementsError(null);
        setAgreements([]);

        try {
          const response =
            await getSponsorAgreements({
              sponsor_account:
                selectedAccountId,
            });

          if (!active) {
            return;
          }

          setAgreements(
            response.data.results,
          );
        } catch (loadError) {
          if (!active) {
            return;
          }

          setAgreementsError(
            getApiErrorMessage(
              loadError,
              'We could not load the sponsorship agreements.',
            ),
          );
        } finally {
          if (active) {
            setAgreementsLoading(false);
          }
        }
      };

    void loadAgreements();

    return () => {
      active = false;
    };
  }, [
    reloadKey,
    selectedAccountId,
  ]);

  const selectedAccount =
    useMemo(
      () =>
        accounts.find(
          (account) =>
            account.id ===
            selectedAccountId,
        ) ?? null,
      [
        accounts,
        selectedAccountId,
      ],
    );

  const recentAgreements =
    useMemo(() => {
      if (
        !Number.isInteger(
          requestedAgreementId,
        ) ||
        requestedAgreementId <= 0
      ) {
        return agreements;
      }

      return [...agreements].sort(
        (first, second) => {
          if (
            first.id ===
            requestedAgreementId
          ) {
            return -1;
          }

          if (
            second.id ===
            requestedAgreementId
          ) {
            return 1;
          }

          return 0;
        },
      );
    }, [
      agreements,
      requestedAgreementId,
    ]);

  const activeCount =
    agreements.filter(
      (agreement) =>
        agreement.status === 'ACTIVE',
    ).length;

  const pendingCount =
    agreements.filter((agreement) =>
      pendingStatuses.has(
        agreement.status,
      ),
    ).length;

  const displayAgreements =
    agreements.filter(
      (agreement) =>
        agreement.status !==
          'REJECTED' &&
        agreement.status !==
          'CANCELLED',
    );

  const currencies = Array.from(
    new Set(
      displayAgreements
        .map(
          (agreement) =>
            agreement.currency,
        )
        .filter(Boolean),
    ),
  );

  const primaryCurrency =
    currencies.length === 1
      ? currencies[0]
      : null;

  const committedValue =
    displayAgreements.reduce(
      (total, agreement) =>
        total +
        numericValue(
          agreement.total_value,
        ),
      0,
    );

  const confirmedPayments =
    agreements.flatMap(
      (agreement) =>
        agreement.payments.filter(
          (payment) =>
            payment.status ===
            'CONFIRMED',
        ),
    );

  const confirmedValue =
    confirmedPayments.reduce(
      (total, payment) =>
        total +
        numericValue(
          payment.amount_paid,
        ),
      0,
    );

  const monetaryValue = (
    amount: number,
  ) => {
    if (
      agreements.length === 0
    ) {
      return 'UGX 0';
    }

    if (!primaryCurrency) {
      return 'Mixed currencies';
    }

    return formatMoney(
      amount,
      primaryCurrency,
    );
  };

  const stats = [
    {
      icon: FiShield,
      label: 'Active Sponsorships',
      value: String(activeCount),
      change:
        'Currently active agreements',
    },
    {
      icon: FiUsers,
      label: 'Pending Actions',
      value: String(pendingCount),
      change:
        'Draft, approval or payment stage',
    },
    {
      icon: FiDollarSign,
      label: 'Committed Value',
      value:
        monetaryValue(
          committedValue,
        ),
      change: `${displayAgreements.length} valid agreement${
        displayAgreements.length ===
        1
          ? ''
          : 's'
      }`,
    },
    {
      icon: FiCreditCard,
      label: 'Confirmed Payments',
      value:
        monetaryValue(
          confirmedValue,
        ),
      change: `${confirmedPayments.length} confirmed transaction${
        confirmedPayments.length ===
        1
          ? ''
          : 's'
      }`,
    },
  ];

  const isIndividual =
    selectedAccount?.sponsor_type ===
    'INDIVIDUAL';

  const filteredActions =
    quickActions.filter(
      (action) =>
        !action.corporateOnly ||
        !isIndividual,
    );

  const loading =
    accountsLoading ||
    (
      selectedAccountId !== null &&
      agreementsLoading
    );

  const error =
    accountsError ??
    agreementsError;

  const pageTitle = isIndividual
    ? 'Individual Sponsorship Dashboard'
    : 'Corporate Sponsorship Dashboard';

  return (
    <div className="csd-page">
      <div className="csd-layout">
        <SponsorSidebar />

        <main className="csd-main landing-page">
          {loading && (
            <div className="csd-state-card">
              <FiRefreshCw
                size={30}
                className="csd-state-spinner"
              />

              <h2>
                Loading sponsor dashboard
              </h2>

              <p>
                Fetching your sponsor
                accounts and agreements.
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="csd-state-card">
              <FiAlertCircle
                size={30}
              />

              <h2>
                Dashboard could not be loaded
              </h2>

              <p>{error}</p>

              <button
                type="button"
                className="csd-state-action"
                onClick={() =>
                  setReloadKey(
                    (current) =>
                      current + 1,
                  )
                }
              >
                Try Again
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            accounts.length === 0 && (
              <div className="csd-state-card">
                <FiShield size={32} />

                <h2>
                  No sponsor account yet
                </h2>

                <p>
                  Create an individual or
                  corporate sponsor account
                  to access sponsorship
                  packages and agreements.
                </p>

                <button
                  type="button"
                  className="csd-state-action"
                  onClick={() =>
                    navigate(
                      '/sponsorhub',
                    )
                  }
                >
                  Create Sponsor Account
                </button>
              </div>
            )}

          {!loading &&
            !error &&
            selectedAccount && (
              <>
                <div className="csd-hero-card">
                  <div className="csd-hero-left">
                    <div className="csd-welcome-text">
                      Welcome back,
                    </div>

                    <div className="csd-company-row">
                      <h1 className="csd-company-name">
                        {
                          selectedAccount.name
                        }
                      </h1>

                      <span
                        className={
                          `csd-verified-badge ${
                            accountStatusClass(
                              selectedAccount.status,
                            )
                          }`
                        }
                      >
                        {
                          selectedAccount.status_display
                        }{' '}
                        Sponsor
                      </span>
                    </div>

                    <div className="csd-tagline">
                      {isIndividual
                        ? 'Supporting sport. Making an impact.'
                        : 'Building champions. Together.'}
                    </div>

                    <div className="csd-meta-row">
                      <span className="csd-meta-item">
                        <FiMapPin
                          size={13}
                        />
                        {countryLabel(
                          selectedAccount.registration_country,
                        )}
                      </span>

                      {!isIndividual &&
                        (
                          selectedAccount.brn ||
                          selectedAccount.tin
                        ) && (
                          <>
                            <span className="csd-meta-divider">
                              |
                            </span>

                            <span className="csd-meta-item">
                              <FiShield
                                size={13}
                              />

                              {selectedAccount.brn
                                ? `BRN ${selectedAccount.brn}`
                                : `TIN ${selectedAccount.tin}`}
                            </span>
                          </>
                        )}
                    </div>

                    {accounts.length > 1 && (
                      <div className="csd-account-switcher">
                        <label htmlFor="sponsor-dashboard-account">
                          Sponsor account
                        </label>

                        <select
                          id="sponsor-dashboard-account"
                          value={
                            selectedAccountId ??
                            ''
                          }
                          onChange={(
                            event,
                          ) =>
                            setSelectedAccountId(
                              Number(
                                event.target
                                  .value,
                              ),
                            )
                          }
                        >
                          {accounts.map(
                            (account) => (
                              <option
                                key={
                                  account.id
                                }
                                value={
                                  account.id
                                }
                              >
                                {
                                  account.name
                                }{' '}
                                —{' '}
                                {
                                  account.status_display
                                }
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="csd-hero-logo">
                    <div className="csd-nile-logo-card">
                      <div className="csd-account-initials">
                        {accountInitials(
                          selectedAccount.name,
                        )}
                      </div>

                      <div className="csd-account-type-label">
                        {
                          selectedAccount.sponsor_type_display
                        }
                      </div>

                      <div className="csd-account-member-count">
                        {
                          selectedAccount.member_count
                        }{' '}
                        member
                        {selectedAccount.member_count ===
                        1
                          ? ''
                          : 's'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="csd-stats-row">
                  {stats.map((stat) => {
                    const Icon =
                      stat.icon;

                    return (
                      <div
                        key={
                          stat.label
                        }
                        className="csd-stat-card"
                      >
                        <div className="csd-stat-icon-wrap">
                          <Icon
                            size={20}
                            className="csd-stat-icon"
                          />
                        </div>

                        <div className="csd-stat-info">
                          <div className="csd-stat-label">
                            {
                              stat.label
                            }
                          </div>

                          <div className="csd-stat-value">
                            {
                              stat.value
                            }
                          </div>

                          <div className="csd-stat-change csd-stat-change-muted">
                            {
                              stat.change
                            }
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="csd-bottom">
                  <div className="csd-campaigns-card">
                    <div className="csd-campaigns-header">
                      <h2 className="csd-campaigns-title">
                        Recent Sponsorships
                      </h2>

                      <button
                        type="button"
                        className="csd-view-all"
                        onClick={() =>
                          navigate(
                            '/sponsor/packages',
                          )
                        }
                      >
                        Browse Packages
                      </button>
                    </div>

                    <div className="csd-campaigns-list">
                      {recentAgreements.length ===
                      0 ? (
                        <div className="csd-agreements-empty">
                          <FiShield
                            size={28}
                          />

                          <h3>
                            No agreements yet
                          </h3>

                          <p>
                            Select a package to
                            begin a sponsorship
                            agreement.
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                '/sponsor/packages',
                              )
                            }
                          >
                            Browse Packages
                          </button>
                        </div>
                      ) : (
                        recentAgreements
                          .slice(0, 3)
                          .map(
                            (agreement) => {
                              const paid =
                                confirmedPaidValue(
                                  agreement,
                                );

                              return (
                                <button
                                  type="button"
                                  key={
                                    agreement.id
                                  }
                                  className={
                                    `csd-campaign-row csd-agreement-row-button ${
                                      agreement.id ===
                                      requestedAgreementId
                                        ? 'csd-agreement-highlighted'
                                        : ''
                                    }`
                                  }
                                  onClick={() =>
                                    navigate(
                                      `/sponsor/packages/${agreement.sponsor_package}`,
                                    )
                                  }
                                >
                                  <div className="csd-campaign-logo">
                                    {packageIcon(
                                      agreement,
                                    )}
                                  </div>

                                  <div className="csd-campaign-info">
                                    <div className="csd-campaign-name-row">
                                      <span className="csd-campaign-name">
                                        {
                                          agreement
                                            .sponsor_package_detail
                                            .name
                                        }
                                      </span>

                                      <span
                                        className={
                                          `csd-live-badge ${
                                            agreementStatusClass(
                                              agreement.status,
                                            )
                                          }`
                                        }
                                      >
                                        {
                                          agreement.status_display
                                        }
                                      </span>
                                    </div>

                                    <div className="csd-campaign-role">
                                      {
                                        agreement
                                          .sponsor_package_detail
                                          .scope_name
                                      }
                                    </div>

                                    <div className="csd-campaign-dates">
                                      <FiCalendar
                                        size={11}
                                      />
                                      {agreementDateRange(
                                        agreement,
                                      )}
                                    </div>
                                  </div>

                                  <div className="csd-campaign-stats">
                                    <div className="csd-campaign-stat">
                                      <div className="csd-cs-label">
                                        Agreement
                                      </div>

                                      <div className="csd-cs-value">
                                        {formatMoney(
                                          numericValue(
                                            agreement.total_value,
                                          ),
                                          agreement.currency,
                                        )}
                                      </div>

                                      <div className="csd-cs-change csd-cs-change-muted">
                                        {
                                          agreement.reference ||
                                          `#${agreement.id}`
                                        }
                                      </div>
                                    </div>

                                    <div className="csd-campaign-stat">
                                      <div className="csd-cs-label">
                                        Confirmed Paid
                                      </div>

                                      <div className="csd-cs-value">
                                        {formatMoney(
                                          paid,
                                          agreement.currency,
                                        )}
                                      </div>

                                      <div className="csd-cs-change csd-cs-change-muted">
                                        {
                                          agreement.payments.filter(
                                            (
                                              payment,
                                            ) =>
                                              payment.status ===
                                              'CONFIRMED',
                                          ).length
                                        }{' '}
                                        payment(s)
                                      </div>
                                    </div>

                                    <div className="csd-campaign-stat">
                                      <div className="csd-cs-label">
                                        Payment Model
                                      </div>

                                      <div className="csd-cs-value">
                                        {
                                          agreement.payment_model_display
                                        }
                                      </div>

                                      <div className="csd-cs-change csd-cs-change-muted">
                                        {
                                          agreement.payment_source_display
                                        }
                                      </div>
                                    </div>
                                  </div>

                                  <FiChevronRight
                                    size={18}
                                    className="csd-campaign-chevron"
                                  />
                                </button>
                              );
                            },
                          )
                      )}
                    </div>
                  </div>

                  <div className="csd-quick-actions">
                    {filteredActions.map(
                      (action) => {
                        const Icon =
                          action.icon;

                        return (
                          <div
                            key={
                              action.title
                            }
                            className="csd-action-card"
                          >
                            <div className="csd-action-icon-wrap">
                              <Icon
                                size={20}
                                className="csd-action-icon"
                              />
                            </div>

                            <div className="csd-action-title">
                              {
                                action.title
                              }
                            </div>

                            <div className="csd-action-desc">
                              {
                                action.desc
                              }
                            </div>

                            <button
                              type="button"
                              className="csd-action-btn"
                              aria-label={
                                action.title
                              }
                              onClick={() =>
                                navigate(
                                  action.route,
                                )
                              }
                            >
                              <FiChevronRight
                                size={16}
                              />
                            </button>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                <div className="csd-page-type-badge">
                  {pageTitle}
                </div>
              </>
            )}
        </main>
      </div>
    </div>
  );
}
