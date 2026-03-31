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

describe('variableEditorUtils', () => {
  it('builds readable net prefixes by depth', () => {
    expect(getNetPrefix(0)).toBe('Net : ')
    expect(getNetPrefix(1)).toBe('Subnet : ')
    expect(getNetPrefix(2)).toBe('SubSubnet : ')
  })

  it('computes group depth from parent links', () => {
    const groups: VariableNetGroup[] = [
      { id: 'a', name: 'A', members: ['1'] },
      { id: 'b', name: 'B', members: ['2'], parentId: 'a' },
    ]
    expect(getGroupDepth(groups[0], groups)).toBe(0)
    expect(getGroupDepth(groups[1], groups)).toBe(1)
  })

  it('injects net rows before grouped members and indents descendants', () => {
    const rows: VariableEditorRow[] = [
      { key: '1', code: '1', label: 'One', count: 10, percent: 50, factor: '1' },
      { key: '2', code: '2', label: 'Two', count: 5, percent: 25, factor: '1' },
      { key: '3', code: '3', label: 'Three', count: 5, percent: 25, factor: '1' },
    ]
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

  it('appends summary rows after display rows', () => {
    const rows: VariableEditorRow[] = [
      { key: '1', code: '1', label: 'One', count: 10, percent: 50, factor: '1', rowKind: 'code' },
      { key: '2', code: '2', label: 'Two', count: 5, percent: 25, factor: '1', rowKind: 'code' },
      { key: '3', code: '3', label: 'Three', count: 5, percent: 25, factor: '1', rowKind: 'code' },
    ]

    const result = buildVariableEditorRowsWithSummaries(rows, [], [
      { code: 'TB', label: 'TB', members: ['1'] },
      { code: 'BB', label: 'BB', members: ['3'] },
    ])

    expect(result.slice(-2).map(row => row.code)).toEqual(['TB', 'BB'])
    expect(result.slice(-2).map(row => row.rowKind)).toEqual(['summary', 'summary'])
  })

  it('builds T2B presets for low-good scale', () => {
    const result = buildScaleSummaryPreset([
      { key: '1', code: '1' },
      { key: '2', code: '2' },
      { key: '3', code: '3' },
      { key: '4', code: '4' },
      { key: '5', code: '5' },
    ], 't2b_low_good')

    expect(result.factors).toEqual({
      '1': '5',
      '2': '4',
      '3': '3',
      '4': '2',
      '5': '1',
    })
    expect(result.summaries).toEqual([
      { code: 'TB', label: 'TB', members: ['1'] },
      { code: 'T2B', label: 'T2B', members: ['1', '2'] },
      { code: 'BB', label: 'BB', members: ['5'] },
      { code: 'B2B', label: 'B2B', members: ['4', '5'] },
    ])
  })

  it('builds T3B presets for high-good scale', () => {
    const result = buildScaleSummaryPreset([
      { key: '1', code: '1' },
      { key: '2', code: '2' },
      { key: '3', code: '3' },
      { key: '4', code: '4' },
      { key: '5', code: '5' },
    ], 't3b_high_good')

    expect(result.factors).toEqual({
      '1': '1',
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
    })
    expect(result.summaries).toEqual([
      { code: 'TB', label: 'TB', members: ['5'] },
      { code: 'T2B', label: 'T2B', members: ['5', '4'] },
      { code: 'T3B', label: 'T3B', members: ['5', '4', '3'] },
      { code: 'BB', label: 'BB', members: ['1'] },
      { code: 'B2B', label: 'B2B', members: ['1', '2'] },
      { code: 'B3B', label: 'B3B', members: ['1', '2', '3'] },
    ])
  })

  it('builds justright centered factors without summaries', () => {
    const result = buildScaleSummaryPreset([
      { key: '1', code: '1' },
      { key: '2', code: '2' },
      { key: '3', code: '3' },
      { key: '4', code: '4' },
      { key: '5', code: '5' },
    ], 'justright_centered')

    expect(result.factors).toEqual({
      '1': '-2',
      '2': '-1',
      '3': '0',
      '4': '1',
      '5': '2',
    })
    expect(result.summaries).toEqual([])
  })
})
