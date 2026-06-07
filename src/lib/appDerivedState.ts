import { flattenAxisSpec, normalizeCode, parseAxisSpec } from './appStateUtils'
import type { CrosstabResult } from './crosstabEngine'
import type { SavDataset } from './savParser'
import { hasActiveFilter, toComparableFilter } from './tableModel'
import { getGroupedBaseCount } from './variableGrouping'
import type { VariableCatalog } from './variableGrouping'
import type { VariableEditorRow, VariableNetGroup } from './variableEditorUtils'
import type { GlobalSettings, TableDef } from '../types/workspace'
import type { VariableOverride } from '../types/variableOverride'

export function getActiveTable(tables: TableDef[], activeTableId: string): TableDef | null {
  return tables.find(table => table.id === activeTableId) ?? null
}

export function getEditingTableIds(activeTableId: string, selectedIds: Set<string>): string[] {
  if (!activeTableId) return []
  return [...new Set([activeTableId, ...selectedIds])]
}

export function getEditingTables(tables: TableDef[], editingTableIds: string[]): TableDef[] {
  const idSet = new Set(editingTableIds)
  return tables.filter(table => idSet.has(table.id))
}

export function getFilterMismatchTableNames(activeTable: TableDef | null, editingTables: TableDef[]): string[] {
  if (!activeTable || editingTables.length <= 1) return []
  const activeSignature = JSON.stringify(toComparableFilter(activeTable.filter))
  return editingTables
    .filter(table => table.id !== activeTable.id)
    .filter(table => JSON.stringify(toComparableFilter(table.filter)) !== activeSignature)
    .map(table => table.name)
}

export function getEditingVariableBase(
  editingVariableName: string | null,
  variableCatalog: VariableCatalog | null,
  dataset: SavDataset | null,
  variableOverrides: Record<string, VariableOverride>,
): number {
  if (!editingVariableName || !variableCatalog || !dataset) return 0
  const grouped = variableCatalog.groupedByName.get(editingVariableName)
  if (grouped) return getGroupedBaseCount(grouped, dataset.cases)

  const varItem = variableCatalog.byName.get(editingVariableName)
  if (!varItem) return 0

  const order = variableOverrides[editingVariableName]?.order ?? []
  return dataset.cases.filter(row => {
    const code = normalizeCode(row[editingVariableName])
    if (!code) return false
    if (order.length > 0) return order.includes(code)
    return true
  }).length
}

export function getCodeEditorRows(rows: VariableEditorRow[]): VariableEditorRow[] {
  return rows.filter(row => row.rowKind === 'code' || row.rowKind == null)
}

export function getFirstSelectedVariableIndex(
  selectedVariableRowKeys: string[],
  codeEditorRows: VariableEditorRow[],
): number {
  if (selectedVariableRowKeys.length === 0) return -1
  return codeEditorRows.findIndex(row => row.key === selectedVariableRowKeys[0])
}

export function getLastSelectedVariableRowIndex(
  selectedVariableRowKeys: string[],
  codeEditorRows: VariableEditorRow[],
): number {
  if (selectedVariableRowKeys.length === 0) return -1
  const last = selectedVariableRowKeys[selectedVariableRowKeys.length - 1]
  return codeEditorRows.findIndex(row => row.key === last)
}

export function hasSelectedRowsInGroups(
  selectedVariableRowKeys: string[],
  variableGroups: VariableNetGroup[],
): boolean {
  return selectedVariableRowKeys.some(key =>
    variableGroups.some(group => group.members.includes(key)),
  )
}

export function canRunTable(activeTable: TableDef | null): boolean {
  return !!(activeTable && (activeTable.rowVar || activeTable.colVar))
}

export function getFilterSummary(table: TableDef): string | null {
  if (!hasActiveFilter(table.filter)) return null
  if (table.filter.description) return table.filter.description
  const totalConditions = table.filter.groups.reduce((sum, group) => sum + group.conditions.length, 0)
  if (totalConditions === 0) return null
  return `${totalConditions} condition${totalConditions !== 1 ? 's' : ''}`
}

function isGridHideTotalName(
  name: string | null | undefined,
  gridHideTotalVars: Set<string>,
  dataset: SavDataset | null,
): boolean {
  if (!name) return false
  if (gridHideTotalVars.has(name)) return true
  if (!dataset) return false

  const variable = dataset.variables.find(item => item.name === name || item.longName === name) as
    | { isGridUserCreated?: boolean; hideTotal?: boolean }
    | undefined
  return !!(variable?.isGridUserCreated && variable.hideTotal)
}

export function getActiveHideTotal(
  dataset: SavDataset | null,
  activeTable: TableDef | null,
  activeResult: CrosstabResult | null,
  gridHideTotalVars: Set<string>,
): boolean {
  const checkName = (name: string | null | undefined) => isGridHideTotalName(name, gridHideTotalVars, dataset)

  if (activeResult) {
    return checkName(activeResult.rowVar) || checkName(activeResult.colVar)
  }
  if (!activeTable) return false

  return flattenAxisSpec(parseAxisSpec(activeTable.rowVar)).some(checkName) ||
    flattenAxisSpec(parseAxisSpec(activeTable.colVar)).some(checkName)
}

export function buildActiveConfig(settings: GlobalSettings, hideTotal: boolean): GlobalSettings & { hideTotal: boolean } {
  return { ...settings, hideTotal }
}
