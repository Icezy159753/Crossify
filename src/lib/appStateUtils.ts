export const LEVEL_JOIN = ' || '
export const ADD_JOIN = ' ++ '
const AXIS_BRANCH_PREFIX = '__AXIS2__:'

export type AxisSpec = string[][]

function uniquePush(items: string[], value: string) {
  if (!items.includes(value)) items.push(value)
}

function dedupeBranches(branches: AxisSpec): AxisSpec {
  const seen = new Set<string>()
  const next: AxisSpec = []
  branches.forEach(branch => {
    const cleaned = branch.filter(Boolean)
    if (cleaned.length === 0) return
    const key = cleaned.join('\u001f')
    if (seen.has(key)) return
    seen.add(key)
    next.push(cleaned)
  })
  return next
}

function parseLegacyLevels(value: string): string[][] {
  return value
    .split(LEVEL_JOIN)
    .map(level => {
      const trimmed = level.trim()
      if (!trimmed) return []
      return trimmed.includes(ADD_JOIN)
        ? trimmed.split(ADD_JOIN).map(v => v.trim()).filter(Boolean)
        : [trimmed]
    })
    .filter(level => level.length > 0)
}

function cartesianLevelsToBranches(levels: string[][]): AxisSpec {
  if (levels.length === 0) return []

  let branches: AxisSpec = [[]]
  levels.forEach(level => {
    const next: AxisSpec = []
    branches.forEach(branch => {
      level.forEach(item => {
        next.push([...branch, item])
      })
    })
    branches = next
  })

  return dedupeBranches(branches)
}

function serializeLegacyLevels(branches: AxisSpec): string | null {
  const displayLevels = getAxisDisplayLevels(branches)
  if (displayLevels.length === 0) return null

  const reconstructed = dedupeBranches(cartesianLevelsToBranches(displayLevels))
  const normalized = dedupeBranches(branches)
  if (reconstructed.length !== normalized.length) return null

  const reconstructedSet = new Set(reconstructed.map(branch => branch.join('\u001f')))
  const normalizedSet = new Set(normalized.map(branch => branch.join('\u001f')))
  if (reconstructedSet.size !== normalizedSet.size) return null
  for (const key of normalizedSet) {
    if (!reconstructedSet.has(key)) return null
  }

  return displayLevels.map(level => level.join(ADD_JOIN)).join(LEVEL_JOIN)
}

function findBranchIndexes(branches: AxisSpec, name: string) {
  return branches
    .map((branch, branchIndex) => ({ branchIndex, itemIndex: branch.indexOf(name) }))
    .filter(item => item.itemIndex >= 0)
}

export function parseAxisSpec(value: string | null): AxisSpec {
  if (!value) return []

  const trimmed = value.trim()
  if (trimmed.startsWith(AXIS_BRANCH_PREFIX)) {
    try {
      const parsed = JSON.parse(trimmed.slice(AXIS_BRANCH_PREFIX.length)) as unknown
      if (!Array.isArray(parsed)) return []
      return dedupeBranches(
        parsed
          .filter((branch): branch is string[] => Array.isArray(branch))
          .map(branch => branch.map(item => String(item).trim()).filter(Boolean))
      )
    } catch {
      return []
    }
  }

  return cartesianLevelsToBranches(parseLegacyLevels(trimmed))
}

export function joinAxisSpec(branches: AxisSpec): string | null {
  const normalized = dedupeBranches(branches)
  if (normalized.length === 0) return null
  return serializeLegacyLevels(normalized) ?? `${AXIS_BRANCH_PREFIX}${JSON.stringify(normalized)}`
}

export function getAxisDisplayLevels(branches: AxisSpec): string[][] {
  const levels: string[][] = []
  dedupeBranches(branches).forEach(branch => {
    branch.forEach((item, depth) => {
      if (!levels[depth]) levels[depth] = []
      uniquePush(levels[depth], item)
    })
  })
  return levels
}

export function flattenAxisSpec(branches: AxisSpec): string[] {
  return getAxisDisplayLevels(branches).flat()
}

export function insertTopLevelBranchAt(branches: AxisSpec, incoming: string, index?: number | null) {
  if (flattenAxisSpec(branches).includes(incoming)) return branches
  const normalized = dedupeBranches(branches)
  const next = [...normalized]
  const targetIndex = index == null ? next.length : Math.max(0, Math.min(index, next.length))
  next.splice(targetIndex, 0, [incoming])
  return dedupeBranches(next)
}

export function insertVarByMode(branches: AxisSpec, incoming: string, mode: 'add' | 'nest', selected: string | null) {
  // Add mode: block entirely if variable already exists anywhere (prevents duplicate top-level).
  // Nest mode: only block if EVERY branch already has the variable (nothing left to nest into).
  if (mode === 'add' && flattenAxisSpec(branches).includes(incoming)) return branches

  const normalized = dedupeBranches(branches)

  if (normalized.length === 0) return [[incoming]]

  // Add mode always creates a new top-level branch.
  if (mode === 'add') {
    return dedupeBranches([...normalized, [incoming]])
  }

  // Nest mode: stop only when all branches already have it
  if (normalized.every(branch => branch.includes(incoming))) return branches

  if (!selected) {
    // Add to every branch that doesn't already have it
    return dedupeBranches(normalized.map(branch =>
      branch.includes(incoming) ? branch : [...branch, incoming]
    ))
  }

  const matches = findBranchIndexes(normalized, selected)
  if (matches.length === 0) {
    return dedupeBranches(normalized.map(branch =>
      branch.includes(incoming) ? branch : [...branch, incoming]
    ))
  }

  return dedupeBranches(normalized.map((branch, branchIndex) => {
    const match = matches.find(item => item.branchIndex === branchIndex)
    if (!match) return branch
    if (branch.includes(incoming)) return branch  // already nested here, skip
    return [
      ...branch.slice(0, match.itemIndex + 1),
      incoming,
    ]
  }))
}

export function removeVarFromAxis(
  branches: AxisSpec,
  name: string,
  occurrence?: { branchIndex: number; itemIndex: number },
): AxisSpec {
  if (!occurrence) {
    return dedupeBranches(
      branches.map(branch => branch.filter(item => item !== name))
    )
  }

  return dedupeBranches(
    branches.map((branch, branchIndex) => {
      if (branchIndex !== occurrence.branchIndex) return branch
      return branch.filter((item, itemIndex) => !(item === name && itemIndex === occurrence.itemIndex))
    })
  )
}

export function moveVarInAxis(branches: AxisSpec, name: string, direction: -1 | 1): AxisSpec {
  const normalized = dedupeBranches(branches)
  const matches = findBranchIndexes(normalized, name)
  if (matches.length === 0) return branches

  return dedupeBranches(normalized.map((branch, branchIndex) => {
    const match = matches.find(item => item.branchIndex === branchIndex)
    if (!match) return branch

    const targetIndex = match.itemIndex + direction
    if (targetIndex < 0 || targetIndex >= branch.length) return branch

    const next = [...branch]
    ;[next[match.itemIndex], next[targetIndex]] = [next[targetIndex], next[match.itemIndex]]
    return next
  }))
}

export function moveAxisOccurrenceToTarget(
  branches: AxisSpec,
  source: { branchIndex: number; itemIndex: number },
  target: { branchIndex: number; itemIndex: number; placement?: 'before' | 'after' },
): AxisSpec {
  const normalized = dedupeBranches(branches).map(branch => [...branch])
  const sourceBranch = normalized[source.branchIndex]
  const targetBranch = normalized[target.branchIndex]
  if (!sourceBranch || !targetBranch) return branches
  if (!sourceBranch[source.itemIndex] || !targetBranch[target.itemIndex]) return branches

  const movingValue = sourceBranch[source.itemIndex]
  const targetValue = targetBranch[target.itemIndex]
  const sourceIsSingleBranch = sourceBranch.length === 1
  const targetIsSingleBranch = targetBranch.length === 1

  normalized[source.branchIndex].splice(source.itemIndex, 1)
  if (normalized[source.branchIndex].length === 0) {
    normalized.splice(source.branchIndex, 1)
  }

  let targetBranchIndex = target.branchIndex
  if (source.branchIndex < target.branchIndex && sourceBranch.length === 1) {
    targetBranchIndex -= 1
  }

  if (sourceIsSingleBranch && targetIsSingleBranch) {
    const insertionIndex = target.placement === 'after' ? targetBranchIndex + 1 : targetBranchIndex
    normalized.splice(insertionIndex, 0, [movingValue])
    return dedupeBranches(normalized)
  }

  const nextTargetBranch = normalized[targetBranchIndex]
  if (!nextTargetBranch) return branches
  const targetItemIndex = nextTargetBranch.findIndex(item => item === targetValue)
  if (targetItemIndex < 0) return branches
  const insertionIndex = target.placement === 'after' ? targetItemIndex + 1 : targetItemIndex
  nextTargetBranch.splice(insertionIndex, 0, movingValue)
  return dedupeBranches(normalized)
}

export function normalizeCode(value: string | number | undefined | null) {
  if (value == null || value === '') return ''
  const raw = String(value).trim()
  const numeric = Number(raw)
  return Number.isFinite(numeric) ? String(numeric) : raw
}

export function moveSelectedRows<T extends { key: string }>(items: T[], selectedKeys: string[], direction: -1 | 1) {
  if (selectedKeys.length === 0) return items
  const selectedSet = new Set(selectedKeys)
  const next = [...items]

  if (direction === -1) {
    for (let index = 1; index < next.length; index++) {
      if (!selectedSet.has(next[index].key) || selectedSet.has(next[index - 1].key)) continue
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    }
    return next
  }

  for (let index = next.length - 2; index >= 0; index--) {
    if (!selectedSet.has(next[index].key) || selectedSet.has(next[index + 1].key)) continue
    ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
  }
  return next
}
