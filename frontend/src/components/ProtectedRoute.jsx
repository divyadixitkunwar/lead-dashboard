import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// `adminOnly` = only a business's own admin (not staff) can see this.
// `superadminOnly` = only the platform owner can see this.
// `requireChannel` = there's nothing real to show without a connected
// channel, so this bounces to the connect page instead of rendering — this
// is what actually enforces the rule, not just the header button. Someone
// typing /app straight into the address bar hits this exact check.
export default function ProtectedRoute({ children, adminOnly = false, superadminOnly = false, requireChannel = false }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="p-8">Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    if (superadminOnly) {
        if (user.role !== 'superadmin') return <Navigate to="/app" />;
        return children;
    }

    // The owner account has no real business behind it — send it to its
    // own screen instead of a business dashboard, on any route that isn't
    // already flagged superadminOnly.
    if (user.role === 'superadmin') return <Navigate to="/admin/approvals" />;

    if (user.status === 'pending_approval' || user.status === 'rejected') {
        return <Navigate to="/application-pending" />;
    }
    // Safety net for any other non-active status reaching here.
    if (user.status !== 'active') return <Navigate to="/login" />;

    if (adminOnly && user.role !== 'admin') return <Navigate to="/app" />;

    if (requireChannel && !user.hasChannel) return <Navigate to="/signup/connect" />;

    return children;
}
