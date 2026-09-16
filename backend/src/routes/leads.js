const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { protect, requireActive, requireChannel } = require('../middleware/auth');
const { sendTextMessage } = require('../services/metaGraph');
const { suggestReply } = require('../services/aiClassifier');

const REPLY_WINDOW_MS = 24 * 60 * 60 * 1000;

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
        const id = parseInt(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid lead id' });

        const lead = await prisma.leads.findFirst({
            where: { id, business_id: req.user.business_id },
            include: {
                messages: true,
                notes: { include: { users: { select: { id: true, name: true, email: true } } } }
            }
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
            where: { lead_id: lead.id },
            include: { users: { select: { id: true, name: true, email: true } } },
            orderBy: { created_at: 'desc' }
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/:id/suggest-reply', async (req, res) => {
    try {
        const lead = await prisma.leads.findFirst({
            where: {
                id: parseInt(req.params.id),
                business_id: req.user.business_id
            },
            include: {
                messages: {
                    orderBy: { received_at: 'asc' }
                }
            }
        });

        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        const business = await prisma.businesses.findUnique({
            where: { id: req.user.business_id }
        });

        const draft = await suggestReply({
            businessName: business?.name || 'the business',
            messages: lead.messages,
            intent: lead.intent
        });

        res.json({ draft });
    } catch (error) {
        console.error('Reply suggestion error:', error.message);
        res.status(502).json({
            error: 'Could not generate a suggestion right now'
        });
    }
});

router.post('/:id/reply', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        const lead = await prisma.leads.findFirst({
            where: { id: parseInt(req.params.id), business_id: req.user.business_id },
        });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        if (!['messenger', 'instagram'].includes(lead.channel)) {
            return res.status(400).json({
                error: 'Replies are only supported for Messenger and Instagram right now'
            });
        }

        const lastInbound = await prisma.messages.findFirst({
            where: { lead_id: lead.id, direction: 'inbound' },
            orderBy: { received_at: 'desc' },
        });
        if (!lastInbound || Date.now() - new Date(lastInbound.received_at).getTime() > REPLY_WINDOW_MS) {
            return res.status(409).json({
                error: 'Outside the 24-hour messaging window — the customer needs to message you again first',
                code: 'WINDOW_CLOSED',
            });
        }

        const channel = await prisma.business_channels.findFirst({
            where: { business_id: req.user.business_id, platform: lead.channel },
        });
        if (!channel) {
            return res.status(400).json({ error: `${lead.channel} channel not connected` });
        }

        const recipientId = lead.platform_thread_id.split(':')[1];
        const sendResult = await sendTextMessage(
            channel.access_token,
            recipientId,
            content.trim()
        );
        const platformMessageId = sendResult.message_id || null;

        let message;
        if (platformMessageId) {
            message = await prisma.messages.findUnique({
                where: { platform_message_id: platformMessageId },
            });

            if (!message) {
                message = await prisma.messages.create({
                    data: {
                        lead_id: lead.id,
                        body: content.trim(),
                        direction: 'outbound',
                        platform_message_id: platformMessageId,
                    },
                });
            }
        } else {
            message = await prisma.messages.create({
                data: {
                    lead_id: lead.id,
                    body: content.trim(),
                    direction: 'outbound',
                },
            });
        }

        if (lead.status === 'new') {
            await prisma.leads.update({ where: { id: lead.id }, data: { status: 'contacted' } });
        }

        res.status(201).json(message);
    } catch (error) {
        res.status(502).json({ error: error.message });
    }
});

module.exports = router;