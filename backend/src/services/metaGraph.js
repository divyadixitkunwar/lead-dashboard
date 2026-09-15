

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

async function getLongLivedToken(shortLivedToken) {
    const url = `${GRAPH_BASE}/oauth/access_token` +
        `?grant_type=fb_exchange_token` +
        `&client_id=${process.env.META_APP_ID}` +
        `&client_secret=${process.env.META_APP_SECRET}` +
        `&fb_exchange_token=${shortLivedToken}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || 'Failed to get long-lived token');
    return data.access_token;
}


async function getManagedPages(userAccessToken) {
    const personalUrl = `${GRAPH_BASE}/me/accounts?access_token=${userAccessToken}`;
    const personalResp = await fetch(personalUrl);
    const personalData = await personalResp.json();
    if (!personalResp.ok) throw new Error(personalData.error?.message || 'Failed to fetch Pages');
    const personalPages = personalData.data || [];


    const businessPages = [];
    try {
        const bizUrl = `${GRAPH_BASE}/me/businesses?access_token=${userAccessToken}`;
        const bizResp = await fetch(bizUrl);
        const bizData = await bizResp.json();
        const businesses = bizResp.ok ? (bizData.data || []) : [];

        for (const business of businesses) {
            const ownedUrl = `${GRAPH_BASE}/${business.id}/owned_pages?access_token=${userAccessToken}`;
            const ownedResp = await fetch(ownedUrl);
            const ownedData = await ownedResp.json();
            if (!ownedResp.ok) continue;

            for (const page of (ownedData.data || [])) {

                const tokenUrl = `${GRAPH_BASE}/${page.id}?fields=name,access_token&access_token=${userAccessToken}`;
                const tokenResp = await fetch(tokenUrl);
                const tokenData = await tokenResp.json();
                if (tokenResp.ok && tokenData.access_token) {
                    businessPages.push({ id: page.id, name: tokenData.name || page.name, access_token: tokenData.access_token });
                }
            }
        }
    } catch (err) {
        console.error('Business-owned Pages lookup failed:', err.message);
    }

    const seen = new Set();
    const merged = [];
    for (const page of [...personalPages, ...businessPages]) {
        if (seen.has(page.id)) continue;
        seen.add(page.id);
        merged.push(page);
    }
    return merged;
}


async function getLinkedInstagramAccount(pageId, pageAccessToken) {
    try {
        const url = `${GRAPH_BASE}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (resp.ok && data.instagram_business_account) {
            const igId = data.instagram_business_account.id;
            const igUrl = `${GRAPH_BASE}/${igId}?fields=username&access_token=${pageAccessToken}`;
            const igResp = await fetch(igUrl);
            const igData = await igResp.json();
            return { id: igId, username: igResp.ok ? igData.username : null };
        }


        const bizLookupUrl = `${GRAPH_BASE}/${pageId}?fields=business&access_token=${pageAccessToken}`;
        const bizLookupResp = await fetch(bizLookupUrl);
        const bizLookupData = await bizLookupResp.json();
        const businessId = bizLookupData.business?.id;
        if (!businessId) return null;

        const ownedUrl = `${GRAPH_BASE}/${businessId}/owned_instagram_assets?access_token=${pageAccessToken}`;
        const ownedResp = await fetch(ownedUrl);
        const ownedData = await ownedResp.json();
        if (!ownedResp.ok || !(ownedData.data || []).length) return null;

        const asset = ownedData.data[0];
        return { id: asset.ig_user_id, username: asset.ig_username };
    } catch (err) {
        console.error('Instagram lookup failed:', err.message);
        return null;
    }
}


async function subscribePageWebhook(pageId, pageAccessToken) {
    const url = `${GRAPH_BASE}/${pageId}/subscribed_apps` +
        `?subscribed_fields=messages,messaging_postbacks` +
        `&access_token=${pageAccessToken}`;
    const resp = await fetch(url, { method: 'POST' });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || 'Failed to subscribe Page webhook');
    return data;
}

async function sendTextMessage(pageAccessToken, recipientId, text) {
    const url = `${GRAPH_BASE}/me/messages?access_token=${pageAccessToken}`;
    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text },
        }),
    });
    const data = await resp.json();
    if (!resp.ok) {
        const err = new Error(data.error?.message || 'Failed to send message');
        err.metaError = data.error;
        throw err;
    }
    return data; // { recipient_id, message_id }
}

module.exports = {
    getLongLivedToken,
    getManagedPages,
    getLinkedInstagramAccount,
    subscribePageWebhook,
    sendTextMessage,
};
