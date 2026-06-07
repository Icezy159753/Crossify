import type { OutputSettings } from './settingsIO'

export const SETTINGS_VERSION = '1.9' as const

export const SUPPORTED_SETTINGS_VERSIONS = [
  '1.0',
  '1.1',
  '1.2',
  '1.3',
  '1.4',
  '1.5',
  '1.6',
  '1.7',
  '1.8',
  SETTINGS_VERSION,
] as const

export type SettingsVersion = typeof SUPPORTED_SETTINGS_VERSIONS[number]

export const DEFAULT_OUTPUT_SETTINGS: OutputSettings = {
  showCount: true,
  showPercent: true,
  percentType: 'column',
  hideZeroRows: false,
}

export function isSupportedSettingsVersion(version: unknown): version is SettingsVersion {
  return SUPPORTED_SETTINGS_VERSIONS.includes(version as SettingsVersion)
}

export function normalizeOutputSettings(value: Partial<OutputSettings> | null | undefined): OutputSettings {
  return {
    ...DEFAULT_OUTPUT_SETTINGS,
    ...(value ?? {}),
    percentType:
      value?.percentType === 'row' || value?.percentType === 'column' || value?.percentType === 'total'
        ? value.percentType
        : DEFAULT_OUTPUT_SETTINGS.percentType,
    showCount: typeof value?.showCount === 'boolean' ? value.showCount : DEFAULT_OUTPUT_SETTINGS.showCount,
    showPercent: typeof value?.showPercent === 'boolean' ? value.showPercent : DEFAULT_OUTPUT_SETTINGS.showPercent,
    hideZeroRows: typeof value?.hideZeroRows === 'boolean' ? value.hideZeroRows : DEFAULT_OUTPUT_SETTINGS.hideZeroRows,
  }
}
