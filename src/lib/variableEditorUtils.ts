export interface VariableEditorRow {
  key: string
  code: string
  label: string
  count: number
  percent: number
  factor: string
  autoFactor?: boolean
  rowKind?: 'code' | 'net' | 'summary'
  groupId?: string
  indentLevel?: number
  members?: string[]
}

export interface VariableNetGroup {
  id: string
  name: string
  members: string[]
  parentId?: string | null
}

export interface VariableSummaryRow {
  code: string
  label: string
  members: string[]
}

export type ScaleSummaryPresetType =
  | 'tb_low_good'
  | 'tb_high_good'
  | 't2b_low_good'
  | 't2b_high_good'
  | 't3b_low_good'
  | 't3b_high_good'
  | 'justright_code'
  | 'justright_centered'

export function getNetPrefix(depth: number) {
  if (depth <= 0) return 'Net : '
  return `${'Sub'.repeat(depth)}net : `
}

export function getGroupDepth(group: VariableNetGroup, groups: VariableNetGroup[]): number {
  let depth = 0
  let currentParentId = group.parentId
  const seen = new Set<string>()
  while (currentParentId) {
    if (seen.has(currentParentId)) break
    seen.add(currentParentId)
    const parent = groups.find(item => item.id === currentParentId)
    if (!parent) break
    depth += 1
    currentParentId = parent.parentId
  }
  return depth
}

export function buildVariableEditorDisplayRows(rows: VariableEditorRow[], groups: VariableNetGroup[]) {
  const codeRows = rows.filter(row => row.rowKind !== 'net')
  if (groups.length === 0) return codeRows

  const groupMeta = groups
    .map(group => {
      const members = codeRows.filter(row => group.members.includes(row.key))
      if (members.length === 0) return null
      const firstIndex = codeRows.findIndex(row => row.key === members[0].key)
      if (firstIndex < 0) return null
      const depth = getGroupDepth(group, groups)
      return {
        group,
        insertBefore: firstIndex,
        depth,
        row: {
          key: `__net__${group.id}`,
          code: '',
          label: `${getNetPrefix(depth)}${group.name}`,
          count: members.reduce((sum, row) => sum + row.count, 0),
          percent: members.reduce((sum, row) => sum + row.percent, 0),
          factor: '',
          rowKind: 'net' as const,
          groupId: group.id,
          indentLevel: depth,
        },
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.insertBefore - b.insertBefore || a.depth - b.depth)

  const deepestGroupDepthByCode = new Map<string, number>()
  groupMeta.forEach(item => {
    item.group.members.forEach(member => {
      deepestGroupDepthByCode.set(member, Math.max(deepestGroupDepthByCode.get(member) ?? -1, item.depth))
    })
  })

  const next: VariableEditorRow[] = []
  let insertIndex = 0
  codeRows.forEach((row, rowIndex) => {
    while (groupMeta[insertIndex]?.insertBefore === rowIndex) {
      next.push(groupMeta[insertIndex].row)
      insertIndex += 1
    }
    const depth = deepestGroupDepthByCode.get(row.key)
    next.push({
      ...row,
      indentLevel: depth != null ? depth + 1 : 0,
    })
  })
  while (insertIndex < groupMeta.length) {
    next.push(groupMeta[insertIndex].row)
    insertIndex += 1
  }
  return next
}

export function buildVariableEditorRowsWithSummaries(
  rows: VariableEditorRow[],
  groups: VariableNetGroup[],
  summaries: VariableSummaryRow[],
) {
  const displayRows = buildVariableEditorDisplayRows(rows, groups)
  if (summaries.length === 0) return displayRows

  const baseCount = rows.reduce((sum, row) => sum + row.count, 0)
  return [
    ...displayRows,
    ...summaries.map(summary => {
      const memberSet = new Set(summary.members)
      const count = rows
        .filter(row => memberSet.has(row.key))
        .reduce((sum, row) => sum + row.count, 0)
      return {
        key: `__summary__${summary.code}`,
        code: summary.code,
        label: summary.label,
        count,
        percent: baseCount > 0 ? (count / baseCount) * 100 : 0,
        factor: '',
        rowKind: 'summary' as const,
        members: [...summary.members],
      }
    }),
  ]
}

export function buildScaleSummaryPreset(
  rows: Array<Pick<VariableEditorRow, 'key' | 'code'>>,
  preset: ScaleSummaryPresetType,
) {
  if (rows.length === 0) {
    throw new Error('No scale codes available')
  }

  const sortedRows = [...rows].sort((a, b) => {
    const aNum = Number(a.code)
    const bNum = Number(b.code)
    if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum - bNum
    return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' })
  })

  if (preset === 'justright_centered') {
    if (sortedRows.length !== 5) {
      throw new Error('Justright (-2 -1 0 1 2) requires exactly 5 coded rows')
    }
    return {
      factors: Object.fromEntries(
        sortedRows.map((row, index) => [row.key, String(index - 2)])
      ),
      summaries: [] as VariableSummaryRow[],
    }
  }

  if (preset === 'justright_code') {
    return {
      factors: Object.fromEntries(
        sortedRows.map((row, index) => [row.key, String(index + 1)])
      ),
      summaries: [] as VariableSummaryRow[],
    }
  }

  const lowGood = preset === 'tb_low_good' || preset === 't2b_low_good' || preset === 't3b_low_good'
  const factors = Object.fromEntries(
    sortedRows.map((row, index) => [row.key, String(lowGood ? sortedRows.length - index : index + 1)])
  )

  const first = sortedRows[0]?.key
  const second = sortedRows[1]?.key
  const third = sortedRows[2]?.key
  const last = sortedRows[sortedRows.length - 1]?.key
  const penultimate = sortedRows[sortedRows.length - 2]?.key
  const antepenultimate = sortedRows[sortedRows.length - 3]?.key

  if (!first || !last) {
    throw new Error('Scale needs at least one coded row')
  }

  const wantsT2B = preset === 't2b_low_good' || preset === 't2b_high_good' || preset === 't3b_low_good' || preset === 't3b_high_good'
  const wantsT3B = preset === 't3b_low_good' || preset === 't3b_high_good'

  const summaries: VariableSummaryRow[] = lowGood
    ? [
        { code: 'TB', label: 'TB', members: [first] },
        ...(wantsT2B && second ? [{ code: 'T2B', label: 'T2B', members: [first, second] }] : []),
        ...(wantsT3B && second && third ? [{ code: 'T3B', label: 'T3B', members: [first, second, third] }] : []),
        { code: 'BB', label: 'BB', members: [last] },
        ...(wantsT2B && penultimate ? [{ code: 'B2B', label: 'B2B', members: [penultimate, last] }] : []),
        ...(wantsT3B && antepenultimate && penultimate ? [{ code: 'B3B', label: 'B3B', members: [antepenultimate, penultimate, last] }] : []),
      ]
    : [
        { code: 'TB', label: 'TB', members: [last] },
        ...(wantsT2B && penultimate ? [{ code: 'T2B', label: 'T2B', members: [last, penultimate] }] : []),
        ...(wantsT3B && antepenultimate && penultimate ? [{ code: 'T3B', label: 'T3B', members: [last, penultimate, antepenultimate] }] : []),
        { code: 'BB', label: 'BB', members: [first] },
        ...(wantsT2B && second ? [{ code: 'B2B', label: 'B2B', members: [first, second] }] : []),
        ...(wantsT3B && second && third ? [{ code: 'B3B', label: 'B3B', members: [first, second, third] }] : []),
      ]

  return {
    factors,
    summaries,
  }
}
