/** Pure-JS crosstab engine — stores raw counts, % computed dynamically */

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

export interface CrosstabConfig {
  rowVar: string
  colVar: string
  showCount: boolean
  showPercent: boolean
  percentType: 'row' | 'column' | 'total'
  hideZeroRows?: boolean
}

export type CrosstabRowType = 'data' | 'stat' | 'net' | 'summary'

export interface CrosstabResult {
  rowVar: string
  colVar: string
  rowLabel: string
  colLabel: string
  rowValues: string[]   // ordered by SPSS code, includes 0-count values
  colValues: string[]
  rowTypes?: CrosstabRowType[]
  rowLevelLabels?: string[]
  colLevelLabels?: string[]
  rowPaths?: string[][]
  colPaths?: string[][]
  counts: number[][]    // counts[ri][ci]
  rowTotalsN: number[]
  colTotalsN: number[]
  grandTotal: number
  rowSectionBases?: Array<{
    startIndex: number
    label: string
    totalN: number
    colTotalsN: number[]
  }>
}

export function filterZeroRows(result: CrosstabResult, hideZeroRows: boolean): CrosstabResult {
  if (!hideZeroRows) return result

  const rowTypes = result.rowTypes ?? result.rowValues.map(() => 'data' as const)
  const keepIndexes = result.rowValues
    .map((_, index) => ({ index, type: rowTypes[index], total: result.rowTotalsN[index] ?? 0 }))
    .filter(item => item.type === 'stat' || item.total > 0)
    .map(item => item.index)

  if (keepIndexes.length === result.rowValues.length) return result

  const indexMap = new Map(keepIndexes.map((value, nextIndex) => [value, nextIndex]))
  const rowSectionBases = result.rowSectionBases
    ?.map((section, index, sections) => {
      const sectionEnd = (sections[index + 1]?.startIndex ?? result.rowValues.length) - 1
      const kept = keepIndexes.filter(rowIndex => rowIndex >= section.startIndex && rowIndex <= sectionEnd)
      if (kept.length === 0) return null
      return {
        ...section,
        startIndex: indexMap.get(kept[0]) ?? 0,
      }
    })
    .filter((section): section is NonNullable<typeof section> => section !== null)

  return {
    ...result,
    rowValues: keepIndexes.map(index => result.rowValues[index]),
    rowTypes: keepIndexes.map(index => rowTypes[index]),
    rowPaths: result.rowPaths ? keepIndexes.map(index => result.rowPaths![index]) : result.rowPaths,
    counts: keepIndexes.map(index => result.counts[index]),
    rowTotalsN: keepIndexes.map(index => result.rowTotalsN[index]),
    rowSectionBases,
  }
}

/** Compute % for a cell given current percentType */
export function getPct(
  n: number,
  ri: number,
  ci: number,
  result: CrosstabResult,
  percentType: 'row' | 'column' | 'total'
): number {
  const denom =
    percentType === 'row'    ? (result.rowTotalsN[ri] || 1) :
    percentType === 'column' ? (result.colTotalsN[ci] || 1) :
                               (result.grandTotal || 1)
  return denom > 0 ? n / denom : 0
}

export function computeCrosstab(
  data: Record<string, string>[],
  config: CrosstabConfig,
  rowLabel?: string,
  colLabel?: string,
  /** All row values in SPSS code order (including 0-count values) */
  rowOrder?: string[],
  /** All col values in SPSS code order (including 0-count values) */
  colOrder?: string[],
): CrosstabResult {
  const { rowVar, colVar } = config

  const filtered = data.filter(r => {
    const rv = r[rowVar]; const cv = r[colVar]
    return rv != null && rv !== '' && cv != null && cv !== ''
  })

  if (filtered.length === 0) {
    throw new Error(`ไม่มีข้อมูลสำหรับตัวแปร "${rowVar}" x "${colVar}"`)
  }

  // Count in one pass
  const countMap = new Map<string, number>()
  const dataRowSet = new Set<string>()
  const dataColSet = new Set<string>()

  for (const row of filtered) {
    const rv = String(row[rowVar])
    const cv = String(row[colVar])
    dataRowSet.add(rv)
    dataColSet.add(cv)
    countMap.set(rv + '\x00' + cv, (countMap.get(rv + '\x00' + cv) ?? 0) + 1)
  }

  // Build ordered value lists:
  // 1. All labels from SPSS order (even 0-count)
  // 2. Any data values not in the SPSS order list (appended at end)
  function buildOrder(spssOrder: string[] | undefined, dataSet: Set<string>): string[] {
    if (spssOrder && spssOrder.length > 0) {
      const extra = [...dataSet].filter(v => !spssOrder.includes(v))
      return [...spssOrder, ...extra]  // all SPSS labels + any unlabelled values
    }
    return [...dataSet]  // insertion order (no sort)
  }

  const rowValues = buildOrder(rowOrder, dataRowSet)
  const colValues = buildOrder(colOrder, dataColSet)
  const grandTotal = filtered.length

  const rowTotalsN = rowValues.map(rv =>
    colValues.reduce((s, cv) => s + (countMap.get(rv + '\x00' + cv) ?? 0), 0)
  )
  const colTotalsN = colValues.map(cv =>
    rowValues.reduce((s, rv) => s + (countMap.get(rv + '\x00' + cv) ?? 0), 0)
  )

  const counts: number[][] = rowValues.map(rv =>
    colValues.map(cv => countMap.get(rv + '\x00' + cv) ?? 0)
  )

  return {
    rowVar, colVar,
    rowLabel: rowLabel ?? rowVar,
    colLabel: colLabel ?? colVar,
    rowValues, colValues,
    rowTypes: rowValues.map(() => 'data'),
    rowLevelLabels: [rowLabel ?? rowVar],
    colLevelLabels: [colLabel ?? colVar],
    rowPaths: rowValues.map(value => [value]),
    colPaths: colValues.map(value => [value]),
    counts, rowTotalsN, colTotalsN, grandTotal,
  }
}

export async function computeCrosstabAsync(
  data: Record<string, string>[],
  config: CrosstabConfig,
  rowLabel?: string,
  colLabel?: string,
  rowOrder?: string[],
  colOrder?: string[],
): Promise<CrosstabResult> {
  const { rowVar, colVar } = config
  const countMap = new Map<string, number>()
  const dataRowSet = new Set<string>()
  const dataColSet = new Set<string>()
  let grandTotal = 0

  for (let index = 0; index < data.length; index++) {
    if (index > 0 && index % ASYNC_YIELD_EVERY === 0) {
      await yieldToBrowser()
    }
    const row = data[index]
    const rv = row[rowVar]
    const cv = row[colVar]
    if (rv == null || rv === '' || cv == null || cv === '') continue

    const rowValue = String(rv)
    const colValue = String(cv)
    dataRowSet.add(rowValue)
    dataColSet.add(colValue)
    countMap.set(rowValue + '\x00' + colValue, (countMap.get(rowValue + '\x00' + colValue) ?? 0) + 1)
    grandTotal += 1
  }

  if (grandTotal === 0) {
    throw new Error(`ไม่มีข้อมูลสำหรับตัวแปร "${rowVar}" x "${colVar}"`)
  }

  function buildOrder(spssOrder: string[] | undefined, dataSet: Set<string>): string[] {
    if (spssOrder && spssOrder.length > 0) {
      const extra = [...dataSet].filter(v => !spssOrder.includes(v))
      return [...spssOrder, ...extra]
    }
    return [...dataSet]
  }

  const rowValues = buildOrder(rowOrder, dataRowSet)
  const colValues = buildOrder(colOrder, dataColSet)
  const rowTotalsN = rowValues.map(rv =>
    colValues.reduce((s, cv) => s + (countMap.get(rv + '\x00' + cv) ?? 0), 0)
  )
  const colTotalsN = colValues.map(cv =>
    rowValues.reduce((s, rv) => s + (countMap.get(rv + '\x00' + cv) ?? 0), 0)
  )
  const counts: number[][] = rowValues.map(rv =>
    colValues.map(cv => countMap.get(rv + '\x00' + cv) ?? 0)
  )

  return {
    rowVar,
    colVar,
    rowLabel: rowLabel ?? rowVar,
    colLabel: colLabel ?? colVar,
    rowValues,
    colValues,
    rowTypes: rowValues.map(() => 'data'),
    rowLevelLabels: [rowLabel ?? rowVar],
    colLevelLabels: [colLabel ?? colVar],
    rowPaths: rowValues.map(value => [value]),
    colPaths: colValues.map(value => [value]),
    counts,
    rowTotalsN,
    colTotalsN,
    grandTotal,
  }
}

