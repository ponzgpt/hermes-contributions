// Fails when something this repo quotes about Hermes Agent stopped being true.
//
// Three of the four repos that folded in here stated a version, an installer
// command or a price and then quietly went out of date — the field guide's
// prices were a promo snapshot that expired, so five of its six numbers were
// 80% of the real one and nothing anywhere said so. A page that rots silently
// is worse than no page. This is the thing that makes noise instead.
//
// The judgement lives in upstream-lib.mjs `compare()` and is unit-tested
// offline; this file only fetches and prints.
//
//   node scripts/freshness.mjs          # fail on any drift
//   SKIP_FRESHNESS=1 ./scripts/check.sh # only when upstream is unreachable
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { SOURCES, compare } from './upstream-lib.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const ledger = JSON.parse(readFileSync(join(ROOT, 'upstream.json'), 'utf8'))

const get = async (url, as = 'text') => {
  const r = await fetch(url, { headers: { 'user-agent': 'hermes-contributions/freshness' } })
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`)
  return as === 'json' ? r.json() : r.text()
}

// Every Hermes docs page this repo links, found rather than listed: a link
// added to a page tomorrow is checked tomorrow, with nothing to remember.
const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    // tests/ names URLs that are deliberately wrong, to prove this check fires.
    if (['.git', 'node_modules', '.venv', 'dist', '__pycache__', 'tests'].includes(n)) return []
    const p = join(dir, n)
    return statSync(p).isDirectory()
      ? walk(p)
      : ['.md', '.html', '.mjs', '.js', '.json', '.sh', ''].includes(extname(n))
        ? [p]
        : []
  })

const docLinks = new Set()
for (const f of walk(ROOT)) {
  for (const m of readFileSync(f, 'utf8').matchAll(
    /https:\/\/hermes-agent\.nousresearch\.com\/docs\/[A-Za-z0-9/_.-]+/g
  )) {
    const url = m[0].replace(/\/$/, '')
    if (!url.endsWith('.txt')) docLinks.add(url) // llms.txt is the index; it does not list itself
  }
}

const sha = (s) => createHash('sha256').update(s).digest('hex')
let live
try {
  const [release, installer, mirror, models, docsIndex] = await Promise.all([
    get(SOURCES.release, 'json'),
    get(SOURCES.installer),
    get(SOURCES.installerMirror),
    get(SOURCES.models, 'json'),
    get(SOURCES.docsIndex),
  ])
  live = {
    version: (release.name.match(/v\d+\.\d+\.\d+/) || [release.tag_name])[0],
    tag: release.tag_name,
    installerSha: sha(installer),
    mirrorSha: sha(mirror),
    catalogue: models.data,
    docsIndex,
    docLinks: [...docLinks].sort(),
  }
} catch (e) {
  // Unreachable upstream is not the same as drift and must not read like it.
  console.error(`\nfreshness: could not reach upstream — ${e.message}`)
  console.error('If that is the network and not Nous, re-run; to ship anyway: SKIP_FRESHNESS=1\n')
  process.exit(2)
}

const findings = compare(ledger, live)
console.log(
  `\nUpstream freshness  (ledger checked ${ledger.checked}, ${live.catalogue.length} models live)`
)
if (!findings.length) {
  console.log(
    `  ok    Hermes Agent ${live.version} (${live.tag}), installer, ${ledger.profiles.length} price profiles, ${live.docLinks.length} docs links`
  )
  console.log('\nEverything this repo quotes still matches upstream.\n')
  process.exit(0)
}
for (const f of findings) {
  console.log(`  DRIFT ${f.what}`)
  console.log(`        we say:   ${f.quoted}`)
  console.log(`        upstream: ${f.upstream}`)
}
console.log(
  `\n${findings.length} thing(s) we quote are out of date. Run: node scripts/refresh-upstream.mjs\n`
)
process.exit(1)
