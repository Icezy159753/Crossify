import { useCallback, useRef, useState } from 'react'
import type { Dispatch, MouseEvent, SetStateAction } from 'react'
import type { TableDef } from '../types/workspace'
import { joinAxisSpec } from '../lib/appStateUtils'
import { newTable } from '../lib/tableModel'

type TableMenuState = { x: number; y: number; targetId: string } | null
type ClickOptions = { shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean }
type VariableCatalogLike = { list: Array<{ name: string }> } | null

interface UseTableActionsOptions {
  tables: TableDef[]
  setTables: Dispatch<SetStateAction<TableDef[]>>
  activeTableId: string
  setActiveTableId: Dispatch<SetStateAction<string>>
  selectedIds: Set<string>
  setSelectedIds: Dispatch<SetStateAction<Set<string>>>
  lastSelectedTableId: string | null
  setLastSelectedTableId: Dispatch<SetStateAction<string | null>>
  setTableContextMenu: Dispatch<SetStateAction<TableMenuState>>
  variableCatalog: VariableCatalogLike
  pushHistory: () => void
}

export function useTableActions({
  tables,
  setTables,
  activeTableId,
  setActiveTableId,
  selectedIds,
  setSelectedIds,
  lastSelectedTableId,
  setLastSelectedTableId,
  setTableContextMenu,
  variableCatalog,
  pushHistory,
}: UseTableActionsOptions) {
  const [copiedTablesBuffer, setCopiedTablesBuffer] = useState<TableDef[]>([])
  const dragTableRef = useRef<string | null>(null)

  const addTable = useCallback((folderId: string | null = null) => {
    pushHistory()
    const idx = tables.length + 1
    const table = newTable(idx, folderId)
    setTables(prev => [...prev, table])
    setActiveTableId(table.id)
    setLastSelectedTableId(table.id)
  }, [pushHistory, setActiveTableId, setLastSelectedTableId, setTables, tables.length])

  const createTablesFromVariables = useCallback((names: Iterable<string>, folderId: string | null = null) => {
    const uniqueNames = [...new Set(names)].filter(Boolean)
    if (uniqueNames.length === 0) return
    pushHistory()

    const orderedNames = variableCatalog
      ? variableCatalog.list.filter(variable => uniqueNames.includes(variable.name)).map(variable => variable.name)
      : uniqueNames

    if (orderedNames.length === 0) return

    setTables(prev => {
      const next = [...prev]
      const created = orderedNames.map((name, index) => ({
        ...newTable(next.length + index + 1, folderId),
        name,
        rowVar: joinAxisSpec([[name]]),
      }))
      next.push(...created)

      const lastCreated = created[created.length - 1]
      if (lastCreated) {
        setActiveTableId(lastCreated.id)
        setLastSelectedTableId(lastCreated.id)
      }

      return next
    })
  }, [pushHistory, setActiveTableId, setLastSelectedTableId, setTables, variableCatalog])

  const handleTableClick = useCallback((id: string, options?: ClickOptions) => {
    setActiveTableId(id)
    setLastSelectedTableId(id)
    if (options?.shiftKey && lastSelectedTableId) {
      const ids = tables.map(table => table.id)
      const from = ids.indexOf(lastSelectedTableId)
      const to = ids.indexOf(id)
      const range = ids.slice(Math.min(from, to), Math.max(from, to) + 1)
      setSelectedIds(prev => {
        const next = new Set(prev)
        range.forEach(rid => next.add(rid))
        return next
      })
    } else if (options?.metaKey || options?.ctrlKey) {
      setSelectedIds(prev => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    } else {
      setSelectedIds(new Set())
    }
  }, [lastSelectedTableId, setActiveTableId, setLastSelectedTableId, setSelectedIds, tables])

  const handleTableDelete = useCallback((id: string) => {
    pushHistory()
    setTables(prev => {
      const next = prev.filter(table => table.id !== id)
      if (next.length === 0) {
        const table = newTable(1)
        setActiveTableId(table.id)
        return [table]
      }
      if (activeTableId === id) {
        setActiveTableId(next[0].id)
      }
      return next
    })
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [activeTableId, pushHistory, setActiveTableId, setSelectedIds, setTables])

  const handleTableRename = useCallback((id: string, name: string) => {
    setTables(prev => prev.map(table => table.id === id ? { ...table, name } : table))
  }, [setTables])

  const handleTableDuplicate = useCallback((id: string) => {
    pushHistory()
    setTables(prev => {
      const idx = prev.findIndex(table => table.id === id)
      if (idx < 0) return prev
      const src = prev[idx]
      const dup: TableDef = { ...src, id: crypto.randomUUID(), name: `${src.name} Copy`, result: null }
      const next = [...prev]
      next.splice(idx + 1, 0, dup)
      setActiveTableId(dup.id)
      return next
    })
  }, [pushHistory, setActiveTableId, setTables])

  const duplicateSelectedTables = useCallback(() => {
    if (selectedIds.size === 0) return
    pushHistory()
    setTables(prev => {
      const copies = prev
        .filter(table => selectedIds.has(table.id))
        .map(table => ({ ...table, id: crypto.randomUUID(), result: null, name: `${table.name} Copy` }))
      setCopiedTablesBuffer(copies)
      return [...prev, ...copies]
    })
  }, [pushHistory, selectedIds, setTables])

  const handleTableCopy = useCallback((id: string) => {
    const inSelection = selectedIds.has(id) && selectedIds.size > 1
    if (inSelection) {
      setCopiedTablesBuffer(tables.filter(table => selectedIds.has(table.id)))
      return
    }
    const src = tables.find(table => table.id === id)
    if (src) setCopiedTablesBuffer([src])
  }, [selectedIds, tables])

  const pasteTables = useCallback((targetId?: string | null) => {
    if (copiedTablesBuffer.length === 0) return
    pushHistory()
    setTables(prev => {
      const inserts = copiedTablesBuffer.map(table => ({ ...table, id: crypto.randomUUID(), result: null }))
      if (!targetId) return [...prev, ...inserts]
      const idx = prev.findIndex(table => table.id === targetId)
      if (idx < 0) return [...prev, ...inserts]
      return [...prev.slice(0, idx + 1), ...inserts, ...prev.slice(idx + 1)]
    })
  }, [copiedTablesBuffer, pushHistory, setTables])

  const handleTablePasteAfter = useCallback((id: string) => {
    pasteTables(id)
  }, [pasteTables])

  const handleTableToggleSelect = useCallback((id: string, options?: ClickOptions) => {
    if (options?.shiftKey && lastSelectedTableId) {
      const ids = tables.map(table => table.id)
      const from = ids.indexOf(lastSelectedTableId)
      const to = ids.indexOf(id)
      const range = ids.slice(Math.min(from, to), Math.max(from, to) + 1)
      setSelectedIds(prev => {
        const next = new Set(prev)
        range.forEach(rid => next.add(rid))
        return next
      })
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    }
    setLastSelectedTableId(id)
  }, [lastSelectedTableId, setLastSelectedTableId, setSelectedIds, tables])

  const handleTableContextMenu = useCallback((e: MouseEvent, id: string) => {
    e.preventDefault()
    setTableContextMenu({ x: e.clientX, y: e.clientY, targetId: id })
  }, [setTableContextMenu])

  const handleTableDragStart = useCallback((id: string) => {
    dragTableRef.current = id
  }, [])

  const handleTableDropToRow = useCallback((targetId: string) => {
    const srcId = dragTableRef.current
    if (!srcId || srcId === targetId) return
    setTables(prev => {
      const srcIdx = prev.findIndex(table => table.id === srcId)
      const tgtIdx = prev.findIndex(table => table.id === targetId)
      if (srcIdx < 0 || tgtIdx < 0) return prev
      const next = [...prev]
      const [moved] = next.splice(srcIdx, 1)
      next.splice(tgtIdx, 0, moved)
      return next
    })
    dragTableRef.current = null
  }, [setTables])

  const handleMoveTableToFolder = useCallback((id: string, folderId: string | null) => {
    setTables(prev => prev.map(table => table.id === id ? { ...table, folderId } : table))
  }, [setTables])

  return {
    copiedTablesBuffer,
    addTable,
    createTablesFromVariables,
    handleTableClick,
    handleTableDelete,
    handleTableRename,
    handleTableDuplicate,
    duplicateSelectedTables,
    handleTableCopy,
    handleTablePasteAfter,
    handleTableToggleSelect,
    handleTableContextMenu,
    handleTableDragStart,
    handleTableDropToRow,
    handleMoveTableToFolder,
    pasteTables,
  }
}
