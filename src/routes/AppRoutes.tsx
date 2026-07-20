import {
    BrowserRouter as Router,
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';

import { lazy, Suspense, type ReactNode } from 'react';

import {
    Landing,
    Login,
    GoogleCallback,
    ForgotPassword,
    Register,
    VerifyEmail,
    Dashboard,
    Profile,
    Competitions,
    Fixtures,
    Results,
    Support,
} from '../pages';

// Public / first-paint pages — stay eagerly bundled
import Personalize from '../pages/auth/Personalize';
import NewsSection from '../pages/landing/NewsPage';
import AboutUs from '../pages/landing/About';
import Tickets from '../pages/landing/TicketsLandingPage';
import Unions from '../pages/landing/Unions';
import AuthenticatedLayout from '../components/AuthenticatedLayout/AuthenticatedLayout';
import AuthRequiredGate from '../components/AuthRequiredGate';
import ExploreClubsPage from '../pages/clubs/ExploreClubsPage';
import ClubDetailsPage from '../pages/clubs/ClubDetailsPage';
import SportsPage from '../pages/sports/SportsPage';
import FootballPage from '../pages/sports/FootballPage';
import RugbyPage from '../pages/sports/RugbyPage';
import BasketballPage from '../pages/sports/BasketballPage';
import TeamSquadPage from '../pages/teams/TeamSquadPage';
import TeamsPage from '../pages/teams/TeamsPage';
import PlayerDetailPage from '../pages/players/PlayerDetailPage';
import StandingsPage from '../pages/standings/StandingsPage';
import UgandaPremierLeague from '../pages/leagues/UgandaPremierLeague';
import NationalBasketballLeague from '../pages/leagues/NationalBasketballLeague';
import NileSpecialPremiership from '../pages/leagues/NileSpecialPremiership';
import SmackLeague from '../pages/leagues/SmackLeague';
import BudoLeague from '../pages/leagues/BudoLeague';
import FantasyPage from '../pages/fantasy/FantasyPage';
import FantasySportSelect from '../pages/fantasy/FantasySportSelect';
import FantasyCreateJoin from '../pages/fantasy/FantasyCreateJoin';
import FantasyTeamBuilder from '../pages/fantasy/FantasyTeamBuilder';
import FantasyPlayerMarket from '../pages/fantasy/FantasyPlayerMarket';
import ClubMembershipDetailPage from '../pages/memberships/ClubMembershipDetailPage';
import MembershipCheckoutPage from '../pages/memberships/MembershipCheckoutPage';
import MembershipSuccessPage from '../pages/memberships/MembershipSuccessPage';
import MembershipFailedPage from '../pages/memberships/MembershipFailedPage';
import MembershipPaymentProcessingPage from '../pages/memberships/MembershipPaymentProcessingPage';
import ExploreMembershipsPage from '../pages/memberships/ExploreMembershipsPage';
import MyMembershipsPage from '../pages/memberships/MyMembershipsPage';
import ProtectedRoute from './ProtectedRoute';
import DashboardEntitlementRoute from './DashboardEntitlementRoute';
import Payments from '../pages/fan/PaymentPage';
import TicketCheckoutPage from '../pages/tickets/TicketCheckoutPage';
import TicketPaymentProcessingPage from '../pages/tickets/TicketPaymentProcessingPage';
import TicketPaymentSuccessPage from '../pages/tickets/TicketPaymentSuccessPage';
import TicketPaymentFailedPage from '../pages/tickets/TicketPaymentFailedPage';
import MatchCentrePage from '../pages/standings/MatchCentrePage';
import CompetitionConfigurator from '../pages/super-admin/CompetitionConfigurator';
import PublishStandards from '../pages/super-admin/PublishStandards';
import AccessUnavailablePage from '../pages/account/AccessUnavailablePage';
import type { DashboardIdentifier } from '../types/dashboardAccess';

import {
    ClubAdminLegacyAliasRedirect,
    ClubAdminSubRoleRedirect,
} from '../routes/ClubAdminSubRoleRouting';
import DefaultDashboardRedirect from '../components/DefaultDashboardRedirect';
import RouteLoadingFallback from '../components/RouteLoadingFallback';

// Fan dashboard pages — lazy-loaded (authenticated role area)
const ProfileInterests = lazy(() => import('../pages/fan/ProfileInterests'));
const ProfileClubs = lazy(() => import('../pages/fan/ProfileClubs'));
const ProfilePayments = lazy(() => import('../pages/fan/ProfilePayments'));
const ProfileNotifications = lazy(() => import('../pages/fan/ProfileNotifications'));
const ProfilePrivacy = lazy(() => import('../pages/fan/ProfilePrivacy'));
const ProfileSupport = lazy(() => import('../pages/fan/ProfileSupport'));
const MyTicketsPage = lazy(() => import('../pages/fan/MyTicketsPage'));
const TicketDetailPage = lazy(() => import('../pages/fan/TicketDetailPage'));
const FanPollsPage = lazy(() => import('../pages/fan/FanPollsPage'));
const MVPVotingPage = lazy(() => import('../pages/fan/MVPVotingPage'));

// Super Admin pages — lazy-loaded (role-gated dashboard area)
const SuperAdminDashboard = lazy(() => import('../pages/super-admin/SuperAdminDashboard'));
const SuperVariants = lazy(() => import('../pages/super-admin/SuperVariantsPage'));
const RulesAndStandards = lazy(() => import('../pages/super-admin/SuperAdminRules'));
const FantasyModuleConfig = lazy(() => import('../pages/super-admin/fantasy/FantasyModuleConfig'));
const ScoringRules = lazy(() => import('../pages/super-admin/fantasy/ScoringRules'));
const TransferRules = lazy(() => import('../pages/super-admin/fantasy/TransferRules'));
const SquadLimits = lazy(() => import('../pages/super-admin/fantasy/SquadLimits'));
const CompetitionMappings = lazy(() => import('../pages/super-admin/fantasy/CompetitionMappings'));
const SeasonGameweekSettings = lazy(() => import('../pages/super-admin/fantasy/SeasonGameweekSettings'));
const PriceStructureGovernance = lazy(() => import('../pages/super-admin/fantasy/PriceStructureGovernance'));
const EligibilityRosterRules = lazy(() => import('../pages/super-admin/fantasy/EligibilityRosterRules'));
const PublishChangesWorkflow = lazy(() => import('../pages/super-admin/fantasy/PublishChangesWorkflow'));
const SuperAdminHome = lazy(() => import('../pages/super-admin/SuperAdminHome'));
const PaymentsAuditPage = lazy(() => import('../pages/super-admin/finance-security/payments-audit'));
const TransactionTrailPage = lazy(() => import('../pages/super-admin/finance-security/transaction-trail'));
const ApprovalsQueuePage = lazy(() => import('../pages/super-admin/finance-security/approvals-queue'));
const ChargebacksRefundsPage = lazy(() => import('../pages/super-admin/finance-security/chargebacks-refunds'));
const DataAccessLogPage = lazy(() => import('../pages/super-admin/finance-security/data-access-log'));
const SecurityEventsPage = lazy(() => import('../pages/super-admin/finance-security/security-events'));
const SuperAdminProfilePage = lazy(() => import('../pages/super-admin/SuperAdminProfilePage'));
const AnnouncementsBannersPage = lazy(() => import('../pages/super-admin/content-platform-operations/AnnouncementsBannersPage'));
const AnnouncementDetailPage = lazy(() => import('../pages/super-admin/content-platform-operations/AnnouncementDetailPage'));
const NotificationTemplatesPage = lazy(() => import('../pages/super-admin/content-platform-operations/NotificationTemplatesPage'));
const PublicContentEditor = lazy(() => import('../pages/super-admin/content-platform-operations/PublicContentEditor'));
const Broadcasts = lazy(() => import('../pages/super-admin/content-platform-operations/Broadcasts'));
const SupportSettings = lazy(() => import('../pages/super-admin/content-platform-operations/SupportSettings'));
const HelpCenter = lazy(() => import('../pages/super-admin/content-platform-operations/HelpCenter'));
const FeatureFlags = lazy(() => import('../pages/super-admin/content-platform-operations/FeatureFlags'));
const SystemMessages = lazy(() => import('../pages/super-admin/content-platform-operations/SystemMessages'));
const BulkOperations = lazy(() => import('../pages/super-admin/content-platform-operations/BulkOperations'));
const SponsorFramework = lazy(() => import('../pages/super-admin/sponsorship-management/SponsorshipFramework'));
const CampaignVisibility = lazy(() => import('../pages/super-admin/sponsorship-management/CampaignVisibility'));
const PlacementManager = lazy(() => import('../pages/super-admin/sponsorship-management/PlacementManager'));
const BenefitSharing = lazy(() => import('../pages/super-admin/sponsorship-management/BenefitSharing'));
const SponsorshipInventory = lazy(() => import('../pages/super-admin/sponsorship-management/SponsorshipInvetory'));
const CampaignPerformance = lazy(() => import('../pages/super-admin/sponsorship-management/CampaignPerformance'));
const ApprovalWorkflow = lazy(() => import('../pages/super-admin/sponsorship-management/ApprovalWorkFlow'));
const SponsorAudits = lazy(() => import('../pages/super-admin/sponsorship-management/SponsorsAudit'));
const SuperAdminSettings = lazy(() => import('../pages/super-admin/superadmin-settings/SuperAdminSettings'));

// Platform admin (user/role management) pages — lazy-loaded
const UserManagement = lazy(() => import('../pages/admin/PlatformUserManagement'));
const RoleTemplates = lazy(() => import('../pages/admin/RoleTemplates'));
const PermissionBundles = lazy(() => import('../pages/admin/PermissionBundles'));
const CrossRoleAccess = lazy(() => import('../pages/admin/CrossRoleAccess'));
const RoleAssignment = lazy(() => import('../pages/admin/RoleAssignment'));
const AuditLog = lazy(() => import('../pages/admin/AuditLog'));
const SessionManagement = lazy(() => import('../pages/admin/SessionManagement'));
const ImpersonateUser = lazy(() => import('../pages/admin/ImpersonateUser'));

// Sponsor pages — lazy-loaded (role-gated dashboard area)
const SponsorshipHub = lazy(() => import('../pages/sponsor/SponsorshipHub'));
const IndividualSponsorSetup = lazy(() => import('../pages/sponsor/IndividualSponsorSetup'));
const IndividualSponsorPreferences = lazy(() => import('../pages/sponsor/IndividualSponsorPreferences'));
const IndividualSponsorReview = lazy(() => import('../pages/sponsor/IndividualSponsorReview'));
const IndividualSponsorComplete = lazy(() => import('../pages/sponsor/IndividualSponsorComplete'));
const CorporateSponsorSetup = lazy(() => import('../pages/sponsor/CorporateSponsorSetup'));
const CorporateVerificationUpload = lazy(() => import('../pages/sponsor/CorporateVerificationUpload'));
const CorporateContactPerson = lazy(() => import('../pages/sponsor/CorporateContactPerson'));
const CorporateSponsorDashboard = lazy(() => import('../pages/sponsor/CorporateSponsorDashboard'));
const SponsorPayments = lazy(() => import('../pages/sponsor/SponsorPayments'));
const SponsorPaymentProcessing = lazy(() => import('../pages/sponsor/SponsorPaymentProcessing'));
const CorporateTeamManagement = lazy(() => import('../pages/sponsor/CorporateTeamManagement'));
const SponsorPermissions = lazy(() => import('../pages/sponsor/SponsorPermissions'));
const SponsorPackages = lazy(() => import('../pages/sponsor/SponsorPackages'));
const SponsorPackageDetail = lazy(() => import('../pages/sponsor/SponsorPackageDetail'));
const CampaignCreation = lazy(() => import('../pages/sponsor/CampaignCreation'));
const CampaignAnalytics = lazy(() => import('../pages/sponsor/CampaignAnalytics'));
const CampaignPlacementPreview = lazy(() => import('../pages/sponsor/CampaignPlacementPreview'));
const CorporateSponsorReview = lazy(() => import('../pages/sponsor/CorporateSponsorReview'));
const CorporateSponsorComplete = lazy(() => import('../pages/sponsor/CorporateSponsorComplete'));
const SponsorCampaigns = lazy(() => import('../pages/sponsor/SponsorCampaigns'));
const SponsorSettings = lazy(() => import('../pages/sponsor/SponsorSettings'));
const SponsorHelp = lazy(() => import('../pages/sponsor/SponsorHelp'));
const CampaignTargeting = lazy(() => import('../pages/sponsor/CampaignTargeting'));
const CampaignAssets = lazy(() => import('../pages/sponsor/CampaignAssets'));
const CampaignPlacement = lazy(() => import('../pages/sponsor/CampaignPlacement'));
const CampaignBudget = lazy(() => import('../pages/sponsor/CampaignBudget'));
const CampaignReview = lazy(() => import('../pages/sponsor/CampaignReview'));
const CampaignLaunch = lazy(() => import('../pages/sponsor/CampaignLaunch'));
const SponsorProfile = lazy(() => import('../pages/sponsor/SponsorProfile'));

// Union / League / Club admin dashboards — lazy-loaded
const UnionAdminDashboard = lazy(() => import('../pages/union-admin/UnionAdminDashboard'));
const LeagueAdminDashboard = lazy(() => import('../pages/league-admin/LeagueAdminDashboard'));
const ClubAdminDashboard = lazy(() => import('../pages/club-admin/ClubAdminDashboard'));

// Club management — lazy-loaded
const TeamsManagement = lazy(() => import('../pages/club-admin/club-management/TeamsManagement'));
const PlayerRegistration = lazy(() => import('../pages/club-admin/club-management/PlayerRegistration'));
const StaffOfficials = lazy(() => import('../pages/club-admin/club-management/StaffOfficials'));
const RosterUpdate = lazy(() => import('../pages/club-admin/club-management/RoasterUpdate'));
const SquadSubmission = lazy(() => import('../pages/club-admin/club-management/SquadSubmision'));

function protectedPage(page: ReactNode) {
    return <ProtectedRoute>{page}</ProtectedRoute>;
}

function dashboardProtectedPage(
    page: ReactNode,
    dashboard: DashboardIdentifier,
    workspaceRole?: string | readonly string[],
    permission?: string,
    scopeType?: string,
) {
    return (
        <DashboardEntitlementRoute
            dashboard={dashboard}
            workspaceRole={workspaceRole}
            permission={permission}
            scopeType={scopeType}
        >
            {page}
        </DashboardEntitlementRoute>
    );
}

export default function AppRoutes() {
    return (
        <Router
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <AuthRequiredGate />

            <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/google-callback" element={<GoogleCallback />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/personalize" element={<Personalize />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route
                    path="/account/access-unavailable"
                    element={protectedPage(<AccessUnavailablePage />)}
                />
                <Route
                    path="/fan/mvp-voting"
                    element={dashboardProtectedPage(<MVPVotingPage />, 'FAN')}
                />
                <Route path="/join-fantasy" element={<Navigate to="/fantasy" replace />} />

                {/* The backend entitlement contract owns the default route. */}
                <Route path="/dashboard" element={protectedPage(<DefaultDashboardRedirect />)} />

                <Route
                    path="/union-admin"
                    element={dashboardProtectedPage(
                        <Navigate to="/dashboard/union-admin" replace />,
                        'UNION_WORKSPACE',
                    )}
                />

                <Route
                    path="/dashboard/league-admin"
                    element={dashboardProtectedPage(
                        <LeagueAdminDashboard />,
                        'LEAGUE_ADMIN',
                    )}
                />

                <Route
                    path="/dashboard/club-admin/*"
                    element={dashboardProtectedPage(
                        <ClubAdminDashboard />,
                        'CLUB_ADMIN',
                        undefined,
                        undefined,
                        'CLUB',
                    )}
                />

                <Route
                    path="/dashboard/ticketing-officer/*"
                    element={dashboardProtectedPage(
                        <ClubAdminDashboard />,
                        'TICKETING_OFFICER',
                        'TICKETING_OFFICER',
                        undefined,
                        'CLUB',
                    )}
                />

                {/* Entitlement-aware aliases for retired sub-role routes. */}
                <Route
                    path="/club-admin"
                    element={<ClubAdminSubRoleRedirect />}
                />
                <Route
                    path="/club-admin/chairman/*"
                    element={
                        <ClubAdminLegacyAliasRedirect workspaceRole="CHAIRMAN" />
                    }
                />
                <Route
                    path="/club-admin/treasurer/*"
                    element={
                        <ClubAdminLegacyAliasRedirect workspaceRole="TREASURER" />
                    }
                />
                <Route
                    path="/club-admin/custom-admin/*"
                    element={
                        <ClubAdminLegacyAliasRedirect
                            workspaceRole={['CUSTOM', 'CUSTOM_ADMIN']}
                        />
                    }
                />
                <Route
                    path="/club-admin/team-manager/*"
                    element={
                        <ClubAdminLegacyAliasRedirect workspaceRole="TEAM_MANAGER" />
                    }
                />
                <Route
                    path="/club-admin/ticketing-officer/*"
                    element={
                        <ClubAdminLegacyAliasRedirect
                            dashboard="TICKETING_OFFICER"
                            workspaceRole="TICKETING_OFFICER"
                        />
                    }
                />

                <Route path="club-management">
                    <Route
                        path="teams"
                        element={dashboardProtectedPage(
                            <TeamsManagement />,
                            'CLUB_ADMIN',
                            undefined,
                            undefined,
                            'CLUB',
                        )}
                    />
                    <Route
                        path="players"
                        element={dashboardProtectedPage(
                            <PlayerRegistration />,
                            'CLUB_ADMIN',
                            undefined,
                            undefined,
                            'CLUB',
                        )}
                    />
                    <Route
                        path="staff"
                        element={dashboardProtectedPage(
                            <StaffOfficials />,
                            'CLUB_ADMIN',
                            undefined,
                            undefined,
                            'CLUB',
                        )}
                    />
                    <Route
                        path="roster"
                        element={dashboardProtectedPage(
                            <RosterUpdate />,
                            'CLUB_ADMIN',
                            undefined,
                            undefined,
                            'CLUB',
                        )}
                    />
                    <Route
                        path="squad-submission"
                        element={dashboardProtectedPage(
                            <SquadSubmission />,
                            'CLUB_ADMIN',
                            undefined,
                            undefined,
                            'CLUB',
                        )}
                    />
                </Route>

                <Route
                    path="/dashboard/chairman/*"
                    element={
                        <ClubAdminLegacyAliasRedirect workspaceRole="CHAIRMAN" />
                    }
                />
                <Route
                    path="/dashboard/treasurer/*"
                    element={
                        <ClubAdminLegacyAliasRedirect workspaceRole="TREASURER" />
                    }
                />
                <Route
                    path="/dashboard/custom-admin/*"
                    element={
                        <ClubAdminLegacyAliasRedirect
                            workspaceRole={['CUSTOM', 'CUSTOM_ADMIN']}
                        />
                    }
                />
                <Route
                    path="/dashboard/team-manager/*"
                    element={
                        <ClubAdminLegacyAliasRedirect workspaceRole="TEAM_MANAGER" />
                    }
                />

                <Route
                    path="/dashboard/union-admin"
                    element={dashboardProtectedPage(
                        <UnionAdminDashboard />,
                        'UNION_WORKSPACE',
                    )}
                />

                <Route
                    path="/dashboard/referee"
                    element={dashboardProtectedPage(
                        <UnionAdminDashboard />,
                        'UNION_WORKSPACE',
                        'MATCH_OFFICIAL',
                    )}
                />

                <Route
                    path="/dashboard/match-official"
                    element={dashboardProtectedPage(
                        <UnionAdminDashboard />,
                        'UNION_WORKSPACE',
                        'MATCH_OFFICIAL',
                    )}
                />

                <Route element={protectedPage(<AuthenticatedLayout />)}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/edit" element={<Navigate to="/profile" replace />} />
                    <Route path="/profile/interests" element={<ProfileInterests />} />
                    <Route path="/profile/clubs" element={<ProfileClubs />} />
                    <Route path="/profile/notifications" element={<ProfileNotifications />} />
                    <Route path="/profile/privacy" element={<ProfilePrivacy />} />
                    <Route path="/profile/support" element={<ProfileSupport />} />

                    <Route element={<DashboardEntitlementRoute dashboard="FAN" />}>
                        <Route path="/dashboard/fan" element={<Dashboard />} />
                        <Route path="/profile/payments" element={<ProfilePayments />} />
                        <Route path="/dashboard/wallet" element={<ProfilePayments />} />

                        <Route path="/memberships" element={<ExploreMembershipsPage />} />
                        <Route path="/memberships/:clubSlug" element={<ClubMembershipDetailPage />} />
                        <Route path="/memberships/:clubSlug/checkout" element={<MembershipCheckoutPage />} />
                        <Route path="/memberships/:clubSlug/success" element={<MembershipSuccessPage />} />
                        <Route path="/memberships/:clubSlug/failed" element={<MembershipFailedPage />} />
                        <Route path="/memberships/payment/processing" element={<MembershipPaymentProcessingPage />} />
                        <Route path="/dashboard/memberships" element={<MyMembershipsPage />} />

                        <Route path="/fan/polls" element={<FanPollsPage />} />
                        <Route path="/dashboard/tickets" element={<MyTicketsPage />} />
                        <Route path="/dashboard/tickets/:ticketId" element={<TicketDetailPage />} />
                        <Route path="/tickets/:matchId/checkout" element={<TicketCheckoutPage />} />
                        <Route path="/tickets/payment/processing" element={<TicketPaymentProcessingPage />} />
                        <Route path="/tickets/payment/success" element={<TicketPaymentSuccessPage />} />
                        <Route path="/tickets/payment/failed" element={<TicketPaymentFailedPage />} />

                        <Route path="/fantasy" element={<FantasyPage />} />
                        <Route path="/fantasy/select" element={<FantasySportSelect />} />
                        <Route path="/fantasy/create-league" element={<FantasyCreateJoin />} />
                        <Route path="/fantasy/team-builder" element={<FantasyTeamBuilder />} />
                        <Route path="/fantasy/player-market" element={<FantasyPlayerMarket />} />
                    </Route>
                </Route>

                <Route path="/edit-profile" element={protectedPage(<Navigate to="/profile" replace />)} />

                <Route path="/sports" element={<SportsPage />} />
                <Route path="/sports/football" element={<FootballPage />} />
                <Route path="/sports/rugby" element={<RugbyPage />} />
                <Route path="/sports/basketball" element={<BasketballPage />} />
                <Route path="/competitions" element={<Competitions />} />
                <Route path="/news" element={<NewsSection />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/unions" element={<Unions />} />
                <Route path="/clubs" element={<ExploreClubsPage />} />
                <Route path="/clubs/:clubSlug" element={<ClubDetailsPage />} />
                <Route path="/clubs/:clubSlug/teams" element={<TeamsPage />} />
                <Route path="/teams" element={<Navigate to="/clubs" replace />} />
                <Route path="/teams/:teamSlug/squad" element={<TeamSquadPage />} />
                <Route path="/players/:playerSlug" element={<PlayerDetailPage />} />
                <Route path="/standings" element={<StandingsPage />} />
                <Route path="/leagues/uganda-premier-league" element={<UgandaPremierLeague />} />
                <Route path="/leagues/nile-special-premiership" element={<NileSpecialPremiership />} />
                <Route path="/leagues/national-basketball-league" element={<NationalBasketballLeague />} />
                <Route path="/leagues/budo-league" element={<BudoLeague />} />
                <Route path="/leagues/smack-league" element={<SmackLeague />} />
                <Route path="/match-centre" element={<MatchCentrePage />} />
                <Route path="/fixtures" element={<Fixtures />} />
                <Route path="/results" element={<Results />} />
                <Route path="/support" element={<Support />} />
                <Route path="/about" element={<AboutUs />} />

                {/* Sponsor routes */}
                <Route path="/sponsorhub" element={<SponsorshipHub />} />
                <Route path="/sponsor/individualsetup" element={<IndividualSponsorSetup />} />
                <Route path="/sponsor/individual/preferences" element={<IndividualSponsorPreferences />} />
                <Route path="/sponsor/individual/review" element={<IndividualSponsorReview />} />
                <Route path="/sponsor/individual/complete" element={<IndividualSponsorComplete />} />
                <Route path="/sponsor/corporatesetup" element={<CorporateSponsorSetup />} />
                <Route path="/sponsor/corporatesetup/contact" element={<CorporateContactPerson />} />
                <Route path="/sponsor/corporatesetup/verification" element={<CorporateVerificationUpload />} />
                <Route path="/sponsor/corporatesetup/review" element={<CorporateSponsorReview />} />
                <Route path="/sponsor/corporatesetup/complete" element={<CorporateSponsorComplete />} />
                <Route
                    path="/sponsor/payment/processing"
                    element={<SponsorPaymentProcessing />}
                />
                <Route
                    path="/dashboard/sponsor"
                    element={dashboardProtectedPage(
                        <Navigate to="/sponsor/dashboard" replace />,
                        'SPONSOR',
                    )}
                />
                <Route
                    path="/sponsor/dashboard"
                    element={dashboardProtectedPage(
                        <CorporateSponsorDashboard />,
                        'SPONSOR',
                    )}
                />
                <Route
                    path="/sponsor/team"
                    element={dashboardProtectedPage(
                        <CorporateTeamManagement />,
                        'SPONSOR',
                    )}
                />
                <Route
                    path="/sponsor/payments"
                    element={dashboardProtectedPage(
                        <SponsorPayments />,
                        'SPONSOR',
                    )}
                />
                <Route
                    path="/sponsor/permissions"
                    element={dashboardProtectedPage(
                        <SponsorPermissions />,
                        'SPONSOR',
                    )}
                />
                <Route
                    path="/sponsor/packages"
                    element={dashboardProtectedPage(
                        <SponsorPackages />,
                        'SPONSOR',
                    )}
                />
                <Route
                    path="/sponsor/packages/:packageId"
                    element={dashboardProtectedPage(
                        <SponsorPackageDetail />,
                        'SPONSOR',
                    )}
                />
                <Route
                    path="/sponsor/campaigns/new"
                    element={dashboardProtectedPage(
                        <CampaignCreation />,
                        'SPONSOR',
                    )}
                />
                <Route
                    path="/sponsor/analytics"
                    element={dashboardProtectedPage(
                        <CampaignAnalytics />,
                        'SPONSOR',
                    )}
                />
                <Route
                    path="/sponsor/campaigns/preview"
                    element={dashboardProtectedPage(
                        <CampaignPlacementPreview />,
                        'SPONSOR',
                    )}
                />
                <Route
                    path="/sponsor/activations"
                    element={dashboardProtectedPage(
                        <SponsorCampaigns />,
                        'SPONSOR',
                    )}
                />
                <Route
                    path="/sponsor/campaigns"
                    element={dashboardProtectedPage(
                        <Navigate to="/sponsor/activations" replace />,
                        'SPONSOR',
                    )}
                />
                <Route
                    path="/sponsor/settings"
                    element={dashboardProtectedPage(<SponsorSettings />, 'SPONSOR')}
                />
                <Route
                    path="/sponsor/support"
                    element={dashboardProtectedPage(<SponsorHelp />, 'SPONSOR')}
                />
                <Route
                    path="/sponsor/campaigns/new/targeting"
                    element={dashboardProtectedPage(<CampaignTargeting />, 'SPONSOR')}
                />
                <Route
                    path="/sponsor/campaigns/new/assets"
                    element={dashboardProtectedPage(<CampaignAssets />, 'SPONSOR')}
                />
                <Route
                    path="/sponsor/campaigns/new/placement"
                    element={dashboardProtectedPage(<CampaignPlacement />, 'SPONSOR')}
                />
                <Route
                    path="/sponsor/campaigns/new/budget"
                    element={dashboardProtectedPage(<CampaignBudget />, 'SPONSOR')}
                />
                <Route
                    path="/sponsor/campaigns/new/review"
                    element={dashboardProtectedPage(<CampaignReview />, 'SPONSOR')}
                />
                <Route
                    path="/sponsor/campaigns/new/launch"
                    element={dashboardProtectedPage(<CampaignLaunch />, 'SPONSOR')}
                />
                <Route
                    path="/sponsor/profile"
                    element={dashboardProtectedPage(<SponsorProfile />, 'SPONSOR')}
                />

                <Route
                    path="/payments"
                    element={dashboardProtectedPage(<Payments />, 'FAN')}
                />

                {/* Super Admin routes */}
                <Route
                    path="/dashboard/super-admin"
                    element={dashboardProtectedPage(
                        <Navigate to="/super-admin" replace />,
                        'SUPER_ADMIN',
                    )}
                />
                <Route
                    path="/super-admin"
                    element={dashboardProtectedPage(
                        <SuperAdminDashboard />,
                        'SUPER_ADMIN',
                    )}
                >
                    <Route index element={<SuperAdminHome />} />
                    <Route path="dashboard" element={<SuperAdminHome />} />

                    {/* Rules & Formats */}
                    <Route path="sports-variants" element={<SuperVariants />} />
                    <Route path="rules" element={<RulesAndStandards />} />
                    <Route path="competition-formats" element={<CompetitionConfigurator />} />
                    <Route path="publish-standards" element={<PublishStandards />} />

                    {/* User Management */}
                    <Route path="users-management" element={<UserManagement />} />

                    {/* Governance / Role & Permission pages */}
                    <Route path="role-templates" element={<RoleTemplates />} />
                    <Route path="permissions" element={<PermissionBundles />} />
                    <Route path="cross-role" element={<CrossRoleAccess />} />
                    <Route path="role-assignment" element={<RoleAssignment />} />
                    <Route path="audit-log" element={<AuditLog />} />
                    <Route path="sessions" element={<SessionManagement />} />
                    <Route path="impersonate" element={<ImpersonateUser />} />

                    {/* Finance */}
                    <Route path="payments-audit" element={<PaymentsAuditPage />} />
                    <Route path="transaction-trail" element={<TransactionTrailPage />} />
                    <Route path="approvals-queue" element={<ApprovalsQueuePage />} />
                    <Route path="chargebacks-refunds" element={<ChargebacksRefundsPage />} />
                    <Route path="data-access-log" element={<DataAccessLogPage />} />
                    <Route path="security-events" element={<SecurityEventsPage />} />
                    <Route path="profile" element={<SuperAdminProfilePage />} />

                    {/* Fantasy Module Config */}
                    <Route path="fantasy-config" element={<FantasyModuleConfig />} />
                    <Route path="fantasy-config/scoring" element={<ScoringRules />} />
                    <Route path="fantasy-config/transfers" element={<TransferRules />} />
                    <Route path="fantasy-config/squad-limits" element={<SquadLimits />} />
                    <Route path="fantasy-config/competition-mappings" element={<CompetitionMappings />} />
                    <Route path="fantasy-config/season-gameweek" element={<SeasonGameweekSettings />} />
                    <Route path="fantasy-config/price-structure" element={<PriceStructureGovernance />} />
                    <Route path="fantasy-config/eligibility-roster" element={<EligibilityRosterRules />} />
                    <Route path="fantasy-config/publish-changes" element={<PublishChangesWorkflow />} />

                    {/* Content & Platform Operations */}
                    <Route path="public-content" element={<PublicContentEditor />} />
                    <Route path="announcements-banners" element={<AnnouncementsBannersPage />} />
                    <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
                    <Route path="notification-templates" element={<NotificationTemplatesPage />} />
                    <Route path="broadcasts" element={<Broadcasts />} />
                    <Route path="support-settings" element={<SupportSettings />} />
                    <Route path="help-center" element={<HelpCenter />} />
                    <Route path="feature-flags" element={<FeatureFlags />} />
                    <Route path="system-messages" element={<SystemMessages />} />
                    <Route path="bulk-operations" element={<BulkOperations />} />

                    

                    {/*Sponsorship Management*/}
                    <Route path="frameworks" element={<SponsorFramework />} />
                    <Route path="visibility" element={<CampaignVisibility />} />
                    <Route path="placements" element={<PlacementManager />} />
                    <Route path="benefit-sharing" element={<BenefitSharing />} />
                    <Route path="inventory" element={<SponsorshipInventory />} />
                    <Route path="performance" element={<CampaignPerformance />} />
                    <Route path="approvals" element={<ApprovalWorkflow />} />
                    <Route path="audits" element={<SponsorAudits />} />

                    {/*settings*/}
                    <Route path="settings" element={<SuperAdminSettings />} />
                </Route>

                
                {/* Catch-all — if you ever land here, a route path is wrong.
                    A visible message beats a silent blank page. */}
                <Route
                    path="*"
                    element={
                        <div style={{ padding: 40, color: '#fff' }}>
                            Page not found — check the route path.
                        </div>
                    }
                />
            </Routes>
            </Suspense>
        </Router>
    );
}
