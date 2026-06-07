import { useCallback } from 'react'
import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import type { SavDataset } from '../lib/savParser'
import type {
  AllSettings,
  SettingsLockInfo,
  SourceDatasetSetting,
  SourceMappingEntry,
} from '../lib/settingsIO'
import { restoreSavFileFromSource, saveSettingsToFileHandle } from '../lib/fileAccess'
import { newTable } from '../lib/tableModel'
import type { MrsetDefinition } from '../lib/variableGrouping'
import type { FolderDef, GlobalSettings, TableDef } from '../types/workspace'
import type { VariableOverride } from '../types/variableOverride'

type SettingsIOModule = typeof import('../lib/settingsIO')
type SourceIntent = 'match' | 'rebind'

interface UseSettingsActionsOptions {
  tables: TableDef[]
  folders: FolderDef[]
  settings: GlobalSettings
  variableOverrides: Record<string, VariableOverride>
  customMrsets: MrsetDefinition[]
  currentSourceMappings: SourceMappingEntry[]
  dataset: SavDataset | null
  settingsReadonly: boolean
  settingsLockReleased: boolean
  currentSettingsHandle: FileSystemFileHandle | null
  loadedSettingsName: string | null
  pendingSettingsRestoreRef: MutableRefObject<AllSettings | null>
  loadSettingsIOModule: () => Promise<SettingsIOModule>
  loadFile: (file: File, handle?: FileSystemFileHandle) => Promise<void>
  getSettingsSessionId: () => string
  setTables: Dispatch<SetStateAction<TableDef[]>>
  setFolders: Dispatch<SetStateAction<FolderDef[]>>
  setSettings: Dispatch<SetStateAction<GlobalSettings>>
  setVariableOverrides: Dispatch<SetStateAction<Record<string, VariableOverride>>>
  setCustomMrsets: Dispatch<SetStateAction<MrsetDefinition[]>>
  setCurrentSourceMappings: Dispatch<SetStateAction<SourceMappingEntry[]>>
  setCurrentSettingsHandle: Dispatch<SetStateAction<FileSystemFileHandle | null>>
  setLoadedSettingsName: Dispatch<SetStateAction<string | null>>
  setSettingsReadonly: Dispatch<SetStateAction<boolean>>
  setSettingsReadonlyLock: Dispatch<SetStateAction<SettingsLockInfo | null>>
  setPendingSourceDataset: Dispatch<SetStateAction<SourceDatasetSetting | null>>
  setPendingSourceIntent: Dispatch<SetStateAction<SourceIntent>>
  setActiveTableId: Dispatch<SetStateAction<string>>
  setActiveTab: Dispatch<SetStateAction<'design' | 'filter' | 'results'>>
  setToast: Dispatch<SetStateAction<string | null>>
  setError: Dispatch<SetStateAction<string | null>>
}

function getSettingsBaseName(fileName: string) {
  return fileName.replace(/\.xlsx$/i, '')
}

export function useSettingsActions({
  tables,
  folders,
  settings,
  variableOverrides,
  customMrsets,
  currentSourceMappings,
  dataset,
  settingsReadonly,
  settingsLockReleased,
  currentSettingsHandle,
  loadedSettingsName,
  pendingSettingsRestoreRef,
  loadSettingsIOModule,
  loadFile,
  getSettingsSessionId,
  setTables,
  setFolders,
  setSettings,
  setVariableOverrides,
  setCustomMrsets,
  setCurrentSourceMappings,
  setCurrentSettingsHandle,
  setLoadedSettingsName,
  setSettingsReadonly,
  setSettingsReadonlyLock,
  setPendingSourceDataset,
  setPendingSourceIntent,
  setActiveTableId,
  setActiveTab,
  setToast,
  setError,
}: UseSettingsActionsOptions) {
  const handleSaveSettings = useCallback(async () => {
    try {
      const { buildAllSettings, exportSettingsToExcel } = await loadSettingsIOModule()
      const allSettings = buildAllSettings({
        tables,
        folders,
        settings,
        variableOverrides,
        customMrsets,
        currentSourceMappings,
        dataset,
        settingsReadonly,
        settingsLockReleased,
        currentSettingsHandle,
        loadedSettingsName,
      })

      if (currentSettingsHandle && !settingsReadonly) {
        await saveSettingsToFileHandle(
          allSettings,
          currentSettingsHandle,
          loadedSettingsName ? `${loadedSettingsName}.xlsx` : 'crossify-settings.xlsx',
        )
        setToast('Settings saved')
      } else {
        await exportSettingsToExcel(allSettings, loadedSettingsName ?? 'crossify-settings')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }, [
    currentSettingsHandle,
    currentSourceMappings,
    customMrsets,
    dataset,
    folders,
    loadSettingsIOModule,
    loadedSettingsName,
    settings,
    settingsLockReleased,
    settingsReadonly,
    setError,
    setToast,
    tables,
    variableOverrides,
  ])

  const handleLoadSettingsFile = useCallback(async (file: File, handle?: FileSystemFileHandle) => {
    try {
      const { parseSettingsFromExcel, restoreAllSettings } = await loadSettingsIOModule()
      const allSettings = await parseSettingsFromExcel(file)

      if (allSettings.sourceDataset && !dataset) {
        pendingSettingsRestoreRef.current = allSettings
        if (handle) {
          setCurrentSettingsHandle(handle)
          setLoadedSettingsName(getSettingsBaseName(file.name))
        }

        const restored = await restoreSavFileFromSource(allSettings.sourceDataset)
        if (restored) {
          setPendingSourceDataset(null)
          await loadFile(restored.file, restored.handle)
        } else {
          setPendingSourceDataset(allSettings.sourceDataset)
          setPendingSourceIntent('match')
        }
        return
      }

      const restored = restoreAllSettings(allSettings, dataset, 'match', currentSourceMappings)
      const nextTables = restored.tables.map((table, index) => ({ ...newTable(index + 1, table.folderId), ...table }))
      setTables(nextTables)
      setFolders(restored.folders ?? [])
      setSettings(prev => ({ ...prev, ...restored.output }))
      setVariableOverrides((restored.variableOverrides ?? {}) as Record<string, VariableOverride>)
      setCustomMrsets(restored.customMrsets ?? [])
      setCurrentSourceMappings(restored.sourceMappings ?? [])
      if (handle) {
        setCurrentSettingsHandle(handle)
        setLoadedSettingsName(getSettingsBaseName(file.name))
        setSettingsReadonly(
          allSettings.activeLock?.status === 'ACTIVE' &&
            allSettings.activeLock.sessionId !== getSettingsSessionId(),
        )
        setSettingsReadonlyLock(allSettings.activeLock ?? null)
      }
      setActiveTableId(nextTables[0]?.id ?? '')
      setActiveTab('design')
      setToast('Settings loaded')
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }, [
    currentSourceMappings,
    dataset,
    getSettingsSessionId,
    loadFile,
    loadSettingsIOModule,
    pendingSettingsRestoreRef,
    setActiveTab,
    setActiveTableId,
    setCurrentSettingsHandle,
    setCurrentSourceMappings,
    setCustomMrsets,
    setError,
    setFolders,
    setLoadedSettingsName,
    setPendingSourceDataset,
    setPendingSourceIntent,
    setSettings,
    setSettingsReadonly,
    setSettingsReadonlyLock,
    setTables,
    setToast,
    setVariableOverrides,
  ])

  return {
    handleSaveSettings,
    handleLoadSettingsFile,
  }
}
