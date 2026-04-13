import { describe, expect, it } from 'vitest'
import { computeCrosstab, computeCrosstabAsync, getPct } from './crosstabEngine'

describe('crosstabEngine', () => {
  const baseData = [
    { q1: '1', q2: 'A' },
    { q1: '1', q2: 'B' },
    { q1: '2', q2: 'A' },
    { q1: '2', q2: 'A' },
    { q1: '', q2: 'A' }, // invalid row (missing q1)
    { q1: '1', q2: '' }, // invalid row (missing q2)
  ]

  it('computeCrosstab counts cells and totals correctly', () => {
    const result = computeCrosstab(
      baseData,
      { rowVar: 'q1', colVar: 'q2', showCount: true, showPercent: true, percentType: 'column' },
      'Q1 Label',
      'Q2 Label',
      ['1', '2'],
      ['A', 'B'],
    )

    expect(result.rowVar).toBe('q1')
    expect(result.colVar).toBe('q2')
    expect(result.rowLabel).toBe('Q1 Label')
    expect(result.colLabel).toBe('Q2 Label')
    expect(result.rowValues).toEqual(['1', '2'])
    expect(result.colValues).toEqual(['A', 'B'])
    expect(result.counts).toEqual([
      [1, 1],
      [2, 0],
    ])
    expect(result.rowTotalsN).toEqual([2, 2])
    expect(result.colTotalsN).toEqual([3, 1])
    expect(result.grandTotal).toBe(4)
  })

  it('computeCrosstab keeps SPSS order and appends unseen values from data', () => {
    const result = computeCrosstab(
      [
        { q1: '1', q2: 'A' },
        { q1: '3', q2: 'C' },
      ],
      { rowVar: 'q1', colVar: 'q2', showCount: true, showPercent: false, percentType: 'total' },
      undefined,
      undefined,
      ['1', '2'],
      ['A', 'B'],
    )

    expect(result.rowValues).toEqual(['1', '2', '3'])
    expect(result.colValues).toEqual(['A', 'B', 'C'])
    expect(result.counts).toEqual([
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, 1],
    ])
  })

  it('computeCrosstab throws when no valid rows remain', () => {
    expect(() =>
      computeCrosstab(
        [{ q1: '', q2: '' }],
        { rowVar: 'q1', colVar: 'q2', showCount: true, showPercent: false, percentType: 'row' },
      ),
    ).toThrow('ไม่มีข้อมูลสำหรับตัวแปร "q1" x "q2"')
  })

  it('getPct supports row / column / total denominator', () => {
    const result = computeCrosstab(
      baseData,
      { rowVar: 'q1', colVar: 'q2', showCount: true, showPercent: false, percentType: 'row' },
      undefined,
      undefined,
      ['1', '2'],
      ['A', 'B'],
    )

    expect(getPct(1, 0, 0, result, 'row')).toBeCloseTo(0.5)
    expect(getPct(2, 1, 0, result, 'column')).toBeCloseTo(2 / 3)
    expect(getPct(1, 0, 1, result, 'total')).toBeCloseTo(1 / 4)
  })

  it('getPct returns 0 when denominator is 0', () => {
    const emptyLike = {
      rowVar: 'r',
      colVar: 'c',
      rowLabel: 'r',
      colLabel: 'c',
      rowValues: ['x'],
      colValues: ['y'],
      counts: [[0]],
      rowTotalsN: [0],
      colTotalsN: [0],
      grandTotal: 0,
    }

    expect(getPct(0, 0, 0, emptyLike, 'row')).toBe(0)
    expect(getPct(0, 0, 0, emptyLike, 'column')).toBe(0)
    expect(getPct(0, 0, 0, emptyLike, 'total')).toBe(0)
  })

  it('computeCrosstabAsync returns same output shape as sync version', async () => {
    const data = Array.from({ length: 520 }, (_, index) => ({
      q1: index % 2 === 0 ? '1' : '2',
      q2: index % 3 === 0 ? 'A' : 'B',
    }))

    const syncResult = computeCrosstab(
      data,
      { rowVar: 'q1', colVar: 'q2', showCount: true, showPercent: true, percentType: 'column' },
      'Sync Q1',
      'Sync Q2',
      ['1', '2'],
      ['A', 'B'],
    )

    const asyncResult = await computeCrosstabAsync(
      data,
      { rowVar: 'q1', colVar: 'q2', showCount: true, showPercent: true, percentType: 'column' },
      'Sync Q1',
      'Sync Q2',
      ['1', '2'],
      ['A', 'B'],
    )

    expect(asyncResult).toEqual(syncResult)
  })

  it('computeCrosstabAsync throws when no valid rows remain', async () => {
    await expect(
      computeCrosstabAsync(
        [{ q1: '', q2: '' }],
        { rowVar: 'q1', colVar: 'q2', showCount: true, showPercent: false, percentType: 'row' },
      ),
    ).rejects.toThrow('ไม่มีข้อมูลสำหรับตัวแปร "q1" x "q2"')
  })
})
