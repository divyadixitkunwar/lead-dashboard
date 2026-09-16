// tests/security/sqlInjection.test.js
//
// Prisma parameterizes all queries built through its query builder, so
// this suite isn't expected to find and fix anything — it exists to
// *prove* that expectation holds, by throwing classic injection strings
// at query params and body fields and confirming the app treats them as
// inert literal strings rather than executable SQL.

const request = require('supertest');
const app = require('../../src/app');
const { prisma, createUser, createChannel, createLead, issueToken, cleanupBusinesses, uniqueEmail } = require('../helpers/factory');

const INJECTION_STRINGS = [
    "' OR '1'='1",
    "'; DROP TABLE leads; --",
    "1' OR '1'='1' --",
    "admin'--",
    "' UNION SELECT * FROM users --",
];

describe('Security — SQL injection resistance', () => {
    let business, user, token;

    beforeAll(async () => {
        ({ business, user } = await createUser({ status: 'active', role: 'admin' }));
        await createChannel({ business });
        token = issueToken(user);
    });

    afterAll(async () => {
        await cleanupBusinesses(business);
    });

    it('treats injection strings in /leads query filters as literal values, not SQL, and the leads table survives', async () => {
        for (const payload of INJECTION_STRINGS) {
            const res = await request(app)
                .get(`/leads?status=${encodeURIComponent(payload)}`)
                .set('Authorization', `Bearer ${token}`);
            // Should behave like any other non-matching filter: 200 with
            // an empty (or unaffected) array, never a 500 or a crash.
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        }

        // Prove the table itself is intact and queryable afterwards.
        const stillWorks = await prisma.leads.count();
        expect(typeof stillWorks).toBe('number');
    });

    it('stores an injection string in contact_name as inert literal text, not as executed SQL', async () => {
        const maliciousName = "Robert'); DROP TABLE leads;--";
        const res = await request(app)
            .post('/leads')
            .set('Authorization', `Bearer ${token}`)
            .send({ contact_name: maliciousName, channel: 'messenger' });

        expect(res.status).toBe(201);
        expect(res.body.contact_name).toBe(maliciousName);

        const stored = await prisma.leads.findUnique({ where: { id: res.body.id } });
        expect(stored.contact_name).toBe(maliciousName);
        expect(stored).not.toBeNull();
    });

    it('rejects a login attempt using an injection string as the email without crashing or bypassing auth', async () => {
        for (const payload of INJECTION_STRINGS) {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: payload, password: payload });
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Invalid email or password');
        }
    });

    it('stores an injection string as a literal business_name during registration, without side effects', async () => {
        const maliciousBusinessName = "Shop'; DROP TABLE businesses; --";
        const email = uniqueEmail('sqltest');

        const res = await request(app).post('/auth/register').send({
            business_name: maliciousBusinessName,
            name: 'Test Owner',
            email,
            password: 'Password123!',
            facebook_contact: '9800000000',
        });

        expect(res.status).toBe(201);
        const createdUser = await prisma.users.findUnique({ where: { email } });
        const createdBusiness = await prisma.businesses.findUnique({ where: { id: createdUser.business_id } });
        expect(createdBusiness.name).toBe(maliciousBusinessName);

        // Confirm the businesses table is still fully intact.
        const count = await prisma.businesses.count();
        expect(count).toBeGreaterThan(0);

        await cleanupBusinesses(createdBusiness);
    });

    it('treats an injection string used as a numeric :id param as a failed parseInt lookup, not a query bypass', async () => {
        await createLead({ business });
        const res = await request(app)
            .get(`/leads/${encodeURIComponent("1 OR 1=1")}`)
            .set('Authorization', `Bearer ${token}`);
        // parseInt("1 OR 1=1") === 1, so this legitimately resolves to
        // lead id 1 scoped to this business if it exists, or 404 — either
        // way it must never return more than one record or leak another
        // business's data structure.
        expect([200, 404]).toContain(res.status);
    });
});
