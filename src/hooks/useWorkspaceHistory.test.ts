/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { emptyTableFilter } from '../lib/tableModel'
import type { FolderDef, TableDef } from '../types/workspace'
import { useWorkspaceHistory } from './useWorkspaceHistory'

function table(id: string, name: string): TableDef {
  return {
    id,
    name,
    rowVar: null,
    colVar: null,
    result: null,
    folderId: null,
    filter: emptyTableFilter(),
  }
}

function folder(id: string): FolderDef {
  return { id, name: id, expanded: true }
}

function renderHistoryHarness() {
  return renderHook(() => {
    const [tables, setTables] = useState<TableDef[]>([table('one', 'One')])
    const [folders, setFolders] = useState<FolderDef[]>([folder('folder-one')])
    const [activeTableId, setActiveTableId] = useState('one')
    const history = useWorkspaceHistory({
      tables,
      folders,
      setTables,
      setFolders,
      setActiveTableId,
    })
    return {
      ...history,
      activeTableId,
      folders,
      setFolders,
      setTables,
      tables,
    }
  })
}

describe('useWorkspaceHistory', () => {
  it('restores previous and next snapshots', () => {
    const { result } = renderHistoryHarness()

    act(() => result.current.pushHistory())
    act(() => {
      result.current.setTables([table('two', 'Two')])
      result.current.setFolders([folder('folder-two')])
    })
    act(() => result.current.pushHistory())

    act(() => result.current.undo())
    expect(result.current.tables.map(item => item.id)).toEqual(['one'])
    expect(result.current.folders.map(item => item.id)).toEqual(['folder-one'])
    expect(result.current.activeTableId).toBe('one')

    act(() => result.current.redo())
    expect(result.current.tables.map(item => item.id)).toEqual(['two'])
    expect(result.current.folders.map(item => item.id)).toEqual(['folder-two'])
    expect(result.current.activeTableId).toBe('two')
  })

  it('routes keyboard shortcuts and ignores editable targets', () => {
    const { result } = renderHistoryHarness()

    act(() => result.current.pushHistory())
    act(() => result.current.setTables([table('two', 'Two')]))
    act(() => result.current.pushHistory())

    const input = document.createElement('input')
    document.body.append(input)
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ctrlKey: true, key: 'z' }))
    })
    expect(result.current.tables.map(item => item.id)).toEqual(['two'])

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'z' }))
    })
    expect(result.current.tables.map(item => item.id)).toEqual(['one'])

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'y' }))
    })
    expect(result.current.tables.map(item => item.id)).toEqual(['two'])

    input.remove()
  })
})
