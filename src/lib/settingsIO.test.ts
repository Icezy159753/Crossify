/**
 * Tests for pure utility functions in settingsIO.ts.
 * These functions parse/build plain data and have no ExcelJS dependency.
 */
import { describe, expect, it } from 'vitest'
import {
  parseScalePresetLabel,
  parseScalePresetEntry,
  buildVariableOverrideRows,
  parseVariableOverrideRows,
  isFilterJoin,
  isFilterOperator,
  summarizeFilterCondition,
  summarizeFilter,
  type VariableOverrideSheetRow,
  type VariableNetSheetRow,
} from './settingsIO'

// ─── parseScalePresetLabel ────────────────────────────────────────────────────

describe('parseScalePresetLabel', () => {
  it('Thai tb_low_good variants', () => {
    expect(parseScalePresetLabel('1.สร้างTB(Scale น้อยดี)')).toBe('tb_low_good')
    expect(parseScalePresetLabel('สร้างTB(Scale น้อยดี)')).toBe('tb_low_good')
  })

  it('Thai tb_high_good variants', () => {
    expect(parseScalePresetLabel('2.สร้างTB(Scale มากดี)')).toBe('tb_high_good')
    expect(parseScalePresetLabel('สร้างTB(Scale มากดี)')).toBe('tb_high_good')
  })

  it('Thai t2b_low_good variants', () => {
    expect(parseScalePresetLabel('3.สร้างT2B(Scale น้อยดี)')).toBe('t2b_low_good')
  })

  it('Thai t2b_high_good variants', () => {
    expect(parseScalePresetLabel('4.สร้างT2B(Scale มากดี)')).toBe('t2b_high_good')
  })

  it('trims whitespace before matching', () => {
    expect(parseScalePresetLabel('  สร้างTB(Scale น้อยดี)  ')).toBe('tb_low_good')
  })

  it('unknown value returns empty string', () => {
    expect(parseScalePresetLabel('unknown')).toBe('')
    expect(parseScalePresetLabel('')).toBe('')
  })
})

// ─── parseScalePresetEntry ────────────────────────────────────────────────────

describe('parseScalePresetEntry', () => {
  it('English entries — all 8 presets', () => {
    expect(parseScalePresetEntry('1.Create TB (Low scale = good)')).toBe('tb_low_good')
    expect(parseScalePresetEntry('Create TB (Low scale = good)')).toBe('tb_low_good')
    expect(parseScalePresetEntry('2.Create TB (High scale = good)')).toBe('tb_high_good')
    expect(parseScalePresetEntry('3.Create T2B (Low scale = good)')).toBe('t2b_low_good')
    expect(parseScalePresetEntry('4.Create T2B (High scale = good)')).toBe('t2b_high_good')
    expect(parseScalePresetEntry('5.Create T3B (Low scale = good)')).toBe('t3b_low_good')
    expect(parseScalePresetEntry('6.Create T3B (High scale = good)')).toBe('t3b_high_good')
    expect(parseScalePresetEntry('7.Justright (By code)')).toBe('justright_code')
    expect(parseScalePresetEntry('8.Justright (-2 -1 0 1 2)')).toBe('justright_centered')
  })

  it('falls through to parseScalePresetLabel for Thai entries', () => {
    expect(parseScalePresetEntry('1.สร้างTB(Scale น้อยดี)')).toBe('tb_low_good')
    expect(parseScalePresetEntry('สร้างTB(Scale มากดี)')).toBe('tb_high_good')
  })

  it('unknown returns empty string', () => {
    expect(parseScalePresetEntry('something else')).toBe('')
  })
})

// ─── buildVariableOverrideRows ────────────────────────────────────────────────

describe('buildVariableOverrideRows', () => {
  it('empty overrides → empty rows and netRows', () => {
    const { rows, netRows } = buildVariableOverrideRows({})
    expect(rows).toEqual([])
    expect(netRows).toEqual([])
  })

  it('Label entries produce rows with setting=Label', () => {
    const { rows } = buildVariableOverrideRows({
      Q1: { labels: { '1': 'Agree', '2': 'Disagree' } },
    })
    const labels = rows.filter(r => r.setting === 'Label')
    expect(labels).toHaveLength(2)
    expect(labels.find(r => r.key === '1')?.value).toBe('Agree')
    expect(labels.find(r => r.key === '2')?.value).toBe('Disagree')
  })

  it('Factor entries produce rows with setting=Factor', () => {
    const { rows } = buildVariableOverrideRows({
      Q1: { weights: { '1': '0.5', '2': '1.5' } },
    })
    const factors = rows.filter(r => r.setting === 'Factor')
    expect(factors).toHaveLength(2)
    expect(factors.find(r => r.key === '1')?.value).toBe('0.5')
  })

  it('Order entries use 1-based rank', () => {
    const { rows } = buildVariableOverrideRows({
      Q1: { order: ['c', 'b', 'a'] },
    })
    const order = rows.filter(r => r.setting === 'Order')
    expect(order.find(r => r.key === 'c')?.value).toBe('1')
    expect(order.find(r => r.key === 'a')?.value).toBe('3')
  })

  it('Summary entries store members as comma-separated extra1', () => {
    const { rows } = buildVariableOverrideRows({
      Q1: { summaries: [{ code: 'T2B', label: 'T2B', members: ['4', '5'] }] },
    })
    const summary = rows.find(r => r.setting === 'Summary')
    expect(summary?.key).toBe('T2B')
    expect(summary?.extra1).toBe('4,5')
  })

  it('Net groups produce netRows with correct depth', () => {
    const { netRows } = buildVariableOverrideRows({
      Q1: {
        groups: [
          { id: 'g1', name: 'Parent', members: ['1', '2'], parentId: null },
          { id: 'g2', name: 'Child', members: ['1'], parentId: 'g1' },
        ],
      },
    })
    const parent = netRows.find(r => r.value === 'Parent')
    const child = netRows.find(r => r.value === 'Child')
    expect(parent?.setting).toBe('Net')
    expect(child?.setting).toBe('Subnet')
    expect(parent?.depth).toBe(0)
    expect(child?.depth).toBe(1)
  })

  it('SummaryPreset entry produced when summaryPreset is set', () => {
    const { rows } = buildVariableOverrideRows({
      Q1: { summaryPreset: 't2b_high_good' },
    })
    const preset = rows.find(r => r.setting === 'SummaryPreset')
    expect(preset?.value).toBe('t2b_high_good')
    expect(preset?.key).toBe('preset')
  })
})

// ─── parseVariableOverrideRows ────────────────────────────────────────────────

describe('parseVariableOverrideRows', () => {
  it('empty input → empty result', () => {
    expect(parseVariableOverrideRows([])).toEqual({})
  })

  it('Label rows → labels dict', () => {
    const rows: VariableOverrideSheetRow[] = [
      { variable: 'Q1', setting: 'Label', key: '1', value: 'Strongly Agree' },
    ]
    const result = parseVariableOverrideRows(rows) as Record<string, { labels: Record<string, string> }>
    expect(result.Q1.labels['1']).toBe('Strongly Agree')
  })

  it('Factor rows → weights dict (empty value skipped)', () => {
    const rows: VariableOverrideSheetRow[] = [
      { variable: 'Q1', setting: 'Factor', key: '1', value: '0.5' },
      { variable: 'Q1', setting: 'Factor', key: '2', value: '' },  // skipped
    ]
    const result = parseVariableOverrideRows(rows) as Record<string, { weights: Record<string, string> }>
    expect(result.Q1.weights['1']).toBe('0.5')
    expect(result.Q1.weights['2']).toBeUndefined()
  })

  it('Order rows → sorted order array', () => {
    const rows: VariableOverrideSheetRow[] = [
      { variable: 'Q1', setting: 'Order', key: 'b', value: '2' },
      { variable: 'Q1', setting: 'Order', key: 'a', value: '1' },
    ]
    const result = parseVariableOverrideRows(rows) as Record<string, { order: string[] }>
    expect(result.Q1.order).toEqual(['a', 'b'])
  })

  it('netRows → groups with parent linking', () => {
    const netRows: VariableNetSheetRow[] = [
      { variable: 'Q1', setting: 'Net', value: 'High', code: '4,5', parent: '' },
    ]
    const result = parseVariableOverrideRows([], netRows) as Record<string, { groups: Array<{ name: string; members: string[] }> }>
    expect(result.Q1.groups[0].name).toBe('High')
    expect(result.Q1.groups[0].members).toEqual(['4', '5'])
  })

  it('roundtrip: buildVariableOverrideRows → parseVariableOverrideRows', () => {
    const original = {
      Q1: {
        labels: { '1': 'Yes', '2': 'No' },
        weights: { '1': '1.0' },
        order: ['1', '2'],
        numericStats: [],
        groups: [],
        summaries: [],
        summaryPreset: undefined,
      },
    }
    const { rows, netRows } = buildVariableOverrideRows(original)
    const restored = parseVariableOverrideRows(rows, netRows) as typeof original
    expect(restored.Q1.labels).toEqual(original.Q1.labels)
    expect(restored.Q1.weights).toEqual(original.Q1.weights)
    expect(restored.Q1.order).toEqual(original.Q1.order)
  })
})

// ─── isFilterJoin ─────────────────────────────────────────────────────────────

describe('isFilterJoin', () => {
  it('"all" → true', () => expect(isFilterJoin('all')).toBe(true))
  it('"any" → true', () => expect(isFilterJoin('any')).toBe(true))
  it('"ALL" (uppercase) → false', () => expect(isFilterJoin('ALL')).toBe(false))
  it('empty string → false', () => expect(isFilterJoin('')).toBe(false))
  it('"and" → false', () => expect(isFilterJoin('and')).toBe(false))
})

// ─── isFilterOperator ─────────────────────────────────────────────────────────

describe('isFilterOperator', () => {
  const valid = ['in', 'not_in', 'gt', 'gte', 'lt', 'lte', 'between', 'contains', 'not_contains', 'is_blank', 'not_blank']
  valid.forEach(op => {
    it(`"${op}" → true`, () => expect(isFilterOperator(op)).toBe(true))
  })

  it('"equals" (unknown) → false', () => expect(isFilterOperator('equals')).toBe(false))
  it('empty string → false', () => expect(isFilterOperator('')).toBe(false))
})

// ─── summarizeFilterCondition ─────────────────────────────────────────────────

describe('summarizeFilterCondition', () => {
  function cond(operator: string, extra: object = {}) {
    return { id: 'c1', variableName: 'Q1', operator, values: [], value: '', secondaryValue: '', ...extra }
  }

  it('in: "Q1 in [A, B]"', () => {
    expect(summarizeFilterCondition(cond('in', { values: ['A', 'B'] }) as never)).toBe('Q1 in [A, B]')
  })

  it('not_in: "Q1 not in [X]"', () => {
    expect(summarizeFilterCondition(cond('not_in', { values: ['X'] }) as never)).toBe('Q1 not in [X]')
  })

  it('between: "Q1 between 1 and 5"', () => {
    expect(summarizeFilterCondition(cond('between', { value: '1', secondaryValue: '5' }) as never)).toBe('Q1 between 1 and 5')
  })

  it('is_blank: "Q1 is blank"', () => {
    expect(summarizeFilterCondition(cond('is_blank') as never)).toBe('Q1 is blank')
  })

  it('not_blank: "Q1 is not blank"', () => {
    expect(summarizeFilterCondition(cond('not_blank') as never)).toBe('Q1 is not blank')
  })

  it('gt: "Q1 gt 10"', () => {
    expect(summarizeFilterCondition(cond('gt', { value: '10' }) as never)).toBe('Q1 gt 10')
  })

  it('contains: "Q1 contains abc"', () => {
    expect(summarizeFilterCondition(cond('contains', { value: 'abc' }) as never)).toBe('Q1 contains abc')
  })
})

// ─── summarizeFilter ──────────────────────────────────────────────────────────

describe('summarizeFilter', () => {
  it('undefined → empty string', () => {
    expect(summarizeFilter(undefined)).toBe('')
  })

  it('uses description when provided', () => {
    const filter = { description: 'Male only', rootJoin: 'all' as const, groups: [] }
    expect(summarizeFilter(filter)).toBe('Male only')
  })

  it('empty groups → empty string', () => {
    const filter = { description: '', rootJoin: 'all' as const, groups: [] }
    expect(summarizeFilter(filter)).toBe('')
  })

  it('single condition group → readable summary', () => {
    const filter = {
      description: '',
      rootJoin: 'all' as const,
      groups: [{
        id: 'g1',
        join: 'all' as const,
        conditions: [{
          id: 'c1', variableName: 'GENDER', operator: 'in' as const,
          values: ['1'], value: '', secondaryValue: '',
        }],
      }],
    }
    expect(summarizeFilter(filter)).toBe('GENDER in [1]')
  })

  it('two conditions with AND join', () => {
    const filter = {
      description: '',
      rootJoin: 'all' as const,
      groups: [{
        id: 'g1',
        join: 'all' as const,
        conditions: [
          { id: 'c1', variableName: 'AGE', operator: 'gte' as const, values: [], value: '18', secondaryValue: '' },
          { id: 'c2', variableName: 'AGE', operator: 'lte' as const, values: [], value: '65', secondaryValue: '' },
        ],
      }],
    }
    expect(summarizeFilter(filter)).toBe('AGE gte 18 AND AGE lte 65')
  })

  it('truncates to 180 chars with ellipsis when too long', () => {
    const longValues = Array.from({ length: 50 }, (_, i) => `val${i}`)
    const filter = {
      description: '',
      rootJoin: 'all' as const,
      groups: [{
        id: 'g1',
        join: 'any' as const,
        conditions: [{ id: 'c1', variableName: 'Q1', operator: 'in' as const, values: longValues, value: '', secondaryValue: '' }],
      }],
    }
    const result = summarizeFilter(filter)
    expect(result.length).toBeLessThanOrEqual(183)  // 180 + '...'
    expect(result.endsWith('...')).toBe(true)
  })
})
