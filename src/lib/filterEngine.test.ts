import { describe, expect, it } from 'vitest'
import { evaluateFilterCondition, evaluateFilterGroup, evaluateFilterSpec } from './filterEngine'
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

function cond(operator: string, values: string[] = [], value = '', secondaryValue = '') {
  return { id: 'c', variableName: 'x', operator: operator as never, values, value, secondaryValue }
}

// ─── evaluateFilterCondition ──────────────────────────────────────────────────

describe('evaluateFilterCondition', () => {
  describe('in / not_in', () => {
    it('in: matches when value is in set', () => {
      expect(evaluateFilterCondition(cond('in', ['A', 'B']), { x: 'A' }, {}, runtime)).toBe(true)
    })
    it('in: fails when value not in set', () => {
      expect(evaluateFilterCondition(cond('in', ['A', 'B']), { x: 'C' }, {}, runtime)).toBe(false)
    })
    it('not_in: passes when value not in set', () => {
      expect(evaluateFilterCondition(cond('not_in', ['A']), { x: 'B' }, {}, runtime)).toBe(true)
    })
    it('not_in: fails when value is in set', () => {
      expect(evaluateFilterCondition(cond('not_in', ['A']), { x: 'A' }, {}, runtime)).toBe(false)
    })
    it('in: incomplete (empty values) → passes', () => {
      expect(evaluateFilterCondition(cond('in', []), { x: 'A' }, {}, runtime)).toBe(true)
    })
  })

  describe('is_blank / not_blank', () => {
    it('is_blank: passes when variable is empty', () => {
      expect(evaluateFilterCondition(cond('is_blank'), { x: '' }, {}, runtime)).toBe(true)
    })
    it('is_blank: fails when variable has value', () => {
      expect(evaluateFilterCondition(cond('is_blank'), { x: 'hello' }, {}, runtime)).toBe(false)
    })
    it('not_blank: passes when variable has value', () => {
      expect(evaluateFilterCondition(cond('not_blank'), { x: 'hello' }, {}, runtime)).toBe(true)
    })
    it('not_blank: fails when variable is empty', () => {
      expect(evaluateFilterCondition(cond('not_blank'), { x: '' }, {}, runtime)).toBe(false)
    })
  })

  describe('contains / not_contains', () => {
    it('contains: case-insensitive substring match', () => {
      expect(evaluateFilterCondition(cond('contains', [], 'HELLO'), { x: 'say hello world' }, {}, runtime)).toBe(true)
    })
    it('contains: fails when substring not found', () => {
      expect(evaluateFilterCondition(cond('contains', [], 'xyz'), { x: 'hello' }, {}, runtime)).toBe(false)
    })
    it('not_contains: passes when substring not found', () => {
      expect(evaluateFilterCondition(cond('not_contains', [], 'xyz'), { x: 'hello' }, {}, runtime)).toBe(true)
    })
    it('not_contains: fails when substring found', () => {
      expect(evaluateFilterCondition(cond('not_contains', [], 'hello'), { x: 'say hello' }, {}, runtime)).toBe(false)
    })
    it('contains: incomplete (empty value) → passes', () => {
      expect(evaluateFilterCondition(cond('contains', [], ''), { x: 'anything' }, {}, runtime)).toBe(true)
    })
  })

  describe('numeric comparisons', () => {
    it('gt: passes when value > threshold', () => {
      expect(evaluateFilterCondition(cond('gt', [], '10'), { x: 15 }, {}, runtime)).toBe(true)
    })
    it('gt: fails when value = threshold', () => {
      expect(evaluateFilterCondition(cond('gt', [], '10'), { x: 10 }, {}, runtime)).toBe(false)
    })
    it('gte: passes when value >= threshold', () => {
      expect(evaluateFilterCondition(cond('gte', [], '10'), { x: 10 }, {}, runtime)).toBe(true)
    })
    it('lt: passes when value < threshold', () => {
      expect(evaluateFilterCondition(cond('lt', [], '10'), { x: 5 }, {}, runtime)).toBe(true)
    })
    it('lt: fails when value = threshold', () => {
      expect(evaluateFilterCondition(cond('lt', [], '10'), { x: 10 }, {}, runtime)).toBe(false)
    })
    it('lte: passes when value <= threshold', () => {
      expect(evaluateFilterCondition(cond('lte', [], '10'), { x: 10 }, {}, runtime)).toBe(true)
    })
    it('between: passes when value in range (inclusive)', () => {
      expect(evaluateFilterCondition(cond('between', [], '5', '10'), { x: 7 }, {}, runtime)).toBe(true)
    })
    it('between: passes at boundary values', () => {
      expect(evaluateFilterCondition(cond('between', [], '5', '10'), { x: 5 }, {}, runtime)).toBe(true)
      expect(evaluateFilterCondition(cond('between', [], '5', '10'), { x: 10 }, {}, runtime)).toBe(true)
    })
    it('between: normalizes reversed range (max < min)', () => {
      // value='10', secondary='5' → treats as [5,10]
      expect(evaluateFilterCondition(cond('between', [], '10', '5'), { x: 7 }, {}, runtime)).toBe(true)
    })
    it('between: fails when value outside range', () => {
      expect(evaluateFilterCondition(cond('between', [], '5', '10'), { x: 11 }, {}, runtime)).toBe(false)
    })
    it('numeric: returns false when value is not numeric', () => {
      expect(evaluateFilterCondition(cond('gt', [], '5'), { x: 'abc' }, {}, runtime)).toBe(false)
    })
    it('gt: incomplete (empty value) → passes', () => {
      expect(evaluateFilterCondition(cond('gt', [], ''), { x: 5 }, {}, runtime)).toBe(true)
    })
    it('gt: non-numeric threshold → false (does not pass all records)', () => {
      expect(evaluateFilterCondition(cond('gt', [], 'abc'), { x: 5 }, {}, runtime)).toBe(false)
    })
    it('gte: non-numeric threshold → false', () => {
      expect(evaluateFilterCondition(cond('gte', [], 'xyz'), { x: 5 }, {}, runtime)).toBe(false)
    })
    it('lt: non-numeric threshold → false', () => {
      expect(evaluateFilterCondition(cond('lt', [], 'abc'), { x: 5 }, {}, runtime)).toBe(false)
    })
    it('lte: non-numeric threshold → false', () => {
      expect(evaluateFilterCondition(cond('lte', [], 'xyz'), { x: 5 }, {}, runtime)).toBe(false)
    })
    it('between: non-numeric primary threshold → false', () => {
      expect(evaluateFilterCondition(cond('between', [], 'abc', '10'), { x: 5 }, {}, runtime)).toBe(false)
    })
    it('between: non-numeric secondary threshold → false', () => {
      expect(evaluateFilterCondition(cond('between', [], '5', 'xyz'), { x: 7 }, {}, runtime)).toBe(false)
    })
  })
})

// ─── evaluateFilterGroup ──────────────────────────────────────────────────────

describe('evaluateFilterGroup', () => {
  it('empty group → passes', () => {
    expect(evaluateFilterGroup({ id: 'g', join: 'all', conditions: [] }, {}, {}, runtime)).toBe(true)
  })

  it('join=all: all conditions must pass', () => {
    const group = {
      id: 'g', join: 'all' as const, conditions: [
        cond('in', ['A']),
        { ...cond('gt', [], '5'), variableName: 'y' },
      ],
    }
    expect(evaluateFilterGroup(group, { x: 'A', y: 10 }, {}, runtime)).toBe(true)
    expect(evaluateFilterGroup(group, { x: 'A', y: 3 }, {}, runtime)).toBe(false)
  })

  it('join=any: at least one condition must pass', () => {
    const group = {
      id: 'g', join: 'any' as const, conditions: [
        cond('in', ['A']),
        { ...cond('gt', [], '5'), variableName: 'y' },
      ],
    }
    expect(evaluateFilterGroup(group, { x: 'B', y: 10 }, {}, runtime)).toBe(true)
    expect(evaluateFilterGroup(group, { x: 'B', y: 3 }, {}, runtime)).toBe(false)
  })
})

// ─── evaluateFilterSpec ───────────────────────────────────────────────────────

describe('evaluateFilterSpec', () => {
  it('null spec → passes', () => {
    expect(evaluateFilterSpec(null, { x: 1 }, {}, runtime)).toBe(true)
  })
  it('empty groups → passes', () => {
    expect(evaluateFilterSpec({ description: '', rootJoin: 'all', groups: [] }, {}, {}, runtime)).toBe(true)
  })

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

  it('rootJoin=all: all groups must pass', () => {
    const spec: TableFilterSpec = {
      description: '', rootJoin: 'all',
      groups: [
        { id: 'g1', join: 'all', conditions: [cond('in', ['A'])] },
        { id: 'g2', join: 'all', conditions: [{ ...cond('gt', [], '5'), variableName: 'y' }] },
      ],
    }
    expect(evaluateFilterSpec(spec, { x: 'A', y: 10 }, {}, runtime)).toBe(true)
    expect(evaluateFilterSpec(spec, { x: 'A', y: 3 }, {}, runtime)).toBe(false)
  })
})
