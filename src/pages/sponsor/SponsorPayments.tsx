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
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiExternalLink,
  FiFileText,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTrendingUp,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import {
  getSponsorAccounts,
  getSponsorAgreements,
  initializeSponsorFlutterwavePayment,
  type SponsorAccountResponse,
  type SponsorAgreement,
  type SponsorAgreementStatus,
  type SponsorPayment,
  type SponsorPaymentSchedule,
} from '../../services/sponsorshipService';
import {
  redirectToExternalUrl,
} from '../../utils/externalNavigation';
import '../../styles/pages/landing.css';
import './SponsorPayments.css';

type AgreementFilter =
  | 'ALL'
  | SponsorAgreementStatus;

type ApiErrorShape = {
  response?: {
    data?: unknown;
  };
};

const payableStatuses:
  SponsorAgreementStatus[] = [
    'APPROVED',
    'PENDING_PAYMENT',
  ];

const pendingScheduleStatuses = [
  'PENDING',
  'PARTIALLY_PAID',
  'OVERDUE',
];

const successfulPaymentStatuses = [
  'CONFIRMED',
];

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
  const responseData = (
    error as ApiErrorShape
  ).response?.data;

  return (
    extractErrorMessage(responseData) ??
    fallback
  );
}

function parseAmount(
  amount: string | number | null | undefined,
) {
  const parsed = Number(amount ?? 0);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function formatMoney(
  amount: string | number,
  currency = 'UGX',
) {
  const value = parseAmount(amount);

  try {
    return new Intl.NumberFormat(
      'en-UG',
      {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      },
    ).format(value);
  } catch {
    return `${currency} ${value.toLocaleString(
      'en-UG',
    )}`;
  }
}

function formatDate(
  value: string | null | undefined,
) {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    'en-UG',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  ).format(date);
}

function getConfirmedTotal(
  agreement: SponsorAgreement,
) {
  return agreement.payments
    .filter((payment) =>
      successfulPaymentStatuses.includes(
        payment.status,
      ),
    )
    .reduce(
      (total, payment) =>
        total +
        parseAmount(
          payment.amount_paid,
        ),
      0,
    );
}

function getOutstandingTotal(
  agreement: SponsorAgreement,
) {
  return Math.max(
    parseAmount(agreement.total_value) -
      getConfirmedTotal(agreement),
    0,
  );
}

function getNextSchedule(
  agreement: SponsorAgreement,
): SponsorPaymentSchedule | null {
  return (
    [...agreement.payment_schedules]
      .filter((schedule) =>
        pendingScheduleStatuses.includes(
          schedule.status,
        ),
      )
      .sort(
        (left, right) =>
          left.sequence_number -
          right.sequence_number,
      )[0] ?? null
  );
}

function getPendingPayment(
  agreement: SponsorAgreement,
  schedule:
    | SponsorPaymentSchedule
    | null,
): SponsorPayment | null {
  const matching = agreement.payments
    .filter(
      (payment) =>
        payment.status === 'PENDING' &&
        payment.payment_schedule ===
          (schedule?.id ?? null),
    )
    .sort(
      (left, right) =>
        new Date(
          right.created_at,
        ).getTime() -
        new Date(
          left.created_at,
        ).getTime(),
    );

  return matching[0] ?? null;
}

function sortAgreements(
  agreements: SponsorAgreement[],
) {
  return [...agreements].sort(
    (left, right) =>
      new Date(
        right.updated_at,
      ).getTime() -
      new Date(
        left.updated_at,
      ).getTime(),
  );
}

function paymentFeedback(
  value: string | null,
) {
  switch (value) {
    case 'success':
      return {
        type: 'success',
        message:
          'Your sponsorship payment was verified successfully.',
      };
    case 'cancelled':
      return {
        type: 'warning',
        message:
          'The Flutterwave checkout was cancelled before payment was completed.',
      };
    case 'verification-failed':
      return {
        type: 'error',
        message:
          'League OS could not verify the returned Flutterwave payment.',
      };
    case 'missing-reference':
      return {
        type: 'error',
        message:
          'The payment callback did not include a transaction reference.',
      };
    default:
      return null;
  }
}

export default function SponsorPayments() {
  const navigate = useNavigate();
  const [searchParams] =
    useSearchParams();

  const [accounts, setAccounts] =
    useState<SponsorAccountResponse[]>(
      [],
    );
  const [
    selectedAccountId,
    setSelectedAccountId,
  ] = useState<number | null>(null);
  const [agreements, setAgreements] =
    useState<SponsorAgreement[]>([]);

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
  ] = useState('');
  const [
    agreementsError,
    setAgreementsError,
  ] = useState('');

  const [
    accountsRequestKey,
    setAccountsRequestKey,
  ] = useState(0);
  const [
    agreementsRequestKey,
    setAgreementsRequestKey,
  ] = useState(0);

  const [search, setSearch] =
    useState('');
  const [
    agreementFilter,
    setAgreementFilter,
  ] =
    useState<AgreementFilter>('ALL');
  const [
    initializingAgreementId,
    setInitializingAgreementId,
  ] = useState<number | null>(null);
  const [actionError, setActionError] =
    useState('');

  const selectedAccount = useMemo(
    () =>
      accounts.find(
        (account) =>
          account.id ===
          selectedAccountId,
      ) ?? null,
    [accounts, selectedAccountId],
  );

  const feedback = useMemo(
    () =>
      paymentFeedback(
        searchParams.get('payment'),
      ),
    [searchParams],
  );

  useEffect(() => {
    let active = true;

    async function loadAccounts() {
      setAccountsLoading(true);
      setAccountsError('');

      try {
        const response =
          await getSponsorAccounts();

        if (!active) {
          return;
        }

        const results =
          response.data.results;

        const requestedAccountId =
          Number(
            searchParams.get(
              'account',
            ),
          );

        const requestedAccount =
          results.find(
            (account) =>
              account.id ===
              requestedAccountId,
          );

        const nextAccount =
          requestedAccount ??
          results[0] ??
          null;

        setAgreementsLoading(
          nextAccount !== null,
        );
        setAccounts(results);
        setSelectedAccountId(
          nextAccount?.id ?? null,
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setAccounts([]);
        setSelectedAccountId(null);
        setAgreementsLoading(false);
        setAccountsError(
          getApiErrorMessage(
            error,
            'We could not load your sponsor accounts.',
          ),
        );
      } finally {
        if (active) {
          setAccountsLoading(false);
        }
      }
    }

    void loadAccounts();

    return () => {
      active = false;
    };
  }, [
    accountsRequestKey,
    searchParams,
  ]);

  useEffect(() => {
    let active = true;

    if (selectedAccountId === null) {
      setAgreements([]);
      setAgreementsLoading(false);
      setAgreementsError('');

      return () => {
        active = false;
      };
    }

    async function loadAgreements() {
      setAgreementsLoading(true);
      setAgreementsError('');
      setActionError('');

      try {
        const response =
          await getSponsorAgreements({
            sponsor_account:
              selectedAccountId as number,
          });

        if (!active) {
          return;
        }

        setAgreements(
          sortAgreements(
            response.data.results,
          ),
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setAgreements([]);
        setAgreementsError(
          getApiErrorMessage(
            error,
            'We could not load your sponsorship agreements.',
          ),
        );
      } finally {
        if (active) {
          setAgreementsLoading(false);
        }
      }
    }

    void loadAgreements();

    return () => {
      active = false;
    };
  }, [
    agreementsRequestKey,
    selectedAccountId,
  ]);

  const filteredAgreements =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return agreements.filter(
        (agreement) => {
          const packageName =
            agreement
              .sponsor_package_detail
              .name.toLowerCase();

          const reference =
            agreement.reference.toLowerCase();

          const ownerName =
            agreement
              .sponsor_package_detail
              .owner_name.toLowerCase();

          const matchesSearch =
            !normalizedSearch ||
            packageName.includes(
              normalizedSearch,
            ) ||
            reference.includes(
              normalizedSearch,
            ) ||
            ownerName.includes(
              normalizedSearch,
            );

          const matchesStatus =
            agreementFilter === 'ALL' ||
            agreement.status ===
              agreementFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      agreementFilter,
      agreements,
      search,
    ]);

  const summary = useMemo(() => {
    const confirmedTotal =
      agreements.reduce(
        (total, agreement) =>
          total +
          getConfirmedTotal(
            agreement,
          ),
        0,
      );

    const outstandingTotal =
      agreements.reduce(
        (total, agreement) =>
          total +
          getOutstandingTotal(
            agreement,
          ),
        0,
      );

    return {
      agreements:
        agreements.length,
      active: agreements.filter(
        (agreement) =>
          agreement.status ===
          'ACTIVE',
      ).length,
      confirmedTotal,
      outstandingTotal,
    };
  }, [agreements]);

  function selectAccount(
    accountId: number,
  ) {
    setSelectedAccountId(accountId);
    setSearch('');
    setAgreementFilter('ALL');
    setActionError('');

    navigate(
      `/sponsor/payments?account=${accountId}`,
      {
        replace: true,
      },
    );
  }

  function rememberCheckout(
    agreement: SponsorAgreement,
    payment: SponsorPayment,
    checkoutUrl: string,
  ) {
    localStorage.setItem(
      'league_os_pending_sponsor_checkout',
      JSON.stringify({
        agreement_id:
          agreement.id,
        payment_id:
          payment.id,
        tx_ref:
          payment.transaction_reference,
        checkout_url:
          checkoutUrl,
      }),
    );
  }

  function resumeCheckout(
    agreement: SponsorAgreement,
    payment: SponsorPayment,
  ) {
    if (!payment.checkout_url) {
      return;
    }

    try {
      rememberCheckout(
        agreement,
        payment,
        payment.checkout_url,
      );

      redirectToExternalUrl(
        payment.checkout_url,
      );
    } catch (error) {
      setActionError(
        getApiErrorMessage(
          error,
          'The Flutterwave checkout URL could not be opened.',
        ),
      );
    }
  }

  async function beginPayment(
    agreement: SponsorAgreement,
  ) {
    const schedule =
      getNextSchedule(agreement);

    const amount =
      schedule?.amount_due ??
      String(
        getOutstandingTotal(
          agreement,
        ),
      );

    setInitializingAgreementId(
      agreement.id,
    );
    setActionError('');

    try {
      const response =
        await initializeSponsorFlutterwavePayment(
          agreement.id,
          {
            ...(schedule
              ? {
                  payment_schedule:
                    schedule.id,
                }
              : {}),
            amount_paid: amount,
          },
        );

      const {
        checkout_url: checkoutUrl,
        payment,
      } = response.data;

      rememberCheckout(
        agreement,
        payment,
        checkoutUrl,
      );

      redirectToExternalUrl(
        checkoutUrl,
      );
    } catch (error) {
      setActionError(
        getApiErrorMessage(
          error,
          'We could not initialize the Flutterwave sponsorship payment.',
        ),
      );
    } finally {
      setInitializingAgreementId(
        null,
      );
    }
  }

  if (accountsLoading) {
    return (
      <div className="spp-page">
        <div className="spp-layout">
          <SponsorSidebar />
          <main className="spp-main landing-page">
            <div
              className="spp-state-card"
              role="status"
            >
              <div className="spp-spinner" />
              <h1>
                Loading sponsor payments
              </h1>
              <p>
                We are loading your
                sponsor accounts and
                agreements.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (accountsError) {
    return (
      <div className="spp-page">
        <div className="spp-layout">
          <SponsorSidebar />
          <main className="spp-main landing-page">
            <div className="spp-state-card">
              <FiAlertCircle
                size={30}
              />
              <h1>
                Sponsor accounts
                unavailable
              </h1>
              <p>{accountsError}</p>
              <button
                type="button"
                className="spp-primary-btn"
                onClick={() =>
                  setAccountsRequestKey(
                    (value) =>
                      value + 1,
                  )
                }
              >
                <FiRefreshCw
                  size={16}
                />
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="spp-page">
        <div className="spp-layout">
          <SponsorSidebar />
          <main className="spp-main landing-page">
            <div className="spp-state-card">
              <FiCreditCard
                size={30}
              />
              <h1>
                No sponsor account
                found
              </h1>
              <p>
                Create or join a
                sponsor account before
                viewing agreements and
                payments.
              </p>
              <button
                type="button"
                className="spp-primary-btn"
                onClick={() =>
                  navigate(
                    '/sponsorhub',
                  )
                }
              >
                Open Sponsorship Hub
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="spp-page">
      <div className="spp-layout">
        <SponsorSidebar />

        <main className="spp-main landing-page">
          <header className="spp-header">
            <div>
              <div className="spp-eyebrow">
                Sponsor workspace
              </div>
              <h1>
                Agreements & Payments
              </h1>
              <p>
                Review sponsorship
                agreements, payment
                schedules, confirmed
                transactions and
                outstanding amounts.
              </p>
            </div>

            <button
              type="button"
              className="spp-secondary-btn"
              onClick={() =>
                navigate(
                  '/sponsor/packages',
                )
              }
            >
              <FiFileText size={16} />
              Browse packages
            </button>
          </header>

          {feedback && (
            <div
              className={`spp-feedback spp-feedback-${feedback.type}`}
              role={
                feedback.type ===
                'error'
                  ? 'alert'
                  : 'status'
              }
            >
              {feedback.type ===
              'success' ? (
                <FiCheckCircle
                  size={18}
                />
              ) : (
                <FiAlertCircle
                  size={18}
                />
              )}
              <span>
                {feedback.message}
              </span>
            </div>
          )}

          {actionError && (
            <div
              className="spp-feedback spp-feedback-error"
              role="alert"
            >
              <FiAlertCircle
                size={18}
              />
              <span>
                {actionError}
              </span>
            </div>
          )}

          {selectedAccount && (
            <section className="spp-account-card">
              <div>
                <span className="spp-account-label">
                  Sponsor account
                </span>
                <h2>
                  {
                    selectedAccount.name
                  }
                </h2>
                <div className="spp-account-meta">
                  <span>
                    {
                      selectedAccount
                        .sponsor_type_display
                    }
                  </span>
                  <span>
                    {
                      selectedAccount
                        .status_display
                    }
                  </span>
                  <span>
                    {
                      selectedAccount
                        .registration_country
                    }
                  </span>
                </div>
              </div>

              {accounts.length > 1 && (
                <label className="spp-account-selector">
                  <span>
                    Switch account
                  </span>
                  <div className="spp-select-wrap">
                    <select
                      value={
                        selectedAccountId ??
                        ''
                      }
                      onChange={(
                        event,
                      ) =>
                        selectAccount(
                          Number(
                            event
                              .target
                              .value,
                          ),
                        )
                      }
                      aria-label="Sponsor account"
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
                            }
                          </option>
                        ),
                      )}
                    </select>
                    <FiChevronDown
                      size={15}
                    />
                  </div>
                </label>
              )}
            </section>
          )}

          <section className="spp-stats">
            <article>
              <span className="spp-stat-icon spp-stat-purple">
                <FiFileText
                  size={19}
                />
              </span>
              <div>
                <span>
                  Agreements
                </span>
                <strong>
                  {summary.agreements}
                </strong>
                <small>
                  All sponsor
                  agreements
                </small>
              </div>
            </article>

            <article>
              <span className="spp-stat-icon spp-stat-green">
                <FiShield size={19} />
              </span>
              <div>
                <span>
                  Active agreements
                </span>
                <strong>
                  {summary.active}
                </strong>
                <small>
                  Benefits currently
                  active
                </small>
              </div>
            </article>

            <article>
              <span className="spp-stat-icon spp-stat-blue">
                <FiDollarSign
                  size={19}
                />
              </span>
              <div>
                <span>
                  Confirmed payments
                </span>
                <strong>
                  {formatMoney(
                    summary.confirmedTotal,
                  )}
                </strong>
                <small>
                  Verified transactions
                </small>
              </div>
            </article>

            <article>
              <span className="spp-stat-icon spp-stat-orange">
                <FiTrendingUp
                  size={19}
                />
              </span>
              <div>
                <span>
                  Outstanding
                </span>
                <strong>
                  {formatMoney(
                    summary.outstandingTotal,
                  )}
                </strong>
                <small>
                  Remaining agreement
                  value
                </small>
              </div>
            </article>
          </section>

          <section className="spp-controls">
            <div className="spp-search-wrap">
              <FiSearch
                size={16}
              />
              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search by package, owner or agreement reference"
              />
            </div>

            <div className="spp-filter-wrap">
              <FiShield size={15} />
              <select
                value={
                  agreementFilter
                }
                onChange={(event) =>
                  setAgreementFilter(
                    event.target
                      .value as AgreementFilter,
                  )
                }
                aria-label="Filter agreements by status"
              >
                <option value="ALL">
                  All statuses
                </option>
                <option value="SUBMITTED">
                  Submitted
                </option>
                <option value="APPROVED">
                  Approved
                </option>
                <option value="PENDING_PAYMENT">
                  Pending payment
                </option>
                <option value="ACTIVE">
                  Active
                </option>
                <option value="PAUSED">
                  Paused
                </option>
                <option value="COMPLETED">
                  Completed
                </option>
                <option value="CANCELLED">
                  Cancelled
                </option>
                <option value="REJECTED">
                  Rejected
                </option>
              </select>
              <FiChevronDown
                size={15}
              />
            </div>
          </section>

          {agreementsLoading && (
            <div
              className="spp-state-card spp-inline-state"
              role="status"
            >
              <div className="spp-spinner" />
              <h2>
                Loading agreements
              </h2>
              <p>
                Retrieving schedules
                and payment history.
              </p>
            </div>
          )}

          {!agreementsLoading &&
            agreementsError && (
              <div className="spp-state-card spp-inline-state">
                <FiAlertCircle
                  size={28}
                />
                <h2>
                  Agreements
                  unavailable
                </h2>
                <p>
                  {agreementsError}
                </p>
                <button
                  type="button"
                  className="spp-primary-btn"
                  onClick={() =>
                    setAgreementsRequestKey(
                      (value) =>
                        value + 1,
                    )
                  }
                >
                  <FiRefreshCw
                    size={16}
                  />
                  Retry
                </button>
              </div>
            )}

          {!agreementsLoading &&
            !agreementsError &&
            filteredAgreements.length ===
              0 && (
              <div className="spp-state-card spp-inline-state">
                <FiFileText
                  size={28}
                />
                <h2>
                  No agreements found
                </h2>
                <p>
                  {agreements.length >
                  0
                    ? 'No agreements match the current search and status filter.'
                    : 'This sponsor account does not have any agreements yet.'}
                </p>
              </div>
            )}

          {!agreementsLoading &&
            !agreementsError &&
            filteredAgreements.length >
              0 && (
              <section className="spp-agreement-list">
                {filteredAgreements.map(
                  (agreement) => {
                    const confirmedTotal =
                      getConfirmedTotal(
                        agreement,
                      );

                    const outstandingTotal =
                      getOutstandingTotal(
                        agreement,
                      );

                    const nextSchedule =
                      getNextSchedule(
                        agreement,
                      );

                    const pendingPayment =
                      getPendingPayment(
                        agreement,
                        nextSchedule,
                      );

                    const canPay =
                      agreement.payment_source ===
                        'PLATFORM' &&
                      payableStatuses.includes(
                        agreement.status,
                      ) &&
                      outstandingTotal >
                        0;

                    return (
                      <article
                        key={
                          agreement.id
                        }
                        className="spp-agreement-card"
                      >
                        <div className="spp-agreement-header">
                          <div>
                            <div className="spp-agreement-owner">
                              {
                                agreement
                                  .sponsor_package_detail
                                  .owner_name
                              }
                            </div>
                            <h2>
                              {
                                agreement
                                  .sponsor_package_detail
                                  .name
                              }
                            </h2>
                            <div className="spp-agreement-reference">
                              {
                                agreement.reference
                              }
                            </div>
                          </div>

                          <span
                            className={`spp-status spp-status-${agreement.status.toLowerCase()}`}
                          >
                            {
                              agreement.status_display
                            }
                          </span>
                        </div>

                        <div className="spp-agreement-summary">
                          <div>
                            <span>
                              Agreement value
                            </span>
                            <strong>
                              {formatMoney(
                                agreement.total_value,
                                agreement.currency,
                              )}
                            </strong>
                          </div>
                          <div>
                            <span>
                              Confirmed
                            </span>
                            <strong>
                              {formatMoney(
                                confirmedTotal,
                                agreement.currency,
                              )}
                            </strong>
                          </div>
                          <div>
                            <span>
                              Outstanding
                            </span>
                            <strong>
                              {formatMoney(
                                outstandingTotal,
                                agreement.currency,
                              )}
                            </strong>
                          </div>
                          <div>
                            <span>
                              Payment model
                            </span>
                            <strong>
                              {
                                agreement.payment_model_display
                              }
                            </strong>
                          </div>
                        </div>

                        <div className="spp-agreement-details">
                          <div>
                            <span>
                              Agreement period
                            </span>
                            <strong>
                              {formatDate(
                                agreement.starts_at,
                              )}{' '}
                              –{' '}
                              {formatDate(
                                agreement.ends_at,
                              )}
                            </strong>
                          </div>
                          <div>
                            <span>
                              Payment source
                            </span>
                            <strong>
                              {
                                agreement.payment_source_display
                              }
                            </strong>
                          </div>
                          <div>
                            <span>
                              Benefits tier
                            </span>
                            <strong>
                              {
                                agreement.benefits_tier_display
                              }
                            </strong>
                          </div>
                        </div>

                        <div className="spp-card-columns">
                          <section>
                            <div className="spp-section-title">
                              <FiClock
                                size={16}
                              />
                              Payment schedule
                            </div>

                            {agreement
                              .payment_schedules
                              .length ===
                            0 ? (
                              <p className="spp-empty-copy">
                                No payment
                                schedule has
                                been created.
                              </p>
                            ) : (
                              <div className="spp-schedule-list">
                                {[...agreement.payment_schedules]
                                  .sort(
                                    (
                                      left,
                                      right,
                                    ) =>
                                      left.sequence_number -
                                      right.sequence_number,
                                  )
                                  .map(
                                    (
                                      schedule,
                                    ) => (
                                      <div
                                        key={
                                          schedule.id
                                        }
                                        className="spp-schedule-row"
                                      >
                                        <div>
                                          <strong>
                                            Payment{' '}
                                            {
                                              schedule.sequence_number
                                            }
                                          </strong>
                                          <span>
                                            Due{' '}
                                            {formatDate(
                                              schedule.due_date,
                                            )}
                                          </span>
                                        </div>
                                        <div>
                                          <strong>
                                            {formatMoney(
                                              schedule.amount_due,
                                              schedule.currency,
                                            )}
                                          </strong>
                                          <span
                                            className={`spp-small-status spp-small-status-${schedule.status.toLowerCase()}`}
                                          >
                                            {
                                              schedule.status_display
                                            }
                                          </span>
                                        </div>
                                      </div>
                                    ),
                                  )}
                              </div>
                            )}
                          </section>

                          <section>
                            <div className="spp-section-title">
                              <FiCreditCard
                                size={16}
                              />
                              Payment history
                            </div>

                            {agreement
                              .payments
                              .length ===
                            0 ? (
                              <p className="spp-empty-copy">
                                No payments
                                have been
                                recorded.
                              </p>
                            ) : (
                              <div className="spp-payment-list">
                                {[...agreement.payments]
                                  .sort(
                                    (
                                      left,
                                      right,
                                    ) =>
                                      new Date(
                                        right.created_at,
                                      ).getTime() -
                                      new Date(
                                        left.created_at,
                                      ).getTime(),
                                  )
                                  .map(
                                    (
                                      payment,
                                    ) => (
                                      <div
                                        key={
                                          payment.id
                                        }
                                        className="spp-payment-row"
                                      >
                                        <div>
                                          <strong>
                                            {formatMoney(
                                              payment.amount_paid,
                                              payment.currency,
                                            )}
                                          </strong>
                                          <span>
                                            {
                                              payment.payment_method_display
                                            }
                                          </span>
                                        </div>
                                        <div>
                                          <span
                                            className={`spp-small-status spp-small-status-${payment.status.toLowerCase()}`}
                                          >
                                            {
                                              payment.status_display
                                            }
                                          </span>
                                          <small>
                                            {formatDate(
                                              payment.paid_at ??
                                                payment.created_at,
                                            )}
                                          </small>
                                          {(payment.invoice_url ||
                                            payment.receipt_url) && (
                                            <div className="spp-doc-links">
                                              {payment.invoice_url && (
                                                <a
                                                  className="spp-doc-link"
                                                  href={
                                                    payment.invoice_url
                                                  }
                                                  target="_blank"
                                                  rel="noreferrer"
                                                >
                                                  Invoice
                                                </a>
                                              )}
                                              {payment.receipt_url && (
                                                <a
                                                  className="spp-doc-link"
                                                  href={
                                                    payment.receipt_url
                                                  }
                                                  target="_blank"
                                                  rel="noreferrer"
                                                >
                                                  Receipt
                                                </a>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ),
                                  )}
                              </div>
                            )}
                          </section>

                          <section>
                            <div className="spp-section-title">
                              <FiShield size={16} />
                              Revenue split
                            </div>

                            {agreement.revenue_share_rules
                              .length === 0 ? (
                              <p className="spp-empty-copy">
                                No revenue split policy has been set
                                for this agreement.
                              </p>
                            ) : (
                              <div className="spp-revenue-list">
                                {agreement.revenue_share_rules.map(
                                  (rule) => (
                                    <div
                                      key={rule.id}
                                      className="spp-revenue-row"
                                    >
                                      <div className="spp-revenue-recipient">
                                        <strong>
                                          {rule.recipient_name ||
                                            rule.recipient_type_display}
                                        </strong>
                                        <span>
                                          {rule.is_platform_share
                                            ? 'League OS platform fee'
                                            : rule.recipient_type_display}
                                        </span>
                                      </div>
                                      <strong>
                                        {Number(rule.percentage) > 0
                                          ? `${rule.percentage}%`
                                          : formatMoney(
                                              rule.fixed_amount,
                                              agreement.currency,
                                            )}
                                      </strong>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                          </section>
                        </div>

                        <div className="spp-card-footer">
                          <span>
                            Updated{' '}
                            {formatDate(
                              agreement.updated_at,
                            )}
                          </span>

                          {pendingPayment
                            ?.checkout_url ? (
                            <button
                              type="button"
                              className="spp-primary-btn"
                              onClick={() =>
                                resumeCheckout(
                                  agreement,
                                  pendingPayment,
                                )
                              }
                            >
                              Resume Flutterwave
                              checkout
                              <FiExternalLink
                                size={15}
                              />
                            </button>
                          ) : pendingPayment ? (
                            <button
                              type="button"
                              className="spp-secondary-btn"
                              disabled
                            >
                              Payment pending
                            </button>
                          ) : canPay &&
                            !agreement.signed_at ? (
                            <button
                              type="button"
                              className="spp-primary-btn"
                              onClick={() =>
                                navigate(
                                  `/sponsor/agreements/${agreement.id}/sign`,
                                )
                              }
                            >
                              <FiFileText
                                size={16}
                              />
                              Review & Sign Agreement
                            </button>
                          ) : canPay ? (
                            <button
                              type="button"
                              className="spp-primary-btn"
                              disabled={
                                initializingAgreementId ===
                                agreement.id
                              }
                              onClick={() =>
                                void beginPayment(
                                  agreement,
                                )
                              }
                            >
                              <FiCreditCard
                                size={16}
                              />
                              {initializingAgreementId ===
                              agreement.id
                                ? 'Opening checkout...'
                                : 'Pay with Flutterwave'}
                            </button>
                          ) : (
                            <span className="spp-payment-note">
                              {agreement.payment_source !==
                              'PLATFORM'
                                ? 'This agreement is paid outside League OS.'
                                : agreement.status ===
                                    'ACTIVE' &&
                                  outstandingTotal ===
                                    0
                                ? 'This agreement is fully paid.'
                                : 'Payment will be available after agreement approval.'}
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  },
                )}
              </section>
            )}
        </main>
      </div>
    </div>
  );
}
