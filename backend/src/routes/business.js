const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { protect, requireActive, adminOnly } = require('../middleware/auth');


router.use(protect, requireActive);

router.get('/', async (req, res) => {
    try {
        const business = await prisma.businesses.findUnique({
            where: { id: req.user.business_id },
            select: { id: true, name: true, created_at: true },
        });
        if (!business) return res.status(404).json({ error: 'Business not found' });
        res.json(business);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.patch('/', adminOnly, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Business name is required' });
        }
        const business = await prisma.businesses.update({
            where: { id: req.user.business_id },
            data: { name: name.trim() },
        });
        res.json({ id: business.id, name: business.name, created_at: business.created_at });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
