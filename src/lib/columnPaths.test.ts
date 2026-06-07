import { describe, expect, it } from 'vitest'
import { normalizeColumnPaths } from './columnPaths'

describe('normalizeColumnPaths', () => {
  it('keeps existing paths and fills missing paths from column values', () => {
    expect(normalizeColumnPaths(['A', 'B', 'C'], [['Group', 'A']])).toEqual([
      ['Group', 'A'],
      ['B'],
      ['C'],
    ])
  })

  it('treats empty paths as missing', () => {
    expect(normalizeColumnPaths(['A', 'B'], [[], ['Group', 'B']])).toEqual([
      ['A'],
      ['Group', 'B'],
    ])
  })

  it('copies existing path arrays', () => {
    const original = [['Group', 'A']]
    const normalized = normalizeColumnPaths(['A'], original)
    normalized[0].push('changed')
    expect(original[0]).toEqual(['Group', 'A'])
  })
})
