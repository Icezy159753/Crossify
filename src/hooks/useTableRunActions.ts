import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import { yieldToBrowser } from '../lib/browserScheduler'
import { filterCasesForTable } from '../lib/filterRuntime'
import { computeTableResult } from '../lib/resultPipeline'
import type { SavDataset } from '../lib/savParser'
import type { VariableCatalog } from '../lib/variableGrouping'
import type { GlobalSettings, TableDef } from '../types/workspace'
import type { VariableOverride } from '../types/variableOverride'

const BATCH_YIELD_EVERY = 250

interface UseTableRunActionsOptions {
  dataset: SavDataset | null
  variableCatalog: VariableCatalog | null
  tables: TableDef[]
  variableOverrides: Record<string, VariableOverride>
  settings: GlobalSettings
  runningAll: boolean
  setTables: Dispatch<SetStateAction<TableDef[]>>
  setRunningAll: Dispatch<SetStateAction<boolean>>
}

export function useTableRunActions({
  dataset,
  variableCatalog,
  tables,
  variableOverrides,
  settings,
  runningAll,
  setTables,
  setRunningAll,
}: UseTableRunActionsOptions) {
  const runTable = useCallback(async (tableId: string) => {
    if (!dataset || !variableCatalog) return
    const table = tables.find(item => item.id === tableId)
    if (!table || (!table.rowVar && !table.colVar)) return

    const filteredCases = filterCasesForTable(dataset.cases, table, variableCatalog)
    const result = await computeTableResult(
      filteredCases,
      table,
      variableCatalog,
      variableOverrides,
      settings,
    )

    setTables(prev => prev.map(item => item.id === tableId ? { ...item, result } : item))
  }, [dataset, settings, setTables, tables, variableCatalog, variableOverrides])

  const runAllTables = useCallback(async () => {
    if (!dataset || !variableCatalog || runningAll) return
    setRunningAll(true)
    try {
      let count = 0
      for (const table of tables) {
        if (!table.rowVar && !table.colVar) continue
        await runTable(table.id)
        count += 1
        if (count % BATCH_YIELD_EVERY === 0) await yieldToBrowser()
      }
    } finally {
      setRunningAll(false)
    }
  }, [dataset, runningAll, runTable, setRunningAll, tables, variableCatalog])

  return {
    runTable,
    runAllTables,
  }
}
