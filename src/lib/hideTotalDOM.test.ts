/**
 * Tests for HideTotal DOM helpers.
 *
 * findCellsAtVisualColumn — pure algorithm, no DOM needed
 * findTotalBodyCells      — uses jsdom (environment: 'jsdom' below)
 *
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { findCellsAtVisualColumn, findTotalBodyCells } from './hideTotalDOM'

// ─── findCellsAtVisualColumn (pure) ──────────────────────────────────────────

describe('findCellsAtVisualColumn › pure algorithm', () => {
  it('flat table (no span): maps each cell to its visual column', () => {
    const rows = [
      [{ colSpan: 1, rowSpan: 1 }, { colSpan: 1, rowSpan: 1 }, { colSpan: 1, rowSpan: 1 }],
      [{ colSpan: 1, rowSpan: 1 }, { colSpan: 1, rowSpan: 1 }, { colSpan: 1, rowSpan: 1 }],
    ]
    // targetVisualCol=1 → cells[1] in each row
    expect(findCellsAtVisualColumn(rows, 1)).toEqual([1, 1])
  })

  it('col that falls inside a colSpan=2 cell is found', () => {
    // row: [cell0(colSpan=2), cell1, cell2] → visual cols 0,1 = cell0; 2 = cell1; 3 = cell2
    const rows = [[
      { colSpan: 2, rowSpan: 1 },
      { colSpan: 1, rowSpan: 1 },
      { colSpan: 1, rowSpan: 1 },
    ]]
    expect(findCellsAtVisualColumn(rows, 0)).toEqual([0])  // cell0 covers col 0
    expect(findCellsAtVisualColumn(rows, 1)).toEqual([0])  // cell0 covers col 1 too
    expect(findCellsAtVisualColumn(rows, 2)).toEqual([1])  // cell1 at col 2
  })

  it('rowSpan=N: subsequent rows return null for spanned visual column', () => {
    /**
     * Row 0: [cell0(colSpan=1,rowSpan=3), cell1, cell2]
     * Row 1: [cell0, cell1]   ← cell0 is spanned-over (no physical cell at col 0)
     * Row 2: [cell0, cell1]   ← same
     *
     * targetVisualCol=0:
     *   row 0 → physical index 0
     *   row 1 → null (col 0 occupied by row 0's rowSpan)
     *   row 2 → null
     */
    const rows = [
      [{ colSpan: 1, rowSpan: 3 }, { colSpan: 1, rowSpan: 1 }, { colSpan: 1, rowSpan: 1 }],
      [{ colSpan: 1, rowSpan: 1 }, { colSpan: 1, rowSpan: 1 }],
      [{ colSpan: 1, rowSpan: 1 }, { colSpan: 1, rowSpan: 1 }],
    ]
    expect(findCellsAtVisualColumn(rows, 0)).toEqual([0, null, null])
  })

  it('rowSpan expires after N rows', () => {
    /**
     * Row 0: [cell0(rowSpan=2), cell1, cell2]  → col 0 spanned for rows 0,1
     * Row 1: [cell0, cell1]                    → col 0 spanned
     * Row 2: [cell0, cell1, cell2]             → col 0 free again
     */
    const rows = [
      [{ colSpan: 1, rowSpan: 2 }, { colSpan: 1, rowSpan: 1 }, { colSpan: 1, rowSpan: 1 }],
      [{ colSpan: 1, rowSpan: 1 }, { colSpan: 1, rowSpan: 1 }],
      [{ colSpan: 1, rowSpan: 1 }, { colSpan: 1, rowSpan: 1 }, { colSpan: 1, rowSpan: 1 }],
    ]
    expect(findCellsAtVisualColumn(rows, 0)).toEqual([0, null, 0])
  })

  it('Grid table structure: section label rowSpan=2, target=Total col', () => {
    /**
     * Simulates a 2-attribute Grid table (cornerSpan=2):
     *
     * Row 0 physical: [sectionLabel(rowSpan=2, colSpan=1), attrLabel, Total, col1, col2]
     *   visual:        col0=sectionLabel,  col1=attrLabel,  col2=Total, col3=col1, col4=col2
     *
     * Row 1 physical: [attrLabel, Total, col1, col2]
     *   visual:        col0=<spanned>,     col1=attrLabel,  col2=Total, col3=col1, col4=col2
     *
     * Total is at visual col 2 (cornerSpan=2).
     */
    const rows = [
      [
        { colSpan: 1, rowSpan: 2 },  // section label, spans 2 rows
        { colSpan: 1, rowSpan: 1 },  // attr label row 0
        { colSpan: 1, rowSpan: 1 },  // Total
        { colSpan: 1, rowSpan: 1 },  // col1
        { colSpan: 1, rowSpan: 1 },  // col2
      ],
      [
        { colSpan: 1, rowSpan: 1 },  // attr label row 1 (physical[0], visual col 1)
        { colSpan: 1, rowSpan: 1 },  // Total (physical[1], visual col 2)
        { colSpan: 1, rowSpan: 1 },  // col1
        { colSpan: 1, rowSpan: 1 },  // col2
      ],
    ]
    // cornerSpan = 2 → target visual col 2
    const result = findCellsAtVisualColumn(rows, 2)
    expect(result[0]).toBe(2)  // row 0: physical cell 2 = Total
    expect(result[1]).toBe(1)  // row 1: physical cell 1 = Total (shifted because col0 occupied)
  })

  it('returns null for every row when targetVisualCol is beyond all cells', () => {
    const rows = [[{ colSpan: 1, rowSpan: 1 }, { colSpan: 1, rowSpan: 1 }]]
    expect(findCellsAtVisualColumn(rows, 99)).toEqual([null])
  })

  it('empty table returns empty array', () => {
    expect(findCellsAtVisualColumn([], 0)).toEqual([])
  })
})

// ─── findTotalBodyCells (DOM / jsdom) ─────────────────────────────────────────

describe('findTotalBodyCells › DOM (jsdom)', () => {
  function buildTable(html: string): HTMLTableElement {
    const div = document.createElement('div')
    div.innerHTML = `<table>${html}</table>`
    return div.querySelector('table')!
  }

  it('flat table: finds Total cell in each row', () => {
    const table = buildTable(`
      <tbody>
        <tr><td>Label</td><td>Total</td><td>A</td></tr>
        <tr><td>Label</td><td>456</td><td>B</td></tr>
      </tbody>
    `)
    // cornerSpan=1 → total at visual col 1
    const cells = findTotalBodyCells(table, 1)
    expect(cells).toHaveLength(2)
    expect(cells[0].textContent?.trim()).toBe('Total')
    expect(cells[1].textContent?.trim()).toBe('456')
  })

  it('Grid table with rowSpan=2 section label: finds correct Total cell in each row', () => {
    /**
     * Row 0: [sectionLabel(rowSpan=2)] [attrLabel1] [Total_A1] [col1_A1]
     * Row 1: [attrLabel2] [Total_A2] [col1_A2]     ← sectionLabel spans over col 0
     *
     * cornerSpan = 2 → Total is at visual col 2
     */
    const table = buildTable(`
      <tbody>
        <tr>
          <td rowspan="2">Section</td>
          <td>Attr1</td>
          <td>100</td>
          <td>40</td>
        </tr>
        <tr>
          <td>Attr2</td>
          <td>200</td>
          <td>60</td>
        </tr>
      </tbody>
    `)
    const cells = findTotalBodyCells(table, 2)
    expect(cells).toHaveLength(2)
    expect(cells[0].textContent?.trim()).toBe('100')  // Total of Attr1
    expect(cells[1].textContent?.trim()).toBe('200')  // Total of Attr2
  })

  it('returns empty array when tbody is absent', () => {
    const table = buildTable('<thead><tr><th>A</th></tr></thead>')
    expect(findTotalBodyCells(table, 1)).toEqual([])
  })

  it('handles 3-row Grid (rowSpan=3)', () => {
    const table = buildTable(`
      <tbody>
        <tr>
          <td rowspan="3">Section</td>
          <td>Attr1</td><td>T1</td>
        </tr>
        <tr><td>Attr2</td><td>T2</td></tr>
        <tr><td>Attr3</td><td>T3</td></tr>
      </tbody>
    `)
    // cornerSpan=2 → Total at visual col 2
    const cells = findTotalBodyCells(table, 2)
    expect(cells).toHaveLength(3)
    expect(cells[0].textContent?.trim()).toBe('T1')
    expect(cells[1].textContent?.trim()).toBe('T2')
    expect(cells[2].textContent?.trim()).toBe('T3')
  })

  it('non-Grid table (no rowSpan): each row selects correct Total cell', () => {
    const table = buildTable(`
      <tbody>
        <tr><td>R1Label</td><td>R1Total</td><td>R1A</td></tr>
        <tr><td>R2Label</td><td>R2Total</td><td>R2A</td></tr>
        <tr><td>Base</td><td>BaseTotal</td><td>BaseA</td></tr>
      </tbody>
    `)
    const cells = findTotalBodyCells(table, 1)
    expect(cells.map(c => c.textContent?.trim())).toEqual(['R1Total', 'R2Total', 'BaseTotal'])
  })
})
