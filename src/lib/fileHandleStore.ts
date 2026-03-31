import type { SourceDatasetSetting } from './settingsIO'

const DB_NAME = 'crossify-file-handles'
const DB_VERSION = 1
const STORE_NAME = 'sav-handles'

interface StoredSavHandleRecord {
  id: string
  fileName: string
  filePath?: string
  updatedAt: number
  handle: FileSystemFileHandle
}

function openDb(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'))
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('fileName', 'fileName', { unique: false })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
  })
}

function buildHandleId(source: SourceDatasetSetting) {
  return source.filePath?.trim()
    ? `path:${source.filePath.trim().toLowerCase()}`
    : `name:${source.fileName.trim().toLowerCase()}`
}

async function getAllRecords(): Promise<StoredSavHandleRecord[]> {
  const db = await openDb()
  return new Promise<StoredSavHandleRecord[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onerror = () => reject(request.error ?? new Error('Failed to read stored file handles'))
    request.onsuccess = () => resolve((request.result as StoredSavHandleRecord[] | undefined) ?? [])
  }).finally(() => db.close())
}

export async function saveSavFileHandle(source: SourceDatasetSetting, handle: FileSystemFileHandle): Promise<void> {
  if (!source.fileName.trim()) return
  const db = await openDb()
  const record: StoredSavHandleRecord = {
    id: buildHandleId(source),
    fileName: source.fileName.trim(),
    filePath: source.filePath?.trim() || undefined,
    updatedAt: Date.now(),
    handle,
  }
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Failed to save file handle'))
    tx.objectStore(STORE_NAME).put(record)
  }).finally(() => db.close())
}

export async function findSavFileHandle(source: SourceDatasetSetting): Promise<FileSystemFileHandle | null> {
  const normalizedPath = source.filePath?.trim().toLowerCase()
  const normalizedName = source.fileName.trim().toLowerCase()
  const records = await getAllRecords()

  const exactPathMatch = normalizedPath
    ? records.find(record => record.filePath?.trim().toLowerCase() === normalizedPath)
    : null
  if (exactPathMatch) return exactPathMatch.handle

  const byName = records
    .filter(record => record.fileName.trim().toLowerCase() === normalizedName)
    .sort((a, b) => b.updatedAt - a.updatedAt)

  return byName[0]?.handle ?? null
}
