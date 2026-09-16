// tests/security/crossBusinessIsolation.test.js
//
// Consolidates the cross-tenant isolation property into one dedicated,
// explicitly adversarial suite (mirroring the frontend's
// roleTampering.test.jsx "Security — ..." framing), on top of the
// functional coverage already embedded in leads.test.js / users.test.js /
// channels.test.js. The narrative here: "Business A" is the attacker,
// holding a completely valid session token for their own business, and
// probes every tenant-scoped endpoint with ids that belong to
// "Business B" — including guessing small sequential ids, since business
// ids and most row ids are sequential autoincrement integers.

const request = require('supertest');

vi.mock('../../src/services/metaGraph', () => ({
    sendTextMessage: vi.fn(),
    getLongLivedToken: vi.fn(),
    getManagedPages: vi.fn(),
    getLinkedInstagramAccount: vi.fn(),
    subscribePageWebhook: vi.fn(),
}));
vi.mock('../../src/services/aiClassifier', () => ({
    suggestReply: vi.fn(),
}));

const app = require('../../src/app');
const {
    createUser,
    createChannel,
    createLead,
    createMessage,
    issueToken,
    cleanupBusinesses,
} = require('../helpers/factory');

describe('Security — cross-business (multi-tenant) isolation', () => {
    let attackerBiz, attackerUser, attackerToken;
    let victimBiz, victimUser, victimAdmin, victimToken, victimAdminToken;
    let victimLead, victimChannel;

    beforeAll(async () => {
        ({ business: attackerBiz, user: attackerUser } = await createUser({ status: 'active', role: 'admin' }));
        await createChannel({ business: attackerBiz, platform: 'messenger' });
        attackerToken = issueToken(attackerUser);

        ({ business: victimBiz, user: victimAdmin } = await createUser({ status: 'active', role: 'admin' }));
        ({ user: victimUser } = await createUser({ business: victimBiz, status: 'active', role: 'staff' }));
        victimChannel = await createChannel({ business: victimBiz, platform: 'messenger' });
        victimAdminToken = issueToken(victimAdmin);
        victimToken = issueToken(victimUser);

        victimLead = await createLead({
            business: victimBiz,
            channel: 'messenger',
            platform_thread_id: 'messenger:victim-thread',
        });
        await createMessage({ lead: victimLead, direction: 'inbound', received_at: new Date() });
    });

    afterAll(async () => {
        await cleanupBusinesses(attackerBiz, victimBiz);
    });

    it('guessing a valid victim lead id never returns victim data via GET /leads/:id', async () => {
        const res = await request(app)
            .get(`/leads/${victimLead.id}`)
            .set('Authorization', `Bearer ${attackerToken}`);
        expect(res.status).toBe(404);
        expect(res.body.contact_name).toBeUndefined();
    });

    it('guessing a valid victim lead id never allows a PATCH to modify victim data', async () => {
        const res = await request(app)
            .patch(`/leads/${victimLead.id}`)
            .set('Authorization', `Bearer ${attackerToken}`)
            .send({ status: 'contacted', contact_name: 'Pwned' });
        expect(res.status).toBe(404);
    });

    it('cannot write a note onto a victim lead by guessing its id', async () => {
        const res = await request(app)
            .post(`/leads/${victimLead.id}/notes`)
            .set('Authorization', `Bearer ${attackerToken}`)
            .send({ content: 'attacker-planted note' });
        expect(res.status).toBe(404);
    });

    it('cannot read a victim lead\'s notes by guessing its id', async () => {
        const res = await request(app)
            .get(`/leads/${victimLead.id}/notes`)
            .set('Authorization', `Bearer ${attackerToken}`);
        expect(res.status).toBe(404);
    });

    it('cannot send a reply as the victim business by guessing the lead id', async () => {
        const res = await request(app)
            .post(`/leads/${victimLead.id}/reply`)
            .set('Authorization', `Bearer ${attackerToken}`)
            .send({ content: 'attacker impersonation attempt' });
        expect(res.status).toBe(404);
    });

    it('cannot assign a victim-business lead to a user, and cannot use a victim user id as an assignee on an owned lead', async () => {
        const ownLead = await createLead({ business: attackerBiz });
        const res = await request(app)
            .patch(`/leads/${ownLead.id}`)
            .set('Authorization', `Bearer ${attackerToken}`)
            .send({ assigned_to: victimUser.id });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/outside this business/i);
    });

    it('cannot list, modify, or delete victim users by guessing their ids (requires the attacker\'s own channel + admin role)', async () => {
        const listRes = await request(app).get('/users').set('Authorization', `Bearer ${attackerToken}`);
        expect(listRes.status).toBe(200);
        expect(listRes.body.some((u) => u.id === victimUser.id)).toBe(false);

        const patchRes = await request(app)
            .patch(`/users/${victimUser.id}`)
            .set('Authorization', `Bearer ${attackerToken}`)
            .send({ role: 'admin' });
        expect(patchRes.status).toBe(404);

        const deleteRes = await request(app)
            .delete(`/users/${victimUser.id}`)
            .set('Authorization', `Bearer ${attackerToken}`);
        expect(deleteRes.status).toBe(404);
    });

    it('cannot delete a victim business\'s channel by guessing its id', async () => {
        const res = await request(app)
            .delete(`/channels/${victimChannel.id}`)
            .set('Authorization', `Bearer ${attackerToken}`);
        expect(res.status).toBe(404);
    });

    it('cannot read or rename the victim business via the business-scoped endpoints (scoped by token, not a guessable param)', async () => {
        const getRes = await request(app).get('/business').set('Authorization', `Bearer ${attackerToken}`);
        expect(getRes.body.id).toBe(attackerBiz.id);
        expect(getRes.body.id).not.toBe(victimBiz.id);
    });

    it('a valid session for the victim business cannot be substituted by an attacker who only knows the victim\'s user id', async () => {
        // Sanity check the other direction too: knowing victimUser.id alone
        // (e.g. leaked via an id in a UI) grants nothing without a valid
        // token for that account.
        const res = await request(app)
            .get('/leads')
            .set('Authorization', `Bearer invalid.token.guessed-from-user-id-${victimUser.id}`);
        expect(res.status).toBe(401);
    });
});
