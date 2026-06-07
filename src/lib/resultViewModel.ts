import type { CrosstabConfig, CrosstabResult, CrosstabRowType } from './crosstabEngine'
import { filterZeroRows } from './crosstabEngine'
import { normalizeColumnPaths } from './columnPaths'
import {
  buildHeaderGroups,
  buildRowDisplayPaths,
  buildRowSectionMeta,
  normalizeRowStructure,
} from './tableLayout'

export interface ResultViewModel {
  displayResult: CrosstabResult
  rowValues: string[]
  colValues: string[]
  counts: number[][]
  rowTotalsN: number[]
  colTotalsN: number[]
  grandTotal: number
  showCount: boolean
  showPercent: boolean
  percentType: CrosstabConfig['percentType']
  hideTotal: boolean
  rowPaths: string[][]
  colPaths: string[][]
  rowLevelLabels: string[]
  colLevelLabels: string[]
  rowTypes: CrosstabRowType[]
  rowDisplayPaths: string[][]
  colHeaderGroups: Array<Array<{ label: string; span: number }>>
  rowSectionBases: NonNullable<CrosstabResult['rowSectionBases']>
  rowSectionMeta: ReturnType<typeof buildRowSectionMeta>
}

export function normalizeMetricValues(values: number[] | undefined, length: number) {
  return Array.from({ length }, (_, index) => values?.[index] ?? 0)
}

export function buildStableResultRowKey(
  rowIndex: number,
  rowValues: string[],
  rowPaths: string[][],
  rowTypes: CrosstabRowType[],
) {
  const pathKey = (rowPaths[rowIndex] ?? [rowValues[rowIndex]]).join('\u0001')
  return `${rowIndex}\u0001${rowTypes[rowIndex] ?? 'data'}\u0001${pathKey}`
}

export function validateCrosstabResult(result: CrosstabResult): string[] {
  const issues: string[] = []
  const rowCount = result.rowValues.length
  const colCount = result.colValues.length

  if (result.counts.length !== rowCount) {
    issues.push(`counts row length ${result.counts.length} does not match rowValues length ${rowCount}`)
  }
  result.counts.forEach((row, index) => {
    if (row.length !== colCount) {
      issues.push(`counts[${index}] length ${row.length} does not match colValues length ${colCount}`)
    }
  })
  if (result.rowTotalsN.length !== rowCount) {
    issues.push(`rowTotalsN length ${result.rowTotalsN.length} does not match rowValues length ${rowCount}`)
  }
  if (result.colTotalsN.length !== colCount) {
    issues.push(`colTotalsN length ${result.colTotalsN.length} does not match colValues length ${colCount}`)
  }
  if (result.rowPaths && result.rowPaths.length !== rowCount) {
    issues.push(`rowPaths length ${result.rowPaths.length} does not match rowValues length ${rowCount}`)
  }
  if (result.colPaths && result.colPaths.length !== colCount) {
    issues.push(`colPaths length ${result.colPaths.length} does not match colValues length ${colCount}`)
  }
  if (result.rowTypes && result.rowTypes.length !== rowCount) {
    issues.push(`rowTypes length ${result.rowTypes.length} does not match rowValues length ${rowCount}`)
  }
  result.rowSectionBases?.forEach((section, index) => {
    if (!Number.isFinite(section.startIndex) || section.startIndex < 0 || section.startIndex >= rowCount) {
      issues.push(`rowSectionBases[${index}].startIndex ${section.startIndex} is outside row range 0-${Math.max(0, rowCount - 1)}`)
    }
    if (section.colTotalsN.length !== colCount) {
      issues.push(`rowSectionBases[${index}].colTotalsN length ${section.colTotalsN.length} does not match colValues length ${colCount}`)
    }
  })

  return issues
}

export function warnCrosstabResultIssues(result: CrosstabResult, context = 'CrosstabResult'): string[] {
  const issues = validateCrosstabResult(result)
  if (issues.length > 0 && typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(`[Crossify] ${context} shape mismatch:\n${issues.join('\n')}`)
  }
  return issues
}

export function buildResultViewModel(result: CrosstabResult, config: CrosstabConfig): ResultViewModel {
  const displayResult = filterZeroRows(result, config.hideZeroRows ?? false)
  const { rowValues, colValues, counts, rowTotalsN, colTotalsN, grandTotal } = displayResult
  const rawRowPaths = displayResult.rowPaths ?? rowValues.map(value => [value])
  const colPaths = normalizeColumnPaths(colValues, displayResult.colPaths)
  const rawRowLevelLabels = displayResult.rowLevelLabels ?? [displayResult.rowLabel]
  const colLevelLabels = displayResult.colLevelLabels ?? [displayResult.colLabel]
  const normalizedRows = normalizeRowStructure(displayResult, rawRowPaths, rawRowLevelLabels, displayResult.rowSectionBases ?? [])
  const rowPaths = normalizedRows.rowPaths
  const rowLevelLabels = normalizedRows.rowLevelLabels
  const rowTypes = displayResult.rowTypes ?? rowValues.map(() => 'data' as const)
  const rowDisplayPaths = buildRowDisplayPaths(rowPaths)
  const colHeaderGroups = buildHeaderGroups(colPaths, colLevelLabels.length)
  const rowSectionBases = normalizedRows.rowSectionBases

  return {
    displayResult,
    rowValues,
    colValues,
    counts,
    rowTotalsN,
    colTotalsN,
    grandTotal,
    showCount: config.showCount,
    showPercent: config.showPercent,
    percentType: config.percentType,
    hideTotal: config.hideTotal ?? false,
    rowPaths,
    colPaths,
    rowLevelLabels,
    colLevelLabels,
    rowTypes,
    rowDisplayPaths,
    colHeaderGroups,
    rowSectionBases,
    rowSectionMeta: buildRowSectionMeta(rowSectionBases, rowValues.length),
  }
}
