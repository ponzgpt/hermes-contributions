/* A Hermes session, typed out. The prompt lines type; the agent's lines and the
   tool output land whole, because that is how it actually reads on screen. */

/**
 * @typedef {{ kind: 'in'|'out'|'tool'|'note', text: string }} Line
 */

/** Characters a line costs to reveal: typed lines cost their length, the rest 1. */
export function cost(line) {
  return line.kind === 'in' ? Math.max(1, line.text.length) : 1
}

export function totalCost(lines) {
  return lines.reduce((n, l) => n + cost(l), 0)
}

/**
 * The transcript at `tick` characters in: complete lines, plus the one mid-type.
 * Lines not yet reached are absent, so the block grows downward.
 */
export function frame(lines, tick) {
  const out = []
  let left = Math.max(0, tick)
  for (const line of lines) {
    const c = cost(line)
    if (left >= c) {
      out.push(line)
      left -= c
      continue
    }
    if (line.kind === 'in' && left > 0) out.push({ ...line, text: line.text.slice(0, left) })
    return out
  }
  return out
}

/** Play a transcript into a <pre>, one animation step at a time. Returns stop(). */
export function play(el, lines, { render, speed = 1.6, onDone } = {}) {
  const end = totalCost(lines)
  const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    render(el, lines, true)
    onDone?.()
    return () => {}
  }
  let tick = 0
  let raf = 0
  let last = 0
  const step = (now) => {
    if (!last) last = now
    tick += ((now - last) / 16.7) * speed
    last = now
    const done = tick >= end
    render(el, frame(lines, Math.floor(tick)), done)
    if (!done) raf = requestAnimationFrame(step)
    else onDone?.()
  }
  raf = requestAnimationFrame(step)
  return () => cancelAnimationFrame(raf)
}
