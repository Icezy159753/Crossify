import type { CrosstabConfig, CrosstabResult } from './crosstabEngine'
import { normalizeCode } from './appStateUtils'

const ASYNC_YIELD_EVERY = 250

function yieldToBrowser() {
  return new Promise<void>(resolve => {
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => resolve())
      return
    }
    setTimeout(() => resolve(), 0)
  })
}
import type { SpssVariable } from './savParser'

export interface VariableListItem {
  name: string
  label: string
  longName: string
  isString: boolean
  valueLabels: Record<string, string>
  isGroupedMA?: boolean
  memberNames?: string[]
}

interface GroupedOption {
  memberName: string
  label: string
  order: number
  selectedCodes: Set<string>
  valueCode?: string
}

export interface GroupedVariableDef {
  name: string
  label: string
  longName: string
  options: GroupedOption[]
  memberNames: string[]
  aggregateByCode: boolean
}

export interface VariableCatalog {
  list: VariableListItem[]
  byName: Map<string, VariableListItem>
  groupedByName: Map<string, GroupedVariableDef>
}

export interface GroupedRawValueSummary {
  memberName: string
  counts: Array<{ code: string; count: number }>
}

/** User-defined MA group (from MRSET sheet in settings file) */
export interface MrsetDefinition {
  groupName: string   // e.g. "Q8J_R2_O" — must end with _O by convention
  label: string       // display label
  members: string[]   // short variable names, e.g. ["Q8J_R2$1","Q8J_R2$2",...]
}

/**
 * Returns the name to use for MA grouping detection.
 * Prefers longName, but falls back to shortName if longName doesn't carry
 * an MA suffix — e.g. SPSS sometimes strips $ from longName, turning
 * "Q8J_R2$1" (shortName) into "Q8J_R2_1" (longName, no match).
 */
function getGroupingSource(variable: SpssVariable): string {
  const longSrc = variable.longName || variable.name
  if (parseGroupedName(longSrc)) return longSrc
  // longName doesn't carry an MA pattern — try the raw shortName
  if (variable.name && variable.name !== longSrc && parseGroupedName(variable.name)) {
    return variable.name
  }
  return longSrc
}

const NEGATIVE_HINTS = [
  'no',
  'none',
  'not',
  'never',
  'without',
  'do not',
  'did not',
  'not selected',
  'not choose',
  'not chosen',
  'not mention',
  'ไม่',
  'ไม่มี',
  'ไม่เคย',
  'ไม่ได้',
  'ไม่ใช่',
  'ไม่เลือก',
]

const POSITIVE_HINTS = [
  'yes',
  'selected',
  'choose',
  'chosen',
  'mention',
  'used',
  'use',
  'เลือก',
  'เคย',
  'ใช้',
  'มี',
]

function parseGroupedName(name: string): { base: string; index: number } | null {
  const normalizedName = name.trim()
  const match = normalizedName.match(/^(.*?)(?:[$&](\d+)|_O(\d+))$/i)
  if (!match) return null
  const base = match[1].trim()
  const index = Number(match[2] ?? match[3])
  if (!base || !Number.isFinite(index)) return null
  return { base, index }
}

function buildGroupedName(name: string) {
  const parsed = parseGroupedName(name)
  return parsed ? `${parsed.base}_O` : name
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase()
}

function hasAnyHint(value: string, hints: string[]) {
  const normalized = normalizeText(value)
  return hints.some(hint => normalized.includes(hint))
}

function inferSelectedCodes(variable: SpssVariable): Set<string> {
  const entries = Object.entries(variable.valueLabels)
  if (entries.length === 0) return new Set(['1'])

  const positives = entries.filter(([, label]) => hasAnyHint(label, POSITIVE_HINTS))
  if (positives.length === 1) return new Set([positives[0][0]])

  const negatives = entries.filter(([, label]) => hasAnyHint(label, NEGATIVE_HINTS))
  if (entries.length === 2 && negatives.length === 1) {
    return new Set(entries.filter(([code]) => code !== negatives[0][0]).map(([code]) => code))
  }

  const sortedNumeric = entries
    .map(([code]) => Number(code))
    .filter(code => Number.isFinite(code))
    .sort((a, b) => a - b)

  if (sortedNumeric.includes(0) && sortedNumeric.includes(1)) return new Set(['1'])

  const firstPositive = sortedNumeric.find(code => code > 0)
  if (firstPositive != null) return new Set([String(firstPositive)])

  return new Set([entries[0][0]])
}

function buildMergedOptionLabel(
  groupedName: string,
  index: number,
  baseVar?: SpssVariable
) {
  const code = String(index)
  const label = baseVar?.valueLabels[code]
  if (label) return `${code}. ${label}`
  return `${groupedName}${index}`
}

function getMergedValueLabels(
  members: SpssVariable[]
): Array<[string, string]> {
  const merged = new Map<string, string>()

  for (const member of members) {
    for (const [code, label] of Object.entries(member.valueLabels)) {
      const normalizedCode = normalizeCode(code)
      if (!normalizedCode) continue
      if (!merged.has(normalizedCode)) merged.set(normalizedCode, label)
    }
  }

  return [...merged.entries()].sort(([a], [b]) => Number(a) - Number(b))
}

function getObservedCodes(
  memberNames: string[],
  rawCases: Record<string, string | number>[],
): string[] {
  const observed = new Set<string>()

  for (const rawCase of rawCases) {
    for (const memberName of memberNames) {
      const normalized = normalizeCode(rawCase[memberName])
      if (!normalized || normalized === '0') continue
      observed.add(normalized)
    }
  }

  return [...observed].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
}

function getCodeOptions(
  members: SpssVariable[],
  rawCases: Record<string, string | number>[] = [],
): GroupedOption[] {
  const entries = new Map(getMergedValueLabels(members))
  const observedCodes = getObservedCodes(members.map(member => member.name), rawCases)
  observedCodes.forEach(code => {
    if (!entries.has(code)) entries.set(code, code)
  })

  const mergedEntries = [...entries.entries()]
    .sort(([a], [b]) => Number(a) - Number(b))
  if (mergedEntries.length === 0) return []
  return mergedEntries
    .map(([code, label], idx) => ({
      memberName: `${members[0]?.name ?? 'group'}#code:${code}`,
      label: `${code}. ${label}`,
      order: idx + 1,
      selectedCodes: new Set<string>(),
      valueCode: normalizeCode(code),
    }))
}

function isLikelyDichotomySet(members: SpssVariable[]) {
  if (members.length === 0) return false

  const codeSets = members
    .map(member => Object.keys(member.valueLabels)
      .map(code => normalizeCode(code))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    )

  const nonEmptyCodeSets = codeSets.filter(codes => codes.length > 0)
  if (nonEmptyCodeSets.length === 0) return false

  const union = new Set(nonEmptyCodeSets.flat())
  if (union.size === 0 || union.size > 3) return false
  if (![...union].every(code => code === '0' || code === '1' || code === '2')) return false

  const signatures = new Set(nonEmptyCodeSets.map(codes => codes.join('|')))
  if (signatures.size > 2) return false

  return nonEmptyCodeSets.every(codes => {
    if (codes.length > 3) return false
    const uniqueCodes = new Set(codes)
    if (uniqueCodes.size <= 2) return true
    return [...uniqueCodes].every(code => code === '0' || code === '1' || code === '2')
  })
}

export function buildVariableCatalog(
  variables: SpssVariable[],
  customMrsets: MrsetDefinition[] = [],
  rawCases: Record<string, string | number>[] = [],
): VariableCatalog {
  const groupedSeed = new Map<string, Array<{ variable: SpssVariable; index: number }>>()

  for (const variable of variables) {
    const parsed = parseGroupedName(getGroupingSource(variable))
    if (!parsed) continue
    const groupedName = `${parsed.base}_O`
    const current = groupedSeed.get(groupedName) ?? []
    current.push({ variable, index: parsed.index })
    groupedSeed.set(groupedName, current)
  }

  // Build set of all shortNames consumed by MA groups (≥2 members)
  const consumedByGroup = new Set<string>()
  for (const [, members] of groupedSeed) {
    if (members.length >= 2) {
      for (const { variable } of members) {
        consumedByGroup.add(variable.name)
      }
    }
  }

  const list: VariableListItem[] = []
  const byName = new Map<string, VariableListItem>()
  const groupedByName = new Map<string, GroupedVariableDef>()
  const insertedGroups = new Set<string>()

  for (const variable of variables) {
    const groupedName = buildGroupedName(getGroupingSource(variable))
    const members = groupedSeed.get(groupedName)

    if (!members || members.length < 2) {
      // Skip variables whose shortName is consumed by an MA group —
      // e.g. Q8J_R2$1 has longName "Q8J_R2" which doesn't match MA pattern,
      // but its shortName IS an MA group member → don't create phantom entry.
      if (consumedByGroup.has(variable.name)) continue

      // Use longName as the canonical name — avoids collisions with MA group names.
      const canonicalName = variable.longName || variable.name

      // Skip if this canonical name was already inserted (prevents duplicates)
      if (byName.has(canonicalName)) continue

      const item: VariableListItem = {
        name: canonicalName,
        label: variable.label,
        longName: variable.longName,
        isString: variable.isString,
        valueLabels: variable.valueLabels,
      }
      list.push(item)
      byName.set(item.name, item)
      continue
    }

    if (insertedGroups.has(groupedName)) continue
    insertedGroups.add(groupedName)

    const sortedMembers = [...members].sort((a, b) => a.index - b.index)
    const firstMember = sortedMembers[0]?.variable
    const baseVarName = firstMember ? parseGroupedName(getGroupingSource(firstMember))?.base ?? groupedName : groupedName
    const baseVar = variables.find(variable =>
      variable.name === baseVarName || variable.longName === baseVarName
    )
    const memberVars = sortedMembers.map(({ variable }) => variable)
    const codeOptions = getCodeOptions(memberVars, rawCases)
    const aggregateByCode = codeOptions.length > 0 && !isLikelyDichotomySet(memberVars)
    const optionEntries = aggregateByCode
      ? codeOptions
      : sortedMembers.map(({ variable, index }) => ({
          memberName: variable.name,
          label: buildMergedOptionLabel(groupedName, index, baseVar),
          order: index,
          selectedCodes: inferSelectedCodes(variable),
        }))

    // Label fallback: baseVar → first member → groupedName
    // LongName fallback: baseVar → groupedName-without-_O suffix (always unique per group)
    // Deliberately skip firstMember.longName — SPSS often assigns the same longName
    // to all members of a group (e.g. all Q8J_Rx$y get longName "Q8J_R2"),
    // which would make every group's subtitle look identical.
    const firstMemberVar = firstMember
    const resolvedLabel = baseVar?.label || firstMemberVar?.label || groupedName
    const resolvedLongName = baseVar?.longName || groupedName.replace(/_O$/, '')

    const groupedItem: VariableListItem = {
      name: groupedName,
      label: resolvedLabel,
      longName: resolvedLongName,
      isString: false,
      valueLabels: Object.fromEntries(optionEntries.map((option, idx) => [String(idx + 1), option.label])),
      isGroupedMA: true,
      memberNames: sortedMembers.map(({ variable }) => variable.name),
    }

    const groupedDef: GroupedVariableDef = {
      name: groupedName,
      label: resolvedLabel,
      longName: resolvedLongName,
      options: optionEntries,
      memberNames: sortedMembers.map(({ variable }) => variable.name),
      aggregateByCode,
    }

    list.push(groupedItem)
    byName.set(groupedItem.name, groupedItem)
    groupedByName.set(groupedName, groupedDef)
  }

  // ── Apply custom MRSET definitions (from settings file) ──────────────────
  // These can override auto-detected groups OR define new groups not detected.
  const varByAnyName = new Map<string, SpssVariable>()
  variables.forEach(variable => {
    varByAnyName.set(variable.name, variable)
    if (variable.longName) varByAnyName.set(variable.longName, variable)
  })

  for (const mrset of customMrsets) {
    const { groupName, label, members } = mrset
    if (!groupName || members.length < 2) continue

    const memberVars = members.map(member => varByAnyName.get(member)).filter(Boolean) as SpssVariable[]
    if (memberVars.length < 2) continue
    const resolvedMemberNames = memberVars.map(variable => variable.name)

    // Build options from member variables (same logic as auto-detection)
    const memberEntries: Array<{ variable: SpssVariable; index: number }> =
      memberVars.map((v, i) => ({ variable: v, index: i + 1 }))
    const baseVar = memberVars[0]
    const codeOptions = getCodeOptions(memberVars, rawCases)
    const aggregateByCode = codeOptions.length > 0 && !isLikelyDichotomySet(memberVars)
    const optionEntries = aggregateByCode
      ? codeOptions
      : memberEntries.map(({ variable, index }) => ({
          memberName: variable.name,
          label: buildMergedOptionLabel(groupName, index, baseVar),
          order: index,
          selectedCodes: inferSelectedCodes(variable),
        }))

    const customItem: VariableListItem = {
      name: groupName,
      label: label || baseVar.label || groupName,
      longName: label || baseVar.longName || groupName,
      isString: false,
      valueLabels: Object.fromEntries(optionEntries.map((opt, idx) => [String(idx + 1), opt.label])),
      isGroupedMA: true,
      memberNames: resolvedMemberNames,
    }
    const customDef: GroupedVariableDef = {
      name: groupName,
      label: label || baseVar.label || groupName,
      longName: label || baseVar.longName || groupName,
      options: optionEntries,
      memberNames: resolvedMemberNames,
      aggregateByCode,
    }

    // Override or insert at correct position (replace individual member items)
    if (byName.has(groupName)) {
      // Replace existing auto-detected group
      const existingIdx = list.findIndex(item => item.name === groupName)
      if (existingIdx >= 0) list[existingIdx] = customItem
    } else {
      // Find the first member variable in the list, insert group before it,
      // and remove all individual member entries
      const firstMemberIdx = list.findIndex(item => resolvedMemberNames.includes(item.name))
      if (firstMemberIdx >= 0) {
        list.splice(firstMemberIdx, 0, customItem)
        // Remove individual member items that are now part of this group
        for (let i = list.length - 1; i >= 0; i--) {
          if (list[i].name !== groupName && resolvedMemberNames.includes(list[i].name)) {
            list.splice(i, 1)
          }
        }
      } else {
        list.push(customItem)
      }
    }
    byName.set(groupName, customItem)
    groupedByName.set(groupName, customDef)
  }

  // ── Apply user-created Grid variables ────────────────────────────────────
  // Grid variables from the "สร้าง Grid" UI have isGridUserCreated=true,
  // isGroupedMA=true, and memberNames[]. Each member is a dichotomy option.
  for (const variable of variables) {
    const v = variable as SpssVariable & { isGridUserCreated?: boolean; isGroupedMA?: boolean; memberNames?: string[]; gridMembers?: Array<{ name: string; label: string }> }
    if (!v.isGridUserCreated || !v.isGroupedMA || !v.memberNames || v.memberNames.length < 2) continue
    const gridName = v.name

    // Skip if already registered (from auto-detect or custom MRSET)
    if (groupedByName.has(gridName)) continue

    const resolvedMemberNames = v.memberNames
    const memberVars = resolvedMemberNames.map(mn => varByAnyName.get(mn)).filter(Boolean) as SpssVariable[]
    if (memberVars.length < 2) continue

    // Grid members are always dichotomy: each member is an option
    const gridMemberLabels = v.gridMembers || resolvedMemberNames.map((mn) => ({ name: mn, label: mn }))
    const optionEntries: GroupedOption[] = memberVars.map((mv, idx) => ({
      memberName: mv.name,
      label: gridMemberLabels[idx]?.label || mv.label || mv.name,
      order: idx + 1,
      selectedCodes: inferSelectedCodes(mv),
    }))

    const gridItem: VariableListItem = {
      name: gridName,
      label: v.label || gridName,
      longName: v.longName || gridName,
      isString: false,
      valueLabels: Object.fromEntries(optionEntries.map((opt, idx) => [String(idx + 1), opt.label])),
      isGroupedMA: true,
      memberNames: resolvedMemberNames,
    }
    const gridDef: GroupedVariableDef = {
      name: gridName,
      label: v.label || gridName,
      longName: v.longName || gridName,
      options: optionEntries,
      memberNames: resolvedMemberNames,
      aggregateByCode: false, // Grid members are dichotomy
    }

    // Override or append
    if (byName.has(gridName)) {
      const existingIdx = list.findIndex(item => item.name === gridName)
      if (existingIdx >= 0) list[existingIdx] = gridItem
    } else {
      list.push(gridItem)
    }
    byName.set(gridName, gridItem)
    groupedByName.set(gridName, gridDef)
  }

  return { list, byName, groupedByName }
}

function buildOrder(preferredOrder: string[] | undefined, dataSet: Set<string>): string[] {
  if (preferredOrder && preferredOrder.length > 0) {
    const extra = [...dataSet].filter(value => !preferredOrder.includes(value))
    return [...preferredOrder, ...extra]
  }
  return [...dataSet]
}

function isSelectedValue(rawValue: string | number | undefined, option: GroupedOption) {
  if (rawValue == null || rawValue === '') return false
  const normalized = String(rawValue).trim()
  if (option.selectedCodes.has(normalized)) return true

  const numeric = Number(normalized)
  if (Number.isFinite(numeric) && option.selectedCodes.has(String(numeric))) return true

  if (option.selectedCodes.size === 1 && option.selectedCodes.has('1')) {
    return normalized !== '0'
  }

  return false
}

function getSelectedOptionLabels(grouped: GroupedVariableDef, rawCase: Record<string, string | number>) {
  return grouped.options
    .filter(option => isSelectedValue(rawCase[option.memberName], option))
    .map(option => option.label)
}

function getAggregatedCodeLabels(grouped: GroupedVariableDef, rawCase: Record<string, string | number>) {
  const labels: string[] = []
  const optionByCode = new Map(
    grouped.options
      .filter(option => option.valueCode)
      .map(option => [option.valueCode!, option.label])
  )
  const hasZeroOption = optionByCode.has('0')

  for (const memberName of grouped.memberNames) {
    const normalized = normalizeCode(rawCase[memberName])
    if (!normalized) continue
    if (normalized === '0' && !hasZeroOption) continue

    const matched = optionByCode.get(normalized)
    if (matched) {
      labels.push(matched)
      continue
    }
  }

  return labels
}

function hasAnyGroupedAnswer(grouped: GroupedVariableDef, rawCase: Record<string, string | number>) {
  const validCodes = new Set(
    grouped.options
      .map(option => option.valueCode)
      .filter((value): value is string => Boolean(value))
  )
  const hasZeroOption = validCodes.has('0')

  return grouped.memberNames.some(memberName => {
    const normalized = normalizeCode(rawCase[memberName])
    if (!normalized) return false
    if (normalized === '0' && !hasZeroOption) return false
    return true
  })
}

export function getGroupedBaseCount(
  grouped: GroupedVariableDef,
  rawCases: Record<string, string | number>[],
) {
  let count = 0
  for (const rawCase of rawCases) {
    if (hasAnyGroupedAnswer(grouped, rawCase)) count += 1
  }
  return count
}

export function summarizeGroupedRawValues(
  grouped: GroupedVariableDef,
  rawCases: Record<string, string | number>[],
  limit = 6,
): GroupedRawValueSummary[] {
  return grouped.memberNames.map(memberName => {
    const counts = new Map<string, number>()
    for (const rawCase of rawCases) {
      const normalized = normalizeCode(rawCase[memberName])
      if (!normalized) continue
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
    }

    return {
      memberName,
      counts: [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' }))
        .slice(0, limit)
        .map(([code, count]) => ({ code, count })),
    }
  })
}

/** Return all selected option labels for a case — used by composite engine for MA-aware axis building */
export function getGroupedSelections(
  grouped: GroupedVariableDef,
  rawCase: Record<string, string | number>,
): string[] {
  return grouped.aggregateByCode
    ? getAggregatedCodeLabels(grouped, rawCase)
    : getSelectedOptionLabels(grouped, rawCase)
}

export function computeGroupedCrosstab(
  rawCases: Record<string, string | number>[],
  labeledCases: Record<string, string>[],
  config: CrosstabConfig,
  grouped: GroupedVariableDef,
  groupedSide: 'row' | 'column',
  otherLabel: string,
  otherOrder?: string[],
): CrosstabResult {
  const otherVar = groupedSide === 'row' ? config.colVar : config.rowVar
  const otherValueSet = new Set<string>()

  for (const row of labeledCases) {
    const value = row[otherVar]
    if (value != null && value !== '') otherValueSet.add(String(value))
  }

  const otherValues = buildOrder(otherOrder, otherValueSet)
  if (otherValues.length === 0) {
    throw new Error(`No usable data for "${grouped.name}" x "${otherVar}"`)
  }

  const optionValues = grouped.options.map(option => option.label)
  const counts =
    groupedSide === 'row'
      ? optionValues.map(() => otherValues.map(() => 0))
      : otherValues.map(() => optionValues.map(() => 0))

  const rowTotalsN = groupedSide === 'row'
    ? optionValues.map(() => 0)
    : otherValues.map(() => 0)
  const colTotalsN = groupedSide === 'row'
    ? otherValues.map(() => 0)
    : optionValues.map(() => 0)

  const otherIndex = new Map(otherValues.map((value, index) => [value, index]))
  const optionIndex = new Map(optionValues.map((value, index) => [value, index]))
  let grandTotal = 0

  for (let i = 0; i < labeledCases.length; i++) {
    const otherValue = labeledCases[i]?.[otherVar]
    if (otherValue == null || otherValue === '') continue

    const otherIdx = otherIndex.get(String(otherValue))
    if (otherIdx == null) continue

    const rawCase = rawCases[i] ?? {}
    if (!hasAnyGroupedAnswer(grouped, rawCase)) continue

    grandTotal += 1
    const selectedLabels = grouped.aggregateByCode
      ? getAggregatedCodeLabels(grouped, rawCase)
      : getSelectedOptionLabels(grouped, rawCase)

    if (groupedSide === 'row') {
      colTotalsN[otherIdx] += 1
      for (const selectedLabel of selectedLabels) {
        const rowIdx = optionIndex.get(selectedLabel)
        if (rowIdx == null) continue
        counts[rowIdx][otherIdx] += 1
        rowTotalsN[rowIdx] += 1
      }
    } else {
      rowTotalsN[otherIdx] += 1
      for (const selectedLabel of selectedLabels) {
        const colIdx = optionIndex.get(selectedLabel)
        if (colIdx == null) continue
        counts[otherIdx][colIdx] += 1
        colTotalsN[colIdx] += 1
      }
    }
  }

  return groupedSide === 'row'
    ? {
        rowVar: grouped.name,
        colVar: otherVar,
        rowLabel: grouped.label,
        colLabel: otherLabel,
        rowValues: optionValues,
        colValues: otherValues,
        rowLevelLabels: [grouped.label],
        colLevelLabels: [otherLabel],
        rowPaths: optionValues.map(value => [value]),
        colPaths: otherValues.map(value => [value]),
        counts,
        rowTotalsN,
        colTotalsN,
        grandTotal,
      }
    : {
        rowVar: otherVar,
        colVar: grouped.name,
        rowLabel: otherLabel,
        colLabel: grouped.label,
        rowValues: otherValues,
        colValues: optionValues,
        rowLevelLabels: [otherLabel],
        colLevelLabels: [grouped.label],
        rowPaths: otherValues.map(value => [value]),
        colPaths: optionValues.map(value => [value]),
        counts,
        rowTotalsN,
        colTotalsN,
        grandTotal,
      }
}

export async function computeGroupedCrosstabAsync(
  rawCases: Record<string, string | number>[],
  labeledCases: Record<string, string>[],
  config: CrosstabConfig,
  grouped: GroupedVariableDef,
  groupedSide: 'row' | 'column',
  otherLabel: string,
  otherOrder?: string[],
): Promise<CrosstabResult> {
  const otherVar = groupedSide === 'row' ? config.colVar : config.rowVar
  const otherValueSet = new Set<string>()

  for (let index = 0; index < labeledCases.length; index++) {
    if (index > 0 && index % ASYNC_YIELD_EVERY === 0) {
      await yieldToBrowser()
    }
    const value = labeledCases[index]?.[otherVar]
    if (value != null && value !== '') otherValueSet.add(String(value))
  }

  const otherValues = buildOrder(otherOrder, otherValueSet)
  if (otherValues.length === 0) {
    throw new Error(`No usable data for "${grouped.name}" x "${otherVar}"`)
  }

  const optionValues = grouped.options.map(option => option.label)
  const counts =
    groupedSide === 'row'
      ? optionValues.map(() => otherValues.map(() => 0))
      : otherValues.map(() => optionValues.map(() => 0))

  const rowTotalsN = groupedSide === 'row'
    ? optionValues.map(() => 0)
    : otherValues.map(() => 0)
  const colTotalsN = groupedSide === 'row'
    ? otherValues.map(() => 0)
    : optionValues.map(() => 0)

  const otherIndex = new Map(otherValues.map((value, index) => [value, index]))
  const optionIndex = new Map(optionValues.map((value, index) => [value, index]))
  let grandTotal = 0

  for (let i = 0; i < labeledCases.length; i++) {
    if (i > 0 && i % ASYNC_YIELD_EVERY === 0) {
      await yieldToBrowser()
    }

    const otherValue = labeledCases[i]?.[otherVar]
    if (otherValue == null || otherValue === '') continue

    const otherIdx = otherIndex.get(String(otherValue))
    if (otherIdx == null) continue

    const rawCase = rawCases[i] ?? {}
    if (!hasAnyGroupedAnswer(grouped, rawCase)) continue

    grandTotal += 1
    const selectedLabels = grouped.aggregateByCode
      ? getAggregatedCodeLabels(grouped, rawCase)
      : getSelectedOptionLabels(grouped, rawCase)

    if (groupedSide === 'row') {
      colTotalsN[otherIdx] += 1
      for (const selectedLabel of selectedLabels) {
        const rowIdx = optionIndex.get(selectedLabel)
        if (rowIdx == null) continue
        counts[rowIdx][otherIdx] += 1
        rowTotalsN[rowIdx] += 1
      }
    } else {
      rowTotalsN[otherIdx] += 1
      for (const selectedLabel of selectedLabels) {
        const colIdx = optionIndex.get(selectedLabel)
        if (colIdx == null) continue
        counts[otherIdx][colIdx] += 1
        colTotalsN[colIdx] += 1
      }
    }
  }

  return groupedSide === 'row'
    ? {
        rowVar: grouped.name,
        colVar: otherVar,
        rowLabel: grouped.label,
        colLabel: otherLabel,
        rowValues: optionValues,
        colValues: otherValues,
        rowLevelLabels: [grouped.label],
        colLevelLabels: [otherLabel],
        rowPaths: optionValues.map(value => [value]),
        colPaths: otherValues.map(value => [value]),
        counts,
        rowTotalsN,
        colTotalsN,
        grandTotal,
      }
    : {
        rowVar: otherVar,
        colVar: grouped.name,
        rowLabel: otherLabel,
        colLabel: grouped.label,
        rowValues: otherValues,
        colValues: optionValues,
        rowLevelLabels: [otherLabel],
        colLevelLabels: [grouped.label],
        rowPaths: otherValues.map(value => [value]),
        colPaths: optionValues.map(value => [value]),
        counts,
        rowTotalsN,
        colTotalsN,
        grandTotal,
      }
}
