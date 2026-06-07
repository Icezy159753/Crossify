import { useCallback } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import type {
  FilterJoin,
  TableDef,
  TableFilterCondition,
  TableFilterGroup,
  TableFilterSpec,
} from '../types/workspace'
import { cloneTableFilter, emptyTableFilter } from '../lib/tableModel'

interface UseFilterActionsOptions {
  activeTableId: string
  selectedIds: Set<string>
  setTables: Dispatch<SetStateAction<TableDef[]>>
  dragVarsRef: RefObject<string[]>
  pushHistory: () => void
}

export function useFilterActions({
  activeTableId,
  selectedIds,
  setTables,
  dragVarsRef,
  pushHistory,
}: UseFilterActionsOptions) {
  const applyFilterToEditingTables = useCallback((mutate: (filter: TableFilterSpec) => TableFilterSpec) => {
    if (!activeTableId) return

    setTables(prev => {
      const active = prev.find(table => table.id === activeTableId)
      if (!active) return prev

      const targetIds = new Set(selectedIds.size > 0 ? [activeTableId, ...selectedIds] : [activeTableId])
      const nextFilter = mutate(cloneTableFilter(active.filter))

      return prev.map(table =>
        targetIds.has(table.id)
          ? { ...table, filter: cloneTableFilter(nextFilter) }
          : table,
      )
    })
  }, [activeTableId, selectedIds, setTables])

  const handleUpdateFilterDescription = useCallback((description: string) => {
    applyFilterToEditingTables(filter => ({ ...filter, description }))
  }, [applyFilterToEditingTables])

  const handleUpdateRootJoin = useCallback((join: FilterJoin) => {
    applyFilterToEditingTables(filter => ({ ...filter, rootJoin: join }))
  }, [applyFilterToEditingTables])

  const handleAddGroup = useCallback(() => {
    const group: TableFilterGroup = {
      id: crypto.randomUUID(),
      join: 'all',
      conditions: [],
    }
    applyFilterToEditingTables(filter => ({ ...filter, groups: [...filter.groups, group] }))
  }, [applyFilterToEditingTables])

  const handleClearFilter = useCallback(() => {
    pushHistory()
    applyFilterToEditingTables(() => emptyTableFilter())
  }, [applyFilterToEditingTables, pushHistory])

  const handleDropFilterVariable = useCallback((groupId?: string | null, folderNames?: string[] | null) => {
    const names = folderNames && folderNames.length > 0 ? folderNames : (dragVarsRef.current ?? [])
    if (names.length === 0) return
    applyFilterToEditingTables(filter => {
      const nextFilter = cloneTableFilter(filter)
      const newConditions = names.map(
        (variableName): TableFilterCondition => ({
          id: crypto.randomUUID(),
          variableName,
          operator: 'in',
          values: [],
          value: '',
          secondaryValue: '',
        }),
      )
      if (groupId) {
        nextFilter.groups = nextFilter.groups.map(group =>
          group.id === groupId ? { ...group, conditions: [...group.conditions, ...newConditions] } : group,
        )
      } else {
        const newGroup: TableFilterGroup = {
          id: crypto.randomUUID(),
          join: 'all',
          conditions: newConditions,
        }
        nextFilter.groups = [...nextFilter.groups, newGroup]
      }
      return nextFilter
    })
  }, [applyFilterToEditingTables, dragVarsRef])

  const handleUpdateGroupJoin = useCallback((groupId: string, join: FilterJoin) => {
    applyFilterToEditingTables(filter => ({
      ...filter,
      groups: filter.groups.map(group => group.id === groupId ? { ...group, join } : group),
    }))
  }, [applyFilterToEditingTables])

  const handleRemoveGroup = useCallback((groupId: string) => {
    applyFilterToEditingTables(filter => ({
      ...filter,
      groups: filter.groups.filter(group => group.id !== groupId),
    }))
  }, [applyFilterToEditingTables])

  const handleUpdateCondition = useCallback((groupId: string, conditionId: string, patch: Partial<TableFilterCondition>) => {
    applyFilterToEditingTables(filter => ({
      ...filter,
      groups: filter.groups.map(group =>
        group.id === groupId
          ? { ...group, conditions: group.conditions.map(condition => condition.id === conditionId ? { ...condition, ...patch } : condition) }
          : group,
      ),
    }))
  }, [applyFilterToEditingTables])

  const handleRemoveCondition = useCallback((groupId: string, conditionId: string) => {
    applyFilterToEditingTables(filter => ({
      ...filter,
      groups: filter.groups.map(group =>
        group.id === groupId
          ? { ...group, conditions: group.conditions.filter(condition => condition.id !== conditionId) }
          : group,
      ),
    }))
  }, [applyFilterToEditingTables])

  return {
    applyFilterToEditingTables,
    handleUpdateFilterDescription,
    handleUpdateRootJoin,
    handleAddGroup,
    handleClearFilter,
    handleDropFilterVariable,
    handleUpdateGroupJoin,
    handleRemoveGroup,
    handleUpdateCondition,
    handleRemoveCondition,
  }
}
