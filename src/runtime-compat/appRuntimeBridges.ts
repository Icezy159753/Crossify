import { useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { filterCasesForTable } from '../lib/filterRuntime'
import type { SavDataset } from '../lib/savParser'
import { hasActiveFilter } from '../lib/tableModel'
import type { VariableCatalog } from '../lib/variableGrouping'
import type { TableDef } from '../types/workspace'

type GridHideTotalSetter = Dispatch<SetStateAction<Set<string>>>

declare global {
  interface Window {
    __cxSetGridHideTotal?: ((names: string[], hide: boolean) => void) | null
    __cxGetFilteredCases?: ((tableId: string) => SavDataset['cases'] | null) | null
  }
}

function getCrossifyWindow(): Window | null {
  return typeof window === 'undefined' ? null : window
}

export function useGridHideTotalBridge(setGridHideTotalVars: GridHideTotalSetter) {
  useEffect(() => {
    const crossifyWindow = getCrossifyWindow()
    if (!crossifyWindow) return

    crossifyWindow.__cxSetGridHideTotal = (names: string[], hide: boolean) => {
      setGridHideTotalVars(prev => {
        const next = new Set(prev)
        names.forEach(name => {
          if (hide) {
            next.add(name)
          } else {
            next.delete(name)
          }
        })
        return next
      })
    }

    return () => {
      delete crossifyWindow.__cxSetGridHideTotal
    }
  }, [setGridHideTotalVars])
}

interface FilteredCasesBridgeInput {
  dataset: SavDataset | null
  tables: TableDef[]
  variableCatalog: VariableCatalog | null
}

export function useFilteredCasesBridge({
  dataset,
  tables,
  variableCatalog,
}: FilteredCasesBridgeInput) {
  useEffect(() => {
    const crossifyWindow = getCrossifyWindow()
    if (!crossifyWindow) return

    if (!dataset || !variableCatalog) {
      crossifyWindow.__cxGetFilteredCases = null
      return
    }

    crossifyWindow.__cxGetFilteredCases = (tableId: string) => {
      const table = tables.find(item => item.id === tableId)
      if (!table || !hasActiveFilter(table.filter)) return null
      return filterCasesForTable(dataset.cases, table, variableCatalog)
    }
  }, [dataset, tables, variableCatalog])
}
