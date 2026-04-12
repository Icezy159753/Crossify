/**
 * Net group row injection — inserts Net rows into a CrosstabResult.
 *
 * Extracted from the S6 inline `cxInjectNetGroups` function in index.html so
 * it can be unit-tested independently.  The inline copy in index.html should
 * delegate to window.__cxInjectNetGroups (set at the bottom of this module's
 * initialisation) once the bundle is loaded, but the logic here is the
 * authoritative implementation.
 */

import type { CrosstabResult, CrosstabRowType } from './crosstabEngine'

// ─── types ───────────────────────────────────────────────────────────────────

export interface NetGroup {
  id?: string
  name: string
  members: string[]
  parentId?: string | null
}

export interface NetGroupOverride {
  groups: NetGroup[]
  /** SPSS code → display label */
  labels?: Record<string, string>
}

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Depth of a group in its parent hierarchy (0 = top-level). */
function depthOf(g: NetGroup, all: NetGroup[]): number {
  let d = 0
  let cur: NetGroup | undefined = g
  let guard = 0
  while (cur?.parentId && guard++ < 16) {
    const par = all.find(x => x.id === cur!.parentId)
    if (!par) break
    d++
    cur = par
  }
  return d
}

/** Resolve the override entry for variable `vn` (case-insensitive). */
function resolveOverride(
  vn: string,
  overrides: Record<string, NetGroupOverride> | null | undefined,
): NetGroupOverride | null {
  if (!overrides || !vn) return null
  if (overrides[vn]) return overrides[vn]
  const lower = vn.toLowerCase()
  const key = Object.keys(overrides).find(k => k.toLowerCase() === lower)
  return key ? overrides[key] : null
}

// ─── injectNetGroups ──────────────────────────────────────────────────────────

/**
 * Insert Net group rows for variable `vn` into `result`.
 *
 * Each Net group sums the counts of its member rows and splices a new row
 * (rowType = 'net') immediately before the first member row.
 *
 * **rowPath depth rule** — when the surrounding data rows have rowPaths of
 * depth ≥ 2 (stacked multi-var tables), the Net row gets the same path
 * prefix so the table UI renders its label column at the correct indent level.
 *
 * Returns a new CrosstabResult; the input is never mutated.
 */
export function injectNetGroups(
  result: CrosstabResult,
  vn: string,
  overrides: Record<string, NetGroupOverride> | null | undefined,
): CrosstabResult {
  if (!result?.rowValues?.length) return result

  const ov = resolveOverride(vn, overrides)
  const groups = ov?.groups
  if (!groups?.length) return result

  const labels = ov?.labels ?? {}
  const rawTypes: CrosstabRowType[] =
    result.rowTypes ?? result.rowValues.map(() => 'data')
  const rawPaths: string[][] =
    result.rowPaths ?? result.rowValues.map(v => [v])

  // Build code → rowIndex map
  // Keys indexed: trimmed rowValue, last path segment, and the part after
  // the last " / " in either (handles stacked " VarName / Label" format).
  const codeToIdx: Record<string, number> = {}
  for (let ri = 0; ri < result.rowValues.length; ri++) {
    if ((rawTypes[ri] ?? 'data') !== 'data') continue
    const rv = String(result.rowValues[ri] ?? '').trim()
    const path = rawPaths[ri]
    const last = String(path[path.length - 1] ?? rv).trim()

    codeToIdx[rv] = ri
    codeToIdx[last] = ri

    const spRv = rv.lastIndexOf(' / ')
    if (spRv >= 0) codeToIdx[rv.slice(spRv + 3).trim()] = ri
    const spLast = last.lastIndexOf(' / ')
    if (spLast >= 0) codeToIdx[last.slice(spLast + 3).trim()] = ri
  }

  function memberToIdx(code: string): number | null {
    if (codeToIdx[code] != null) return codeToIdx[code]
    const lab = labels[code]
    const labKey = lab != null ? String(lab).trim() : null
    if (labKey != null && codeToIdx[labKey] != null) return codeToIdx[labKey]
    return null
  }

  const colCount = result.colValues?.length ?? 0

  interface NetRow {
    insertBefore: number
    label: string
    counts: number[]
    totalN: number
  }

  const netRows: NetRow[] = []
  for (const g of groups) {
    const idxs = (g.members ?? [])
      .map(memberToIdx)
      .filter((x): x is number => x != null)
    if (!idxs.length) continue
    idxs.sort((a, b) => a - b)

    const d = depthOf(g, groups)
    const indent = '   '.repeat(d + 1)
    const label = indent + (g.name || 'Net')

    const counts: number[] = []
    for (let ci = 0; ci < colCount; ci++) {
      counts.push(idxs.reduce((s, rix) => s + ((result.counts[rix]?.[ci]) ?? 0), 0))
    }
    const totalN = idxs.reduce((s, rix) => s + (result.rowTotalsN[rix] ?? 0), 0)

    netRows.push({ insertBefore: idxs[0], label, counts, totalN })
  }

  if (!netRows.length) return result
  netRows.sort((a, b) => a.insertBefore - b.insertBefore)

  // Determine rowPath prefix: find the first data row with depth >= 2.
  // This ensures Net rows in stacked multi-var tables get the same path depth
  // as surrounding data rows (so the UI label column renders correctly).
  let netPathPrefix: string[] | null = null
  for (let i = 0; i < result.rowValues.length; i++) {
    if ((rawTypes[i] ?? 'data') === 'data' && rawPaths[i]?.length >= 2) {
      netPathPrefix = rawPaths[i].slice(0, -1)
      break
    }
  }
  const buildNetPath = (label: string): string[] =>
    netPathPrefix ? [...netPathPrefix, label] : [label]

  // Assemble output
  const rv: string[] = []
  const rt: CrosstabRowType[] = []
  const rp: string[][] = []
  const ct: number[][] = []
  const rtn: number[] = []

  let ni = 0
  for (let i = 0; i < result.rowValues.length; i++) {
    while (ni < netRows.length && netRows[ni].insertBefore === i) {
      const n = netRows[ni]
      rv.push(n.label); rt.push('net'); rp.push(buildNetPath(n.label))
      ct.push(n.counts); rtn.push(n.totalN)
      ni++
    }
    rv.push(result.rowValues[i])
    rt.push(rawTypes[i])
    rp.push(rawPaths[i])
    ct.push(result.counts[i])
    rtn.push(result.rowTotalsN[i])
  }
  // Append any remaining net rows (insertBefore >= rowValues.length)
  while (ni < netRows.length) {
    const n = netRows[ni]
    rv.push(n.label); rt.push('net'); rp.push(buildNetPath(n.label))
    ct.push(n.counts); rtn.push(n.totalN)
    ni++
  }

  return { ...result, rowValues: rv, rowTypes: rt, rowPaths: rp, counts: ct, rowTotalsN: rtn }
}
