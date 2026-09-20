# hermes-contributions

A heavy user's contributions around Hermes Agent — onboarding, a CLI-shaped page, a field guide and a PKM toolkit — in one repo. Unaffiliated with Nous Research. Live: https://hermes-contributions.technoir.cloud

## Commands

- Check (before every commit and deploy): `./scripts/check.sh`
- Dev: `npm run dev`
- Deploy: `./scripts/deploy.sh` (see `DEPLOYMENT.md`)
- When freshness fails: `node scripts/refresh-upstream.mjs`, then read the diff

## Layout

`onboarding/` the `0th` script · `page/` the front door · `field-guide/` model prices · `pkm-toolkit/` vault skills and MCP server. `scripts/build.mjs` renders all four into `dist/`; nginx serves it as one host.

## Non-negotiables

1. Never claim affiliation, endorsement, or a contribution to Hermes Agent's own code. The statement lives once in `scripts/notice.mjs`; the check fails if any page or the README stops carrying it verbatim.
2. Every fact quoted from upstream — version, installer, model ids, prices, docs links — lives in `upstream.json` and nowhere else, and `scripts/freshness.mjs` re-reads it from Nous on every check. Never hand-edit a price: three of the four repos that folded in here rotted exactly that way. `SKIP_FRESHNESS=1` is for an unreachable network, never for a red check.
3. `0th` never reimplements the installer: it shells out to the official one and otherwise only reads state. `onboarding/check.sh` enforces this, and it stays one self-contained POSIX `sh` file.
4. `raw.githubusercontent.com/ponzgpt/0th-hermes/main/0th` must keep resolving — people have piped it into a shell. Never delete or rename that archived repo. The maintained copy is served at `/0th` from this host.
5. Nothing in `pkm-toolkit/` moves, overwrites or deletes a vault note; structural changes are proposals a human approves. `mcp` stays `<2.0` until the server moves off `FastMCP`.
6. Every text role in every skin stays above 4.5:1 contrast (`page/tests/contrast.test.js`), and `page/index.html` stays readable without JavaScript.
7. One service, one host. Adding a part adds a path, never a domain. The four retired hosts 301 here.
8. Every claim about Javier belongs in the claims ledger (private `ponzgpt/javier-ponz-site-internal`).
