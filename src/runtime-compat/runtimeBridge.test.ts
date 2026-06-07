/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createFallbackRuntime,
  getCrossifyRuntime,
  installCrossifyRuntime,
  type CrossifyRuntime,
} from './runtimeBridge'

afterEach(() => {
  delete window.__crossifyRuntime
  delete window.__cxSweetAlert
  delete window.__cxSweetToast
  vi.restoreAllMocks()
})

describe('runtimeBridge', () => {
  it('installs one stable runtime facade and legacy aliases', async () => {
    const runtime: CrossifyRuntime = {
      alert: vi.fn(async () => true),
      confirm: vi.fn(async () => true),
      toast: vi.fn(),
      notifyExportComplete: vi.fn(async () => true),
    }

    installCrossifyRuntime(runtime)
    await window.__cxSweetAlert?.({ title: 'Hello' })
    window.__cxSweetToast?.({ title: 'Saved' })
    await window.__crossifyRuntime?.confirm({ title: 'Sure?' })
    await window.__crossifyRuntime?.notifyExportComplete('out.xlsx', true)

    expect(runtime.alert).toHaveBeenCalledWith({ title: 'Hello' })
    expect(runtime.toast).toHaveBeenCalledWith({ title: 'Saved' })
    expect(runtime.confirm).toHaveBeenCalledWith({ title: 'Sure?' })
    expect(runtime.notifyExportComplete).toHaveBeenCalledWith('out.xlsx', true)
  })

  it('returns installed runtime before fallback', () => {
    const runtime = installCrossifyRuntime({
      alert: vi.fn(async () => true),
      confirm: vi.fn(async () => true),
      toast: vi.fn(),
      notifyExportComplete: vi.fn(async () => true),
    })

    expect(getCrossifyRuntime()).toBe(runtime)
  })

  it('fallback notifyExportComplete uses the alert channel', async () => {
    const nativeAlert = vi.spyOn(window, 'alert').mockImplementation(() => undefined)
    const runtime = createFallbackRuntime()

    await runtime.notifyExportComplete('table.xlsx', true)

    expect(nativeAlert).toHaveBeenCalledWith('Excel file has been saved: table.xlsx')
  })

  it('fallback confirm uses the native confirm channel', async () => {
    const nativeConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const runtime = createFallbackRuntime()

    await expect(runtime.confirm({ title: 'Delete?' })).resolves.toBe(true)

    expect(nativeConfirm).toHaveBeenCalledWith('Delete?')
  })
})
