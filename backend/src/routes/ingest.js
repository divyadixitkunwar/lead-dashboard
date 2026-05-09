const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { tagIntent } = require('../services/intentTagger');
const { classifyMessageType } = require('../services/messageClassifier');
// POST /ingest — OpenClaw webhook
router.post('/', async (req, res) => {
    const payload = req.body;

    try {
        const { platform, thread_id, contact_name, phone, message } = payload;

        // Validate required fields
        if (!platform || !thread_id || !contact_name || !message) {
            throw new Error('Missing required fields: platform, thread_id, contact_name, message');
        }

        // Check if lead with this thread already exists
        let lead = await prisma.leads.findFirst({
            where: { platform_thread_id: thread_id }
        });

        // If no existing lead, create one
        if (!lead) {

            // Duplicate detection — check for same phone number
            let possibleDuplicate = false;
            if (phone) {
                const existing = await prisma.leads.findFirst({
                    where: { phone }
                });
                if (existing) possibleDuplicate = true;
            }
            const message_type = classifyMessageType(message);
            const intent = message_type === 'customer_lead' ? tagIntent(message) : 'unclassified';

            lead = await prisma.leads.create({
                data: {
                    contact_name,
                    phone: phone || null,
                    channel: platform,
                    platform_thread_id: thread_id,
                    possible_duplicate: possibleDuplicate,
                    intent,
                    message_type
                }
            });
        }

        // Add the message to the lead
        await prisma.messages.create({
            data: {
                lead_id: lead.id,
                body: message,
                direction: 'inbound'
            }
        });

        res.status(200).json({ success: true, lead_id: lead.id });

    } catch (error) {

        // Log failed ingestion
        await prisma.ingest_logs.create({
            data: {
                payload: JSON.stringify(payload),
                error: error.message
            }
        }).catch(() => { }); // silently ignore if logging itself fails

        res.status(400).json({ error: error.message });
    }
});

module.exports = router;