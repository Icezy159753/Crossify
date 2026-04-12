/**
 * Column augmentation — inserts T2B/TB/summary columns into a CrosstabResult.
 *
 * This is the TypeScript extraction of `materializeColumnAugment` from the
 * S6 inline script in index.html. By living here it can be unit-tested and
 * eventually re-imported by the inline script (or replaced by it entirely).
 */

import type { CrosstabResult } from './crosstabEngine'

// ─── types ───────────────────────────────────────────────────────────────────

export interface ColumnAugmentSpec {
  /** Only 'summary' specs are materialized; other kinds are reserved. */
  kind: 'summary'
  /** Display label for the new column (e.g. "T2B", "TB"). */
  label: string
  /**
   * Indices into the *original* (pre-augment) colValues array whose counts
   * and totals are summed to produce this column.
   */
  memberIndexes: number[]
  /**
   * Insert the new column before this original-column index.
   * Pass `colValues.length` (or omit) to append at the end.
   */
  insertBoundary?: number
  /**
   * Tie-break when two specs share the same insertBoundary.
   * Lower value = inserted first. Defaults to 50.
   */
  insertOrder?: number
  /**
   * Path prefix for multi-level colPaths.
   * The final path will be [...groupPath, label].
   */
  groupPath?: string[]
}

export interface ColumnAugment {
  specs: ColumnAugmentSpec[]
}

// ─── materializeColumnAugment ────────────────────────────────────────────────

/**
 * Insert summary columns (T2B, TB, …) defined by `colAug` into `result`.
 *
 * Each spec sums the counts/totals of its `memberIndexes` (which always
 * reference the *original* column positions before any insertions) and
 * splices the new column at `insertBoundary + <already-inserted count>`.
 *
 * Returns a new CrosstabResult; the input is never mutated.
 */
export function materializeColumnAugment(
  result: CrosstabResult,
  colAug: ColumnAugment | null | undefined,
): CrosstabResult {
  if (!result || !colAug || !Array.isArray(colAug.specs) || colAug.specs.length === 0) {
    return result
  }

  const origColValues = result.colValues.slice()
  const origColPaths = (result.colPaths ?? result.colValues.map(v => [v])).map(p => p.slice())
  const origColTotalsN = result.colTotalsN.slice()
  const origCounts = result.counts.map(row => row.slice())

  const nextColValues = origColValues.slice()
  const nextColPaths = origColPaths.map(p => p.slice())
  const nextColTotalsN = origColTotalsN.slice()
  const nextCounts = origCounts.map(row => row.slice())

  // Sort specs by (insertBoundary, insertOrder) so earlier columns are inserted first
  const sorted = [...colAug.specs].sort((a, b) => {
    const ai = a.insertBoundary ?? origColValues.length
    const bi = b.insertBoundary ?? origColValues.length
    if (ai !== bi) return ai - bi
    return (a.insertOrder ?? 50) - (b.insertOrder ?? 50)
  })

  let inserted = 0
  for (const spec of sorted) {
    if (spec.kind !== 'summary' || spec.memberIndexes.length === 0) continue

    const boundary = spec.insertBoundary ?? origColValues.length
    const insertAt = Math.max(0, Math.min(nextColValues.length, boundary + inserted))
    const path = [...(spec.groupPath ?? []), String(spec.label)]

    const total = spec.memberIndexes.reduce((sum, idx) => sum + (origColTotalsN[idx] ?? 0), 0)

    nextColValues.splice(insertAt, 0, String(spec.label))
    nextColPaths.splice(insertAt, 0, path)
    nextColTotalsN.splice(insertAt, 0, total)
    nextCounts.forEach((row, ri) => {
      const value = spec.memberIndexes.reduce((sum, idx) => sum + ((origCounts[ri]?.[idx]) ?? 0), 0)
      row.splice(insertAt, 0, value)
    })

    inserted += 1
  }

  return { ...result, colValues: nextColValues, colPaths: nextColPaths, colTotalsN: nextColTotalsN, counts: nextCounts }
}
