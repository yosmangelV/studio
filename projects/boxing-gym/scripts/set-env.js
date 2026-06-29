#!/usr/bin/env node
// Reads projects/boxing-gym/.env and generates the Angular environment files.
// Run before `ng serve` or `ng build`. Never commit the generated files.

const fs   = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const envFile     = path.join(projectRoot, '.env');

if (!fs.existsSync(envFile)) {
  console.error('ERROR: projects/boxing-gym/.env not found.');
  console.error('Copy .env.example → .env and fill in your Supabase values.');
  process.exit(1);
}

const env = {};
for (const line of fs.readFileSync(envFile, 'utf-8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.+)$/);
  if (m) env[m[1]] = m[2].trim();
}

const { SUPABASE_URL, SUPABASE_ANON_KEY } = env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('ERROR: .env must define SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

const envDir = path.join(projectRoot, 'src/environments');

fs.writeFileSync(
  path.join(envDir, 'environment.ts'),
  `export const environment = {\n  production: false,\n  supabase: {\n    url:    '${SUPABASE_URL}',\n    anonKey: '${SUPABASE_ANON_KEY}',\n  },\n};\n`,
);

fs.writeFileSync(
  path.join(envDir, 'environment.prod.ts'),
  `export const environment = {\n  production: true,\n  supabase: {\n    url:    '${SUPABASE_URL}',\n    anonKey: '${SUPABASE_ANON_KEY}',\n  },\n};\n`,
);

console.log('✓ environment.ts and environment.prod.ts generated');
