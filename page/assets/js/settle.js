/* The headline does not fade in — it settles, the way an answer does.
   Every character starts as noise and locks into place on its own schedule,
   left to right with a bit of slop, so the line resolves rather than appears.

   `settle` is pure so the test can watch a line converge without a browser. */

const GLYPHS = '/\\|_-=+*<>[]{}#$%&@?!:;~^'

/** Deterministic 0..1 from a character position — no shimmer between frames. */
function jitter(i, len) {
  const x = Math.sin((i + 1) * 12.9898 + len * 78.233) * 43758.5453
  return x - Math.floor(x)
}

/** Fraction of `progress` at which character `i` locks in. */
export function threshold(i, len, spread = 0.45) {
  if (len <= 0) return 0
  const wave = i / len
  return Math.min(0.999, wave * (1 - spread) + jitter(i, len) * spread)
}

/**
 * The line as it looks at `progress` (0..1).
 * Spaces are never noise, so the word shapes are readable the whole way.
 */
export function settle(target, progress, rand = Math.random) {
  if (progress >= 1) return target
  const len = target.length
  let out = ''
  for (let i = 0; i < len; i++) {
    const ch = target[i]
    if (ch === ' ' || ch === '\n') out += ch
    else if (progress > threshold(i, len)) out += ch
    else out += GLYPHS[Math.floor(rand() * GLYPHS.length)]
  }
  return out
}

/** True once every character has locked in. */
export function isSettled(target, progress) {
  return settle(target, progress, () => 0) === target
}

/**
 * Run the settle on an element's text. Returns a stop() so a re-run (a skin
 * change, say) can cancel the one already in flight.
 */
export function runSettle(el, text, { duration = 1400, onDone } = {}) {
  const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    el.textContent = text
    onDone?.()
    return () => {}
  }
  let raf = 0
  const start = performance.now()
  const tick = (now) => {
    const p = Math.min(1, (now - start) / duration)
    el.textContent = settle(text, p)
    if (p < 1) raf = requestAnimationFrame(tick)
    else onDone?.()
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}
