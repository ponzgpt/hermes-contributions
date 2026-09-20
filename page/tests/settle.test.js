import { describe, expect, it } from 'vitest'
import { isSettled, settle, threshold } from '../assets/js/settle.js'

const TEXT = 'The agent that grows with you'

describe('headline settle', () => {
  it('is fully noise at the start and the real line at the end', () => {
    expect(settle(TEXT, 0, () => 0)).not.toBe(TEXT)
    expect(settle(TEXT, 1)).toBe(TEXT)
  })

  it('never changes the length of the line', () => {
    for (const p of [0, 0.25, 0.5, 0.75, 0.99]) {
      expect(settle(TEXT, p, () => 0)).toHaveLength(TEXT.length)
    }
  })

  it('keeps the spaces, so the word shapes read the whole way through', () => {
    const frame = settle(TEXT, 0.3, () => 0)
    for (let i = 0; i < TEXT.length; i++) {
      if (TEXT[i] === ' ') expect(frame[i]).toBe(' ')
    }
  })

  it('only ever locks more characters in as progress rises', () => {
    const locked = (p) =>
      [...settle(TEXT, p, () => 0)].filter((c, i) => c === TEXT[i] && c !== ' ').length
    let last = -1
    for (const p of [0, 0.2, 0.4, 0.6, 0.8, 0.999]) {
      const n = locked(p)
      expect(n).toBeGreaterThanOrEqual(last)
      last = n
    }
  })

  it('settles by the time progress reaches 1', () => {
    expect(isSettled(TEXT, 0.2)).toBe(false)
    expect(isSettled(TEXT, 1)).toBe(true)
  })

  it('keeps every threshold inside the animation window', () => {
    for (let i = 0; i < TEXT.length; i++) {
      const t = threshold(i, TEXT.length)
      expect(t).toBeGreaterThanOrEqual(0)
      expect(t).toBeLessThan(1)
    }
  })
})
