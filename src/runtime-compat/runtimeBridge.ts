export type RuntimeAlertType = 'success' | 'error' | 'info' | 'loading'

export interface RuntimeAlertOptions {
  type?: RuntimeAlertType
  title?: string
  text?: string
  message?: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  timer?: number
}

export interface RuntimeToastOptions {
  title?: string
  text?: string
  timer?: number
}

export interface CrossifyRuntime {
  alert: (options: RuntimeAlertOptions | string) => Promise<boolean>
  confirm: (options: RuntimeAlertOptions | string) => Promise<boolean>
  toast: (options: RuntimeToastOptions | string) => void
  notifyExportComplete: (filename?: string, saved?: boolean) => Promise<boolean>
  ensureAlertStyle?: () => void
}

declare global {
  interface Window {
    __crossifyRuntime?: CrossifyRuntime
    __cxSweetAlert?: CrossifyRuntime['alert']
    __cxSweetToast?: CrossifyRuntime['toast']
  }
}

function asAlertOptions(options: RuntimeAlertOptions | string): RuntimeAlertOptions {
  return typeof options === 'string' ? { text: options } : options
}

function asToastOptions(options: RuntimeToastOptions | string): RuntimeToastOptions {
  return typeof options === 'string' ? { text: options } : options
}

export function createFallbackRuntime(): CrossifyRuntime {
  return {
    async alert(options) {
      const normalized = asAlertOptions(options)
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert(normalized.text ?? normalized.message ?? normalized.title ?? '')
      }
      return true
    },
    async confirm(options) {
      const normalized = asAlertOptions(options)
      if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
        return window.confirm(normalized.text ?? normalized.message ?? normalized.title ?? '')
      }
      return false
    },
    toast(options) {
      const normalized = asToastOptions(options)
      if (typeof console !== 'undefined' && typeof console.info === 'function') {
        console.info([normalized.title, normalized.text].filter(Boolean).join(' - '))
      }
    },
    async notifyExportComplete(filename = 'download.xlsx', saved = false) {
      const message = `${saved ? 'Excel file has been saved' : 'Excel file is ready'}: ${filename}`
      return this.alert({ type: 'success', title: 'Export complete', text: message, confirmText: 'OK' })
    },
  }
}

export function installCrossifyRuntime(runtime: CrossifyRuntime): CrossifyRuntime {
  if (typeof window === 'undefined') return runtime
  window.__crossifyRuntime = {
    ...(window.__crossifyRuntime ?? {}),
    ...runtime,
  }
  window.__cxSweetAlert = options => window.__crossifyRuntime!.alert(options)
  window.__cxSweetToast = options => window.__crossifyRuntime!.toast(options)
  return window.__crossifyRuntime
}

export function getCrossifyRuntime(): CrossifyRuntime {
  if (typeof window !== 'undefined' && window.__crossifyRuntime) {
    return window.__crossifyRuntime
  }
  return createFallbackRuntime()
}
