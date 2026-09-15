import { defineConfig } from 'vite';

// Config for the live, network-hitting API-contract suite. Kept separate
// from vitest.config.js so `npm test` never accidentally hits your live
// backend, and this suite never runs in CI unless explicitly invoked.
//
// Usage:
//   TEST_API_BASE_URL=https://api.yourdomain.com npm run test:api
//   TEST_API_BASE_URL=... TEST_API_TOKEN=<jwt> npm run test:api   (for the authenticated cases)
export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['tests/api-contract/**/*.test.js'],
        testTimeout: 15000,
    },
});
