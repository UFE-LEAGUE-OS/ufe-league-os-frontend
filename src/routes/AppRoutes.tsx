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
        <Route path="/register" element={<Register />} />
        <Route path="/personalize" element={<Personalize />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/news" element={<NewsSection />} />
        <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>
    </Router>
  );
}