// Lanza Godot sobre este proyecto. Binario: variable GODOT_BIN o `godot` en el PATH.
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const proyecto = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const binario = process.env.GODOT_BIN || 'godot';
const { status, error } = spawnSync(binario, ['--path', proyecto, ...process.argv.slice(2)], {
  stdio: 'inherit',
});

if (error) {
  console.error(`No se pudo ejecutar "${binario}". Instala Godot 4 o define GODOT_BIN.`);
  process.exit(1);
}
process.exit(status ?? 1);
