import { useCallback } from 'react'
import type { SavDataset } from '../lib/savParser'
import type { AllSettings, SourceMappingEntry } from '../lib/settingsIO'
import { filterCasesForTable } from '../lib/filterRuntime'
import { computeTableResult } from '../lib/resultPipeline'
import { newTable } from '../lib/tableModel'
import { yieldToBrowser } from '../lib/browserScheduler'
import type { VariableCatalog } from '../lib/variableGrouping'
import type { GlobalSettings } from '../types/workspace'
import type { BatchExportSummary } from './useBatchExportFlow'

type SettingsIOModule = typeof import('../lib/settingsIO')
type ExcelExportModule = typeof import('../lib/excelExport')

interface UseBatchExportActionsOptions {
  dataset: SavDataset | null
  variableCatalog: VariableCatalog | null
  currentSourceMappings: SourceMappingEntry[]
  settings: GlobalSettings
  beginBatchExport: () => number
  finishBatchExport: (summary: BatchExportSummary) => void
  loadSettingsIOModule: () => Promise<SettingsIOModule>
  loadExcelExportModule: () => Promise<ExcelExportModule>
}

export function useBatchExportActions({
  dataset,
  variableCatalog,
  currentSourceMappings,
  settings,
  beginBatchExport,
  finishBatchExport,
  loadSettingsIOModule,
  loadExcelExportModule,
}: UseBatchExportActionsOptions) {
  const handleBatchExportFiles = useCallback(async (files: FileList) => {
    if (!dataset || !variableCatalog) return

    const startedAt = beginBatchExport()
    let successCount = 0
    let skippedCount = 0

    try {
      const { parseSettingsFromExcel, restoreAllSettings } = await loadSettingsIOModule()
      const { exportAllTablesToExcel } = await loadExcelExportModule()

      for (let index = 0; index < files.length; index++) {
        const file = files[index]
        try {
          const allSettings: AllSettings = await parseSettingsFromExcel(file)
          const restored = restoreAllSettings(allSettings, dataset, 'match', currentSourceMappings)
          if (restored.tables.length === 0) {
            skippedCount += 1
            continue
          }

          const restoredTables = restored.tables.map((table, tableIndex) => ({
            ...newTable(tableIndex + 1, table.folderId),
            ...table,
          }))
          const ranTables = []
          const outputSettings = { ...settings, ...restored.output }

          for (const table of restoredTables) {
            if (!table.rowVar && !table.colVar) {
              ranTables.push(table)
              continue
            }

            const filteredCases = filterCasesForTable(dataset.cases, table, variableCatalog)
            const result = await computeTableResult(
              filteredCases,
              table,
              variableCatalog,
              restored.variableOverrides ?? {},
              outputSettings,
            )
            ranTables.push({ ...table, result })
            await yieldToBrowser()
          }

          const settingsName = file.name.replace(/\.xlsx$/i, '')
          await exportAllTablesToExcel(
            ranTables,
            dataset,
            restored.variableOverrides ?? {},
            outputSettings,
            settingsName,
          )
          successCount += 1
        } catch {
          skippedCount += 1
        }
      }
    } finally {
      finishBatchExport({
        successCount,
        skippedCount,
        elapsedMs: Date.now() - startedAt,
      })
    }
  }, [
    beginBatchExport,
    currentSourceMappings,
    dataset,
    finishBatchExport,
    loadExcelExportModule,
    loadSettingsIOModule,
    settings,
    variableCatalog,
  ])

  return {
    handleBatchExportFiles,
  }
}
