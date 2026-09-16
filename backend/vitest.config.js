const { defineConfig } = require('vite');

// Default config: unit + integration + security tests that use supertest
// against the in-memory app (src/app.js) and a real local Postgres test
// database. Never hits a live/deployed server. Excludes tests/api/** (see
// vitest.config.api.js) which is opt-in and hits a real running server.
module.exports = defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: [
            'tests/unit/**/*.test.js',
            'tests/integration/**/*.test.js',
            'tests/security/**/*.test.js',
        ],
        testTimeout: 15000,
        hookTimeout: 15000,
    },
});
