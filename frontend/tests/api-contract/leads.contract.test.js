import axios from 'axios';

// Run explicitly against a live/staging backend:
//   TEST_API_BASE_URL=https://api.yourdomain.com \
//   TEST_API_TOKEN=<a valid JWT for a test account> \
//   npm run test:api

const BASE_URL = process.env.TEST_API_BASE_URL;
const TOKEN = process.env.TEST_API_TOKEN;

const client = axios.create({ baseURL: BASE_URL, validateStatus: () => true, timeout: 10000 });
const authClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    validateStatus: () => true,
    headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
});

const describeIfConfigured = BASE_URL ? describe : describe.skip;
const describeIfAuthed = (BASE_URL && TOKEN) ? describe : describe.skip;

describeIfConfigured('LIVE API contract — /leads (unauthenticated)', () => {
    it('rejects listing leads without a token', async () => {
        const res = await client.get('/leads');
        expect(res.status).toBe(401);
    });

    it('rejects a reply attempt without a token', async () => {
        const res = await client.post('/leads/1/reply', { content: 'hi' });
        expect([401, 403]).toContain(res.status);
    });
});

describeIfAuthed('LIVE API contract — /leads (authenticated, requires TEST_API_TOKEN)', () => {
    it('lists leads as an array, each with the fields the dashboard depends on', async () => {
        const res = await authClient.get('/leads');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data)).toBe(true);
        if (res.data.length > 0) {
            const lead = res.data[0];
            for (const field of ['id', 'status', 'channel', 'created_at']) {
                expect(lead).toHaveProperty(field);
            }
        }
    });

    it('supports filtering by status without erroring', async () => {
        const res = await authClient.get('/leads', { params: { status: 'new' } });
        expect(res.status).toBe(200);
        expect(res.data.every((l) => l.status === 'new')).toBe(true);
    });

    it('returns 404 (not 500) for a lead id that does not exist', async () => {
        const res = await authClient.get('/leads/999999999');
        expect([404]).toContain(res.status);
    });

    it('returns 400/422 (not 500) when replying with empty content', async () => {
        const res = await authClient.post('/leads/1/reply', { content: '' });
        expect([400, 404, 422]).toContain(res.status);
    });

    it('rejects a status update to an invalid enum value', async () => {
        const res = await authClient.patch('/leads/1', { status: 'not-a-real-status' });
        expect([400, 404, 422]).toContain(res.status);
    });
});

describeIfAuthed('LIVE API contract — /analytics', () => {
    it('/analytics/summary returns the shape AnalyticsPage expects', async () => {
        const res = await authClient.get('/analytics/summary');
        expect(res.status).toBe(200);
        for (const field of ['total', 'duplicates']) {
            expect(res.data).toHaveProperty(field);
        }
    });

    it('/analytics/response-time returns a numeric-or-null avg_response_ms', async () => {
        const res = await authClient.get('/analytics/response-time');
        expect(res.status).toBe(200);
        expect(res.data.avg_response_ms === null || typeof res.data.avg_response_ms === 'number').toBe(true);
    });
});

describeIfConfigured('LIVE API contract — webhook endpoints reject unsigned/invalid payloads', () => {
    it.each(['/webhooks/whatsapp', '/webhooks/messenger', '/webhooks/instagram'])(
        'POST %s without a valid signature is rejected, not silently accepted',
        async (path) => {
            const res = await client.post(path, { fake: 'payload' });
            expect([400, 401, 403]).toContain(res.status);
        }
    );
});
