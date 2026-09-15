import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '../../src/context/AuthContext';
import LoginPage from '../../src/pages/LoginPage';
import ProtectedRoute from '../../src/components/ProtectedRoute';

// Integration: LoginPage's fetch call -> AuthContext.login() -> localStorage ->
// navigation -> ProtectedRoute reading the newly-set user, all wired together
// exactly as App.jsx wires them (minus Sidebar/page bodies, replaced with probes).
function App({ initialPath = '/login' }) {
    return (
        <MemoryRouter initialEntries={[initialPath]}>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup/verify" element={<div>VERIFY_PAGE</div>} />
                    <Route path="/application-pending" element={<div>PENDING_PAGE</div>} />
                    <Route
                        path="/app"
                        element={
                            <ProtectedRoute>
                                <div>DASHBOARD_PAGE</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </MemoryRouter>
    );
}

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
});

async function submitLogin(email, password) {
    await userEvent.type(screen.getByLabelText('Email'), email);
    await userEvent.type(screen.getByLabelText('Password'), password);
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
}

describe('Login -> Auth -> Protected route (integration)', () => {
    it('logs in, stores the session, and lands on the protected dashboard', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: 'abc123', user: { id: 1, role: 'member', status: 'active', name: 'Sita Rai' } }),
        });

        render(<App />);
        await submitLogin('sita@example.com', 'password123');

        expect(await screen.findByText('DASHBOARD_PAGE')).toBeInTheDocument();
        expect(window.localStorage.getItem('token')).toBe('abc123');
        expect(JSON.parse(window.localStorage.getItem('user'))).toMatchObject({ id: 1, role: 'member' });
    });

    it('routes a pending_approval user to the pending page instead of the dashboard', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: 'abc123', user: { id: 1, role: 'member', status: 'pending_approval' } }),
        });

        render(<App />);
        await submitLogin('sita@example.com', 'password123');

        expect(await screen.findByText('PENDING_PAGE')).toBeInTheDocument();
    });

    it('redirects to the verify-email flow when the backend reports EMAIL_NOT_VERIFIED', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ code: 'EMAIL_NOT_VERIFIED', error: 'Please verify your email.' }),
        });

        render(<App />);
        await submitLogin('sita@example.com', 'password123');

        expect(await screen.findByText('VERIFY_PAGE')).toBeInTheDocument();
        // No session should have been persisted for an unverified login attempt.
        expect(window.localStorage.getItem('token')).toBeNull();
    });

    it('shows an inline error and stays on the login page for bad credentials', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Invalid email or password.' }),
        });

        render(<App />);
        await submitLogin('sita@example.com', 'wrongpassword');

        expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
        expect(window.localStorage.getItem('token')).toBeNull();
    });

    it('an unauthenticated visit to a protected route bounces to /login without ever calling the dashboard', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }));
        render(<App initialPath="/app" />);
        expect(await screen.findByText(/log in/i)).toBeInTheDocument();
    });
});
