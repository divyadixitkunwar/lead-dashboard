import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeadDetailPage from './pages/LeadDetailPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/leads/:id" element={
        <ProtectedRoute>
          <LeadDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute adminOnly={true}>
          <UsersPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}