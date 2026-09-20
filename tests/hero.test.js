// @vitest-environment node
// The page shows a transcript of ./0th. The failure worth catching is the page
// drifting into showing output the script does not produce — an invented
// screenshot on a site whose whole argument is that it does not invent things.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const siteJs = readFileSync(join(process.cwd(), 'page/assets/js/site.js'), 'utf8')
const script = join(process.cwd(), 'onboarding/0th')

/** Run ./0th next against a synthetic machine state. */
function next(home, path = '/usr/bin:/bin') {
  return execFileSync('sh', [script, 'next'], {
    env: { ...process.env, HERMES_HOME: home, NO_COLOR: '1', PATH: path },
    encoding: 'utf8',
  })
}

describe('hero transcript', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hero-'))
  mkdirSync(join(dir, 'hermes-agent'), { recursive: true })

  it('shows what the script prints when the shell has not been reloaded', () => {
    const out = next(dir)
    expect(out).toContain('Hermes is installed, but this shell cannot see it.')
    for (const line of [
      '! Hermes is installed, but this shell cannot see it.',
      'source ~/.bashrc   # or ~/.zshrc, or open a new terminal',
      'This is the number one reason people think the install failed.',
    ]) {
      expect(out).toContain(line)
      expect(siteJs).toContain(line)
    }
  })

  it('shows what the script prints once a provider is set', () => {
    const bin = join(dir, 'bin')
    mkdirSync(bin, { recursive: true })
    writeFileSync(join(bin, 'hermes'), '#!/bin/sh\nexit 0\n', { mode: 0o755 })
    writeFileSync(join(dir, 'config.yaml'), 'model:\n  default: m\n  provider: nous-portal\n')
    const out = next(dir, `${bin}:/usr/bin:/bin`)
    for (const line of [
      'Installed, configured, and a provider is set.',
      'Prove it works before adding anything else:',
    ]) {
      expect(out).toContain(line)
      expect(siteJs).toContain(line)
    }
    rmSync(dir, { recursive: true, force: true })
  })
})
