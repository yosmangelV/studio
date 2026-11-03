// Runs Godot on this project. Binary: the GODOT_BIN variable or `godot` on the PATH.
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const binary = process.env.GODOT_BIN || 'godot';
const { status, error } = spawnSync(binary, ['--path', project, ...process.argv.slice(2)], {
  stdio: 'inherit',
});

if (error) {
  console.error(`Could not run "${binary}". Install Godot 4 or set GODOT_BIN.`);
  process.exit(1);
}
process.exit(status ?? 1);
