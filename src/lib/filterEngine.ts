import type {
  TableFilterCondition,
  TableFilterGroup,
  TableFilterSpec,
} from '../types/workspace'

export interface FilterRuntime {
  getValueKeys: (
    variableName: string,
    rawCase: Record<string, string | number>,
    labeledCase: Record<string, string>,
  ) => string[]
  getTextValue: (
    variableName: string,
    rawCase: Record<string, string | number>,
    labeledCase: Record<string, string>,
  ) => string
  getNumericValue: (
    variableName: string,
    rawCase: Record<string, string | number>,
    labeledCase: Record<string, string>,
  ) => number | null
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function isConditionReady(condition: TableFilterCondition) {
  if (condition.operator === 'in' || condition.operator === 'not_in') {
    return condition.values.length > 0
  }
  if (condition.operator === 'between') {
    return condition.value.trim() !== '' && condition.secondaryValue.trim() !== ''
  }
  if (
    condition.operator === 'gt' ||
    condition.operator === 'gte' ||
    condition.operator === 'lt' ||
    condition.operator === 'lte' ||
    condition.operator === 'contains' ||
    condition.operator === 'not_contains'
  ) {
    return condition.value.trim() !== ''
  }
  return true
}

export function evaluateFilterCondition(
  condition: TableFilterCondition,
  rawCase: Record<string, string | number>,
  labeledCase: Record<string, string>,
  runtime: FilterRuntime,
) {
  if (!isConditionReady(condition)) return true

  if (condition.operator === 'is_blank') {
    return runtime.getTextValue(condition.variableName, rawCase, labeledCase).trim() === ''
  }
  if (condition.operator === 'not_blank') {
    return runtime.getTextValue(condition.variableName, rawCase, labeledCase).trim() !== ''
  }

  if (condition.operator === 'in' || condition.operator === 'not_in') {
    const selectedSet = new Set(condition.values)
    const valueKeys = runtime.getValueKeys(condition.variableName, rawCase, labeledCase)
    const hasMatch = valueKeys.some(value => selectedSet.has(value))
    return condition.operator === 'in' ? hasMatch : !hasMatch
  }

  if (condition.operator === 'contains' || condition.operator === 'not_contains') {
    const haystack = normalizeText(runtime.getTextValue(condition.variableName, rawCase, labeledCase))
    const needle = normalizeText(condition.value)
    const hasMatch = needle === '' ? true : haystack.includes(needle)
    return condition.operator === 'contains' ? hasMatch : !hasMatch
  }

  const numericValue = runtime.getNumericValue(condition.variableName, rawCase, labeledCase)
  if (numericValue == null) return false

  const primary = Number(condition.value)
  const secondary = Number(condition.secondaryValue)

  if ((condition.operator === 'gt' || condition.operator === 'gte' || condition.operator === 'lt' || condition.operator === 'lte') && !Number.isFinite(primary)) {
    return false
  }
  if (condition.operator === 'between' && (!Number.isFinite(primary) || !Number.isFinite(secondary))) {
    return false
  }

  if (condition.operator === 'gt') return numericValue > primary
  if (condition.operator === 'gte') return numericValue >= primary
  if (condition.operator === 'lt') return numericValue < primary
  if (condition.operator === 'lte') return numericValue <= primary

  const [minValue, maxValue] = primary <= secondary ? [primary, secondary] : [secondary, primary]
  return numericValue >= minValue && numericValue <= maxValue
}

export function evaluateFilterGroup(
  group: TableFilterGroup,
  rawCase: Record<string, string | number>,
  labeledCase: Record<string, string>,
  runtime: FilterRuntime,
) {
  if (group.conditions.length === 0) return true
  const matches = group.conditions.map(condition => evaluateFilterCondition(condition, rawCase, labeledCase, runtime))
  return group.join === 'all'
    ? matches.every(Boolean)
    : matches.some(Boolean)
}

export function evaluateFilterSpec(
  spec: TableFilterSpec | null | undefined,
  rawCase: Record<string, string | number>,
  labeledCase: Record<string, string>,
  runtime: FilterRuntime,
) {
  if (!spec || spec.groups.length === 0) return true
  const activeGroups = spec.groups.filter(group => group.conditions.length > 0)
  if (activeGroups.length === 0) return true
  const matches = activeGroups.map(group => evaluateFilterGroup(group, rawCase, labeledCase, runtime))
  return spec.rootJoin === 'all'
    ? matches.every(Boolean)
    : matches.some(Boolean)
}
