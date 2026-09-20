# hermes-contributions

**A heavy user and vibecoder's attempt to give something back to [Hermes Agent](https://github.com/NousResearch/hermes-agent).** Not a product, not a landing page, not a company, and not a claim of affiliation.

Not affiliated with, endorsed by, or produced for Nous Research. No Hermes Agent code is vendored or forked here, and nothing here is a contribution to the project’s own codebase. This is one heavy user’s work built around the tool and offered back. Where anything here disagrees with the official Hermes Agent documentation, the official documentation is right.

Live at **<https://hermes-contributions.technoir.cloud>**.

## What is in here

Four things I built while living inside Hermes Agent every day, each of which started as its own repository, its own domain and its own service — four of everything, explaining the same thing to the same person. They are one repository now.

| Part                           | What it is                                                                                                                                                                                                           | Was                          |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| [`onboarding/`](onboarding/)   | The shortest path to a working Hermes Agent, and `0th` — a POSIX script that looks at your machine and names the _one_ next thing to do. It never reimplements the installer; it shells out to Nous' own.            | `ponzgpt/0th-hermes`         |
| [`page/`](page/)               | The front door, which behaves like the CLI it describes: press <kbd>/</kbd> for the real slash-command palette, <kbd>s</kbd> for the next of the six skins Hermes ships. No build step, readable without JavaScript. | `ponzgpt/hermes-agent-site`  |
| [`field-guide/`](field-guide/) | Which model to put in the main slot and which in the auxiliary slots, and what each costs today. Generated from `upstream.json`, never typed.                                                                        | `ponzgpt/hermes-launch`      |
| [`pkm-toolkit/`](pkm-toolkit/) | Four skills and a stdio MCP server that let Hermes work on a local Markdown vault — GTD, PARA, Johnny.Decimal. The filesystem is the database.                                                                       | `ponzgpt/hermes-pkm-toolkit` |

All four source repositories are archived rather than deleted, and their hosts redirect here. `raw.githubusercontent.com/ponzgpt/0th-hermes/main/0th` keeps working, because people may have piped it into a shell; the maintained copy now lives at <https://hermes-contributions.technoir.cloud/0th>.

## Nothing here is allowed to rot quietly

Three of those four pages stated a version number, an installer command or a model price and then went out of date without saying so. The field guide's prices were a promotional snapshot; the promotion ended, and five of its six numbers were 80% of the real ones for weeks, because nothing was watching.

Everything this repository quotes from upstream now lives in one file, [`upstream.json`](upstream.json), and `scripts/freshness.mjs` re-reads all of it from what Nous publishes — the [releases API](https://github.com/NousResearch/hermes-agent/releases), the installer, the [Portal catalogue](https://inference-api.nousresearch.com/v1/models) and the docs index — on every check, every CI run, every deploy, and once a day on a schedule. When any of it has moved, the build fails and says which number changed from what to what.

```
$ node scripts/freshness.mjs
  DRIFT Balanced daily / main — anthropic/claude-sonnet-4.6
        we say:   $2.40/$12.00 per 1M
        upstream: $3.00/$15.00 per 1M
```

## Commands

```bash
./scripts/check.sh                   # lint, tests, build, links, upstream freshness
npm run dev                          # build and serve on http://localhost:4321
node scripts/refresh-upstream.mjs    # rewrite upstream.json when freshness complains
./scripts/deploy.sh                  # check, build on the VPS, roll out, wait for /healthz
```

See [AGENTS.md](AGENTS.md) for the rules and [DEPLOYMENT.md](DEPLOYMENT.md) for production.

## Credit

Nous Research wrote Hermes Agent, its installer and its documentation, all of which are good. Everything here is the thin layer a newcomer needed on top, written by someone who needed it. Where any of it disagrees with [the official docs](https://hermes-agent.nousresearch.com/docs), the official docs are right — please open an issue.

MIT. See [LICENSE](LICENSE).
