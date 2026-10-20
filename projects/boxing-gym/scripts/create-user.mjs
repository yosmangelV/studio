#!/usr/bin/env node
/**
 * Creates a Supabase user with email + password and assigns permissions via app_metadata.
 *
 * Usage:
 *   node scripts/create-user.mjs <email> <password> <role>
 *
 * Roles: instructor | student | admin  (comma-separated for multiple)
 *
 * Example:
 *   node scripts/create-user.mjs rtalledo642@gmail.com MyPass123! instructor,student
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env manually (no dotenv dependency needed)
const envPath = resolve(__dirname, '../.env');
const envVars = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=').map(p => p.trim()))
    .filter(([k]) => k)
);

const SUPABASE_URL          = envVars['SUPABASE_URL'];
const SUPABASE_SERVICE_KEY  = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const [, , email, password, role] = process.argv;

const VALID_ROLES = ['instructor', 'student', 'admin'];

if (!email || !password || !role) {
  console.error('Usage: node scripts/create-user.mjs <email> <password> <role>');
  process.exit(1);
}

const roles = role.split(',').map(r => r.trim());
const invalid = roles.filter(r => !VALID_ROLES.includes(r));
if (invalid.length) {
  console.error(`❌  Invalid role(s): ${invalid.join(', ')}. Valid: ${VALID_ROLES.join(', ')}`);
  process.exit(1);
}

const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  },
  body: JSON.stringify({
    email,
    password,
    email_confirm: true,
    app_metadata: {
      permissions: roles,
    },
  }),
});

const data = await res.json();

if (!res.ok) {
  console.error('❌  Error creating user:', data.message ?? JSON.stringify(data));
  process.exit(1);
}

console.log('✅  User created successfully');
console.log(`   Email:    ${data.email}`);
console.log(`   ID:       ${data.id}`);
console.log(`   Roles:    ${roles.join(', ')}`);
console.log(`   Password: ${password}`);
