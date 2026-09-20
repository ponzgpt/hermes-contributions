// @vitest-environment node
// The freshness check is the one thing the four old repos did not have, so the
// failure that matters is not "a price moved" — it is "a price moved and the
// check stayed quiet". These drive compare() against a synthetic upstream.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { compare } from '../scripts/upstream-lib.mjs'

const ledger = JSON.parse(readFileSync(join(process.cwd(), 'upstream.json'), 'utf8'))

// Upstream as it is right now, according to the ledger: everything agrees.
const agreeing = () => ({
  version: ledger.release.version,
  tag: ledger.release.tag,
  installerSha: ledger.installer.sha256,
  mirrorSha: ledger.installer.sha256,
  catalogue: ledger.profiles
    .flatMap((p) => [p.main, p.aux])
    .map((m) => ({
      id: m.id,
      pricing: { prompt: String(m.input / 1e6), completion: String(m.output / 1e6) },
    })),
  docsIndex: 'https://hermes-agent.nousresearch.com/docs/user-guide/cli',
  docLinks: ['https://hermes-agent.nousresearch.com/docs/user-guide/cli'],
})

describe('compare', () => {
  it('says nothing when upstream still matches what we publish', () => {
    expect(compare(ledger, agreeing())).toEqual([])
  })

  it('catches a new Hermes release', () => {
    const f = compare(ledger, { ...agreeing(), version: 'v0.22.0', tag: 'v2026.10.1' })
    expect(f).toHaveLength(1)
    expect(f[0].what).toBe('release version')
    expect(f[0].upstream).toContain('v0.22.0')
  })

  it('catches the installer changing under the URL we tell people to pipe', () => {
    const f = compare(ledger, {
      ...agreeing(),
      installerSha: 'f'.repeat(64),
      mirrorSha: 'f'.repeat(64),
    })
    expect(f.map((x) => x.what)).toContain('installer contents')
  })

  it('catches the quoted URL drifting away from what Nous ships on GitHub', () => {
    const f = compare(ledger, { ...agreeing(), mirrorSha: 'a'.repeat(64) })
    expect(f.map((x) => x.what)).toContain('installer mirror')
  })

  // The actual rot that shipped: a promo expired and every price on the page
  // became 80% of the real one, silently, for weeks.
  it('catches an expired promo price', () => {
    const live = agreeing()
    live.catalogue = live.catalogue.map((m) => ({
      ...m,
      pricing: {
        prompt: String(Number(m.pricing.prompt) * 1.25),
        completion: String(Number(m.pricing.completion) * 1.25),
      },
    }))
    const f = compare(ledger, live)
    expect(f.length).toBeGreaterThan(0)
    expect(f.every((x) => x.what.includes('/'))).toBe(true)
    expect(f[0].quoted).toMatch(/^\$/)
  })

  it('catches a model leaving the catalogue', () => {
    const live = agreeing()
    live.catalogue = live.catalogue.filter((m) => m.id !== ledger.profiles[0].main.id)
    expect(
      compare(ledger, live).some((x) =>
        x.upstream.includes('no longer in the Nous Portal catalogue')
      )
    ).toBe(true)
  })

  it('catches a docs page that moved out of upstream’s own index', () => {
    const live = {
      ...agreeing(),
      docLinks: ['https://hermes-agent.nousresearch.com/docs/user-guide/gone'],
    }
    expect(compare(ledger, live).some((x) => x.what === 'docs link')).toBe(true)
  })
})
