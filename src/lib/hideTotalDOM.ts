/**
 * HideTotal DOM helpers — TypeScript extraction of the S7 script in index.html.
 *
 * `findCellsAtVisualColumn` is the pure, DOM-independent core of the algorithm.
 * `findTotalBodyCells`       is the thin DOM wrapper used by the browser script.
 *
 * Extracting them here allows unit-testing without a real browser.
 */

// ─── Pure, DOM-independent algorithm ─────────────────────────────────────────

export interface CellDescriptor {
  colSpan: number
  rowSpan: number
}

/**
 * Given a table as an array-of-rows where each row is an array of
 * `{ colSpan, rowSpan }` descriptors (physical cells in DOM order),
 * return the **physical cell index** in each row whose visual column range
 * covers `targetVisualCol`.
 *
 * Returns `null` for rows where no physical cell maps to `targetVisualCol`
 * (because a prior-row rowSpan occupies that visual column for this row).
 *
 * This mirrors the `colOccupied` map logic in the S7 inline script.
 */
export function findCellsAtVisualColumn(
  rows: CellDescriptor[][],
  targetVisualCol: number,
): Array<number | null> {
  // colOccupied[visualCol] = number of rows still spanned from a previous physical cell
  const colOccupied: Record<number, number> = {}

  return rows.map(cells => {
    // Decrement rowSpan counters in-place; delete expired entries
    for (const col of Object.keys(colOccupied)) {
      const c = Number(col)
      if (colOccupied[c] > 1) colOccupied[c]--
      else delete colOccupied[c]
    }

    let visualCol = 0

    for (let ci = 0; ci < cells.length; ci++) {
      // Skip visual columns occupied by a rowSpan from an earlier row
      while (colOccupied[visualCol]) visualCol++

      const cell = cells[ci]
      const cspan = cell.colSpan || 1
      const rspan = cell.rowSpan || 1

      // Register this cell's rowSpan occupancy for future rows
      if (rspan > 1) {
        for (let sc = 0; sc < cspan; sc++) {
          colOccupied[visualCol + sc] = rspan
        }
      }

      if (targetVisualCol >= visualCol && targetVisualCol <= visualCol + cspan - 1) {
        return ci   // physical cell index
      }
      visualCol += cspan
    }

    return null   // this row is fully spanned-over at targetVisualCol
  })
}

// ─── Thin DOM wrapper (browser-only) ─────────────────────────────────────────

/**
 * Walk the tbody of `tableEl` and collect the HTMLTableCellElement at
 * visual column `cornerSpan` in each row (the Total column).
 *
 * Uses `findCellsAtVisualColumn` for the rowSpan-aware traversal.
 */
export function findTotalBodyCells(
  tableEl: Element,
  cornerSpan: number,
): HTMLTableCellElement[] {
  const tbody = tableEl.querySelector('tbody')
  if (!tbody) return []

  const rows = Array.from(tbody.querySelectorAll('tr'))
  const descriptors = rows.map(tr =>
    Array.from(tr.cells).map(cell => ({ colSpan: cell.colSpan, rowSpan: cell.rowSpan }))
  )

  const physicalIndexes = findCellsAtVisualColumn(descriptors, cornerSpan)

  const result: HTMLTableCellElement[] = []
  rows.forEach((tr, ri) => {
    const ci = physicalIndexes[ri]
    if (ci != null && tr.cells[ci]) result.push(tr.cells[ci] as HTMLTableCellElement)
  })
  return result
}
