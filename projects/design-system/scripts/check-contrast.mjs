#!/usr/bin/env node
// Checks design tokens against WCAG 2.2 contrast minimums and flags `var(--x)` references
// that no token file or stylesheet defines.
//
// Usage: node projects/design-system/scripts/check-contrast.mjs <config.json> [...]
//
// A config lists themes (token files layered in the order the app loads them) and the
// foreground/background pairs each theme must pass. See projects/design-system/contrast.config.json.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

// ---- Parsing ------------------------------------------------------------------

const stripComments = (css) =>
  css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Declarations inside every top-level block whose header matches `header` (e.g. `:root`). */
function blockDeclarations(css, header) {
  const decls = {};
  const open = new RegExp(`(^|[\\s;}])${escapeRegExp(header)}\\s*\\{`, 'g');
  let match;
  while ((match = open.exec(css))) {
    let depth = 1;
    let i = open.lastIndex;
    const start = i;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    const body = css.slice(start, i - 1);
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      decls[name] = value.trim();
    }
  }
  return decls;
}

const readCss = (path) => stripComments(readFileSync(path, 'utf8'));

// ---- Colour maths --------------------------------------------------------------

const NAMED = { white: [255, 255, 255, 1], black: [0, 0, 0, 1], transparent: [0, 0, 0, 0] };

function parseColor(raw) {
  const v = raw.trim().toLowerCase();
  if (NAMED[v]) return NAMED[v];
  const hex = v.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  const fn = v.match(/^rgba?\((.+)\)$/);
  if (fn) {
    const parts = fn[1].split(/[\s,/]+/).filter(Boolean);
    const alpha = parts[3] === undefined ? 1 : parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    return [...parts.slice(0, 3).map(Number), alpha];
  }
  return null;
}

function resolve(value, tokens, seen = new Set()) {
  const v = value.trim();
  const ref = v.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/);
  if (!ref) return parseColor(v);
  const [, name, fallback] = ref;
  if (seen.has(name)) throw new Error(`circular token ${name}`);
  if (tokens[name] !== undefined) return resolve(tokens[name], tokens, new Set([...seen, name]));
  return fallback ? resolve(fallback, tokens, seen) : null;
}

const over = ([r, g, b, a], [br, bg, bb]) => [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];

const luminance = ([r, g, b]) => {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// ---- Undefined references ------------------------------------------------------

const SOURCE_EXT = new Set(['.scss', '.css', '.html', '.ts']);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (SOURCE_EXT.has(extname(path)) && !path.endsWith('.spec.ts') && !path.endsWith('.stories.ts')) yield path;
  }
}

function undefinedReferences(sources, tokenFiles) {
  const defined = new Set();
  const uses = [];
  for (const file of tokenFiles) {
    for (const [, name] of readCss(file).matchAll(/(--[\w-]+)\s*:/g)) defined.add(name);
  }
  for (const dir of sources) {
    for (const file of walk(dir)) {
      const text = readFileSync(file, 'utf8');
      for (const [, name] of text.matchAll(/(--[\w-]+)\s*:/g)) defined.add(name);
      text.split('\n').forEach((line, i) => {
        for (const [, name, next] of line.matchAll(/var\(\s*(--[\w-]+)\s*([,)])/g)) {
          if (next === ')') uses.push({ name, where: `${file}:${i + 1}` });
        }
      });
    }
  }
  return uses.filter((u) => !defined.has(u.name));
}

// ---- Component usage -----------------------------------------------------------
// Token pairs only prove the tokens pass; these rules keep components on the tokens.

const LITERAL_COLOR = /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\(|white$|black$)/i;

/**
 * The stylesheet with comments blanked out, newlines kept so offsets map to the same
 * lines. `//` only starts a comment outside strings and `url(...)`, so a URL such as
 * `url(https://x/a.png)` survives.
 */
function maskComments(css) {
  let out = '';
  let quote = null;
  let inUrl = false;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (quote) {
      out += c;
      if (c === '\\') { out += css[++i] ?? ''; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; out += c; continue; }
    // `url(` only as a whole function name: not the tail of `my-url(`; CSS is case-insensitive.
    if (!inUrl && css.slice(i, i + 4).toLowerCase() === 'url(' && !/[\w-]/.test(css[i - 1] ?? '')) {
      inUrl = true; out += css.slice(i, i + 4); i += 3; continue;
    }
    if (inUrl) { out += c; if (c === ')') inUrl = false; continue; }
    if (css.startsWith('/*', i)) {
      const close = css.indexOf('*/', i + 2);
      const stop = close === -1 ? css.length : close + 2;
      out += css.slice(i, stop).replace(/[^\n]/g, ' ');
      i = stop - 1;
      continue;
    }
    if (css.startsWith('//', i)) {
      const nl = css.indexOf('\n', i);
      const stop = nl === -1 ? css.length : nl;
      out += ' '.repeat(stop - i);
      i = stop - 1;
      continue;
    }
    out += c;
  }
  return out;
}

/** True when the `var()` at `index` is inside a custom property declaration (`--x: var(--y)`). */
function inTokenDeclaration(css, index) {
  const start = Math.max(css.lastIndexOf(';', index), css.lastIndexOf('{', index), css.lastIndexOf('}', index)) + 1;
  return /^\s*--[\w-]+\s*:/.test(css.slice(start, index));
}

// `forbiddenTokens` are tokens a component may not reference at all, as text or fill:
// raw palette values (primitives) that only the token files map onto roles. Mapping
// one onto another custom property (`--role: var(--primitive)`) is what token files
// do, so declarations are exempt.
function usageViolations(sources, forbiddenText = [], forbiddenTokens = []) {
  const out = [];
  for (const dir of sources) {
    for (const file of walk(dir)) {
      if (extname(file) !== '.scss' && extname(file) !== '.css') continue;
      const raw = readFileSync(file, 'utf8');
      const masked = maskComments(raw);
      const rawLines = raw.split('\n');
      const lineAt = (index) => masked.slice(0, index).split('\n').length;
      // Whole-file scans, so a declaration split across lines still matches.
      for (const m of masked.matchAll(/(?:^|[\s{;])color:\s*([^;{}]+);/g)) {
        const where = `${file}:${lineAt(m.index + m[0].indexOf('color'))}`;
        const value = m[1].trim();
        const token = value.match(/^var\(\s*(--[\w-]+)/)?.[1];
        if (LITERAL_COLOR.test(value)) out.push({ where, why: `literal text colour "${value.replace(/\s+/g, ' ')}": use a text-role token` });
        else if (token && forbiddenText.includes(token)) out.push({ where, why: `${token} is not a text token` });
      }
      for (const m of masked.matchAll(/outline:\s*(none|0)\b/g)) {
        const line = lineAt(m.index);
        if (!rawLines[line - 1].includes('a11y-ok')) {
          out.push({ where: `${file}:${line}`, why: 'focus outline removed (add a visible :focus-visible style, then mark the line "a11y-ok: <reason>")' });
        }
      }
      for (const m of masked.matchAll(/var\(\s*(--[\w-]+)/g)) {
        if (!forbiddenTokens.includes(m[1]) || inTokenDeclaration(masked, m.index)) continue;
        out.push({ where: `${file}:${lineAt(m.index)}`, why: `${m[1]} is a primitive: use the role token that maps it` });
      }
    }
  }
  return out;
}

// ---- Run -----------------------------------------------------------------------

let failures = 0;

for (const configPath of process.argv.slice(2)) {
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const tokenFiles = new Set();

  for (const theme of config.themes) {
    const tokens = {};
    for (const layer of theme.layers) {
      tokenFiles.add(layer.file);
      Object.assign(tokens, blockDeclarations(readCss(layer.file), layer.block));
    }
    const color = (ref) => resolve(ref.startsWith('--') ? `var(${ref})` : ref, tokens);
    const canvas = color(theme.canvas);
    if (!canvas || canvas[3] < 1) throw new Error(`[${theme.name}] canvas ${theme.canvas} must be an opaque colour`);

    const rows = [];
    for (const check of theme.checks) {
      for (const bgRef of check.bg) {
        const bgRaw = color(bgRef);
        for (const fgRef of check.fg) {
          const fgRaw = color(fgRef);
          if (!fgRaw || !bgRaw) {
            rows.push({ check: check.label, fg: fgRef, bg: bgRef, missing: !fgRaw ? fgRef : bgRef });
            continue;
          }
          const bg = over(bgRaw, canvas);
          const ratio = contrast(over(fgRaw, bg), bg);
          if (ratio < check.min) rows.push({ check: check.label, fg: fgRef, bg: bgRef, ratio, min: check.min });
        }
      }
    }

    const pairs = theme.checks.reduce((n, c) => n + c.fg.length * c.bg.length, 0);
    if (!rows.length) {
      console.log(`✓ ${theme.name}: ${pairs} pairs pass`);
      continue;
    }
    failures += rows.length;
    console.log(`✗ ${theme.name}: ${rows.length} of ${pairs} pairs fail`);
    for (const r of rows) {
      if (r.missing) console.log(`    ${r.check}: ${r.fg} on ${r.bg}: ${r.missing} is not defined`);
      else console.log(`    ${r.check}: ${r.fg} on ${r.bg} = ${r.ratio.toFixed(2)}:1 (needs ${r.min}:1)`);
    }
  }

  const missing = undefinedReferences(config.sources ?? [], [...tokenFiles]);
  if (missing.length) {
    failures += missing.length;
    console.log(`✗ ${config.name}: ${missing.length} references to undefined tokens`);
    for (const m of missing) console.log(`    ${m.name} at ${m.where}`);
  } else {
    console.log(`✓ ${config.name}: no undefined token references`);
  }

  const misuse = usageViolations(config.sources ?? [], config.forbiddenTextTokens, config.forbiddenTokens);
  if (misuse.length) {
    failures += misuse.length;
    console.log(`✗ ${config.name}: ${misuse.length} component styles bypass the tokens`);
    for (const m of misuse) console.log(`    ${m.where}: ${m.why}`);
  } else {
    console.log(`✓ ${config.name}: components use role, text and focus tokens`);
  }
}

process.exit(failures ? 1 : 0);
