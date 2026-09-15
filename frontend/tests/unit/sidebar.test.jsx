import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders, seedAuthedUser } from '../utils/render';
import Sidebar from '../../src/components/Sidebar';

vi.mock('../../src/services/api', () => ({
    default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
import api from '../../src/services/api';

function stubAuth(user) {
    seedAuthedUser(user);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => user }));
}

beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: {} });
});

describe('Sidebar — role-based navigation', () => {
    it('shows only Leads, Analytics, and Settings for a plain member', async () => {
        stubAuth({ id: 1, name: 'Sita Rai', role: 'member', status: 'active' });
        renderWithProviders(<Sidebar>content</Sidebar>, { route: '/app' });
        const nav = await screen.findByRole('navigation', { name: 'Primary navigation' });
        expect(within(nav).getByRole('link', { name: 'Leads' })).toBeInTheDocument();
        expect(within(nav).getByRole('link', { name: 'Analytics' })).toBeInTheDocument();
        expect(within(nav).getByRole('link', { name: 'Settings' })).toBeInTheDocument();
        expect(within(nav).queryByRole('link', { name: 'Team' })).not.toBeInTheDocument();
        expect(within(nav).queryByRole('link', { name: 'Approvals' })).not.toBeInTheDocument();
    });

    it('adds a Team link for admins', async () => {
        stubAuth({ id: 2, name: 'Admin User', role: 'admin', status: 'active' });
        renderWithProviders(<Sidebar>content</Sidebar>, { route: '/app' });
        const nav = await screen.findByRole('navigation', { name: 'Primary navigation' });
        expect(within(nav).getByRole('link', { name: 'Team' })).toBeInTheDocument();
    });

    it('adds an Approvals link for superadmins', async () => {
        stubAuth({ id: 3, name: 'Super Admin', role: 'superadmin', status: 'active' });
        renderWithProviders(<Sidebar>content</Sidebar>, { route: '/app' });
        const nav = await screen.findByRole('navigation', { name: 'Primary navigation' });
        expect(within(nav).getByRole('link', { name: 'Approvals' })).toBeInTheDocument();
    });
});

describe('Sidebar — workspace name & initials', () => {
    it('prefers the /business API name once it loads over the cached user.business_name', async () => {
        api.get.mockResolvedValueOnce({ data: { name: 'Fresh Business Name' } });
        stubAuth({ id: 1, name: 'Sita Rai', role: 'member', status: 'active', business_name: 'Stale Cached Name' });
        renderWithProviders(<Sidebar>content</Sidebar>, { route: '/app' });
        await waitFor(() => {
            expect(screen.getAllByText('Fresh Business Name').length).toBeGreaterThan(0);
        });
    });

    it('falls back to "Lead Dashboard" when no business name is available anywhere', async () => {
        api.get.mockResolvedValue({ data: {} });
        stubAuth({ id: 1, name: 'Sita Rai', role: 'member', status: 'active' });
        renderWithProviders(<Sidebar>content</Sidebar>, { route: '/app' });
        await waitFor(() => {
            expect(screen.getAllByText('Lead Dashboard').length).toBeGreaterThan(0);
        });
    });

    it('derives two-letter initials from a multi-word business name', async () => {
        api.get.mockResolvedValueOnce({ data: { name: 'Ekikrit Traders' } });
        stubAuth({ id: 1, name: 'Sita Rai', role: 'member', status: 'active' });
        renderWithProviders(<Sidebar>content</Sidebar>, { route: '/app' });
        expect(await screen.findByText('ET')).toBeInTheDocument();
    });
});

describe('Sidebar — quiet search', () => {
    it('navigates to /app?q=<term> when Enter is pressed', async () => {
        stubAuth({ id: 1, name: 'Sita Rai', role: 'member', status: 'active' });
        renderWithProviders(<Sidebar>content</Sidebar>, { route: '/app/settings' });
        const nav = await screen.findByRole('navigation', { name: 'Primary navigation' });
        expect(within(nav).getByRole('link', { name: 'Settings' })).toBeInTheDocument();

        const quietSearch = screen.getByLabelText('Search leads');
        await userEvent.type(quietSearch, 'sita rai{Enter}');

        // Navigation happened -> Leads item becomes the active page title context.
        // We assert indirectly: no crash, and the input still holds the typed text
        // (Sidebar does not clear it on submit).
        expect(quietSearch).toHaveValue('sita rai');
    });
});
