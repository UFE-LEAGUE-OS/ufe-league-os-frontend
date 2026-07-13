import {
    BrowserRouter as Router,
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';

import { type ReactNode } from 'react';

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

import Personalize from '../pages/auth/Personalize';
import NewsSection from '../pages/NewsPage';
import ProfileInterests from '../pages/fan/ProfileInterests';
import ProfileClubs from '../pages/fan/ProfileClubs';
import ProfilePayments from '../pages/fan/ProfilePayments';
import ProfileNotifications from '../pages/fan/ProfileNotifications';
import ProfilePrivacy from '../pages/fan/ProfilePrivacy';
import ProfileSupport from '../pages/fan/ProfileSupport';
import AboutUs from '../pages/About';
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
import MyTicketsPage from '../pages/fan/MyTicketsPage';
import TicketDetailPage from '../pages/fan/TicketDetailPage';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import Payments from '../pages/PaymentPage';
import FanPollsPage from '../pages/fan/FanPollsPage';
import TicketCheckoutPage from '../pages/tickets/TicketCheckoutPage';
import TicketPaymentProcessingPage from '../pages/tickets/TicketPaymentProcessingPage';
import TicketPaymentSuccessPage from '../pages/tickets/TicketPaymentSuccessPage';
import TicketPaymentFailedPage from '../pages/tickets/TicketPaymentFailedPage';
import MatchCentrePage from '../pages/MatchCentrePage';
import MVPVotingPage from '../pages/fan/MVPVotingPage';
import JoinFantasy from '../pages/JoinFantasy';
import SuperAdminDashboard from '../pages/SuperAdminDashboard';
import SuperVariants from '../pages/SuperVariantsPage';
import RulesAndStandards from '../pages/SuperAdminRules';
import CompetitionConfigurator from '../pages/CompetitionConfigurator';
import PublishStandards from '../pages/PublishStandards';
import FantasyModuleConfig from '../pages/super-admin/fantasy/FantasyModuleConfig';
import ScoringRules from '../pages/super-admin/fantasy/ScoringRules';
import TransferRules from '../pages/super-admin/fantasy/TransferRules';
import SquadLimits from '../pages/super-admin/fantasy/SquadLimits';
import CompetitionMappings from '../pages/super-admin/fantasy/CompetitionMappings';
import SeasonGameweekSettings from '../pages/super-admin/fantasy/SeasonGameweekSettings';
import PriceStructureGovernance from '../pages/super-admin/fantasy/PriceStructureGovernance';
import EligibilityRosterRules from '../pages/super-admin/fantasy/EligibilityRosterRules';
import PublishChangesWorkflow from '../pages/super-admin/fantasy/PublishChangesWorkflow';
import SuperAdminHome from '../pages/super-admin/SuperAdminHome';
import UserManagement from '../pages/admin/UserManagement';
import RoleTemplates from '../pages/admin/RoleTemplates';
import PermissionBundles from '../pages/admin/PermissionBundles';
import CrossRoleAccess from '../pages/admin/CrossRoleAccess';
import RoleAssignment from '../pages/admin/RoleAssignment';
import AuditLog from '../pages/admin/AuditLog';
import SessionManagement from '../pages/admin/SessionManagement';
import ImpersonateUser from '../pages/admin/ImpersonateUser';
import PaymentsAuditPage from '../pages/super-admin/finance-security/payments-audit';
import TransactionTrailPage from '../pages/super-admin/finance-security/transaction-trail';
import ApprovalsQueuePage from '../pages/super-admin/finance-security/approvals-queue';
import ChargebacksRefundsPage from '../pages/super-admin/finance-security/chargebacks-refunds';
import DataAccessLogPage from '../pages/super-admin/finance-security/data-access-log';
import SecurityEventsPage from '../pages/super-admin/finance-security/security-events';
import SuperAdminProfilePage from '../pages/super-admin/SuperAdminProfilePage';
import AnnouncementsBannersPage from '../pages/super-admin/content-platform-operations/AnnouncementsBannersPage';
import AnnouncementDetailPage from '../pages/super-admin/content-platform-operations/AnnouncementDetailPage';
import NotificationTemplatesPage from '../pages/super-admin/content-platform-operations/NotificationTemplatesPage';
import PublicContentEditor from '../pages/super-admin/content-platform-operations/PublicContentEditor';
import Broadcasts from '../pages/super-admin/content-platform-operations/Broadcasts';
import SupportSettings from '../pages/super-admin/content-platform-operations/SupportSettings';
import HelpCenter from '../pages/super-admin/content-platform-operations/HelpCenter';
import FeatureFlags from '../pages/super-admin/content-platform-operations/FeatureFlags';
import SystemMessages from '../pages/super-admin/content-platform-operations/SystemMessages';
import BulkOperations from '../pages/super-admin/content-platform-operations/BulkOperations';

// Sponsor pages
import SponsorshipHub from '../pages/sponsor/SponsorshipHub';
import IndividualSponsorSetup from '../pages/sponsor/IndividualSponsorSetup';
import IndividualSponsorPreferences from '../pages/sponsor/IndividualSponsorPreferences';
import IndividualSponsorReview from '../pages/sponsor/IndividualSponsorReview';
import IndividualSponsorComplete from '../pages/sponsor/IndividualSponsorComplete';
import CorporateSponsorSetup from '../pages/sponsor/CorporateSponsorSetup';
import CorporateVerificationUpload from '../pages/sponsor/CorporateVerificationUpload';
import CorporateContactPerson from '../pages/sponsor/CorporateContactPerson';
import CorporateSponsorDashboard from '../pages/sponsor/CorporateSponsorDashboard';
import CorporateTeamManagement from '../pages/sponsor/CorporateTeamManagement';
import SponsorPermissions from '../pages/sponsor/SponsorPermissions';
import SponsorPackages from '../pages/sponsor/SponsorPackages';
import CampaignCreation from '../pages/sponsor/CampaignCreation';
import CampaignAnalytics from '../pages/sponsor/CampaignAnalytics';
import CampaignPlacementPreview from '../pages/sponsor/CampaignPlacementPreview';
import CorporateSponsorReview from '../pages/sponsor/CorporateSponsorReview';
import CorporateSponsorComplete from '../pages/sponsor/CorporateSponsorComplete';
import SponsorCampaigns from '../pages/sponsor/SponsorCampaigns';
import SponsorSettings from '../pages/sponsor/SponsorSettings';
import SponsorHelp from '../pages/sponsor/SponsorHelp';
import CampaignTargeting from '../pages/sponsor/CampaignTargeting';
import CampaignBudget from '../pages/sponsor/CampaignBudget';
import CampaignReview from '../pages/sponsor/CampaignReview';
import CampaignLaunch from '../pages/sponsor/CampaignLaunch';
import SponsorProfile from '../pages/sponsor/SponsorProfile';

import UnionAdminDashboard from '../pages/union-admin/UnionAdminDashboard';
import LeagueAdminDashboard from '../pages/league-admin/LeagueAdminDashboard';
import ClubAdminDashboard from '../pages/club-admin/ClubAdminDashboard';
import TicketingOfficerDashboard from '../pages/ticketing-officer/TicketingOfficerDashboard';

function protectedPage(page: ReactNode) {
    return <ProtectedRoute>{page}</ProtectedRoute>;
}

function roleProtectedPage(page: ReactNode, allowedRoles: string[], redirectTo?: string) {
    return (
        <RoleProtectedRoute allowedRoles={allowedRoles} redirectTo={redirectTo}>
            {page}
        </RoleProtectedRoute>
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

            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/google-callback" element={<GoogleCallback />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/personalize" element={<Personalize />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/fan/mvp-voting" element={<MVPVotingPage />} />
                <Route path="/join-fantasy" element={<JoinFantasy />} />
               

                <Route path="/dashboard" element={protectedPage(<Navigate to="/dashboard/fan" replace />)} />

                <Route
                    path="/union-admin"
                    element={protectedPage(<Navigate to="/dashboard/union-admin" replace />)}
                />

                <Route
                    path="/dashboard/league-admin"
                    element={roleProtectedPage(
                        <LeagueAdminDashboard />,
                        ['LEAGUE_ADMIN'],
                    )}
                />

                <Route
                    path="/dashboard/club-admin"
                    element={roleProtectedPage(
                        <ClubAdminDashboard />,
                        ['CLUB_ADMIN'],
                    )}
                />

                <Route
                    path="/dashboard/ticketing-officer"
                    element={roleProtectedPage(
                        <TicketingOfficerDashboard />,
                        ['TICKETING_OFFICER'],
                    )}
                />

                <Route
                    path="/dashboard/union-admin"
                    element={roleProtectedPage(
                        <UnionAdminDashboard />,
                        ['UNION_ADMIN'],
                    )}
                />

                <Route
                    path="/dashboard/referee"
                    element={roleProtectedPage(
                        <UnionAdminDashboard />,
                        ['REFEREE', 'MATCH_OFFICIAL'],
                    )}
                />

                <Route
                    path="/dashboard/match-official"
                    element={roleProtectedPage(
                        <UnionAdminDashboard />,
                        ['REFEREE', 'MATCH_OFFICIAL'],
                    )}
                />

                <Route element={protectedPage(<AuthenticatedLayout />)}>
                    <Route path="/dashboard/fan" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/edit" element={<Navigate to="/profile" replace />} />
                    <Route path="/profile/interests" element={<ProfileInterests />} />
                    <Route path="/profile/clubs" element={<ProfileClubs />} />
                    <Route path="/profile/payments" element={<ProfilePayments />} />
                    <Route path="/dashboard/wallet" element={<ProfilePayments />} />
                    <Route path="/profile/notifications" element={<ProfileNotifications />} />
                    <Route path="/profile/privacy" element={<ProfilePrivacy />} />
                    <Route path="/profile/support" element={<ProfileSupport />} />

                    <Route path="/memberships" element={<ExploreMembershipsPage />} />
                    <Route path="/memberships/:clubSlug" element={<ClubMembershipDetailPage />} />
                    <Route path="/memberships/:clubSlug/checkout" element={<MembershipCheckoutPage />} />
                    <Route path="/memberships/:clubSlug/success" element={<MembershipSuccessPage />} />
                    <Route path="/memberships/:clubSlug/failed" element={<MembershipFailedPage />} />
                    <Route path="/memberships/payment/processing" element={<MembershipPaymentProcessingPage />} />
                    <Route path="/dashboard/memberships" element={<MyMembershipsPage />} />

                    {/* Fan Interaction */}
                    <Route path="/fan/polls" element={<FanPollsPage />} />
                    <Route path="/dashboard/tickets" element={<MyTicketsPage />} />
                    <Route path="/dashboard/tickets/:ticketId" element={<TicketDetailPage />} />
                    <Route path="/tickets/:matchId/checkout" element={<TicketCheckoutPage />} />
                    <Route path="/tickets/payment/processing" element={<TicketPaymentProcessingPage />} />
                    <Route path="/tickets/payment/success" element={<TicketPaymentSuccessPage />} />
                    <Route path="/tickets/payment/failed" element={<TicketPaymentFailedPage />} />

                    {/* Fantasy — protected, requires login */}
                    <Route path="/fantasy" element={<FantasyPage />} />
                    <Route path="/fantasy/select" element={<FantasySportSelect />} />
                    <Route path="/fantasy/create-league" element={<FantasyCreateJoin />} />
                    <Route path="/fantasy/team-builder" element={<FantasyTeamBuilder />} />
                    <Route path="/fantasy/player-market" element={<FantasyPlayerMarket />} />
                </Route>

                <Route path="/edit-profile" element={protectedPage(<Navigate to="/profile" replace />)} />

                <Route path="/sports" element={<SportsPage />} />
                <Route path="/sports/football" element={<FootballPage />} />
                <Route path="/sports/rugby" element={<RugbyPage />} />
                <Route path="/sports/basketball" element={<BasketballPage />} />
                <Route path="/competitions" element={<Competitions />} />
                <Route path="/news" element={<NewsSection />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/memberships/payment/processing" element={<MembershipPaymentProcessingPage />} />
                <Route path="/tickets/payment/processing" element={<TicketPaymentProcessingPage />} />
                <Route path="/tickets/payment/success" element={<TicketPaymentSuccessPage />} />
                <Route path="/tickets/payment/failed" element={<TicketPaymentFailedPage />} />
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
                <Route path="/sponsor/dashboard" element={<CorporateSponsorDashboard />} />
                <Route path="/sponsor/team" element={<CorporateTeamManagement />} />
                <Route path="/sponsor/permissions" element={<SponsorPermissions />} />
                <Route path="/sponsor/packages" element={<SponsorPackages />} />
                <Route path="/sponsor/campaigns/new" element={<CampaignCreation />} />
                <Route path="/sponsor/analytics" element={<CampaignAnalytics />} />
                <Route path="/sponsor/campaigns/preview" element={<CampaignPlacementPreview />} />
                <Route path="/sponsor/campaigns" element={<SponsorCampaigns />} />
                <Route path="/sponsor/settings" element={<SponsorSettings />} />
                <Route path="/sponsor/support" element={<SponsorHelp />} />
                <Route path="/sponsor/campaigns/new/targeting" element={<CampaignTargeting />} />
                <Route path="/sponsor/campaigns/new/budget" element={<CampaignBudget />} />
                <Route path="/sponsor/campaigns/new/review" element={<CampaignReview />} />
                <Route path="/sponsor/campaigns/new/launch" element={<CampaignLaunch />} />
                <Route path="/sponsor/profile" element={<SponsorProfile />} />

                <Route path="/payments" element={<Payments />} />

                {/* Super Admin routes */}
             <Route path="/super-admin"  element={roleProtectedPage(<SuperAdminDashboard />, ["SUPER_ADMIN"])}>
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
                </Route>
            </Routes>
        </Router>
    );
}