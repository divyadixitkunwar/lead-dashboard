import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders, seedAuthedUser, sampleUser } from '../utils/render';
import DashboardPage from '../../src/pages/DashboardPage';

// api.js is the axios wrapper every page uses for authenticated calls.
// Mocking it here isolates DashboardPage's own logic (search/filter/stats)
// from the network and from Sidebar's own `/business` call.
vi.mock('../../src/services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

import api from '../../src/services/api';

const LEADS = [
    { id: 1, contact_name: 'Sita Rai', phone: '9812345678', status: 'new', channel: 'whatsapp', intent: 'price_inquiry', message_type: 'customer_lead', possible_duplicate: false, created_at: new Date().toISOString() },
    { id: 2, contact_name: 'Gopal Thapa', phone: '9800000000', status: 'qualified', channel: 'messenger', intent: 'delivery_inquiry', message_type: 'customer_lead', possible_duplicate: true, created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
    { id: 3, contact_name: '', phone: '9877777777', status: 'new', channel: 'instagram', intent: 'unclassified', message_type: 'general', possible_duplicate: false, created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
];

function mockApiForLeads(leads = LEADS) {
    api.get.mockImplementation((url) => {
        if (url === '/leads') return Promise.resolve({ data: leads });
        if (url === '/business') return Promise.resolve({ data: { name: 'Ekikrit Traders' } });
        return Promise.resolve({ data: {} });
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    seedAuthedUser(sampleUser);
    // AuthContext refetches /auth/me on mount; keep it quiet and resolved.
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => sampleUser,
    }));
});

describe('DashboardPage — search', () => {
    it('shows every lead when the search box is empty', async () => {
        mockApiForLeads();
        renderWithProviders(<DashboardPage />, { route: '/app' });
        await waitFor(() => expect(screen.getByText('Sita Rai')).toBeInTheDocument());
        expect(screen.getByText('Gopal Thapa')).toBeInTheDocument();
        expect(screen.getByText('Unknown contact')).toBeInTheDocument();
    });

    it('filters by contact name, case-insensitively', async () => {
        mockApiForLeads();
        renderWithProviders(<DashboardPage />, { route: '/app' });
        await waitFor(() => expect(screen.getByText('Sita Rai')).toBeInTheDocument());

        await userEvent.type(screen.getByPlaceholderText('Search by name or phone'), 'sita');

        expect(screen.getByText('Sita Rai')).toBeInTheDocument();
        expect(screen.queryByText('Gopal Thapa')).not.toBeInTheDocument();
    });

    it('filters by phone number (exact substring, case-sensitive as typed)', async () => {
        mockApiForLeads();
        renderWithProviders(<DashboardPage />, { route: '/app' });
        await waitFor(() => expect(screen.getByText('Sita Rai')).toBeInTheDocument());

        await userEvent.type(screen.getByPlaceholderText('Search by name or phone'), '9800000000');

        expect(screen.getByText('Gopal Thapa')).toBeInTheDocument();
        expect(screen.queryByText('Sita Rai')).not.toBeInTheDocument();
    });

    it('shows the empty state when nothing matches', async () => {
        mockApiForLeads();
        renderWithProviders(<DashboardPage />, { route: '/app' });
        await waitFor(() => expect(screen.getByText('Sita Rai')).toBeInTheDocument());

        await userEvent.type(screen.getByPlaceholderText('Search by name or phone'), 'zzz-no-match');

        expect(screen.getByText('No leads found')).toBeInTheDocument();
    });

    it('initializes the search box from the ?q= URL param', async () => {
        mockApiForLeads();
        renderWithProviders(<DashboardPage />, { entries: ['/app?q=Gopal'] });
        await waitFor(() => expect(screen.getByDisplayValue('Gopal')).toBeInTheDocument());
        expect(screen.getByText('Gopal Thapa')).toBeInTheDocument();
        expect(screen.queryByText('Sita Rai')).not.toBeInTheDocument();
    });
});

describe('DashboardPage — filters', () => {
    it('re-fetches leads with the chosen status as a query param', async () => {
        mockApiForLeads();
        renderWithProviders(<DashboardPage />, { route: '/app' });
        await waitFor(() => expect(screen.getByText('Sita Rai')).toBeInTheDocument());

        await userEvent.selectOptions(screen.getByLabelText('Status'), 'qualified');

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/leads', { params: { status: 'qualified' } });
        });
    });

    it('omits empty filters from the request params', async () => {
        mockApiForLeads();
        renderWithProviders(<DashboardPage />, { route: '/app' });
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/leads', { params: {} }));
    });

    it('shows "Clear filters" only once a filter or search is active, and clears both', async () => {
        mockApiForLeads();
        renderWithProviders(<DashboardPage />, { route: '/app' });
        await waitFor(() => expect(screen.getByText('Sita Rai')).toBeInTheDocument());

        expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();

        await userEvent.type(screen.getByPlaceholderText('Search by name or phone'), 'Sita');
        expect(screen.getByText('Clear filters')).toBeInTheDocument();

        await userEvent.click(screen.getByText('Clear filters'));
        expect(screen.getByPlaceholderText('Search by name or phone')).toHaveValue('');
        expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
    });

    it('combines multiple filters into one request', async () => {
        mockApiForLeads();
        renderWithProviders(<DashboardPage />, { route: '/app' });
        await waitFor(() => expect(screen.getByText('Sita Rai')).toBeInTheDocument());

        await userEvent.selectOptions(screen.getByLabelText('Channel'), 'whatsapp');
        await userEvent.selectOptions(screen.getByLabelText('Intent'), 'price_inquiry');

        await waitFor(() => {
            expect(api.get).toHaveBeenLastCalledWith('/leads', {
                params: { channel: 'whatsapp', intent: 'price_inquiry' },
            });
        });
    });
});

describe('DashboardPage — stats', () => {
    it('computes total / new / qualified / duplicate counts from the fetched leads', async () => {
        mockApiForLeads();
        renderWithProviders(<DashboardPage />, { route: '/app' });
        await waitFor(() => expect(screen.getByText('Sita Rai')).toBeInTheDocument());

        const grid = screen.getByText('Total leads').closest('div').parentElement;
        expect(within(grid).getByText('3')).toBeInTheDocument(); // total
        // "New" and "Duplicates" both equal 2 and 1 respectively; assert via sub-labels
        expect(screen.getByText('Awaiting response')).toBeInTheDocument();
        expect(screen.getByText('Needs review')).toBeInTheDocument();
    });

    it('shows zero-state stats and an empty table when the API returns no leads', async () => {
        mockApiForLeads([]);
        renderWithProviders(<DashboardPage />, { route: '/app' });
        await waitFor(() => expect(screen.getByText('No leads found')).toBeInTheDocument());
        expect(screen.getByText('Total leads').parentElement).toHaveTextContent('0');
    });

    it('falls back to "Unknown contact" and blank avatar initial when name is missing', async () => {
        mockApiForLeads();
        renderWithProviders(<DashboardPage />, { route: '/app' });
        await waitFor(() => expect(screen.getByText('Unknown contact')).toBeInTheDocument());
    });

    it('shows a DUP marker only for leads flagged possible_duplicate', async () => {
        mockApiForLeads();
        renderWithProviders(<DashboardPage />, { route: '/app' });
        await waitFor(() => expect(screen.getByText('Gopal Thapa')).toBeInTheDocument());
        const gopalRow = screen.getByText('Gopal Thapa').closest('.dashboard-contact-copy');
        expect(within(gopalRow).getByText('DUP')).toBeInTheDocument();
        const sitaRow = screen.getByText('Sita Rai').closest('.dashboard-contact-copy');
        expect(within(sitaRow).queryByText('DUP')).not.toBeInTheDocument();
    });
});

describe('DashboardPage — relative date formatting', () => {
    it('renders minutes-ago for very recent leads and hours-ago for older-but-same-day leads', async () => {
        mockApiForLeads();
        renderWithProviders(<DashboardPage />, { route: '/app' });
        await waitFor(() => expect(screen.getByText('Sita Rai')).toBeInTheDocument());
        // Sita's created_at is "now" -> "1m ago"; Gopal's is 2h old -> "2h ago"
        expect(screen.getByText('1m ago')).toBeInTheDocument();
        expect(screen.getByText('2h ago')).toBeInTheDocument();
    });

    it('shows loading state before the request resolves', async () => {
        let resolveFn;
        api.get.mockImplementation((url) => {
            if (url === '/leads') return new Promise((res) => { resolveFn = res; });
            return Promise.resolve({ data: {} });
        });
        renderWithProviders(<DashboardPage />, { route: '/app' });
        expect(screen.getByText('Loading leads...')).toBeInTheDocument();
        resolveFn({ data: LEADS });
        await waitFor(() => expect(screen.getByText('Sita Rai')).toBeInTheDocument());
    });

    it('renders an empty table (not a crash) if the leads request fails', async () => {
        api.get.mockImplementation((url) => {
            if (url === '/leads') return Promise.reject(new Error('network down'));
            return Promise.resolve({ data: {} });
        });
        renderWithProviders(<DashboardPage />, { route: '/app' });
        await waitFor(() => expect(screen.getByText('No leads found')).toBeInTheDocument());
    });
});
