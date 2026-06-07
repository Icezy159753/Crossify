import type { SettingsLockInfo } from './settingsIO'

export const SETTINGS_LOCK_DURATION_MS = 1000 * 60 * 3

export interface EditorIdentity {
  ownerLabel: string
  machineLabel: string
}

export function getSettingsSessionId(): string {
  if (typeof window === 'undefined') return crypto.randomUUID()
  const storageKey = 'crossify-settings-session-id'
  try {
    const existing = window.sessionStorage.getItem(storageKey)?.trim()
    if (existing) return existing
  } catch {
    // ignore unavailable session storage
  }

  const sessionId = crypto.randomUUID()
  try {
    window.sessionStorage.setItem(storageKey, sessionId)
  } catch {
    // ignore unavailable session storage
  }
  return sessionId
}

export function getEditorIdentity(): EditorIdentity {
  if (typeof window === 'undefined') return { ownerLabel: 'Crossify User', machineLabel: 'Browser Session' }
  const storageKey = 'crossify-editor-identity'
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<EditorIdentity>
      if (parsed.ownerLabel && parsed.machineLabel) {
        return { ownerLabel: parsed.ownerLabel, machineLabel: parsed.machineLabel }
      }
    }
  } catch {
    // ignore invalid local storage payload
  }

  const language = typeof navigator !== 'undefined' ? navigator.language.toUpperCase() : 'LOCAL'
  const identity = {
    ownerLabel: `Crossify User ${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    machineLabel: `${language} Browser`,
  }
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(identity))
  } catch {
    // ignore storage failures
  }
  return identity
}

export function buildActiveSettingsLock(): SettingsLockInfo {
  const now = new Date()
  const identity = getEditorIdentity()
  return {
    sessionId: getSettingsSessionId(),
    ownerLabel: identity.ownerLabel,
    machineLabel: identity.machineLabel,
    status: 'ACTIVE',
    acquiredAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SETTINGS_LOCK_DURATION_MS).toISOString(),
  }
}
