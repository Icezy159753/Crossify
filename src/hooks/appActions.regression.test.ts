/**
 * Regression coverage for the extracted app action hooks.
 *
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRef, useState } from 'react'
import { joinAxisSpec, parseAxisSpec } from '../lib/appStateUtils'
import { buildVariableCatalog } from '../lib/variableGrouping'
import { emptyTableFilter, newTable } from '../lib/tableModel'
import type { SavDataset, SpssVariable } from '../lib/savParser'
import type { FolderDef, GlobalSettings, TableDef, TableFilterSpec } from '../types/workspace'
import type { NumericStat, VariableOverride } from '../types/variableOverride'
import type { ScaleSummaryPresetType, VariableEditorRow, VariableNetGroup } from '../lib/variableEditorUtils'
import { useBatchExportActions } from './useBatchExportActions'
import { useFilterActions } from './useFilterActions'
import { useFolderActions } from './useFolderActions'
import { useTableActions } from './useTableActions'
import { useTableDesignerActions } from './useTableDesignerActions'
import { useTableRunActions } from './useTableRunActions'
import { useVariableEditorActions } from './useVariableEditorActions'
import { useVariableListActions } from './useVariableListActions'

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

function table(name: string, rowVar: string | null = null, colVar: string | null = null): TableDef {
  return {
    ...newTable(1),
    id: name,
    name,
    rowVar,
    colVar,
    result: null,
    folderId: null,
    filter: emptyTableFilter(),
  }
}

function dataset(): SavDataset {
  return {
    variables: [
      variable('Q1', { '1': 'Low', '2': 'Mid', '3': 'High' }, 'Question 1'),
      variable('Q2', { '1': 'Low', '2': 'Mid', '3': 'High' }, 'Question 2'),
      variable('AREA', { '1': 'Bangkok', '2': 'North' }, 'Area'),
    ],
    cases: [
      { Q1: '1', Q2: '1', AREA: '1' },
      { Q1: '2', Q2: '2', AREA: '1' },
      { Q1: '3', Q2: '3', AREA: '2' },
      { Q1: '3', Q2: '2', AREA: '2' },
    ],
    fileName: 'mini.sav',
    fileSize: 123,
    encoding: 'utf-8',
  }
}

function fileList(files: File[]): FileList {
  return Object.assign(files, {
    item(index: number) {
      return files[index] ?? null
    },
  }) as unknown as FileList
}

describe('app action hooks regression', () => {
  it('covers table add/create/select/copy/paste/delete/reorder/folder assignment actions', () => {
    const pushHistory = vi.fn()
    const { result } = renderHook(() => {
      const [tables, setTables] = useState<TableDef[]>([table('A'), table('B'), table('C')])
      const [activeTableId, setActiveTableId] = useState('A')
      const [selectedIds, setSelectedIds] = useState(new Set<string>())
      const [lastSelectedTableId, setLastSelectedTableId] = useState<string | null>('A')
      const [tableContextMenu, setTableContextMenu] = useState<{ x: number; y: number; targetId: string } | null>(null)
      const actions = useTableActions({
        tables,
        setTables,
        activeTableId,
        setActiveTableId,
        selectedIds,
        setSelectedIds,
        lastSelectedTableId,
        setLastSelectedTableId,
        setTableContextMenu,
        variableCatalog: { list: [{ name: 'Q1' }, { name: 'Q2' }, { name: 'AREA' }] },
        pushHistory,
      })
      return { tables, activeTableId, selectedIds, lastSelectedTableId, tableContextMenu, ...actions }
    })

    act(() => result.current.addTable('folder-1'))
    expect(result.current.tables.at(-1)?.folderId).toBe('folder-1')
    expect(result.current.activeTableId).toBe(result.current.tables.at(-1)?.id)

    act(() => result.current.createTablesFromVariables(['AREA', 'Q1'], 'folder-2'))
    expect(result.current.tables.slice(-2).map(item => item.name)).toEqual(['Q1', 'AREA'])
    expect(result.current.tables.slice(-2).map(item => item.rowVar)).toEqual(['Q1', 'AREA'])
    expect(result.current.tables.slice(-2).every(item => item.folderId === 'folder-2')).toBe(true)

    act(() => result.current.handleTableClick('A'))
    act(() => result.current.handleTableClick('B', { shiftKey: true }))
    expect([...result.current.selectedIds].sort()).toEqual(['A', 'B'])

    act(() => result.current.handleTableToggleSelect('C', { ctrlKey: true }))
    expect(result.current.selectedIds.has('C')).toBe(true)

    act(() => result.current.handleTableCopy('B'))
    act(() => result.current.handleTablePasteAfter('B'))
    expect(result.current.tables.map(item => item.name)).toContain('B')
    expect(result.current.tables.filter(item => item.name === 'B').length).toBeGreaterThanOrEqual(2)

    act(() => result.current.handleTableDuplicate('A'))
    expect(result.current.tables.some(item => item.name === 'A Copy')).toBe(true)

    act(() => result.current.handleTableDragStart('C'))
    act(() => result.current.handleTableDropToRow('A'))
    expect(result.current.tables[0].id).toBe('C')

    act(() => result.current.handleMoveTableToFolder('C', 'moved-folder'))
    expect(result.current.tables.find(item => item.id === 'C')?.folderId).toBe('moved-folder')

    act(() => result.current.handleTableRename('C', 'Renamed C'))
    expect(result.current.tables.find(item => item.id === 'C')?.name).toBe('Renamed C')

    act(() => result.current.handleTableDelete('C'))
    expect(result.current.tables.some(item => item.id === 'C')).toBe(false)
    expect(pushHistory).toHaveBeenCalled()
  })

  it('covers Top/Side designer drops, nesting, reordering, moves, removal, and clearing', () => {
    const pushHistory = vi.fn()
    const { result } = renderHook(() => {
      const [tables, setTables] = useState<TableDef[]>([table('T', 'Q1', 'AREA')])
      const dragVarsRef = useRef<string[]>(['Q2'])
      const activeTableId = 'T'
      const actions = useTableDesignerActions({
        activeTableId,
        activeTableExists: true,
        setTables,
        dragVarsRef,
        pushHistory,
      })
      return { tables, dragVarsRef, ...actions }
    })

    act(() => result.current.handleDropTop('add', {}))
    expect(result.current.tables[0].colVar).toBe(joinAxisSpec([['AREA'], ['Q2']]))

    act(() => {
      result.current.dragVarsRef.current = ['Q1']
      result.current.handleDropTop('nest', { targetVar: 'AREA' })
    })
    expect(result.current.tables[0].colVar).toBe(joinAxisSpec([['AREA', 'Q1'], ['Q2']]))

    act(() => result.current.handleReorderTop({ branchIndex: 1, itemIndex: 0 }, { branchIndex: 0, itemIndex: 0, placement: 'before' }))
    expect(parseAxisSpec(result.current.tables[0].colVar)).toEqual([['Q2', 'AREA', 'Q1']])

    act(() => result.current.handleMoveTopDown('Q2'))
    expect(parseAxisSpec(result.current.tables[0].colVar)).toEqual([['AREA', 'Q2', 'Q1']])

    act(() => result.current.handleRemoveTop('Q1', { branchIndex: 0, itemIndex: 2 }))
    expect(parseAxisSpec(result.current.tables[0].colVar)).toEqual([['AREA', 'Q2']])

    act(() => {
      result.current.dragVarsRef.current = ['AREA', 'Q2']
      result.current.handleDropSide('add', {})
    })
    expect(result.current.tables[0].rowVar).toBe(joinAxisSpec([['Q1'], ['AREA'], ['Q2']]))

    act(() => result.current.handleMoveSideUp('Q2'))
    expect(result.current.tables[0].rowVar).toBe(joinAxisSpec([['Q1'], ['Q2'], ['AREA']]))

    act(() => result.current.handleRemoveSide('AREA', { branchIndex: 2, itemIndex: 0 }))
    expect(result.current.tables[0].rowVar).toBe(joinAxisSpec([['Q1'], ['Q2']]))

    act(() => result.current.handleClearTop())
    act(() => result.current.handleClearSide())
    expect(result.current.tables[0].colVar).toBeNull()
    expect(result.current.tables[0].rowVar).toBeNull()
    expect(pushHistory).toHaveBeenCalled()
  })

  it('covers filter editing across active and selected tables', () => {
    const pushHistory = vi.fn()
    const { result } = renderHook(() => {
      const [tables, setTables] = useState<TableDef[]>([table('A'), table('B'), table('C')])
      const dragVarsRef = useRef<string[]>(['Q1'])
      const actions = useFilterActions({
        activeTableId: 'A',
        selectedIds: new Set(['B']),
        setTables,
        dragVarsRef,
        pushHistory,
      })
      return { tables, dragVarsRef, ...actions }
    })

    act(() => result.current.handleUpdateFilterDescription('Adults only'))
    expect(result.current.tables.find(item => item.id === 'A')?.filter.description).toBe('Adults only')
    expect(result.current.tables.find(item => item.id === 'B')?.filter.description).toBe('Adults only')
    expect(result.current.tables.find(item => item.id === 'C')?.filter.description).toBe('')

    act(() => result.current.handleUpdateRootJoin('any'))
    expect(result.current.tables.find(item => item.id === 'A')?.filter.rootJoin).toBe('any')

    act(() => result.current.handleDropFilterVariable(null))
    const groupId = result.current.tables.find(item => item.id === 'A')!.filter.groups[0].id
    const conditionId = result.current.tables.find(item => item.id === 'A')!.filter.groups[0].conditions[0].id
    expect(result.current.tables.find(item => item.id === 'B')!.filter.groups[0].conditions[0].variableName).toBe('Q1')

    act(() => result.current.handleUpdateGroupJoin(groupId, 'any'))
    expect(result.current.tables.find(item => item.id === 'A')!.filter.groups[0].join).toBe('any')

    act(() => result.current.handleUpdateCondition(groupId, conditionId, { operator: 'in', values: ['1', '2'] }))
    expect(result.current.tables.find(item => item.id === 'A')!.filter.groups[0].conditions[0].values).toEqual(['1', '2'])

    act(() => {
      result.current.dragVarsRef.current = ['AREA']
      result.current.handleDropFilterVariable(groupId)
    })
    expect(result.current.tables.find(item => item.id === 'A')!.filter.groups[0].conditions.map(item => item.variableName)).toEqual(['Q1', 'AREA'])

    act(() => result.current.handleRemoveCondition(groupId, conditionId))
    expect(result.current.tables.find(item => item.id === 'A')!.filter.groups[0].conditions.map(item => item.variableName)).toEqual(['AREA'])

    act(() => result.current.handleRemoveGroup(groupId))
    expect(result.current.tables.find(item => item.id === 'A')!.filter.groups).toEqual([])

    act(() => result.current.handleClearFilter())
    expect(result.current.tables.find(item => item.id === 'A')!.filter).toEqual(emptyTableFilter())
    expect(pushHistory).toHaveBeenCalled()
  })

  it('covers variable-list selection, drag, and quick actions for Top/Side/Filter/Table', () => {
    const createTablesFromVariables = vi.fn()
    const applyFilterToEditingTables = vi.fn((mutate: (filter: TableFilterSpec) => TableFilterSpec) => {
      mutate(emptyTableFilter())
    })
    const { result } = renderHook(() => {
      const [tables, setTables] = useState<TableDef[]>([table('A')])
      const [selectedVariableNames, setSelectedVariableNames] = useState(new Set<string>())
      const [lastSelectedVariableName, setLastSelectedVariableName] = useState<string | null>(null)
      const dragVarsRef = useRef<string[]>([])
      const actions = useVariableListActions({
        variableCatalog: { list: [{ name: 'Q1' }, { name: 'Q2' }, { name: 'AREA' }] },
        selectedVariableNames,
        setSelectedVariableNames,
        lastSelectedVariableName,
        setLastSelectedVariableName,
        dragVarsRef,
        activeTableId: 'A',
        setTables,
        createTablesFromVariables,
        applyFilterToEditingTables,
      })
      return { tables, selectedVariableNames, lastSelectedVariableName, dragVarsRef, ...actions }
    })

    act(() => result.current.handleVarSelect('Q1'))
    act(() => result.current.handleVarSelect('AREA', { shiftKey: true }))
    expect([...result.current.selectedVariableNames]).toEqual(['Q1', 'Q2', 'AREA'])

    act(() => result.current.handleVarDragStart('Q2'))
    expect(result.current.dragVarsRef.current).toEqual(['Q1', 'Q2', 'AREA'])

    act(() => result.current.handleVarQuickAction('Q2', 'top'))
    expect(result.current.tables[0].colVar).toBe(joinAxisSpec([['Q1'], ['Q2'], ['AREA']]))

    act(() => result.current.handleVarQuickAction('Q2', 'side'))
    expect(result.current.tables[0].rowVar).toBe(joinAxisSpec([['Q1'], ['Q2'], ['AREA']]))

    act(() => result.current.handleVarQuickAction('Q2', 'filter'))
    expect(applyFilterToEditingTables).toHaveBeenCalled()

    act(() => result.current.handleVarQuickAction('Q2', 'table'))
    expect([...createTablesFromVariables.mock.calls.at(-1)![0]]).toEqual(['Q1', 'Q2', 'AREA'])

    act(() => result.current.handleVarClearSelection())
    expect(result.current.selectedVariableNames.size).toBe(0)
    expect(result.current.lastSelectedVariableName).toBeNull()
  })

  it('covers folder actions and clears table folder links on delete', () => {
    const pushHistory = vi.fn()
    const { result } = renderHook(() => {
      const [folders, setFolders] = useState<FolderDef[]>([{ id: 'f1', name: 'One', expanded: true }])
      const [tables, setTables] = useState<TableDef[]>([{ ...table('A'), folderId: 'f1' }, table('B')])
      const actions = useFolderActions({ setFolders, setTables, pushHistory })
      return { folders, tables, ...actions }
    })

    act(() => result.current.addFolder())
    expect(result.current.folders.at(-1)?.name).toBe('New Folder')

    act(() => result.current.renameFolder('f1', 'Renamed'))
    expect(result.current.folders.find(folder => folder.id === 'f1')?.name).toBe('Renamed')

    act(() => result.current.toggleFolderExpanded('f1'))
    expect(result.current.folders.find(folder => folder.id === 'f1')?.expanded).toBe(false)

    act(() => result.current.deleteFolder('f1'))
    expect(result.current.folders.some(folder => folder.id === 'f1')).toBe(false)
    expect(result.current.tables.find(item => item.id === 'A')?.folderId).toBeNull()
    expect(pushHistory).toHaveBeenCalled()
  })

  it('covers variable editor open/save, row selection, Net, T2B preset, and apply-to-many actions', () => {
    const ds = dataset()
    const catalog = buildVariableCatalog(ds.variables, [], ds.cases)
    const { result } = renderHook(() => {
      const [variableOverrides, setVariableOverrides] = useState<Record<string, VariableOverride>>({})
      const [editingVariableName, setEditingVariableName] = useState<string | null>(null)
      const [variableEditorRows, setVariableEditorRows] = useState<VariableEditorRow[]>([])
      const [selectedVariableRowKeys, setSelectedVariableRowKeys] = useState<string[]>([])
      const [lastSelectedVariableIndex, setLastSelectedVariableIndex] = useState<number | null>(null)
      const [variableGroups, setVariableGroups] = useState<VariableNetGroup[]>([])
      const [selectedNumericStats, setSelectedNumericStats] = useState<NumericStat[]>(['mean'])
      const [selectedScalePreset, setSelectedScalePreset] = useState<ScaleSummaryPresetType | null>(null)
      const [codeSortDirection, setCodeSortDirection] = useState<'asc' | 'desc'>('asc')
      const [applyVarSearch, setApplyVarSearch] = useState('')
      const [applyToVarNames, setApplyToVarNames] = useState<string[]>([])
      const [pendingNetName, setPendingNetName] = useState('Top Two')
      const [variableEditorTab, setVariableEditorTab] = useState<'edit' | 'apply'>('edit')
      const [variableContextMenu, setVariableContextMenu] = useState<{ x: number; y: number } | null>(null)
      const [showNetNameDialog, setShowNetNameDialog] = useState(false)
      const [showScalePresetDialog, setShowScalePresetDialog] = useState(false)
      const [error, setError] = useState<string | null>(null)
      const codeEditorRows = variableEditorRows.filter(row => row.rowKind === 'code' || row.rowKind == null)
      const actions = useVariableEditorActions({
        variableCatalog: catalog,
        dataset: ds,
        variableOverrides,
        setVariableOverrides,
        editingVariableName,
        setEditingVariableName,
        variableEditorRows,
        setVariableEditorRows,
        codeEditorRows,
        selectedVariableRowKeys,
        setSelectedVariableRowKeys,
        lastSelectedVariableIndex,
        setLastSelectedVariableIndex,
        variableGroups,
        setVariableGroups,
        selectedNumericStats,
        setSelectedNumericStats,
        selectedScalePreset,
        setSelectedScalePreset,
        codeSortDirection,
        setCodeSortDirection,
        applyVarSearch,
        setApplyVarSearch,
        setApplyToVarNames,
        pendingNetName,
        setPendingNetName,
        setVariableEditorTab,
        setVariableContextMenu,
        setShowNetNameDialog,
        setShowScalePresetDialog,
        setError,
      })
      return {
        variableOverrides,
        editingVariableName,
        variableEditorRows,
        selectedVariableRowKeys,
        variableGroups,
        selectedScalePreset,
        applyToVarNames,
        variableEditorTab,
        variableContextMenu,
        showNetNameDialog,
        showScalePresetDialog,
        error,
        setPendingNetName,
        ...actions,
      }
    })

    act(() => result.current.openVariableEditor('Q1'))
    expect(result.current.editingVariableName).toBe('Q1')
    expect(result.current.variableEditorRows.map(row => row.code)).toEqual(['1', '2', '3'])

    act(() => result.current.handleVariableRowClick('1', false))
    act(() => result.current.handleVariableRowClick('3', true))
    expect(result.current.selectedVariableRowKeys).toEqual(['1', '2', '3'])

    act(() => result.current.createVariableNetGroup())
    expect(result.current.showNetNameDialog).toBe(true)

    act(() => result.current.setPendingNetName('All Scale'))
    act(() => result.current.confirmVariableNetGroup())
    expect(result.current.variableGroups[0].name).toBe('All Scale')
    expect(result.current.variableEditorRows.some(row => row.label === 'Net : All Scale')).toBe(true)

    act(() => result.current.applyScaleSummaryPreset('t2b_high_good'))
    expect(result.current.selectedScalePreset).toBe('t2b_high_good')
    expect(result.current.variableEditorRows.some(row => row.code === 'T2B')).toBe(true)

    act(() => result.current.saveVariableEditor('Q1', result.current.variableEditorRows))
    expect(result.current.variableOverrides.Q1.groups?.[0].name).toBe('All Scale')
    expect(result.current.variableOverrides.Q1.summaries?.some(row => row.code === 'T2B')).toBe(true)

    act(() => result.current.openVariableEditor('Q1'))
    act(() => result.current.saveAndApplyToVars(['Q2']))
    expect(result.current.variableOverrides.Q2.groups?.[0].name).toBe('All Scale')
    expect(result.current.variableOverrides.Q2.summaryPreset).toBe('t2b_high_good')

    act(() => result.current.handleVariableRowClick('1', false))
    act(() => result.current.handleVariableRowClick('3', true))
    act(() => result.current.removeSelectedCodesFromGroups())
    expect(result.current.variableGroups).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('covers running one table and all runnable tables through the extracted run hook', async () => {
    const ds = dataset()
    const catalog = buildVariableCatalog(ds.variables, [], ds.cases)
    const settings: GlobalSettings = {
      showCount: true,
      showPercent: true,
      percentType: 'column',
      hideZeroRows: false,
    }

    const { result } = renderHook(() => {
      const [tables, setTables] = useState<TableDef[]>([
        table('Runnable 1', 'Q1', 'AREA'),
        table('Blank'),
        table('Runnable 2', 'Q2', 'AREA'),
      ])
      const [runningAll, setRunningAll] = useState(false)
      const actions = useTableRunActions({
        dataset: ds,
        variableCatalog: catalog,
        tables,
        variableOverrides: {},
        settings,
        runningAll,
        setTables,
        setRunningAll,
      })
      return { tables, runningAll, ...actions }
    })

    await act(async () => {
      await result.current.runTable('Runnable 1')
    })
    expect(result.current.tables[0].result?.grandTotal).toBe(4)
    expect(result.current.tables[1].result).toBeNull()

    await act(async () => {
      await result.current.runAllTables()
    })
    expect(result.current.tables[0].result?.grandTotal).toBe(4)
    expect(result.current.tables[1].result).toBeNull()
    expect(result.current.tables[2].result?.grandTotal).toBe(4)
    expect(result.current.runningAll).toBe(false)
  })

  it('covers batch export success, skip, and finish summary handling', async () => {
    const ds = dataset()
    const catalog = buildVariableCatalog(ds.variables, [], ds.cases)
    const exportAllTablesToExcel = vi.fn<(...args: unknown[]) => Promise<void>>(async () => {})
    const beginBatchExport = vi.fn(() => Date.now() - 50)
    const finishBatchExport = vi.fn()
    const settings: GlobalSettings = {
      showCount: true,
      showPercent: true,
      percentType: 'column',
      hideZeroRows: false,
    }
    const { result } = renderHook(() => useBatchExportActions({
      dataset: ds,
      variableCatalog: catalog,
      currentSourceMappings: [],
      settings,
      beginBatchExport,
      finishBatchExport,
      loadSettingsIOModule: async () => ({
        parseSettingsFromExcel: async (file: File) => {
          if (file.name.includes('bad')) throw new Error('bad settings')
          return {
            version: '1.9',
            tables: [{ ...table('Loaded', 'Q1', 'AREA'), id: 'loaded' }],
            folders: [],
            output: { showCount: true, showPercent: true, percentType: 'row', hideZeroRows: false },
            variableOverrides: {},
            customMrsets: [],
            sourceDataset: null,
            sourceMappings: [],
            activeLock: null,
          }
        },
        restoreAllSettings: (allSettings: unknown) => allSettings,
      } as never),
      loadExcelExportModule: async () => ({ exportAllTablesToExcel } as never),
    }))

    await act(async () => {
      await result.current.handleBatchExportFiles(fileList([
        new File(['ok'], 'ok.xlsx'),
        new File(['bad'], 'bad.xlsx'),
      ]))
    })

    expect(beginBatchExport).toHaveBeenCalledTimes(1)
    expect(exportAllTablesToExcel).toHaveBeenCalledTimes(1)
    const exportedTables = exportAllTablesToExcel.mock.calls[0]?.[0] as Array<{ result: unknown }> | undefined
    expect(exportedTables?.[0]?.result).toBeTruthy()
    expect(finishBatchExport).toHaveBeenCalledWith(expect.objectContaining({
      successCount: 1,
      skippedCount: 1,
    }))
  })
})
