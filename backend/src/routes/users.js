const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const { protect, adminOnly } = require('../middleware/auth');

// GET /users — admin only
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const users = await prisma.users.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /users — admin only
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const password_hash = await bcrypt.hash(password, 12);
        const user = await prisma.users.create({
            data: { name, email, password_hash, role }
        });
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH /users/:id — admin only
router.patch('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const user = await prisma.users.update({
            where: { id: parseInt(req.params.id) },
            data: { name, email, role }
        });
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /users/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        await prisma.users.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;