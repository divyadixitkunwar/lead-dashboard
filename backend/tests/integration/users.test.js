// tests/integration/users.test.js
//
// users.js requires protect + requireActive + requireChannel, then
// adminOnly on every route — so every business here needs a connected
// channel before these tests are meaningful.

const request = require('supertest');
const app = require('../../src/app');
const { createUser, createChannel, issueToken, cleanupBusinesses } = require('../helpers/factory');

describe('/users', () => {
    let bizA, adminA, staffA, tokenAdminA, tokenStaffA;
    let bizB, adminB, tokenAdminB;

    beforeAll(async () => {
        ({ business: bizA, user: adminA } = await createUser({ status: 'active', role: 'admin' }));
        ({ user: staffA } = await createUser({ business: bizA, status: 'active', role: 'staff' }));
        await createChannel({ business: bizA });
        tokenAdminA = issueToken(adminA);
        tokenStaffA = issueToken(staffA);

        ({ business: bizB, user: adminB } = await createUser({ status: 'active', role: 'admin' }));
        await createChannel({ business: bizB });
        tokenAdminB = issueToken(adminB);
    });

    afterAll(async () => {
        await cleanupBusinesses(bizA, bizB);
    });

    describe('adminOnly enforcement', () => {
        it('blocks a staff user from listing users', async () => {
            const res = await request(app).get('/users').set('Authorization', `Bearer ${tokenStaffA}`);
            expect(res.status).toBe(403);
        });

        it('blocks a staff user from creating a user', async () => {
            const res = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${tokenStaffA}`)
                .send({ name: 'New Person', email: 'nope@example.test', password: 'Password123!' });
            expect(res.status).toBe(403);
        });

        it('blocks a staff user from patching a user', async () => {
            const res = await request(app)
                .patch(`/users/${staffA.id}`)
                .set('Authorization', `Bearer ${tokenStaffA}`)
                .send({ name: 'Self Promote' });
            expect(res.status).toBe(403);
        });

        it('blocks a staff user from deleting a user', async () => {
            const res = await request(app)
                .delete(`/users/${staffA.id}`)
                .set('Authorization', `Bearer ${tokenStaffA}`);
            expect(res.status).toBe(403);
        });
    });

    describe('business-scoped listing', () => {
        it('an admin only sees users within their own business', async () => {
            const res = await request(app).get('/users').set('Authorization', `Bearer ${tokenAdminA}`);
            expect(res.status).toBe(200);
            const ids = res.body.map((u) => u.id);
            expect(ids).toContain(adminA.id);
            expect(ids).toContain(staffA.id);
            expect(ids).not.toContain(adminB.id);
        });

        it('never includes password_hash in the response', async () => {
            const res = await request(app).get('/users').set('Authorization', `Bearer ${tokenAdminA}`);
            expect(res.body.every((u) => !('password_hash' in u))).toBe(true);
        });
    });

    describe('Cross-business isolation', () => {
        it('returns 404 when an admin tries to patch a user from a different business', async () => {
            const res = await request(app)
                .patch(`/users/${adminB.id}`)
                .set('Authorization', `Bearer ${tokenAdminA}`)
                .send({ name: 'Hijacked' });
            expect(res.status).toBe(404);
        });

        it('returns 404 when an admin tries to delete a user from a different business', async () => {
            const res = await request(app)
                .delete(`/users/${adminB.id}`)
                .set('Authorization', `Bearer ${tokenAdminA}`);
            expect(res.status).toBe(404);
        });
    });

    describe('POST /users (create)', () => {
        it('creates a new staff user scoped to the caller\'s business', async () => {
            const res = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${tokenAdminA}`)
                .send({ name: 'Fresh Hire', email: `fresh.${Date.now()}@example.test`, password: 'Password123!' });
            expect(res.status).toBe(201);
            expect(res.body.role).toBe('staff');
        });

        it('rejects a duplicate email with 409', async () => {
            const res = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${tokenAdminA}`)
                .send({ name: 'Duplicate', email: adminA.email, password: 'Password123!' });
            expect(res.status).toBe(409);
        });
    });

    describe('PATCH /users/:id (own business)', () => {
        it('updates a user within the same business', async () => {
            const res = await request(app)
                .patch(`/users/${staffA.id}`)
                .set('Authorization', `Bearer ${tokenAdminA}`)
                .send({ name: 'Renamed Staff' });
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Renamed Staff');
        });
    });
});
