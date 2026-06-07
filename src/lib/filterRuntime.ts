import { evaluateFilterSpec } from './filterEngine'
import { normalizeCode } from './appStateUtils'
import type { VariableCatalog } from './variableGrouping'
import type { TableDef, TableFilterSpec } from '../types/workspace'
import { hasActiveFilter } from './tableModel'

type RawCase = Record<string, string | number>

export function buildFilterRuntime(variableCatalog: VariableCatalog) {
  return {
    getValueKeys: (varName: string, rawCase: RawCase) => {
      const grouped = variableCatalog.groupedByName.get(varName)
      if (grouped) {
        return grouped.options.map(opt => normalizeCode(rawCase[opt.memberName])).filter(Boolean)
      }

      const item = variableCatalog.byName.get(varName)
      if (item && Object.keys(item.valueLabels).length > 0) {
        const labelStr = rawCase[varName] == null ? '' : String(rawCase[varName])
        const code = Object.entries(item.valueLabels).find(([, value]) => value === labelStr)?.[0]
        return code ? [code] : [normalizeCode(rawCase[varName])].filter(Boolean)
      }

      return [normalizeCode(rawCase[varName])].filter(Boolean)
    },
    getTextValue: (varName: string, rawCase: RawCase) => {
      const value = rawCase[varName]
      return value == null ? '' : String(value)
    },
    getNumericValue: (varName: string, rawCase: RawCase) => {
      const value = rawCase[varName]
      const numeric = Number(value)
      return Number.isFinite(numeric) ? numeric : null
    },
  }
}

export function filterCasesForSpec(
  cases: RawCase[],
  filter: TableFilterSpec,
  variableCatalog: VariableCatalog,
): RawCase[] {
  if (!hasActiveFilter(filter)) return cases
  const runtime = buildFilterRuntime(variableCatalog)
  return cases.filter(rawCase => {
    const labeled = Object.fromEntries(Object.entries(rawCase).map(([key, value]) => [key, String(value)]))
    return evaluateFilterSpec(filter, rawCase, labeled, runtime)
  })
}

export function filterCasesForTable(
  cases: RawCase[],
  table: Pick<TableDef, 'filter'>,
  variableCatalog: VariableCatalog,
): RawCase[] {
  return filterCasesForSpec(cases, table.filter, variableCatalog)
}
