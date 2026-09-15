const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const prisma = require('../prismaClient');
const { tagIntent } = require('../services/intentTagger');
const { classifyMessageType } = require('../services/messageClassifier');
const { classifyWithFallback } = require('../services/aiClassifier');

router.get('/', (req, res) => {
    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }

    console.log('Webhook verification failed', { mode });
    return res.sendStatus(403);
});

async function getChannel(platform, external_id) {
    return prisma.business_channels.findUnique({
        where: { platform_external_id: { platform, external_id } }
    });
}


async function fetchProfileName(userId, accessToken, fields) {
    if (!accessToken) return null;
    try {
        const url = `https://graph.facebook.com/${userId}?fields=${fields}&access_token=${accessToken}`;
        const resp = await fetch(url);
        if (!resp.ok) return null;
        const data = await resp.json();
        return data.name || data.username || null;
    } catch (err) {
        console.error('Profile lookup failed:', err.message);
        return null;
    }
}

async function saveEchoMessage({ business_id, platform, contact_name, thread_id, message, platform_message_id, received_at }) {
    if (!platform_message_id) return;

    const existing = await prisma.messages.findUnique({
        where: { platform_message_id }
    });

    if (existing) return;

    let lead = await prisma.leads.findFirst({
        where: { business_id, platform_thread_id: thread_id }
    });

    if (!lead) {
        lead = await prisma.leads.create({
            data: {
                business_id,
                contact_name,
                phone: null,
                channel: platform,
                platform_thread_id: thread_id,
                possible_duplicate: false,
                intent: 'unclassified',
                message_type: 'customer_lead'
            }
        });
    }

    try {
        await prisma.messages.create({
            data: {
                lead_id: lead.id,
                body: message,
                direction: 'outbound',
                platform_message_id,
                ...(received_at ? { received_at: new Date(received_at) } : {})
            }
        });
    } catch (error) {
        if (error.code !== 'P2002') throw error;
    }
}

async function saveInboundMessage({ business_id, platform, contact_name, phone, thread_id, message }) {
    let lead = await prisma.leads.findFirst({
        where: { business_id, platform_thread_id: thread_id }
    });

    if (!lead) {
        let possibleDuplicate = false;
        if (phone) {
            const existing = await prisma.leads.findFirst({ where: { business_id, phone } });
            if (existing) possibleDuplicate = true;
        }

        const classification = await classifyWithFallback(message);
        const message_type = classification.message_type;
        const intent = classification.intent;

        lead = await prisma.leads.create({
            data: {
                business_id,
                contact_name,
                phone: phone || null,
                channel: platform,
                platform_thread_id: thread_id,
                possible_duplicate: possibleDuplicate,
                intent,
                message_type
            }
        });
    } else if (
        contact_name &&
        contact_name !== lead.contact_name &&
        !/^\d+$/.test(contact_name)
    ) {
        await prisma.leads.update({
            where: { id: lead.id },
            data: { contact_name }
        });
    }

    await prisma.messages.create({
        data: { lead_id: lead.id, body: message, direction: 'inbound' }
    });
}

async function logUnrouted(payload, reason) {
    await prisma.ingest_logs.create({
        data: { payload: JSON.stringify(payload), error: reason }
    }).catch(() => { });
}

async function handleWhatsApp(payload) {
    for (const entry of payload.entry || []) {
        for (const change of entry.changes || []) {
            const value = change.value || {};
            const external_id = value.metadata?.phone_number_id;
            const channel = external_id ? await getChannel('whatsapp', external_id) : null;

            if (!channel) {
                await logUnrouted(value, `No business mapped to whatsapp phone_number_id ${external_id}`);
                continue;
            }

            if (Array.isArray(value.messages)) {
                const names = {};
                (value.contacts || []).forEach(c => { names[c.wa_id] = c.profile?.name || 'Unknown'; });

                for (const msg of value.messages) {
                    const phone = msg.from;
                    const message = msg.type === 'text' ? msg.text?.body : `[Unsupported type: ${msg.type}]`;
                    await saveInboundMessage({
                        business_id: channel.business_id,
                        platform: 'whatsapp',
                        contact_name: names[phone] || 'Unknown',
                        phone,
                        thread_id: `whatsapp:${phone}`,
                        message
                    });
                }
            }

            if (Array.isArray(value.statuses)) {

            }
        }
    }
}

async function handleMessenger(payload) {
    for (const entry of payload.entry || []) {
        const external_id = entry.id;
        const channel = await getChannel('messenger', external_id);

        if (!channel) {
            await logUnrouted(entry, `No business mapped to messenger page_id ${external_id}`);
            continue;
        }

        for (const event of entry.messaging || []) {
            console.log('MESSENGER EVENT FIELDS:', JSON.stringify({
                sender: event.sender || null,
                recipient: event.recipient || null,
                timestamp: event.timestamp || null,
                message_keys: event.message ? Object.keys(event.message) : [],
                message_mid: event.message?.mid || null,
                message_echo: event.message?.is_echo || false
            }));

            if (!event.message) continue;

            if (event.message.is_echo) {
                const customerId = event.recipient?.id;
                const message = event.message.text || '[Non-text message]';

                if (customerId) {
                    const name = await fetchProfileName(customerId, channel.access_token, 'name');

                    await saveEchoMessage({
                        business_id: channel.business_id,
                        platform: 'messenger',
                        contact_name: name || customerId,
                        thread_id: `messenger:${customerId}`,
                        message,
                        platform_message_id: event.message.mid,
                        received_at: event.timestamp ? new Date(event.timestamp).toISOString() : null
                    });
                }

                continue;
            }

            const psid = event.sender?.id;
            const message = event.message.text || '[Non-text message]';

            const name = await fetchProfileName(psid, channel.access_token, 'name');

            await saveInboundMessage({
                business_id: channel.business_id,
                platform: 'messenger',
                contact_name: name || psid,
                phone: null,
                thread_id: `messenger:${psid}`,
                message
            });
        }
    }
}

async function handleInstagram(payload) {
    for (const entry of payload.entry || []) {
        const external_id = entry.id;
        const channel = await getChannel('instagram', external_id);

        if (!channel) {
            await logUnrouted(entry, `No business mapped to instagram ig_id ${external_id}`);
            continue;
        }

        for (const event of entry.messaging || []) {
            if (!event.message) continue;

            if (event.message.is_echo) {
                const customerId = event.recipient?.id;
                const message = event.message.text || '[Non-text message]';

                if (customerId) {
                    const name = await fetchProfileName(customerId, channel.access_token, 'name,username');

                    await saveEchoMessage({
                        business_id: channel.business_id,
                        platform: 'instagram',
                        contact_name: name || customerId,
                        thread_id: `instagram:${customerId}`,
                        message,
                        platform_message_id: event.message.mid,
                        received_at: event.timestamp ? new Date(event.timestamp).toISOString() : null
                    });
                }

                continue;
            }

            const igsid = event.sender?.id;
            const message = event.message.text || '[Non-text message]';

            const name = await fetchProfileName(igsid, channel.access_token, 'name,username');

            await saveInboundMessage({
                business_id: channel.business_id,
                platform: 'instagram',
                contact_name: name || igsid,
                phone: null,
                thread_id: `instagram:${igsid}`,
                message
            });
        }
    }
}

function isValidMetaSignature(req) {
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) return false;

    const signatureHeader = req.get('x-hub-signature-256');
    if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;
    if (!req.rawBody) return false;

    const expected = crypto
        .createHmac('sha256', appSecret)
        .update(req.rawBody)
        .digest('hex');
    const provided = signatureHeader.slice('sha256='.length);

    const expectedBuf = Buffer.from(expected, 'hex');
    const providedBuf = Buffer.from(provided, 'hex');
    if (expectedBuf.length !== providedBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

router.post('/', async (req, res) => {
    if (!isValidMetaSignature(req)) {
        return res.status(401).json({ error: 'Invalid or missing webhook signature.' });
    }

    const payload = req.body;

    try {
        if (payload.object === 'whatsapp_business_account') {
            await handleWhatsApp(payload);
        } else if (payload.object === 'page') {
            await handleMessenger(payload);
        } else if (payload.object === 'instagram') {
            await handleInstagram(payload);
        } else {
            await logUnrouted(payload, `Unknown object type: ${payload.object}`);
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Ingest error:', error.message);
        await logUnrouted(payload, error.message);
        res.status(200).json({ success: false, error: error.message });
    }
});

module.exports = router;