// tests/unit/intentTagger.test.js
//
// Pure logic, no DB, no network. tagIntent() scores normalized text
// against keyword sets and returns the top-scoring intent, or
// 'unclassified' if nothing matched.

const { tagIntent } = require('../../src/services/intentTagger');

describe('tagIntent', () => {
    it('returns "unclassified" for empty or falsy input', () => {
        expect(tagIntent('')).toBe('unclassified');
        expect(tagIntent(null)).toBe('unclassified');
        expect(tagIntent(undefined)).toBe('unclassified');
    });

    it('returns "unclassified" when no keywords match', () => {
        expect(tagIntent('hello how are you today')).toBe('unclassified');
    });

    describe('price_inquiry', () => {
        it('matches English price keywords', () => {
            expect(tagIntent('what is the price of this')).toBe('price_inquiry');
            expect(tagIntent('how much does it cost')).toBe('price_inquiry');
        });

        it('matches Romanized Nepali price keywords', () => {
            expect(tagIntent('kati parcha yo')).toBe('price_inquiry');
            expect(tagIntent('yo ko dam kati ho')).toBe('price_inquiry');
        });

        it('matches common misspelled variants via the normalizer', () => {
            expect(tagIntent('praice kati ho')).toBe('price_inquiry');
        });
    });

    describe('delivery_inquiry', () => {
        it('matches English delivery keywords', () => {
            expect(tagIntent('do you offer delivery to my area')).toBe('delivery_inquiry');
            expect(tagIntent('when will you ship this')).toBe('delivery_inquiry');
        });

        it('matches Romanized Nepali delivery keywords', () => {
            expect(tagIntent('pathau na malai')).toBe('delivery_inquiry');
            expect(tagIntent('kathmandu samma aaucha ki aaudaina')).toBe('delivery_inquiry');
        });

        it('matches city-name keywords used as delivery-area signals', () => {
            expect(tagIntent('pokhara pugcha ki pugdaina')).toBe('delivery_inquiry');
        });
    });

    describe('availability', () => {
        it('matches English stock keywords', () => {
            expect(tagIntent('is this available right now')).toBe('availability');
            expect(tagIntent('do you have this in stock')).toBe('availability');
        });

        it('matches Romanized Nepali stock keywords', () => {
            expect(tagIntent('cha ki chaina yo')).toBe('availability');
            expect(tagIntent('stock cha hola')).toBe('availability');
        });

        it('matches variant/size/color keywords', () => {
            expect(tagIntent('do you have this in blue')).toBe('availability');
            expect(tagIntent('is there a medium size')).toBe('availability');
        });
    });

    it('accumulates multiple keyword hits within the same category', () => {
        // 'available', 'stock', and 'color' are all availability keywords —
        // this should clearly win over the other (unmatched) categories.
        const result = tagIntent('is this available, do you have stock, what color options');
        expect(result).toBe('availability');
    });

    it('is case-insensitive', () => {
        expect(tagIntent('PRICE KATI HO')).toBe('price_inquiry');
    });
});
