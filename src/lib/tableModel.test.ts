import { describe, expect, it, vi } from 'vitest'
import {
  cloneTableFilter,
  emptyTableFilter,
  hasActiveFilter,
  newTable,
  toComparableFilter,
} from './tableModel'
import type { TableFilterSpec } from '../types/workspace'

describe('tableModel', () => {
  it('creates a blank table with the default filter shape', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValueOnce('00000000-0000-4000-8000-000000000001')

    expect(newTable(3, 'folder-1')).toEqual({
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Table3',
      rowVar: null,
      colVar: null,
      result: null,
      folderId: 'folder-1',
      filter: emptyTableFilter(),
    })
  })

  it('detects active filters only when a group has conditions', () => {
    expect(hasActiveFilter(null)).toBe(false)
    expect(hasActiveFilter(emptyTableFilter())).toBe(false)
    expect(hasActiveFilter({
      description: '',
      rootJoin: 'all',
      groups: [{ id: 'g1', join: 'all', conditions: [{
        id: 'c1',
        variableName: 'Q1',
        operator: 'in',
        values: ['1'],
        value: '',
        secondaryValue: '',
      }] }],
    })).toBe(true)
  })

  it('deep-clones filter condition values', () => {
    const source: TableFilterSpec = {
      description: 'Demo',
      rootJoin: 'any',
      groups: [{ id: 'g1', join: 'all', conditions: [{
        id: 'c1',
        variableName: 'Q1',
        operator: 'in',
        values: ['1'],
        value: '',
        secondaryValue: '',
      }] }],
    }

    const cloned = cloneTableFilter(source)
    cloned.groups[0].conditions[0].values.push('2')

    expect(source.groups[0].conditions[0].values).toEqual(['1'])
  })

  it('normalizes filters for comparison', () => {
    const comparable = toComparableFilter({
      description: '  Demo  ',
      rootJoin: 'all',
      groups: [
        { id: 'empty', join: 'all', conditions: [] },
        { id: 'g1', join: 'any', conditions: [{
          id: 'c1',
          variableName: 'Q1',
          operator: 'between',
          values: ['1', '2'],
          value: '1',
          secondaryValue: '2',
        }] },
      ],
    })

    expect(comparable).toEqual({
      description: 'Demo',
      rootJoin: 'all',
      groups: [{ join: 'any', conditions: [{
        variableName: 'Q1',
        operator: 'between',
        values: ['1', '2'],
        value: '1',
        secondaryValue: '2',
      }] }],
    })
  })
})
