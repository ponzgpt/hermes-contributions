# hermes-contributions

Everything I built around [Hermes Agent](https://github.com/NousResearch/hermes-agent) as a daily user, in one
place: ideas for giving something back, inspired by people in the Hermes community who build in the open.

> **Archived.** Not maintained or deployed since 5 October 2026; kept as a record. Where anything here disagrees
> with the [official documentation](https://hermes-agent.nousresearch.com/docs), the official documentation is right.

Unofficial. Not affiliated with or endorsed by Nous Research. No Hermes Agent code is vendored here, and none of
this is a contribution to Hermes Agent's own codebase.

## What is in here

| Part | What it is |
|---|---|
| [`onboarding/`](onboarding/) | The shortest path to a working Hermes Agent, plus `0th`, a POSIX shell script that looks at your machine and names the one next step. It never reimplements the installer; it calls the official one. |
| [`page/`](page/) | A landing page that behaves like the CLI it describes: <kbd>/</kbd> opens the real slash-command palette, <kbd>s</kbd> cycles through the six skins Hermes ships. Readable without JavaScript. |
| [`field-guide/`](field-guide/) | Which model to use in the main and auxiliary slots, and what each costs. The price table is generated from `upstream.json`, never typed. |
| [`pkm-toolkit/`](pkm-toolkit/) | Four skills and a stdio MCP server that let Hermes work on a local Markdown vault (GTD, PARA, Johnny.Decimal). The filesystem is the database. |

Each part started as its own repository with its own site. They were merged here with their history, and the
old repositories are no longer public.

## The lesson worth keeping

The field guide quoted model prices from a promotional snapshot. The promotion ended, and for weeks five of its six
prices were 80% of the real ones, because nothing was watching. The fix was not correcting the numbers once. Every
fact this repository quotes from upstream (version, installer checksum, model ids and prices) moved into one file,
[`upstream.json`](upstream.json). [`scripts/freshness.mjs`](scripts/freshness.mjs) re-reads all of it from what Nous
publishes, and the build fails when any value has moved, naming the value and the old and new figures:

```
$ node scripts/freshness.mjs
  DRIFT Balanced daily / main — anthropic/claude-sonnet-4.6
        we say:   $2.40/$12.00 per 1M
        upstream: $3.00/$15.00 per 1M
```

## Use what is still useful

```bash
# the PKM skills still install straight from this repository
hermes skills install ponzgpt/hermes-contributions/pkm-toolkit/skills/hermes-pkm

# run the checks locally
npm install && ./scripts/check.sh
```

## How this was made

I'm a vibe coder. I decided what to build, wrote the spec and the rules it had to follow, and tested the result
until it did what I said. AI coding agents wrote the code; I don't write code by hand. Commits under my name were
made by an agent working for me.

## Credit

Nous Research wrote Hermes Agent, its installer and its documentation. This repository is the thin layer one
newcomer needed on top of them.

MIT. See [LICENSE](LICENSE).
