import {
  useEffect,
  useState,
} from 'react';
import {
  useNavigate,
} from 'react-router-dom';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiTag,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import {
  getSponsorAccounts,
  getSponsorAgreements,
  type SponsorAgreement,
} from '../../services/sponsorshipService';
import './SponsorCampaigns.css';

function date(value: string | null) {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat(
    'en-UG',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  ).format(new Date(value));
}

export default function SponsorCampaigns() {
  const navigate = useNavigate();

  const [agreements, setAgreements] =
    useState<SponsorAgreement[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const accountsResponse =
          await getSponsorAccounts();

        const account =
          accountsResponse.data
            .results[0];

        if (!account) {
          return;
        }

        const agreementResponse =
          await getSponsorAgreements({
            sponsor_account:
              account.id,
          });

        if (active) {
          setAgreements(
            agreementResponse.data
              .results,
          );
        }
      } catch {
        if (active) {
          setError(
            'We could not load sponsorship activations.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="sc-page">
      <div className="sc-layout">
        <SponsorSidebar />

        <main className="sc-main">
          <header className="sc-header">
            <div>
              <span>
                Benefit delivery
              </span>
              <h1>Activations</h1>
              <p>
                Track approved sponsorships,
                delivery periods and the
                benefits attached to each
                partnership.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/sponsor/packages',
                )
              }
            >
              <FiTag size={16} />
              Discover Opportunities
            </button>
          </header>

          {loading && (
            <div className="sc-state">
              <FiRefreshCw
                className="sc-spin"
                size={28}
              />
              <h2>
                Loading activations
              </h2>
            </div>
          )}

          {!loading && error && (
            <div className="sc-state">
              <FiAlertCircle
                size={28}
              />
              <h2>
                Activations unavailable
              </h2>
              <p>{error}</p>
            </div>
          )}

          {!loading &&
            !error &&
            agreements.length === 0 && (
              <div className="sc-state">
                <FiTag size={28} />
                <h2>
                  No sponsorships yet
                </h2>
                <p>
                  Discover an opportunity
                  and submit your first
                  sponsorship request.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            agreements.length > 0 && (
              <section className="sc-grid">
                {agreements.map(
                  (agreement) => (
                    <article
                      key={agreement.id}
                      className="sc-card"
                    >
                      <div className="sc-card-top">
                        <span>
                          {
                            agreement
                              .status_display
                          }
                        </span>

                        {agreement.status ===
                          'ACTIVE' && (
                          <FiCheckCircle
                            size={18}
                          />
                        )}
                      </div>

                      <h2>
                        {
                          agreement
                            .sponsor_package_detail
                            .name
                        }
                      </h2>

                      <p>
                        {
                          agreement
                            .opportunity_detail
                            ?.property_name ??
                          'Sports property pending selection'
                        }
                      </p>

                      <div className="sc-dates">
                        <FiClock size={15} />
                        {date(
                          agreement.starts_at,
                        )}{' '}
                        –{' '}
                        {date(
                          agreement.ends_at,
                        )}
                      </div>

                      <div className="sc-benefits">
                        <span>
                          Benefits promised
                        </span>
                        <strong>
                          {
                            agreement
                              .sponsor_package_detail
                              .benefits.length
                          }
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/sponsor/payments?agreement=${agreement.id}`,
                          )
                        }
                      >
                        View Agreement
                      </button>
                    </article>
                  ),
                )}
              </section>
            )}
        </main>
      </div>
    </div>
  );
}
