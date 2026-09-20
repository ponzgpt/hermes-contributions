// One site out of four parts. Everything served at hermes-contributions.technoir.cloud
// is produced here, from this repo, with no fact typed twice.
//
//   dist/index.html            the page (page/, reframed as the front door)
//   dist/onboarding/index.html onboarding/README.md
//   dist/field-guide/index.html generated from upstream.json
//   dist/pkm-toolkit/index.html pkm-toolkit/README.md
//   dist/0th                   the script, at a URL this repo controls
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderMarkdown } from './render-md.mjs'
import { NOTICE } from './notice.mjs'
import { buildFieldGuide } from '../field-guide/build.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const ledger = JSON.parse(readFileSync(join(ROOT, 'upstream.json'), 'utf8'))

rmSync(DIST, { recursive: true, force: true })
mkdirSync(DIST, { recursive: true })

const write = (rel, html) => {
  mkdirSync(dirname(join(DIST, rel)), { recursive: true })
  writeFileSync(join(DIST, rel), html)
}

// The front door. It is hand-written HTML because it is the part that behaves
// like the CLI; the only thing injected is the notice, so it stays one string.
const page = readFileSync(join(ROOT, 'page/index.html'), 'utf8').replace('{{NOTICE}}', NOTICE)
if (page.includes('{{')) throw new Error('page/index.html has an unfilled placeholder')
write('index.html', page)
cpSync(join(ROOT, 'page/assets'), join(DIST, 'assets'), { recursive: true })

write(
  'onboarding/index.html',
  renderMarkdown({
    markdown: readFileSync(join(ROOT, 'onboarding/README.md'), 'utf8'),
    base: 'onboarding',
    title: 'Onboarding',
    subtitle:
      'The shortest path to a working Hermes Agent, and a script that names the one next step.',
    active: '/onboarding/',
  })
)

write('field-guide/index.html', buildFieldGuide(ledger))

write(
  'pkm-toolkit/index.html',
  renderMarkdown({
    markdown: readFileSync(join(ROOT, 'pkm-toolkit/README.md'), 'utf8'),
    base: 'pkm-toolkit',
    title: 'PKM toolkit',
    subtitle: 'Skills and a stdio MCP server that let Hermes Agent work on a local Markdown vault.',
    active: '/pkm-toolkit/',
  })
)

// The one URL people may already have piped into a shell now has a twin on a
// domain this repo controls, so the next move does not break anybody.
cpSync(join(ROOT, 'onboarding/0th'), join(DIST, '0th'))

console.log(
  `dist/ built — Hermes Agent ${ledger.release.version}, ledger checked ${ledger.checked}`
)
