import { describe, expect, it } from 'vitest'
import {
  DEFAULT_OUTPUT_SETTINGS,
  SETTINGS_VERSION,
  isSupportedSettingsVersion,
  normalizeOutputSettings,
} from './settingsSchema'

describe('settingsSchema', () => {
  it('keeps the current settings version supported', () => {
    expect(isSupportedSettingsVersion(SETTINGS_VERSION)).toBe(true)
    expect(isSupportedSettingsVersion('0.9')).toBe(false)
  })

  it('normalizes missing output settings to defaults', () => {
    expect(normalizeOutputSettings(null)).toEqual(DEFAULT_OUTPUT_SETTINGS)
  })

  it('guards invalid percent type while preserving valid booleans', () => {
    expect(normalizeOutputSettings({
      showCount: false,
      showPercent: false,
      percentType: 'invalid' as 'column',
      hideZeroRows: true,
    })).toEqual({
      showCount: false,
      showPercent: false,
      percentType: 'column',
      hideZeroRows: true,
    })
  })
})
