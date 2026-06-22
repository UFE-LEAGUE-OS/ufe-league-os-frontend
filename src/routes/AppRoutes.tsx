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
import EditProfile from '../components/EditProfilePage';
import Tickets from '../pages/landing/TicketsLandingPage';
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
                <Route path="/profile" element={protectedPage(<Profile />)} />
                <Route path="/edit-profile" element={protectedPage(<EditProfile />)} />

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
