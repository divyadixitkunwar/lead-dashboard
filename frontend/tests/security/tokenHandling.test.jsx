import { vi } from 'vitest';
import api from '../../src/services/api';

// api.js registers its interceptors once, at import time, on the shared
// axios instance it exports. We reach into `interceptors.request/response`
// to invoke the exact handlers Ekikrit ships — no network calls, no mocking
// axios itself, so this tests the real interceptor logic.
function getRequestFulfilled() {
    return api.interceptors.request.handlers[0].fulfilled;
}
function getResponseRejected() {
    return api.interceptors.response.handlers[0].rejected;
}

describe('api.js — auth token attachment', () => {
    it('attaches Authorization: Bearer <token> when a token is present', () => {
        window.localStorage.setItem('token', 'secret-token-123');
        const config = getRequestFulfilled()({ headers: {} });
        expect(config.headers.Authorization).toBe('Bearer secret-token-123');
    });

    it('sends no Authorization header when there is no stored token', () => {
        window.localStorage.removeItem('token');
        const config = getRequestFulfilled()({ headers: {} });
        expect(config.headers.Authorization).toBeUndefined();
    });

    it('never leaks the token into anywhere other than the Authorization header', () => {
        window.localStorage.setItem('token', 'secret-token-123');
        const config = getRequestFulfilled()({ headers: {}, params: {}, data: {} });
        expect(JSON.stringify(config.params)).not.toContain('secret-token-123');
        expect(JSON.stringify(config.data)).not.toContain('secret-token-123');
    });
});

describe('api.js — 401 handling', () => {
    let originalLocation;

    beforeEach(() => {
        originalLocation = window.location;
        delete window.location;
        window.location = { ...originalLocation, href: '/app' };
        window.localStorage.setItem('token', 'secret-token-123');
        window.localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Sita Rai' }));
    });

    afterEach(() => {
        window.location = originalLocation;
    });

    it('clears the stored token and user on a 401 response', async () => {
        await expect(getResponseRejected()({ response: { status: 401 } })).rejects.toBeDefined();
        expect(window.localStorage.getItem('token')).toBeNull();
        expect(window.localStorage.getItem('user')).toBeNull();
    });

    it('redirects to /login on a 401 response', async () => {
        await expect(getResponseRejected()({ response: { status: 401 } })).rejects.toBeDefined();
        expect(window.location.href).toBe('/login');
    });

    it('leaves the session untouched on non-401 errors (e.g. 500, network error)', async () => {
        await expect(getResponseRejected()({ response: { status: 500 } })).rejects.toBeDefined();
        expect(window.localStorage.getItem('token')).toBe('secret-token-123');
        expect(window.location.href).toBe('/app');
    });

    it('leaves the session untouched when there is no response at all (network failure)', async () => {
        await expect(getResponseRejected()({ message: 'Network Error' })).rejects.toBeDefined();
        expect(window.localStorage.getItem('token')).toBe('secret-token-123');
    });
});
