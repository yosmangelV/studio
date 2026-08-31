#!/usr/bin/env node
// Generates Angular environment files from .env (local) or process.env (CI/Vercel).
// Run before `ng serve` or `ng build`. Never commit the generated files.

const fs   = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const envFile     = path.join(projectRoot, '.env');

const env = { ...process.env };

if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.+)$/);
    if (m) env[m[1]] = m[2].trim();
  }
}

const { SUPABASE_URL, SUPABASE_ANON_KEY, API_URL } = env;

const missing = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'API_URL'].filter(k => !env[k]);
if (missing.length) {
  console.error(`ERROR: missing required env vars: ${missing.join(', ')}`);
  console.error('Set them in projects/boxing-gym/.env (local) or as environment variables (CI).');
  process.exit(1);
}

const envDir = path.join(projectRoot, 'src/environments');
fs.mkdirSync(envDir, { recursive: true });

const template = (production) =>
  `export const environment = {\n  production: ${production},\n  supabase: {\n    url:    '${SUPABASE_URL}',\n    anonKey: '${SUPABASE_ANON_KEY}',\n  },\n  apiUrl: '${API_URL}',\n};\n`;

fs.writeFileSync(path.join(envDir, 'environment.ts'),      template(false));
fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), template(true));

console.log('✓ environment.ts and environment.prod.ts generated');
