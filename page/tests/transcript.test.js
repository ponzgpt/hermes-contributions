import { describe, expect, it } from 'vitest'
import { cost, frame, totalCost } from '../assets/js/transcript.js'

const LINES = [
  { kind: 'in', text: 'hello' },
  { kind: 'tool', text: '⟐ memory.search' },
  { kind: 'out', text: 'Found three.' },
]

describe('transcript playback', () => {
  it('charges typed lines by the character and the rest a single tick', () => {
    expect(cost(LINES[0])).toBe(5)
    expect(cost(LINES[1])).toBe(1)
    expect(totalCost(LINES)).toBe(7)
  })

  it('shows nothing at tick 0 and everything at the end', () => {
    expect(frame(LINES, 0)).toEqual([])
    expect(frame(LINES, totalCost(LINES))).toEqual(LINES)
  })

  it('types the input line one character at a time', () => {
    expect(frame(LINES, 3)).toEqual([{ kind: 'in', text: 'hel' }])
  })

  it('lands agent and tool lines whole, never half-typed', () => {
    const shown = frame(LINES, 6)
    expect(shown).toHaveLength(2)
    expect(shown[1]).toEqual(LINES[1])
  })

  it('never runs past the end, and clamps a negative tick', () => {
    expect(frame(LINES, 999)).toEqual(LINES)
    expect(frame(LINES, -5)).toEqual([])
  })
})
