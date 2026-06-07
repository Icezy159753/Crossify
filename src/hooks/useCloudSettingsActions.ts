import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  getCloudSettingsStatus,
  getCloudUser,
  loadLatestCloudSettings,
  saveCloudSettings,
  signInCloudSettings,
  signOutCloudSettings,
} from '../lib/cloudSettings'
import type { SavDataset } from '../lib/savParser'
import type { AllSettings, SourceMappingEntry } from '../lib/settingsIO'
import { buildAllSettingsSnapshot } from '../lib/settingsIO'
import { newTable } from '../lib/tableModel'
import type { MrsetDefinition } from '../lib/variableGrouping'
import type { FolderDef, GlobalSettings, TableDef } from '../types/workspace'
import type { VariableOverride } from '../types/variableOverride'

type SettingsIOModule = typeof import('../lib/settingsIO')

interface UseCloudSettingsActionsOptions {
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
  setTables: Dispatch<SetStateAction<TableDef[]>>
  setFolders: Dispatch<SetStateAction<FolderDef[]>>
  setSettings: Dispatch<SetStateAction<GlobalSettings>>
  setVariableOverrides: Dispatch<SetStateAction<Record<string, VariableOverride>>>
  setCustomMrsets: Dispatch<SetStateAction<MrsetDefinition[]>>
  setCurrentSourceMappings: Dispatch<SetStateAction<SourceMappingEntry[]>>
  setActiveTableId: Dispatch<SetStateAction<string>>
  setActiveTab: Dispatch<SetStateAction<'design' | 'filter' | 'results'>>
  setToast: Dispatch<SetStateAction<string | null>>
  setError: Dispatch<SetStateAction<string | null>>
}

function getCloudEmailFromUser(user: User | null): string | null {
  return user?.email ?? null
}

export function useCloudSettingsActions({
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
  setTables,
  setFolders,
  setSettings,
  setVariableOverrides,
  setCustomMrsets,
  setCurrentSourceMappings,
  setActiveTableId,
  setActiveTab,
  setToast,
  setError,
}: UseCloudSettingsActionsOptions) {
  const cloudStatus = useMemo(() => getCloudSettingsStatus(), [])
  const [cloudUser, setCloudUser] = useState<User | null>(null)
  const [cloudWorkspaceId, setCloudWorkspaceId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem('crossify-cloud-workspace-id')
  })
  const [cloudAutosave, setCloudAutosave] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('crossify-cloud-autosave') === 'true'
  })
  const [cloudSaving, setCloudSaving] = useState(false)
  const [lastCloudSavedAt, setLastCloudSavedAt] = useState<string | null>(null)

  const buildSnapshot = useCallback(async () => {
    const { buildAllSettings } = await loadSettingsIOModule()
    const payload = buildAllSettings({
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
    return {
      payload,
      snapshot: buildAllSettingsSnapshot(payload),
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
    tables,
    variableOverrides,
  ])

  const refreshCloudUser = useCallback(async () => {
    const user = await getCloudUser()
    setCloudUser(user)
    return user
  }, [])

  useEffect(() => {
    if (!cloudStatus.configured) return
    void refreshCloudUser()
  }, [cloudStatus.configured, refreshCloudUser])

  const handleCloudSignIn = useCallback(async () => {
    if (!cloudStatus.configured) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
      return
    }
    const email = window.prompt('Email for Crossify Cloud Settings')
    if (!email) return
    try {
      await signInCloudSettings(email)
      setToast('Magic link sent. Open your email to sign in.')
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }, [cloudStatus.configured, setError, setToast])

  const handleCloudSignOut = useCallback(async () => {
    try {
      await signOutCloudSettings()
      setCloudUser(null)
      setToast('Signed out from Cloud Settings')
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }, [setError, setToast])

  const handleSaveCloudSettings = useCallback(async (saveKind: 'manual' | 'autosave' = 'manual') => {
    if (!cloudStatus.configured) {
      if (saveKind === 'manual') {
        setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
      }
      return
    }
    try {
      setCloudSaving(true)
      const user = cloudUser ?? await refreshCloudUser()
      if (!user) throw new Error('Please sign in before using Cloud Settings.')
      const { payload, snapshot } = await buildSnapshot()
      const result = await saveCloudSettings({
        workspaceId: cloudWorkspaceId,
        payload,
        snapshot,
        dataset,
        saveKind,
      })
      setCloudWorkspaceId(result.workspaceId)
      window.localStorage.setItem('crossify-cloud-workspace-id', result.workspaceId)
      const savedAt = new Date().toISOString()
      setLastCloudSavedAt(savedAt)
      if (saveKind === 'manual') setToast(`Cloud Settings saved (v${result.versionNo})`)
    } catch (error) {
      if (saveKind === 'manual') setError(error instanceof Error ? error.message : String(error))
    } finally {
      setCloudSaving(false)
    }
  }, [
    buildSnapshot,
    cloudStatus.configured,
    cloudUser,
    cloudWorkspaceId,
    dataset,
    refreshCloudUser,
    setError,
    setToast,
  ])

  const handleLoadCloudSettings = useCallback(async () => {
    if (!cloudStatus.configured) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
      return
    }
    try {
      const user = cloudUser ?? await refreshCloudUser()
      if (!user) throw new Error('Please sign in before using Cloud Settings.')
      const { restoreAllSettings } = await loadSettingsIOModule()
      const latest = await loadLatestCloudSettings(cloudWorkspaceId)
      const allSettings = latest.version.settings

      if (allSettings.sourceDataset && !dataset) {
        pendingSettingsRestoreRef.current = allSettings
        setToast('Cloud Settings loaded. Load the matching SPSS file to restore the workspace.')
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
      setActiveTableId(nextTables[0]?.id ?? '')
      setActiveTab('design')
      setCloudWorkspaceId(latest.workspace.id)
      window.localStorage.setItem('crossify-cloud-workspace-id', latest.workspace.id)
      setToast(`Cloud Settings loaded (${latest.workspace.name})`)
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }, [
    cloudStatus.configured,
    cloudUser,
    cloudWorkspaceId,
    currentSourceMappings,
    dataset,
    loadSettingsIOModule,
    pendingSettingsRestoreRef,
    refreshCloudUser,
    setActiveTab,
    setActiveTableId,
    setCurrentSourceMappings,
    setCustomMrsets,
    setError,
    setFolders,
    setSettings,
    setTables,
    setToast,
    setVariableOverrides,
  ])

  const handleToggleCloudAutosave = useCallback(() => {
    setCloudAutosave(prev => {
      const next = !prev
      window.localStorage.setItem('crossify-cloud-autosave', String(next))
      return next
    })
  }, [])

  useEffect(() => {
    if (!cloudAutosave || !cloudUser || !dataset) return
    const timeoutId = window.setTimeout(() => {
      void handleSaveCloudSettings('autosave')
    }, 3000)
    return () => window.clearTimeout(timeoutId)
  }, [
    cloudAutosave,
    cloudUser,
    cloudWorkspaceId,
    customMrsets,
    dataset,
    folders,
    handleSaveCloudSettings,
    settings,
    tables,
    variableOverrides,
  ])

  return {
    cloudConfigured: cloudStatus.configured,
    cloudUserEmail: getCloudEmailFromUser(cloudUser),
    cloudAutosave,
    cloudSaving,
    cloudWorkspaceId,
    lastCloudSavedAt,
    handleCloudSignIn,
    handleCloudSignOut,
    handleSaveCloudSettings,
    handleLoadCloudSettings,
    handleToggleCloudAutosave,
  }
}
