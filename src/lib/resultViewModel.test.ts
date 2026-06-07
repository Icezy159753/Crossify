import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CrosstabConfig, CrosstabResult } from './crosstabEngine'
import {
  buildResultViewModel,
  buildStableResultRowKey,
  normalizeMetricValues,
  validateCrosstabResult,
  warnCrosstabResultIssues,
} from './resultViewModel'

const config: CrosstabConfig = {
  rowVar: 'row',
  colVar: 'col',
  showCount: true,
  showPercent: true,
  percentType: 'column',
}

afterEach(() => {
  vi.restoreAllMocks()
})

function makeResult(patch: Partial<CrosstabResult> = {}): CrosstabResult {
  return {
    rowVar: 'row',
    colVar: 'col',
    rowLabel: 'Row Label',
    colLabel: 'Column Label',
    rowValues: ['A', 'B'],
    colValues: ['X', 'Y'],
    rowTypes: ['data', 'data'],
    rowPaths: [['A'], ['B']],
    colPaths: [['Top', 'X'], ['Top', 'Y']],
    rowLevelLabels: ['Category'],
    colLevelLabels: ['Variable', 'Category'],
    counts: [[1, 2], [3, 4]],
    rowTotalsN: [3, 7],
    colTotalsN: [4, 6],
    grandTotal: 10,
    ...patch,
  }
}

describe('buildResultViewModel', () => {
  it('normalizes shared render/export paths consistently', () => {
    const model = buildResultViewModel(makeResult(), config)

    expect(model.rowPaths).toEqual([['Row Label', 'A'], ['Row Label', 'B']])
    expect(model.colPaths).toEqual([['Top', 'X'], ['Top', 'Y']])
    expect(model.rowLevelLabels).toEqual(['Variable', 'Category'])
    expect(model.colHeaderGroups[0]).toEqual([{ label: 'Top', span: 2 }])
    expect(model.rowSectionBases[0].label).toBe('Row Label')
  })

  it('fills missing column paths from displayed column values', () => {
    const model = buildResultViewModel(makeResult({
      colValues: ['X', 'Y', 'Z'],
      colPaths: [['Top', 'X']],
      counts: [[1, 2, 3], [4, 5, 6]],
      colTotalsN: [5, 7, 9],
      grandTotal: 21,
    }), config)

    expect(model.colPaths).toEqual([['Top', 'X'], ['Y'], ['Z']])
  })
})

describe('buildStableResultRowKey', () => {
  it('does not collide when two rows have the same label', () => {
    const rowValues = ['เจน', 'เจน']
    const rowPaths = [['Row', 'เจน'], ['Row', 'เจน']]
    const rowTypes: Array<'data'> = ['data', 'data']

    expect(buildStableResultRowKey(0, rowValues, rowPaths, rowTypes))
      .not.toBe(buildStableResultRowKey(1, rowValues, rowPaths, rowTypes))
  })
})

describe('normalizeMetricValues', () => {
  it('clamps output length to the displayed metric count', () => {
    expect(normalizeMetricValues([10, 20, 30], 2)).toEqual([10, 20])
    expect(normalizeMetricValues([10], 3)).toEqual([10, 0, 0])
  })
})

describe('validateCrosstabResult', () => {
  it('returns no issues for a consistent result', () => {
    expect(validateCrosstabResult(makeResult())).toEqual([])
  })

  it('reports shape mismatches that would make render/export diverge', () => {
    const issues = validateCrosstabResult(makeResult({
      counts: [[1], [2, 3], [4, 5]],
      rowTotalsN: [1],
      colTotalsN: [1],
      rowPaths: [['A']],
      rowSectionBases: [{ startIndex: 9, label: 'Bad', totalN: 1, colTotalsN: [1] }],
    }))

    expect(issues).toEqual(expect.arrayContaining([
      'counts row length 3 does not match rowValues length 2',
      'counts[0] length 1 does not match colValues length 2',
      'rowTotalsN length 1 does not match rowValues length 2',
      'colTotalsN length 1 does not match colValues length 2',
      'rowPaths length 1 does not match rowValues length 2',
      'rowSectionBases[0].startIndex 9 is outside row range 0-1',
      'rowSectionBases[0].colTotalsN length 1 does not match colValues length 2',
    ]))
  })
})

describe('warnCrosstabResultIssues', () => {
  it('warns and returns issues without throwing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const issues = warnCrosstabResultIssues(makeResult({
      counts: [[1]],
    }), 'test table')

    expect(issues.length).toBeGreaterThan(0)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[Crossify] test table shape mismatch'))
  })
})
