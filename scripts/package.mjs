#!/usr/bin/env node
/**
 * Zip dist/ into dist.zip for Fire OS packaged-app submission.
 * Run after `npm run build` (or let this script build first with --build).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const out = resolve(root, 'dist.zip');

if (process.argv.includes('--build')) {
  execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
}

if (!existsSync(dist) || readdirSync(dist).length === 0) {
  console.error('dist/ is missing or empty. Run `npm run build` first.');
  process.exit(1);
}

// zip -r merges into an existing archive — remove it so stale hashed assets
// from older builds don't ship in the package.
rmSync(out, { force: true });
execFileSync('zip', ['-r', out, '.'], { cwd: dist, stdio: 'inherit' });
console.log(`\nPackaged ${out}`);
