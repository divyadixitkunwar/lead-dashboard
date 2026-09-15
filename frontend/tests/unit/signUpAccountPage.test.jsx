import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from '../utils/render';
import SignUpAccountPage from '../../src/pages/SignUpAccountPage';

async function fillForm({ password }) {
    await userEvent.type(screen.getByLabelText('Business name'), 'Ekikrit Traders');
    await userEvent.type(screen.getByLabelText('Your name'), 'Nima Sherpa');
    await userEvent.type(screen.getByLabelText('Email'), 'nima@example.com');
    await userEvent.type(screen.getByLabelText('Password'), password);
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
}

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
});

describe('SignUpAccountPage — client-side validation', () => {
    it('blocks submission and shows an error when the password is under 8 characters', async () => {
        renderWithProviders(<SignUpAccountPage />, { route: '/signup' });
        await fillForm({ password: 'short1' }); // 6 chars

        expect(await screen.findByText('Password needs to be at least 8 characters.')).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('accepts a password of exactly 8 characters (boundary)', async () => {
        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ email: 'nima@example.com' }) });
        renderWithProviders(<SignUpAccountPage />, { route: '/signup' });
        await fillForm({ password: '12345678' });

        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(screen.queryByText('Password needs to be at least 8 characters.')).not.toBeInTheDocument();
    });

    it('submits successfully with a longer password and does not show the length error', async () => {
        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ email: 'nima@example.com' }) });
        renderWithProviders(<SignUpAccountPage />, { route: '/signup' });
        await fillForm({ password: 'longenough123' });

        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(screen.queryByText('Password needs to be at least 8 characters.')).not.toBeInTheDocument();
    });

    it('surfaces a server-side error message (e.g. duplicate email) without crashing', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'An account with that email already exists.' }),
        });
        renderWithProviders(<SignUpAccountPage />, { route: '/signup' });
        await fillForm({ password: 'longenough123' });

        expect(await screen.findByText('An account with that email already exists.')).toBeInTheDocument();
    });

    it('falls back to a generic error when the server gives no message', async () => {
        global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
        renderWithProviders(<SignUpAccountPage />, { route: '/signup' });
        await fillForm({ password: 'longenough123' });

        expect(await screen.findByText('Something went wrong. Try again.')).toBeInTheDocument();
    });

    it('shows a network-error message if the request throws', async () => {
        global.fetch.mockRejectedValueOnce(new Error('offline'));
        renderWithProviders(<SignUpAccountPage />, { route: '/signup' });
        await fillForm({ password: 'longenough123' });

        expect(await screen.findByText('Network error. Try again.')).toBeInTheDocument();
    });
});
