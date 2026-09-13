const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { protect, requireSuperadmin } = require('../middleware/auth');

// Everything in this file is the platform owner's approval queue — a
// business's `admin` user can never see this, only an account with
// role: 'superadmin' can (see scripts/createOwner.js for how that account
// gets made).
router.use(protect, requireSuperadmin);

// GET /admin/pending — every business still waiting on a decision, oldest
// first (fairness). Only `role: 'admin'` users are relevant here — that's
// the one row per business that represents "this business signed up."
//
// NOTE: this assumes the reverse relation from `users` to `businesses` in
// your schema is named `businesses` (matching the pattern already used
// elsewhere in this codebase, e.g. `notes: { include: { users: true } }`
// in leads.js). If Prisma generated a different relation name for you
// (e.g. singular `business`), this will throw immediately on first call
// with a clear "Unknown field" error — just rename that one key below.
router.get('/pending', async (req, res) => {
    try {
        const pending = await prisma.users.findMany({
            where: { role: 'admin', status: 'pending_approval' },
            include: { businesses: true },
            orderBy: { created_at: 'asc' },
        });

        res.json(pending.map((u) => ({
            user_id: u.id,
            name: u.name,
            email: u.email,
            facebook_contact: u.facebook_contact,
            applied_at: u.created_at,
            business: { id: u.businesses.id, name: u.businesses.name },
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /admin/:userId/approve
router.post('/:userId/approve', async (req, res) => {
    try {
        const target = await prisma.users.findUnique({ where: { id: parseInt(req.params.userId) } });
        if (!target || target.role !== 'admin') return res.status(404).json({ error: 'Application not found' });
        if (target.status !== 'pending_approval') {
            return res.status(400).json({ error: `Cannot approve — current status is "${target.status}"` });
        }

        const updated = await prisma.users.update({ where: { id: target.id }, data: { status: 'active' } });
        res.json({ id: updated.id, status: updated.status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /admin/:userId/reject
router.post('/:userId/reject', async (req, res) => {
    try {
        const target = await prisma.users.findUnique({ where: { id: parseInt(req.params.userId) } });
        if (!target || target.role !== 'admin') return res.status(404).json({ error: 'Application not found' });
        if (target.status !== 'pending_approval') {
            return res.status(400).json({ error: `Cannot reject — current status is "${target.status}"` });
        }

        const updated = await prisma.users.update({ where: { id: target.id }, data: { status: 'rejected' } });
        res.json({ id: updated.id, status: updated.status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
