const crypto = require('crypto');

// 6-digit code for email verification
function generateVerificationCode() {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

// Never store the raw code — just its hash
function hashValue(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

async function createAuthToken(prisma, { user_id, type, rawValue, expiresInMs }) {
    return prisma.auth_tokens.create({
        data: {
            user_id,
            type,
            token_hash: hashValue(rawValue),
            expires_at: new Date(Date.now() + expiresInMs),
        },
    });
}

async function findValidToken(prisma, { type, rawValue }) {
    return prisma.auth_tokens.findFirst({
        where: {
            type,
            token_hash: hashValue(rawValue),
            used_at: null,
            expires_at: { gt: new Date() },
        },
    });
}

// Call before creating a new code so only the latest one is valid
async function invalidateUserTokens(prisma, { user_id, type }) {
    await prisma.auth_tokens.updateMany({
        where: { user_id, type, used_at: null },
        data: { used_at: new Date() },
    });
}

// 60s cooldown between sends, 5/hour cap
async function checkResendCooldown(prisma, user_id, type) {
    const last = await prisma.auth_tokens.findFirst({
        where: { user_id, type },
        orderBy: { created_at: 'desc' },
    });

    if (last) {
        const elapsedMs = Date.now() - last.created_at.getTime();
        if (elapsedMs < 60_000) {
            return { allowed: false, reason: 'cooldown', wait_seconds: Math.ceil((60_000 - elapsedMs) / 1000) };
        }
    }

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const countLastHour = await prisma.auth_tokens.count({
        where: { user_id, type, created_at: { gt: hourAgo } },
    });
    if (countLastHour >= 5) {
        return { allowed: false, reason: 'rate_limit' };
    }

    return { allowed: true };
}

module.exports = { generateVerificationCode, createAuthToken, findValidToken, invalidateUserTokens, checkResendCooldown };