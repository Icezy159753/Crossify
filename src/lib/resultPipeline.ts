import { computeCrosstabAsync } from './crosstabEngine'
import type { CrosstabResult } from './crosstabEngine'
import { computeGroupedCrosstabAsync, type VariableCatalog } from './variableGrouping'
import { flattenAxisSpec, parseAxisSpec } from './appStateUtils'
import { warnCrosstabResultIssues } from './resultViewModel'
import type { GlobalSettings, TableDef } from '../types/workspace'
import type { VariableOverride } from '../types/variableOverride'

type RawCase = Record<string, string | number>
type ComputeSettings = GlobalSettings & { hideTotal?: boolean }

function getVariableOrder(variableName: string, variableCatalog: VariableCatalog): string[] | undefined {
  const item = variableCatalog.byName.get(variableName)
  if (!item || Object.keys(item.valueLabels).length === 0) return undefined
  return Object.entries(item.valueLabels)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map(([, label]) => label)
}

function getVariableLabel(variableName: string, variableCatalog: VariableCatalog): string {
  const item = variableCatalog.byName.get(variableName)
  return item?.label || item?.longName || item?.name || variableName
}

export async function computeTableResult(
  filteredCases: RawCase[],
  table: Pick<TableDef, 'rowVar' | 'colVar'>,
  variableCatalog: VariableCatalog,
  _variableOverrides: Record<string, VariableOverride> | Record<string, unknown>,
  settings: ComputeSettings,
): Promise<CrosstabResult> {
  const colSpec = parseAxisSpec(table.colVar)
  const rowSpec = parseAxisSpec(table.rowVar)
  const colVars = flattenAxisSpec(colSpec)
  const rowVars = flattenAxisSpec(rowSpec)
  const rowVar = rowVars[0] ?? colVars[0]
  const colVar = colVars[0] ?? rowVars[0]

  if (!rowVar || !colVar) {
    throw new Error('At least one row and one column variable are required to compute a crosstab')
  }

  const rowItem = variableCatalog.byName.get(rowVar)
  const colItem = variableCatalog.byName.get(colVar)
  const isGridTable = !!(rowItem?.isGridUserCreated || colItem?.isGridUserCreated)
  const allVars = [...new Set([...colVars, ...rowVars])]
  const hasGrouped = !isGridTable && allVars.some(variableName => variableCatalog.groupedByName.has(variableName))

  if (!hasGrouped) {
    const result = await computeCrosstabAsync(
      filteredCases as Record<string, string>[],
      {
        rowVar,
        colVar,
        showCount: settings.showCount,
        showPercent: settings.showPercent,
        percentType: settings.percentType,
        hideZeroRows: settings.hideZeroRows,
        hideTotal: settings.hideTotal,
      },
      getVariableLabel(rowVar, variableCatalog),
      getVariableLabel(colVar, variableCatalog),
      getVariableOrder(rowVar, variableCatalog),
      getVariableOrder(colVar, variableCatalog),
    )
    warnCrosstabResultIssues(result, `table "${rowVar}" x "${colVar}"`)
    return result
  }

  const groupedRow = rowVars.map(variableName => variableCatalog.groupedByName.get(variableName)).find(Boolean)
  const groupedCol = colVars.map(variableName => variableCatalog.groupedByName.get(variableName)).find(Boolean)
  const grouped = groupedRow ?? groupedCol
  if (!grouped) {
    throw new Error('Grouped table requested but no grouped variable was found')
  }
  const groupedSide = groupedRow ? 'row' : 'column'
  const otherVar = groupedSide === 'row' ? colVar : rowVar
  const config = {
    rowVar,
    colVar,
    showCount: settings.showCount,
    showPercent: settings.showPercent,
    percentType: settings.percentType,
    hideZeroRows: settings.hideZeroRows,
    hideTotal: settings.hideTotal,
  }

  const result = await computeGroupedCrosstabAsync(
    filteredCases,
    filteredCases as Record<string, string>[],
    config,
    grouped,
    groupedSide,
    getVariableLabel(otherVar, variableCatalog),
    getVariableOrder(otherVar, variableCatalog),
  )
  warnCrosstabResultIssues(result, `grouped table "${rowVar}" x "${colVar}"`)
  return result
}
