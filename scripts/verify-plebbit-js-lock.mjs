/**
 * Option B helper: ensure yarn.lock pins exactly one @plebbit/plebbit-js git revision
 * so Electron (electron/start-plebbit-rpc.js) and the web bundle resolve the same RPC schema.
 *
 * Does not add Yarn "resolutions" (re-packing git deps can fail if transitive npm packages 404).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = path.join(root, "yarn.lock");

const lock = fs.readFileSync(lockPath, 'utf8');
const commitRe =
  /resolution: "@plebbit\/plebbit-js@https:\/\/github\.com\/plebbit\/plebbit-js\.git#commit=([0-9a-f]+)"/g;
const commits = new Set();
for (const m of lock.matchAll(commitRe)) {
  commits.add(m[1]);
}

if (commits.size === 0) {
  console.error("verify-plebbit-js-lock: no @plebbit/plebbit-js git pins found in yarn.lock");
  process.exit(1);
}
if (commits.size > 1) {
  console.error("verify-plebbit-js-lock: multiple @plebbit/plebbit-js commits in yarn.lock:", [...commits].join(", "));
  process.exit(1);
}

const [commit] = [...commits];
console.log(`verify-plebbit-js-lock: single @plebbit/plebbit-js commit ${commit}`);
