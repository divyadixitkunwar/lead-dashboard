const { tagIntent } = require('./intentTagger');
const { classifyMessageType } = require('./messageClassifier');

const VALID_MESSAGE_TYPES = new Set([
    'customer_lead',
    'supplier',
    'general'
]);

const VALID_INTENTS = new Set([
    'price_inquiry',
    'delivery_inquiry',
    'availability',
    'unclassified'
]);

const VALID_URGENCY = new Set([
    'low',
    'medium',
    'high'
]);

async function classifyWithAI(text) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const model = process.env.GEMINI_MODEL;
    if (!model) {
        throw new Error('GEMINI_MODEL is not configured');
    }

    const prompt = `
You are classifying inbound business messages for a lead dashboard.

The message may be written in English, Nepali Devanagari, Romanized Nepali, or a mixture.

Return ONLY valid JSON with exactly these fields:
- message_type
- intent
- urgency
- summary

Allowed message_type values:
- customer_lead
- supplier
- general

Allowed intent values:
- price_inquiry
- delivery_inquiry
- availability
- unclassified

Allowed urgency values:
- low
- medium
- high

Rules:
- customer_lead: a potential customer asking about buying a product or service.
- supplier: a supplier, wholesaler, reseller, distributor, agent, or bulk-sales inquiry.
- general: complaints, feedback, problems, returns, refunds, damaged/wrong items, or messages that are not sales leads.
- price_inquiry: asking about price, cost, rate, or how much something costs.
- delivery_inquiry: asking about delivery, shipping, arrival time, destination, or delivery duration.
- availability: asking whether something is available, in stock, or whether a particular size/color/variant exists.
- unclassified: none of the above clearly applies.
- Use the overall meaning of the message, not isolated words. For example, "cha" or "chha" alone is not enough to classify something as availability.
- summary must be one short sentence in English.

Message:
${JSON.stringify(text)}
`.trim();

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
            method: 'POST',
            headers: {
                'x-goog-api-key': process.env.GEMINI_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0
                }
            })
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
        throw new Error('Gemini returned no classification');
    }

    let result;
    try {
        result = JSON.parse(raw);
    } catch {
        throw new Error('Gemini returned invalid JSON');
    }

    if (
        !VALID_MESSAGE_TYPES.has(result.message_type) ||
        !VALID_INTENTS.has(result.intent) ||
        !VALID_URGENCY.has(result.urgency) ||
        typeof result.summary !== 'string'
    ) {
        throw new Error('Gemini returned invalid classification values');
    }

    return {
        message_type: result.message_type,
        intent: result.intent,
        urgency: result.urgency,
        summary: result.summary.trim()
    };
}

async function classifyWithFallback(text) {
    try {
        return await classifyWithAI(text);
    } catch (error) {
        console.error('Gemini classification failed:', error.message);

        if (/[^\\x00-\\x7F]/.test(text) && /[\\u0900-\\u097F]/.test(text)) {
            return {
                message_type: 'customer_lead',
                intent: 'unclassified',
                urgency: 'low',
                summary: null
            };
        }

        const message_type = classifyMessageType(text);
        const intent =
            message_type === 'customer_lead'
                ? tagIntent(text)
                : 'unclassified';

        return {
            message_type,
            intent,
            urgency: 'low',
            summary: null
        };
    }
}

async function suggestReply({ businessName, messages, intent }) {
    const transcript = (messages || [])
        .slice(-10)
        .map(m => `${m.direction === 'inbound' ? 'Customer' : 'You'}: ${m.body}`)
        .join('\n');

    const prompt = `You are drafting a reply on behalf of "${businessName}", a small business in Nepal selling over social media DMs.
The customer's likely intent is: ${intent}.

Conversation so far:
${transcript}

Write ONE short reply (1-3 sentences) that a staff member could send as-is or lightly edit.
Match the customer's language and tone. If they wrote in Romanized Nepali or Nepali script, reply in the same form. If English, reply in English.
Do not invent prices, stock levels, product details, or delivery times you do not actually know.
If the answer requires business information you do not have, ask a clarifying question or say you will check instead of making up facts.
Return ONLY the reply text, nothing else.`;

    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const model = process.env.GEMINI_MODEL;
    if (!model) {
        throw new Error('GEMINI_MODEL is not configured');
    }

    const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
            method: 'POST',
            headers: {
                'x-goog-api-key': process.env.GEMINI_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.4 }
            })
        }
    );

    if (!resp.ok) {
        throw new Error(`Gemini request failed: ${resp.status}`);
    }

    const data = await resp.json();
    const draft = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!draft) {
        throw new Error('Gemini returned no content');
    }

    return draft.trim();
}

module.exports = {
    classifyWithAI,
    classifyWithFallback,
    suggestReply
};
