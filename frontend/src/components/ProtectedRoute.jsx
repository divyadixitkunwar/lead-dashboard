import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false, superadminOnly = false, requireChannel = false }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="p-8">Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    if (superadminOnly) {
        if (user.role !== 'superadmin') return <Navigate to="/app" />;
        return children;
    }

    if (user.role === 'superadmin') return <Navigate to="/admin/approvals" />;

    if ((user.status === 'pending_approval' || user.status === 'rejected') && location.pathname !== '/application-pending') {
        return <Navigate to="/application-pending" />;
    }
    if (user.status !== 'active' && user.status !== 'pending_approval' && user.status !== 'rejected') return <Navigate to="/login" />;

    if (adminOnly && user.role !== 'admin') return <Navigate to="/app" />;

    if (requireChannel && !user.hasChannel) return <Navigate to="/signup/connect" />;

    return children;
}
