import { describe, expect, it } from 'vitest'
import {
  SKINS,
  DEFAULT_SKIN,
  applySkin,
  findSkin,
  nextSkin,
  readStoredSkin,
  skinFromQuery,
  skinVars,
} from '../assets/js/skins.js'

/** A localStorage that can be told to throw, like Safari private mode. */
function fakeStorage(initial = {}, { throws = false } = {}) {
  const data = { ...initial }
  return {
    getItem(k) {
      if (throws) throw new Error('denied')
      return k in data ? data[k] : null
    },
    setItem(k, v) {
      if (throws) throw new Error('denied')
      data[k] = v
    },
  }
}

describe('skins', () => {
  it('ships the six skins Hermes has built in', () => {
    expect(SKINS.map((s) => s.slug)).toEqual([
      'nous',
      'mono',
      'slate',
      'cyberpunk',
      'midnight',
      'ember',
    ])
  })

  it('gives every skin a full palette of hex colours', () => {
    for (const skin of SKINS) {
      for (const key of ['bg', 'fg', 'accent', 'ok']) {
        expect(skin[key], `${skin.slug}.${key}`).toMatch(/^#[0-9a-f]{6}$/)
      }
    }
  })

  it('falls back to the default rather than throwing on an unknown slug', () => {
    expect(findSkin('does-not-exist').slug).toBe(DEFAULT_SKIN)
    expect(findSkin(null).slug).toBe(DEFAULT_SKIN)
  })

  it('cycles forwards and backwards through the ring', () => {
    expect(nextSkin('nous').slug).toBe('mono')
    expect(nextSkin('ember').slug).toBe('nous')
    expect(nextSkin('nous', -1).slug).toBe('ember')
  })

  it('paints the custom properties and stamps the slug on the root', () => {
    const root = document.createElement('div')
    const skin = applySkin('cyberpunk', root)
    expect(root.getAttribute('data-skin')).toBe('cyberpunk')
    expect(root.style.getPropertyValue('--bg')).toBe(skin.bg)
    expect(root.style.getPropertyValue('--accent')).toBe(skin.accent)
    expect(skinVars(skin)['--ok']).toBe(skin.ok)
  })

  it('takes a skin from the query string, and ignores a bogus one', () => {
    expect(skinFromQuery('?skin=ember')).toBe('ember')
    expect(skinFromQuery('?skin=chartreuse')).toBe(null)
    expect(skinFromQuery('')).toBe(null)
  })

  it('reads a remembered skin, and survives storage that refuses', () => {
    expect(readStoredSkin(fakeStorage({ 'hermes-skin': 'ember' }))).toBe('ember')
    expect(readStoredSkin(fakeStorage({}, { throws: true }))).toBe(DEFAULT_SKIN)
  })
})
