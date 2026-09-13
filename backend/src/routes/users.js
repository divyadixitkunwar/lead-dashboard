const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const { protect, adminOnly, requireActive, requireChannel } = require('../middleware/auth');

// Same reasoning as leads.js — a valid token no longer implies "approved,"
// and being approved no longer implies "has something to manage."
router.use(protect, requireActive, requireChannel);

router.get('/', adminOnly, async (req, res) => {
    try {
        const users = await prisma.users.findMany({
            where: { business_id: req.user.business_id },
            select: { id: true, name: true, email: true, role: true, created_at: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', adminOnly, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const password_hash = await bcrypt.hash(password, 12);
        const user = await prisma.users.create({
            data: { business_id: req.user.business_id, name, email, password_hash, role: role || 'staff' }
        });
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        if (error.code === 'P2002') return res.status(409).json({ error: 'Email already in use' });
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id', adminOnly, async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const target = await prisma.users.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!target || target.business_id !== req.user.business_id) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = await prisma.users.update({ where: { id: target.id }, data: { name, email, role } });
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', adminOnly, async (req, res) => {
    try {
        const target = await prisma.users.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!target || target.business_id !== req.user.business_id) {
            return res.status(404).json({ error: 'User not found' });
        }
        await prisma.users.delete({ where: { id: target.id } });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;