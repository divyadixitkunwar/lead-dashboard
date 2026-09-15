import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from '../utils/render';
import ResetPasswordPage from '../../src/pages/ResetPasswordPage';

function renderWithEmail(email = 'nima@example.com') {
    return renderWithProviders(<ResetPasswordPage />, {
        entries: [{ pathname: '/reset-password', state: { email } }],
    });
}

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
});

describe('ResetPasswordPage — guard clause', () => {
    it('shows a "no reset in progress" message when no email is in router state', () => {
        renderWithProviders(<ResetPasswordPage />, { route: '/reset-password' });
        expect(screen.getByText("We couldn't find a password reset in progress.")).toBeInTheDocument();
    });
});

describe('ResetPasswordPage — code field', () => {
    it('strips non-digit characters and caps the code at 6 digits', async () => {
        renderWithEmail();
        const codeInput = screen.getByLabelText('Reset code');
        await userEvent.type(codeInput, 'ab12cd34ef');
        expect(codeInput).toHaveValue('1234');
    });

    it('keeps the submit button disabled until the code is exactly 6 digits', async () => {
        renderWithEmail();
        const submit = screen.getByRole('button', { name: /reset password/i });
        expect(submit).toBeDisabled();

        await userEvent.type(screen.getByLabelText('Reset code'), '12345');
        expect(submit).toBeDisabled();

        await userEvent.type(screen.getByLabelText('Reset code'), '6');
        expect(submit).toBeEnabled();
    });
});

describe('ResetPasswordPage — password validation', () => {
    async function fillAndSubmit({ code = '123456', password, confirm }) {
        await userEvent.type(screen.getByLabelText('Reset code'), code);
        await userEvent.type(screen.getByLabelText('New password'), password);
        await userEvent.type(screen.getByLabelText('Confirm password'), confirm);
        await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
    }

    it('rejects a password under 8 characters before hitting the network', async () => {
        renderWithEmail();
        await fillAndSubmit({ password: 'short1', confirm: 'short1' });
        expect(await screen.findByText('Password needs to be at least 8 characters.')).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('rejects mismatched password/confirm even when both are long enough', async () => {
        renderWithEmail();
        await fillAndSubmit({ password: 'longenough123', confirm: 'longenough124' });
        expect(await screen.findByText("Passwords don't match.")).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('checks length before match (length error wins when both are wrong)', async () => {
        renderWithEmail();
        await fillAndSubmit({ password: 'short', confirm: 'other' });
        expect(await screen.findByText('Password needs to be at least 8 characters.')).toBeInTheDocument();
    });

    it('submits with email, code, and password when validation passes', async () => {
        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
        renderWithEmail('nima@example.com');
        await fillAndSubmit({ password: 'longenough123', confirm: 'longenough123' });

        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        const [url, options] = global.fetch.mock.calls[0];
        expect(url).toMatch(/\/auth\/reset-password$/);
        expect(JSON.parse(options.body)).toEqual({
            email: 'nima@example.com',
            code: '123456',
            password: 'longenough123',
        });
    });

    it('shows the server error on an invalid/expired code', async () => {
        global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Invalid or expired code.' }) });
        renderWithEmail();
        await fillAndSubmit({ password: 'longenough123', confirm: 'longenough123' });
        expect(await screen.findByText('Invalid or expired code.')).toBeInTheDocument();
    });
});

describe('ResetPasswordPage — resend code', () => {
    it('starts a 60s cooldown and shows a confirmation notice on success', async () => {
        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
        renderWithEmail();

        await userEvent.click(screen.getByText('Resend code'));

        expect(await screen.findByText('New code sent.')).toBeInTheDocument();
        expect(screen.getByText('Resend in 60s')).toBeInTheDocument();
    });

    it('applies a server-provided wait_seconds cooldown on rate-limit errors', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Please wait before retrying.', wait_seconds: 30 }),
        });
        renderWithEmail();

        await userEvent.click(screen.getByText('Resend code'));

        expect(await screen.findByText('Please wait before retrying.')).toBeInTheDocument();
        expect(screen.getByText('Resend in 30s')).toBeInTheDocument();
    });
});
