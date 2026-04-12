import { describe, expect, it } from 'vitest'
import {
  buildScaleSummaryPreset,
  buildVariableEditorDisplayRows,
  buildVariableEditorRowsWithSummaries,
  getGroupDepth,
  getNetPrefix,
  type VariableEditorRow,
  type VariableNetGroup,
} from './variableEditorUtils'

// ─── getNetPrefix ─────────────────────────────────────────────────────────────

describe('getNetPrefix', () => {
  it('depth 0 → "Net : "', () => expect(getNetPrefix(0)).toBe('Net : '))
  it('depth 1 → "Subnet : "', () => expect(getNetPrefix(1)).toBe('Subnet : '))
  it('depth 2 → "SubSubnet : "', () => expect(getNetPrefix(2)).toBe('SubSubnet : '))
  it('depth 3 → "SubSubSubnet : "', () => expect(getNetPrefix(3)).toBe('SubSubSubnet : '))
  it('negative depth → "Net : "', () => expect(getNetPrefix(-1)).toBe('Net : '))
})

// ─── getGroupDepth ────────────────────────────────────────────────────────────

describe('getGroupDepth', () => {
  const groups: VariableNetGroup[] = [
    { id: 'a', name: 'A', members: ['1'] },
    { id: 'b', name: 'B', members: ['2'], parentId: 'a' },
    { id: 'c', name: 'C', members: ['3'], parentId: 'b' },
  ]

  it('root group has depth 0', () => expect(getGroupDepth(groups[0], groups)).toBe(0))
  it('child of root has depth 1', () => expect(getGroupDepth(groups[1], groups)).toBe(1))
  it('grandchild has depth 2', () => expect(getGroupDepth(groups[2], groups)).toBe(2))

  it('breaks circular references without infinite loop', () => {
    const circular: VariableNetGroup[] = [
      { id: 'x', name: 'X', members: [], parentId: 'y' },
      { id: 'y', name: 'Y', members: [], parentId: 'x' },
    ]
    expect(() => getGroupDepth(circular[0], circular)).not.toThrow()
  })
})

// ─── buildVariableEditorDisplayRows ──────────────────────────────────────────

describe('buildVariableEditorDisplayRows', () => {
  const rows: VariableEditorRow[] = [
    { key: '1', code: '1', label: 'One', count: 10, percent: 50, factor: '1' },
    { key: '2', code: '2', label: 'Two', count: 5, percent: 25, factor: '1' },
    { key: '3', code: '3', label: 'Three', count: 5, percent: 25, factor: '1' },
  ]

  it('returns code rows unchanged when no groups', () => {
    expect(buildVariableEditorDisplayRows(rows, [])).toEqual(rows)
  })

  it('injects net rows before grouped members and indents descendants', () => {
    const groups: VariableNetGroup[] = [
      { id: 'g1', name: 'Topline', members: ['1', '2'] },
      { id: 'g2', name: 'Nested', members: ['2'], parentId: 'g1' },
    ]
    const result = buildVariableEditorDisplayRows(rows, groups)

    expect(result.map(row => row.label)).toEqual([
      'Net : Topline',
      'One',
      'Subnet : Nested',
      'Two',
      'Three',
    ])
    expect(result.find(row => row.key === '2')?.indentLevel).toBe(2)
  })

  it('net row count = sum of member counts', () => {
    const groups: VariableNetGroup[] = [{ id: 'g1', name: 'Top', members: ['1', '2'] }]
    const result = buildVariableEditorDisplayRows(rows, groups)
    const netRow = result.find(row => row.rowKind === 'net')
    expect(netRow?.count).toBe(15)
  })

  it('skips groups whose members are not in rows', () => {
    const groups: VariableNetGroup[] = [{ id: 'g1', name: 'Ghost', members: ['99'] }]
    const result = buildVariableEditorDisplayRows(rows, groups)
    expect(result.some(row => row.label === 'Net : Ghost')).toBe(false)
  })
})

// ─── buildVariableEditorRowsWithSummaries ─────────────────────────────────────

describe('buildVariableEditorRowsWithSummaries', () => {
  const rows: VariableEditorRow[] = [
    { key: '1', code: '1', label: 'One', count: 10, percent: 50, factor: '1', rowKind: 'code' },
    { key: '2', code: '2', label: 'Two', count: 5, percent: 25, factor: '1', rowKind: 'code' },
    { key: '3', code: '3', label: 'Three', count: 5, percent: 25, factor: '1', rowKind: 'code' },
  ]

  it('appends summary rows after display rows', () => {
    const result = buildVariableEditorRowsWithSummaries(rows, [], [
      { code: 'TB', label: 'TB', members: ['1'] },
      { code: 'BB', label: 'BB', members: ['3'] },
    ])
    expect(result.slice(-2).map(row => row.code)).toEqual(['TB', 'BB'])
    expect(result.slice(-2).map(row => row.rowKind)).toEqual(['summary', 'summary'])
  })

  it('summary count = sum of member counts', () => {
    const result = buildVariableEditorRowsWithSummaries(rows, [], [
      { code: 'T2B', label: 'T2B', members: ['1', '2'] },
    ])
    const t2b = result.find(row => row.code === 'T2B')
    expect(t2b?.count).toBe(15)
  })

  it('summary percent = count / baseCount * 100', () => {
    const result = buildVariableEditorRowsWithSummaries(rows, [], [
      { code: 'T2B', label: 'T2B', members: ['1', '2'] },
    ])
    const t2b = result.find(row => row.code === 'T2B')
    // baseCount = 10+5+5=20, count=15 → 75%
    expect(t2b?.percent).toBeCloseTo(75)
  })

  it('returns display rows unchanged when no summaries', () => {
    const result = buildVariableEditorRowsWithSummaries(rows, [], [])
    expect(result).toEqual(rows)
  })
})

// ─── buildScaleSummaryPreset ──────────────────────────────────────────────────

const scale5 = [
  { key: '1', code: '1' },
  { key: '2', code: '2' },
  { key: '3', code: '3' },
  { key: '4', code: '4' },
  { key: '5', code: '5' },
]

describe('buildScaleSummaryPreset', () => {
  it('tb_low_good: only TB and BB (no T2B/T3B)', () => {
    const result = buildScaleSummaryPreset(scale5, 'tb_low_good')
    expect(result.summaries.map(s => s.code)).toEqual(['TB', 'BB'])
    expect(result.summaries[0].members).toEqual(['1'])   // TB = lowest (best)
    expect(result.summaries[1].members).toEqual(['5'])   // BB = highest (worst)
  })

  it('tb_high_good: only TB and BB (no T2B/T3B)', () => {
    const result = buildScaleSummaryPreset(scale5, 'tb_high_good')
    expect(result.summaries.map(s => s.code)).toEqual(['TB', 'BB'])
    expect(result.summaries[0].members).toEqual(['5'])   // TB = highest (best)
    expect(result.summaries[1].members).toEqual(['1'])   // BB = lowest (worst)
  })

  it('t2b_low_good: TB + T2B + BB + B2B', () => {
    const result = buildScaleSummaryPreset(scale5, 't2b_low_good')
    expect(result.factors).toEqual({ '1': '5', '2': '4', '3': '3', '4': '2', '5': '1' })
    expect(result.summaries).toEqual([
      { code: 'TB', label: 'TB', members: ['1'] },
      { code: 'T2B', label: 'T2B', members: ['1', '2'] },
      { code: 'BB', label: 'BB', members: ['5'] },
      { code: 'B2B', label: 'B2B', members: ['4', '5'] },
    ])
  })

  it('t2b_high_good: TB + T2B + BB + B2B (high side)', () => {
    const result = buildScaleSummaryPreset(scale5, 't2b_high_good')
    expect(result.summaries.map(s => s.code)).toEqual(['TB', 'T2B', 'BB', 'B2B'])
    expect(result.summaries[0].members).toEqual(['5'])        // TB = top
    expect(result.summaries[1].members).toEqual(['5', '4'])   // T2B = top 2
    expect(result.summaries[2].members).toEqual(['1'])        // BB = bottom
    expect(result.summaries[3].members).toEqual(['1', '2'])   // B2B = bottom 2
  })

  it('t3b_high_good: TB + T2B + T3B + BB + B2B + B3B', () => {
    const result = buildScaleSummaryPreset(scale5, 't3b_high_good')
    expect(result.factors).toEqual({ '1': '1', '2': '2', '3': '3', '4': '4', '5': '5' })
    expect(result.summaries).toEqual([
      { code: 'TB', label: 'TB', members: ['5'] },
      { code: 'T2B', label: 'T2B', members: ['5', '4'] },
      { code: 'T3B', label: 'T3B', members: ['5', '4', '3'] },
      { code: 'BB', label: 'BB', members: ['1'] },
      { code: 'B2B', label: 'B2B', members: ['1', '2'] },
      { code: 'B3B', label: 'B3B', members: ['1', '2', '3'] },
    ])
  })

  it('t3b_low_good: TB + T2B + T3B + BB + B2B + B3B (low side)', () => {
    const result = buildScaleSummaryPreset(scale5, 't3b_low_good')
    expect(result.summaries.map(s => s.code)).toEqual(['TB', 'T2B', 'T3B', 'BB', 'B2B', 'B3B'])
    expect(result.summaries[0].members).toEqual(['1'])           // TB = lowest
    expect(result.summaries[2].members).toEqual(['1', '2', '3'])// T3B = lowest 3
  })

  it('justright_centered: factors -2 to +2, no summaries', () => {
    const result = buildScaleSummaryPreset(scale5, 'justright_centered')
    expect(result.factors).toEqual({ '1': '-2', '2': '-1', '3': '0', '4': '1', '5': '2' })
    expect(result.summaries).toEqual([])
  })

  it('justright_code: factors 1 to N, no summaries', () => {
    const result = buildScaleSummaryPreset(scale5, 'justright_code')
    expect(result.factors).toEqual({ '1': '1', '2': '2', '3': '3', '4': '4', '5': '5' })
    expect(result.summaries).toEqual([])
  })

  it('justright_code: works with any number of rows', () => {
    const threeScale = [{ key: 'A', code: 'A' }, { key: 'B', code: 'B' }, { key: 'C', code: 'C' }]
    const result = buildScaleSummaryPreset(threeScale, 'justright_code')
    expect(result.factors).toEqual({ A: '1', B: '2', C: '3' })
  })

  it('throws for empty rows', () => {
    expect(() => buildScaleSummaryPreset([], 't2b_high_good')).toThrow()
  })

  it('throws for justright_centered with wrong count', () => {
    const threeScale = [{ key: '1', code: '1' }, { key: '2', code: '2' }, { key: '3', code: '3' }]
    expect(() => buildScaleSummaryPreset(threeScale, 'justright_centered')).toThrow()
  })

  it('sorts rows by numeric code before applying preset', () => {
    // Rows given in reverse order — should still produce correct factors
    const reversed = [{ key: '5', code: '5' }, { key: '3', code: '3' }, { key: '1', code: '1' }]
    const result = buildScaleSummaryPreset(reversed, 'tb_high_good')
    expect(result.summaries[0].members).toEqual(['5'])   // TB = highest
  })
})
