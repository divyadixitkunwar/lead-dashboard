const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { tagIntent } = require('../services/intentTagger');
const { classifyMessageType } = require('../services/messageClassifier');

// ---- Verification handshake (shared across all 3 products) ----
router.get('/', (req, res) => {
    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified');
        return res.status(200).send(challenge);
    }
    console.log('Webhook verification failed', { mode, token });
    return res.sendStatus(403);
});

// look up the full channel row (business_id + access_token) for this platform/external_id
async function getChannel(platform, external_id) {
    return prisma.business_channels.findUnique({
        where: { platform_external_id: { platform, external_id } }
    });
}

// Graph API name lookup — used for Messenger/Instagram only.
// Falls back to null on any failure; caller decides the fallback display value.
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

// shared lead/message creation, business-scoped
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

        const message_type = classifyMessageType(message);
        const intent = message_type === 'customer_lead' ? tagIntent(message) : 'unclassified';

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

// ---- WhatsApp: object === 'whatsapp_business_account' ----
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
                    console.log(`[whatsapp] ${names[phone] || phone}: ${message}`);
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
                for (const s of value.statuses) {
                    console.log(`[whatsapp] status: ${s.id} -> ${s.status}`);
                }
            }
        }
    }
}

// ---- Messenger: object === 'page' ----
async function handleMessenger(payload) {
    for (const entry of payload.entry || []) {
        const external_id = entry.id; // PAGE_ID
        const channel = await getChannel('messenger', external_id);

        if (!channel) {
            await logUnrouted(entry, `No business mapped to messenger page_id ${external_id}`);
            continue;
        }

        for (const event of entry.messaging || []) {
            if (!event.message || event.message.is_echo) continue; // skip echoes/postbacks/deliveries for now

            const psid = event.sender?.id;
            const message = event.message.text || '[Non-text message]';
            console.log(`[messenger] ${psid}: ${message}`);

            const name = await fetchProfileName(psid, channel.access_token, 'name');

            await saveInboundMessage({
                business_id: channel.business_id,
                platform: 'messenger',
                contact_name: name || psid, // fallback to raw PSID if lookup fails/returns nothing
                phone: null,
                thread_id: `messenger:${psid}`,
                message
            });
        }
    }
}

// ---- Instagram: object === 'instagram' ----
async function handleInstagram(payload) {
    for (const entry of payload.entry || []) {
        const external_id = entry.id; // IG business account ID
        const channel = await getChannel('instagram', external_id);

        if (!channel) {
            await logUnrouted(entry, `No business mapped to instagram ig_id ${external_id}`);
            continue;
        }

        for (const event of entry.messaging || []) {
            if (!event.message || event.message.is_echo) continue;

            const igsid = event.sender?.id;
            const message = event.message.text || '[Non-text message]';
            console.log(`[instagram] ${igsid}: ${message}`);

            const name = await fetchProfileName(igsid, channel.access_token, 'name,username');

            await saveInboundMessage({
                business_id: channel.business_id,
                platform: 'instagram',
                contact_name: name || igsid, // fallback to raw IGSID if lookup fails/returns nothing
                phone: null,
                thread_id: `instagram:${igsid}`,
                message
            });
        }
    }
}

// ---- POST entrypoint: route by payload.object ----
router.post('/', async (req, res) => {
    const payload = req.body;
    console.log('--- RAW PAYLOAD ---', JSON.stringify(payload));

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