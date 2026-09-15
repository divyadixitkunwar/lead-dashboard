const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { protect, requireActive, requireChannel } = require('../middleware/auth');

router.use(protect, requireActive, requireChannel);

router.get('/summary', async (req, res) => {
    try {
        const business_id = req.user.business_id;

        const [byStatus, byChannel, byIntent, byType, total, duplicates] = await Promise.all([
            prisma.leads.groupBy({
                by: ['status'],
                where: { business_id },
                _count: true
            }),
            prisma.leads.groupBy({
                by: ['channel'],
                where: { business_id },
                _count: true
            }),
            prisma.leads.groupBy({
                by: ['intent'],
                where: { business_id },
                _count: true
            }),
            prisma.leads.groupBy({
                by: ['message_type'],
                where: { business_id },
                _count: true
            }),
            prisma.leads.count({
                where: { business_id }
            }),
            prisma.leads.count({
                where: {
                    business_id,
                    possible_duplicate: true
                }
            })
        ]);

        const leadsRaw = await prisma.leads.findMany({
            where: { business_id },
            select: { created_at: true }
        });

        const byDay = {};

        for (const lead of leadsRaw) {
            const day = lead.created_at.toISOString().slice(0, 10);
            byDay[day] = (byDay[day] || 0) + 1;
        }

        res.json({
            total,
            duplicates,
            byStatus,
            byChannel,
            byIntent,
            byType,
            byDay
        });
    } catch (error) {
        console.error('Analytics summary error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.get('/response-time', async (req, res) => {
    try {
        const business_id = req.user.business_id;

        const leads = await prisma.leads.findMany({
            where: { business_id },
            select: {
                id: true,
                created_at: true,
                messages: {
                    where: { direction: 'outbound' },
                    orderBy: { received_at: 'asc' },
                    take: 1
                }
            }
        });

        const diffs = leads
            .filter(lead => lead.messages.length > 0)
            .map(lead =>
                new Date(lead.messages[0].received_at) -
                new Date(lead.created_at)
            )
            .filter(diff => Number.isFinite(diff) && diff >= 0);

        const avg_response_ms = diffs.length
            ? diffs.reduce((a, b) => a + b, 0) / diffs.length
            : null;

        res.json({
            avg_response_ms,
            sample_size: diffs.length
        });
    } catch (error) {
        console.error('Analytics response-time error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
