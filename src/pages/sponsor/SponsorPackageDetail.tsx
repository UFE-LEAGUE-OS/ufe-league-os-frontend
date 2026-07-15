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
  FiMapPin,
  FiRefreshCw,
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
import './SponsorPackages.css';

function money(
  amount: string,
  currency: string,
) {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export default function SponsorPackageDetail() {
  const navigate = useNavigate();
  const { packageId } = useParams();

  const parsedPackageId =
    Number(packageId);

  const [sponsorPackage, setSponsorPackage] =
    useState<SponsorPackage | null>(
      null,
    );
  const [accounts, setAccounts] =
    useState<SponsorAccountResponse[]>(
      [],
    );
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState('');

  const [
    selectedAccountId,
    setSelectedAccountId,
  ] = useState<number | null>(null);
  const [
    selectedOpportunityId,
    setSelectedOpportunityId,
  ] = useState<number | null>(null);
  const [
    agreementType,
    setAgreementType,
  ] = useState<'CASH' | 'IN_KIND'>(
    'CASH',
  );
  const [
    paymentModel,
    setPaymentModel,
  ] = useState<
    'ONE_TIME' | 'INSTALLMENT'
  >('ONE_TIME');
  const [
    customRequirements,
    setCustomRequirements,
  ] = useState('');
  const [submitting, setSubmitting] =
    useState(false);
  const [actionError, setActionError] =
    useState('');
  const [
    createdAgreement,
    setCreatedAgreement,
  ] =
    useState<SponsorAgreement | null>(
      null,
    );

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');

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

        const packageData =
          packageResponse.data;
        const availableOpportunities =
          (
            packageData.opportunities ??
            []
          ).filter(
            (opportunity) =>
              opportunity.status ===
              'AVAILABLE',
          );

        setSponsorPackage(packageData);
        setAccounts(
          accountsResponse.data.results,
        );
        setSelectedAccountId(
          accountsResponse.data
            .results[0]?.id ?? null,
        );
        setSelectedOpportunityId(
          availableOpportunities[0]
            ?.id ?? null,
        );
      } catch {
        if (active) {
          setError(
            'We could not load this sponsorship package.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (
      Number.isInteger(
        parsedPackageId,
      ) &&
      parsedPackageId > 0
    ) {
      void load();
    } else {
      setLoading(false);
      setError(
        'The sponsorship package number is invalid.',
      );
    }

    return () => {
      active = false;
    };
  }, [parsedPackageId]);

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
    }, [accounts, sponsorPackage]);

  const selectedOpportunity =
    sponsorPackage?.opportunities?.find(
      (opportunity) =>
        opportunity.id ===
        selectedOpportunityId,
    ) ?? null;

  async function submitRequest() {
    if (
      !sponsorPackage ||
      !selectedAccountId ||
      !selectedOpportunity
    ) {
      setActionError(
        'Select a sponsor account and sports property.',
      );
      return;
    }

    setSubmitting(true);
    setActionError('');

    try {
      const response =
        await createSponsorAgreement({
          sponsor_account:
            selectedAccountId,
          sponsor_package:
            sponsorPackage.id,
          opportunity:
            selectedOpportunity.id,
          agreement_type:
            agreementType,
          payment_source:
            agreementType === 'CASH'
              ? 'PLATFORM'
              : 'IN_KIND',
          payment_model:
            agreementType === 'CASH'
              ? paymentModel
              : 'EXTERNAL',
          total_value:
            selectedOpportunity.price_amount,
          currency:
            selectedOpportunity.currency,
          starts_at:
            selectedOpportunity.starts_at,
          ends_at:
            selectedOpportunity.ends_at,
          benefits_tier:
            sponsorPackage.is_exclusive
              ? 'PREMIUM'
              : 'DIGITAL',
          notes:
            customRequirements.trim() ||
            'Sponsorship request submitted through the League OS marketplace.',
        });

      setCreatedAgreement(
        response.data.agreement,
      );
    } catch {
      setActionError(
        'The sponsorship request could not be submitted.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="spkg-page">
      <div className="spkg-layout">
        <SponsorSidebar />

        <main className="spkg-main">
          <button
            type="button"
            className="spkg-back"
            onClick={() =>
              navigate(
                '/sponsor/packages',
              )
            }
          >
            <FiArrowLeft size={16} />
            Back to Opportunities
          </button>

          {loading && (
            <div className="spkg-state">
              <FiRefreshCw
                className="spkg-spin"
                size={28}
              />
              <h2>
                Loading package details
              </h2>
            </div>
          )}

          {!loading && error && (
            <div className="spkg-state">
              <FiAlertCircle size={30} />
              <h2>
                Package unavailable
              </h2>
              <p>{error}</p>
            </div>
          )}

          {!loading &&
            !error &&
            sponsorPackage && (
              <>
                <header className="spkg-detail-header">
                  <div>
                    <span>
                      {
                        sponsorPackage.objective_display
                      }
                    </span>

                    <h1>
                      {
                        sponsorPackage.name
                      }
                    </h1>

                    <p>
                      {
                        sponsorPackage.description
                      }
                    </p>
                  </div>

                  <div className="spkg-detail-value">
                    <small>
                      Starting from
                    </small>
                    <strong>
                      {money(
                        sponsorPackage.price_amount,
                        sponsorPackage.currency,
                      )}
                    </strong>
                    <span>
                      {
                        sponsorPackage.duration_type_display
                      }
                    </span>
                  </div>
                </header>

                <div className="spkg-detail-grid">
                  <section className="spkg-detail-panel">
                    <h2>
                      Included Benefits
                    </h2>

                    <ul className="spkg-benefits">
                      {sponsorPackage.benefits.map(
                        (benefit) => (
                          <li
                            key={
                              benefit.id
                            }
                          >
                            <FiCheckCircle
                              size={16}
                            />
                            <div>
                              <strong>
                                {
                                  benefit.name
                                }
                              </strong>
                              <span>
                                {
                                  benefit.description
                                }
                              </span>
                            </div>
                          </li>
                        ),
                      )}
                    </ul>

                    <h2>
                      Choose a Sports Property
                    </h2>

                    <div className="spkg-opportunity-list">
                      {sponsorPackage.opportunities
                        ?.filter(
                          (opportunity) =>
                            opportunity.status ===
                            'AVAILABLE',
                        )
                        .map(
                          (opportunity) => (
                            <button
                              type="button"
                              key={
                                opportunity.id
                              }
                              className={`spkg-opportunity ${
                                selectedOpportunityId ===
                                opportunity.id
                                  ? 'spkg-opportunity-active'
                                  : ''
                              }`}
                              onClick={() =>
                                setSelectedOpportunityId(
                                  opportunity.id,
                                )
                              }
                            >
                              <div>
                                <strong>
                                  {
                                    opportunity.property_name
                                  }
                                </strong>
                                <span>
                                  <FiMapPin
                                    size={13}
                                  />
                                  {
                                    opportunity.location
                                  }{' '}
                                  ·{' '}
                                  {
                                    opportunity.sport_display
                                  }
                                </span>
                              </div>

                              <strong>
                                {money(
                                  opportunity.price_amount,
                                  opportunity.currency,
                                )}
                              </strong>
                            </button>
                          ),
                        )}
                    </div>
                  </section>

                  <aside className="spkg-detail-panel">
                    {createdAgreement ? (
                      <div className="spkg-request-success">
                        <FiCheckCircle
                          size={40}
                        />

                        <h2>
                          Request Submitted
                        </h2>

                        <p>
                          The selected sports
                          property must review
                          and approve the request
                          before payment becomes
                          available.
                        </p>

                        <div>
                          <span>
                            Reference
                          </span>
                          <strong>
                            {
                              createdAgreement.reference
                            }
                          </strong>
                        </div>

                        <div>
                          <span>Status</span>
                          <strong>
                            {
                              createdAgreement.status_display
                            }
                          </strong>
                        </div>

                        <button
                          type="button"
                          className="spkg-primary-btn"
                          onClick={() =>
                            navigate(
                              `/sponsor/payments?agreement=${createdAgreement.id}`,
                            )
                          }
                        >
                          View Agreements & Payments
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2>
                          Submit Sponsorship Request
                        </h2>

                        <label>
                          <span>
                            Sponsor account
                          </span>
                          <select
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
                                  }
                                </option>
                              ),
                            )}
                          </select>
                        </label>

                        <label>
                          <span>
                            Sponsorship type
                          </span>
                          <select
                            value={
                              agreementType
                            }
                            onChange={(
                              event,
                            ) =>
                              setAgreementType(
                                event.target
                                  .value as
                                  | 'CASH'
                                  | 'IN_KIND',
                              )
                            }
                          >
                            <option value="CASH">
                              Cash sponsorship
                            </option>
                            <option value="IN_KIND">
                              In-kind support
                            </option>
                          </select>
                        </label>

                        {agreementType ===
                          'CASH' && (
                          <label>
                            <span>
                              Payment preference
                            </span>
                            <select
                              value={
                                paymentModel
                              }
                              onChange={(
                                event,
                              ) =>
                                setPaymentModel(
                                  event.target
                                    .value as
                                    | 'ONE_TIME'
                                    | 'INSTALLMENT',
                                )
                              }
                            >
                              <option value="ONE_TIME">
                                One-time payment
                              </option>
                              <option value="INSTALLMENT">
                                Instalments
                              </option>
                            </select>
                          </label>
                        )}

                        <label>
                          <span>
                            Custom requirements
                          </span>
                          <textarea
                            value={
                              customRequirements
                            }
                            onChange={(
                              event,
                            ) =>
                              setCustomRequirements(
                                event.target
                                  .value,
                              )
                            }
                            placeholder="Describe any custom activation, hospitality or delivery requirements."
                          />
                        </label>

                        {selectedOpportunity && (
                          <div className="spkg-request-summary">
                            <span>
                              Proposed value
                            </span>
                            <strong>
                              {money(
                                selectedOpportunity.price_amount,
                                selectedOpportunity.currency,
                              )}
                            </strong>
                          </div>
                        )}

                        {actionError && (
                          <div className="spkg-action-error">
                            <FiAlertCircle
                              size={16}
                            />
                            {actionError}
                          </div>
                        )}

                        <button
                          type="button"
                          className="spkg-primary-btn"
                          disabled={
                            submitting ||
                            !selectedOpportunity ||
                            !selectedAccountId
                          }
                          onClick={() =>
                            void submitRequest()
                          }
                        >
                          <FiCreditCard
                            size={16}
                          />
                          {submitting
                            ? 'Submitting request...'
                            : 'Submit Sponsorship Request'}
                        </button>
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
