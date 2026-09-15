import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../src/context/AuthContext';

/**
 * Renders a component wrapped in MemoryRouter + AuthProvider, the same
 * providers main.jsx sets up around the real app.
 *
 * @param {React.ReactNode} ui
 * @param {object} options
 * @param {string} [options.route] - initial URL, e.g. '/app/leads/12'
 * @param {string[]} [options.entries] - full history stack, overrides `route`
 * @param {string} [options.path] - route pattern (e.g. '/app/leads/:id') so
 *   pages that call useParams() resolve real params. Omit for pages with no
 *   URL params.
 */
export function renderWithProviders(ui, { route = '/', entries, path } = {}) {
    const initialEntries = entries || [route];
    const content = path
        ? <Routes><Route path={path} element={ui} /></Routes>
        : ui;
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <AuthProvider>{content}</AuthProvider>
        </MemoryRouter>
    );
}

/** Seeds localStorage the way AuthContext/login() would, before mount. */
export function seedAuthedUser(user, token = 'test-token') {
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('user', JSON.stringify(user));
}

export const sampleUser = {
    id: 1,
    name: 'Nima Sherpa',
    email: 'nima@example.com',
    role: 'member',
    status: 'active',
    hasChannel: true,
    business_name: 'Ekikrit Traders',
};
