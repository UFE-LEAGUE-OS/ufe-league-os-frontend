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
  FiFilter,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiTarget,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import {
  getSponsorPackages,
  type SponsorPackage,
  type SponsorPackageDuration,
  type SponsorPackageObjective,
  type SponsorPackageSport,
} from '../../services/sponsorshipService';
import './SponsorPackages.css';

const objectives: Array<{
  value: 'ALL' | SponsorPackageObjective;
  label: string;
}> = [
  { value: 'ALL', label: 'All objectives' },
  { value: 'VISIBILITY', label: 'Visibility' },
  {
    value: 'FAN_ENGAGEMENT',
    label: 'Fan Engagement',
  },
  {
    value: 'HOSPITALITY',
    label: 'Hospitality',
  },
  {
    value: 'COMMUNITY_IMPACT',
    label: 'Community Impact',
  },
  {
    value: 'GRASSROOTS',
    label: 'Grassroots Development',
  },
];

const sports: Array<{
  value: 'ALL' | SponsorPackageSport;
  label: string;
}> = [
  { value: 'ALL', label: 'All sports' },
  { value: 'GENERAL', label: 'All Sports' },
  { value: 'RUGBY', label: 'Rugby' },
  { value: 'FOOTBALL', label: 'Football' },
  { value: 'BASKETBALL', label: 'Basketball' },
  {
    value: 'COMMUNITY',
    label: 'Community Sport',
  },
];

const durations: Array<{
  value: 'ALL' | SponsorPackageDuration;
  label: string;
}> = [
  { value: 'ALL', label: 'Any duration' },
  { value: 'ONE_MATCH', label: 'One Match' },
  { value: 'ONE_EVENT', label: 'One Event' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'SEASON', label: 'Season-long' },
];

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

export default function SponsorPackages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [packages, setPackages] =
    useState<SponsorPackage[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState('');
  const [reloadKey, setReloadKey] =
    useState(0);

  const [query, setQuery] =
    useState('');
  const [objective, setObjective] =
    useState<
      'ALL' | SponsorPackageObjective
    >(() => {
      const requested =
        searchParams.get('objective');

      return objectives.some(
        (item) => item.value === requested,
      )
        ? (requested as
            | 'ALL'
            | SponsorPackageObjective)
        : 'ALL';
    });
  const [sport, setSport] =
    useState<
      'ALL' | SponsorPackageSport
    >('ALL');
  const [duration, setDuration] =
    useState<
      'ALL' | SponsorPackageDuration
    >('ALL');
  const [propertyType, setPropertyType] =
    useState('ALL');
  const [maxBudget, setMaxBudget] =
    useState('ALL');

  useEffect(() => {
    let active = true;

    async function loadPackages() {
      setLoading(true);
      setError('');

      try {
        const response =
          await getSponsorPackages({
            is_template: true,
          });

        if (!active) {
          return;
        }

        setPackages(
          response.data.results,
        );
      } catch {
        if (active) {
          setError(
            'We could not load sponsorship opportunities.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPackages();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const filteredPackages =
    useMemo(() => {
      const normalized =
        query.trim().toLowerCase();

      return packages.filter(
        (item) => {
          const matchesQuery =
            !normalized ||
            [
              item.name,
              item.description,
              item.objective_display,
              item.sport_display,
              ...(item.opportunities ?? []).map(
                (opportunity) =>
                  opportunity.property_name,
              ),
            ].some((value) =>
              value
                .toLowerCase()
                .includes(normalized),
            );

          const matchesObjective =
            objective === 'ALL' ||
            item.objective === objective;

          const matchesSport =
            sport === 'ALL' ||
            item.sport === sport ||
            item.sport === 'GENERAL' ||
            item.opportunities?.some(
              (opportunity) =>
                opportunity.sport === sport,
            );

          const matchesDuration =
            duration === 'ALL' ||
            item.duration_type ===
              duration;

          const matchesProperty =
            propertyType === 'ALL' ||
            item.opportunities?.some(
              (opportunity) =>
                opportunity.property_type ===
                propertyType,
            );

          const startingPrice =
            Math.min(
              ...(
                item.opportunities?.map(
                  (opportunity) =>
                    Number(
                      opportunity.price_amount,
                    ),
                ) ?? []
              ),
              Number(item.price_amount),
            );

          const matchesBudget =
            maxBudget === 'ALL' ||
            startingPrice <=
              Number(maxBudget);

          return (
            matchesQuery &&
            matchesObjective &&
            matchesSport &&
            matchesDuration &&
            matchesProperty &&
            matchesBudget
          );
        },
      );
    }, [
      duration,
      maxBudget,
      objective,
      packages,
      propertyType,
      query,
      sport,
    ]);

  return (
    <div className="spkg-page">
      <div className="spkg-layout">
        <SponsorSidebar />

        <main className="spkg-main">
          <header className="spkg-header">
            <div>
              <div className="spkg-eyebrow">
                Sponsorship marketplace
              </div>

              <h1>
                Discover Opportunities
              </h1>

              <p>
                Start with a neutral
                package, then choose the
                club, competition, event,
                match or digital property
                you want to support.
              </p>
            </div>

            <button
              type="button"
              className="spkg-secondary-btn"
              onClick={() =>
                setReloadKey(
                  (value) => value + 1,
                )
              }
            >
              <FiRefreshCw size={16} />
              Refresh
            </button>
          </header>

          <section className="spkg-filters">
            <div className="spkg-search">
              <FiSearch size={16} />
              <input
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value,
                  )
                }
                placeholder="Search packages or sports properties"
              />
            </div>

            <label>
              <span>Objective</span>
              <select
                value={objective}
                onChange={(event) =>
                  setObjective(
                    event.target
                      .value as
                      | 'ALL'
                      | SponsorPackageObjective,
                  )
                }
              >
                {objectives.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              <span>Sport</span>
              <select
                value={sport}
                onChange={(event) =>
                  setSport(
                    event.target
                      .value as
                      | 'ALL'
                      | SponsorPackageSport,
                  )
                }
              >
                {sports.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Property</span>
              <select
                value={propertyType}
                onChange={(event) =>
                  setPropertyType(
                    event.target.value,
                  )
                }
              >
                <option value="ALL">
                  All properties
                </option>
                <option value="CLUB">
                  Clubs
                </option>
                <option value="TEAM">
                  Teams
                </option>
                <option value="COMPETITION">
                  Competitions
                </option>
                <option value="MATCH">
                  Matches
                </option>
                <option value="EVENT">
                  Events
                </option>
                <option value="UNION">
                  Unions
                </option>
                <option value="PLATFORM">
                  League OS Digital
                </option>
              </select>
            </label>

            <label>
              <span>Duration</span>
              <select
                value={duration}
                onChange={(event) =>
                  setDuration(
                    event.target
                      .value as
                      | 'ALL'
                      | SponsorPackageDuration,
                  )
                }
              >
                {durations.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              <span>Maximum budget</span>
              <select
                value={maxBudget}
                onChange={(event) =>
                  setMaxBudget(
                    event.target.value,
                  )
                }
              >
                <option value="ALL">
                  Any budget
                </option>
                <option value="2000000">
                  Up to UGX 2M
                </option>
                <option value="5000000">
                  Up to UGX 5M
                </option>
                <option value="15000000">
                  Up to UGX 15M
                </option>
                <option value="30000000">
                  Up to UGX 30M
                </option>
              </select>
            </label>
          </section>

          <div className="spkg-result-title">
            <FiFilter size={15} />
            {filteredPackages.length}{' '}
            package
            {filteredPackages.length === 1
              ? ''
              : 's'}{' '}
            available
          </div>

          {loading && (
            <div className="spkg-state">
              <FiRefreshCw
                className="spkg-spin"
                size={28}
              />
              <h2>
                Loading opportunities
              </h2>
            </div>
          )}

          {!loading && error && (
            <div className="spkg-state">
              <FiAlertCircle size={30} />
              <h2>
                Opportunities unavailable
              </h2>
              <p>{error}</p>
            </div>
          )}

          {!loading &&
            !error &&
            filteredPackages.length ===
              0 && (
              <div className="spkg-state">
                <FiTarget size={30} />
                <h2>
                  No matching opportunities
                </h2>
                <p>
                  Adjust the objective,
                  sport, property or
                  budget filters.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            filteredPackages.length >
              0 && (
              <section className="spkg-grid">
                {filteredPackages.map(
                  (item) => (
                    <article
                      key={item.id}
                      className="spkg-card"
                    >
                      <div className="spkg-card-top">
                        <span>
                          {
                            item.objective_display
                          }
                        </span>

                        {item.is_exclusive && (
                          <strong>
                            Negotiated
                          </strong>
                        )}
                      </div>

                      <h2>{item.name}</h2>

                      <p>
                        {item.description}
                      </p>

                      <div className="spkg-meta">
                        <span>
                          {item.sport_display}
                        </span>
                        <span>
                          {
                            item.duration_type_display
                          }
                        </span>
                      </div>

                      <div className="spkg-price">
                        <small>
                          Starting from
                        </small>
                        <strong>
                          {money(
                            item.price_amount,
                            item.currency,
                          )}
                        </strong>
                      </div>

                      <div className="spkg-property-count">
                        <FiMapPin size={15} />
                        {
                          item.opportunities
                            ?.length
                        }{' '}
                        available sports
                        propert
                        {item.opportunities
                          ?.length === 1
                          ? 'y'
                          : 'ies'}
                      </div>

                      <ul>
                        {item.benefits
                          .slice(0, 4)
                          .map((benefit) => (
                            <li
                              key={
                                benefit.id
                              }
                            >
                              <FiCheckCircle
                                size={14}
                              />
                              {benefit.name}
                            </li>
                          ))}
                      </ul>

                      <button
                        type="button"
                        className="spkg-primary-btn"
                        onClick={() =>
                          navigate(
                            `/sponsor/packages/${item.id}`,
                          )
                        }
                      >
                        View Opportunities
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
