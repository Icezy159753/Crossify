import { useCallback } from 'react'
import type { TableFilterCondition } from '../types/workspace'
import type { VariableCatalog } from '../lib/variableGrouping'

export interface FilterOptionItem {
  key: string
  label: string
}

export interface FilterFieldMeta {
  kind: 'options' | 'numeric' | 'text'
  options: FilterOptionItem[]
  operators: TableFilterCondition['operator'][]
}

export interface VariableTone {
  badge: string
  cls: string
}

const DEFAULT_TONE: VariableTone = {
  badge: 'SA',
  cls: 'bg-blue-100 text-blue-700 border border-blue-300',
}

export function useVariableDisplayHelpers(variableCatalog: VariableCatalog | null) {
  const isNumericVariable = useCallback((name: string | null): boolean => {
    if (!name || !variableCatalog) return false
    const item = variableCatalog.byName.get(name)
    if (!item) return false
    return !item.isString && Object.keys(item.valueLabels).length === 0
  }, [variableCatalog])

  const getVarLabel = useCallback((name: string) => {
    if (!variableCatalog) return name
    const item = variableCatalog.byName.get(name)
    if (!item) return name
    return item.label || item.longName || item.name
  }, [variableCatalog])

  const getVarTone = useCallback((name: string): VariableTone => {
    if (!variableCatalog) return DEFAULT_TONE
    const item = variableCatalog.byName.get(name)
    if (!item) return DEFAULT_TONE
    if (item.isGroupedMA) return { badge: 'MA', cls: 'bg-emerald-100 text-emerald-700 border border-emerald-300' }
    if (item.isString) return { badge: 'A', cls: 'bg-amber-100 text-amber-700 border border-amber-300' }
    if (Object.keys(item.valueLabels).length === 0) {
      return { badge: '#', cls: 'bg-gray-100 text-gray-500 border border-gray-300' }
    }
    return DEFAULT_TONE
  }, [variableCatalog])

  const getFilterFieldMeta = useCallback((name: string): FilterFieldMeta => {
    if (!variableCatalog) return { kind: 'options', options: [], operators: ['in', 'not_in'] }
    const item = variableCatalog.byName.get(name)
    if (!item) return { kind: 'options', options: [], operators: ['in', 'not_in'] }
    if (item.isString) {
      return {
        kind: 'text',
        options: [],
        operators: ['contains', 'not_contains', 'is_blank', 'not_blank'],
      }
    }
    const keys = Object.keys(item.valueLabels)
    if (keys.length === 0) {
      return {
        kind: 'numeric',
        options: [],
        operators: ['gt', 'gte', 'lt', 'lte', 'between', 'is_blank', 'not_blank'],
      }
    }
    const options: FilterOptionItem[] = keys.map(key => ({
      key,
      label: item.valueLabels[key] ? `${key}. ${item.valueLabels[key]}` : key,
    }))
    return { kind: 'options', options, operators: ['in', 'not_in'] }
  }, [variableCatalog])

  return {
    getFilterFieldMeta,
    getVarLabel,
    getVarTone,
    isNumericVariable,
  }
}
