import type { CrosstabResult } from './crosstabEngine'

export function buildHeaderGroups(paths: string[][], levels: number) {
  return Array.from({ length: levels }, (_, level) => {
    const groups: Array<{ label: string; span: number }> = []
    let currentKey = ''

    paths.forEach(path => {
      const key = path.slice(0, level + 1).join('\u0001')
      const label = path[level] ?? ''
      if (groups.length === 0 || key !== currentKey) {
        groups.push({ label, span: 1 })
        currentKey = key
      } else {
        groups[groups.length - 1].span += 1
      }
    })

    return groups
  })
}

export function buildRowDisplayPaths(paths: string[][]) {
  return paths.map((path, rowIndex) =>
    path.map((segment, level) => {
      if (rowIndex === 0) return segment
      const previous = paths[rowIndex - 1] ?? []
      const samePrefix = path.slice(0, level + 1).every((value, idx) => value === previous[idx])
      return samePrefix ? '' : segment
    })
  )
}

export function buildRowSectionMeta(sectionBases: Array<{ startIndex: number; label: string }>, totalRows: number) {
  const byStart = new Map<number, { label: string; span: number }>()
  const covered = new Set<number>()

  const safeSections = normalizeRowSectionBases(sectionBases, totalRows)

  safeSections.forEach((section, index) => {
    const end = (safeSections[index + 1]?.startIndex ?? totalRows) - 1
    byStart.set(section.startIndex, { label: section.label, span: end - section.startIndex + 1 })
    for (let row = section.startIndex + 1; row <= end; row++) covered.add(row)
  })

  return { byStart, covered }
}

export function normalizeRowSectionBases<T extends { startIndex: number; label: string }>(
  sectionBases: T[],
  totalRows: number,
): T[] {
  if (!sectionBases.length || totalRows <= 0) return []

  const seen = new Set<number>()
  const safeSections = sectionBases
    .filter(section => Number.isFinite(section.startIndex))
    .map(section => ({
      ...section,
      startIndex: Math.max(0, Math.min(totalRows - 1, Math.trunc(section.startIndex))),
    }))
    .sort((a, b) => a.startIndex - b.startIndex)
    .filter(section => {
      if (seen.has(section.startIndex)) return false
      seen.add(section.startIndex)
      return true
    })

  if (safeSections[0] && safeSections[0].startIndex > 0) {
    safeSections[0] = { ...safeSections[0], startIndex: 0 }
  }

  return safeSections
}

export function normalizeRowStructure(
  result: CrosstabResult,
  rowPaths: string[][],
  rowLevelLabels: string[],
  rowSectionBases: NonNullable<CrosstabResult['rowSectionBases']>,
) {
  const safeRowSectionBases = normalizeRowSectionBases(rowSectionBases, rowPaths.length)

  if (safeRowSectionBases.length === 0 && rowLevelLabels.length === 1) {
    return {
      rowPaths: rowPaths.map(path => [result.rowLabel, path[0] ?? '']),
      rowLevelLabels: ['Variable', 'Category'],
      rowSectionBases: [{
        startIndex: 0,
        label: result.rowLabel,
        totalN: result.grandTotal,
        colTotalsN: result.colTotalsN,
        unweightedTotalN: result.unweightedGrandTotal,
        unweightedColTotalsN: result.unweightedColTotalsN,
      }],
    }
  }

  return { rowPaths, rowLevelLabels, rowSectionBases: safeRowSectionBases }
}
