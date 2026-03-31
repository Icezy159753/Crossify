import { describe, expect, it } from 'vitest'
import { evaluateFilterSpec } from './filterEngine'
import type { TableFilterSpec } from '../types/workspace'

const runtime = {
  getValueKeys: (variableName: string, rawCase: Record<string, string | number>) => {
    const value = rawCase[variableName]
    return value == null || value === '' ? [] : [String(value)]
  },
  getTextValue: (variableName: string, rawCase: Record<string, string | number>) => String(rawCase[variableName] ?? ''),
  getNumericValue: (variableName: string, rawCase: Record<string, string | number>) => {
    const value = Number(rawCase[variableName])
    return Number.isFinite(value) ? value : null
  },
}

describe('filterEngine', () => {
  it('supports grouped all/any logic across filter groups', () => {
    const spec: TableFilterSpec = {
      description: 'complex',
      rootJoin: 'any',
      groups: [
        {
          id: 'g1',
          join: 'all',
          conditions: [
            { id: 'c1', variableName: 'gender', operator: 'in', values: ['Male'], value: '', secondaryValue: '' },
            { id: 'c2', variableName: 'region', operator: 'in', values: ['BKK'], value: '', secondaryValue: '' },
          ],
        },
        {
          id: 'g2',
          join: 'all',
          conditions: [
            { id: 'c3', variableName: 'age', operator: 'between', values: [], value: '18', secondaryValue: '24' },
          ],
        },
      ],
    }

    expect(evaluateFilterSpec(spec, { gender: 'Male', region: 'BKK', age: 40 }, {}, runtime)).toBe(true)
    expect(evaluateFilterSpec(spec, { gender: 'Female', region: 'UPC', age: 22 }, {}, runtime)).toBe(true)
    expect(evaluateFilterSpec(spec, { gender: 'Female', region: 'UPC', age: 35 }, {}, runtime)).toBe(false)
  })

  it('ignores incomplete conditions until the user finishes configuring them', () => {
    const spec: TableFilterSpec = {
      description: '',
      rootJoin: 'all',
      groups: [
        {
          id: 'g1',
          join: 'all',
          conditions: [
            { id: 'c1', variableName: 'score', operator: 'between', values: [], value: '', secondaryValue: '' },
          ],
        },
      ],
    }

    expect(evaluateFilterSpec(spec, { score: 99 }, {}, runtime)).toBe(true)
  })
})
