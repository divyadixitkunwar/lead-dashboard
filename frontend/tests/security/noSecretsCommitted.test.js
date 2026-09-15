import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// Mirrors plan.md section 05 "Secrets": Gemini/Meta credentials must never be
// exposed in the frontend bundle, and no API keys should be hardcoded in source.
const SECRET_PATTERNS = [
    { name: 'Google/Gemini API key', re: /AIza[0-9A-Za-z_-]{35}/ },
    { name: 'Generic OpenAI-style secret key', re: /sk-[A-Za-z0-9]{20,}/ },
    { name: 'Meta/Facebook long-lived access token', re: /EAA[A-Za-z0-9]{50,}/ },
    { name: 'AWS access key', re: /AKIA[0-9A-Z]{16}/ },
    { name: 'Hardcoded JWT', re: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
];

function allSourceFiles(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name === 'dist') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) allSourceFiles(full, out);
        else if (/\.(js|jsx|ts|tsx|env)$/.test(entry.name) || entry.name === '.env') out.push(full);
    }
    return out;
}

describe('Secrets — none committed to frontend source', () => {
    const srcDir = path.resolve(__dirname, '../../src');
    const files = allSourceFiles(srcDir);

    it('scanned at least one source file (sanity check the scan itself runs)', () => {
        expect(files.length).toBeGreaterThan(0);
    });

    for (const { name, re } of SECRET_PATTERNS) {
        it(`contains no ${name}`, () => {
            const hits = files.filter((f) => re.test(fs.readFileSync(f, 'utf8')));
            expect(hits).toEqual([]);
        });
    }

    it('does not read any *_SECRET / *_API_KEY env var directly in frontend code (only VITE_-prefixed, public config belongs client-side)', () => {
        const offenders = [];
        for (const f of files) {
            const source = fs.readFileSync(f, 'utf8');
            const matches = source.match(/import\.meta\.env\.(\w+)/g) || [];
            for (const m of matches) {
                const varName = m.split('.').pop();
                if (/SECRET|PRIVATE_KEY|API_KEY/i.test(varName) && !varName.startsWith('VITE_')) {
                    offenders.push(`${f}: ${varName}`);
                }
            }
        }
        expect(offenders).toEqual([]);
    });

    it('the repo does not track a real .env file (only .env.example/.sample, if any)', () => {
        const rootDir = path.resolve(__dirname, '../..');
        let trackedEnvFiles = [];
        try {
            const output = execSync('git ls-files .env', { cwd: rootDir, encoding: 'utf8' });
            trackedEnvFiles = output.split('\n').filter(Boolean);
        } catch {
            trackedEnvFiles = [];
        }
        expect(trackedEnvFiles).toEqual([]);
    });
});
