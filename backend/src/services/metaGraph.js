// Thin wrapper around the handful of Graph API calls needed to connect a
// Facebook Page (and its linked Instagram account) via Facebook Login for
// Business. Kept separate from the route file so routes/channels.js stays
// focused on request/response handling, matching how intentTagger.js and
// messageClassifier.js are split out for ingest.js.

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

// Step 1: swap the short-lived `code` the frontend got from FB.login for a
// short-lived user access token.
async function exchangeCodeForToken(code) {
    const url = `${GRAPH_BASE}/oauth/access_token` +
        `?client_id=${process.env.META_APP_ID}` +
        `&client_secret=${process.env.META_APP_SECRET}` +
        `&code=${code}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || 'Failed to exchange code for token');
    return data.access_token;
}

// Step 2: trade the short-lived user token for a long-lived one (~60 days).
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

// Step 3: list every Page this person manages. Each Page comes with its
// own access token — these are derived from the long-lived user token and
// don't expire on their own timer the way the user token does.
async function getManagedPages(userAccessToken) {
    const url = `${GRAPH_BASE}/me/accounts?access_token=${userAccessToken}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || 'Failed to fetch Pages');
    return data.data || [];
}

// Step 4: check whether a given Page has a linked Instagram professional
// account. Returns null if there isn't one, or if the lookup fails for any
// reason — callers treat "no Instagram" as a normal, expected outcome.
async function getLinkedInstagramAccount(pageId, pageAccessToken) {
    try {
        const url = `${GRAPH_BASE}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (!resp.ok || !data.instagram_business_account) return null;

        const igId = data.instagram_business_account.id;
        const igUrl = `${GRAPH_BASE}/${igId}?fields=username&access_token=${pageAccessToken}`;
        const igResp = await fetch(igUrl);
        const igData = await igResp.json();
        return { id: igId, username: igResp.ok ? igData.username : null };
    } catch (err) {
        console.error('Instagram lookup failed:', err.message);
        return null;
    }
}

// Step 5: turn the webhook on for this Page. Instagram messaging rides on
// the same subscription once the Page has a linked IG account, so this is
// the only subscribe call needed either way.
async function subscribePageWebhook(pageId, pageAccessToken) {
    const url = `${GRAPH_BASE}/${pageId}/subscribed_apps` +
        `?subscribed_fields=messages,messaging_postbacks` +
        `&access_token=${pageAccessToken}`;
    const resp = await fetch(url, { method: 'POST' });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || 'Failed to subscribe Page webhook');
    return data;
}

module.exports = {
    exchangeCodeForToken,
    getLongLivedToken,
    getManagedPages,
    getLinkedInstagramAccount,
    subscribePageWebhook,
};
