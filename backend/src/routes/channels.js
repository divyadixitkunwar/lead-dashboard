const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { protect, requireActive } = require('../middleware/auth');
const {
    exchangeCodeForToken,
    getLongLivedToken,
    getManagedPages,
    getLinkedInstagramAccount,
    subscribePageWebhook,
} = require('../services/metaGraph');

// Same pattern as leads.js/users.js — every route here needs a real,
// currently-active account, not just a valid token.
router.use(protect, requireActive);

// List channels already connected for this business — used by the
// Connect Channels page to show "already connected" state on load.
router.get('/', async (req, res) => {
    try {
        const channels = await prisma.business_channels.findMany({
            where: { business_id: req.user.business_id },
            select: { id: true, platform: true, external_id: true, display_name: true, created_at: true },
        });
        res.json(channels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Step 1 of Facebook Login for Business. The frontend runs FB.login()
// itself (client-side, via the JS SDK) and hands us the resulting `code`.
// We exchange it for a token and return the list of Pages this person
// manages so the frontend can show a picker (or auto-select if there's
// only one). Nothing is saved to the database yet — this is a read-only
// lookup, safe to call as many times as the person retries the popup.
router.post('/facebook/callback', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ error: 'Missing code' });

        const shortLivedToken = await exchangeCodeForToken(code);
        const longLivedToken = await getLongLivedToken(shortLivedToken);
        const pages = await getManagedPages(longLivedToken);

        const enrichedPages = await Promise.all(
            pages.map(async (page) => ({
                id: page.id,
                name: page.name,
                access_token: page.access_token,
                instagram: await getLinkedInstagramAccount(page.id, page.access_token),
            }))
        );

        res.json({ pages: enrichedPages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Step 2: the frontend sends back the exact page object the person picked
// — id, name, access_token, and optionally a linked instagram { id,
// username } — all of which came straight from the callback response
// above, so nothing needs to be looked up again here except a safety
// check that this Page/IG account isn't already claimed by someone else.
router.post('/facebook/finish', async (req, res) => {
    try {
        const { page } = req.body;
        if (!page?.id || !page?.access_token) {
            return res.status(400).json({ error: 'Missing page data' });
        }

        const existingMessenger = await prisma.business_channels.findUnique({
            where: { platform_external_id: { platform: 'messenger', external_id: page.id } },
        });
        if (existingMessenger && existingMessenger.business_id !== req.user.business_id) {
            return res.status(409).json({ error: 'This Page is already connected to a different business' });
        }

        if (page.instagram?.id) {
            const existingInstagram = await prisma.business_channels.findUnique({
                where: { platform_external_id: { platform: 'instagram', external_id: page.instagram.id } },
            });
            if (existingInstagram && existingInstagram.business_id !== req.user.business_id) {
                return res.status(409).json({ error: 'This Instagram account is already connected to a different business' });
            }
        }

        await subscribePageWebhook(page.id, page.access_token);

        const messengerChannel = await prisma.business_channels.upsert({
            where: { platform_external_id: { platform: 'messenger', external_id: page.id } },
            update: { display_name: page.name, access_token: page.access_token },
            create: {
                business_id: req.user.business_id,
                platform: 'messenger',
                external_id: page.id,
                display_name: page.name,
                access_token: page.access_token,
            },
        });

        let instagramChannel = null;
        if (page.instagram?.id) {
            instagramChannel = await prisma.business_channels.upsert({
                where: { platform_external_id: { platform: 'instagram', external_id: page.instagram.id } },
                update: { display_name: page.instagram.username, access_token: page.access_token },
                create: {
                    business_id: req.user.business_id,
                    platform: 'instagram',
                    external_id: page.instagram.id,
                    display_name: page.instagram.username,
                    access_token: page.access_token,
                },
            });
        }

        res.status(201).json({ messenger: messengerChannel, instagram: instagramChannel });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Instagram-only recheck — for when the Page didn't have Instagram linked
// at first connect (very common; most small businesses never actually did
// this) and they've since gone and linked it in their Facebook Page
// settings. Re-uses the already-stored Page access token instead of making
// them redo the entire Facebook popup login just to check again.
router.post('/instagram/recheck', async (req, res) => {
    try {
        const messengerChannel = await prisma.business_channels.findFirst({
            where: { business_id: req.user.business_id, platform: 'messenger' },
        });
        if (!messengerChannel) {
            return res.status(400).json({ error: 'Connect a Facebook Page first.' });
        }

        const instagram = await getLinkedInstagramAccount(messengerChannel.external_id, messengerChannel.access_token);
        if (!instagram) {
            return res.json({ linked: false });
        }

        const existingInstagram = await prisma.business_channels.findUnique({
            where: { platform_external_id: { platform: 'instagram', external_id: instagram.id } },
        });
        if (existingInstagram && existingInstagram.business_id !== req.user.business_id) {
            return res.status(409).json({ error: 'This Instagram account is already connected to a different business' });
        }

        const instagramChannel = await prisma.business_channels.upsert({
            where: { platform_external_id: { platform: 'instagram', external_id: instagram.id } },
            update: { display_name: instagram.username },
            create: {
                business_id: req.user.business_id,
                platform: 'instagram',
                external_id: instagram.id,
                display_name: instagram.username,
                access_token: messengerChannel.access_token,
            },
        });

        res.json({ linked: true, instagram: instagramChannel });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Disconnect — removes the row. Doesn't currently unsubscribe the webhook
// on Meta's side first; fine for a college project, worth revisiting
// before anything real depends on this.
router.delete('/:id', async (req, res) => {
    try {
        const existing = await prisma.business_channels.findFirst({
            where: { id: parseInt(req.params.id), business_id: req.user.business_id },
        });
        if (!existing) return res.status(404).json({ error: 'Channel not found' });

        await prisma.business_channels.delete({ where: { id: existing.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
