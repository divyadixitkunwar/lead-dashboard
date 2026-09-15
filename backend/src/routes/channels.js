const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { protect, requireActive } = require('../middleware/auth');
const {
    getLongLivedToken,
    getManagedPages,
    getLinkedInstagramAccount,
    subscribePageWebhook,
} = require('../services/metaGraph');

router.use(protect, requireActive);


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


router.post('/facebook/callback', async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) return res.status(400).json({ error: 'Missing accessToken' });

        const longLivedToken = await getLongLivedToken(accessToken);
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
