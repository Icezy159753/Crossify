/**
 * Tests for useBatchExportFlow hook.
 *
 * Key regression: finishBatchExport must atomically set summary AND reset
 * batchExporting=false in a single call. Previously two separate calls
 * (completeBatchExport + endBatchExportSession) could leave batchExporting
 * stuck if only one was called.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBatchExportFlow } from './useBatchExportFlow'

// Mock rAF to return an ID without scheduling (avoids infinite recursion from the
// elapsed-timer loop inside the hook). cancelAnimationFrame is a no-op stub.
let _rafId = 0
beforeEach(() => {
  _rafId = 0
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => ++_rafId)
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ─── initial state ────────────────────────────────────────────────────────────

describe('useBatchExportFlow › initial state', () => {
  it('starts not exporting', () => {
    const { result } = renderHook(() => useBatchExportFlow())
    expect(result.current.batchExporting).toBe(false)
  })
  it('starts with zero elapsed time', () => {
    const { result } = renderHook(() => useBatchExportFlow())
    expect(result.current.batchElapsedMs).toBe(0)
  })
  it('starts with no summary', () => {
    const { result } = renderHook(() => useBatchExportFlow())
    expect(result.current.batchExportSummary).toBeNull()
  })
})

// ─── beginBatchExport ─────────────────────────────────────────────────────────

describe('useBatchExportFlow › beginBatchExport', () => {
  it('sets batchExporting to true', () => {
    const { result } = renderHook(() => useBatchExportFlow())
    act(() => { result.current.beginBatchExport() })
    expect(result.current.batchExporting).toBe(true)
  })
  it('clears any previous summary', () => {
    const { result } = renderHook(() => useBatchExportFlow())
    act(() => { result.current.beginBatchExport() })
    act(() => { result.current.finishBatchExport({ successCount: 1, skippedCount: 0, elapsedMs: 500 }) })
    expect(result.current.batchExportSummary).not.toBeNull()
    act(() => { result.current.beginBatchExport() })
    expect(result.current.batchExportSummary).toBeNull()
  })
  it('returns the startedAt timestamp', () => {
    const { result } = renderHook(() => useBatchExportFlow())
    const now = Date.now()
    let startedAt = 0
    act(() => { startedAt = result.current.beginBatchExport() })
    expect(startedAt).toBeGreaterThanOrEqual(now)
  })
})

// ─── finishBatchExport ────────────────────────────────────────────────────────

describe('useBatchExportFlow › finishBatchExport', () => {
  it('resets batchExporting to false atomically', () => {
    const { result } = renderHook(() => useBatchExportFlow())
    act(() => { result.current.beginBatchExport() })
    expect(result.current.batchExporting).toBe(true)
    act(() => {
      result.current.finishBatchExport({ successCount: 3, skippedCount: 1, elapsedMs: 5000 })
    })
    // Must be false in same render — the key regression guard
    expect(result.current.batchExporting).toBe(false)
  })
  it('sets batchExportSummary with correct values', () => {
    const { result } = renderHook(() => useBatchExportFlow())
    act(() => { result.current.beginBatchExport() })
    act(() => {
      result.current.finishBatchExport({ successCount: 3, skippedCount: 1, elapsedMs: 5000 })
    })
    expect(result.current.batchExportSummary).toEqual({ successCount: 3, skippedCount: 1, elapsedMs: 5000 })
  })
  it('sets batchElapsedMs from summary', () => {
    const { result } = renderHook(() => useBatchExportFlow())
    act(() => { result.current.beginBatchExport() })
    act(() => {
      result.current.finishBatchExport({ successCount: 0, skippedCount: 0, elapsedMs: 12345 })
    })
    expect(result.current.batchElapsedMs).toBe(12345)
  })
  it('is safe to call without a prior beginBatchExport', () => {
    const { result } = renderHook(() => useBatchExportFlow())
    act(() => {
      result.current.finishBatchExport({ successCount: 0, skippedCount: 2, elapsedMs: 0 })
    })
    expect(result.current.batchExporting).toBe(false)
    expect(result.current.batchExportSummary).toEqual({ successCount: 0, skippedCount: 2, elapsedMs: 0 })
  })
})

// ─── dismissBatchExportSummary ────────────────────────────────────────────────

describe('useBatchExportFlow › dismissBatchExportSummary', () => {
  it('clears summary while leaving batchExporting unchanged', () => {
    const { result } = renderHook(() => useBatchExportFlow())
    act(() => { result.current.beginBatchExport() })
    act(() => {
      result.current.finishBatchExport({ successCount: 2, skippedCount: 0, elapsedMs: 3000 })
    })
    expect(result.current.batchExportSummary).not.toBeNull()
    act(() => { result.current.dismissBatchExportSummary() })
    expect(result.current.batchExportSummary).toBeNull()
    expect(result.current.batchExporting).toBe(false)
  })
})
