import { applyValueLabels, parseSav } from './savParser'
import type { SavDataset } from './savParser'

export const LIGHT_LOAD_THRESHOLD_BYTES = 150 * 1024 * 1024

export type SavLoadPhase = 'variables' | 'cases'

export interface LoadSavDatasetOptions {
  lightLoadThresholdBytes?: number
  onProgress?: (phase: SavLoadPhase, percent: number) => void
}

export interface LoadedSavDataset {
  dataset: SavDataset
  lightLoadMode: boolean
}

export async function loadSavDatasetFromFile(
  file: File,
  options: LoadSavDatasetOptions = {},
): Promise<LoadedSavDataset> {
  const lightLoadThresholdBytes = options.lightLoadThresholdBytes ?? LIGHT_LOAD_THRESHOLD_BYTES
  const lightLoadMode = file.size > lightLoadThresholdBytes
  const parsed = await parseSav(file, options.onProgress)

  return {
    dataset: {
      ...parsed,
      cases: applyValueLabels(parsed.cases, parsed.variables),
    },
    lightLoadMode,
  }
}
