import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { GlobalSettings, TableDef } from '../types/workspace'
import type { SavDataset } from '../lib/savParser'

interface UseExportActionsOptions {
  activeTable: TableDef | null
  dataset: SavDataset | null
  variableOverrides: Record<string, unknown>
  activeConfig: GlobalSettings
  setExporting: Dispatch<SetStateAction<boolean>>
  setError: Dispatch<SetStateAction<string | null>>
  setToast?: Dispatch<SetStateAction<string | null>>
  loadExcelExportModule: () => Promise<typeof import('../lib/excelExport')>
}

export function useExportActions({
  activeTable,
  dataset,
  variableOverrides,
  activeConfig,
  setExporting,
  setError,
  setToast,
  loadExcelExportModule,
}: UseExportActionsOptions) {
  const handleExportTable = useCallback(async () => {
    if (!activeTable?.result || !dataset) return
    setExporting(true)
    try {
      const { exportTableToExcel } = await loadExcelExportModule()
      await exportTableToExcel(activeTable, dataset, variableOverrides, activeConfig)
      setToast?.(`Exported "${activeTable.name}" successfully.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setExporting(false)
    }
  }, [activeConfig, activeTable, dataset, loadExcelExportModule, setError, setExporting, setToast, variableOverrides])

  return { handleExportTable }
}
