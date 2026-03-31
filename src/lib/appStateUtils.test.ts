import { describe, expect, it } from 'vitest'
import {
  flattenAxisSpec,
  getAxisDisplayLevels,
  insertVarByMode,
  joinAxisSpec,
  moveSelectedRows,
  moveVarInAxis,
  normalizeCode,
  parseAxisSpec,
  removeVarFromAxis,
} from './appStateUtils'

describe('appStateUtils axis helpers', () => {
  it('parses and joins nested axis specs', () => {
    const parsed = parseAxisSpec('Q1 ++ Q2 || Q3')
    expect(parsed).toEqual([['Q1', 'Q3'], ['Q2', 'Q3']])
    expect(joinAxisSpec(parsed)).toBe('Q1 ++ Q2 || Q3')
    expect(flattenAxisSpec(parsed)).toEqual(['Q1', 'Q2', 'Q3'])
    expect(getAxisDisplayLevels(parsed)).toEqual([['Q1', 'Q2'], ['Q3']])
  })

  it('inserts by add and nest modes without duplicating variables', () => {
    const base = parseAxisSpec('Q1 || Q2')
    expect(insertVarByMode(base, 'Q3', 'add', 'Q1')).toEqual([['Q1', 'Q2'], ['Q3']])
    expect(insertVarByMode(base, 'Q3', 'nest', 'Q1')).toEqual([['Q1', 'Q3']])
    expect(insertVarByMode(base, 'Q2', 'add', 'Q1')).toBe(base)
  })

  it('removes and moves variables across levels', () => {
    const base = parseAxisSpec('Q1 ++ Q2 || Q3')
    expect(removeVarFromAxis(base, 'Q2')).toEqual([['Q1', 'Q3'], ['Q3']])
    expect(moveVarInAxis(base, 'Q2', -1)).toEqual([['Q1', 'Q3'], ['Q2', 'Q3']])
    expect(moveVarInAxis(base, 'Q1', 1)).toEqual([['Q3', 'Q1'], ['Q2', 'Q3']])
  })

  it('removes only the clicked nested occurrence when the same variable appears in multiple branches', () => {
    const base = [
      ['SQ1', 'SQ3'],
      ['SQ2', 'SQ3'],
    ]

    expect(removeVarFromAxis(base, 'SQ3', { branchIndex: 1, itemIndex: 1 })).toEqual([
      ['SQ1', 'SQ3'],
      ['SQ2'],
    ])
  })

  it('supports nesting under a specific variable without changing sibling branches', () => {
    const base = parseAxisSpec('SQ19A_O ++ SQ18B')
    const withSq18A = insertVarByMode(base, 'SQ18A', 'nest', 'SQ19A_O')
    const next = insertVarByMode(withSq18A, 'SQ17H', 'nest', 'SQ18B')

    expect(next).toEqual([
      ['SQ19A_O', 'SQ18A'],
      ['SQ18B', 'SQ17H'],
    ])
    expect(getAxisDisplayLevels(next)).toEqual([
      ['SQ19A_O', 'SQ18B'],
      ['SQ18A', 'SQ17H'],
    ])
    expect(joinAxisSpec(next)?.startsWith('__AXIS2__:')).toBe(true)
  })

  it('nesting under one branch does not drag that branchs old child deeper', () => {
    const base = parseAxisSpec('SQ1 ++ SQ2 || SQ3')
    const next = insertVarByMode(base, 'SQ6', 'nest', 'SQ2')

    expect(next).toEqual([
      ['SQ1', 'SQ3'],
      ['SQ2', 'SQ6'],
    ])
    expect(getAxisDisplayLevels(next)).toEqual([
      ['SQ1', 'SQ2'],
      ['SQ3', 'SQ6'],
    ])
  })

  it('keeps add mode at the top level even when the current structure is nested', () => {
    const base = parseAxisSpec('__AXIS2__:[["SQ1","SQ8"]]')
    const next = insertVarByMode(base, 'SQ6', 'add', 'SQ8')

    expect(next).toEqual([
      ['SQ1', 'SQ8'],
      ['SQ6'],
    ])
    expect(getAxisDisplayLevels(next)).toEqual([
      ['SQ1', 'SQ6'],
      ['SQ8'],
    ])
  })
})

describe('appStateUtils data helpers', () => {
  it('normalizes numeric-like codes while preserving text', () => {
    expect(normalizeCode(' 01 ')).toBe('1')
    expect(normalizeCode('A01')).toBe('A01')
    expect(normalizeCode(null)).toBe('')
  })

  it('moves selected rows while preserving grouped selection order', () => {
    const rows = [{ key: 'a' }, { key: 'b' }, { key: 'c' }, { key: 'd' }]
    expect(moveSelectedRows(rows, ['b', 'c'], -1)).toEqual([{ key: 'b' }, { key: 'c' }, { key: 'a' }, { key: 'd' }])
    expect(moveSelectedRows(rows, ['b', 'c'], 1)).toEqual([{ key: 'a' }, { key: 'd' }, { key: 'b' }, { key: 'c' }])
  })
})
