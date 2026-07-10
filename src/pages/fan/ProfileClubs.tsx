import {
  Bell,
  CalendarDays,
  Check,
  Crown,
  Heart,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Ticket,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SafeImage from '../../components/SafeImage/SafeImage';
import {
  followClub,
  getMyFollows,
  type FollowApi,
  unfollowClub,
} from '../../services/accountFollowService';
import { getMyMembership, type BackendMembershipSubscription } from '../../services/fanMembershipService';
import {
  getPublicClubs,
  getPublicFixtures,
  type PublicClubApi,
  type PublicFixtureApi,
} from '../../services/publicDashboardService';
import styles from './MyClubsPage.module.css';

const sportFilters = ['All', 'Rugby', 'Football', 'Basketball'] as const;

type SportFilter = (typeof sportFilters)[number];

type FollowedClubView = {
  club: PublicClubApi;
  follow: FollowApi;
  membershipLabel: string;
  membershipStatus: string;
  nextMatch: PublicFixtureApi | null;
};

function normalizeSport(club: PublicClubApi): SportFilter {
  const sport = (club.sport_display || club.sport || '').toLowerCase();

  if (sport.includes('rugby')) return 'Rugby';
  if (sport.includes('football')) return 'Football';
  if (sport.includes('basket')) return 'Basketball';

  return 'All';
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'LO';
}

function formatMatchDate(value?: string | null) {
  if (!value) return 'Date TBC';

  return new Intl.DateTimeFormat('en-UG', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date(value));
}

function formatMatchTime(value?: string | null) {
  if (!value) return 'Time TBC';

  return new Intl.DateTimeFormat('en-UG', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDate(value?: string | null) {
  if (!value) return 'Not yet issued';

  return new Intl.DateTimeFormat('en-UG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function isUpcomingFixture(match: PublicFixtureApi) {
  return ['SCHEDULED', 'LIVE'].includes(String(match.status).toUpperCase());
}

function getOpponentName(match: PublicFixtureApi, clubId: number) {
  return match.home_club === clubId ? match.away_club_name : match.home_club_name;
}

function getClubFixture(clubId: number, fixtures: PublicFixtureApi[]) {
  return fixtures
    .filter((match) => isUpcomingFixture(match))
    .filter((match) => match.home_club === clubId || match.away_club === clubId)
    .sort(
      (a, b) =>
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
    )[0] ?? null;
}

function getMembershipForClub(
  clubId: number,
  membership: BackendMembershipSubscription | null,
) {
  return membership?.club === clubId ? membership : null;
}

function getMembershipLabel(membership: BackendMembershipSubscription | null) {
  if (!membership) return 'Not a member';

  return membership.plan_name || 'Active membership';
}

function getMembershipStatus(membership: BackendMembershipSubscription | null) {
  if (!membership) return 'Not a member';

  return membership.status || 'Active';
}

function ProfileClubs() {
  const [clubs, setClubs] = useState<PublicClubApi[]>([]);
  const [fixtures, setFixtures] = useState<PublicFixtureApi[]>([]);
  const [clubFollows, setClubFollows] = useState<FollowApi[]>([]);
  const [membership, setMembership] =
    useState<BackendMembershipSubscription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSportFilter, setActiveSportFilter] = useState<SportFilter>('All');
  const [dismissedRecommendationIds, setDismissedRecommendationIds] = useState<number[]>([]);
  const [actionClubId, setActionClubId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfileClubs() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [clubData, fixtureData, followData, membershipData] = await Promise.all([
          getPublicClubs(),
          getPublicFixtures(),
          getMyFollows(),
          getMyMembership(),
        ]);

        if (!isMounted) return;

        setClubs(clubData);
        setFixtures(fixtureData);
        setClubFollows(followData.clubs ?? []);
        setMembership(membershipData);
      } catch (error) {
        console.error('Failed to load profile club data', error);

        if (isMounted) {
          setErrorMessage(
            'We could not load your followed clubs from the backend. Please refresh or try again later.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfileClubs();

    return () => {
      isMounted = false;
    };
  }, []);

  const clubById = useMemo(() => {
    return new Map(clubs.map((club) => [club.id, club]));
  }, [clubs]);

  const followedClubViews = useMemo<FollowedClubView[]>(() => {
    return clubFollows
      .map((follow) => {
        const club = clubById.get(follow.object_id);

        if (!club) return null;

        const clubMembership = getMembershipForClub(club.id, membership);

        return {
          club,
          follow,
          membershipLabel: getMembershipLabel(clubMembership),
          membershipStatus: getMembershipStatus(clubMembership),
          nextMatch: getClubFixture(club.id, fixtures),
        } satisfies FollowedClubView;
      })
      .filter((club): club is FollowedClubView => Boolean(club));
  }, [clubById, clubFollows, fixtures, membership]);

  const followedClubIds = useMemo(
    () => new Set(followedClubViews.map(({ club }) => club.id)),
    [followedClubViews],
  );

  const activeMemberships = useMemo(() => {
    if (!membership) return [];

    const club = clubById.get(membership.club);

    return [
      {
        id: String(membership.id),
        slug: club?.slug ?? String(membership.club),
        clubName: club?.name ?? membership.club_name,
        tier: membership.plan_name,
        sport: club ? `${normalizeSport(club)} Club` : 'Club Membership',
        status: membership.status,
        validUntil: formatDate(membership.ends_at),
        renewal: membership.ends_at ? 'Renewal managed by club policy' : 'Renewal date pending',
        logoUrl: club?.logo_url || club?.logo || null,
        benefits: [
          'Digital membership card',
          'Member ticket offers',
          'Priority club updates',
          'Fan rewards eligibility',
        ],
      },
    ];
  }, [clubById, membership]);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filteredFollowedClubs = useMemo(() => {
    return followedClubViews.filter(({ club, membershipLabel }) => {
      const sport = normalizeSport(club);
      const matchesSport = activeSportFilter === 'All' || sport === activeSportFilter;
      const searchableText = `${club.name} ${club.short_name ?? ''} ${club.sport_display ?? ''} ${club.sport ?? ''} ${membershipLabel}`;
      const matchesSearch =
        !normalizedSearchQuery ||
        searchableText.toLowerCase().includes(normalizedSearchQuery);

      return matchesSport && matchesSearch;
    });
  }, [activeSportFilter, followedClubViews, normalizedSearchQuery]);

  const upcomingClubMatches = useMemo(() => {
    return fixtures
      .filter((match) => isUpcomingFixture(match))
      .filter(
        (match) =>
          followedClubIds.has(match.home_club) || followedClubIds.has(match.away_club),
      )
      .sort(
        (a, b) =>
          new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
      )
      .slice(0, 6);
  }, [fixtures, followedClubIds]);

  const visibleRecommendations = useMemo(() => {
    return clubs
      .filter((club) => !followedClubIds.has(club.id))
      .filter((club) => !dismissedRecommendationIds.includes(club.id))
      .slice(0, 4);
  }, [clubs, dismissedRecommendationIds, followedClubIds]);

  const followedSports = useMemo(() => {
    const sports = new Set(
      followedClubViews
        .map(({ club }) => normalizeSport(club))
        .filter((sport) => sport !== 'All'),
    );

    return sports.size ? Array.from(sports).join(', ') : 'No sports selected yet';
  }, [followedClubViews]);

  const savedBenefitsCount = activeMemberships.reduce(
    (total, item) => total + item.benefits.length,
    0,
  );

  const summaryCards = [
    {
      label: 'Followed Clubs',
      value: String(followedClubViews.length),
      detail: followedSports,
      icon: ShieldCheck,
      tone: 'purple',
    },
    {
      label: 'Active Club Memberships',
      value: String(activeMemberships.length),
      detail: activeMemberships.length ? 'Digital cards ready' : 'Join from club pages',
      icon: Crown,
      tone: 'orange',
    },
    {
      label: 'Upcoming Club Matches',
      value: String(upcomingClubMatches.length),
      detail: 'From followed clubs',
      icon: CalendarDays,
      tone: 'blue',
    },
    {
      label: 'Saved Benefits',
      value: String(savedBenefitsCount),
      detail: savedBenefitsCount ? 'Ready to use' : 'Membership benefits pending',
      icon: Star,
      tone: 'green',
    },
  ];

  async function handleFollowClub(club: PublicClubApi) {
    setActionClubId(club.id);

    try {
      const follow = await followClub(club.id);
      setClubFollows((currentFollows) => {
        if (currentFollows.some((item) => item.object_id === club.id)) {
          return currentFollows;
        }

        return [...currentFollows, follow];
      });
      setDismissedRecommendationIds((currentIds) => [...currentIds, club.id]);
    } catch (error) {
      console.error('Failed to follow club', error);
      setErrorMessage(`Could not follow ${club.name}. Please try again.`);
    } finally {
      setActionClubId(null);
    }
  }

  async function handleUnfollowClub(club: PublicClubApi) {
    setActionClubId(club.id);

    try {
      await unfollowClub(club.id);
      setClubFollows((currentFollows) =>
        currentFollows.filter((follow) => follow.object_id !== club.id),
      );
    } catch (error) {
      console.error('Failed to unfollow club', error);
      setErrorMessage(`Could not unfollow ${club.name}. Please try again.`);
    } finally {
      setActionClubId(null);
    }
  }

  function clearSearch() {
    setSearchQuery('');
    setActiveSportFilter('All');
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>My Clubs</h1>
          <p>
            Follow clubs, manage club memberships, track matches and use
            club-specific fan benefits powered by backend data.
          </p>
        </div>

        <Link to="/clubs" className={styles.primaryHeaderAction}>
          <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
          Explore Clubs
        </Link>
      </header>

      <section className={styles.explainerCard}>
        <span>
          <Trophy size={34} strokeWidth={2.3} aria-hidden="true" />
        </span>

        <div>
          <h2>Your Club Hub</h2>
          <p>
            This page now reads your followed clubs, memberships and upcoming
            club matches from the backend. Use it as your personalized control
            center for club discovery and matchday activity.
          </p>
        </div>

        <Link to="/profile/interests">Manage Interests</Link>
      </section>

      {errorMessage ? (
        <div className={styles.inlineNotice} role="alert">
          {errorMessage}
        </div>
      ) : null}

      <section className={styles.summaryGrid} aria-label="Club summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              className={`${styles.summaryCard} ${styles[card.tone]}`}
              key={card.label}
            >
              <div>
                <p>{card.label}</p>
                <strong>{isLoading ? '…' : card.value}</strong>
                <span>{card.detail}</span>
              </div>

              <Icon size={38} strokeWidth={2.1} aria-hidden="true" />
            </article>
          );
        })}
      </section>

      <div className={styles.layoutGrid}>
        <main className={styles.mainColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Followed Clubs</h2>
                <p>
                  Clubs you follow affect your dashboard, news feed, fixtures and
                  ticket alerts.
                </p>
              </div>

              <Link to="/clubs">View All Clubs</Link>
            </div>

            <div className={styles.clubToolbar}>
              <div className={styles.searchCard}>
                <Search size={20} strokeWidth={2.3} aria-hidden="true" />

                <input
                  type="search"
                  placeholder="Search your followed clubs..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />

                {searchQuery ? (
                  <button type="button" onClick={() => setSearchQuery('')}>
                    <X size={17} strokeWidth={2.4} />
                  </button>
                ) : null}
              </div>

              <div className={styles.filterPills}>
                {sportFilters.map((filter) => (
                  <button
                    type="button"
                    key={filter}
                    className={
                      activeSportFilter === filter ? styles.activeFilterPill : ''
                    }
                    onClick={() => setActiveSportFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <section className={styles.emptyState}>
                <Users size={38} strokeWidth={2.2} aria-hidden="true" />
                <h2>Loading followed clubs</h2>
                <p>Fetching your backend club follows and match data.</p>
              </section>
            ) : filteredFollowedClubs.length > 0 ? (
              <div className={styles.clubGrid}>
                {filteredFollowedClubs.map(({ club, membershipLabel, nextMatch }) => (
                  <article className={styles.clubCard} key={club.id}>
                    <div className={styles.clubLogoWrap}>
                      <SafeImage
                        src={club.logo_url || club.logo}
                        alt=""
                        aria-hidden="true"
                        className={styles.logoImage}
                        fallbackClassName={`${styles.logoImage} ${styles.logoFallback}`}
                        fallback={getInitials(club.short_name || club.name)}
                      />
                    </div>

                    <div>
                      <h3>{club.name}</h3>
                      <p>{normalizeSport(club)} Club</p>
                      <span>{club.short_name || club.slug}</span>
                    </div>

                    <div className={styles.clubMembershipStatus}>
                      {membershipLabel === 'Not a member' ? (
                        <span className={styles.notMember}>Not a member</span>
                      ) : (
                        <span className={styles.memberBadge}>{membershipLabel}</span>
                      )}
                    </div>

                    {nextMatch ? (
                      <small className={styles.nextMatch}>
                        {getOpponentName(nextMatch, club.id)} • {formatMatchDate(nextMatch.match_date)}
                      </small>
                    ) : null}

                    <div className={styles.clubActions}>
                      <Link to={`/clubs/${club.slug}`}>View Club</Link>

                      {membershipLabel === 'Not a member' ? (
                        <Link to={`/memberships/${club.slug}`}>Join Club</Link>
                      ) : (
                        <Link to="/dashboard/memberships">View Membership</Link>
                      )}

                      <button
                        type="button"
                        disabled={actionClubId === club.id}
                        onClick={() => handleUnfollowClub(club)}
                      >
                        {actionClubId === club.id ? 'Saving…' : 'Unfollow'}
                      </button>
                    </div>
                  </article>
                ))}

                <Link to="/clubs" className={styles.followMoreClubCard}>
                  <span>
                    <Plus size={34} strokeWidth={2.4} aria-hidden="true" />
                  </span>

                  <div>
                    <h3>Follow More Clubs</h3>
                    <p>Discover clubs, teams and leagues to personalize your dashboard.</p>
                  </div>

                  <strong>Browse Clubs →</strong>
                </Link>
              </div>
            ) : (
              <section className={styles.emptyState}>
                <Heart size={38} strokeWidth={2.2} aria-hidden="true" />
                <h2>No clubs match your filters</h2>
                <p>
                  Try a different sport, clear your search, or browse all clubs
                  to follow more teams.
                </p>

                <div>
                  <button type="button" onClick={clearSearch}>
                    Clear Filters
                  </button>
                  <Link to="/clubs">Browse Clubs</Link>
                </div>
              </section>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Active Club Memberships</h2>
                <p>Memberships you have purchased from clubs through League OS.</p>
              </div>

              <Link to="/memberships">View Club Memberships</Link>
            </div>

            {isLoading ? (
              <section className={styles.compactEmptyState}>
                <Crown size={34} strokeWidth={2.2} aria-hidden="true" />
                <h3>Loading memberships</h3>
                <p>Checking your backend membership record.</p>
              </section>
            ) : activeMemberships.length > 0 ? (
              <div className={styles.membershipList}>
                {activeMemberships.map((item) => (
                  <article className={styles.membershipCard} key={item.id}>
                    <div className={styles.membershipTop}>
                      <SafeImage
                        src={item.logoUrl}
                        alt=""
                        aria-hidden="true"
                        className={styles.logoImage}
                        fallbackClassName={`${styles.logoImage} ${styles.logoFallback}`}
                        fallback={getInitials(item.clubName)}
                      />

                      <div>
                        <h3>{item.clubName}</h3>
                        <p>{item.sport}</p>
                      </div>

                      <span>{item.status}</span>
                    </div>

                    <div className={styles.membershipTier}>
                      <Crown size={30} strokeWidth={2.2} aria-hidden="true" />

                      <div>
                        <strong>{item.tier}</strong>
                        <p>Valid until {item.validUntil}</p>
                        <small>{item.renewal}</small>
                      </div>
                    </div>

                    <div className={styles.benefitList}>
                      {item.benefits.map((benefit) => (
                        <span key={benefit}>{benefit}</span>
                      ))}
                    </div>

                    <div className={styles.membershipActions}>
                      <Link to="/dashboard/memberships">View Card</Link>
                      <Link to={`/memberships/${item.slug}`}>Renew / Upgrade</Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <section className={styles.emptyState}>
                <Crown size={38} strokeWidth={2.2} aria-hidden="true" />
                <h2>No active memberships yet</h2>
                <p>
                  Join a club membership to unlock benefits, ticket discounts and
                  digital membership cards.
                </p>
                <Link to="/memberships">Explore Memberships</Link>
              </section>
            )}
          </section>
        </main>

        <aside className={styles.sideColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Upcoming Club Matches</h2>
                <p>Matches involving your followed clubs.</p>
              </div>

              <Link to="/fixtures">View All</Link>
            </div>

            {isLoading ? (
              <section className={styles.compactEmptyState}>
                <CalendarDays size={34} strokeWidth={2.2} aria-hidden="true" />
                <h3>Loading matches</h3>
                <p>Fetching backend fixtures for your followed clubs.</p>
              </section>
            ) : upcomingClubMatches.length > 0 ? (
              <div className={styles.matchList}>
                {upcomingClubMatches.map((match) => {
                  const followedSide = followedClubIds.has(match.home_club)
                    ? match.home_club
                    : match.away_club;
                  const followedClub = clubById.get(followedSide);

                  return (
                    <article className={styles.matchItem} key={match.id}>
                      <SafeImage
                        src={
                          followedSide === match.home_club
                            ? match.home_club_logo_url
                            : match.away_club_logo_url
                        }
                        alt=""
                        aria-hidden="true"
                        className={styles.logoImage}
                        fallbackClassName={`${styles.logoImage} ${styles.logoFallback}`}
                        fallback={getInitials(followedClub?.short_name || followedClub?.name || match.home_club_name)}
                      />

                      <div>
                        <h3>
                          {match.home_club_name} <span>vs</span> {match.away_club_name}
                        </h3>
                        <p>{match.competition_name}</p>
                        <small>
                          {formatMatchDate(match.match_date)} • {formatMatchTime(match.match_date)}
                        </small>
                        <small>{match.venue}</small>
                      </div>

                      <div className={styles.matchActions}>
                        <Link to={`/tickets/${match.id}/checkout`}>
                          <Ticket size={16} strokeWidth={2.2} aria-hidden="true" />
                          Tickets
                        </Link>

                        <button type="button" aria-label={`Enable alerts for ${match.home_club_name} vs ${match.away_club_name}`}>
                          <Bell size={16} strokeWidth={2.2} aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <section className={styles.compactEmptyState}>
                <CalendarDays size={34} strokeWidth={2.2} aria-hidden="true" />
                <h3>No followed-club fixtures yet</h3>
                <p>Follow more clubs or check the public fixtures page.</p>
              </section>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Recommended Clubs</h2>
                <p>Backend clubs you are not following yet.</p>
              </div>
            </div>

            {isLoading ? (
              <section className={styles.compactEmptyState}>
                <Users size={34} strokeWidth={2.2} aria-hidden="true" />
                <h3>Loading recommendations</h3>
                <p>Finding clubs from the backend catalogue.</p>
              </section>
            ) : visibleRecommendations.length > 0 ? (
              <div className={styles.recommendedList}>
                {visibleRecommendations.map((club) => (
                  <article className={styles.recommendedItem} key={club.id}>
                    <SafeImage
                      src={club.logo_url || club.logo}
                      alt=""
                      aria-hidden="true"
                      className={styles.logoImage}
                      fallbackClassName={`${styles.logoImage} ${styles.logoFallback}`}
                      fallback={getInitials(club.short_name || club.name)}
                    />

                    <div>
                      <h3>{club.name}</h3>
                      <p>{normalizeSport(club)} Club</p>
                      <small>Backend club catalogue</small>
                    </div>

                    <button
                      type="button"
                      disabled={actionClubId === club.id}
                      onClick={() => handleFollowClub(club)}
                    >
                      <Plus size={15} strokeWidth={2.3} aria-hidden="true" />
                      {actionClubId === club.id ? 'Saving…' : 'Follow'}
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <section className={styles.compactEmptyState}>
                <Check size={34} strokeWidth={2.2} aria-hidden="true" />
                <h3>You are up to date</h3>
                <p>No new backend club recommendations are available right now.</p>
              </section>
            )}
          </section>

          <section className={styles.clubSupportCard}>
            <Users size={36} strokeWidth={2.3} aria-hidden="true" />

            <div>
              <h2>Want a better club feed?</h2>
              <p>
                Keep following clubs and updating your interests. This will power
                personalized fixtures, news, ticket alerts and membership suggestions.
              </p>
            </div>

            <Link to="/profile/interests">Update Interests</Link>
          </section>
        </aside>
      </div>
    </section>
  );
}

export default ProfileClubs;
