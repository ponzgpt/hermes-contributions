// The field guide, with its price table generated from upstream.json.
//
// The table is not written by hand and never will be again: it is a projection
// of the ledger that scripts/freshness.mjs checks against the live catalogue.
// If the two disagree the build fails, rather than publishing a number nobody
// verified.
import { readFileSync } from 'node:fs'
import { marked } from 'marked'
import { shell } from '../scripts/render-md.mjs'
import { usd } from '../scripts/upstream-lib.mjs'

export function buildFieldGuide(ledger) {
  const rows = ledger.profiles
    .map((p) => `| **${p.slot}** | ${cell(p.main)} | ${cell(p.aux)} | ${p.when} |`)
    .join('\n')

  const table = [
    '| Profile | Main model | Auxiliary / compression | Use it when |',
    '| --- | --- | --- | --- |',
    rows,
    '',
    `USD per 1M input / output tokens, read from the live catalogue on ${ledger.checked}. ` +
      `Checked against Hermes Agent ${ledger.release.version} (${ledger.release.tag}), ` +
      `${ledger.catalogue_size} models listed.`,
  ].join('\n')

  const balanced = ledger.profiles.find((p) => p.slot === 'Balanced daily') ?? ledger.profiles[0]
  const md = readFileSync(new URL('./guide.md', import.meta.url), 'utf8')
    .replace('{{PRICE_TABLE}}', table)
    .replaceAll('{{MAIN_ID}}', balanced.main.id)
    .replaceAll('{{AUX_ID}}', balanced.aux.id)

  return shell({
    title: 'Hermes Field Guide',
    subtitle: 'Which models to point Hermes Agent at, and what they cost today.',
    active: '/field-guide/',
    body: marked.parse(md, { gfm: true }),
  })
}

const cell = (m) => `${m.name}<br><code>${m.id}</code><br>${usd(m.input)} / ${usd(m.output)}`
