import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeadDetailPage from './pages/LeadDetailPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/app" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/app/leads/:id" element={
        <ProtectedRoute>
          <LeadDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/app/users" element={
        <ProtectedRoute adminOnly={true}>
          <UsersPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}