/**
 * Tests for fileHandleStore.ts.
 *
 * buildHandleId  — pure function, tested without any DB setup.
 * saveSavFileHandle / findSavFileHandle — tested with fake-indexeddb.
 */
import { describe, expect, it, beforeEach } from 'vitest'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
import { buildHandleId, saveSavFileHandle, findSavFileHandle } from './fileHandleStore'

// ─── buildHandleId (pure) ─────────────────────────────────────────────────────

describe('buildHandleId', () => {
  it('uses filePath when present (normalized to lowercase)', () => {
    const id = buildHandleId({ fileName: 'data.sav', filePath: 'C:\\Users\\John\\data.sav' })
    expect(id).toBe('path:c:\\users\\john\\data.sav')
  })

  it('uses fileName when filePath is absent', () => {
    const id = buildHandleId({ fileName: 'Data.sav' })
    expect(id).toBe('name:data.sav')
  })

  it('uses fileName when filePath is empty string', () => {
    const id = buildHandleId({ fileName: 'Survey.sav', filePath: '' })
    expect(id).toBe('name:survey.sav')
  })

  it('uses fileName when filePath is whitespace-only', () => {
    const id = buildHandleId({ fileName: 'Survey.sav', filePath: '   ' })
    expect(id).toBe('name:survey.sav')
  })

  it('normalizes fileName to lowercase', () => {
    const id = buildHandleId({ fileName: 'MY_FILE.SAV' })
    expect(id).toBe('name:my_file.sav')
  })

  it('trims whitespace from filePath', () => {
    const id = buildHandleId({ fileName: 'f.sav', filePath: '  /home/user/f.sav  ' })
    expect(id).toBe('path:/home/user/f.sav')
  })
})

// ─── IndexedDB: saveSavFileHandle / findSavFileHandle ─────────────────────────

/**
 * Minimal stub for FileSystemFileHandle that is structured-clone safe.
 * Real FileSystemFileHandle is cloneable by browsers, but fake-indexeddb
 * uses a strict structured clone. We store plain data only.
 */
function makeHandle(name: string): FileSystemFileHandle {
  // Plain object — no functions — so structured clone succeeds
  return { name, kind: 'file' } as unknown as FileSystemFileHandle
}

describe('saveSavFileHandle + findSavFileHandle', () => {
  beforeEach(() => {
    // Fresh DB for each test — prevents cross-test contamination
    globalThis.indexedDB = new IDBFactory()
    globalThis.IDBKeyRange = IDBKeyRange
  })

  it('saves and retrieves handle by exact filePath', async () => {
    const handle = makeHandle('survey.sav')
    const source = { fileName: 'survey.sav', filePath: 'C:/data/survey.sav' }
    await saveSavFileHandle(source, handle)
    const found = await findSavFileHandle(source)
    expect(found).not.toBeNull()
    expect((found as { name: string })?.name).toBe('survey.sav')
  })

  it('saves and retrieves handle by fileName when no filePath', async () => {
    const handle = makeHandle('data.sav')
    const source = { fileName: 'data.sav' }
    await saveSavFileHandle(source, handle)
    const found = await findSavFileHandle(source)
    expect(found).not.toBeNull()
  })

  it('returns null when nothing saved yet', async () => {
    const found = await findSavFileHandle({ fileName: 'missing.sav' })
    expect(found).toBeNull()
  })

  it('exact path match takes priority over name match', async () => {
    const handleA = makeHandle('by-path.sav')
    const handleB = makeHandle('by-name.sav')
    await saveSavFileHandle({ fileName: 'survey.sav', filePath: 'C:/a/survey.sav' }, handleA)
    await saveSavFileHandle({ fileName: 'survey.sav' }, handleB)

    const found = await findSavFileHandle({ fileName: 'survey.sav', filePath: 'C:/a/survey.sav' })
    expect((found as { name: string })?.name).toBe('by-path.sav')
  })

  it('returns most-recently-saved when multiple name matches', async () => {
    const handleOld = makeHandle('old.sav')
    const handleNew = makeHandle('new.sav')
    await saveSavFileHandle({ fileName: 'common.sav' }, handleOld)
    // Overwrite same key → updatedAt will be newer
    await saveSavFileHandle({ fileName: 'common.sav' }, handleNew)
    const found = await findSavFileHandle({ fileName: 'common.sav' })
    expect((found as { name: string })?.name).toBe('new.sav')
  })

  it('skips save when fileName is empty', async () => {
    const handle = makeHandle('empty.sav')
    await saveSavFileHandle({ fileName: '' }, handle)
    // Should not crash, and nothing stored
    const found = await findSavFileHandle({ fileName: '' })
    expect(found).toBeNull()
  })
})
