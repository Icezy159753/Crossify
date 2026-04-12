/**
 * Tests for pure utility functions in excelExport.ts.
 * None of these touch ExcelJS — they operate on plain data only.
 */
import { describe, expect, it } from 'vitest'
import {
  excelColName,
  sanitizeSheetName,
  computeSheetNames,
  buildHeaderGroups,
  buildRowDisplayPaths,
  buildRowSectionMeta,
  normalizeRowStructure,
} from './excelExport'
import type { CrosstabResult } from './crosstabEngine'

// ─── excelColName ─────────────────────────────────────────────────────────────

describe('excelColName', () => {
  it('col 1 → A', () => expect(excelColName(1)).toBe('A'))
  it('col 26 → Z', () => expect(excelColName(26)).toBe('Z'))
  it('col 27 → AA', () => expect(excelColName(27)).toBe('AA'))
  it('col 28 → AB', () => expect(excelColName(28)).toBe('AB'))
  it('col 52 → AZ', () => expect(excelColName(52)).toBe('AZ'))
  it('col 53 → BA', () => expect(excelColName(53)).toBe('BA'))
  it('col 702 → ZZ', () => expect(excelColName(702)).toBe('ZZ'))
})

// ─── sanitizeSheetName ────────────────────────────────────────────────────────

describe('sanitizeSheetName', () => {
  it('returns name unchanged when valid', () => {
    expect(sanitizeSheetName('Sales 2024')).toBe('Sales 2024')
  })

  it('removes illegal chars: \\ / * ? [ ] :', () => {
    expect(sanitizeSheetName('A\\B/C*D?E[F]G:H')).toBe('ABCDEFGH')
  })

  it('truncates to 31 characters', () => {
    const long = 'A'.repeat(40)
    expect(sanitizeSheetName(long)).toHaveLength(31)
  })

  it('trims whitespace after sanitization', () => {
    expect(sanitizeSheetName('  name  ')).toBe('name')
  })

  it('returns "Sheet" when result is empty after sanitization', () => {
    expect(sanitizeSheetName('***')).toBe('Sheet')
    expect(sanitizeSheetName('')).toBe('Sheet')
  })
})

// ─── computeSheetNames ────────────────────────────────────────────────────────

describe('computeSheetNames', () => {
  it('returns names unchanged when all unique', () => {
    expect(computeSheetNames(['Alpha', 'Beta', 'Gamma'])).toEqual(['Alpha', 'Beta', 'Gamma'])
  })

  it('deduplicates duplicate names with suffix (2), (3), …', () => {
    const result = computeSheetNames(['Var', 'Var', 'Var'])
    expect(result[0]).toBe('Var')
    expect(result[1]).toBe('Var (2)')
    expect(result[2]).toBe('Var (3)')
  })

  it('handles mix of unique and duplicate', () => {
    const result = computeSheetNames(['A', 'B', 'A'])
    expect(result[0]).toBe('A')
    expect(result[1]).toBe('B')
    expect(result[2]).toBe('A (2)')
  })

  it('empty array returns empty array', () => {
    expect(computeSheetNames([])).toEqual([])
  })
})

// ─── buildHeaderGroups ───────────────────────────────────────────────────────

describe('buildHeaderGroups', () => {
  it('flat paths (1 level): each path → separate group of span 1', () => {
    const paths = [['A'], ['B'], ['C']]
    const groups = buildHeaderGroups(paths, 1)
    expect(groups).toHaveLength(1)
    expect(groups[0]).toEqual([
      { label: 'A', span: 1 },
      { label: 'B', span: 1 },
      { label: 'C', span: 1 },
    ])
  })

  it('2-level paths: merges consecutive same-prefix groups at level 0', () => {
    // paths: [Nest, 4], [Nest, 5], [Other, 1]
    // level 0: Nest(span=2), Other(span=1)
    // level 1: 4(span=1), 5(span=1), 1(span=1)
    const paths = [['Nest', '4'], ['Nest', '5'], ['Other', '1']]
    const groups = buildHeaderGroups(paths, 2)
    expect(groups[0]).toEqual([{ label: 'Nest', span: 2 }, { label: 'Other', span: 1 }])
    expect(groups[1]).toEqual([{ label: '4', span: 1 }, { label: '5', span: 1 }, { label: '1', span: 1 }])
  })

  it('levels=0 returns empty array', () => {
    expect(buildHeaderGroups([['A'], ['B']], 0)).toEqual([])
  })
})

// ─── buildRowDisplayPaths ─────────────────────────────────────────────────────

describe('buildRowDisplayPaths', () => {
  it('first row always shows all segments', () => {
    const paths = [['A', '1'], ['A', '2'], ['B', '1']]
    const result = buildRowDisplayPaths(paths)
    expect(result[0]).toEqual(['A', '1'])
  })

  it('suppresses repeated prefix segments in subsequent rows', () => {
    // row 0: A / 1 → show both
    // row 1: A / 2 → A is same → '', 2 is different → '2'
    // row 2: B / 1 → B is different → 'B', 1 → '1'
    const paths = [['A', '1'], ['A', '2'], ['B', '1']]
    const result = buildRowDisplayPaths(paths)
    expect(result[1]).toEqual(['', '2'])
    expect(result[2]).toEqual(['B', '1'])
  })

  it('single-element paths: row 0 shows, row 1 suppresses if same', () => {
    const paths = [['X'], ['X'], ['Y']]
    const result = buildRowDisplayPaths(paths)
    expect(result[0]).toEqual(['X'])
    expect(result[1]).toEqual([''])
    expect(result[2]).toEqual(['Y'])
  })

  it('empty array returns empty array', () => {
    expect(buildRowDisplayPaths([])).toEqual([])
  })
})

// ─── buildRowSectionMeta ──────────────────────────────────────────────────────

describe('buildRowSectionMeta', () => {
  it('single section spans all rows', () => {
    const sections = [{ startIndex: 0, label: 'Section A' }]
    const { byStart, covered } = buildRowSectionMeta(sections, 3)
    expect(byStart.get(0)).toEqual({ label: 'Section A', span: 3 })
    expect(covered.has(1)).toBe(true)
    expect(covered.has(2)).toBe(true)
    expect(covered.has(0)).toBe(false)  // start index not in covered (it's the anchor)
  })

  it('two sections: first spans up to second, second spans remainder', () => {
    const sections = [
      { startIndex: 0, label: 'A' },
      { startIndex: 2, label: 'B' },
    ]
    const { byStart, covered } = buildRowSectionMeta(sections, 4)
    expect(byStart.get(0)).toEqual({ label: 'A', span: 2 })  // rows 0,1
    expect(byStart.get(2)).toEqual({ label: 'B', span: 2 })  // rows 2,3
    expect(covered.has(1)).toBe(true)   // row 1 covered by section A
    expect(covered.has(3)).toBe(true)   // row 3 covered by section B
    expect(covered.has(0)).toBe(false)  // row 0 is anchor of A
    expect(covered.has(2)).toBe(false)  // row 2 is anchor of B
  })

  it('empty sectionBases: empty byStart and covered', () => {
    const { byStart, covered } = buildRowSectionMeta([], 5)
    expect(byStart.size).toBe(0)
    expect(covered.size).toBe(0)
  })
})

// ─── normalizeRowStructure ────────────────────────────────────────────────────

describe('normalizeRowStructure', () => {
  const baseResult: CrosstabResult = {
    rowVar: 'Q1', colVar: 'C',
    rowLabel: 'Question 1', colLabel: 'Col',
    rowValues: ['r0', 'r1'],
    colValues: ['A'],
    colPaths: [['A']],
    counts: [[1], [2]],
    rowTotalsN: [1, 2],
    colTotalsN: [3],
    grandTotal: 3,
  }

  it('wraps single-level paths and creates a synthetic section when no sectionBases', () => {
    const out = normalizeRowStructure(baseResult, [['r0'], ['r1']], ['Category'], [])
    // rowPaths should be prefixed with rowLabel
    expect(out.rowPaths[0]).toEqual(['Question 1', 'r0'])
    expect(out.rowLevelLabels).toEqual(['Variable', 'Category'])
    expect(out.rowSectionBases).toHaveLength(1)
    expect(out.rowSectionBases[0].label).toBe('Question 1')
    expect(out.rowSectionBases[0].totalN).toBe(3)
  })

  it('returns inputs unchanged when sectionBases already provided', () => {
    const sectionBases = [{ startIndex: 0, label: 'Sec', totalN: 3, colTotalsN: [3] }]
    const out = normalizeRowStructure(baseResult, [['Sec', 'r0']], ['Variable', 'Category'], sectionBases)
    expect(out.rowPaths).toEqual([['Sec', 'r0']])
    expect(out.rowSectionBases).toBe(sectionBases)
  })

  it('returns inputs unchanged when rowLevelLabels has >1 entry (even without sectionBases)', () => {
    const out = normalizeRowStructure(baseResult, [['A', 'B']], ['L1', 'L2'], [])
    expect(out.rowLevelLabels).toEqual(['L1', 'L2'])
    expect(out.rowSectionBases).toEqual([])
  })
})
