import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiCreditCard,
  FiRefreshCw,
  FiShield,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import {
  createSponsorAgreement,
  getSponsorAccounts,
  getSponsorPackage,
  type SponsorAccountResponse,
  type SponsorAgreement,
  type SponsorPackage,
} from '../../services/sponsorshipService';
import '../../styles/pages/landing.css';
import './SponsorPackages.css';

type ApiErrorShape = {
  response?: {
    data?: unknown;
  };
};

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

function formatAmount(
  value: string,
) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return value;
  }

  return new Intl.NumberFormat(
    'en-UG',
    {
      maximumFractionDigits: 0,
    },
  ).format(amount);
}

export default function SponsorPackageDetail() {
  const navigate = useNavigate();
  const { packageId } = useParams();

  const parsedPackageId =
    Number.parseInt(
      packageId ?? '',
      10,
    );

  const validPackageId =
    Number.isInteger(parsedPackageId) &&
    parsedPackageId > 0;

  const [
    sponsorPackage,
    setSponsorPackage,
  ] =
    useState<SponsorPackage | null>(
      null,
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
    createdAgreement,
    setCreatedAgreement,
  ] =
    useState<SponsorAgreement | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [reloadKey, setReloadKey] =
    useState(0);

  useEffect(() => {
    let active = true;

    if (!validPackageId) {
      setError(
        'The selected sponsorship package is invalid.',
      );
      setLoading(false);

      return () => {
        active = false;
      };
    }

    const loadDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          packageResponse,
          accountsResponse,
        ] = await Promise.all([
          getSponsorPackage(
            parsedPackageId,
          ),
          getSponsorAccounts(),
        ]);

        if (!active) {
          return;
        }

        setSponsorPackage(
          packageResponse.data,
        );

        setAccounts(
          accountsResponse.data.results,
        );
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          getApiErrorMessage(
            loadError,
            'The sponsorship package could not be loaded.',
          ),
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadDetail();

    return () => {
      active = false;
    };
  }, [
    parsedPackageId,
    reloadKey,
    validPackageId,
  ]);

  const eligibleAccounts =
    useMemo(() => {
      if (!sponsorPackage) {
        return [];
      }

      return accounts.filter(
        (account) =>
          account.status !==
            'REJECTED' &&
          (
            sponsorPackage.sponsor_type_allowed ===
              'BOTH' ||
            sponsorPackage.sponsor_type_allowed ===
              account.sponsor_type
          ),
      );
    }, [
      accounts,
      sponsorPackage,
    ]);

  useEffect(() => {
    if (
      selectedAccountId === null &&
      eligibleAccounts.length > 0
    ) {
      setSelectedAccountId(
        eligibleAccounts[0].id,
      );
    }
  }, [
    eligibleAccounts,
    selectedAccountId,
  ]);

  const handleCreateAgreement =
    async () => {
      if (
        !sponsorPackage ||
        selectedAccountId === null
      ) {
        return;
      }

      setSubmitting(true);
      setActionError(null);

      try {
        const response =
          await createSponsorAgreement({
            sponsor_account:
              selectedAccountId,
            sponsor_package:
              sponsorPackage.id,
            agreement_type: 'CASH',
            payment_source: 'PLATFORM',
            payment_model: 'ONE_TIME',
            total_value:
              sponsorPackage.price_amount,
            currency:
              sponsorPackage.currency,
            benefits_tier:
              sponsorPackage.is_exclusive
                ? 'PREMIUM'
                : 'DIGITAL',
            notes:
              'Agreement requested through the League OS sponsor package page.',
          });

        setCreatedAgreement(
          response.data.agreement,
        );
      } catch (submitError) {
        setActionError(
          getApiErrorMessage(
            submitError,
            'The sponsorship agreement could not be created.',
          ),
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <div className="spkg-page">
      <div className="spkg-layout">
        <SponsorSidebar />

        <main className="spkg-main landing-page">
          <button
            type="button"
            className="spkg-detail-back"
            onClick={() =>
              navigate('/sponsor/packages')
            }
          >
            <FiArrowLeft size={16} />
            Back to Packages
          </button>

          {loading && (
            <div className="spkg-state-card">
              <FiRefreshCw
                size={30}
                className="spkg-state-spinner"
              />

              <h2>
                Loading package details
              </h2>

              <p>
                Fetching the sponsorship offer
                and your sponsor accounts.
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="spkg-state-card">
              <FiAlertCircle size={30} />

              <h2>
                Package could not be loaded
              </h2>

              <p>{error}</p>

              <button
                type="button"
                className="spkg-btn pkg-btn-purple spkg-state-action"
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
            sponsorPackage && (
              <>
                <section className="spkg-detail-hero">
                  <div>
                    <div className="spkg-detail-kicker">
                      {
                        sponsorPackage.scope_type_display
                      }
                    </div>

                    <h1 className="spkg-title">
                      {sponsorPackage.name}
                    </h1>

                    <p className="spkg-detail-description">
                      {
                        sponsorPackage.description ||
                        `Sponsor ${sponsorPackage.scope_name}.`
                      }
                    </p>

                    <div className="spkg-detail-badges">
                      <span>
                        {
                          sponsorPackage.status_display
                        }
                      </span>

                      <span>
                        {
                          sponsorPackage.sponsor_type_allowed_display
                        }{' '}
                        sponsors
                      </span>

                      {sponsorPackage.is_exclusive && (
                        <span>
                          Exclusive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="spkg-detail-price-card">
                    <div>
                      Package Value
                    </div>

                    <strong>
                      {
                        sponsorPackage.currency
                      }{' '}
                      {formatAmount(
                        sponsorPackage.price_amount,
                      )}
                    </strong>

                    <span>
                      {
                        sponsorPackage.activation_rule_display
                      }
                    </span>
                  </div>
                </section>

                <div className="spkg-detail-grid">
                  <section className="spkg-detail-panel">
                    <h2>
                      Package Information
                    </h2>

                    <dl className="spkg-detail-list">
                      <div>
                        <dt>Offered by</dt>
                        <dd>
                          {
                            sponsorPackage.owner_name
                          }
                        </dd>
                      </div>

                      <div>
                        <dt>Scope</dt>
                        <dd>
                          {
                            sponsorPackage.scope_name
                          }
                        </dd>
                      </div>

                      <div>
                        <dt>Category</dt>
                        <dd>
                          {
                            sponsorPackage.category_display
                          }
                        </dd>
                      </div>

                      <div>
                        <dt>Platform fee</dt>
                        <dd>
                          {sponsorPackage.requires_platform_fee
                            ? `${sponsorPackage.currency} ${formatAmount(
                                sponsorPackage.platform_fee_amount,
                              )}`
                            : 'Not required'}
                        </dd>
                      </div>
                    </dl>

                    <h2>
                      Included Benefits
                    </h2>

                    {sponsorPackage
                      .benefits.length >
                    0 ? (
                      <ul className="spkg-detail-benefits">
                        {sponsorPackage.benefits.map(
                          (benefit) => (
                            <li key={benefit.id}>
                              <FiCheckCircle
                                size={17}
                              />

                              <div>
                                <strong>
                                  {
                                    benefit.name
                                  }
                                </strong>

                                {benefit.description && (
                                  <span>
                                    {
                                      benefit.description
                                    }
                                  </span>
                                )}
                              </div>
                            </li>
                          ),
                        )}
                      </ul>
                    ) : (
                      <p className="spkg-detail-muted">
                        Detailed benefits have
                        not yet been added to
                        this package.
                      </p>
                    )}
                  </section>

                  <aside className="spkg-detail-panel spkg-detail-action-panel">
                    {createdAgreement ? (
                      <div className="spkg-detail-success">
                        <FiCheckCircle
                          size={38}
                        />

                        <h2>
                          Agreement Created
                        </h2>

                        <p>
                          Your sponsorship
                          request has been
                          recorded successfully.
                        </p>

                        <div className="spkg-detail-reference">
                          <span>
                            Reference
                          </span>

                          <strong>
                            {
                              createdAgreement.reference ||
                              `Agreement #${createdAgreement.id}`
                            }
                          </strong>
                        </div>

                        <div className="spkg-detail-reference">
                          <span>Status</span>

                          <strong>
                            {
                              createdAgreement.status_display
                            }
                          </strong>
                        </div>

                        <button
                          type="button"
                          className="spkg-btn pkg-btn-purple"
                          onClick={() =>
                            navigate(
                              `/sponsor/dashboard?agreement=${createdAgreement.id}`,
                            )
                          }
                        >
                          Go to Sponsor Dashboard
                        </button>
                      </div>
                    ) : (
                      <>
                        <FiShield
                          size={32}
                          className="spkg-detail-action-icon"
                        />

                        <h2>
                          Start Sponsorship
                        </h2>

                        <p className="spkg-detail-muted">
                          Select the sponsor
                          account that will enter
                          this agreement.
                        </p>

                        {eligibleAccounts.length >
                        0 ? (
                          <>
                            <label
                              className="spkg-detail-label"
                              htmlFor="sponsor-account"
                            >
                              Sponsor Account
                            </label>

                            <select
                              id="sponsor-account"
                              aria-label="Sponsor account"
                              className="spkg-detail-select"
                              value={
                                selectedAccountId ??
                                ''
                              }
                              onChange={(
                                event,
                              ) =>
                                setSelectedAccountId(
                                  Number(
                                    event
                                      .target
                                      .value,
                                  ),
                                )
                              }
                            >
                              {eligibleAccounts.map(
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

                            {actionError && (
                              <div className="spkg-detail-error">
                                <FiAlertCircle
                                  size={16}
                                />
                                {actionError}
                              </div>
                            )}

                            <button
                              type="button"
                              className="spkg-btn pkg-btn-orange"
                              onClick={() =>
                                void handleCreateAgreement()
                              }
                              disabled={
                                submitting
                              }
                            >
                              <FiCreditCard
                                size={16}
                              />

                              {submitting
                                ? 'Creating Agreement...'
                                : 'Start Sponsorship'}
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="spkg-detail-error">
                              <FiAlertCircle
                                size={16}
                              />
                              You do not have an
                              eligible sponsor
                              account for this
                              package.
                            </div>

                            <button
                              type="button"
                              className="spkg-btn pkg-btn-purple"
                              onClick={() =>
                                navigate(
                                  '/sponsorhub',
                                )
                              }
                            >
                              Create Sponsor Account
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </aside>
                </div>
              </>
            )}
        </main>
      </div>
    </div>
  );
}
