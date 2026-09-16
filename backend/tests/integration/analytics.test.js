// tests/integration/analytics.test.js

const request = require('supertest');
const app = require('../../src/app');
const {
    createUser,
    createChannel,
    createLead,
    createMessage,
    issueToken,
    cleanupBusinesses,
} = require('../helpers/factory');

describe('/analytics', () => {
    let business, user, token;

    beforeAll(async () => {
        ({ business, user } = await createUser({ status: 'active' }));
        await createChannel({ business });
        token = issueToken(user);

        // Seed known data: 2 'new' + 1 'contacted', 2 messenger + 1 whatsapp,
        // 2 price_inquiry + 1 availability, 1 duplicate.
        await createLead({ business, status: 'new', channel: 'messenger', intent: 'price_inquiry', message_type: 'customer_lead' });
        await createLead({ business, status: 'new', channel: 'messenger', intent: 'price_inquiry', message_type: 'customer_lead', possible_duplicate: true });
        await createLead({ business, status: 'contacted', channel: 'whatsapp', intent: 'availability', message_type: 'supplier' });
    });

    afterAll(async () => {
        await cleanupBusinesses(business);
    });

    describe('GET /analytics/summary', () => {
        it('returns correct total, duplicate count, and groupings for seeded data', async () => {
            const res = await request(app).get('/analytics/summary').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.total).toBe(3);
            expect(res.body.duplicates).toBe(1);

            const statusCounts = Object.fromEntries(res.body.byStatus.map((s) => [s.status, s._count]));
            expect(statusCounts.new).toBe(2);
            expect(statusCounts.contacted).toBe(1);

            const channelCounts = Object.fromEntries(res.body.byChannel.map((c) => [c.channel, c._count]));
            expect(channelCounts.messenger).toBe(2);
            expect(channelCounts.whatsapp).toBe(1);

            const intentCounts = Object.fromEntries(res.body.byIntent.map((i) => [i.intent, i._count]));
            expect(intentCounts.price_inquiry).toBe(2);
            expect(intentCounts.availability).toBe(1);
        });

        it('requires authentication', async () => {
            const res = await request(app).get('/analytics/summary');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /analytics/response-time', () => {
        it('computes average response time only from leads with an outbound message', async () => {
            const { business: rtBiz, user: rtUser } = await createUser({ status: 'active' });
            await createChannel({ business: rtBiz });
            const rtToken = issueToken(rtUser);

            const now = new Date('2026-01-01T00:00:00.000Z');
            const respondedLead = await createLead({ business: rtBiz });
            await require('../helpers/factory').prisma.leads.update({
                where: { id: respondedLead.id },
                data: { created_at: now },
            });
            await createMessage({
                lead: respondedLead,
                direction: 'outbound',
                body: 'Reply',
                received_at: new Date(now.getTime() + 10 * 60 * 1000), // 10 min later
            });

            // A second lead with no outbound reply — must be excluded from the average.
            await createLead({ business: rtBiz });

            const res = await request(app)
                .get('/analytics/response-time')
                .set('Authorization', `Bearer ${rtToken}`);

            expect(res.status).toBe(200);
            expect(res.body.sample_size).toBe(1);
            expect(res.body.avg_response_ms).toBe(10 * 60 * 1000);

            await cleanupBusinesses(rtBiz);
        });

        it('returns null average and 0 sample size when there is no response data', async () => {
            const { business: emptyBiz, user: emptyUser } = await createUser({ status: 'active' });
            await createChannel({ business: emptyBiz });
            const emptyToken = issueToken(emptyUser);

            await createLead({ business: emptyBiz });

            const res = await request(app)
                .get('/analytics/response-time')
                .set('Authorization', `Bearer ${emptyToken}`);

            expect(res.status).toBe(200);
            expect(res.body.sample_size).toBe(0);
            expect(res.body.avg_response_ms).toBeNull();

            await cleanupBusinesses(emptyBiz);
        });
    });
});
