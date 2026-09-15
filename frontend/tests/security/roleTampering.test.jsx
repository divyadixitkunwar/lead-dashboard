import { screen, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '../../src/context/AuthContext';
import ProtectedRoute from '../../src/components/ProtectedRoute';

function Probe({ label }) { return <div>{label}</div>; }

function renderTamperedApp({ cachedUser, serverUser }) {
    window.localStorage.setItem('token', 'stolen-or-tampered-token');
    window.localStorage.setItem('user', JSON.stringify(cachedUser));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => serverUser,
    }));

    return render(
        <MemoryRouter initialEntries={['/admin/approvals']}>
            <AuthProvider>
                <Routes>
                    <Route path="/app" element={<Probe label="APP_PAGE" />} />
                    <Route path="/login" element={<Probe label="LOGIN_PAGE" />} />
                    <Route
                        path="/admin/approvals"
                        element={
                            <ProtectedRoute superadminOnly>
                                <Probe label="SUPERADMIN_ONLY_CONTENT" />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </MemoryRouter>
    );
}

describe('Security — client-side role tampering is overridden by the server', () => {
    it('revokes access once /auth/me confirms the user is not actually a superadmin', async () => {
        // Attacker edits localStorage.user to claim role: 'superadmin' before the
        // page loads. AuthContext renders the cached value first (a brief flash
        // is acceptable), but must re-sync to the server's answer and the
        // protected route must re-evaluate against the corrected role.
        renderTamperedApp({
            cachedUser: { id: 1, role: 'superadmin', status: 'active' }, // tampered
            serverUser: { id: 1, role: 'member', status: 'active' },    // ground truth
        });

        await waitFor(() => {
            expect(screen.queryByText('SUPERADMIN_ONLY_CONTENT')).not.toBeInTheDocument();
        });
        expect(await screen.findByText('APP_PAGE')).toBeInTheDocument();
    });

    it('logs the user out immediately if the server says the token is no longer valid (401)', async () => {
        window.localStorage.setItem('token', 'revoked-token');
        window.localStorage.setItem('user', JSON.stringify({ id: 1, role: 'superadmin', status: 'active' }));
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }));

        render(
            <MemoryRouter initialEntries={['/admin/approvals']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Probe label="LOGIN_PAGE" />} />
                        <Route
                            path="/admin/approvals"
                            element={
                                <ProtectedRoute superadminOnly>
                                    <Probe label="SUPERADMIN_ONLY_CONTENT" />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        expect(await screen.findByText('LOGIN_PAGE')).toBeInTheDocument();
        expect(window.localStorage.getItem('token')).toBeNull();
        expect(window.localStorage.getItem('user')).toBeNull();
    });
});

