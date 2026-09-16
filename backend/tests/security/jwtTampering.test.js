// tests/security/jwtTampering.test.js
//
// The `protect` middleware in src/middleware/auth.js is the server's real
// trust boundary — it must reject any token it did not sign itself,
// regardless of what claims (including role) the token carries. Uses
// GET /business (protect + requireActive only, no requireChannel) as a
// minimal authenticated endpoint to exercise the middleware directly.

const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../../src/app');
const { createUser, issueToken, cleanupBusinesses } = require('../helpers/factory');

describe('Security — JWT tampering resistance', () => {
    let business, user, validToken;

    beforeAll(async () => {
        ({ business, user } = await createUser({ status: 'active', role: 'staff' }));
        validToken = issueToken(user);
    });

    afterAll(async () => {
        await cleanupBusinesses(business);
    });

    it('accepts a genuinely valid, correctly-signed token', async () => {
        const res = await request(app).get('/business').set('Authorization', `Bearer ${validToken}`);
        expect(res.status).toBe(200);
    });

    it('rejects a request with no Authorization header', async () => {
        const res = await request(app).get('/business');
        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/no token provided/i);
    });

    it('rejects an Authorization header that is not a Bearer token', async () => {
        const res = await request(app).get('/business').set('Authorization', validToken);
        expect(res.status).toBe(401);
    });

    it('rejects a completely malformed token string', async () => {
        const res = await request(app).get('/business').set('Authorization', 'Bearer not.a.real.jwt.token');
        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/invalid or expired/i);
    });

    it('rejects a token signed with the wrong secret', async () => {
        const forged = jwt.sign(
            { id: user.id, email: user.email, role: user.role, business_id: user.business_id },
            'a-completely-different-secret-the-attacker-guessed'
        );
        const res = await request(app).get('/business').set('Authorization', `Bearer ${forged}`);
        expect(res.status).toBe(401);
    });

    it('rejects an expired token even though it was signed with the correct secret', async () => {
        const expired = jwt.sign(
            { id: user.id, email: user.email, role: user.role, business_id: user.business_id },
            process.env.JWT_SECRET,
            { expiresIn: '-10s' }
        );
        const res = await request(app).get('/business').set('Authorization', `Bearer ${expired}`);
        expect(res.status).toBe(401);
    });

    it('rejects a token whose payload was tampered with after signing (signature no longer matches)', async () => {
        const parts = validToken.split('.');
        expect(parts.length).toBe(3);

        // Decode the payload, escalate the role claim, re-encode — but
        // keep the ORIGINAL signature, since the attacker does not have
        // JWT_SECRET. jwt.verify must catch the mismatch.
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        const tamperedPayload = { ...payload, role: 'superadmin' };
        const tamperedPart = Buffer.from(JSON.stringify(tamperedPayload)).toString('base64url');
        const tamperedToken = `${parts[0]}.${tamperedPart}.${parts[2]}`;

        const res = await request(app).get('/business').set('Authorization', `Bearer ${tamperedToken}`);
        expect(res.status).toBe(401);
    });

    it('a role claimed only in a forged (wrong-secret) token grants no elevated access', async () => {
        // Forge a token claiming superadmin for this staff user, signed
        // with a guessed/wrong secret. It must fail verification before
        // the role claim is ever consulted by requireSuperadmin.
        const forgedSuperadmin = jwt.sign(
            { id: user.id, email: user.email, role: 'superadmin', business_id: user.business_id },
            'attacker-guessed-secret'
        );
        const res = await request(app)
            .get('/admin/pending')
            .set('Authorization', `Bearer ${forgedSuperadmin}`);
        expect(res.status).toBe(401);
    });
});
