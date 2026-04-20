/**
 * Rebuild `better-sqlite3` (transitive via @plebbit/plebbit-js) for the Electron runtime.
 * Without this, `NODE_MODULE_VERSION` mismatches and Plebbit RPC fails to start in dev:
 * `failed starting plebbit rpc server` / `ERR_DLOPEN_FAILED` on better_sqlite3.node.
 *
 * Skip when SKIP_ELECTRON_REBUILD=1 (e.g. minimal CI that never runs Electron).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

if (process.env.SKIP_ELECTRON_REBUILD === '1') {
  console.log('[electron-rebuild-better-sqlite3] SKIP_ELECTRON_REBUILD=1 — skipping native rebuild');
  process.exit(0);
}

const plebbitNodeModules = path.join(root, 'node_modules', '@plebbit', 'plebbit-js', 'node_modules', 'better-sqlite3');
const hoistedBetterSqlite = path.join(root, 'node_modules', 'better-sqlite3');
if (!fs.existsSync(plebbitNodeModules) && !fs.existsSync(hoistedBetterSqlite)) {
  console.log('[electron-rebuild-better-sqlite3] better-sqlite3 not present yet — skipping');
  process.exit(0);
}

const binDir = path.join(root, 'node_modules', '.bin');
const electronRebuildBin =
  process.platform === 'win32' ? path.join(binDir, 'electron-rebuild.cmd') : path.join(binDir, 'electron-rebuild');

if (!fs.existsSync(electronRebuildBin)) {
  console.warn('[electron-rebuild-better-sqlite3] electron-rebuild not found in node_modules/.bin — skipping');
  process.exit(0);
}

console.log('[electron-rebuild-better-sqlite3] Rebuilding better-sqlite3 for Electron…');
try {
  if (process.platform === 'win32') {
    execFileSync(electronRebuildBin, ['-f', '-o', 'better-sqlite3'], { cwd: root, stdio: 'inherit', shell: true });
  } else {
    execFileSync(electronRebuildBin, ['-f', '-o', 'better-sqlite3'], { cwd: root, stdio: 'inherit' });
  }
} catch (e) {
  console.error('[electron-rebuild-better-sqlite3] Rebuild failed. Install may be incomplete.');
  console.error('  Fix: ensure devDependencies are installed, then run: yarn electron:rebuild-native');
  process.exit(e?.status ?? 1);
}
