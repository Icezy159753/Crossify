import { describe, expect, it } from 'vitest'

import {
  DEFAULT_ACTIVE_TAB,
  createDefaultGlobalSettings,
  createInitialTables,
} from './appDefaults'

describe('appDefaults', () => {
  it('creates the default output settings used by new workspaces', () => {
    expect(createDefaultGlobalSettings()).toEqual({
      showCount: true,
      showPercent: true,
      percentType: 'column',
      hideZeroRows: false,
    })
  })

  it('creates a fresh initial table array each time', () => {
    const first = createInitialTables()
    const second = createInitialTables()

    expect(first).toHaveLength(1)
    expect(first[0]).toMatchObject({
      name: 'Table1',
      rowVar: null,
      colVar: null,
      result: null,
    })
    expect(first).not.toBe(second)
    expect(first[0].id).not.toBe(second[0].id)
  })

  it('keeps the default active tab explicit', () => {
    expect(DEFAULT_ACTIVE_TAB).toBe('design')
  })
})
