// tests/security/webhookSignature.test.js
//
// Reuses the exact HMAC-verification logic manually curl-tested in
// production this session: unsigned or tampered POSTs to /ingest must be
// rejected with 401; a correctly-signed payload must be accepted.
//
// Relies on src/app.js capturing req.rawBody via express.json's `verify`
// option, since the signature must be computed over the exact bytes sent
// (a re-serialized JSON body would not match).

const crypto = require('crypto');
const request = require('supertest');
const app = require('../../src/app');

const APP_SECRET = process.env.META_APP_SECRET;

function sign(bodyString) {
    return 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(bodyString).digest('hex');
}

describe('Security — /ingest webhook signature verification', () => {
    const payload = {
        object: 'page',
        entry: [{ id: 'nonexistent_page_id_for_signature_test', messaging: [] }],
    };
    const bodyString = JSON.stringify(payload);

    beforeAll(() => {
        if (!APP_SECRET) {
            throw new Error('META_APP_SECRET must be set in the test environment for this suite to be meaningful');
        }
    });

    it('rejects a POST with no signature header at all', async () => {
        const res = await request(app)
            .post('/ingest')
            .set('Content-Type', 'application/json')
            .send(bodyString);
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('rejects a malformed signature header missing the sha256= prefix', async () => {
        const res = await request(app)
            .post('/ingest')
            .set('Content-Type', 'application/json')
            .set('x-hub-signature-256', crypto.createHmac('sha256', APP_SECRET).update(bodyString).digest('hex'))
            .send(bodyString);
        expect(res.status).toBe(401);
    });

    it('rejects a well-formed but incorrect signature', async () => {
        const wrongSig = 'sha256=' + '0'.repeat(64);
        const res = await request(app)
            .post('/ingest')
            .set('Content-Type', 'application/json')
            .set('x-hub-signature-256', wrongSig)
            .send(bodyString);
        expect(res.status).toBe(401);
    });

    it('rejects a tampered payload signed for a different body (valid-looking but wrong signature)', async () => {
        const sigForOriginal = sign(bodyString);
        const tamperedBody = JSON.stringify({
            ...payload,
            entry: [{ id: 'attacker_controlled_page_id', messaging: [] }],
        });

        const res = await request(app)
            .post('/ingest')
            .set('Content-Type', 'application/json')
            .set('x-hub-signature-256', sigForOriginal)
            .send(tamperedBody);
        expect(res.status).toBe(401);
    });

    it('accepts a correctly-signed payload and processes it (200, success:true)', async () => {
        const sig = sign(bodyString);
        const res = await request(app)
            .post('/ingest')
            .set('Content-Type', 'application/json')
            .set('x-hub-signature-256', sig)
            .send(bodyString);

        // Unknown page_id is logged internally as unrouted, but the route
        // still returns 200/success:true since the signature was valid and
        // the handler didn't throw.
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true });
    });

    describe('webhook verification handshake (GET /ingest)', () => {
        it('confirms subscription when mode and token match META_VERIFY_TOKEN', async () => {
            const verifyToken = process.env.META_VERIFY_TOKEN;
            if (!verifyToken) return; // skip if not configured in this environment

            const res = await request(app)
                .get('/ingest')
                .query({ 'hub.mode': 'subscribe', 'hub.verify_token': verifyToken, 'hub.challenge': '123456' });
            expect(res.status).toBe(200);
            expect(res.text).toBe('123456');
        });

        it('rejects the handshake with the wrong verify token', async () => {
            const res = await request(app)
                .get('/ingest')
                .query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'definitely-wrong', 'hub.challenge': '123456' });
            expect(res.status).toBe(403);
        });
    });
});
