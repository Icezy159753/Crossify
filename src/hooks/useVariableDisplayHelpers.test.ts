/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { SpssVariable } from '../lib/savParser'
import { buildVariableCatalog } from '../lib/variableGrouping'
import { useVariableDisplayHelpers } from './useVariableDisplayHelpers'

function variable(partial: Partial<SpssVariable> & Pick<SpssVariable, 'name'>): SpssVariable {
  return {
    longName: partial.name,
    label: partial.name,
    valueLabels: {},
    isString: false,
    stringLength: 0,
    slotCount: 1,
    dictIndex: 0,
    ...partial,
  }
}

describe('useVariableDisplayHelpers', () => {
  it('returns labels, tones, and numeric status by variable kind', () => {
    const catalog = buildVariableCatalog([
      variable({ name: 'AREA', label: 'Area Label', valueLabels: { '1': 'North' } }),
      variable({ name: 'OPEN', isString: true }),
      variable({ name: 'AGE' }),
    ])
    const { result } = renderHook(() => useVariableDisplayHelpers(catalog))

    expect(result.current.getVarLabel('AREA')).toBe('Area Label')
    expect(result.current.getVarLabel('MISSING')).toBe('MISSING')
    expect(result.current.getVarTone('AREA').badge).toBe('SA')
    expect(result.current.getVarTone('OPEN').badge).toBe('A')
    expect(result.current.getVarTone('AGE').badge).toBe('#')
    expect(result.current.isNumericVariable('AGE')).toBe(true)
    expect(result.current.isNumericVariable('AREA')).toBe(false)
  })

  it('builds filter field metadata by variable kind', () => {
    const catalog = buildVariableCatalog([
      variable({ name: 'AREA', valueLabels: { '1': 'North', '2': 'South' } }),
      variable({ name: 'OPEN', isString: true }),
      variable({ name: 'AGE' }),
    ])
    const { result } = renderHook(() => useVariableDisplayHelpers(catalog))

    expect(result.current.getFilterFieldMeta('AREA')).toMatchObject({
      kind: 'options',
      options: [
        { key: '1', label: '1. North' },
        { key: '2', label: '2. South' },
      ],
      operators: ['in', 'not_in'],
    })
    expect(result.current.getFilterFieldMeta('OPEN')).toMatchObject({
      kind: 'text',
      operators: ['contains', 'not_contains', 'is_blank', 'not_blank'],
    })
    expect(result.current.getFilterFieldMeta('AGE')).toMatchObject({
      kind: 'numeric',
      operators: ['gt', 'gte', 'lt', 'lte', 'between', 'is_blank', 'not_blank'],
    })
  })
})
