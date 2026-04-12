/**
 * Unit tests for Grid variable crosstab functionality.
 *
 * Covers:
 *  1. buildVariableCatalog – Grid variable registration (isGridUserCreated)
 *  2. getGroupedSelections  – dichotomy selection mapping for Grid members
 *  3. computeGroupedCrosstab – Grid as Row (groupedSide='row')
 *  4. computeGroupedCrosstab – Grid as Column (groupedSide='column')
 *  5. filterZeroRows         – Grid result with rowSectionBases
 */

import { describe, expect, it } from 'vitest'
import {
  buildVariableCatalog,
  computeGroupedCrosstab,
  getGroupedSelections,
  type GroupedVariableDef,
} from './variableGrouping'
import { filterZeroRows } from './crosstabEngine'
import type { CrosstabRowType } from './crosstabEngine'
import type { SpssVariable } from './savParser'

// ─── helpers ────────────────────────────────────────────────────────────────

function numericVar(
  name: string,
  valueLabels: Record<string, string>,
  label = name,
): SpssVariable {
  return { name, longName: name, label, valueLabels, isString: false, stringLength: 0, slotCount: 1, dictIndex: 1 }
}

/** Create a Grid GroupedVariableDef directly (bypass catalog) */
function makeGridDef(
  name: string,
  memberDefs: Array<{ name: string; label: string }>,
): GroupedVariableDef {
  return {
    name,
    label: name,
    longName: name,
    aggregateByCode: false,
    memberNames: memberDefs.map(m => m.name),
    options: memberDefs.map((m, idx) => ({
      memberName: m.name,
      label: m.label,
      order: idx + 1,
      selectedCodes: new Set(['1']),
    })),
  }
}

// ─── 1. buildVariableCatalog – Grid variable registration ───────────────────

describe('buildVariableCatalog › Grid (isGridUserCreated)', () => {
  const gridVar = {
    ...numericVar('NEWA2', {}, 'ความสำคัญ'),
    isGridUserCreated: true,
    isGroupedMA: true,
    memberNames: ['NEWA2_A2R1', 'NEWA2_A2R2'],
    gridMembers: [
      { name: 'NEWA2_A2R1', label: 'Row 1 Attribute' },
      { name: 'NEWA2_A2R2', label: 'Row 2 Attribute' },
    ],
  }
  const memberVars = [
    numericVar('NEWA2_A2R1', { '0': 'No', '1': 'Yes' }, 'Attr R1'),
    numericVar('NEWA2_A2R2', { '0': 'No', '1': 'Yes' }, 'Attr R2'),
    numericVar('OTHER', { '1': 'Option A', '2': 'Option B' }, 'Other'),
  ]

  it('registers Grid var in groupedByName', () => {
    const catalog = buildVariableCatalog([...memberVars, gridVar as unknown as SpssVariable])
    expect(catalog.groupedByName.has('NEWA2')).toBe(true)
  })

  it('aggregateByCode is always false for Grid vars', () => {
    const catalog = buildVariableCatalog([...memberVars, gridVar as unknown as SpssVariable])
    expect(catalog.groupedByName.get('NEWA2')?.aggregateByCode).toBe(false)
  })

  it('builds options from gridMembers labels', () => {
    const catalog = buildVariableCatalog([...memberVars, gridVar as unknown as SpssVariable])
    const grouped = catalog.groupedByName.get('NEWA2')
    expect(grouped?.options.map(o => o.label)).toEqual(['Row 1 Attribute', 'Row 2 Attribute'])
  })

  it('memberNames matches original member list', () => {
    const catalog = buildVariableCatalog([...memberVars, gridVar as unknown as SpssVariable])
    expect(catalog.groupedByName.get('NEWA2')?.memberNames).toEqual(['NEWA2_A2R1', 'NEWA2_A2R2'])
  })

  it('keeps individual Grid member vars in byName (not consumed like MA members)', () => {
    // Grid members don't have $N / &N suffix, so they are NOT removed from the list
    // — they remain as standalone variables alongside the Grid group.
    const catalog = buildVariableCatalog([...memberVars, gridVar as unknown as SpssVariable])
    expect(catalog.byName.has('NEWA2_A2R1')).toBe(true)
    expect(catalog.byName.has('NEWA2_A2R2')).toBe(true)
  })

  it('non-Grid variables remain in list alongside Grid var', () => {
    const catalog = buildVariableCatalog([...memberVars, gridVar as unknown as SpssVariable])
    expect(catalog.byName.has('OTHER')).toBe(true)
  })
})

// ─── 2. getGroupedSelections – Grid dichotomy selection ─────────────────────

describe('getGroupedSelections › Grid dichotomy', () => {
  const gridDef = makeGridDef('NEWA2', [
    { name: 'NEWA2_A2R1', label: 'Row 1' },
    { name: 'NEWA2_A2R2', label: 'Row 2' },
    { name: 'NEWA2_A2R3', label: 'Row 3' },
  ])

  it('returns label for member with value 1', () => {
    expect(getGroupedSelections(gridDef, { NEWA2_A2R1: 1, NEWA2_A2R2: 0, NEWA2_A2R3: 0 }))
      .toEqual(['Row 1'])
  })

  it('returns multiple labels when multiple members are selected', () => {
    expect(getGroupedSelections(gridDef, { NEWA2_A2R1: 1, NEWA2_A2R2: 1, NEWA2_A2R3: 0 }))
      .toEqual(['Row 1', 'Row 2'])
  })

  it('returns all labels when all members selected', () => {
    expect(getGroupedSelections(gridDef, { NEWA2_A2R1: 1, NEWA2_A2R2: 1, NEWA2_A2R3: 1 }))
      .toEqual(['Row 1', 'Row 2', 'Row 3'])
  })

  it('returns empty array when no member is selected', () => {
    expect(getGroupedSelections(gridDef, { NEWA2_A2R1: 0, NEWA2_A2R2: 0, NEWA2_A2R3: 0 }))
      .toEqual([])
  })

  it('treats missing member key as not selected', () => {
    expect(getGroupedSelections(gridDef, { NEWA2_A2R2: 1 }))
      .toEqual(['Row 2'])
  })
})

// ─── 3. computeGroupedCrosstab – Grid as Row ────────────────────────────────

describe('computeGroupedCrosstab › Grid as Row', () => {
  /**
   * Scenario:
   *  Row: NEWA2 Grid (A2R1="Row 1", A2R2="Row 2")
   *  Col: SIDE scale (values "7", "8", "9")
   *
   *  Case 1: A2R1=1 A2R2=0  SIDE=7  → selects Row 1 only
   *  Case 2: A2R1=1 A2R2=1  SIDE=8  → selects Row 1 AND Row 2
   *  Case 3: A2R1=0 A2R2=1  SIDE=9  → selects Row 2 only
   *  Case 4: A2R1=0 A2R2=0  SIDE=7  → no selection → excluded
   */
  const gridDef = makeGridDef('NEWA2', [
    { name: 'NEWA2_A2R1', label: 'Row 1' },
    { name: 'NEWA2_A2R2', label: 'Row 2' },
  ])

  const rawCases = [
    { NEWA2_A2R1: 1, NEWA2_A2R2: 0 },
    { NEWA2_A2R1: 1, NEWA2_A2R2: 1 },
    { NEWA2_A2R1: 0, NEWA2_A2R2: 1 },
    { NEWA2_A2R1: 0, NEWA2_A2R2: 0 },
  ]
  const labeledCases = [
    { SIDE: '7' },
    { SIDE: '8' },
    { SIDE: '9' },
    { SIDE: '7' },
  ]
  const config = { rowVar: 'NEWA2', colVar: 'SIDE', showCount: true, showPercent: false, percentType: 'column' as const }

  const result = computeGroupedCrosstab(rawCases, labeledCases, config, gridDef, 'row', 'Scale', ['7', '8', '9'])

  it('rowVar and colVar are set correctly', () => {
    expect(result.rowVar).toBe('NEWA2')
    expect(result.colVar).toBe('SIDE')
  })

  it('rowValues = Grid member labels', () => {
    expect(result.rowValues).toEqual(['Row 1', 'Row 2'])
  })

  it('colValues = other variable values in given order', () => {
    expect(result.colValues).toEqual(['7', '8', '9'])
  })

  it('grandTotal counts only cases with at least one selection', () => {
    // Cases 1,2,3 have at least one selection; Case 4 has none
    expect(result.grandTotal).toBe(3)
  })

  it('counts[memberIdx][colIdx] correct', () => {
    // Row 1 (A2R1): selected in case1(SIDE=7) and case2(SIDE=8) → [1,1,0]
    expect(result.counts[0]).toEqual([1, 1, 0])
    // Row 2 (A2R2): selected in case2(SIDE=8) and case3(SIDE=9) → [0,1,1]
    expect(result.counts[1]).toEqual([0, 1, 1])
  })

  it('rowTotalsN = selection count per member (can exceed grandTotal)', () => {
    // Row 1: selected in 2 cases; Row 2: selected in 2 cases
    expect(result.rowTotalsN).toEqual([2, 2])
  })

  it('colTotalsN = respondent count per column value', () => {
    // SIDE=7: 1 respondent (case1; case4 excluded), SIDE=8: 1, SIDE=9: 1
    expect(result.colTotalsN).toEqual([1, 1, 1])
  })

  it('result has rowPaths and colPaths', () => {
    expect(result.rowPaths).toEqual([['Row 1'], ['Row 2']])
    expect(result.colPaths).toEqual([['7'], ['8'], ['9']])
  })
})

// ─── 4. computeGroupedCrosstab – Grid as Column ──────────────────────────────

describe('computeGroupedCrosstab › Grid as Column', () => {
  /**
   * Scenario:
   *  Row: GENDER (Male / Female)
   *  Col: NEWA2 Grid (A2R1="Row 1", A2R2="Row 2")
   *
   *  Case 1: gender=Male   A2R1=1 A2R2=0
   *  Case 2: gender=Female A2R1=1 A2R2=1
   *  Case 3: gender=Male   A2R1=0 A2R2=1
   */
  const gridDef = makeGridDef('NEWA2', [
    { name: 'NEWA2_A2R1', label: 'Row 1' },
    { name: 'NEWA2_A2R2', label: 'Row 2' },
  ])

  const rawCases = [
    { NEWA2_A2R1: 1, NEWA2_A2R2: 0 },
    { NEWA2_A2R1: 1, NEWA2_A2R2: 1 },
    { NEWA2_A2R1: 0, NEWA2_A2R2: 1 },
  ]
  const labeledCases = [
    { GENDER: 'Male' },
    { GENDER: 'Female' },
    { GENDER: 'Male' },
  ]
  const config = { rowVar: 'GENDER', colVar: 'NEWA2', showCount: true, showPercent: false, percentType: 'column' as const }

  const result = computeGroupedCrosstab(rawCases, labeledCases, config, gridDef, 'column', 'Gender', ['Male', 'Female'])

  it('rowVar=GENDER colVar=NEWA2', () => {
    expect(result.rowVar).toBe('GENDER')
    expect(result.colVar).toBe('NEWA2')
  })

  it('colValues = Grid member labels', () => {
    expect(result.colValues).toEqual(['Row 1', 'Row 2'])
  })

  it('rowValues = other variable values in given order', () => {
    expect(result.rowValues).toEqual(['Male', 'Female'])
  })

  it('grandTotal = cases with at least one selection', () => {
    expect(result.grandTotal).toBe(3)
  })

  it('counts[rowIdx][memberIdx] correct', () => {
    // Male: A2R1 in case1, A2R2 in case3 → [1, 1]
    expect(result.counts[0]).toEqual([1, 1])
    // Female: A2R1 AND A2R2 in case2 → [1, 1]
    expect(result.counts[1]).toEqual([1, 1])
  })

  it('rowTotalsN = respondent count per row value', () => {
    // Male: 2 cases (1,3); Female: 1 case (2)
    expect(result.rowTotalsN).toEqual([2, 1])
  })

  it('colTotalsN = selection count per Grid member (can exceed grandTotal)', () => {
    // Row 1 (A2R1): selected in cases 1,2 → 2; Row 2 (A2R2): cases 2,3 → 2
    expect(result.colTotalsN).toEqual([2, 2])
  })
})

// ─── 5. Edge cases ───────────────────────────────────────────────────────────

describe('computeGroupedCrosstab › Grid edge cases', () => {
  const gridDef = makeGridDef('G', [
    { name: 'G_R1', label: 'R1' },
    { name: 'G_R2', label: 'R2' },
  ])

  it('throws when no usable other-variable data exists', () => {
    expect(() => computeGroupedCrosstab(
      [{ G_R1: 1 }],
      [{ OTHER: '' }],   // all blank → no colValues
      { rowVar: 'G', colVar: 'OTHER', showCount: true, showPercent: false, percentType: 'column' as const },
      gridDef,
      'row',
      'Other',
    )).toThrow()
  })

  it('grandTotal=0 when every case has no selection', () => {
    const result = computeGroupedCrosstab(
      [{ G_R1: 0, G_R2: 0 }, { G_R1: 0, G_R2: 0 }],
      [{ COL: 'A' }, { COL: 'B' }],
      { rowVar: 'G', colVar: 'COL', showCount: true, showPercent: false, percentType: 'column' as const },
      gridDef,
      'row',
      'Col',
      ['A', 'B'],
    )
    expect(result.grandTotal).toBe(0)
    expect(result.counts).toEqual([[0, 0], [0, 0]])
  })

  it('one case selects all members', () => {
    const result = computeGroupedCrosstab(
      [{ G_R1: 1, G_R2: 1 }],
      [{ COL: 'X' }],
      { rowVar: 'G', colVar: 'COL', showCount: true, showPercent: false, percentType: 'column' as const },
      gridDef,
      'row',
      'Col',
      ['X'],
    )
    expect(result.grandTotal).toBe(1)
    expect(result.counts).toEqual([[1], [1]])
    expect(result.rowTotalsN).toEqual([1, 1])
    expect(result.colTotalsN).toEqual([1])
  })
})

// ─── 6. filterZeroRows with rowSectionBases (Grid result) ───────────────────

describe('filterZeroRows › Grid result with rowSectionBases', () => {
  /**
   * Simulates a 2-section Grid result:
   *   Section A (startIndex=0): rows "A_val1"(total=3), "A_val2"(total=0) ← zero
   *   Section B (startIndex=2): rows "B_val1"(total=0) ← zero, "B_val2"(total=2)
   */
  const base = {
    rowVar: 'G', colVar: 'C',
    rowLabel: 'Grid', colLabel: 'Col',
    colValues: ['X', 'Y'],
    colTotalsN: [3, 2],
    grandTotal: 5,
  }
  const gridResult = {
    ...base,
    rowValues:    ['A_val1', 'A_val2', 'B_val1', 'B_val2'],
    rowTypes:     ['data',   'data',   'data',   'data'] as CrosstabRowType[],
    counts:       [[2, 1],  [0, 0],   [0, 0],   [1, 1]],
    rowTotalsN:   [3,       0,        0,        2],
    rowSectionBases: [
      { startIndex: 0, label: 'Section A', totalN: 3, colTotalsN: [2, 1] },
      { startIndex: 2, label: 'Section B', totalN: 2, colTotalsN: [1, 1] },
    ],
  }

  const filtered = filterZeroRows(gridResult, true)

  it('removes zero-total rows', () => {
    expect(filtered.rowValues).toEqual(['A_val1', 'B_val2'])
  })

  it('retains non-zero rows with correct counts', () => {
    expect(filtered.counts).toEqual([[2, 1], [1, 1]])
    expect(filtered.rowTotalsN).toEqual([3, 2])
  })

  it('remaps section A startIndex correctly', () => {
    const secA = filtered.rowSectionBases?.find(s => s.label === 'Section A')
    expect(secA?.startIndex).toBe(0)
  })

  it('remaps section B startIndex correctly (B_val2 is now at index 1)', () => {
    const secB = filtered.rowSectionBases?.find(s => s.label === 'Section B')
    expect(secB?.startIndex).toBe(1)
  })

  it('removes sections that have all rows filtered out', () => {
    // All rows in a section zeroed → section removed
    const allZeroResult = {
      ...base,
      rowValues:   ['A_val1', 'B_val1', 'B_val2'],
      rowTypes:    ['data', 'data', 'data'] as CrosstabRowType[],
      counts:      [[2, 1], [0, 0], [1, 1]],
      rowTotalsN:  [3, 0, 2],
      rowSectionBases: [
        { startIndex: 0, label: 'Section A', totalN: 3, colTotalsN: [2, 1] },
        { startIndex: 1, label: 'Section B (all zero)', totalN: 2, colTotalsN: [1, 1] },
        { startIndex: 2, label: 'Section C', totalN: 2, colTotalsN: [1, 1] },
      ],
    }
    const f = filterZeroRows(allZeroResult, true)
    expect(f.rowValues).toEqual(['A_val1', 'B_val2'])
    expect(f.rowSectionBases?.map(s => s.label)).toEqual(['Section A', 'Section C'])
  })

  it('does nothing when hideZeroRows=false', () => {
    const unchanged = filterZeroRows(gridResult, false)
    expect(unchanged).toBe(gridResult)  // same reference
  })
})
