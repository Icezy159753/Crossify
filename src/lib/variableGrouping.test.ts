import { describe, expect, it } from 'vitest'
import {
  buildVariableCatalog,
  computeGroupedCrosstab,
  computeGroupedCrosstabAsync,
  getGroupedBaseCount,
  getGroupedSelections,
  summarizeGroupedRawValues,
} from './variableGrouping'
import type { SpssVariable } from './savParser'

function numericVar(
  name: string,
  valueLabels: Record<string, string>,
  label = name,
): SpssVariable {
  return {
    name,
    longName: name,
    label,
    valueLabels,
    isString: false,
    stringLength: 0,
    slotCount: 1,
    dictIndex: 1,
  }
}

// ─── buildVariableCatalog ─────────────────────────────────────────────────────

describe('buildVariableCatalog', () => {
  it('normalizes aggregate-by-code labels so SPSS-style decimal keys still match raw case values', () => {
    const variables = [
      numericVar('QUOTA_SUMZ1$1', { '1.00000000': 'Random A', '2.00000000': 'Random B' }, '*quota_sum'),
      numericVar('QUOTA_SUMZ1$2', { '3.00000000': 'Random C', '4.00000000': 'Random D' }, '*quota_sum'),
    ]

    const catalog = buildVariableCatalog(variables, [{
      groupName: 'QUOTA_SUMZ1_O',
      label: '*quota_sum',
      members: ['QUOTA_SUMZ1$1', 'QUOTA_SUMZ1$2'],
    }])

    const grouped = catalog.groupedByName.get('QUOTA_SUMZ1_O')
    expect(grouped).toBeDefined()
    expect(grouped?.options.map(o => o.valueCode)).toEqual(['1', '2', '3', '4'])

    const selected = getGroupedSelections(grouped!, { 'QUOTA_SUMZ1$1': 1, 'QUOTA_SUMZ1$2': 4 })
    expect(selected).toEqual(['1. Random A', '4. Random D'])
  })

  it('treats shared 0/1-style member codes as a dichotomy set instead of aggregating by code', () => {
    const variables = [
      numericVar('Q1$1', { '0': 'No', '1': 'Yes' }, 'Can'),
      numericVar('Q1$2', { '0': 'No', '1': 'Yes' }, 'Cup'),
      numericVar('Q1$3', { '0': 'No', '1': 'Yes' }, 'Pouch'),
      numericVar('Q1', { '1': 'Can', '2': 'Cup', '3': 'Pouch' }, 'Q1'),
    ]

    const catalog = buildVariableCatalog(variables)
    const grouped = catalog.groupedByName.get('Q1_O')
    expect(grouped).toBeDefined()
    expect(grouped?.aggregateByCode).toBe(false)
    expect(grouped?.options.map(o => o.label)).toEqual(['1. Can', '2. Cup', '3. Pouch'])
  })

  it('includes observed raw codes for category sets even when SAV labels are incomplete', () => {
    const variables = [
      numericVar('Q86A$1', { '1': 'Can', '2': 'Cup', '3': 'Pouch', '4': 'Tray', '5': 'Other' }, 'Q86A'),
      numericVar('Q86A$2', { '1': 'Can', '2': 'Cup', '3': 'Pouch', '4': 'Tray', '5': 'Other' }, 'Q86A'),
      numericVar('Q86A$3', { '1': 'Can', '2': 'Cup', '3': 'Pouch', '4': 'Tray', '5': 'Other' }, 'Q86A'),
    ]

    const catalog = buildVariableCatalog(variables, [], [
      { 'Q86A$1': 27, 'Q86A$2': 20, 'Q86A$3': '' },
      { 'Q86A$1': 19, 'Q86A$2': '', 'Q86A$3': 23 },
    ])

    const grouped = catalog.groupedByName.get('Q86A_O')
    expect(grouped).toBeDefined()
    expect(grouped?.aggregateByCode).toBe(true)
    expect(grouped?.options.map(o => o.valueCode)).toEqual(['1', '2', '3', '4', '5', '19', '20', '23', '27'])
  })

  it('non-MA variables (no $ suffix) appear in list without grouping', () => {
    const variables = [
      numericVar('GENDER', { '1': 'Male', '2': 'Female' }),
      numericVar('AGE', {}),
    ]
    const catalog = buildVariableCatalog(variables)
    expect(catalog.byName.has('GENDER')).toBe(true)
    expect(catalog.byName.has('AGE')).toBe(true)
    expect(catalog.groupedByName.size).toBe(0)
  })

  it('custom MRSET overrides auto-detected group when groupName matches', () => {
    const variables = [
      numericVar('Q1$1', { '0': 'No', '1': 'Yes' }, 'A'),
      numericVar('Q1$2', { '0': 'No', '1': 'Yes' }, 'B'),
    ]
    const catalog = buildVariableCatalog(variables, [{
      groupName: 'Q1_O',
      label: 'Custom Label',
      members: ['Q1$1', 'Q1$2'],
    }])
    expect(catalog.groupedByName.get('Q1_O')?.label).toBe('Custom Label')
  })
})

// ─── getGroupedBaseCount ──────────────────────────────────────────────────────

describe('getGroupedBaseCount', () => {
  const grouped = {
    name: 'G', label: 'G', longName: 'G', aggregateByCode: false,
    memberNames: ['G$1', 'G$2'],
    options: [
      { memberName: 'G$1', label: 'A', order: 1, selectedCodes: new Set(['1']) },
      { memberName: 'G$2', label: 'B', order: 2, selectedCodes: new Set(['1']) },
    ],
  }

  it('counts cases with at least one selected member', () => {
    const cases = [
      { 'G$1': 1, 'G$2': 0 },    // ✓ (G$1 selected)
      { 'G$1': 0, 'G$2': 1 },    // ✓ (G$2 selected)
      { 'G$1': 0, 'G$2': 0 },    // ✗
      { 'G$1': 1, 'G$2': 1 },    // ✓ (both)
    ]
    expect(getGroupedBaseCount(grouped, cases)).toBe(3)
  })

  it('returns 0 when no case has any selection', () => {
    expect(getGroupedBaseCount(grouped, [{ 'G$1': 0, 'G$2': 0 }])).toBe(0)
  })

  it('returns 0 for empty rawCases', () => {
    expect(getGroupedBaseCount(grouped, [])).toBe(0)
  })
})

// ─── summarizeGroupedRawValues ────────────────────────────────────────────────

describe('summarizeGroupedRawValues', () => {
  const grouped = {
    name: 'G', label: 'G', longName: 'G', aggregateByCode: false,
    memberNames: ['G$1', 'G$2'],
    options: [],
  }

  it('counts each code per member', () => {
    const cases = [
      { 'G$1': 1, 'G$2': 2 },
      { 'G$1': 1, 'G$2': 3 },
      { 'G$1': 2, 'G$2': 2 },
    ]
    const result = summarizeGroupedRawValues(grouped, cases)
    expect(result).toHaveLength(2)

    const g1 = result[0]
    expect(g1.memberName).toBe('G$1')
    // code '1' appears 2 times, '2' appears 1 time → sorted by count desc
    expect(g1.counts[0]).toEqual({ code: '1', count: 2 })
    expect(g1.counts[1]).toEqual({ code: '2', count: 1 })
  })

  it('respects limit parameter', () => {
    const cases = Array.from({ length: 10 }, (_, i) => ({ 'G$1': i + 1, 'G$2': 0 }))
    const result = summarizeGroupedRawValues(grouped, cases, 3)
    expect(result[0].counts).toHaveLength(3)
  })

  it('skips empty/null values', () => {
    const cases = [{ 'G$1': '', 'G$2': 1 }, { 'G$1': null as unknown as number, 'G$2': 1 }]
    const result = summarizeGroupedRawValues(grouped, cases)
    expect(result[0].counts).toHaveLength(0)  // G$1 has no valid codes
    expect(result[1].counts[0].code).toBe('1')
  })
})

// ─── computeGroupedCrosstab ───────────────────────────────────────────────────

describe('computeGroupedCrosstab', () => {
  const dichotomyGrouped = {
    name: 'MA', label: 'Multi Answer', longName: 'MA', aggregateByCode: false,
    memberNames: ['MA$1', 'MA$2', 'MA$3'],
    options: [
      { memberName: 'MA$1', label: 'Option A', order: 1, selectedCodes: new Set(['1']) },
      { memberName: 'MA$2', label: 'Option B', order: 2, selectedCodes: new Set(['1']) },
      { memberName: 'MA$3', label: 'Option C', order: 3, selectedCodes: new Set(['1']) },
    ],
  }

  const rawCases = [
    { 'MA$1': 1, 'MA$2': 0, 'MA$3': 1 },  // selects A, C
    { 'MA$1': 0, 'MA$2': 1, 'MA$3': 1 },  // selects B, C
    { 'MA$1': 1, 'MA$2': 1, 'MA$3': 0 },  // selects A, B
    { 'MA$1': 0, 'MA$2': 0, 'MA$3': 0 },  // selects nothing → excluded
  ]
  const labeledCases = [{ COL: 'X' }, { COL: 'X' }, { COL: 'Y' }, { COL: 'X' }]
  const config = { rowVar: 'MA', colVar: 'COL', showCount: true, showPercent: false, percentType: 'column' as const }

  it('MA on Row: grandTotal excludes empty cases', () => {
    const result = computeGroupedCrosstab(rawCases, labeledCases, config, dichotomyGrouped, 'row', 'Col', ['X', 'Y'])
    expect(result.grandTotal).toBe(3)
  })

  it('MA on Row: counts each option per column', () => {
    const result = computeGroupedCrosstab(rawCases, labeledCases, config, dichotomyGrouped, 'row', 'Col', ['X', 'Y'])
    // A: case1(X), case3(Y) → [1,1]; B: case2(X), case3(Y) → [1,1]; C: case1(X), case2(X) → [2,0]
    expect(result.counts[0]).toEqual([1, 1])  // A
    expect(result.counts[1]).toEqual([1, 1])  // B
    expect(result.counts[2]).toEqual([2, 0])  // C
  })

  it('throws when no usable column values', () => {
    expect(() => computeGroupedCrosstab(
      rawCases,
      labeledCases.map(() => ({ COL: '' })),
      config, dichotomyGrouped, 'row', 'Col',
    )).toThrow()
  })
})

// ─── computeGroupedCrosstabAsync ──────────────────────────────────────────────

describe('computeGroupedCrosstabAsync', () => {
  const grouped = {
    name: 'MA', label: 'MA', longName: 'MA', aggregateByCode: false,
    memberNames: ['MA$1', 'MA$2'],
    options: [
      { memberName: 'MA$1', label: 'A', order: 1, selectedCodes: new Set(['1']) },
      { memberName: 'MA$2', label: 'B', order: 2, selectedCodes: new Set(['1']) },
    ],
  }

  it('returns same result as sync version', async () => {
    const rawCases = [{ 'MA$1': 1, 'MA$2': 0 }, { 'MA$1': 0, 'MA$2': 1 }]
    const labeledCases = [{ C: 'X' }, { C: 'Y' }]
    const config = { rowVar: 'MA', colVar: 'C', showCount: true, showPercent: false, percentType: 'column' as const }

    const sync = computeGroupedCrosstab(rawCases, labeledCases, config, grouped, 'row', 'C', ['X', 'Y'])
    const async_ = await computeGroupedCrosstabAsync(rawCases, labeledCases, config, grouped, 'row', 'C', ['X', 'Y'])

    expect(async_.rowValues).toEqual(sync.rowValues)
    expect(async_.counts).toEqual(sync.counts)
    expect(async_.grandTotal).toBe(sync.grandTotal)
  })

  it('throws when no usable data', async () => {
    const grouped2 = { ...grouped }
    await expect(computeGroupedCrosstabAsync(
      [{ 'MA$1': 1 }],
      [{ C: '' }],
      { rowVar: 'MA', colVar: 'C', showCount: true, showPercent: false, percentType: 'column' as const },
      grouped2, 'row', 'C',
    )).rejects.toThrow()
  })
})
