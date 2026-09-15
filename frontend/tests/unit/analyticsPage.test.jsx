import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders, seedAuthedUser, sampleUser } from '../utils/render';
import AnalyticsPage from '../../src/pages/AnalyticsPage';

vi.mock('../../src/services/api', () => ({
    default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
import api from '../../src/services/api';

// recharts' ResponsiveContainer measures its container via ResizeObserver/
// getBoundingClientRect, which always report 0x0 in jsdom, so charts skip
// rendering children entirely. Mock it to render children at a fixed size
// so chart labels/bars are actually present in the test DOM.
vi.mock('recharts', async () => {
    const actual = await vi.importActual('recharts');
    return {
        ...actual,
        ResponsiveContainer: ({ children }) => <div>{children}</div>,
        // Real BarChart needs actual layout (width/height) to render its
        // children (XAxis/YAxis/Tooltip/Bar), which jsdom can't provide, and
        // Tooltip's internals crash on window.matchMedia in this test env.
        // The tests only need to see that formatName()'d labels reached the
        // chart's data, so stub BarChart to just print its data as text.
        BarChart: ({ data }) => (
            <div data-testid="mock-barchart">
                {(data || []).map((d, i) => (
                    <div key={i}><span>{d.name}</span><span>{d.count}</span></div>
                ))}
            </div>
        ),
    };
});


function mockAnalytics({ summary, responseTime }) {
    api.get.mockImplementation((url) => {
        if (url === '/analytics/summary') return Promise.resolve({ data: summary });
        if (url === '/analytics/response-time') return Promise.resolve({ data: responseTime });
        if (url === '/business') return Promise.resolve({ data: {} });
        return Promise.resolve({ data: {} });
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    seedAuthedUser(sampleUser);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => sampleUser }));
});

describe('AnalyticsPage — duration formatting (fmtDuration)', () => {
    it('shows an em dash placeholder when there is no response-time data yet', async () => {
        mockAnalytics({ summary: { total: 0, duplicates: 0, byDay: {}, byChannel: [], byIntent: [], byStatus: [] }, responseTime: { avg_response_ms: null } });
        renderWithProviders(<AnalyticsPage />, { route: '/app/analytics' });
        expect(await screen.findByText('—')).toBeInTheDocument();
    });

    it('formats sub-hour durations in minutes', async () => {
        mockAnalytics({ summary: { total: 5, duplicates: 0, byDay: {}, byChannel: [], byIntent: [], byStatus: [] }, responseTime: { avg_response_ms: 42 * 60000 } });
        renderWithProviders(<AnalyticsPage />, { route: '/app/analytics' });
        expect(await screen.findByText('42m')).toBeInTheDocument();
    });

    it('formats multi-hour durations as "Xh Ym"', async () => {
        mockAnalytics({ summary: { total: 5, duplicates: 0, byDay: {}, byChannel: [], byIntent: [], byStatus: [] }, responseTime: { avg_response_ms: (2 * 60 + 15) * 60000 } });
        renderWithProviders(<AnalyticsPage />, { route: '/app/analytics' });
        expect(await screen.findByText('2h 15m')).toBeInTheDocument();
    });

    it('drops the minutes suffix on an exact-hour duration', async () => {
        mockAnalytics({ summary: { total: 5, duplicates: 0, byDay: {}, byChannel: [], byIntent: [], byStatus: [] }, responseTime: { avg_response_ms: 3 * 3600000 } });
        renderWithProviders(<AnalyticsPage />, { route: '/app/analytics' });
        expect(await screen.findByText('3h')).toBeInTheDocument();
    });
});

describe('AnalyticsPage — duplicate rate', () => {
    it('shows 0% when there are no leads at all (avoids divide-by-zero)', async () => {
        mockAnalytics({ summary: { total: 0, duplicates: 0, byDay: {}, byChannel: [], byIntent: [], byStatus: [] }, responseTime: {} });
        renderWithProviders(<AnalyticsPage />, { route: '/app/analytics' });
        expect(await screen.findByText('0% of all leads')).toBeInTheDocument();
    });

    it('computes and rounds the duplicate percentage to one decimal', async () => {
        mockAnalytics({ summary: { total: 3, duplicates: 1, byDay: {}, byChannel: [], byIntent: [], byStatus: [] }, responseTime: {} });
        renderWithProviders(<AnalyticsPage />, { route: '/app/analytics' });
        // 1/3 = 33.333...% -> "33.3%"
        expect(await screen.findByText('33.3% of all leads')).toBeInTheDocument();
    });
});

describe('AnalyticsPage — label formatting (formatName)', () => {
    it('converts snake_case channel/intent labels into Title Case with spaces', async () => {
        mockAnalytics({
            summary: {
                total: 10, duplicates: 0, byDay: {},
                byChannel: [{ channel: 'price_inquiry', _count: 4 }],
                byIntent: [{ intent: 'delivery_inquiry', _count: 6 }],
                byStatus: [],
            },
            responseTime: {},
        });
        renderWithProviders(<AnalyticsPage />, { route: '/app/analytics' });
        expect(await screen.findByText('Price Inquiry')).toBeInTheDocument();
        expect(await screen.findByText('Delivery Inquiry')).toBeInTheDocument();
    });

    it('always renders all four funnel stages, defaulting missing ones to 0', async () => {
        mockAnalytics({
            summary: {
                total: 1, duplicates: 0, byDay: {}, byChannel: [], byIntent: [],
                byStatus: [{ status: 'new', _count: 1 }],
            },
            responseTime: {},
        });
        renderWithProviders(<AnalyticsPage />, { route: '/app/analytics' });
        // "Closed" has no entry in byStatus and should still render via formatName default
        expect(await screen.findByText('Closed')).toBeInTheDocument();
        expect(screen.getByText('Contacted')).toBeInTheDocument();
        expect(screen.getByText('Qualified')).toBeInTheDocument();
    });
});

describe('AnalyticsPage — loading & error states', () => {
    it('shows a loading state before data resolves', () => {
        api.get.mockImplementation(() => new Promise(() => {})); // never resolves
        renderWithProviders(<AnalyticsPage />, { route: '/app/analytics' });
        expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
    });

    it('shows an error message if either analytics request fails', async () => {
        api.get.mockImplementation((url) => {
            if (url === '/analytics/summary') return Promise.reject(new Error('down'));
            return Promise.resolve({ data: {} });
        });
        renderWithProviders(<AnalyticsPage />, { route: '/app/analytics' });
        expect(await screen.findByText('Unable to load analytics.')).toBeInTheDocument();
    });
});
