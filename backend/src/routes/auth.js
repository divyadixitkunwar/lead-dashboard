const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const { protect } = require('../middleware/auth');

// POST /auth/register — creates a new business + its first admin user
// Not linked from the frontend — called manually (e.g. via Postman) when onboarding a business.
router.post('/register', async (req, res) => {
    try {
        const { business_name, name, email, password } = req.body;

        if (!business_name || !name || !email || !password) {
            return res.status(400).json({ error: 'business_name, name, email, and password are required' });
        }

        const password_hash = await bcrypt.hash(password, 12);

        const result = await prisma.$transaction(async (tx) => {
            const business = await tx.businesses.create({ data: { name: business_name } });
            const user = await tx.users.create({
                data: { business_id: business.id, name, email, password_hash, role: 'admin' }
            });
            return { business, user };
        });

        res.status(201).json({
            business: { id: result.business.id, name: result.business.name },
            user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role }
        });
    } catch (error) {
        if (error.code === 'P2002') return res.status(409).json({ error: 'Email already in use' });
        res.status(500).json({ error: error.message });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, business_id: user.business_id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, business_id: user.business_id }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/logout', protect, (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;