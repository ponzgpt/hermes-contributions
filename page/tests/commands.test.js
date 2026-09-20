import { describe, expect, it } from 'vitest'
import { COMMANDS, filterCommands, moveIndex, score } from '../assets/js/commands.js'

describe('command palette', () => {
  it('lists everything when the query is empty', () => {
    expect(filterCommands('')).toHaveLength(COMMANDS.length)
  })

  it('ignores a leading slash, so typing /mo works like typing mo', () => {
    expect(filterCommands('/mo')[0].name).toBe('/model')
    expect(filterCommands('mo')[0].name).toBe('/model')
  })

  it('puts an exact match first even when others start with it', () => {
    expect(filterCommands('skin')[0].name).toBe('/skin')
    expect(filterCommands('/help')[0].name).toBe('/help')
  })

  it('prefers a prefix match over a substring match', () => {
    const names = filterCommands('to').map((c) => c.name)
    expect(names[0]).toBe('/tools')
    expect(names).toContain('/stop') // matched on its description
  })

  it('falls back to descriptions so plain words still find a command', () => {
    expect(filterCommands('voice').map((c) => c.name)).toContain('/voice on')
  })

  it('returns nothing for a query no command answers', () => {
    expect(filterCommands('zzzz')).toEqual([])
    expect(score({ name: '/model', desc: 'x' }, 'zzzz')).toBe(0)
  })

  it('wraps the selection at both ends, and stays put on an empty list', () => {
    expect(moveIndex(0, -1, 5)).toBe(4)
    expect(moveIndex(4, 1, 5)).toBe(0)
    expect(moveIndex(0, 1, 0)).toBe(0)
  })
})
