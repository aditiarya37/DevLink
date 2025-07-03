import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import EditProfilePage from '../pages/EditProfilePage';
import SearchResultsPage from '../pages/SearchResultsPage';
import TagFeedPage from '../pages/TagFeedPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage'; 
import ResetPasswordPage from '../pages/ResetPasswordPage';
import SinglePostPage from '../pages/SinglePostPage';
import AuthCallbackPage from '../pages/AuthCallbackPage';

import ProtectedRoute from '../components/ProtectedRoute';
import NotificationsPage from '../pages/NotificationsPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile/:username" element={<ProfilePage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/tag/:tagName" element={<TagFeedPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/posts/:postId" element={<SinglePostPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

    </Routes>
  );
};

export default AppRoutes;