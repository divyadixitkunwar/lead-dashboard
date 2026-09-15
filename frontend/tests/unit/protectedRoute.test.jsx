import { screen, waitFor } from '@testing-library/react';
import { Routes, Route, MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider } from '../../src/context/AuthContext';
import { seedAuthedUser } from '../utils/render';
import ProtectedRoute from '../../src/components/ProtectedRoute';

function Probe({ label }) {
    return <div>{label}</div>;
}

function renderProtected({ user, entryPath = '/protected-test', adminOnly, superadminOnly, requireChannel }) {
    if (user) seedAuthedUser(user);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: !!user,
        status: user ? 200 : 401,
        json: async () => user || {},
    }));

    return render(
        <MemoryRouter initialEntries={[entryPath]}>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Probe label="LOGIN_PAGE" />} />
                    <Route path="/app" element={<Probe label="APP_PAGE" />} />
                    <Route path="/application-pending" element={<Probe label="PENDING_PAGE" />} />
                    <Route path="/signup/connect" element={<Probe label="CONNECT_PAGE" />} />
                    <Route path="/admin/approvals" element={<Probe label="ADMIN_APPROVALS_PAGE" />} />
                    <Route
                        path="/protected-test"
                        element={
                            <ProtectedRoute adminOnly={adminOnly} superadminOnly={superadminOnly} requireChannel={requireChannel}>
                                <Probe label="PROTECTED_CONTENT" />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </MemoryRouter>
    );
}

describe('ProtectedRoute', () => {
    it('redirects to /login when there is no authenticated user', async () => {
        renderProtected({ user: null });
        expect(await screen.findByText('LOGIN_PAGE')).toBeInTheDocument();
    });

    it('renders the protected content for an active member', async () => {
        renderProtected({ user: { id: 1, role: 'member', status: 'active' } });
        expect(await screen.findByText('PROTECTED_CONTENT')).toBeInTheDocument();
    });

    it('redirects superadmins to /admin/approvals instead of the normal app route', async () => {
        renderProtected({ user: { id: 2, role: 'superadmin', status: 'active' } });
        expect(await screen.findByText('ADMIN_APPROVALS_PAGE')).toBeInTheDocument();
    });

    it('lets a superadmin through on a superadminOnly route', async () => {
        renderProtected({ user: { id: 2, role: 'superadmin', status: 'active' }, superadminOnly: true });
        expect(await screen.findByText('PROTECTED_CONTENT')).toBeInTheDocument();
    });

    it('bounces a non-superadmin off a superadminOnly route back to /app', async () => {
        renderProtected({ user: { id: 1, role: 'member', status: 'active' }, superadminOnly: true });
        expect(await screen.findByText('APP_PAGE')).toBeInTheDocument();
    });

    it('sends a pending_approval user to /application-pending', async () => {
        renderProtected({ user: { id: 1, role: 'member', status: 'pending_approval' } });
        expect(await screen.findByText('PENDING_PAGE')).toBeInTheDocument();
    });

    it('sends a rejected user to /application-pending', async () => {
        renderProtected({ user: { id: 1, role: 'member', status: 'rejected' } });
        expect(await screen.findByText('PENDING_PAGE')).toBeInTheDocument();
    });

    it('sends a user with an unrecognized status back to /login', async () => {
        renderProtected({ user: { id: 1, role: 'member', status: 'suspended' } });
        expect(await screen.findByText('LOGIN_PAGE')).toBeInTheDocument();
    });

    it('blocks a non-admin member from an adminOnly route', async () => {
        renderProtected({ user: { id: 1, role: 'member', status: 'active' }, adminOnly: true });
        expect(await screen.findByText('APP_PAGE')).toBeInTheDocument();
    });

    it('lets an admin through on an adminOnly route', async () => {
        renderProtected({ user: { id: 1, role: 'admin', status: 'active' }, adminOnly: true });
        expect(await screen.findByText('PROTECTED_CONTENT')).toBeInTheDocument();
    });

    it('redirects a user without a connected channel on a requireChannel route', async () => {
        renderProtected({ user: { id: 1, role: 'member', status: 'active', hasChannel: false }, requireChannel: true });
        expect(await screen.findByText('CONNECT_PAGE')).toBeInTheDocument();
    });

    it('lets a user with a connected channel through a requireChannel route', async () => {
        renderProtected({ user: { id: 1, role: 'member', status: 'active', hasChannel: true }, requireChannel: true });
        expect(await screen.findByText('PROTECTED_CONTENT')).toBeInTheDocument();
    });
});
