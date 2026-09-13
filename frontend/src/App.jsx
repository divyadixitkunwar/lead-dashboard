import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpAccountPage from './pages/SignUpAccountPage';
import DashboardPage from './pages/DashboardPage';
import LeadDetailPage from './pages/LeadDetailPage';
import UsersPage from './pages/UsersPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ConnectChannelPage from './pages/ConnectChannelPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ApplicationPendingPage from './pages/ApplicationPendingPage';
import AdminApprovalsPage from './pages/AdminApprovalsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpAccountPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/signup/verify" element={<VerifyEmailPage />} />
      {/* Now hits real, authenticated /channels endpoints, so — unlike
          when it was a placeholder — it needs to be logged in to work
          at all. Wrapped the same way as the other real pages. Deliberately
          NOT given requireChannel — that would make it impossible to ever
          connect the first channel, since this is the one place that lets
          you get one. This is the one exception to the dashboard-wide block
          below. */}
      <Route path="/signup/connect" element={
        <ProtectedRoute>
          <ConnectChannelPage />
        </ProtectedRoute>
      } />
      {/* Wrapped in plain ProtectedRoute (not a custom "any status" guard)
          specifically so it shares the same `loading` gate as every other
          protected page — without that, this page's own redirect logic
          could fire before AuthContext finishes checking who's logged in. */}
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
    </Routes>
  );
}