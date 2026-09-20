/* The six skins Hermes ships (`/skin` in the CLI). Picking one here repaints
   the whole page the way picking one in the CLI repaints the whole session:
   prompt, tool output, status line, the lot.

   The names are the product's. `nous` carries Nous's own published tokens
   (--color-hermes #0000f2, --color-hermes-fg #f5f5f5, --color-hermes-accent
   #edff45); the other five are this site's reading of names the product ships
   without published palettes. Every one clears 4.5:1 for text, which is the
   floor Hermes' own skin guidance asks for. */

export const SKINS = [
  {
    slug: 'nous',
    name: 'Nous',
    note: 'the house blue',
    bg: '#0000f2',
    fg: '#f5f5f5',
    accent: '#edff45',
    ok: '#9dffbe',
  },
  {
    slug: 'mono',
    name: 'Mono',
    note: 'ink and paper',
    bg: '#0a0a0a',
    fg: '#d8d8d8',
    accent: '#ffffff',
    ok: '#a8a8a8',
  },
  {
    slug: 'slate',
    name: 'Slate',
    note: 'quiet, all day',
    bg: '#101820',
    fg: '#c0cad8',
    accent: '#79a6dc',
    ok: '#8fcfa8',
  },
  {
    slug: 'cyberpunk',
    name: 'Cyberpunk',
    note: 'loud on purpose',
    bg: '#0b0014',
    fg: '#e2d2ff',
    accent: '#ff2e97',
    ok: '#00f0ff',
  },
  {
    slug: 'midnight',
    name: 'Midnight',
    note: 'for the long run',
    bg: '#05070f',
    fg: '#a6b3d9',
    accent: '#5a6cff',
    ok: '#6fe3c4',
  },
  {
    slug: 'ember',
    name: 'Ember',
    note: 'warm terminal',
    bg: '#140a06',
    fg: '#e6d2bf',
    accent: '#ff7a2f',
    ok: '#ffc44d',
  },
]

export const DEFAULT_SKIN = 'nous'
export const STORAGE_KEY = 'hermes-skin'

/** The skin for a slug, falling back to the default rather than throwing. */
export function findSkin(slug) {
  return SKINS.find((s) => s.slug === slug) || SKINS.find((s) => s.slug === DEFAULT_SKIN)
}

/** Next skin in the ring — what pressing `s` does. */
export function nextSkin(slug, step = 1) {
  const i = SKINS.findIndex((s) => s.slug === slug)
  const from = i === -1 ? 0 : i
  return SKINS[(from + step + SKINS.length * 2) % SKINS.length]
}

/** The custom properties a skin sets. Pure, so the test can read it back. */
export function skinVars(skin) {
  return {
    '--bg': skin.bg,
    '--fg': skin.fg,
    '--accent': skin.accent,
    '--ok': skin.ok,
  }
}

/** Paint a skin onto a root element. Returns the skin that was applied. */
export function applySkin(slug, root = document.documentElement) {
  const skin = findSkin(slug)
  const vars = skinVars(skin)
  for (const [prop, value] of Object.entries(vars)) root.style.setProperty(prop, value)
  root.setAttribute('data-skin', skin.slug)
  return skin
}

/** Remembered skin, or the default when storage is unavailable or empty. */
export function readStoredSkin(storage = globalThis.localStorage) {
  try {
    const slug = storage && storage.getItem(STORAGE_KEY)
    return findSkin(slug).slug
  } catch {
    return DEFAULT_SKIN
  }
}

/** A skin can be linked: /?skin=ember. The URL wins over what was remembered. */
export function skinFromQuery(search) {
  const slug = new URLSearchParams(search || '').get('skin')
  return slug && SKINS.some((s) => s.slug === slug) ? slug : null
}

export function storeSkin(slug, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, slug)
  } catch {
    /* private mode: the skin just does not survive the reload */
  }
}
