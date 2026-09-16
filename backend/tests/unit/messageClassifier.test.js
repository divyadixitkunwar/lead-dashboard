// tests/unit/messageClassifier.test.js
//
// Pure logic, no DB, no network. classifyMessageType() returns the first
// matching category ('supplier' or 'general'), falling back to
// 'customer_lead' when nothing matches.

const { classifyMessageType } = require('../../src/services/messageClassifier');

describe('classifyMessageType', () => {
    it('returns "customer_lead" for empty or falsy input', () => {
        expect(classifyMessageType('')).toBe('customer_lead');
        expect(classifyMessageType(null)).toBe('customer_lead');
        expect(classifyMessageType(undefined)).toBe('customer_lead');
    });

    it('defaults to "customer_lead" when nothing matches', () => {
        expect(classifyMessageType('hi, I would like to buy this')).toBe('customer_lead');
    });

    describe('supplier', () => {
        it('matches English wholesale/supplier keywords', () => {
            expect(classifyMessageType('do you sell wholesale')).toBe('supplier');
            expect(classifyMessageType('I am a supplier and want to distribute this')).toBe('supplier');
            expect(classifyMessageType('interested in bulk quantity')).toBe('supplier');
        });

        it('matches Romanized Nepali supplier keywords', () => {
            expect(classifyMessageType('malai maal supply garna man cha')).toBe('supplier');
        });
    });

    describe('general', () => {
        it('matches complaint/feedback keywords', () => {
            expect(classifyMessageType('I have a complaint about my order')).toBe('general');
            expect(classifyMessageType('the item arrived damaged')).toBe('general');
            expect(classifyMessageType('I want a refund please')).toBe('general');
        });

        it('matches Romanized Nepali complaint keywords', () => {
            expect(classifyMessageType('yo product kharab cha')).toBe('general');
        });
    });

    it('is case-insensitive', () => {
        expect(classifyMessageType('WHOLESALE PRICING PLEASE')).toBe('supplier');
    });

    it('returns the first matching category when keywords span categories', () => {
        // classifyMessageType returns on first match found while iterating
        // Object.entries(classifierKeywords), and 'supplier' is defined
        // before 'general' in the source — so a message matching both
        // should resolve to 'supplier'.
        const result = classifyMessageType('wholesale order but item was damaged');
        expect(result).toBe('supplier');
    });
});
