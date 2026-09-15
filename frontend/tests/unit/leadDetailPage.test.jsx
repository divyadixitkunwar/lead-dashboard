import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders, seedAuthedUser, sampleUser } from '../utils/render';
import LeadDetailPage from '../../src/pages/LeadDetailPage';

vi.mock('../../src/services/api', () => ({
    default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
import api from '../../src/services/api';

function baseLead(overrides = {}) {
    return {
        id: 12,
        contact_name: 'Sita Rai',
        phone: '9812345678',
        channel: 'messenger',
        status: 'new',
        intent: 'price_inquiry',
        notes: [],
        messages: [],
        ...overrides,
    };
}

function mockLead(lead) {
    api.get.mockImplementation((url) => {
        if (url === `/leads/${lead.id}`) return Promise.resolve({ data: lead });
        if (url === '/business') return Promise.resolve({ data: {} });
        return Promise.resolve({ data: {} });
    });
}

async function renderLead(lead) {
    renderWithProviders(<LeadDetailPage />, { route: `/app/leads/${lead.id}`, path: '/app/leads/:id' });
    await waitFor(() => expect(screen.getAllByText('Messages').length).toBeGreaterThan(0));
}

beforeEach(() => {
    vi.clearAllMocks();
    seedAuthedUser(sampleUser);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => sampleUser }));
});

describe('LeadDetailPage — 24-hour reply window', () => {
    it('hides the reply composer entirely for whatsapp leads (no window restriction UI)', async () => {
        const lead = baseLead({ channel: 'whatsapp', messages: [
            { id: 1, direction: 'inbound', body: 'hi', received_at: new Date().toISOString() },
        ] });
        mockLead(lead);
        await renderLead(lead);
        expect(screen.queryByPlaceholderText('Type a reply...')).not.toBeInTheDocument();
        expect(screen.queryByText(/24-hour reply window/i)).not.toBeInTheDocument();
    });

    it('shows the composer for messenger leads when the last inbound message is under 24h old', async () => {
        const lead = baseLead({ channel: 'messenger', messages: [
            { id: 1, direction: 'inbound', body: 'hi', received_at: new Date(Date.now() - 60 * 1000).toISOString() },
        ] });
        mockLead(lead);
        await renderLead(lead);
        expect(screen.getByPlaceholderText('Type a reply...')).toBeInTheDocument();
    });

    it('blocks the composer for instagram leads once the last inbound message is over 24h old', async () => {
        const lead = baseLead({ channel: 'instagram', messages: [
            { id: 1, direction: 'inbound', body: 'hi', received_at: new Date(Date.now() - 25 * 3600 * 1000).toISOString() },
        ] });
        mockLead(lead);
        await renderLead(lead);
        expect(screen.getByText(/Outside the 24-hour reply window/i)).toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Type a reply...')).not.toBeInTheDocument();
    });

    it('treats a lead with no inbound messages as window-closed', async () => {
        const lead = baseLead({ channel: 'messenger', messages: [
            { id: 1, direction: 'outbound', body: 'hi', received_at: new Date().toISOString() },
        ] });
        mockLead(lead);
        await renderLead(lead);
        expect(screen.getByText(/Outside the 24-hour reply window/i)).toBeInTheDocument();
    });

    it('uses the most recent inbound message to decide the window, ignoring older ones', async () => {
        const lead = baseLead({
            channel: 'messenger',
            messages: [
                { id: 1, direction: 'inbound', body: 'old', received_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString() },
                { id: 2, direction: 'outbound', body: 'reply', received_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString() },
                { id: 3, direction: 'inbound', body: 'recent', received_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
            ],
        });
        mockLead(lead);
        await renderLead(lead);
        expect(screen.getByPlaceholderText('Type a reply...')).toBeInTheDocument();
    });
});

describe('LeadDetailPage — reply composer', () => {
    function openLead() {
        return baseLead({ channel: 'messenger', messages: [
            { id: 1, direction: 'inbound', body: 'hi', received_at: new Date().toISOString() },
        ] });
    }

    it('disables Send while the textarea is empty or whitespace-only', async () => {
        const lead = openLead();
        mockLead(lead);
        await renderLead(lead);
        const sendBtn = screen.getByRole('button', { name: 'Send' });
        expect(sendBtn).toBeDisabled();

        await userEvent.type(screen.getByPlaceholderText('Type a reply...'), '   ');
        expect(sendBtn).toBeDisabled();
    });

    it('sends the trimmed reply content and clears the textarea on success', async () => {
        const lead = openLead();
        mockLead(lead);
        api.post.mockResolvedValueOnce({ data: {} });
        await renderLead(lead);

        await userEvent.type(screen.getByPlaceholderText('Type a reply...'), '  We ship tomorrow  ');
        await userEvent.click(screen.getByRole('button', { name: 'Send' }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/leads/12/reply', { content: 'We ship tomorrow' });
        });
        await waitFor(() => expect(screen.getByPlaceholderText('Type a reply...')).toHaveValue(''));
    });

    it('shows the server error message and keeps the draft when sending fails', async () => {
        const lead = openLead();
        mockLead(lead);
        api.post.mockRejectedValueOnce({ response: { data: { error: 'Outside messaging window' } } });
        await renderLead(lead);

        await userEvent.type(screen.getByPlaceholderText('Type a reply...'), 'hello there');
        await userEvent.click(screen.getByRole('button', { name: 'Send' }));

        expect(await screen.findByText('Outside messaging window')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Type a reply...')).toHaveValue('hello there');
    });

    it('falls back to a generic failure message when the server gives no error field', async () => {
        const lead = openLead();
        mockLead(lead);
        api.post.mockRejectedValueOnce(new Error('boom'));
        await renderLead(lead);

        await userEvent.type(screen.getByPlaceholderText('Type a reply...'), 'hello there');
        await userEvent.click(screen.getByRole('button', { name: 'Send' }));

        expect(await screen.findByText('Failed to send message')).toBeInTheDocument();
    });
});

describe('LeadDetailPage — suggest reply', () => {
    function openLead() {
        return baseLead({ channel: 'messenger', messages: [
            { id: 1, direction: 'inbound', body: 'How much for delivery?', received_at: new Date().toISOString() },
        ] });
    }

    it('fills the textarea with the AI-suggested draft', async () => {
        const lead = openLead();
        mockLead(lead);
        api.post.mockResolvedValueOnce({ data: { draft: 'Delivery is Rs. 200 within the valley.' } });
        await renderLead(lead);

        await userEvent.click(screen.getByRole('button', { name: 'Suggest reply' }));

        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/leads/12/suggest-reply'));
        expect(await screen.findByDisplayValue('Delivery is Rs. 200 within the valley.')).toBeInTheDocument();
    });

    it('shows a friendly error and leaves the textarea untouched if suggestion generation fails', async () => {
        const lead = openLead();
        mockLead(lead);
        api.post.mockRejectedValueOnce(new Error('gemini down'));
        await renderLead(lead);

        await userEvent.click(screen.getByRole('button', { name: 'Suggest reply' }));

        expect(await screen.findByText('Could not generate a suggestion right now')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Type a reply...')).toHaveValue('');
    });

    it('disables the Suggest button and shows a "Thinking..." label while in flight', async () => {
        const lead = openLead();
        mockLead(lead);
        let resolveFn;
        api.post.mockImplementation(() => new Promise((res) => { resolveFn = res; }));
        await renderLead(lead);

        await userEvent.click(screen.getByRole('button', { name: 'Suggest reply' }));
        expect(screen.getByRole('button', { name: 'Thinking...' })).toBeDisabled();

        resolveFn({ data: { draft: 'draft text' } });
        await waitFor(() => expect(screen.getByRole('button', { name: 'Suggest reply' })).toBeEnabled());
    });
});

describe('LeadDetailPage — status + notes', () => {
    it('optimistically updates status and persists it via PATCH', async () => {
        const lead = baseLead({ channel: 'whatsapp' });
        mockLead(lead);
        api.patch.mockResolvedValueOnce({ data: {} });
        await renderLead(lead);

        await userEvent.selectOptions(screen.getByDisplayValue(/new/i), 'qualified');

        await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/leads/12', { status: 'qualified' }));
    });

    it('does not submit an empty or whitespace-only note', async () => {
        const lead = baseLead({ channel: 'whatsapp' });
        mockLead(lead);
        await renderLead(lead);

        const noteBox = screen.getByPlaceholderText('Write a note about this lead...');
        await userEvent.type(noteBox, '   ');
        const addBtn = screen.getByRole('button', { name: 'Add Note' });
        await userEvent.click(addBtn);

        expect(api.post).not.toHaveBeenCalledWith(expect.stringContaining('/notes'), expect.anything());
    });
});
