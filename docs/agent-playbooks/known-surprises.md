# Known Surprises

This file tracks repository-specific confusion points that caused agent mistakes.

## Entry Criteria

Add an entry only if all are true:

- It is specific to this repository (not generic advice).
- It is likely to recur for future agents.
- It has a concrete mitigation that can be followed.

If uncertain, ask the developer before adding an entry.

## Entry Template

```md
### [Short title]

- **Date:** YYYY-MM-DD
- **Observed by:** agent name or contributor
- **Context:** where/when it happened
- **What was surprising:** concrete unexpected behavior
- **Impact:** what went wrong or could go wrong
- **Mitigation:** exact step future agents should take
- **Status:** confirmed | superseded
```

## Entries

### `.vercel` output is local-only

- **Date:** 2026-03-19
- **Observed by:** Codex
- **Context:** Local Vercel inspection created a large `.vercel/output/` tree in the repo.
- **What was surprising:** The generated Vercel output can look like meaningful project files, but it is purely local build/deploy state and should not be committed.
- **Impact:** Agents may accidentally stage large generated artifacts or mistake them for source changes.
- **Mitigation:** Keep `.vercel` ignored and clean it before committing if Vercel tooling was used locally.
- **Status:** confirmed

### Electron RPC and the web bundle must use the same `@plebbit/plebbit-js` revision

- **Date:** 2026-03-19 (updated 2026-04-20)
- **Observed by:** Codex
- **Context:** `electron/start-plebbit-rpc.js` imports `@plebbit/plebbit-js/rpc` while the browser uses plebbit-js transitively via `@bitsocialnet/bitsocial-react-hooks`.
- **What was surprising:** Relying only on a transitive `plebbit-js` makes the Electron path easy to misread in audits, and upgrading hooks without aligning the RPC server can produce JSON-RPC schema mismatches (for example `subplebbitUpdateSubscribe` param shape).
- **Impact:** If versions diverge, local WebSocket RPC can reject calls that the browser client sends, or vice versa.
- **Mitigation:** After changing `@bitsocialnet/bitsocial-react-hooks` or touching Plebbit-related deps, run **`yarn verify:plebbit-js-lock`** so `yarn.lock` still contains **exactly one** `@plebbit/plebbit-js` git commit. Keep that commit aligned with the hooks package’s `dependencies["@plebbit/plebbit-js"]`. Avoid adding a redundant Yarn **`resolutions`** line for `@plebbit/plebbit-js` unless necessary: it can force Yarn to re-pack the git dependency and fail if a transitive package (for example a missing npm tarball) 404s during that repack.
- **Status:** confirmed

### Electron packaging can ship a broken `better-sqlite3` binary

- **Date:** 2026-03-19
- **Observed by:** Codex
- **Context:** Investigating desktop packaging failures where the app launched but the local RPC never became healthy.
- **What was surprising:** The packaged app can appear to start normally while `better-sqlite3` was built for plain Node instead of the Electron runtime, which prevents the local RPC path from starting correctly.
- **Impact:** The desktop app may open but fail to load comments, communities, or other RPC-backed data.
- **Mitigation:** The repo runs `yarn electron:rebuild-native` from **postinstall** (see `scripts/electron-rebuild-better-sqlite3.mjs`) so `better-sqlite3` is compiled for the pinned **Electron** version after `yarn install`. To skip (e.g. constrained CI), set **`SKIP_ELECTRON_REBUILD=1`**. For a manual rebuild: `yarn electron:rebuild-native`.
- **Status:** confirmed

### Portless is now the canonical web dev URL

- **Date:** 2026-03-30
- **Observed by:** Codex
- **Context:** Normal `yarn start` runs alongside other local Bitsocial projects
- **What was surprising:** The repo historically assumed `http://localhost:3000`, but the normal web dev flow now runs through Portless at `http://seedit.localhost:1355` so multiple Bitsocial apps can coexist without raw-port collisions.
- **Impact:** Agents can point browser automation, health checks, or local smoke scripts at the wrong URL and conclude the app is down when it is healthy.
- **Mitigation:** Use `http://seedit.localhost:1355` for standard web dev and agent smoke flows. Only rely on `http://localhost:3000` when a script intentionally forces both `PORTLESS=0` and `PORT=3000`, such as the combined Electron dev commands.
- **Status:** confirmed

### Fixed Portless app names collide across seedit worktrees

- **Date:** 2026-03-30
- **Observed by:** Codex
- **Context:** Starting `yarn start` in one seedit worktree while another seedit worktree was already serving through Portless
- **What was surprising:** Using the literal Portless app name `seedit` in every worktree makes the route itself collide, even when the backing ports are different, so the second process fails because `seedit.localhost` is already registered.
- **Impact:** Parallel seedit branches can block each other even though Portless is meant to let them coexist safely.
- **Mitigation:** Keep Portless startup behind `scripts/start-dev.js`, which now uses a branch-scoped `*.seedit.localhost:1355` route outside the canonical case, suffixes repeated branch routes (`-2`, `-3`, ...) until it finds a free Portless name, and falls back to the next free direct-Vite port when `PORTLESS=0` is used without an explicit `PORT`.
- **Status:** confirmed

### Toolchain model names are not interchangeable

- **Date:** 2026-04-08
- **Observed by:** Codex
- **Context:** Reviewing repo-managed agent configs under `.codex/`, `.claude/`, and `.cursor/`.
- **What was surprising:** `composer-2` is only valid for Cursor agents, while `.codex` agents should use `gpt-5.4` instead of `gpt-5.3-codex` or `gpt-5.3-codex-spark`.
- **Impact:** Agents can silently pick unavailable or poor-performing models when equivalent workflow files are copied across toolchains without adjusting the model field.
- **Mitigation:** When editing shared agent definitions, keep the behavior text aligned across toolchains but set models per platform: Cursor may use `composer-2`, `.claude` must not, and `.codex` should use `gpt-5.4`.
- **Status:** confirmed

### Plebbit RPC ZodError: `subplebbitUpdateSubscribe` expected string, received object

- **Date:** 2026-04-20
- **Observed by:** Codex
- **Context:** Web dev app (`@plebbit/plebbit-js` via `@bitsocialnet/bitsocial-react-hooks`) connecting to a local Seedit desktop node WebSocket (`ws://localhost:9138`).
- **What was surprising:** The RPC error payload shows `rpcArgs`: `["subplebbitUpdateSubscribe", [{"address":"<subplebbitAddress>"}]]` and Zod reports **Expected string, received object** at `path: []`. Current plebbit-js parses the client param as `RpcSubplebbitAddressParamSchema` (`{ address: string }`) and sends that object; some older or differently versioned RPC servers validate the same method with a **plain string** address instead.
- **Impact:** Every subscription to a remote subplebbit via RPC fails; communities list / infobar hooks surface `ZodError`; `failed plebbit.createCommunity(cachedCommunity)` may also appear when cache is involved.
- **Mitigation:** (1) **Align versions:** use the repo’s pinned `@plebbit/plebbit-js` + `@bitsocialnet/bitsocial-react-hooks` together; rebuild or reinstall the **desktop** app so the process on `ws://localhost:9138` is not an older packaged RPC. Do not point the web app at 9138 while a **different** Seedit/Plebbit binary (older plebbit-js) owns that port. (2) **Workaround for browser-only dev:** clear **Plebbit RPC** in Settings → Network, save, reload, and rely on **IPFS gateways + pubsub** so the client does not use RPC for subplebbit updates (works when the subplebbit is reachable via gateways).
- **Status:** confirmed

### `useAccountComment` crashed when no account + empty CID map (`undefined.accountCommentIndex`)

- **Date:** 2026-04-20
- **Observed by:** Codex
- **Context:** `@bitsocialnet/bitsocial-react-hooks` `useAccountComment` / `useAccountComments` (CID branch): optional chaining on `commentCidToAccountComment?.accountId === accountId` is **true** when **both** sides are `undefined`, then the code reads `commentCidToAccountComment.accountCommentIndex` on a missing mapping → **TypeError** (e.g. `FeedNavRail` → `useSubmitPostRoute` while logged out).
- **What was surprising:** `undefined === undefined` in the guard does not imply the mapping object exists.
- **Impact:** White screen / root error boundary; navigation rail fails on common routes.
- **Mitigation:** `scripts/patch-bitsocial-react-hooks-esm.cjs` postinstall patch rewrites the guard to `commentCidToAccountComment && commentCidToAccountComment.accountId === accountId` in `dist/hooks/accounts/accounts.js`. Re-run **`yarn install`** (or `node scripts/patch-bitsocial-react-hooks-esm.cjs`) after upgrading `@bitsocialnet/bitsocial-react-hooks` and **re-apply** the patch if the dist output changes. Prefer fixing upstream in bitsocial-react-hooks when bumping the tarball.
- **Status:** confirmed
