// tests/security/secretsNotLeaked.test.js
//
// Confirms password_hash never appears in any JSON response body, and
// that error responses never leak raw Prisma/stack-trace details to the
// client — the class of bug the original /auth/login fix addressed
// this session.

const request = require('supertest');
const app = require('../../src/app');
const { createUser, createChannel, createLead, issueToken, cleanupBusinesses } = require('../helpers/factory');

function bodyContainsKey(obj, key) {
    if (obj === null || typeof obj !== 'object') return false;
    if (Array.isArray(obj)) return obj.some((item) => bodyContainsKey(item, key));
    if (Object.prototype.hasOwnProperty.call(obj, key)) return true;
    return Object.values(obj).some((value) => bodyContainsKey(value, key));
}

function bodyTextLeaksInternals(body) {
    const text = JSON.stringify(body);
    return /prisma|at\s+\w+\s+\(.*:\d+:\d+\)|node_modules|\.js:\d+/i.test(text);
}

describe('Security — secrets and internal error details are never leaked', () => {
    let business, user, token, password;

    beforeAll(async () => {
        ({ business, user, password } = await createUser({ status: 'active', role: 'admin' }));
        await createChannel({ business });
        token = issueToken(user);
    });

    afterAll(async () => {
        await cleanupBusinesses(business);
    });

    it('never includes password_hash in the login response', async () => {
        const res = await request(app).post('/auth/login').send({ email: user.email, password });
        expect(res.status).toBe(200);
        expect(bodyContainsKey(res.body, 'password_hash')).toBe(false);
    });

    it('never includes password_hash in /auth/me', async () => {
        const res = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`);
        expect(bodyContainsKey(res.body, 'password_hash')).toBe(false);
    });

    it('never includes password_hash in the /users list', async () => {
        const res = await request(app).get('/users').set('Authorization', `Bearer ${token}`);
        expect(bodyContainsKey(res.body, 'password_hash')).toBe(false);
    });

    it('never includes password_hash in the /leads/:id response, even with a note author attached', async () => {
        const lead = await createLead({ business });
        await request(app)
            .post(`/leads/${lead.id}/notes`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'note' });

        const res = await request(app).get(`/leads/${lead.id}`).set('Authorization', `Bearer ${token}`);
        expect(bodyContainsKey(res.body, 'password_hash')).toBe(false);
    });

    it('never includes access_token (channel secret) in the /channels list', async () => {
        const res = await request(app).get('/channels').set('Authorization', `Bearer ${token}`);
        expect(bodyContainsKey(res.body, 'access_token')).toBe(false);
    });

    it('does not leak raw error internals on a malformed login request', async () => {
        const res = await request(app).post('/auth/login').send({});
        expect(res.status).toBe(400);
        expect(bodyTextLeaksInternals(res.body)).toBe(false);
    });

    it('does not leak raw error internals on a 404 for a nonexistent lead', async () => {
        const res = await request(app).get('/leads/999999999').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(404);
        expect(bodyTextLeaksInternals(res.body)).toBe(false);
    });

    it('does not leak raw error internals when patching a lead with an invalid assignee', async () => {
        const lead = await createLead({ business });
        const res = await request(app)
            .patch(`/leads/${lead.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ assigned_to: 999999999 });
        expect(res.status).toBe(400);
        expect(bodyTextLeaksInternals(res.body)).toBe(false);
    });

    it('generic error responses never contain the word "prisma" (case-insensitive) in the message', async () => {
        const attempts = [
            request(app).post('/auth/login').send({ email: 'not-an-email', password: 'x' }),
            request(app).get('/leads/not-a-number').set('Authorization', `Bearer ${token}`),
        ];
        const results = await Promise.all(attempts);
        for (const res of results) {
            expect(JSON.stringify(res.body).toLowerCase()).not.toContain('prisma');
        }
    });
});
