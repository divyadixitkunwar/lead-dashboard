// tests/integration/leads.test.js
//
// Supertest against the real app + real DB. External services mocked:
// - src/services/metaGraph.js (sendTextMessage) — no real Meta calls
// - src/services/aiClassifier.js (suggestReply) — no real Gemini calls
//
// The single most important test file in this suite: business A must
// never be able to see, edit, or act on business B's leads via any
// endpoint, even when guessing a valid numeric id.

const request = require('supertest');

const metaGraphService = require('../../src/services/metaGraph');
metaGraphService.sendTextMessage = vi.fn();
const aiClassifierService = require('../../src/services/aiClassifier');
aiClassifierService.suggestReply = vi.fn();

const app = require('../../src/app');
const { sendTextMessage } = metaGraphService;
const { suggestReply } = aiClassifierService;
const {
    createUser,
    createChannel,
    createLead,
    createMessage,
    issueToken,
    cleanupBusinesses,
} = require('../helpers/factory');

const DAY_MS = 24 * 60 * 60 * 1000;

describe('/leads', () => {
    let bizA, userA, tokenA;
    let bizB, userB, tokenB;

    beforeAll(async () => {
        ({ business: bizA, user: userA } = await createUser({ status: 'active', role: 'admin' }));
        await createChannel({ business: bizA, platform: 'messenger' });
        tokenA = issueToken(userA);

        ({ business: bizB, user: userB } = await createUser({ status: 'active', role: 'admin' }));
        await createChannel({ business: bizB, platform: 'messenger' });
        tokenB = issueToken(userB);
    });

    afterAll(async () => {
        await cleanupBusinesses(bizA, bizB);
    });

    beforeEach(() => {
        sendTextMessage.mockReset();
        suggestReply.mockReset();
    });

    describe('requireChannel middleware', () => {
        it('blocks access with NO_CHANNEL when the business has no connected channel', async () => {
            const { business: noChannelBiz, user: noChannelUser } = await createUser({ status: 'active' });
            const token = issueToken(noChannelUser);

            const res = await request(app).get('/leads').set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(403);
            expect(res.body.code).toBe('NO_CHANNEL');

            await cleanupBusinesses(noChannelBiz);
        });
    });

    describe('GET /leads', () => {
        it('only returns leads belonging to the caller\'s business', async () => {
            const leadA = await createLead({ business: bizA, contact_name: 'Lead A' });
            const leadB = await createLead({ business: bizB, contact_name: 'Lead B' });

            const res = await request(app).get('/leads').set('Authorization', `Bearer ${tokenA}`);

            expect(res.status).toBe(200);
            const ids = res.body.map((l) => l.id);
            expect(ids).toContain(leadA.id);
            expect(ids).not.toContain(leadB.id);
        });

        it('filters by status/channel/intent/message_type query params', async () => {
            await createLead({ business: bizA, status: 'contacted', channel: 'whatsapp' });
            const res = await request(app)
                .get('/leads?status=contacted&channel=whatsapp')
                .set('Authorization', `Bearer ${tokenA}`);
            expect(res.status).toBe(200);
            expect(res.body.every((l) => l.status === 'contacted' && l.channel === 'whatsapp')).toBe(true);
        });
    });

    describe('Cross-business isolation', () => {
        it('GET /leads/:id returns 404 when the lead belongs to another business', async () => {
            const leadB = await createLead({ business: bizB });
            const res = await request(app)
                .get(`/leads/${leadB.id}`)
                .set('Authorization', `Bearer ${tokenA}`);
            expect(res.status).toBe(404);
        });

        it('PATCH /leads/:id returns 404 for another business\'s lead', async () => {
            const leadB = await createLead({ business: bizB });
            const res = await request(app)
                .patch(`/leads/${leadB.id}`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ status: 'contacted' });
            expect(res.status).toBe(404);
        });

        it('POST /leads/:id/notes returns 404 for another business\'s lead', async () => {
            const leadB = await createLead({ business: bizB });
            const res = await request(app)
                .post(`/leads/${leadB.id}/notes`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ content: 'sneaky note' });
            expect(res.status).toBe(404);
        });

        it('GET /leads/:id/notes returns 404 for another business\'s lead', async () => {
            const leadB = await createLead({ business: bizB });
            const res = await request(app)
                .get(`/leads/${leadB.id}/notes`)
                .set('Authorization', `Bearer ${tokenA}`);
            expect(res.status).toBe(404);
        });

        it('POST /leads/:id/suggest-reply returns 404 for another business\'s lead', async () => {
            const leadB = await createLead({ business: bizB });
            const res = await request(app)
                .post(`/leads/${leadB.id}/suggest-reply`)
                .set('Authorization', `Bearer ${tokenA}`);
            expect(res.status).toBe(404);
            expect(suggestReply).not.toHaveBeenCalled();
        });

        it('POST /leads/:id/reply returns 404 for another business\'s lead', async () => {
            const leadB = await createLead({ business: bizB });
            const res = await request(app)
                .post(`/leads/${leadB.id}/reply`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ content: 'sneaky reply' });
            expect(res.status).toBe(404);
            expect(sendTextMessage).not.toHaveBeenCalled();
        });

        it('rejects assigning a lead to a user from a different business', async () => {
            const leadA = await createLead({ business: bizA });
            const res = await request(app)
                .patch(`/leads/${leadA.id}`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ assigned_to: userB.id });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/outside this business/i);
        });

        it('allows assigning a lead to a user within the same business', async () => {
            const leadA = await createLead({ business: bizA });
            const res = await request(app)
                .patch(`/leads/${leadA.id}`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ assigned_to: userA.id });
            expect(res.status).toBe(200);
            expect(res.body.assigned_to).toBe(userA.id);
        });
    });

    describe('POST /leads/:id/notes and GET /leads/:id/notes', () => {
        it('creates and lists a note for the caller\'s own lead', async () => {
            const lead = await createLead({ business: bizA });
            const createRes = await request(app)
                .post(`/leads/${lead.id}/notes`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ content: 'Called, will follow up tomorrow' });
            expect(createRes.status).toBe(201);

            const listRes = await request(app)
                .get(`/leads/${lead.id}/notes`)
                .set('Authorization', `Bearer ${tokenA}`);
            expect(listRes.status).toBe(200);
            expect(listRes.body.some((n) => n.content === 'Called, will follow up tomorrow')).toBe(true);
        });
    });

    describe('POST /leads/:id/suggest-reply', () => {
        it('returns the AI-generated draft for the caller\'s own lead', async () => {
            const lead = await createLead({ business: bizA, intent: 'price_inquiry' });
            suggestReply.mockResolvedValue('Sure, the price is Rs. 1200.');

            const res = await request(app)
                .post(`/leads/${lead.id}/suggest-reply`)
                .set('Authorization', `Bearer ${tokenA}`);

            expect(res.status).toBe(200);
            expect(res.body.draft).toBe('Sure, the price is Rs. 1200.');
            expect(suggestReply).toHaveBeenCalledWith(
                expect.objectContaining({ intent: 'price_inquiry' })
            );
        });

        it('returns 502 when the AI service fails, without leaking the internal error', async () => {
            const lead = await createLead({ business: bizA });
            suggestReply.mockRejectedValue(new Error('Gemini API 500: internal error'));

            const res = await request(app)
                .post(`/leads/${lead.id}/suggest-reply`)
                .set('Authorization', `Bearer ${tokenA}`);

            expect(res.status).toBe(502);
            expect(res.body.error).not.toMatch(/gemini/i);
        });
    });

    describe('POST /leads/:id/reply', () => {
        it('rejects empty content', async () => {
            const lead = await createLead({ business: bizA });
            const res = await request(app)
                .post(`/leads/${lead.id}/reply`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ content: '   ' });
            expect(res.status).toBe(400);
        });

        it('rejects replying on an unsupported channel (e.g. whatsapp)', async () => {
            const lead = await createLead({ business: bizA, channel: 'whatsapp' });
            const res = await request(app)
                .post(`/leads/${lead.id}/reply`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ content: 'hello' });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/messenger and instagram/i);
        });

        it('returns WINDOW_CLOSED when the last inbound message is older than 24 hours', async () => {
            const lead = await createLead({
                business: bizA,
                channel: 'messenger',
                platform_thread_id: 'messenger:12345',
            });
            await createMessage({
                lead,
                direction: 'inbound',
                received_at: new Date(Date.now() - (DAY_MS + 60 * 1000)),
            });

            const res = await request(app)
                .post(`/leads/${lead.id}/reply`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ content: 'Sorry for the delay!' });

            expect(res.status).toBe(409);
            expect(res.body.code).toBe('WINDOW_CLOSED');
            expect(sendTextMessage).not.toHaveBeenCalled();
        });

        it('returns 400 when the specific platform channel is not connected, even if some channel exists', async () => {
            // bizA only has a 'messenger' channel connected — a lead with
            // channel 'instagram' should fail the specific-platform lookup
            // even though requireChannel (any channel) already passed.
            const lead = await createLead({
                business: bizA,
                channel: 'instagram',
                platform_thread_id: 'instagram:99999',
            });
            await createMessage({ lead, direction: 'inbound', received_at: new Date() });

            const res = await request(app)
                .post(`/leads/${lead.id}/reply`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ content: 'hello from instagram' });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/instagram channel not connected/i);
        });

        it('sends the reply and marks a "new" lead as "contacted" within the 24h window', async () => {
            const lead = await createLead({
                business: bizA,
                channel: 'messenger',
                platform_thread_id: 'messenger:55555',
                status: 'new',
            });
            await createMessage({ lead, direction: 'inbound', received_at: new Date() });
            sendTextMessage.mockResolvedValue({ recipient_id: '55555', message_id: 'mid.999' });

            const res = await request(app)
                .post(`/leads/${lead.id}/reply`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ content: 'Thanks for reaching out!' });

            expect(res.status).toBe(201);
            expect(res.body.direction).toBe('outbound');
            expect(sendTextMessage).toHaveBeenCalledWith(
                expect.any(String),
                '55555',
                'Thanks for reaching out!'
            );

            const followUp = await request(app)
                .get(`/leads/${lead.id}`)
                .set('Authorization', `Bearer ${tokenA}`);
            expect(followUp.body.status).toBe('contacted');
        });
    });
});
