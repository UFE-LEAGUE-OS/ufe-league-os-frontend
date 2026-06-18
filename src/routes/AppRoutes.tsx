import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import {
  Landing,
  Login,
  GoogleCallback,
  ForgotPassword,
  Register,
  VerifyEmail,
  Dashboard,
  Profile,
  Competitions
} from '../pages';
import Personalize from '../pages/auth/Personalize';
import NewsSection from '../pages/NewsPage';
import EditProfile from '../components/EditProfilePage';
import { PublicOnly, RequireAuth, RequireOnboarding } from './AuthGuards';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<PublicOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/google-callback" element={<GoogleCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route element={<RequireOnboarding />}>
          <Route path="/personalize" element={<Personalize />} />
        </Route>
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/news" element={<NewsSection />} />
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Navigate to="/dashboard/fan" replace />} />
          <Route path="/dashboard/fan" element={<Dashboard />} />
          <Route path="/dashboard/club-admin" element={<Dashboard />} />
          <Route path="/dashboard/league-admin" element={<Dashboard />} />
          <Route path="/dashboard/union-admin" element={<Dashboard />} />
          <Route path="/dashboard/super-admin" element={<Dashboard />} />
          <Route path="/dashboard/referee" element={<Dashboard />} />
          <Route path="/dashboard/ticketing-officer" element={<Dashboard />} />
          <Route path="/dashboard/sponsor" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}
