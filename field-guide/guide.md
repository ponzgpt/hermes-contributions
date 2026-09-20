# Hermes Field Guide

The four chapters of the old guide that said what the official docs already say
were deleted. This is what is left: the part that took real work, and that the
docs deliberately do not do, because a vendor cannot tell you which of its own
models to buy.

## Why the auxiliary slots are the whole question

Hermes has a **main model** for the visible agent loop, and separate
**auxiliary slots** for the side jobs: context compression, vision, web
extraction, approvals, session titles. Every auxiliary slot defaults to the main
model unless you override it.

That default is convenient, and it is how people accidentally spend real money
having a frontier model write conversation titles. Compression in particular
runs constantly and on long inputs. Setting one cheap auxiliary model is the
single highest-leverage line in `config.yaml`.

```yaml
model:
  provider: 'nous'
  default: '{{MAIN_ID}}'
auxiliary:
  compression:
    model: '{{AUX_ID}}'
  web_extract:
    model: '{{AUX_ID}}'
  vision:
    model: '{{AUX_ID}}'
```

Prefer `hermes model` over hand-editing that file while you are learning: the
wizard also sets the context length and the auth mode, and both are easy to get
silently wrong.

## Four starting combinations

{{PRICE_TABLE}}

These are starting points, not rankings. **Do not read "cheap auxiliary" as
"always good enough"** — compression and web extraction can drop details that
mattered, and you will not be told. Test a proposed auxiliary model against your
own workload before you trust it with a long session.

## Where these numbers come from

Every price above is read from the
[Nous Portal catalogue](https://inference-api.nousresearch.com/v1/models) and
written into `upstream.json`. `scripts/freshness.mjs` re-reads the catalogue and
**fails the build** if any of them has moved, so this table is either correct or
this site does not deploy.

That check exists because of this exact page. The version of it that shipped in
`ponzgpt/hermes-launch` recorded a promotional discount, the promotion ended,
and five of its six prices quietly became 80% of the real ones for weeks. Nobody
noticed, because nothing was watching. Now something is.

The catalogue is the source of truth for what a model costs; how the slots
behave is upstream's:
[configuring models](https://hermes-agent.nousresearch.com/docs/user-guide/configuring-models).
Portal plans bundle credits, so what you actually pay may be less than the
per-token rate. None of this is financial advice and none of it is a guarantee.

## Pinned ids, never `-latest`

The catalogue publishes `~vendor/model-latest` aliases alongside pinned ids.
This guide names pinned ids only. An alias keeps its name while its price and
its behaviour move underneath you, which is the precise failure this page is
trying not to repeat.
