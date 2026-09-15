const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const { protect, requireActive } = require('../middleware/auth');
const {
    generateVerificationCode,
    createAuthToken,
    findValidToken,
    invalidateUserTokens,
    checkResendCooldown,
} = require('../services/authTokens');
const { sendVerificationEmail, sendPasswordResetCodeEmail } = require('../services/resend');

const VERIFY_CODE_TTL_MS = 15 * 60 * 1000;
const RESET_CODE_TTL_MS = 15 * 60 * 1000;



function issueSessionToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, business_id: user.business_id },
        process.env.JWT_SECRET
    );
}

async function buildAuthPayload(user) {
    const channelCount = await prisma.business_channels.count({
        where: { business_id: user.business_id },
    });
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        business_id: user.business_id,
        status: user.status,
        hasChannel: channelCount > 0,
    };
}


async function issueVerificationCode(user) {
    const check = await checkResendCooldown(prisma, user.id, 'email_verify');
    if (!check.allowed) {
        const err = new Error(
            check.reason === 'cooldown' ? 'Please wait before requesting another code' : 'Too many codes requested — try again later'
        );
        err.status = 429;
        err.wait_seconds = check.wait_seconds;
        throw err;
    }
    await invalidateUserTokens(prisma, { user_id: user.id, type: 'email_verify' });
    const code = generateVerificationCode();
    await createAuthToken(prisma, { user_id: user.id, type: 'email_verify', rawValue: code, expiresInMs: VERIFY_CODE_TTL_MS });
    await sendVerificationEmail(user.email, code);
}

router.post('/register', async (req, res) => {
    try {
        const { business_name, name, email, password, facebook_contact } = req.body;
        if (!business_name || !name || !email || !password || !facebook_contact) {
            return res.status(400).json({ error: 'business_name, name, email, password, and facebook_contact are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const existing = await prisma.users.findUnique({ where: { email } });
        let user;

        if (existing) {

            if (existing.status === 'pending' && existing.password_hash) {
                user = await prisma.users.update({
                    where: { id: existing.id },
                    data: { name, password_hash: await bcrypt.hash(password, 12), facebook_contact },
                });
                await prisma.businesses.update({ where: { id: user.business_id }, data: { name: business_name } });
            } else {
                return res.status(409).json({ error: 'Email already in use' });
            }
        } else {
            const password_hash = await bcrypt.hash(password, 12);
            user = await prisma.$transaction(async (tx) => {
                const business = await tx.businesses.create({ data: { name: business_name } });
                return tx.users.create({
                    data: { business_id: business.id, name, email, password_hash, facebook_contact, role: 'admin', status: 'pending' },
                });
            });
        }

        await issueVerificationCode(user);

        res.status(201).json({ email: user.email });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message, wait_seconds: error.wait_seconds });
        if (error.code === 'P2002') return res.status(409).json({ error: 'Email already in use' });
        res.status(500).json({ error: error.message });
    }
});


router.post('/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).json({ error: 'email and code are required' });

        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'Invalid or expired code' });

        const tokenRow = await findValidToken(prisma, { type: 'email_verify', rawValue: code });
        if (!tokenRow || tokenRow.user_id !== user.id) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        const updated = await prisma.$transaction(async (tx) => {
            await tx.auth_tokens.update({ where: { id: tokenRow.id }, data: { used_at: new Date() } });
            return tx.users.update({
                where: { id: user.id },
                data: { email_verified_at: new Date(), status: 'pending_approval' },
            });
        });

        const token = issueSessionToken(updated);
        const payload = await buildAuthPayload(updated);
        res.json({ token, user: payload });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'email is required' });

        const user = await prisma.users.findUnique({ where: { email } });
        if (!user || user.status !== 'pending') {
            return res.status(400).json({ error: 'No pending verification for that email' });
        }

        await issueVerificationCode(user);
        res.json({ message: 'Verification code sent' });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message, wait_seconds: error.wait_seconds });
        res.status(500).json({ error: error.message });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

        if (user.status === 'pending') {
            return res.status(403).json({ error: 'Email not verified', code: 'EMAIL_NOT_VERIFIED' });
        }
        if (user.status === 'rejected') {
            return res.status(403).json({ error: 'Your application was not approved', code: 'APPLICATION_REJECTED' });
        }

        const token = issueSessionToken(user);
        const payload = await buildAuthPayload(user);
        res.json({ token, user: payload });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/me', protect, async (req, res) => {
    try {
        const user = await prisma.users.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(401).json({ error: 'Account not found' });
        const payload = await buildAuthPayload(user);
        res.json(payload);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = email ? await prisma.users.findUnique({ where: { email } }) : null;

        if (user && (user.status === 'active' || user.status === 'pending_approval')) {
            const check = await checkResendCooldown(prisma, user.id, 'password_reset');
            if (!check.allowed) {
                return res.status(429).json({
                    error: check.reason === 'cooldown' ? 'Please wait before requesting another code' : 'Too many codes requested — try again later',
                    wait_seconds: check.wait_seconds,
                });
            }
            await invalidateUserTokens(prisma, { user_id: user.id, type: 'password_reset' });
            const code = generateVerificationCode();
            await createAuthToken(prisma, { user_id: user.id, type: 'password_reset', rawValue: code, expiresInMs: RESET_CODE_TTL_MS });
            await sendPasswordResetCodeEmail(user.email, code);
        }

        res.json({ message: 'If that email has an account, we sent a reset code.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, password } = req.body;
        if (!email || !code || !password) return res.status(400).json({ error: 'email, code, and password are required' });
        if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'Invalid or expired code' });

        const tokenRow = await findValidToken(prisma, { type: 'password_reset', rawValue: code });
        if (!tokenRow || tokenRow.user_id !== user.id) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        const password_hash = await bcrypt.hash(password, 12);
        await prisma.$transaction([
            prisma.auth_tokens.update({ where: { id: tokenRow.id }, data: { used_at: new Date() } }),
            prisma.users.update({ where: { id: user.id }, data: { password_hash } }),
        ]);

        res.json({ message: 'Password updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/logout', protect, (req, res) => {
    res.json({ message: 'Logged out successfully' });
});


router.patch('/profile', protect, requireActive, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const updated = await prisma.users.update({
            where: { id: req.user.id },
            data: { name: name.trim() },
        });
        const payload = await buildAuthPayload(updated);
        res.json(payload);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/change-password', protect, requireActive, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'currentPassword and newPassword are required' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters' });
        }

        const user = await prisma.users.findUnique({ where: { id: req.user.id } });
        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

        const password_hash = await bcrypt.hash(newPassword, 12);
        await prisma.users.update({ where: { id: user.id }, data: { password_hash } });

        res.json({ message: 'Password updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
