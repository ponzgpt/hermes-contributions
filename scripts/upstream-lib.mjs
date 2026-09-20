// What "upstream" means, in one place: where the facts come from, which models
// the field guide recommends, and how to read a price out of the catalogue.
// Shared by refresh-upstream.mjs (writes upstream.json) and freshness.mjs
// (fails when upstream.json no longer matches) so the two cannot disagree.

export const SOURCES = {
  release: 'https://api.github.com/repos/NousResearch/hermes-agent/releases/latest',
  installer: 'https://hermes-agent.nousresearch.com/install.sh',
  installerMirror:
    'https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh',
  models: 'https://inference-api.nousresearch.com/v1/models',
  docsIndex: 'https://hermes-agent.nousresearch.com/docs/llms.txt',
}

// The four starting combinations the field guide recommends. Pinned ids, never
// the `~vendor/model-latest` aliases: an alias keeps its name while its price
// and its behaviour move underneath you, which is the whole failure this repo
// is trying not to repeat.
export const PROFILES = [
  {
    slot: 'Low-cost learner',
    main: 'deepseek/deepseek-v4-flash',
    aux: 'deepseek/deepseek-v4-flash',
    when: 'You are learning the loop, the tools and the prompts. Burn tokens, not money.',
  },
  {
    slot: 'Balanced daily',
    main: 'anthropic/claude-sonnet-4.6',
    aux: 'google/gemini-3.1-flash-lite',
    when: 'You want reliable tool use without paying the main model to write titles.',
  },
  {
    slot: 'Quality first',
    main: 'anthropic/claude-opus-4.6',
    aux: 'google/gemini-3.1-flash-lite',
    when: 'The task is hard and failure costs more than tokens do.',
  },
  {
    slot: 'Long-context work',
    main: 'google/gemini-3.1-pro-preview',
    aux: 'google/gemini-3.1-flash-lite',
    when: 'Large documents, or sessions that run all day.',
  },
]

export const findModel = (catalogue, id) => catalogue.find((m) => m.id === id)

// The catalogue prices per token; every human-facing number here is per 1M.
export const perMillion = (m) => [
  Number((Number(m.pricing.prompt) * 1e6).toFixed(4)),
  Number((Number(m.pricing.completion) * 1e6).toFixed(4)),
]

export const usd = (n) => `$${n.toFixed(2)}`

// The whole freshness judgement, as a pure function, so it can be tested
// without the network: given what we say (the ledger) and what upstream says
// (already fetched), list everything that no longer matches.
//
//   live = { version, tag, installerSha, mirrorSha, catalogue, docsIndex, docLinks }
export function compare(ledger, live) {
  const out = []
  const drift = (what, quoted, upstream) => out.push({ what, quoted, upstream })

  if (live.version !== ledger.release.version || live.tag !== ledger.release.tag) {
    drift(
      'release version',
      `${ledger.release.version} (${ledger.release.tag})`,
      `${live.version} (${live.tag})`
    )
  }
  if (live.installerSha !== ledger.installer.sha256) {
    drift(
      'installer contents',
      `sha256 ${ledger.installer.sha256.slice(0, 12)}…`,
      `sha256 ${live.installerSha.slice(0, 12)}… — refresh and read it`
    )
  }
  if (live.installerSha !== live.mirrorSha) {
    drift(
      'installer mirror',
      ledger.installer.url,
      `${SOURCES.installerMirror} now differs — quote the mirror instead`
    )
  }
  for (const p of ledger.profiles) {
    for (const role of ['main', 'aux']) {
      const q = p[role]
      const m = findModel(live.catalogue, q.id)
      if (!m) {
        drift(`${p.slot} / ${role}`, q.id, 'no longer in the Nous Portal catalogue')
        continue
      }
      const [i, o] = perMillion(m)
      if (i !== q.input || o !== q.output) {
        drift(
          `${p.slot} / ${role} — ${q.id}`,
          `${usd(q.input)}/${usd(q.output)} per 1M`,
          `${usd(i)}/${usd(o)} per 1M`
        )
      }
    }
  }
  for (const url of live.docLinks) {
    if (!live.docsIndex.includes(url))
      drift('docs link', url, 'not in llms.txt — the page moved or was renamed')
  }
  return out
}
