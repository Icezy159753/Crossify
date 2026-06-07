/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import type { SavDataset } from '../lib/savParser'
import { emptyTableFilter, newTable } from '../lib/tableModel'
import { buildVariableCatalog } from '../lib/variableGrouping'
import type { TableDef } from '../types/workspace'
import {
  useFilteredCasesBridge,
  useGridHideTotalBridge,
} from './appRuntimeBridges'

function createDataset(): SavDataset {
  return {
    fileName: 'fixture.sav',
    fileSize: 1,
    encoding: 'windows-874',
    variables: [
      {
        name: 'AREA',
        longName: 'AREA',
        label: 'Area',
        valueLabels: { '1': 'North', '2': 'South' },
        isString: false,
        stringLength: 0,
        slotCount: 1,
        dictIndex: 0,
      },
    ],
    cases: [
      { AREA: 1 },
      { AREA: 2 },
      { AREA: 1 },
    ],
  }
}

function createFilteredTable(id = 'table-1'): TableDef {
  return {
    ...newTable(1),
    id,
    filter: {
      ...emptyTableFilter(),
      groups: [{
        id: 'group-1',
        join: 'all',
        conditions: [{
          id: 'condition-1',
          variableName: 'AREA',
          operator: 'in',
          values: ['1'],
          value: '',
          secondaryValue: '',
        }],
      }],
    },
  }
}

describe('useAppRuntimeBridges', () => {
  afterEach(() => {
    delete window.__cxSetGridHideTotal
    window.__cxGetFilteredCases = null
  })

  it('exposes and cleans up grid hide-total bridge', () => {
    const values: Set<string>[] = []
    const { unmount } = renderHook(() => {
      const [, setGridHideTotalVars] = useState<Set<string>>(new Set())
      useGridHideTotalBridge(next => {
        setGridHideTotalVars(prev => {
          const resolved = typeof next === 'function' ? next(prev) : next
          values.push(new Set(resolved))
          return resolved
        })
      })
    })

    act(() => {
      window.__cxSetGridHideTotal?.(['GRID_A', 'GRID_B'], true)
    })
    expect([...values.at(-1)!]).toEqual(['GRID_A', 'GRID_B'])

    act(() => {
      window.__cxSetGridHideTotal?.(['GRID_A'], false)
    })
    expect([...values.at(-1)!]).toEqual(['GRID_B'])

    unmount()
    expect(window.__cxSetGridHideTotal).toBeUndefined()
  })

  it('returns filtered cases for active table filters only', () => {
    const dataset = createDataset()
    const variableCatalog = buildVariableCatalog(dataset.variables, [], dataset.cases)
    const table = createFilteredTable()

    const { rerender } = renderHook(
      ({ tables }) => useFilteredCasesBridge({ dataset, variableCatalog, tables }),
      { initialProps: { tables: [table] } },
    )

    expect(window.__cxGetFilteredCases?.('table-1')).toEqual([
      { AREA: 1 },
      { AREA: 1 },
    ])
    expect(window.__cxGetFilteredCases?.('missing')).toBeNull()

    rerender({ tables: [{ ...table, filter: emptyTableFilter() }] })
    expect(window.__cxGetFilteredCases?.('table-1')).toBeNull()
  })

  it('clears filtered-cases bridge while dataset or catalog is unavailable', () => {
    renderHook(() => useFilteredCasesBridge({
      dataset: null,
      variableCatalog: null,
      tables: [createFilteredTable()],
    }))

    expect(window.__cxGetFilteredCases).toBeNull()
  })
})
