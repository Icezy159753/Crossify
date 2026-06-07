import { describe, expect, it } from 'vitest'

import type { SavDataset, SpssVariable } from './savParser'
import { emptyTableFilter, newTable } from './tableModel'
import { buildVariableCatalog } from './variableGrouping'
import {
  buildActiveConfig,
  canRunTable,
  getActiveHideTotal,
  getActiveTable,
  getCodeEditorRows,
  getEditingTableIds,
  getEditingTables,
  getEditingVariableBase,
  getFilterMismatchTableNames,
  getFilterSummary,
  getFirstSelectedVariableIndex,
  getLastSelectedVariableRowIndex,
  hasSelectedRowsInGroups,
} from './appDerivedState'
import type { TableDef } from '../types/workspace'

function variable(name: string, valueLabels: Record<string, string> = {}, label = name): SpssVariable {
  return {
    name,
    longName: name,
    label,
    valueLabels,
    isString: false,
    stringLength: 0,
    slotCount: 1,
    dictIndex: 0,
  }
}

function table(id: string, rowVar: string | null = null, colVar: string | null = null): TableDef {
  return {
    ...newTable(1),
    id,
    name: id,
    rowVar,
    colVar,
    filter: emptyTableFilter(),
  }
}

function dataset(): SavDataset {
  return {
    variables: [
      variable('Q1', { '1': 'Low', '2': 'High' }),
      variable('AREA', { '1': 'Bangkok', '2': 'North' }),
    ],
    cases: [
      { Q1: '1', AREA: '1' },
      { Q1: '2', AREA: '1' },
      { Q1: '', AREA: '2' },
    ],
    fileName: 'derived.sav',
    fileSize: 1,
    encoding: 'utf-8',
  }
}

describe('appDerivedState', () => {
  it('derives active/editing table state and filter mismatch names', () => {
    const tables = [table('A'), table('B'), table('C')]
    tables[1].filter.description = 'different'

    const active = getActiveTable(tables, 'A')
    const editingIds = getEditingTableIds('A', new Set(['B', 'A']))
    const editingTables = getEditingTables(tables, editingIds)

    expect(active?.id).toBe('A')
    expect(editingIds).toEqual(['A', 'B'])
    expect(editingTables.map(item => item.id)).toEqual(['A', 'B'])
    expect(getFilterMismatchTableNames(active, editingTables)).toEqual(['B'])
  })

  it('derives variable editor base from data and override order', () => {
    const ds = dataset()
    const catalog = buildVariableCatalog(ds.variables, [], ds.cases)

    expect(getEditingVariableBase('Q1', catalog, ds, {})).toBe(2)
    expect(getEditingVariableBase('Q1', catalog, ds, { Q1: { order: ['2'], weights: {} } })).toBe(1)
    expect(getEditingVariableBase(null, catalog, ds, {})).toBe(0)
  })

  it('derives variable row selection helpers', () => {
    const rows = [
      { key: '1', code: '1', label: 'One', count: 1, percent: 50, factor: '', rowKind: 'code' as const },
      { key: 'net', code: 'NET', label: 'Net', count: 2, percent: 100, factor: '', rowKind: 'net' as const },
      { key: '2', code: '2', label: 'Two', count: 1, percent: 50, factor: '', rowKind: 'code' as const },
    ]
    const codeRows = getCodeEditorRows(rows)

    expect(codeRows.map(row => row.key)).toEqual(['1', '2'])
    expect(getFirstSelectedVariableIndex(['2'], codeRows)).toBe(1)
    expect(getLastSelectedVariableRowIndex(['1', '2'], codeRows)).toBe(1)
    expect(hasSelectedRowsInGroups(['2'], [{ id: 'net-1', name: 'Net', members: ['2'] }])).toBe(true)
  })

  it('derives runnable and hide-total config state', () => {
    const ds = dataset()
    ds.variables.push({
      ...variable('GRID_TOP'),
      isGridUserCreated: true,
      hideTotal: true,
    } as SpssVariable & { isGridUserCreated: boolean; hideTotal: boolean })

    expect(canRunTable(table('A'))).toBe(false)
    expect(canRunTable(table('A', 'Q1', null))).toBe(true)
    expect(getActiveHideTotal(ds, table('G', 'GRID_TOP'), null, new Set())).toBe(true)
    expect(getActiveHideTotal(ds, table('G', 'Q1'), null, new Set(['Q1']))).toBe(true)
    expect(buildActiveConfig({
      showCount: true,
      showPercent: true,
      percentType: 'column',
      hideZeroRows: false,
    }, true)).toMatchObject({ hideTotal: true })
  })

  it('summarizes active filters for table rows', () => {
    const filtered = table('A')
    filtered.filter.groups.push({
      id: 'g1',
      join: 'all',
      conditions: [
        { id: 'c1', variableName: 'Q1', operator: 'in', values: ['1'], value: '', secondaryValue: '' },
        { id: 'c2', variableName: 'AREA', operator: 'in', values: ['2'], value: '', secondaryValue: '' },
      ],
    })

    expect(getFilterSummary(table('Empty'))).toBeNull()
    expect(getFilterSummary(filtered)).toBe('2 conditions')

    filtered.filter.description = 'Main sample only'
    expect(getFilterSummary(filtered)).toBe('Main sample only')
  })
})
