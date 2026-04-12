import { describe, expect, it } from 'vitest'
import { computeCrosstab, computeCrosstabAsync, filterZeroRows, getPct } from './crosstabEngine'

// ─── computeCrosstab ─────────────────────────────────────────────────────────

describe('computeCrosstab', () => {
  it('computes counts from ordered labels including 0-count values', () => {
    const result = computeCrosstab(
      [
        { gender: 'Male', region: 'North' },
        { gender: 'Female', region: 'North' },
        { gender: 'Female', region: 'South' },
      ],
      { rowVar: 'gender', colVar: 'region', showCount: true, showPercent: true, percentType: 'column' },
      'Gender', 'Region',
      ['Male', 'Female', 'Other'],
      ['North', 'South'],
    )

    expect(result.rowValues).toEqual(['Male', 'Female', 'Other'])
    expect(result.colValues).toEqual(['North', 'South'])
    expect(result.counts).toEqual([[1, 0], [1, 1], [0, 0]])
    expect(result.rowTotalsN).toEqual([1, 2, 0])
    expect(result.colTotalsN).toEqual([2, 1])
    expect(result.grandTotal).toBe(3)
  })

  it('appends unlabeled data values not in spssOrder', () => {
    const result = computeCrosstab(
      [{ q: 'A', r: '1' }, { q: 'B', r: '2' }, { q: 'Z', r: '1' }],
      { rowVar: 'q', colVar: 'r', showCount: true, showPercent: false, percentType: 'column' },
      undefined, undefined,
      ['A', 'B'],   // Z not in spssOrder → appended
      ['1', '2'],
    )

    expect(result.rowValues).toEqual(['A', 'B', 'Z'])
    expect(result.counts[2]).toEqual([1, 0])
  })

  it('throws when no usable data rows exist', () => {
    expect(() => computeCrosstab(
      [{ q: '', r: '1' }],
      { rowVar: 'q', colVar: 'r', showCount: true, showPercent: false, percentType: 'column' },
    )).toThrow()
  })

  it('uses data insertion order when spssOrder is not provided', () => {
    const result = computeCrosstab(
      [{ q: 'B', r: 'X' }, { q: 'A', r: 'X' }],
      { rowVar: 'q', colVar: 'r', showCount: true, showPercent: false, percentType: 'column' },
    )
    // insertion order: B first, then A
    expect(result.rowValues[0]).toBe('B')
    expect(result.rowValues[1]).toBe('A')
  })

  it('sets rowTypes to all data by default', () => {
    const result = computeCrosstab(
      [{ q: 'A', r: '1' }],
      { rowVar: 'q', colVar: 'r', showCount: true, showPercent: false, percentType: 'column' },
    )
    expect(result.rowTypes).toEqual(['data'])
  })

  it('sets rowPaths and colPaths as single-element arrays', () => {
    const result = computeCrosstab(
      [{ q: 'A', r: '1' }],
      { rowVar: 'q', colVar: 'r', showCount: true, showPercent: false, percentType: 'column' },
    )
    expect(result.rowPaths).toEqual([['A']])
    expect(result.colPaths).toEqual([['1']])
  })
})

// ─── computeCrosstabAsync ─────────────────────────────────────────────────────

describe('computeCrosstabAsync', () => {
  it('returns same result as sync version', async () => {
    const data = [
      { q: 'A', r: 'X' },
      { q: 'B', r: 'X' },
      { q: 'A', r: 'Y' },
    ]
    const config = { rowVar: 'q', colVar: 'r', showCount: true, showPercent: false, percentType: 'column' as const }
    const sync = computeCrosstab(data, config, 'Q', 'R', ['A', 'B'], ['X', 'Y'])
    const async_ = await computeCrosstabAsync(data, config, 'Q', 'R', ['A', 'B'], ['X', 'Y'])

    expect(async_.rowValues).toEqual(sync.rowValues)
    expect(async_.colValues).toEqual(sync.colValues)
    expect(async_.counts).toEqual(sync.counts)
    expect(async_.grandTotal).toBe(sync.grandTotal)
  })

  it('throws when no usable data rows exist', async () => {
    await expect(computeCrosstabAsync(
      [{ q: '', r: '1' }],
      { rowVar: 'q', colVar: 'r', showCount: true, showPercent: false, percentType: 'column' as const },
    )).rejects.toThrow()
  })
})

// ─── getPct ──────────────────────────────────────────────────────────────────

describe('getPct', () => {
  const result = computeCrosstab(
    [
      { q: 'A', r: 'X' },
      { q: 'A', r: 'Y' },
      { q: 'B', r: 'X' },
    ],
    { rowVar: 'q', colVar: 'r', showCount: true, showPercent: true, percentType: 'column' },
    undefined, undefined,
    ['A', 'B'], ['X', 'Y'],
  )
  // counts: A=[1,1], B=[1,0]  rowTotalsN=[2,1]  colTotalsN=[2,1]  grand=3

  it('column %: n / colTotal', () => {
    expect(getPct(1, 0, 0, result, 'column')).toBeCloseTo(1 / 2)   // A in X: 1/2
    expect(getPct(1, 1, 0, result, 'column')).toBeCloseTo(1 / 2)   // B in X: 1/2
    expect(getPct(1, 0, 1, result, 'column')).toBeCloseTo(1 / 1)   // A in Y: 1/1
  })

  it('row %: n / rowTotal', () => {
    expect(getPct(1, 0, 0, result, 'row')).toBeCloseTo(1 / 2)   // A in X: 1/2 of A
    expect(getPct(1, 0, 1, result, 'row')).toBeCloseTo(1 / 2)   // A in Y: 1/2 of A
    expect(getPct(1, 1, 0, result, 'row')).toBeCloseTo(1 / 1)   // B in X: 1/1 of B
  })

  it('total %: n / grandTotal', () => {
    expect(getPct(1, 0, 0, result, 'total')).toBeCloseTo(1 / 3)   // A in X: 1/3
    expect(getPct(1, 1, 0, result, 'total')).toBeCloseTo(1 / 3)   // B in X: 1/3
  })

  it('returns 0 when denom is 0', () => {
    const empty = { ...result, grandTotal: 0, colTotalsN: [0, 0], rowTotalsN: [0, 0] }
    expect(getPct(0, 0, 0, empty, 'total')).toBe(0)
    expect(getPct(0, 0, 0, empty, 'column')).toBe(0)
    expect(getPct(0, 0, 0, empty, 'row')).toBe(0)
  })
})

// ─── filterZeroRows ───────────────────────────────────────────────────────────

describe('filterZeroRows', () => {
  it('filters zero-total data rows but keeps stat rows', () => {
    const filtered = filterZeroRows({
      rowVar: 'row', colVar: 'col', rowLabel: 'Row', colLabel: 'Col',
      rowValues: ['A', 'Mean', 'B'],
      colValues: ['X'],
      rowTypes: ['data', 'stat', 'data'],
      counts: [[0], [5], [2]],
      rowTotalsN: [0, 5, 2],
      colTotalsN: [7],
      grandTotal: 7,
    }, true)

    expect(filtered.rowValues).toEqual(['Mean', 'B'])
    expect(filtered.rowTypes).toEqual(['stat', 'data'])
  })

  it('returns original reference when hideZeroRows=false', () => {
    const result = {
      rowVar: 'r', colVar: 'c', rowLabel: 'R', colLabel: 'C',
      rowValues: ['A'], colValues: ['X'], rowTypes: ['data' as const],
      counts: [[0]], rowTotalsN: [0], colTotalsN: [0], grandTotal: 0,
    }
    expect(filterZeroRows(result, false)).toBe(result)
  })

  it('returns original reference when all rows have data (nothing to remove)', () => {
    const result = {
      rowVar: 'r', colVar: 'c', rowLabel: 'R', colLabel: 'C',
      rowValues: ['A', 'B'], colValues: ['X'],
      rowTypes: ['data' as const, 'data' as const],
      counts: [[1], [2]], rowTotalsN: [1, 2], colTotalsN: [3], grandTotal: 3,
    }
    expect(filterZeroRows(result, true)).toBe(result)
  })

  it('defaults rowTypes to all-data when not provided', () => {
    const filtered = filterZeroRows({
      rowVar: 'r', colVar: 'c', rowLabel: 'R', colLabel: 'C',
      rowValues: ['A', 'B'], colValues: ['X'],
      counts: [[0], [1]], rowTotalsN: [0, 1], colTotalsN: [1], grandTotal: 1,
    }, true)

    expect(filtered.rowValues).toEqual(['B'])
  })

  it('remaps rowPaths after filtering', () => {
    const filtered = filterZeroRows({
      rowVar: 'r', colVar: 'c', rowLabel: 'R', colLabel: 'C',
      rowValues: ['A', 'B', 'C'], colValues: ['X'],
      rowTypes: ['data', 'data', 'data'],
      rowPaths: [['A'], ['B'], ['C']],
      counts: [[0], [1], [2]], rowTotalsN: [0, 1, 2], colTotalsN: [3], grandTotal: 3,
    }, true)

    expect(filtered.rowPaths).toEqual([['B'], ['C']])
  })

  it('remaps rowSectionBases after filtering', () => {
    const filtered = filterZeroRows({
      rowVar: 'r', colVar: 'c', rowLabel: 'R', colLabel: 'C',
      rowValues: ['A', 'B', 'C', 'D'], colValues: ['X'],
      rowTypes: ['data', 'data', 'data', 'data'],
      counts: [[1], [0], [0], [2]], rowTotalsN: [1, 0, 0, 2], colTotalsN: [3], grandTotal: 3,
      rowSectionBases: [
        { startIndex: 0, label: 'Sec1', totalN: 1, colTotalsN: [1] },
        { startIndex: 2, label: 'Sec2', totalN: 2, colTotalsN: [2] },
      ],
    }, true)

    // A remains at 0, D remains at 1
    expect(filtered.rowValues).toEqual(['A', 'D'])
    expect(filtered.rowSectionBases?.[0].startIndex).toBe(0)
    expect(filtered.rowSectionBases?.[1].startIndex).toBe(1)
  })
})
