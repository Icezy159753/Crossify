import type {
  ScaleSummaryPresetType,
  VariableNetGroup,
  VariableSummaryRow,
} from '../lib/variableEditorUtils'

export type NumericStat = 'mean' | 'min' | 'max' | 'stddev'

export interface VariableOverride {
  order: string[]
  weights: Record<string, string>
  labels?: Record<string, string>
  numericStats?: NumericStat[]
  groups?: VariableNetGroup[]
  summaries?: VariableSummaryRow[]
  summaryPreset?: ScaleSummaryPresetType
}
