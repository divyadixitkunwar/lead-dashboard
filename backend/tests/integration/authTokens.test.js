// tests/integration/authTokens.test.js
//
// authTokens.js is inherently DB-dependent (queries auth_tokens directly),
// so per the handoff doc these are run as integration tests against the
// real local Postgres DB rather than unit tests with a mocked Prisma
// client.

const {
    generateVerificationCode,
    createAuthToken,
    findValidToken,
    invalidateUserTokens,
    checkResendCooldown,
} = require('../../src/services/authTokens');
const { prisma, createUser, cleanupBusinesses } = require('../helpers/factory');

describe('authTokens service', () => {
    describe('generateVerificationCode', () => {
        it('always returns a 6-digit, zero-padded string', () => {
            for (let i = 0; i < 200; i++) {
                const code = generateVerificationCode();
                expect(code).toMatch(/^\d{6}$/);
            }
        });

        it('produces codes across the full range, including values needing padding', () => {
            const codes = new Set();
            for (let i = 0; i < 500; i++) codes.add(generateVerificationCode());
            const hasLowCode = [...codes].some((c) => c.startsWith('0'));
            // With 500 draws from 0-999999, at least one code starting with
            // '0' (i.e. < 100000) is overwhelmingly likely; this asserts
            // padding actually happens rather than just trusting padStart.
            expect(hasLowCode).toBe(true);
        });
    });

    describe('createAuthToken / findValidToken', () => {
        let business;
        let user;

        beforeEach(async () => {
            const created = await createUser({ status: 'pending' });
            business = created.business;
            user = created.user;
        });

        afterEach(async () => {
            await cleanupBusinesses(business);
        });

        it('hashes the raw value — the stored token_hash is not the plaintext code', async () => {
            const row = await createAuthToken(prisma, {
                user_id: user.id,
                type: 'email_verify',
                rawValue: '123456',
                expiresInMs: 15 * 60 * 1000,
            });
            expect(row.token_hash).not.toBe('123456');
            expect(row.token_hash).toMatch(/^[a-f0-9]{64}$/); // sha256 hex digest
        });

        it('findValidToken locates a freshly created, unexpired, unused token', async () => {
            await createAuthToken(prisma, {
                user_id: user.id,
                type: 'email_verify',
                rawValue: '654321',
                expiresInMs: 15 * 60 * 1000,
            });
            const found = await findValidToken(prisma, { type: 'email_verify', rawValue: '654321' });
            expect(found).not.toBeNull();
            expect(found.user_id).toBe(user.id);
        });

        it('findValidToken returns null for a value that was never created', async () => {
            const found = await findValidToken(prisma, { type: 'email_verify', rawValue: '000000' });
            expect(found).toBeNull();
        });

        it('findValidToken returns null for an expired token', async () => {
            await createAuthToken(prisma, {
                user_id: user.id,
                type: 'email_verify',
                rawValue: '111111',
                expiresInMs: -1000, // already expired
            });
            const found = await findValidToken(prisma, { type: 'email_verify', rawValue: '111111' });
            expect(found).toBeNull();
        });

        it('findValidToken returns null after invalidateUserTokens marks it used', async () => {
            await createAuthToken(prisma, {
                user_id: user.id,
                type: 'email_verify',
                rawValue: '222222',
                expiresInMs: 15 * 60 * 1000,
            });
            await invalidateUserTokens(prisma, { user_id: user.id, type: 'email_verify' });
            const found = await findValidToken(prisma, { type: 'email_verify', rawValue: '222222' });
            expect(found).toBeNull();
        });

        it('does not cross-match tokens of a different type', async () => {
            await createAuthToken(prisma, {
                user_id: user.id,
                type: 'password_reset',
                rawValue: '333333',
                expiresInMs: 15 * 60 * 1000,
            });
            const found = await findValidToken(prisma, { type: 'email_verify', rawValue: '333333' });
            expect(found).toBeNull();
        });
    });

    describe('checkResendCooldown', () => {
        let business;
        let user;

        beforeEach(async () => {
            const created = await createUser({ status: 'pending' });
            business = created.business;
            user = created.user;
        });

        afterEach(async () => {
            await cleanupBusinesses(business);
        });

        it('allows the first request when no prior tokens exist', async () => {
            const check = await checkResendCooldown(prisma, user.id, 'email_verify');
            expect(check.allowed).toBe(true);
        });

        it('blocks a second request within 60 seconds with reason "cooldown"', async () => {
            await createAuthToken(prisma, {
                user_id: user.id,
                type: 'email_verify',
                rawValue: '444444',
                expiresInMs: 15 * 60 * 1000,
            });
            const check = await checkResendCooldown(prisma, user.id, 'email_verify');
            expect(check.allowed).toBe(false);
            expect(check.reason).toBe('cooldown');
            expect(check.wait_seconds).toBeGreaterThan(0);
            expect(check.wait_seconds).toBeLessThanOrEqual(60);
        });

        it('allows a request again once 60 seconds have passed', async () => {
            // Insert a token whose created_at is 61 seconds in the past so
            // the cooldown window has elapsed, without needing to sleep.
            await prisma.auth_tokens.create({
                data: {
                    user_id: user.id,
                    type: 'email_verify',
                    token_hash: 'irrelevant-hash-for-this-test',
                    expires_at: new Date(Date.now() + 15 * 60 * 1000),
                    created_at: new Date(Date.now() - 61 * 1000),
                },
            });
            const check = await checkResendCooldown(prisma, user.id, 'email_verify');
            expect(check.allowed).toBe(true);
        });

        it('blocks with reason "rate_limit" after 5 sends in the past hour, even outside the cooldown window', async () => {
            // 5 tokens, each spaced safely more than 60s apart but all
            // within the last hour, so cooldown never triggers but the
            // hourly cap does.
            for (let i = 0; i < 5; i++) {
                await prisma.auth_tokens.create({
                    data: {
                        user_id: user.id,
                        type: 'email_verify',
                        token_hash: `hash-${i}`,
                        expires_at: new Date(Date.now() + 15 * 60 * 1000),
                        created_at: new Date(Date.now() - (5 - i) * 5 * 60 * 1000), // 25,20,15,10,5 min ago
                    },
                });
            }
            const check = await checkResendCooldown(prisma, user.id, 'email_verify');
            expect(check.allowed).toBe(false);
            expect(check.reason).toBe('rate_limit');
        });

        it('does not let one type\'s send history affect another type\'s cooldown', async () => {
            await createAuthToken(prisma, {
                user_id: user.id,
                type: 'password_reset',
                rawValue: '555555',
                expiresInMs: 15 * 60 * 1000,
            });
            const check = await checkResendCooldown(prisma, user.id, 'email_verify');
            expect(check.allowed).toBe(true);
        });
    });
});
