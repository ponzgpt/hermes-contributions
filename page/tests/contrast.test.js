import { describe, expect, it } from 'vitest'
import { SKINS } from '../assets/js/skins.js'

/* Hermes' own skin guidance asks for roughly 4.5:1, which is also WCAG AA for
   body text. The derived tokens in style.css are mixes of the four a skin
   declares, so the mix percentages are repeated here: change one there and this
   test tells you which skin fell through the floor. */

const MUTED_MIX = 28 // --muted: color-mix(in srgb, fg, bg 28%)
const EDGE_MIX = 42 // --edge:  color-mix(in srgb, bg, fg 42%)
const AA_TEXT = 4.5
const AA_NON_TEXT = 2.0 // rules and control outlines, which never carry meaning alone

const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
const linear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

function luminance(hex) {
  const [r, g, b] = channels(hex).map(linear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two hex colours. */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** What `color-mix(in srgb, a, b <pct>%)` resolves to. */
function mix(a, b, pct) {
  const [A, B] = [channels(a), channels(b)]
  const t = pct / 100
  return (
    '#' +
    A.map((v, i) =>
      Math.round((v * (1 - t) + B[i] * t) * 255)
        .toString(16)
        .padStart(2, '0')
    ).join('')
  )
}

describe('contrast', () => {
  it('scores a known pair correctly', () => {
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21, 1)
    expect(contrast('#0000f2', '#0000f2')).toBeCloseTo(1, 5)
  })

  it.each(SKINS)('$slug keeps every text role above AA', (skin) => {
    const roles = {
      body: skin.fg,
      strong: mix(skin.fg, '#ffffff', 55),
      muted: mix(skin.fg, skin.bg, MUTED_MIX),
      accent: skin.accent,
      ok: skin.ok,
    }
    for (const [role, colour] of Object.entries(roles)) {
      expect(contrast(colour, skin.bg), `${skin.slug}.${role}`).toBeGreaterThanOrEqual(AA_TEXT)
    }
  })

  it.each(SKINS)('$slug keeps button labels legible on the accent fill', (skin) => {
    // .btn--primary and .nav__cta put --bg on an --accent ground.
    expect(contrast(skin.bg, skin.accent)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it.each(SKINS)('$slug draws control outlines you can actually see', (skin) => {
    expect(contrast(mix(skin.bg, skin.fg, EDGE_MIX), skin.bg)).toBeGreaterThanOrEqual(AA_NON_TEXT)
  })

  it('carries the Nous skin at the tokens Nous publishes', () => {
    const nous = SKINS.find((s) => s.slug === 'nous')
    expect(nous.bg).toBe('#0000f2') // --color-hermes
    expect(nous.fg).toBe('#f5f5f5') // --color-hermes-fg
    expect(nous.accent).toBe('#edff45') // --color-hermes-accent
  })
})
