import { describe, expect, it } from 'vitest'
import {
  flattenAxisSpec,
  getAxisDisplayLevels,
  insertTopLevelBranchAt,
  insertVarByMode,
  joinAxisSpec,
  moveAxisOccurrenceToTarget,
  moveSelectedRows,
  moveVarInAxis,
  normalizeCode,
  parseAxisSpec,
  removeVarFromAxis,
} from './appStateUtils'

// ─── parseAxisSpec / joinAxisSpec / flattenAxisSpec / getAxisDisplayLevels ────

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

  it('moveVarInAxis reorders add-mode SIDE/TOP (one variable per branch)', () => {
    const addStyle: string[][] = [['SQ1'], ['SQ3'], ['SQ2']]
    expect(flattenAxisSpec(addStyle)).toEqual(['SQ1', 'SQ3', 'SQ2'])
    let s = moveVarInAxis(addStyle, 'SQ2', -1)
    expect(s).toEqual([['SQ1'], ['SQ2'], ['SQ3']])
    s = moveVarInAxis(s, 'SQ2', -1)
    expect(s).toEqual([['SQ2'], ['SQ1'], ['SQ3']])
    expect(moveVarInAxis(addStyle, 'SQ1', 1)).toEqual([['SQ3'], ['SQ1'], ['SQ2']])
  })

  it('removes only the clicked nested occurrence when the same variable appears in multiple branches', () => {
    const base = [['SQ1', 'SQ3'], ['SQ2', 'SQ3']]
    expect(removeVarFromAxis(base, 'SQ3', { branchIndex: 1, itemIndex: 1 })).toEqual([
      ['SQ1', 'SQ3'],
      ['SQ2'],
    ])
  })

  it('supports nesting under a specific variable without changing sibling branches', () => {
    const base = parseAxisSpec('SQ19A_O ++ SQ18B')
    const withSq18A = insertVarByMode(base, 'SQ18A', 'nest', 'SQ19A_O')
    const next = insertVarByMode(withSq18A, 'SQ17H', 'nest', 'SQ18B')

    expect(next).toEqual([['SQ19A_O', 'SQ18A'], ['SQ18B', 'SQ17H']])
    expect(getAxisDisplayLevels(next)).toEqual([['SQ19A_O', 'SQ18B'], ['SQ18A', 'SQ17H']])
    expect(joinAxisSpec(next)?.startsWith('__AXIS2__:')).toBe(true)
  })

  it('nesting under one branch does not drag that branchs old child deeper', () => {
    const base = parseAxisSpec('SQ1 ++ SQ2 || SQ3')
    const next = insertVarByMode(base, 'SQ6', 'nest', 'SQ2')

    expect(next).toEqual([['SQ1', 'SQ3'], ['SQ2', 'SQ6']])
    expect(getAxisDisplayLevels(next)).toEqual([['SQ1', 'SQ2'], ['SQ3', 'SQ6']])
  })

  it('keeps add mode at the top level even when the current structure is nested', () => {
    const base = parseAxisSpec('__AXIS2__:[["SQ1","SQ8"]]')
    const next = insertVarByMode(base, 'SQ6', 'add', 'SQ8')

    expect(next).toEqual([['SQ1', 'SQ8'], ['SQ6']])
    expect(getAxisDisplayLevels(next)).toEqual([['SQ1', 'SQ6'], ['SQ8']])
  })
})

// ─── insertTopLevelBranchAt ───────────────────────────────────────────────────

describe('insertTopLevelBranchAt', () => {
  it('appends a new single-var branch when index is omitted', () => {
    const base = [['A'], ['B']]
    expect(insertTopLevelBranchAt(base, 'C')).toEqual([['A'], ['B'], ['C']])
  })

  it('inserts at specific index', () => {
    const base = [['A'], ['C']]
    expect(insertTopLevelBranchAt(base, 'B', 1)).toEqual([['A'], ['B'], ['C']])
  })

  it('inserts at index 0 (prepend)', () => {
    const base = [['A'], ['B']]
    expect(insertTopLevelBranchAt(base, 'Z', 0)).toEqual([['Z'], ['A'], ['B']])
  })

  it('clamps out-of-range index to end', () => {
    const base = [['A'], ['B']]
    const result = insertTopLevelBranchAt(base, 'C', 999)
    expect(result[result.length - 1]).toEqual(['C'])
  })

  it('no-op when var already exists anywhere in branches', () => {
    const base = [['A', 'B'], ['C']]
    expect(insertTopLevelBranchAt(base, 'B')).toBe(base)
  })
})

// ─── moveAxisOccurrenceToTarget ───────────────────────────────────────────────

describe('moveAxisOccurrenceToTarget', () => {
  it('moves single-item branch downward — inserts at targetBranchIndex in post-removal array', () => {
    // [['A'], ['B'], ['C']] → move A (index 0) targeting C (index 2, before)
    // After removing A's branch: [['B'],['C']] — targetBranchIndex=2 → appends → [['B'],['C'],['A']]
    const base = [['A'], ['B'], ['C']]
    const result = moveAxisOccurrenceToTarget(
      base,
      { branchIndex: 0, itemIndex: 0 },
      { branchIndex: 2, itemIndex: 0, placement: 'before' },
    )
    expect(result).toEqual([['B'], ['C'], ['A']])
  })

  it('moves single-item branch forward — inserts at targetBranchIndex+1 in post-removal array', () => {
    // [['A'], ['B'], ['C']] → move A (index 0) targeting B (index 1, after)
    // After removing A's branch: [['B'],['C']] — targetBranchIndex=1, after → +1=2 → appends → [['B'],['C'],['A']]
    const base = [['A'], ['B'], ['C']]
    const result = moveAxisOccurrenceToTarget(
      base,
      { branchIndex: 0, itemIndex: 0 },
      { branchIndex: 1, itemIndex: 0, placement: 'after' },
    )
    expect(result).toEqual([['B'], ['C'], ['A']])
  })

  it('moves nested item within a branch — before', () => {
    // [['A', 'B', 'C']] → move C before A → [['C', 'A', 'B']]
    const base = [['A', 'B', 'C']]
    const result = moveAxisOccurrenceToTarget(
      base,
      { branchIndex: 0, itemIndex: 2 },
      { branchIndex: 0, itemIndex: 0, placement: 'before' },
    )
    expect(result).toEqual([['C', 'A', 'B']])
  })

  it('moves nested item within a branch — after', () => {
    // [['A', 'B', 'C']] → move A after B → [['B', 'A', 'C']]
    const base = [['A', 'B', 'C']]
    const result = moveAxisOccurrenceToTarget(
      base,
      { branchIndex: 0, itemIndex: 0 },
      { branchIndex: 0, itemIndex: 1, placement: 'after' },
    )
    expect(result).toEqual([['B', 'A', 'C']])
  })

  it('returns original branches when source branch is invalid', () => {
    const base = [['A'], ['B']]
    expect(moveAxisOccurrenceToTarget(base, { branchIndex: 5, itemIndex: 0 }, { branchIndex: 0, itemIndex: 0 }))
      .toBe(base)
  })
})

// ─── data helpers ─────────────────────────────────────────────────────────────

describe('appStateUtils data helpers', () => {
  it('normalizes numeric-like codes while preserving text', () => {
    expect(normalizeCode(' 01 ')).toBe('1')
    expect(normalizeCode('A01')).toBe('A01')
    expect(normalizeCode(null)).toBe('')
    expect(normalizeCode(undefined)).toBe('')
    expect(normalizeCode('')).toBe('')
    expect(normalizeCode('1.00')).toBe('1')
    expect(normalizeCode(42)).toBe('42')
  })

  it('moves selected rows while preserving grouped selection order', () => {
    const rows = [{ key: 'a' }, { key: 'b' }, { key: 'c' }, { key: 'd' }]
    expect(moveSelectedRows(rows, ['b', 'c'], -1)).toEqual([{ key: 'b' }, { key: 'c' }, { key: 'a' }, { key: 'd' }])
    expect(moveSelectedRows(rows, ['b', 'c'], 1)).toEqual([{ key: 'a' }, { key: 'd' }, { key: 'b' }, { key: 'c' }])
  })

  it('moveSelectedRows: no-op when selectedKeys is empty', () => {
    const rows = [{ key: 'a' }, { key: 'b' }]
    expect(moveSelectedRows(rows, [], -1)).toEqual(rows)
  })

  it('moveSelectedRows: no-op when selected rows are already at boundary', () => {
    const rows = [{ key: 'a' }, { key: 'b' }, { key: 'c' }]
    // 'a' is already at top, moving up is no-op
    expect(moveSelectedRows(rows, ['a'], -1)).toEqual(rows)
    // 'c' is already at bottom, moving down is no-op
    expect(moveSelectedRows(rows, ['c'], 1)).toEqual(rows)
  })
})
