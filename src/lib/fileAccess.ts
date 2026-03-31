import type { SettingsWorkbookPayload, SourceDatasetSetting } from './settingsIO'
import { findSavFileHandle, saveSavFileHandle } from './fileHandleStore'
import { buildSettingsWorkbookBuffer } from './settingsIO'

export interface PickedFileResult {
  file: File
  handle?: FileSystemFileHandle
}

export interface PickedSettingsResult {
  file: File
  handle?: FileSystemFileHandle
}

type FileHandleWithPermission = FileSystemFileHandle & {
  queryPermission?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<PermissionState>
  requestPermission?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<PermissionState>
}

type PickerWindow = Window & {
  showOpenFilePicker?: (options?: {
    multiple?: boolean
    excludeAcceptAllOption?: boolean
    id?: string
    startIn?: string
    types?: Array<{
      description?: string
      accept: Record<string, string[]>
    }>
  }) => Promise<FileSystemFileHandle[]>
  showSaveFilePicker?: (options?: {
    suggestedName?: string
    excludeAcceptAllOption?: boolean
    id?: string
    startIn?: string
    types?: Array<{
      description?: string
      accept: Record<string, string[]>
    }>
  }) => Promise<FileSystemFileHandle>
}

function getPickerWindow() {
  return window as PickerWindow
}

export function supportsFileSystemAccess() {
  return typeof window !== 'undefined' && typeof getPickerWindow().showOpenFilePicker === 'function'
}

async function ensureReadPermission(handle: FileSystemFileHandle) {
  const permissionHandle = handle as FileHandleWithPermission
  const queryPermission = permissionHandle.queryPermission?.bind(permissionHandle)
  if (queryPermission) {
    const current = await queryPermission({ mode: 'read' })
    if (current === 'granted') return 'granted'
  }

  const requestPermission = permissionHandle.requestPermission?.bind(permissionHandle)
  if (requestPermission) {
    return requestPermission({ mode: 'read' })
  }

  return 'granted' as PermissionState
}

export async function pickSavFileViaSystem(): Promise<PickedFileResult | null> {
  if (!supportsFileSystemAccess()) return null
  const picker = getPickerWindow().showOpenFilePicker
  if (!picker) return null

  const [handle] = await picker({
    id: 'crossify-spss-file',
    excludeAcceptAllOption: true,
    multiple: false,
    types: [{
      description: 'SPSS Files',
      accept: {
        'application/octet-stream': ['.sav'],
      },
    }],
  })
  if (!handle) return null
  const file = await handle.getFile()
  return { file, handle }
}

export async function restoreSavFileFromSource(source: SourceDatasetSetting): Promise<PickedFileResult | null> {
  if (!supportsFileSystemAccess() || !source.fileName.trim()) return null
  const handle = await findSavFileHandle(source)
  if (!handle) return null

  const permission = await ensureReadPermission(handle)
  if (permission !== 'granted') return null

  const file = await handle.getFile()
  return { file, handle }
}

export async function rememberSavFileHandle(source: SourceDatasetSetting, handle?: FileSystemFileHandle): Promise<void> {
  if (!handle || !supportsFileSystemAccess() || !source.fileName.trim()) return
  await saveSavFileHandle(source, handle)
}

async function ensureWritePermission(handle: FileSystemFileHandle) {
  const permissionHandle = handle as FileHandleWithPermission
  const queryPermission = permissionHandle.queryPermission?.bind(permissionHandle)
  if (queryPermission) {
    const current = await queryPermission({ mode: 'readwrite' })
    if (current === 'granted') return 'granted'
  }

  const requestPermission = permissionHandle.requestPermission?.bind(permissionHandle)
  if (requestPermission) {
    return requestPermission({ mode: 'readwrite' })
  }

  return 'granted' as PermissionState
}

export async function pickSettingsFileViaSystem(): Promise<PickedSettingsResult | null> {
  if (!supportsFileSystemAccess()) return null
  const picker = getPickerWindow().showOpenFilePicker
  if (!picker) return null

  const [handle] = await picker({
    id: 'crossify-settings-file',
    excludeAcceptAllOption: true,
    multiple: false,
    types: [{
      description: 'Crossify Settings',
      accept: {
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      },
    }],
  })
  if (!handle) return null
  const file = await handle.getFile()
  return { file, handle }
}

export async function saveSettingsToFileHandle(
  payload: SettingsWorkbookPayload,
  existingHandle?: FileSystemFileHandle,
  suggestedName = 'crosstab_settings.xlsx',
): Promise<FileSystemFileHandle | null> {
  if (!supportsFileSystemAccess()) return null

  let handle = existingHandle
  if (!handle) {
    const picker = getPickerWindow().showSaveFilePicker
    if (!picker) return null
    handle = await picker({
      id: 'crossify-settings-save',
      suggestedName,
      excludeAcceptAllOption: true,
      types: [{
        description: 'Crossify Settings',
        accept: {
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        },
      }],
    })
  }

  if (!handle) return null

  const permission = await ensureWritePermission(handle)
  if (permission !== 'granted') return null

  const buffer = await buildSettingsWorkbookBuffer(payload)
  const writableProvider = handle as FileSystemFileHandle & {
    createWritable: () => Promise<{ write: (data: BlobPart) => Promise<void>; close: () => Promise<void> }>
  }
  const writable = await writableProvider.createWritable()
  await writable.write(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  await writable.close()
  return handle
}
