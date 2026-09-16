// tests/integration/admin.test.js
//
// admin.js requires protect + requireSuperadmin on every route. There is
// no public signup path to a 'superadmin' role, so we create one directly
// via the factory (this role is presumably provisioned out-of-band, e.g.
// scripts/createOwner.js, in real usage).

const request = require('supertest');
const app = require('../../src/app');
const { createUser, issueToken, cleanupBusinesses } = require('../helpers/factory');

describe('/admin', () => {
    let superBiz, superUser, tokenSuper;
    let regularBiz, regularAdmin, tokenRegular;

    beforeAll(async () => {
        ({ business: superBiz, user: superUser } = await createUser({ status: 'active', role: 'superadmin' }));
        tokenSuper = issueToken(superUser);

        ({ business: regularBiz, user: regularAdmin } = await createUser({ status: 'active', role: 'admin' }));
        tokenRegular = issueToken(regularAdmin);
    });

    afterAll(async () => {
        await cleanupBusinesses(superBiz, regularBiz);
    });

    describe('requireSuperadmin enforcement', () => {
        it('blocks a regular admin from viewing the pending list', async () => {
            const res = await request(app).get('/admin/pending').set('Authorization', `Bearer ${tokenRegular}`);
            expect(res.status).toBe(403);
        });

        it('blocks a regular admin from approving an application', async () => {
            const res = await request(app)
                .post(`/admin/${regularAdmin.id}/approve`)
                .set('Authorization', `Bearer ${tokenRegular}`);
            expect(res.status).toBe(403);
        });

        it('blocks an unauthenticated request', async () => {
            const res = await request(app).get('/admin/pending');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /admin/pending', () => {
        it('lists admin users awaiting approval, including business info', async () => {
            const { business: appBiz, user: applicant } = await createUser({
                status: 'pending_approval',
                role: 'admin',
                name: 'Pending Owner',
            });

            const res = await request(app).get('/admin/pending').set('Authorization', `Bearer ${tokenSuper}`);
            expect(res.status).toBe(200);
            const entry = res.body.find((p) => p.user_id === applicant.id);
            expect(entry).toBeDefined();
            expect(entry.business.id).toBe(appBiz.id);
            expect(entry.name).toBe('Pending Owner');

            await cleanupBusinesses(appBiz);
        });

        it('does not list a staff-role signup even if pending_approval', async () => {
            const { business: staffBiz, user: staffApplicant } = await createUser({
                status: 'pending_approval',
                role: 'staff',
            });
            const res = await request(app).get('/admin/pending').set('Authorization', `Bearer ${tokenSuper}`);
            expect(res.body.some((p) => p.user_id === staffApplicant.id)).toBe(false);
            await cleanupBusinesses(staffBiz);
        });
    });

    describe('POST /admin/:userId/approve', () => {
        it('returns 404 for a nonexistent application', async () => {
            const res = await request(app)
                .post('/admin/999999999/approve')
                .set('Authorization', `Bearer ${tokenSuper}`);
            expect(res.status).toBe(404);
        });

        it('approves a pending application, moving status to active', async () => {
            const { business: appBiz, user: applicant } = await createUser({
                status: 'pending_approval',
                role: 'admin',
            });

            const res = await request(app)
                .post(`/admin/${applicant.id}/approve`)
                .set('Authorization', `Bearer ${tokenSuper}`);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('active');

            await cleanupBusinesses(appBiz);
        });

        it('rejects approving the same application twice', async () => {
            const { business: appBiz, user: applicant } = await createUser({
                status: 'pending_approval',
                role: 'admin',
            });

            const first = await request(app)
                .post(`/admin/${applicant.id}/approve`)
                .set('Authorization', `Bearer ${tokenSuper}`);
            expect(first.status).toBe(200);

            const second = await request(app)
                .post(`/admin/${applicant.id}/approve`)
                .set('Authorization', `Bearer ${tokenSuper}`);
            expect(second.status).toBe(400);
            expect(second.body.error).toMatch(/cannot approve/i);

            await cleanupBusinesses(appBiz);
        });
    });

    describe('POST /admin/:userId/reject', () => {
        it('returns 404 for a nonexistent application', async () => {
            const res = await request(app)
                .post('/admin/999999999/reject')
                .set('Authorization', `Bearer ${tokenSuper}`);
            expect(res.status).toBe(404);
        });

        it('rejects a pending application, moving status to rejected', async () => {
            const { business: appBiz, user: applicant } = await createUser({
                status: 'pending_approval',
                role: 'admin',
            });

            const res = await request(app)
                .post(`/admin/${applicant.id}/reject`)
                .set('Authorization', `Bearer ${tokenSuper}`);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('rejected');

            await cleanupBusinesses(appBiz);
        });

        it('rejects rejecting the same application twice', async () => {
            const { business: appBiz, user: applicant } = await createUser({
                status: 'pending_approval',
                role: 'admin',
            });

            const first = await request(app)
                .post(`/admin/${applicant.id}/reject`)
                .set('Authorization', `Bearer ${tokenSuper}`);
            expect(first.status).toBe(200);

            const second = await request(app)
                .post(`/admin/${applicant.id}/reject`)
                .set('Authorization', `Bearer ${tokenSuper}`);
            expect(second.status).toBe(400);
            expect(second.body.error).toMatch(/cannot reject/i);

            await cleanupBusinesses(appBiz);
        });

        it('cannot approve an application that was already rejected', async () => {
            const { business: appBiz, user: applicant } = await createUser({
                status: 'pending_approval',
                role: 'admin',
            });

            const rejectRes = await request(app)
                .post(`/admin/${applicant.id}/reject`)
                .set('Authorization', `Bearer ${tokenSuper}`);
            expect(rejectRes.status).toBe(200);

            const approveRes = await request(app)
                .post(`/admin/${applicant.id}/approve`)
                .set('Authorization', `Bearer ${tokenSuper}`);
            expect(approveRes.status).toBe(400);

            await cleanupBusinesses(appBiz);
        });
    });
});
