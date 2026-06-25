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
import ProfileEdit from '../pages/fan/ProfileEdit';
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
import ExploreMembershipsPage from '../pages/memberships/ExploreMembershipsPage';
import ClubMembershipDetailPage from '../pages/memberships/ClubMembershipDetailPage';
import MembershipCheckoutPage from '../pages/memberships/MembershipCheckoutPage';
import MembershipSuccessPage from '../pages/memberships/MembershipSuccessPage';
import MembershipFailedPage from '../pages/memberships/MembershipFailedPage';
import MyMembershipsPage from '../pages/memberships/MyMembershipsPage';
import MyTicketsPage from '../pages/fan/MyTicketsPage';
import ProtectedRoute from './ProtectedRoute';
import Payments from '../pages/PaymentPage';

function protectedPage(page: ReactNode) {
    return <ProtectedRoute>{page}</ProtectedRoute>;
}

export default function AppRoutes() {
    return (
        <Router>
            <AuthRequiredGate />

            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/google-callback" element={<GoogleCallback />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/personalize" element={<Personalize />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                <Route path="/dashboard" element={protectedPage(<Navigate to="/dashboard/fan" replace />)} />

                <Route element={protectedPage(<AuthenticatedLayout />)}>
                    <Route path="/dashboard/fan" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/edit" element={<ProfileEdit />} />
                    <Route path="/profile/interests" element={<ProfileInterests />} />
                    <Route path="/profile/clubs" element={<ProfileClubs />} />
                    <Route path="/profile/payments" element={<ProfilePayments />} />
                    <Route path="/profile/notifications" element={<ProfileNotifications />} />
                    <Route path="/profile/privacy" element={<ProfilePrivacy />} />
                    <Route path="/profile/support" element={<ProfileSupport />} />

                    <Route path="/memberships" element={<ExploreMembershipsPage />} />
                    <Route path="/memberships/:clubSlug" element={<ClubMembershipDetailPage />} />
                    <Route path="/memberships/:clubSlug/checkout" element={<MembershipCheckoutPage />} />
                    <Route path="/memberships/:clubSlug/success" element={<MembershipSuccessPage />} />
                    <Route path="/memberships/:clubSlug/failed" element={<MembershipFailedPage />} />
                    <Route path="/dashboard/memberships" element={<MyMembershipsPage />} />
                    <Route path="/dashboard/tickets" element={<MyTicketsPage />} />
                </Route>

                <Route path="/edit-profile" element={protectedPage(<Navigate to="/profile/edit" replace />)} />

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
                <Route path="/fixtures" element={<Fixtures />} />
                <Route path="/results" element={<Results />} />
                <Route path="/support" element={<Support />} />
                <Route path="/about" element={<AboutUs />} />

                {/* ✅ FIX: Payments route */}
                <Route path="/payments" element={<Payments />} />
            </Routes>
        </Router>
    );
}