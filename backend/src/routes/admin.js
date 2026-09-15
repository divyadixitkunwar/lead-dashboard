const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { protect, requireSuperadmin } = require('../middleware/auth');


router.use(protect, requireSuperadmin);

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
