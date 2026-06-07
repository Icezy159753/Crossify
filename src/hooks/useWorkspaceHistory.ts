import { useCallback, useEffect, useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { FolderDef, TableDef } from '../types/workspace'

interface WorkspaceSnapshot {
  tables: TableDef[]
  folders: FolderDef[]
}

interface UseWorkspaceHistoryInput {
  tables: TableDef[]
  folders: FolderDef[]
  setTables: Dispatch<SetStateAction<TableDef[]>>
  setFolders: Dispatch<SetStateAction<FolderDef[]>>
  setActiveTableId: Dispatch<SetStateAction<string>>
}

function cloneSnapshot(tables: TableDef[], folders: FolderDef[]): WorkspaceSnapshot {
  return {
    tables: JSON.parse(JSON.stringify(tables)) as TableDef[],
    folders: JSON.parse(JSON.stringify(folders)) as FolderDef[],
  }
}

function isEditableTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
}

export function useWorkspaceHistory({
  tables,
  folders,
  setTables,
  setFolders,
  setActiveTableId,
}: UseWorkspaceHistoryInput) {
  const historyStackRef = useRef<WorkspaceSnapshot[]>([])
  const historyIndexRef = useRef(-1)
  const latestTablesRef = useRef(tables)
  const latestFoldersRef = useRef(folders)

  useEffect(() => {
    latestTablesRef.current = tables
    latestFoldersRef.current = folders
  }, [folders, tables])

  const pushHistory = useCallback(() => {
    const snapshot = cloneSnapshot(latestTablesRef.current, latestFoldersRef.current)
    historyStackRef.current = historyStackRef.current.slice(0, historyIndexRef.current + 1)
    historyStackRef.current.push(snapshot)
    if (historyStackRef.current.length > 50) {
      historyStackRef.current.shift()
    } else {
      historyIndexRef.current += 1
    }
  }, [])

  const restoreSnapshot = useCallback((snapshot: WorkspaceSnapshot) => {
    setTables(snapshot.tables)
    setFolders(snapshot.folders)
    setActiveTableId(previous =>
      snapshot.tables.find(table => table.id === previous) ? previous : (snapshot.tables[0]?.id ?? ''),
    )
  }, [setActiveTableId, setFolders, setTables])

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current -= 1
    restoreSnapshot(historyStackRef.current[historyIndexRef.current])
  }, [restoreSnapshot])

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyStackRef.current.length - 1) return
    historyIndexRef.current += 1
    restoreSnapshot(historyStackRef.current[historyIndexRef.current])
  }, [restoreSnapshot])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return
      if (event.ctrlKey && !event.shiftKey && event.key === 'z') {
        event.preventDefault()
        undo()
      } else if ((event.ctrlKey && event.shiftKey && event.key === 'Z') || (event.ctrlKey && event.key === 'y')) {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [redo, undo])

  return { pushHistory, undo, redo }
}
