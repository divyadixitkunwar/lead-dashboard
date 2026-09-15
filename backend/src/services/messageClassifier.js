const { normalize } = require('./normalizer');

const classifierKeywords = {
    supplier: [
        'wholesale', 'supplier', 'bulk', 'maal', 'supply',
        'reseller', 'resell', 'distributor', 'agent',
        'lot', 'quantity', 'stock dinus', 'maal dinus',
        'wholesale dinchhau', 'wholesale dinchha'
    ],
    general: [
        'feedback', 'complaint', 'problem', 'issue',
        'wrong item', 'damaged', 'return', 'refund',
        'exchange', 'broken', 'kharab', 'galat',
        'napayeko', 'naaeko', 'wrong', 'bad quality'
    ]
};

function classifyMessageType(text) {
    if (!text) return 'customer_lead';

    const normalized = normalize(text);

    for (const [type, keywords] of Object.entries(classifierKeywords)) {
        for (const keyword of keywords) {
            if (normalized.includes(keyword)) {
                return type;
            }
        }
    }

    return 'customer_lead';
}

module.exports = { classifyMessageType };