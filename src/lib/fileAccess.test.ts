/**
 * Tests for fileAccess.ts — browser File System Access API wrapper.
 *
 * All functions rely on browser globals (showOpenFilePicker, showSaveFilePicker,
 * FileSystemFileHandle). We use jsdom + vi.stubGlobal / vi.mock to replace them.
 *
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  supportsFileSystemAccess,
  pickSavFileViaSystem,
  pickSettingsFileViaSystem,
  restoreSavFileFromSource,
  rememberSavFileHandle,
  saveSettingsToFileHandle,
} from './fileAccess'

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeHandle(fileName = 'test.sav'): FileSystemFileHandle {
  const file = new File(['data'], fileName)
  return {
    name: fileName,
    kind: 'file',
    getFile: vi.fn().mockResolvedValue(file),
    queryPermission: vi.fn().mockResolvedValue('granted'),
    requestPermission: vi.fn().mockResolvedValue('granted'),
    createWritable: vi.fn().mockResolvedValue({
      write: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    }),
  } as unknown as FileSystemFileHandle
}

// Mock fileHandleStore so tests don't hit IndexedDB
vi.mock('./fileHandleStore', () => ({
  findSavFileHandle: vi.fn(),
  saveSavFileHandle: vi.fn(),
}))

// Mock settingsIO.buildSettingsWorkbookBuffer so we don't need real ExcelJS
vi.mock('./settingsIO', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./settingsIO')>()
  return {
    ...actual,
    buildSettingsWorkbookBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
  }
})

import { findSavFileHandle, saveSavFileHandle } from './fileHandleStore'

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  // Remove any stubbed globals
  vi.unstubAllGlobals()
})

// ─── supportsFileSystemAccess ─────────────────────────────────────────────────

describe('supportsFileSystemAccess', () => {
  it('returns false when showOpenFilePicker is not on window', () => {
    // jsdom does not provide showOpenFilePicker by default
    expect(supportsFileSystemAccess()).toBe(false)
  })

  it('returns true when showOpenFilePicker is defined on window', () => {
    vi.stubGlobal('showOpenFilePicker', vi.fn())
    expect(supportsFileSystemAccess()).toBe(true)
  })
})

// ─── pickSavFileViaSystem ─────────────────────────────────────────────────────

describe('pickSavFileViaSystem', () => {
  it('returns null when FileSystem Access API is not supported', async () => {
    // showOpenFilePicker not defined → supportsFileSystemAccess()=false
    const result = await pickSavFileViaSystem()
    expect(result).toBeNull()
  })

  it('returns file + handle when picker resolves', async () => {
    const handle = makeHandle('survey.sav')
    vi.stubGlobal('showOpenFilePicker', vi.fn().mockResolvedValue([handle]))
    const result = await pickSavFileViaSystem()
    expect(result).not.toBeNull()
    expect(result?.file.name).toBe('survey.sav')
    expect(result?.handle).toBe(handle)
  })

  it('propagates picker rejection', async () => {
    vi.stubGlobal('showOpenFilePicker', vi.fn().mockRejectedValue(new DOMException('Cancelled', 'AbortError')))
    await expect(pickSavFileViaSystem()).rejects.toThrow('Cancelled')
  })
})

// ─── pickSettingsFileViaSystem ────────────────────────────────────────────────

describe('pickSettingsFileViaSystem', () => {
  it('returns null when not supported', async () => {
    expect(await pickSettingsFileViaSystem()).toBeNull()
  })

  it('returns file + handle from picker', async () => {
    const handle = makeHandle('settings.xlsx')
    vi.stubGlobal('showOpenFilePicker', vi.fn().mockResolvedValue([handle]))
    const result = await pickSettingsFileViaSystem()
    expect(result?.file.name).toBe('settings.xlsx')
    expect(result?.handle).toBe(handle)
  })
})

// ─── restoreSavFileFromSource ─────────────────────────────────────────────────

describe('restoreSavFileFromSource', () => {
  it('returns null when API not supported', async () => {
    const result = await restoreSavFileFromSource({ fileName: 'survey.sav' })
    expect(result).toBeNull()
  })

  it('returns null when no stored handle found', async () => {
    vi.stubGlobal('showOpenFilePicker', vi.fn())
    vi.mocked(findSavFileHandle).mockResolvedValue(null)
    const result = await restoreSavFileFromSource({ fileName: 'survey.sav' })
    expect(result).toBeNull()
  })

  it('returns file + handle when stored handle exists and permission granted', async () => {
    vi.stubGlobal('showOpenFilePicker', vi.fn())
    const handle = makeHandle('survey.sav')
    vi.mocked(findSavFileHandle).mockResolvedValue(handle)
    const result = await restoreSavFileFromSource({ fileName: 'survey.sav' })
    expect(result?.file.name).toBe('survey.sav')
    expect(result?.handle).toBe(handle)
  })

  it('returns null when permission denied', async () => {
    vi.stubGlobal('showOpenFilePicker', vi.fn())
    const handle = {
      ...makeHandle('survey.sav'),
      queryPermission: vi.fn().mockResolvedValue('denied'),
      requestPermission: vi.fn().mockResolvedValue('denied'),
    } as unknown as FileSystemFileHandle
    vi.mocked(findSavFileHandle).mockResolvedValue(handle)
    const result = await restoreSavFileFromSource({ fileName: 'survey.sav' })
    expect(result).toBeNull()
  })

  it('returns null when fileName is empty', async () => {
    vi.stubGlobal('showOpenFilePicker', vi.fn())
    const result = await restoreSavFileFromSource({ fileName: '' })
    expect(result).toBeNull()
  })
})

// ─── rememberSavFileHandle ────────────────────────────────────────────────────

describe('rememberSavFileHandle', () => {
  it('does nothing when API not supported', async () => {
    const handle = makeHandle()
    await rememberSavFileHandle({ fileName: 'survey.sav' }, handle)
    expect(saveSavFileHandle).not.toHaveBeenCalled()
  })

  it('does nothing when handle is undefined', async () => {
    vi.stubGlobal('showOpenFilePicker', vi.fn())
    await rememberSavFileHandle({ fileName: 'survey.sav' }, undefined)
    expect(saveSavFileHandle).not.toHaveBeenCalled()
  })

  it('calls saveSavFileHandle when all conditions met', async () => {
    vi.stubGlobal('showOpenFilePicker', vi.fn())
    const handle = makeHandle()
    await rememberSavFileHandle({ fileName: 'survey.sav' }, handle)
    expect(saveSavFileHandle).toHaveBeenCalledWith({ fileName: 'survey.sav' }, handle)
  })
})

// ─── saveSettingsToFileHandle ─────────────────────────────────────────────────

describe('saveSettingsToFileHandle', () => {
  it('returns null when API not supported', async () => {
    const result = await saveSettingsToFileHandle({ tables: [], folders: [], output: { showCount: true, showPercent: false, percentType: 'column' } })
    expect(result).toBeNull()
  })

  it('uses existing handle without prompting for new one', async () => {
    vi.stubGlobal('showSaveFilePicker', vi.fn())
    vi.stubGlobal('showOpenFilePicker', vi.fn())
    const handle = makeHandle('settings.xlsx')
    const payload = { tables: [], folders: [], output: { showCount: true, showPercent: false, percentType: 'column' as const } }
    const result = await saveSettingsToFileHandle(payload, handle)
    expect(result).toBe(handle)
    // showSaveFilePicker should NOT have been called since we passed an existing handle
    expect(vi.mocked(window as unknown as { showSaveFilePicker: ReturnType<typeof vi.fn> }).showSaveFilePicker).not.toHaveBeenCalled()
  })

  it('prompts for new handle when none provided', async () => {
    const handle = makeHandle('settings.xlsx')
    vi.stubGlobal('showSaveFilePicker', vi.fn().mockResolvedValue(handle))
    vi.stubGlobal('showOpenFilePicker', vi.fn())
    const payload = { tables: [], folders: [], output: { showCount: true, showPercent: false, percentType: 'column' as const } }
    const result = await saveSettingsToFileHandle(payload)
    expect(result).toBe(handle)
  })
})
