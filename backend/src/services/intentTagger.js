const { normalize } = require('./normalizer');

// Keywords that signal each intent
const intentKeywords = {
    price_inquiry: [
        'kati', 'paisa', 'dam', 'price', 'cost', 'rate', 'kitna',
        'kati parcha', 'kati ho', 'dam kati', 'price kati',
        'kati ko', 'katipaisa', 'how much', 'howmuch'
    ],
    delivery_inquiry: [
        'delivery', 'pathau', 'pathako', 'aaucha', 'pugcha', 'din',
        'location', 'katiko', 'deliver', 'ship', 'shipping',
        'pokhara', 'kathmandu', 'birtamod', 'biratnagar', 'butwal',
        'samma', 'pugchha', 'aipugchha', 'katdin', 'katidin'
    ],
    availability: [
        'stock', 'cha', 'chaina', 'available', 'baaki', 'sakkiyo',
        'paincha', 'paicha', 'stockcha', 'stockchha',
        'stockchaina', 'out of stock', 'instock', 'in stock',
        'color', 'size', 'blue', 'red', 'green', 'small', 'medium', 'large'
    ]
};

function tagIntent(text) {
    if (!text) return 'unclassified';

    const normalized = normalize(text);

    // Score each intent by how many keywords match
    const scores = { price_inquiry: 0, delivery_inquiry: 0, availability: 0 };

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
        for (const keyword of keywords) {
            if (normalized.includes(keyword)) {
                scores[intent]++;
            }
        }
    }

    // Find the highest scoring intent
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

    // Only return it if at least one keyword matched
    if (best[1] === 0) return 'unclassified';

    return best[0];
}

module.exports = { tagIntent };