// tests/helpers/factory.js
//
// Shared helpers for creating and tearing down test data directly against
// the real local Postgres dev database via Prisma. Every business created
// through createBusiness()/createUser() should be torn down at the end of
// the test (or describe block) via cleanupBusinesses() — deleting a
// `businesses` row cascades to its users, leads, business_channels,
// messages, notes, and auth_tokens per schema.prisma, so a single call
// per business is enough.
//
// Never call cleanup on ids you did not create yourself.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../src/prismaClient');

let counter = 0;
function uniqueSuffix() {
    counter += 1;
    return `${Date.now()}_${counter}_${Math.random().toString(36).slice(2, 8)}`;
}

function uniqueEmail(prefix = 'test') {
    return `${prefix}.${uniqueSuffix()}@example.test`;
}

async function createBusiness(overrides = {}) {
    return prisma.businesses.create({
        data: {
            name: overrides.name || `Test Business ${uniqueSuffix()}`,
        },
    });
}

/**
 * Creates a business (unless one is passed in) and a user within it.
 * Returns { user, business, password } — password is the plaintext
 * password used to hash password_hash, so tests can log in with it.
 */
async function createUser(opts = {}) {
    const {
        business,
        role = 'admin',
        status = 'active',
        password = 'Password123!',
        email,
        name = 'Test User',
        facebook_contact = '9800000000',
        emailVerified,
    } = opts;

    const biz = business || (await createBusiness());
    const password_hash = password ? await bcrypt.hash(password, 12) : null;

    const verifiedAt =
        emailVerified !== undefined
            ? (emailVerified ? new Date() : null)
            : (status === 'active' || status === 'pending_approval' || status === 'rejected')
                ? new Date()
                : null;

    const user = await prisma.users.create({
        data: {
            business_id: biz.id,
            name,
            email: email || uniqueEmail(),
            password_hash,
            role,
            status,
            email_verified_at: verifiedAt,
            facebook_contact,
        },
    });

    return { user, business: biz, password };
}

function issueToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, business_id: user.business_id },
        process.env.JWT_SECRET
    );
}

async function createChannel(opts = {}) {
    const {
        business,
        platform = 'messenger',
        external_id,
        display_name = 'Test Page',
        access_token = 'fake-page-access-token',
    } = opts;

    return prisma.business_channels.create({
        data: {
            business_id: business.id,
            platform,
            external_id: external_id || `ext_${uniqueSuffix()}`,
            display_name,
            access_token,
        },
    });
}

async function createLead(opts = {}) {
    const { business, ...overrides } = opts;
    return prisma.leads.create({
        data: {
            business_id: business.id,
            contact_name: overrides.contact_name || 'Test Lead',
            phone: overrides.phone ?? null,
            channel: overrides.channel || 'messenger',
            message_type: overrides.message_type || 'customer_lead',
            intent: overrides.intent || 'unclassified',
            status: overrides.status || 'new',
            platform_thread_id: overrides.platform_thread_id ?? `messenger:${uniqueSuffix()}`,
            possible_duplicate: overrides.possible_duplicate ?? false,
            assigned_to: overrides.assigned_to ?? null,
        },
    });
}

async function createMessage(opts = {}) {
    const { lead, body = 'Test message', direction = 'inbound', platform_message_id, received_at } = opts;
    return prisma.messages.create({
        data: {
            lead_id: lead.id,
            body,
            direction,
            platform_message_id: platform_message_id ?? null,
            ...(received_at ? { received_at } : {}),
        },
    });
}

/**
 * Deletes one or more `businesses` rows created by this test suite.
 * Cascades remove users, leads, business_channels, messages, notes,
 * and auth_tokens automatically. Safe to call with a mix of business
 * objects and raw ids; falsy values are ignored.
 */
async function cleanupBusinesses(...businesses) {
    const ids = businesses
        .filter(Boolean)
        .map((b) => (typeof b === 'number' ? b : b.id))
        .filter((id) => Number.isInteger(id));
    if (!ids.length) return;
    await prisma.businesses.deleteMany({ where: { id: { in: ids } } });
}

module.exports = {
    prisma,
    uniqueEmail,
    uniqueSuffix,
    createBusiness,
    createUser,
    issueToken,
    createChannel,
    createLead,
    createMessage,
    cleanupBusinesses,
};
