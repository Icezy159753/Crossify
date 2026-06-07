import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { FolderDef, TableDef } from '../types/workspace'

interface UseFolderActionsOptions {
  setFolders: Dispatch<SetStateAction<FolderDef[]>>
  setTables: Dispatch<SetStateAction<TableDef[]>>
  pushHistory: () => void
}

export function useFolderActions({ setFolders, setTables, pushHistory }: UseFolderActionsOptions) {
  const addFolder = useCallback(() => {
    const folder: FolderDef = { id: crypto.randomUUID(), name: 'New Folder', expanded: true }
    setFolders(prev => [...prev, folder])
  }, [setFolders])

  const renameFolder = useCallback((id: string, name: string) => {
    setFolders(prev => prev.map(folder => folder.id === id ? { ...folder, name } : folder))
  }, [setFolders])

  const deleteFolder = useCallback((id: string) => {
    pushHistory()
    setFolders(prev => prev.filter(folder => folder.id !== id))
    setTables(prev => prev.map(table => table.folderId === id ? { ...table, folderId: null } : table))
  }, [pushHistory, setFolders, setTables])

  const toggleFolderExpanded = useCallback((id: string) => {
    setFolders(prev => prev.map(folder => folder.id === id ? { ...folder, expanded: !folder.expanded } : folder))
  }, [setFolders])

  return {
    addFolder,
    renameFolder,
    deleteFolder,
    toggleFolderExpanded,
  }
}
