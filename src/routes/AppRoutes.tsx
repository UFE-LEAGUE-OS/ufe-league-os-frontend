import { type ReactNode } from 'react';
import {
    BrowserRouter as Router,
    Navigate,
    Route,
    Routes,
    useLocation,
} from 'react-router-dom';
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
import Tickets from '../pages/landing/TicketsLandingPage';
import AuthenticatedLayout from '../components/AuthenticatedLayout/AuthenticatedLayout';
import ExploreMembershipsPage from '../pages/memberships/ExploreMembershipsPage';
import ClubMembershipDetailPage from '../pages/memberships/ClubMembershipDetailPage';
import MembershipCheckoutPage from '../pages/memberships/MembershipCheckoutPage';
import MembershipSuccessPage from '../pages/memberships/MembershipSuccessPage';
import MembershipFailedPage from '../pages/memberships/MembershipFailedPage';
import MyMembershipsPage from '../pages/memberships/MyMembershipsPage';
import { useAuthStore } from '../store/authStore.js';

function getStoredAccessToken() {
    return (
        localStorage.getItem('league_os_access_token') ||
        localStorage.getItem('access_token')
    );
}

function RequireAuth({ children }: { children: ReactNode }) {
    const location = useLocation();
    const accessToken = useAuthStore((state) => state.accessToken);
    const isAuthenticated = Boolean(accessToken || getStoredAccessToken());

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    message: 'Please log in to continue.',
                    from: location.pathname,
                }}
            />
        );
    }

    return children;
}

function protectedPage(page: ReactNode) {
    return <RequireAuth>{page}</RequireAuth>;
}

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/google-callback" element={<GoogleCallback />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/personalize" element={<Personalize />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
                <Route path="/dashboard/fan" element={protectedPage(<Dashboard />)} />
                <Route element={protectedPage(<AuthenticatedLayout />)}>
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
                </Route>
                <Route path="/edit-profile" element={protectedPage(<Navigate to="/profile/edit" replace />)} />

                <Route path="/competitions" element={<Competitions />} />
                <Route path="/news" element={<NewsSection />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/fixtures" element={<Fixtures />} />
                <Route path="/results" element={<Results />} />
                <Route path="/support" element={<Support />} />
            </Routes>
        </Router>
    );
}
