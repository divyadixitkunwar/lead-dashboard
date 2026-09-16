// tests/integration/business.test.js

const request = require('supertest');
const app = require('../../src/app');
const { createUser, issueToken, cleanupBusinesses } = require('../helpers/factory');

describe('/business', () => {
    let bizA, adminA, staffA, tokenAdminA, tokenStaffA;
    let bizB, tokenAdminB;

    beforeAll(async () => {
        ({ business: bizA, user: adminA } = await createUser({ status: 'active', role: 'admin' }));
        ({ user: staffA } = await createUser({ business: bizA, status: 'active', role: 'staff' }));
        tokenAdminA = issueToken(adminA);
        tokenStaffA = issueToken(staffA);

        const { business: b, user: adminB } = await createUser({ status: 'active', role: 'admin' });
        bizB = b;
        tokenAdminB = issueToken(adminB);
    });

    afterAll(async () => {
        await cleanupBusinesses(bizA, bizB);
    });

    describe('GET /business', () => {
        it('returns only the caller\'s own business', async () => {
            const res = await request(app).get('/business').set('Authorization', `Bearer ${tokenAdminA}`);
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(bizA.id);
        });

        it('never returns another business by manipulating the token alone (scoped by business_id, not a param)', async () => {
            const resA = await request(app).get('/business').set('Authorization', `Bearer ${tokenAdminA}`);
            const resB = await request(app).get('/business').set('Authorization', `Bearer ${tokenAdminB}`);
            expect(resA.body.id).not.toBe(resB.body.id);
        });

        it('rejects an unauthenticated request', async () => {
            const res = await request(app).get('/business');
            expect(res.status).toBe(401);
        });
    });

    describe('PATCH /business', () => {
        it('blocks a staff user from renaming the business', async () => {
            const res = await request(app)
                .patch('/business')
                .set('Authorization', `Bearer ${tokenStaffA}`)
                .send({ name: 'Staff Rename Attempt' });
            expect(res.status).toBe(403);
        });

        it('rejects an empty name', async () => {
            const res = await request(app)
                .patch('/business')
                .set('Authorization', `Bearer ${tokenAdminA}`)
                .send({ name: '   ' });
            expect(res.status).toBe(400);
        });

        it('allows an admin to rename their own business', async () => {
            const res = await request(app)
                .patch('/business')
                .set('Authorization', `Bearer ${tokenAdminA}`)
                .send({ name: 'Renamed Business' });
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Renamed Business');
        });
    });
});
