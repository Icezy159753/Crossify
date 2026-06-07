import { useCallback } from 'react'
import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import type { TableDef, TableFilterCondition, TableFilterGroup, TableFilterSpec } from '../types/workspace'
import { insertVarByMode, joinAxisSpec, parseAxisSpec } from '../lib/appStateUtils'

type QuickActionTarget = 'top' | 'side' | 'filter' | 'table'
type VariableCatalogLike = { list: Array<{ name: string }> } | null

interface UseVariableListActionsOptions {
  variableCatalog: VariableCatalogLike
  selectedVariableNames: Set<string>
  setSelectedVariableNames: Dispatch<SetStateAction<Set<string>>>
  lastSelectedVariableName: string | null
  setLastSelectedVariableName: Dispatch<SetStateAction<string | null>>
  dragVarsRef: MutableRefObject<string[]>
  activeTableId: string
  setTables: Dispatch<SetStateAction<TableDef[]>>
  createTablesFromVariables: (names: Iterable<string>, folderId?: string | null) => void
  applyFilterToEditingTables: (mutate: (filter: TableFilterSpec) => TableFilterSpec) => void
}

export function useVariableListActions({
  variableCatalog,
  selectedVariableNames,
  setSelectedVariableNames,
  lastSelectedVariableName,
  setLastSelectedVariableName,
  dragVarsRef,
  activeTableId,
  setTables,
  createTablesFromVariables,
  applyFilterToEditingTables,
}: UseVariableListActionsOptions) {
  const orderedSelectedNames = useCallback(() => {
    const list = variableCatalog?.list ?? []
    return list.map(variable => variable.name).filter(name => selectedVariableNames.has(name))
  }, [selectedVariableNames, variableCatalog])

  const handleVarDragStart = useCallback((name: string) => {
    const ordered = orderedSelectedNames()
    dragVarsRef.current =
      selectedVariableNames.size > 1 && selectedVariableNames.has(name) ? ordered : [name]
  }, [dragVarsRef, orderedSelectedNames, selectedVariableNames])

  const handleVarSelect = useCallback((name: string, options?: { shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean }) => {
    if (options?.shiftKey && lastSelectedVariableName) {
      const list = variableCatalog?.list ?? []
      const from = list.findIndex(variable => variable.name === lastSelectedVariableName)
      const to = list.findIndex(variable => variable.name === name)
      const range = list.slice(Math.min(from, to), Math.max(from, to) + 1).map(variable => variable.name)
      setSelectedVariableNames(prev => new Set([...prev, ...range]))
    } else if (options?.metaKey || options?.ctrlKey) {
      setSelectedVariableNames(prev => {
        const next = new Set(prev)
        if (next.has(name)) next.delete(name)
        else next.add(name)
        return next
      })
      setLastSelectedVariableName(name)
    } else {
      setSelectedVariableNames(new Set([name]))
      setLastSelectedVariableName(name)
    }
  }, [lastSelectedVariableName, setLastSelectedVariableName, setSelectedVariableNames, variableCatalog])

  const handleVarClearSelection = useCallback(() => {
    setSelectedVariableNames(new Set())
    setLastSelectedVariableName(null)
  }, [setLastSelectedVariableName, setSelectedVariableNames])

  const handleVarQuickAction = useCallback((name: string, target: QuickActionTarget) => {
    if (target === 'table') {
      const sourceNames = selectedVariableNames.size > 1 && selectedVariableNames.has(name)
        ? selectedVariableNames
        : [name]
      createTablesFromVariables(sourceNames)
      return
    }

    const orderedForMulti =
      selectedVariableNames.size > 1 && selectedVariableNames.has(name)
        ? orderedSelectedNames()
        : [name]

    if (target === 'top') {
      setTables(prev => prev.map(table => {
        if (table.id !== activeTableId) return table
        let spec = parseAxisSpec(table.colVar)
        for (const variableName of orderedForMulti) {
          spec = insertVarByMode(spec, variableName, 'add', null)
        }
        return { ...table, colVar: joinAxisSpec(spec) }
      }))
    } else if (target === 'side') {
      setTables(prev => prev.map(table => {
        if (table.id !== activeTableId) return table
        let spec = parseAxisSpec(table.rowVar)
        for (const variableName of orderedForMulti) {
          spec = insertVarByMode(spec, variableName, 'add', null)
        }
        return { ...table, rowVar: joinAxisSpec(spec) }
      }))
    } else if (target === 'filter') {
      const conditions: TableFilterCondition[] = orderedForMulti.map(variableName => ({
        id: crypto.randomUUID(),
        variableName,
        operator: 'in',
        values: [],
        value: '',
        secondaryValue: '',
      }))
      const newGroup: TableFilterGroup = {
        id: crypto.randomUUID(),
        join: 'all',
        conditions,
      }
      applyFilterToEditingTables(filter => ({
        ...filter,
        groups: [...filter.groups, newGroup],
      }))
    }
  }, [
    activeTableId,
    applyFilterToEditingTables,
    createTablesFromVariables,
    orderedSelectedNames,
    selectedVariableNames,
    setTables,
  ])

  return {
    handleVarDragStart,
    handleVarSelect,
    handleVarClearSelection,
    handleVarQuickAction,
  }
}
