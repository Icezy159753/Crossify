import type { TableDef, TableFilterSpec } from '../types/workspace'

export function emptyTableFilter(): TableFilterSpec {
  return {
    description: '',
    rootJoin: 'all',
    groups: [],
  }
}

export function newTable(idx: number, folderId: string | null = null): TableDef {
  return {
    id: crypto.randomUUID(),
    name: `Table${idx}`,
    rowVar: null,
    colVar: null,
    result: null,
    folderId,
    filter: emptyTableFilter(),
  }
}

export function hasActiveFilter(filter: TableFilterSpec | null | undefined): boolean {
  if (!filter) return false
  return filter.groups.some(group => group.conditions.length > 0)
}

export function cloneTableFilter(filter: TableFilterSpec): TableFilterSpec {
  return {
    description: filter.description,
    rootJoin: filter.rootJoin,
    groups: filter.groups.map(group => ({
      id: group.id,
      join: group.join,
      conditions: group.conditions.map(condition => ({
        ...condition,
        values: [...condition.values],
      })),
    })),
  }
}

export function toComparableFilter(filter: TableFilterSpec) {
  return {
    description: filter.description.trim(),
    rootJoin: filter.rootJoin,
    groups: filter.groups
      .filter(group => group.conditions.length > 0)
      .map(group => ({
        join: group.join,
        conditions: group.conditions.map(condition => ({
          variableName: condition.variableName,
          operator: condition.operator,
          values: [...condition.values],
          value: condition.value,
          secondaryValue: condition.secondaryValue,
        })),
      })),
  }
}
