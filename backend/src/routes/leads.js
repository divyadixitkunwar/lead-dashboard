const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { protect } = require('../middleware/auth');
// GET /leads — fetch all leads
router.get('/', protect, async (req, res) => {
    try {
        const { status, channel, intent, message_type } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (channel) filters.channel = channel;
        if (intent) filters.intent = intent;
        if (message_type) filters.message_type = message_type;

        const leads = await prisma.leads.findMany({
            where: filters,
            orderBy: { created_at: 'desc' }
        });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /leads/:id — fetch one lead with messages and notes
router.get('/:id', protect, async (req, res) => {
    try {
        const lead = await prisma.leads.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                messages: true,
                notes: {
                    include: { users: true }
                }
            }
        });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /leads — create a new lead
router.post('/', protect, async (req, res) => {
    try {
        const { contact_name, phone, channel, message_type, intent, platform_thread_id } = req.body;
        const lead = await prisma.leads.create({
            data: { contact_name, phone, channel, message_type, intent, platform_thread_id }
        });
        res.status(201).json(lead);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH /leads/:id — update a lead
router.patch('/:id', protect, async (req, res) => {
    try {
        const lead = await prisma.leads.update({
            where: { id: parseInt(req.params.id) },
            data: req.body
        });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /leads/:id/notes — add a note to a lead
router.post('/:id/notes', protect, async (req, res) => {
    try {
        const { content, written_by } = req.body;
        const note = await prisma.notes.create({
            data: {
                lead_id: parseInt(req.params.id),
                content,
                written_by
            }
        });
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /leads/:id/notes — list notes for a lead
router.get('/:id/notes', protect, async (req, res) => {
    try {
        const notes = await prisma.notes.findMany({
            where: { lead_id: parseInt(req.params.id) },
            include: { users: true },
            orderBy: { created_at: 'desc' }
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;