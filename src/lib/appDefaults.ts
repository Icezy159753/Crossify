import { newTable } from './tableModel'
import type { GlobalSettings, TableDef } from '../types/workspace'

export const DEFAULT_ACTIVE_TAB = 'design' as const

export function createDefaultGlobalSettings(): GlobalSettings {
  return {
    showCount: true,
    showPercent: true,
    percentType: 'column',
    hideZeroRows: false,
  }
}

export function createInitialTables(): TableDef[] {
  return [newTable(1)]
}
