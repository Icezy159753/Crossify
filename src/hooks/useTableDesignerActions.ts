import { useCallback } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import type { TableDef } from '../types/workspace'
import {
  insertVarByMode,
  joinAxisSpec,
  moveAxisOccurrenceToTarget,
  moveVarInAxis,
  parseAxisSpec,
  removeVarFromAxis,
} from '../lib/appStateUtils'

type DropMode = 'add' | 'nest'
type DropTarget = {
  branchIndex?: number
  placement?: 'before' | 'after'
  targetVar?: string | null
  folderNames?: string[]
}
type AxisOccurrence = { branchIndex: number; itemIndex: number }
type AxisDropTarget = AxisOccurrence & { placement?: 'before' | 'after' }

interface UseTableDesignerActionsOptions {
  activeTableId: string
  activeTableExists: boolean
  setTables: Dispatch<SetStateAction<TableDef[]>>
  dragVarsRef: RefObject<string[]>
  pushHistory: () => void
}

export function useTableDesignerActions({
  activeTableId,
  activeTableExists,
  setTables,
  dragVarsRef,
  pushHistory,
}: UseTableDesignerActionsOptions) {
  const getDroppedNames = useCallback((target: DropTarget) =>
    target.folderNames && target.folderNames.length > 0 ? target.folderNames : (dragVarsRef.current ?? []),
  [dragVarsRef])

  const handleDropTop = useCallback((mode: DropMode, target: DropTarget) => {
    const names = getDroppedNames(target)
    if (names.length === 0 || !activeTableExists) return
    pushHistory()
    const nestSelected = mode === 'nest' ? (target.targetVar ?? null) : null
    setTables(prev => prev.map(table => {
      if (table.id !== activeTableId) return table
      let spec = parseAxisSpec(table.colVar)
      for (const name of names) {
        spec = insertVarByMode(spec, name, mode, nestSelected)
      }
      return { ...table, colVar: joinAxisSpec(spec) }
    }))
  }, [activeTableExists, activeTableId, getDroppedNames, pushHistory, setTables])

  const handleDropSide = useCallback((mode: DropMode, target: DropTarget) => {
    const names = getDroppedNames(target)
    if (names.length === 0 || !activeTableExists) return
    pushHistory()
    const nestSelected = mode === 'nest' ? (target.targetVar ?? null) : null
    setTables(prev => prev.map(table => {
      if (table.id !== activeTableId) return table
      let spec = parseAxisSpec(table.rowVar)
      for (const name of names) {
        spec = insertVarByMode(spec, name, mode, nestSelected)
      }
      return { ...table, rowVar: joinAxisSpec(spec) }
    }))
  }, [activeTableExists, activeTableId, getDroppedNames, pushHistory, setTables])

  const handleRemoveTop = useCallback((name: string, occurrence?: AxisOccurrence) => {
    pushHistory()
    setTables(prev => prev.map(table => {
      if (table.id !== activeTableId) return table
      const next = removeVarFromAxis(parseAxisSpec(table.colVar), name, occurrence)
      return { ...table, colVar: joinAxisSpec(next) }
    }))
  }, [activeTableId, pushHistory, setTables])

  const handleRemoveSide = useCallback((name: string, occurrence?: AxisOccurrence) => {
    pushHistory()
    setTables(prev => prev.map(table => {
      if (table.id !== activeTableId) return table
      const next = removeVarFromAxis(parseAxisSpec(table.rowVar), name, occurrence)
      return { ...table, rowVar: joinAxisSpec(next) }
    }))
  }, [activeTableId, pushHistory, setTables])

  const handleReorderTop = useCallback((source: AxisOccurrence, target: AxisDropTarget) => {
    setTables(prev => prev.map(table => {
      if (table.id !== activeTableId) return table
      const next = moveAxisOccurrenceToTarget(parseAxisSpec(table.colVar), source, target)
      return { ...table, colVar: joinAxisSpec(next) }
    }))
  }, [activeTableId, setTables])

  const handleReorderSide = useCallback((source: AxisOccurrence, target: AxisDropTarget) => {
    setTables(prev => prev.map(table => {
      if (table.id !== activeTableId) return table
      const next = moveAxisOccurrenceToTarget(parseAxisSpec(table.rowVar), source, target)
      return { ...table, rowVar: joinAxisSpec(next) }
    }))
  }, [activeTableId, setTables])

  const handleMoveTopUp = useCallback((name: string) => {
    setTables(prev => prev.map(table => {
      if (table.id !== activeTableId) return table
      const next = moveVarInAxis(parseAxisSpec(table.colVar), name, -1)
      return { ...table, colVar: joinAxisSpec(next) }
    }))
  }, [activeTableId, setTables])

  const handleMoveTopDown = useCallback((name: string) => {
    setTables(prev => prev.map(table => {
      if (table.id !== activeTableId) return table
      const next = moveVarInAxis(parseAxisSpec(table.colVar), name, 1)
      return { ...table, colVar: joinAxisSpec(next) }
    }))
  }, [activeTableId, setTables])

  const handleMoveSideUp = useCallback((name: string) => {
    setTables(prev => prev.map(table => {
      if (table.id !== activeTableId) return table
      const next = moveVarInAxis(parseAxisSpec(table.rowVar), name, -1)
      return { ...table, rowVar: joinAxisSpec(next) }
    }))
  }, [activeTableId, setTables])

  const handleMoveSideDown = useCallback((name: string) => {
    setTables(prev => prev.map(table => {
      if (table.id !== activeTableId) return table
      const next = moveVarInAxis(parseAxisSpec(table.rowVar), name, 1)
      return { ...table, rowVar: joinAxisSpec(next) }
    }))
  }, [activeTableId, setTables])

  const handleClearTop = useCallback(() => {
    pushHistory()
    setTables(prev => prev.map(table => table.id === activeTableId ? { ...table, colVar: null } : table))
  }, [activeTableId, pushHistory, setTables])

  const handleClearSide = useCallback(() => {
    pushHistory()
    setTables(prev => prev.map(table => table.id === activeTableId ? { ...table, rowVar: null } : table))
  }, [activeTableId, pushHistory, setTables])

  return {
    handleDropTop,
    handleDropSide,
    handleRemoveTop,
    handleRemoveSide,
    handleReorderTop,
    handleReorderSide,
    handleMoveTopUp,
    handleMoveTopDown,
    handleMoveSideUp,
    handleMoveSideDown,
    handleClearTop,
    handleClearSide,
  }
}
