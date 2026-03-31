import { describe, expect, it } from 'vitest'
import { computeCrosstab, filterZeroRows, getPct } from './crosstabEngine'

describe('crosstabEngine', () => {
  it('computes counts and percentages from ordered labels', () => {
    const result = computeCrosstab(
      [
        { gender: 'Male', region: 'North' },
        { gender: 'Female', region: 'North' },
        { gender: 'Female', region: 'South' },
      ],
      {
        rowVar: 'gender',
        colVar: 'region',
        showCount: true,
        showPercent: true,
        percentType: 'column',
      },
      'Gender',
      'Region',
      ['Male', 'Female', 'Other'],
      ['North', 'South'],
    )

    expect(result.rowValues).toEqual(['Male', 'Female', 'Other'])
    expect(result.colValues).toEqual(['North', 'South'])
    expect(result.counts).toEqual([
      [1, 0],
      [1, 1],
      [0, 0],
    ])
    expect(getPct(1, 0, 0, result, 'column')).toBe(0.5)
  })

  it('filters zero-total data rows but keeps stat rows', () => {
    const filtered = filterZeroRows({
      rowVar: 'row',
      colVar: 'col',
      rowLabel: 'Row',
      colLabel: 'Col',
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
})
