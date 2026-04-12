/**
 * Tests for materializeColumnAugment — the S6 column injection logic
 * extracted to a pure TypeScript function.
 */
import { describe, expect, it } from 'vitest'
import { materializeColumnAugment, type ColumnAugment } from './columnAugment'
import type { CrosstabResult } from './crosstabEngine'

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeResult(colValues: string[], counts: number[][]): CrosstabResult {
  return {
    rowVar: 'R', colVar: 'C',
    rowLabel: 'Row', colLabel: 'Col',
    rowValues: counts.map((_, i) => `r${i}`),
    colValues,
    colPaths: colValues.map(v => [v]),
    counts,
    rowTotalsN: counts.map(row => row.reduce((s, n) => s + n, 0)),
    colTotalsN: colValues.map((_, ci) => counts.reduce((s, row) => s + (row[ci] ?? 0), 0)),
    grandTotal: counts.reduce((s, row) => s + row.reduce((rs, n) => rs + n, 0), 0),
  }
}

// ─── no-op cases ─────────────────────────────────────────────────────────────

describe('materializeColumnAugment › no-op', () => {
  const result = makeResult(['A', 'B'], [[1, 2]])

  it('returns original when colAug is null', () => {
    expect(materializeColumnAugment(result, null)).toBe(result)
  })

  it('returns original when specs array is empty', () => {
    expect(materializeColumnAugment(result, { specs: [] })).toBe(result)
  })

  it('skips specs that are not kind=summary', () => {
    const aug: ColumnAugment = { specs: [{ kind: 'summary', label: 'T2B', memberIndexes: [] }] }
    // memberIndexes empty → skipped
    expect(materializeColumnAugment(result, aug).colValues).toEqual(['A', 'B'])
  })
})

// ─── single summary appended at end ──────────────────────────────────────────

describe('materializeColumnAugment › append at end', () => {
  /**
   * colValues: ['1', '2', '3', '4', '5']
   * counts (1 row): [10, 20, 30, 40, 50]
   * T2B = cols 4+5 (indexes 3,4) → total=90, appended
   */
  const result = makeResult(
    ['1', '2', '3', '4', '5'],
    [[10, 20, 30, 40, 50]],
  )
  const aug: ColumnAugment = {
    specs: [{ kind: 'summary', label: 'T2B', memberIndexes: [3, 4] }],
  }
  const out = materializeColumnAugment(result, aug)

  it('appends new column label', () => {
    expect(out.colValues).toEqual(['1', '2', '3', '4', '5', 'T2B'])
  })

  it('sums colTotalsN from member indexes', () => {
    expect(out.colTotalsN[5]).toBe(90)   // 40+50
  })

  it('sums row counts from member indexes', () => {
    expect(out.counts[0][5]).toBe(90)
  })

  it('appends single-element colPath', () => {
    expect(out.colPaths?.[5]).toEqual(['T2B'])
  })

  it('does not mutate the original result', () => {
    expect(result.colValues).toEqual(['1', '2', '3', '4', '5'])
    expect(result.counts[0]).toHaveLength(5)
  })
})

// ─── insertBoundary — insert before a specific column ────────────────────────

describe('materializeColumnAugment › insertBoundary', () => {
  /**
   * colValues: ['A', 'B', 'C']
   * Insert TB (index 0 member) before column 0 → TB should come FIRST
   */
  const result = makeResult(['A', 'B', 'C'], [[10, 20, 30]])
  const aug: ColumnAugment = {
    specs: [{ kind: 'summary', label: 'TB', memberIndexes: [0], insertBoundary: 0 }],
  }
  const out = materializeColumnAugment(result, aug)

  it('inserts at the correct position', () => {
    expect(out.colValues).toEqual(['TB', 'A', 'B', 'C'])
  })

  it('colTotalsN at inserted position is correct', () => {
    expect(out.colTotalsN[0]).toBe(10)   // member index 0 original = 10
  })

  it('original columns shift right', () => {
    expect(out.colValues[1]).toBe('A')
    expect(out.colValues[2]).toBe('B')
  })
})

// ─── multiple specs with ordering ────────────────────────────────────────────

describe('materializeColumnAugment › multiple specs', () => {
  /**
   * Scale 1-5, high-good: TB (col 4), T2B (cols 3+4) inserted after last column
   * Expected final order: ['1','2','3','4','5','T2B','TB'] if T2B has lower insertOrder
   * or ['1','2','3','4','5','TB','T2B'] if TB comes first.
   *
   * Both have insertBoundary=5 (append). TB insertOrder=10, T2B insertOrder=20 → TB first.
   */
  const result = makeResult(['1', '2', '3', '4', '5'], [[5, 10, 15, 20, 25]])
  const aug: ColumnAugment = {
    specs: [
      { kind: 'summary', label: 'T2B', memberIndexes: [3, 4], insertOrder: 20 },
      { kind: 'summary', label: 'TB',  memberIndexes: [4],    insertOrder: 10 },
    ],
  }
  const out = materializeColumnAugment(result, aug)

  it('inserts lower insertOrder first', () => {
    expect(out.colValues[5]).toBe('TB')
    expect(out.colValues[6]).toBe('T2B')
  })

  it('TB total = only last column', () => {
    expect(out.colTotalsN[5]).toBe(25)   // col 4 original
  })

  it('T2B total = last two columns', () => {
    expect(out.colTotalsN[6]).toBe(45)   // 20+25
  })

  it('member indexes always reference original positions', () => {
    // Even though TB was inserted at [5], T2B's memberIndexes [3,4] still
    // reference original columns (not shifted positions)
    expect(out.counts[0][6]).toBe(45)
  })
})

// ─── multi-level colPaths (Nested column) ────────────────────────────────────

describe('materializeColumnAugment › multi-level colPaths', () => {
  /**
   * Simulate nested result: colPaths has 2-level paths like ['Nest', 'Scale']
   * groupPath on spec creates path ['Nest', 'T2B']
   */
  const result: CrosstabResult = {
    rowVar: 'R', colVar: 'C',
    rowLabel: 'Row', colLabel: 'Col',
    rowValues: ['r0'],
    colValues: ['Nest / 4', 'Nest / 5'],
    colPaths: [['Nest', '4'], ['Nest', '5']],
    counts: [[10, 20]],
    rowTotalsN: [30],
    colTotalsN: [10, 20],
    grandTotal: 30,
  }
  const aug: ColumnAugment = {
    specs: [{ kind: 'summary', label: 'T2B', memberIndexes: [0, 1], groupPath: ['Nest'] }],
  }
  const out = materializeColumnAugment(result, aug)

  it('builds multi-level path from groupPath + label', () => {
    expect(out.colPaths?.[2]).toEqual(['Nest', 'T2B'])
  })

  it('label is set correctly', () => {
    expect(out.colValues[2]).toBe('T2B')
  })
})

// ─── multi-row counts ─────────────────────────────────────────────────────────

describe('materializeColumnAugment › multiple rows', () => {
  /**
   * 3-row result. T2B sums cols 1+2 per row.
   */
  const result = makeResult(
    ['A', 'B', 'C'],
    [
      [1, 2, 3],   // r0: T2B = 2+3 = 5
      [4, 5, 6],   // r1: T2B = 5+6 = 11
      [7, 8, 9],   // r2: T2B = 8+9 = 17
    ],
  )
  const aug: ColumnAugment = {
    specs: [{ kind: 'summary', label: 'T2B', memberIndexes: [1, 2] }],
  }
  const out = materializeColumnAugment(result, aug)

  it('computes correct T2B count per row', () => {
    expect(out.counts[0][3]).toBe(5)
    expect(out.counts[1][3]).toBe(11)
    expect(out.counts[2][3]).toBe(17)
  })

  it('colTotalsN = sum across all rows', () => {
    expect(out.colTotalsN[3]).toBe(5 + 11 + 17)
  })
})
