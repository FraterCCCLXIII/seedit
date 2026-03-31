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

### Do not add `@plebbit/plebbit-js` directly for Electron RPC

- **Date:** 2026-03-19
- **Observed by:** Codex
- **Context:** `electron/start-plebbit-rpc.js` imports `@plebbit/plebbit-js/rpc` directly even though the repo depends on `@bitsocialnet/bitsocial-react-hooks`.
- **What was surprising:** The direct import can make agents think `@plebbit/plebbit-js` should be added to `package.json`, but this repo intentionally relies on the transitive copy provided by `@bitsocialnet/bitsocial-react-hooks`.
- **Impact:** Agents may add a redundant direct dependency and widen the upgrade surface unnecessarily.
- **Mitigation:** Do not add `@plebbit/plebbit-js` just to satisfy a manifest audit. If a dependency audit complains, handle it with a targeted ignore or with the repo owner first.
- **Status:** confirmed

### Electron packaging can ship a broken `better-sqlite3` binary

- **Date:** 2026-03-19
- **Observed by:** Codex
- **Context:** Investigating desktop packaging failures where the app launched but the local RPC never became healthy.
- **What was surprising:** The packaged app can appear to start normally while `better-sqlite3` was built for plain Node instead of the Electron runtime, which prevents the local RPC path from starting correctly.
- **Impact:** The desktop app may open but fail to load comments, communities, or other RPC-backed data.
- **Mitigation:** Before Electron packaging or release verification, rebuild `better-sqlite3` for the target Electron version, for example with `npx electron-rebuild -f -o better-sqlite3`, then verify the rebuilt native module under the Electron runtime.
- **Status:** confirmed

### Portless is now the canonical web dev URL

- **Date:** 2026-03-30
- **Observed by:** Codex
- **Context:** Normal `yarn start` runs alongside other local Bitsocial projects
- **What was surprising:** The repo historically assumed `http://localhost:3000`, but the normal web dev flow now runs through Portless at `http://seedit.localhost:1355` so multiple Bitsocial apps can coexist without raw-port collisions.
- **Impact:** Agents can point browser automation, health checks, or local smoke scripts at the wrong URL and conclude the app is down when it is healthy.
- **Mitigation:** Use `http://seedit.localhost:1355` for standard web dev and agent smoke flows. Only rely on `http://localhost:3000` when a script intentionally forces `PORTLESS=0`, such as the combined Electron dev commands.
- **Status:** confirmed
