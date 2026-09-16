// tests/integration/channels.test.js
//
// metaGraph.js is mocked entirely — no real Facebook/Instagram Graph API
// calls are ever made from this file.

const request = require('supertest');

const metaGraphService = require('../../src/services/metaGraph');
metaGraphService.getLongLivedToken = vi.fn();
metaGraphService.getManagedPages = vi.fn();
metaGraphService.getLinkedInstagramAccount = vi.fn();
metaGraphService.subscribePageWebhook = vi.fn();
metaGraphService.sendTextMessage = vi.fn();

const app = require('../../src/app');
const {
    getLongLivedToken,
    getManagedPages,
    getLinkedInstagramAccount,
    subscribePageWebhook,
} = metaGraphService;
const { createUser, createChannel, issueToken, cleanupBusinesses, uniqueSuffix } = require('../helpers/factory');

describe('/channels', () => {
    let bizA, userA, tokenA;
    let bizB, userB, tokenB;

    beforeAll(async () => {
        ({ business: bizA, user: userA } = await createUser({ status: 'active' }));
        tokenA = issueToken(userA);

        ({ business: bizB, user: userB } = await createUser({ status: 'active' }));
        tokenB = issueToken(userB);
    });

    afterAll(async () => {
        await cleanupBusinesses(bizA, bizB);
    });

    beforeEach(() => {
        getLongLivedToken.mockReset();
        getManagedPages.mockReset();
        getLinkedInstagramAccount.mockReset();
        subscribePageWebhook.mockReset();
    });

    describe('GET /channels', () => {
        it('only lists channels for the caller\'s own business', async () => {
            const chA = await createChannel({ business: bizA, platform: 'messenger' });
            const chB = await createChannel({ business: bizB, platform: 'messenger' });

            const res = await request(app).get('/channels').set('Authorization', `Bearer ${tokenA}`);
            expect(res.status).toBe(200);
            const ids = res.body.map((c) => c.id);
            expect(ids).toContain(chA.id);
            expect(ids).not.toContain(chB.id);
            // access_token must never be exposed in the list response
            expect(res.body.every((c) => !('access_token' in c))).toBe(true);
        });
    });

    describe('POST /channels/facebook/callback', () => {
        it('rejects when accessToken is missing', async () => {
            const res = await request(app)
                .post('/channels/facebook/callback')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({});
            expect(res.status).toBe(400);
        });

        it('exchanges the token, fetches managed pages, and enriches each with linked Instagram', async () => {
            getLongLivedToken.mockResolvedValue('long-lived-token-abc');
            getManagedPages.mockResolvedValue([
                { id: 'page-1', name: 'My Shop', access_token: 'page-token-1' },
            ]);
            getLinkedInstagramAccount.mockResolvedValue({ id: 'ig-1', username: 'my_shop' });

            const res = await request(app)
                .post('/channels/facebook/callback')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ accessToken: 'short-lived-user-token' });

            expect(res.status).toBe(200);
            expect(getLongLivedToken).toHaveBeenCalledWith('short-lived-user-token');
            expect(getManagedPages).toHaveBeenCalledWith('long-lived-token-abc');
            expect(res.body.pages).toEqual([
                {
                    id: 'page-1',
                    name: 'My Shop',
                    access_token: 'page-token-1',
                    instagram: { id: 'ig-1', username: 'my_shop' },
                },
            ]);
        });
    });

    describe('POST /channels/facebook/finish', () => {
        it('rejects when page data is missing', async () => {
            const res = await request(app)
                .post('/channels/facebook/finish')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({});
            expect(res.status).toBe(400);
        });

        it('creates a messenger (and linked instagram) channel, and subscribes the webhook', async () => {
            subscribePageWebhook.mockResolvedValue({ success: true });
            const pageId = `page_${uniqueSuffix()}`;
            const igId = `ig_${uniqueSuffix()}`;

            const res = await request(app)
                .post('/channels/facebook/finish')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    page: {
                        id: pageId,
                        name: 'My Shop',
                        access_token: 'page-token',
                        instagram: { id: igId, username: 'my_shop' },
                    },
                });

            expect(res.status).toBe(201);
            expect(subscribePageWebhook).toHaveBeenCalledWith(pageId, 'page-token');
            expect(res.body.messenger.platform).toBe('messenger');
            expect(res.body.instagram.platform).toBe('instagram');
        });

        it('returns 409 when the Facebook Page is already connected to a different business', async () => {
            const sharedPageId = `page_${uniqueSuffix()}`;
            await createChannel({ business: bizB, platform: 'messenger', external_id: sharedPageId });

            const res = await request(app)
                .post('/channels/facebook/finish')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ page: { id: sharedPageId, name: 'Stolen Page', access_token: 'tok' } });

            expect(res.status).toBe(409);
            expect(subscribePageWebhook).not.toHaveBeenCalled();
        });

        it('returns 409 when the linked Instagram account is already connected to a different business', async () => {
            const sharedIgId = `ig_${uniqueSuffix()}`;
            await createChannel({ business: bizB, platform: 'instagram', external_id: sharedIgId });
            subscribePageWebhook.mockResolvedValue({ success: true });

            const res = await request(app)
                .post('/channels/facebook/finish')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    page: {
                        id: `page_${uniqueSuffix()}`,
                        name: 'My Shop',
                        access_token: 'tok',
                        instagram: { id: sharedIgId, username: 'stolen' },
                    },
                });

            expect(res.status).toBe(409);
        });
    });

    describe('POST /channels/instagram/recheck', () => {
        it('returns 400 when no Facebook Page is connected yet', async () => {
            const { business: freshBiz, user: freshUser } = await createUser({ status: 'active' });
            const freshToken = issueToken(freshUser);

            const res = await request(app)
                .post('/channels/instagram/recheck')
                .set('Authorization', `Bearer ${freshToken}`);
            expect(res.status).toBe(400);

            await cleanupBusinesses(freshBiz);
        });

        it('returns linked:false when no Instagram account is linked', async () => {
            const { business: biz, user } = await createUser({ status: 'active' });
            const token = issueToken(user);
            await createChannel({ business: biz, platform: 'messenger' });
            getLinkedInstagramAccount.mockResolvedValue(null);

            const res = await request(app)
                .post('/channels/instagram/recheck')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.linked).toBe(false);

            await cleanupBusinesses(biz);
        });

        it('links a newly-found Instagram account', async () => {
            const { business: biz, user } = await createUser({ status: 'active' });
            const token = issueToken(user);
            await createChannel({ business: biz, platform: 'messenger' });
            const igId = `ig_${uniqueSuffix()}`;
            getLinkedInstagramAccount.mockResolvedValue({ id: igId, username: 'newly_linked' });

            const res = await request(app)
                .post('/channels/instagram/recheck')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.linked).toBe(true);
            expect(res.body.instagram.external_id).toBe(igId);

            await cleanupBusinesses(biz);
        });
    });

    describe('DELETE /channels/:id', () => {
        it('returns 404 when the channel belongs to another business', async () => {
            const chB = await createChannel({ business: bizB, platform: 'whatsapp' });
            const res = await request(app)
                .delete(`/channels/${chB.id}`)
                .set('Authorization', `Bearer ${tokenA}`);
            expect(res.status).toBe(404);
        });

        it('deletes a channel belonging to the caller\'s own business', async () => {
            const chA = await createChannel({ business: bizA, platform: 'whatsapp' });
            const res = await request(app)
                .delete(`/channels/${chA.id}`)
                .set('Authorization', `Bearer ${tokenA}`);
            expect(res.status).toBe(200);
        });
    });
});
