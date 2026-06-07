import { describe, expect, it } from 'vitest'
import { buildFilterRuntime, filterCasesForSpec } from './filterRuntime'
import type { VariableCatalog } from './variableGrouping'
import type { TableFilterSpec } from '../types/workspace'

function catalog(): VariableCatalog {
  return {
    list: [],
    byName: new Map([
      ['Q1', { name: 'Q1', label: 'Q1', longName: 'Q1', isString: false, valueLabels: { '1': 'Yes', '2': 'No' } }],
    ]),
    groupedByName: new Map(),
  }
}

describe('filterRuntime', () => {
  it('maps labeled SPSS values back to codes for filter matching', () => {
    const runtime = buildFilterRuntime(catalog())
    expect(runtime.getValueKeys('Q1', { Q1: 'Yes' })).toEqual(['1'])
  })

  it('filters cases with the same runtime used by run/export flows', () => {
    const filter: TableFilterSpec = {
      description: '',
      rootJoin: 'all',
      groups: [{
        id: 'g1',
        join: 'all',
        conditions: [{
          id: 'c1',
          variableName: 'Q1',
          operator: 'in',
          values: ['1'],
          value: '',
          secondaryValue: '',
        }],
      }],
    }

    expect(filterCasesForSpec([{ Q1: 'Yes' }, { Q1: 'No' }], filter, catalog())).toEqual([{ Q1: 'Yes' }])
  })
})
