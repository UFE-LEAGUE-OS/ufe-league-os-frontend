import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronRight,
  FiInfo,
  FiRefreshCw,
  FiSearch,
  FiStar,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import {
  getSponsorPackages,
  type SponsorPackage,
} from '../../services/sponsorshipService';
import '../../styles/pages/landing.css';
import './SponsorPackages.css';

type PackageFilter =
  | 'All'
  | 'Popular'
  | 'Clubs'
  | 'Leagues'
  | 'Events'
  | 'Athletes';

type ApiErrorShape = {
  response?: {
    data?: unknown;
  };
};

const filterTabs: PackageFilter[] = [
  'All',
  'Popular',
  'Clubs',
  'Leagues',
  'Events',
  'Athletes',
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

function packageIcon(
  sponsorPackage: SponsorPackage,
) {
  switch (sponsorPackage.scope_type) {
    case 'PLAYER':
      return '🏅';
    case 'TEAM':
      return '👥';
    case 'CLUB':
      return '🛡️';
    case 'LEAGUE':
    case 'COMPETITION':
      return '🏆';
    case 'EVENT':
    case 'MATCH':
      return '🎟️';
    case 'UNION':
      return '🏛️';
    case 'SPORT':
      return '⚽';
    default:
      return '⭐';
  }
}

function matchesFilter(
  sponsorPackage: SponsorPackage,
  filter: PackageFilter,
) {
  if (filter === 'All') {
    return true;
  }

  if (filter === 'Popular') {
    return sponsorPackage.is_exclusive;
  }

  if (filter === 'Clubs') {
    return (
      sponsorPackage.owner_type ===
        'CLUB' ||
      sponsorPackage.scope_type ===
        'CLUB' ||
      sponsorPackage.scope_type ===
        'TEAM'
    );
  }

  if (filter === 'Leagues') {
    return (
      sponsorPackage.owner_type ===
        'LEAGUE' ||
      sponsorPackage.scope_type ===
        'LEAGUE' ||
      sponsorPackage.scope_type ===
        'COMPETITION'
    );
  }

  if (filter === 'Events') {
    return (
      sponsorPackage.scope_type ===
        'EVENT' ||
      sponsorPackage.scope_type ===
        'MATCH'
    );
  }

  return (
    sponsorPackage.scope_type ===
    'PLAYER'
  );
}

export default function SponsorPackages() {
  const navigate = useNavigate();

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<PackageFilter>('All');

  const [search, setSearch] =
    useState('');

  const [
    packages,
    setPackages,
  ] = useState<SponsorPackage[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [reloadKey, setReloadKey] =
    useState(0);

  useEffect(() => {
    let active = true;

    const loadPackages = async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await getSponsorPackages();

        if (!active) {
          return;
        }

        setPackages(
          response.data.results,
        );
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          getApiErrorMessage(
            loadError,
            'We could not load sponsorship packages.',
          ),
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadPackages();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const filteredPackages =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return packages.filter(
        (sponsorPackage) => {
          if (
            !matchesFilter(
              sponsorPackage,
              activeFilter,
            )
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          return [
            sponsorPackage.name,
            sponsorPackage.description,
            sponsorPackage.owner_name,
            sponsorPackage.scope_name,
            sponsorPackage.category_display,
          ]
            .filter(Boolean)
            .some((value) =>
              value
                .toLowerCase()
                .includes(query),
            );
        },
      );
    }, [
      activeFilter,
      packages,
      search,
    ]);

  return (
    <div className="spkg-page">
      <div className="spkg-layout">
        <SponsorSidebar />

        <main className="spkg-main landing-page">
          <div className="spkg-header">
            <div className="spkg-header-left">
              <h1 className="spkg-title">
                Sponsor Packages
              </h1>

              <p className="spkg-subtitle">
                Explore approved sponsorship
                opportunities across the League
                OS ecosystem.
              </p>
            </div>

            <div className="spkg-header-right">
              <div className="spkg-search-wrap">
                <FiSearch
                  size={15}
                  className="spkg-search-icon"
                />

                <input
                  className="spkg-search"
                  type="search"
                  placeholder="Search packages..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                />
              </div>

              <button
                type="button"
                className="spkg-compare-btn"
                onClick={() =>
                  setReloadKey(
                    (current) =>
                      current + 1,
                  )
                }
                disabled={loading}
              >
                <FiRefreshCw size={15} />
                Refresh Packages
              </button>
            </div>
          </div>

          <div className="spkg-filter-tabs">
            {filterTabs.map((tab) => (
              <button
                type="button"
                key={tab}
                className={
                  `spkg-filter-tab ${
                    activeFilter === tab
                      ? 'spkg-filter-active'
                      : ''
                  }`
                }
                onClick={() =>
                  setActiveFilter(tab)
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {loading && (
            <div className="spkg-state-card">
              <FiRefreshCw
                size={28}
                className="spkg-state-spinner"
              />

              <h2>
                Loading sponsor packages
              </h2>

              <p>
                Fetching the latest approved
                opportunities.
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="spkg-state-card">
              <FiAlertCircle size={30} />

              <h2>
                Packages could not be loaded
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
            filteredPackages.length ===
              0 && (
              <div className="spkg-state-card">
                <FiInfo size={30} />

                <h2>
                  No packages found
                </h2>

                <p>
                  No sponsorship packages match
                  the current search and filter.
                </p>

                <button
                  type="button"
                  className="spkg-btn pkg-btn-purple spkg-state-action"
                  onClick={() => {
                    setSearch('');
                    setActiveFilter('All');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}

          {!loading &&
            !error &&
            filteredPackages.length >
              0 && (
              <div className="spkg-cards-grid">
                {filteredPackages.map(
                  (
                    sponsorPackage,
                    index,
                  ) => {
                    const highlighted =
                      sponsorPackage.is_exclusive;

                    const orange =
                      highlighted ||
                      index % 4 === 1;

                    return (
                      <article
                        key={
                          sponsorPackage.id
                        }
                        className={
                          `spkg-card ${
                            highlighted
                              ? 'spkg-card-gold'
                              : ''
                          }`
                        }
                      >
                        {highlighted && (
                          <div className="spkg-popular-badge">
                            <FiStar size={11} />
                            Exclusive
                          </div>
                        )}

                        <div className="spkg-card-top">
                          <div
                            className={
                              `spkg-pkg-icon ${
                                orange
                                  ? 'pkg-icon-orange'
                                  : 'pkg-icon-grey'
                              }`
                            }
                          >
                            <span className="spkg-pkg-emoji">
                              {packageIcon(
                                sponsorPackage,
                              )}
                            </span>
                          </div>

                          <div>
                            <div className="spkg-tier-label">
                              {
                                sponsorPackage
                                  .scope_type_display
                              }
                            </div>

                            <div className="spkg-tier-name">
                              {
                                sponsorPackage.name
                              }
                            </div>
                          </div>
                        </div>

                        <div className="spkg-price-row">
                          <span
                            className={
                              `spkg-currency ${
                                orange
                                  ? 'pkg-price-orange'
                                  : 'pkg-price-purple'
                              }`
                            }
                          >
                            {
                              sponsorPackage.currency
                            }
                          </span>

                          <span
                            className={
                              `spkg-price ${
                                orange
                                  ? 'pkg-price-orange'
                                  : 'pkg-price-purple'
                              }`
                            }
                          >
                            {formatAmount(
                              sponsorPackage.price_amount,
                            )}
                          </span>
                        </div>

                        <div className="spkg-per-year">
                          {
                            sponsorPackage.owner_name
                          }
                        </div>

                        <p className="spkg-desc">
                          {
                            sponsorPackage.description ||
                            `Sponsor ${sponsorPackage.scope_name}.`
                          }
                        </p>

                        <div className="spkg-divider" />

                        <ul className="spkg-features">
                          {sponsorPackage
                            .benefits.length >
                          0 ? (
                            sponsorPackage.benefits
                              .slice(0, 6)
                              .map((benefit) => (
                                <li
                                  key={
                                    benefit.id
                                  }
                                  className="spkg-feature-item"
                                >
                                  <FiCheckCircle
                                    size={15}
                                    className={
                                      `spkg-check ${
                                        orange
                                          ? 'pkg-check-orange'
                                          : 'pkg-check-purple'
                                      }`
                                    }
                                  />

                                  <span>
                                    {
                                      benefit.name
                                    }
                                  </span>
                                </li>
                              ))
                          ) : (
                            <li className="spkg-feature-item">
                              <FiCheckCircle
                                size={15}
                                className="spkg-check pkg-check-purple"
                              />

                              <span>
                                {
                                  sponsorPackage.activation_rule_display
                                }
                              </span>
                            </li>
                          )}
                        </ul>

                        <button
                          type="button"
                          className={
                            `spkg-btn ${
                              orange
                                ? 'pkg-btn-orange'
                                : 'pkg-btn-purple'
                            }`
                          }
                          onClick={() =>
                            navigate(
                              `/sponsor/packages/${sponsorPackage.id}`,
                            )
                          }
                        >
                          View Details
                        </button>
                      </article>
                    );
                  },
                )}
              </div>
            )}

          <div className="spkg-bottom-banner">
            <FiInfo
              size={16}
              className="spkg-banner-icon"
            />

            <p className="spkg-banner-text">
              Sponsorship packages are created
              and approved by clubs, leagues,
              unions and League OS administrators.
            </p>

            <button
              type="button"
              className="spkg-talk-btn"
              onClick={() =>
                navigate('/support')
              }
            >
              Talk to Sponsorship Team
              <FiChevronRight size={14} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
