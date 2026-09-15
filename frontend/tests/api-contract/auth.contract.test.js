import axios from 'axios';

// These tests hit a REAL, DEPLOYED backend — they are excluded from the
// default `npm test` run (see vitest.config.js) and must be run explicitly:
//
//   TEST_API_BASE_URL=https://api.yourdomain.com npm run test:api
//
// They verify the HTTP contract your frontend's services/api.js relies on:
// status codes, response shape, and error format. They never assert on
// business data (leads, users) since that's environment-specific — that
// belongs in the backend's own API test suite.

const BASE_URL = process.env.TEST_API_BASE_URL;

const client = axios.create({
    baseURL: BASE_URL,
    validateStatus: () => true, // let us assert on status codes ourselves
    timeout: 10000,
});

const describeIfConfigured = BASE_URL ? describe : describe.skip;

describeIfConfigured('LIVE API contract — /auth/login', () => {
    it('rejects a request with no body with 400/422, not a 500', async () => {
        const res = await client.post('/auth/login', {});
        expect([400, 422]).toContain(res.status);
    });

    it('rejects bad credentials with 401 and a JSON error field, never leaking whether the email exists', async () => {
        const res = await client.post('/auth/login', {
            email: `nonexistent-${Date.now()}@example.com`,
            password: 'definitely-wrong-password',
        });
        expect(res.status).toBe(401);
        expect(res.data).toHaveProperty('error');
        expect(String(res.data.error).toLowerCase()).not.toMatch(/no user found|user not found|does not exist/);
    });

    it('never returns password/hash fields in any auth response', async () => {
        const res = await client.post('/auth/login', { email: 'nonexistent@example.com', password: 'x' });
        const body = JSON.stringify(res.data).toLowerCase();
        expect(body).not.toMatch(/"password"|"password_hash"|"hash"/);
    });
});

describeIfConfigured('LIVE API contract — /auth/me', () => {
    it('returns 401 with no Authorization header', async () => {
        const res = await client.get('/auth/me');
        expect(res.status).toBe(401);
    });

    it('returns 401 for a malformed/garbage bearer token', async () => {
        const res = await client.get('/auth/me', {
            headers: { Authorization: 'Bearer not-a-real-jwt' },
        });
        expect(res.status).toBe(401);
    });
});

describeIfConfigured('LIVE API contract — protected resources require auth', () => {
    it.each(['/leads', '/analytics/summary', '/analytics/response-time', '/business'])(
        'GET %s returns 401 without a token',
        async (path) => {
            const res = await client.get(path);
            expect(res.status).toBe(401);
        }
    );
});

describeIfConfigured('LIVE API contract — CORS / transport', () => {
    it('serves the API over HTTPS', () => {
        expect(BASE_URL).toMatch(/^https:\/\//);
    });

    it('does not echo back an overly permissive CORS wildcard alongside credentials', async () => {
        const res = await client.options('/auth/login', {
            headers: {
                Origin: 'https://evil-example.com',
                'Access-Control-Request-Method': 'POST',
            },
        });
        const allowOrigin = res.headers['access-control-allow-origin'];
        const allowCreds = res.headers['access-control-allow-credentials'];
        if (allowCreds === 'true') {
            expect(allowOrigin).not.toBe('*');
        }
    });
});
