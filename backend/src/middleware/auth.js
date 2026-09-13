const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Must run after `protect`. A valid JWT only proves someone logged in at
// some point — it does NOT prove they're currently approved, because
// verify-email now hands out a real session token to `pending_approval`
// users too (that's how they're able to log back in and see the waiting
// page without re-verifying). So every route that touches real business
// data (leads, users, channels) needs a fresh DB check that the account
// is actually `active` right now, not just "has a token."
const requireActive = async (req, res, next) => {
    try {
        const user = await prisma.users.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(401).json({ error: 'Account not found' });
        if (user.status !== 'active') {
            return res.status(403).json({
                error: 'Account is not active',
                code: 'NOT_ACTIVE',
                status: user.status,
            });
        }
        req.user.status = user.status;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Gate for the platform-owner-only screens (the pending-business approval
// queue). Trusts the JWT's role claim, same as `adminOnly` already does —
// role isn't something that changes mid-session the way status can.
const requireSuperadmin = (req, res, next) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ error: 'Owner access required' });
    }
    next();
};

// Must run after `requireActive`. There's genuinely nothing to show on the
// dashboard/leads/users side of the app for a business with zero connected
// channels — so this blocks that data on the backend too, matching the
// frontend's redirect-to-connect-page behavior. NOT applied to channels.js
// itself, since that would make it impossible to ever connect the first
// channel at all.
const requireChannel = async (req, res, next) => {
    try {
        const count = await prisma.business_channels.count({
            where: { business_id: req.user.business_id },
        });
        if (count === 0) {
            return res.status(403).json({ error: 'No channel connected yet', code: 'NO_CHANNEL' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { protect, adminOnly, requireActive, requireSuperadmin, requireChannel };
