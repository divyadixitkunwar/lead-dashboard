import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders, seedAuthedUser, sampleUser } from '../utils/render';
import DashboardPage from '../../src/pages/DashboardPage';
import LeadDetailPage from '../../src/pages/LeadDetailPage';

vi.mock('../../src/services/api', () => ({
    default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
import api from '../../src/services/api';

const XSS_PAYLOAD = '<img src=x onerror=alert(1)>';
const SCRIPT_PAYLOAD = '<script>window.__pwned = true</script>';

beforeEach(() => {
    vi.clearAllMocks();
    seedAuthedUser(sampleUser);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => sampleUser }));
    delete window.__pwned;
});

describe('Output escaping — lead contact names (Dashboard)', () => {
    it('renders a malicious contact_name as inert text, not as markup', async () => {
        api.get.mockImplementation((url) => {
            if (url === '/leads') return Promise.resolve({
                data: [{ id: 1, contact_name: XSS_PAYLOAD, phone: '9800000000', status: 'new', channel: 'whatsapp', intent: 'unclassified', message_type: 'general', created_at: new Date().toISOString() }],
            });
            return Promise.resolve({ data: {} });
        });
        renderWithProviders(<DashboardPage />, { route: '/app' });

        await waitFor(() => expect(screen.getByText(XSS_PAYLOAD)).toBeInTheDocument());
        // React renders it as a text node, so there must be no real <img> in the DOM for this payload.
        expect(document.querySelector('img[src="x"]')).toBeNull();
    });
});

describe('Output escaping — chat messages (LeadDetailPage)', () => {
    it('renders a <script> tag in a message body as literal text and never executes it', async () => {
        api.get.mockImplementation((url) => {
            if (url === '/leads/1') return Promise.resolve({
                data: {
                    id: 1, contact_name: 'Sita Rai', channel: 'whatsapp', status: 'new', intent: 'unclassified',
                    notes: [],
                    messages: [{ id: 1, direction: 'inbound', body: SCRIPT_PAYLOAD, received_at: new Date().toISOString() }],
                },
            });
            return Promise.resolve({ data: {} });
        });
        renderWithProviders(<LeadDetailPage />, { route: '/app/leads/1', path: '/app/leads/:id' });

        await waitFor(() => expect(screen.getByText(SCRIPT_PAYLOAD)).toBeInTheDocument());
        expect(document.querySelectorAll('script').length).toBe(0);
        expect(window.__pwned).toBeUndefined();
    });
});

describe('Source scan — no dangerouslySetInnerHTML on user-controlled content', () => {
    it('flags any use of dangerouslySetInnerHTML so it gets a manual security review', async () => {
        // Static guard: if a future change introduces dangerouslySetInnerHTML
        // anywhere in src/, this test fails loudly instead of silently
        // reopening an XSS hole.
        const fs = await import('node:fs');
        const path = await import('node:path');
        const srcDir = path.resolve(__dirname, '../../src');

        const offenders = [];
        (function walk(dir) {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) walk(full);
                else if (/\.jsx?$/.test(entry.name)) {
                    const source = fs.readFileSync(full, 'utf8');
                    if (source.includes('dangerouslySetInnerHTML')) offenders.push(full);
                }
            }
        })(srcDir);

        expect(offenders).toEqual([]);
    });
});
