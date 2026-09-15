const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { protect, requireActive, requireChannel } = require('../middleware/auth');

router.use(protect, requireActive, requireChannel);

router.get('/', async (req, res) => {
    try {
        const { status, channel, intent, message_type } = req.query;
        const filters = { business_id: req.user.business_id };
        if (status) filters.status = status;
        if (channel) filters.channel = channel;
        if (intent) filters.intent = intent;
        if (message_type) filters.message_type = message_type;

        const leads = await prisma.leads.findMany({ where: filters, orderBy: { created_at: 'desc' } });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const lead = await prisma.leads.findFirst({
            where: { id: parseInt(req.params.id), business_id: req.user.business_id },
            include: { messages: true, notes: { include: { users: true } } }
        });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { contact_name, phone, channel, message_type, intent, platform_thread_id } = req.body;
        const lead = await prisma.leads.create({
            data: { business_id: req.user.business_id, contact_name, phone, channel, message_type, intent, platform_thread_id }
        });
        res.status(201).json(lead);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const existing = await prisma.leads.findFirst({
            where: { id: parseInt(req.params.id), business_id: req.user.business_id }
        });
        if (!existing) return res.status(404).json({ error: 'Lead not found' });

        const { business_id, ...safeUpdates } = req.body;

        if (safeUpdates.assigned_to) {
            const targetUser = await prisma.users.findUnique({ where: { id: safeUpdates.assigned_to } });
            if (!targetUser || targetUser.business_id !== req.user.business_id) {
                return res.status(400).json({ error: 'Cannot assign lead to a user outside this business' });
            }
        }

        const lead = await prisma.leads.update({ where: { id: existing.id }, data: safeUpdates });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:id/notes', async (req, res) => {
    try {
        const lead = await prisma.leads.findFirst({
            where: { id: parseInt(req.params.id), business_id: req.user.business_id }
        });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        const { content } = req.body;
        const note = await prisma.notes.create({
            data: { lead_id: lead.id, content, written_by: req.user.id }
        });
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/notes', async (req, res) => {
    try {
        const lead = await prisma.leads.findFirst({
            where: { id: parseInt(req.params.id), business_id: req.user.business_id }
        });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        const notes = await prisma.notes.findMany({
            where: { lead_id: lead.id }, include: { users: true }, orderBy: { created_at: 'desc' }
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;