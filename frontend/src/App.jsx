import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DesktopOnly from './components/DesktopOnly';
import useIsDesktop from './hooks/useIsDesktop';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpAccountPage from './pages/SignUpAccountPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LeadDetailPage from './pages/LeadDetailPage';
import UsersPage from './pages/UsersPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ConnectChannelPage from './pages/ConnectChannelPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ApplicationPendingPage from './pages/ApplicationPendingPage';
import AdminApprovalsPage from './pages/AdminApprovalsPage';
import SettingsPage from './pages/SettingsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

export default function App() {
  const isDesktop = useIsDesktop();

  if (!isDesktop) return <DesktopOnly />;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpAccountPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/signup/verify" element={<VerifyEmailPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/signup/connect" element={
        <ProtectedRoute>
          <ConnectChannelPage />
        </ProtectedRoute>
      } />
      <Route path="/application-pending" element={
        <ProtectedRoute>
          <ApplicationPendingPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/approvals" element={
        <ProtectedRoute superadminOnly={true}>
          <AdminApprovalsPage />
        </ProtectedRoute>
      } />
      <Route path="/app" element={
        <ProtectedRoute requireChannel={true}>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/app/analytics" element={
        <ProtectedRoute requireChannel={true}>
          <AnalyticsPage />
        </ProtectedRoute>
      } />
      <Route path="/app/leads/:id" element={
        <ProtectedRoute requireChannel={true}>
          <LeadDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/app/users" element={
        <ProtectedRoute adminOnly={true} requireChannel={true}>
          <UsersPage />
        </ProtectedRoute>
      } />
      <Route path="/app/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
