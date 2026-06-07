import { useCallback, useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { SavDataset } from '../lib/savParser'
import type { VariableCatalog } from '../lib/variableGrouping'
import { normalizeCode } from '../lib/appStateUtils'
import {
  buildScaleSummaryPreset,
  buildVariableEditorRowsWithSummaries,
  type ScaleSummaryPresetType,
  type VariableEditorRow,
  type VariableNetGroup,
} from '../lib/variableEditorUtils'
import type { NumericStat, VariableOverride } from '../types/variableOverride'

type VariableEditorTab = 'edit' | 'apply'
type CodeSortDirection = 'asc' | 'desc'
type VariableContextMenu = { x: number; y: number } | null

interface UseVariableEditorActionsOptions {
  variableCatalog: VariableCatalog | null
  dataset: SavDataset | null
  variableOverrides: Record<string, VariableOverride>
  setVariableOverrides: Dispatch<SetStateAction<Record<string, VariableOverride>>>
  editingVariableName: string | null
  setEditingVariableName: Dispatch<SetStateAction<string | null>>
  variableEditorRows: VariableEditorRow[]
  setVariableEditorRows: Dispatch<SetStateAction<VariableEditorRow[]>>
  codeEditorRows: VariableEditorRow[]
  selectedVariableRowKeys: string[]
  setSelectedVariableRowKeys: Dispatch<SetStateAction<string[]>>
  lastSelectedVariableIndex: number | null
  setLastSelectedVariableIndex: Dispatch<SetStateAction<number | null>>
  variableGroups: VariableNetGroup[]
  setVariableGroups: Dispatch<SetStateAction<VariableNetGroup[]>>
  selectedNumericStats: NumericStat[]
  setSelectedNumericStats: Dispatch<SetStateAction<NumericStat[]>>
  selectedScalePreset: ScaleSummaryPresetType | null
  setSelectedScalePreset: Dispatch<SetStateAction<ScaleSummaryPresetType | null>>
  codeSortDirection: CodeSortDirection
  setCodeSortDirection: Dispatch<SetStateAction<CodeSortDirection>>
  applyVarSearch: string
  setApplyVarSearch: Dispatch<SetStateAction<string>>
  setApplyToVarNames: Dispatch<SetStateAction<string[]>>
  pendingNetName: string
  setPendingNetName: Dispatch<SetStateAction<string>>
  setVariableEditorTab: Dispatch<SetStateAction<VariableEditorTab>>
  setVariableContextMenu: Dispatch<SetStateAction<VariableContextMenu>>
  setShowNetNameDialog: Dispatch<SetStateAction<boolean>>
  setShowScalePresetDialog: Dispatch<SetStateAction<boolean>>
  setError: Dispatch<SetStateAction<string | null>>
}

function getCodeRows(rows: VariableEditorRow[]) {
  return rows.filter(row => row.rowKind === 'code' || row.rowKind == null)
}

export function useVariableEditorActions({
  variableCatalog,
  dataset,
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
}: UseVariableEditorActionsOptions) {
  const rebuildVariableEditorRows = useCallback((codeRows: VariableEditorRow[], groups: VariableNetGroup[]) => {
    const override = editingVariableName ? variableOverrides[editingVariableName] : null
    const summaries = override?.summaries ?? []
    return buildVariableEditorRowsWithSummaries(codeRows, groups, summaries)
  }, [editingVariableName, variableOverrides])

  const openVariableEditor = useCallback((name: string) => {
    if (!variableCatalog || !dataset) return
    const item = variableCatalog.byName.get(name)
    if (!item) return

    const override = variableOverrides[name]
    const grouped = variableCatalog.groupedByName.get(name)
    let baseRows: VariableEditorRow[]

    if (grouped) {
      baseRows = grouped.options.map((option, index) => ({
        key: option.memberName,
        code: String(index + 1),
        label: option.label,
        count: dataset.cases.filter(rawCase => {
          const code = normalizeCode(rawCase[option.memberName])
          return option.selectedCodes ? [...option.selectedCodes].includes(code) : code === '1'
        }).length,
        percent: 0,
        factor: override?.weights?.[option.memberName] ?? '',
        rowKind: 'code',
      }))
    } else {
      const rawCodes = [...new Set(dataset.cases.map(rawCase => normalizeCode(rawCase[name])).filter(Boolean))]
      const labelMap = item.valueLabels
      const existingOrder = override?.order ?? []
      const isNumeric = !item.isString && Object.keys(labelMap).length === 0
      const allCodes = isNumeric
        ? [...rawCodes].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
        : existingOrder.length > 0
          ? [...existingOrder, ...rawCodes.filter(code => !existingOrder.includes(code))]
          : rawCodes.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      const total = dataset.cases.filter(rawCase => normalizeCode(rawCase[name])).length

      baseRows = allCodes.map(code => {
        const count = dataset.cases.filter(rawCase => normalizeCode(rawCase[name]) === code).length
        return {
          key: code,
          code,
          label: override?.labels?.[code] ?? (labelMap[code] ? `${code}. ${labelMap[code]}` : code),
          count,
          percent: total > 0 ? (count / total) * 100 : 0,
          factor: override?.weights?.[code] ?? '',
          rowKind: 'code',
        }
      })
    }

    const groups = override?.groups ?? []
    const summaries = override?.summaries ?? []
    setVariableEditorRows(buildVariableEditorRowsWithSummaries(baseRows, groups, summaries))
    setVariableGroups(groups)
    setSelectedNumericStats(override?.numericStats ?? ['mean'])
    setSelectedScalePreset(override?.summaryPreset ?? null)
    setSelectedVariableRowKeys([])
    setLastSelectedVariableIndex(null)
    setEditingVariableName(name)
    setVariableEditorTab('edit')
    setApplyVarSearch('')
    setApplyToVarNames([])
  }, [
    dataset,
    setApplyToVarNames,
    setApplyVarSearch,
    setEditingVariableName,
    setLastSelectedVariableIndex,
    setSelectedNumericStats,
    setSelectedScalePreset,
    setSelectedVariableRowKeys,
    setVariableEditorRows,
    setVariableEditorTab,
    setVariableGroups,
    variableCatalog,
    variableOverrides,
  ])

  const saveVariableEditor = useCallback((name: string, rows: VariableEditorRow[]) => {
    const codeRows = getCodeRows(rows)
    const weights: Record<string, string> = {}
    const labels: Record<string, string> = {}
    codeRows.forEach(row => {
      if (row.factor) weights[row.key] = row.factor
      labels[row.key] = row.label
    })
    const summaryRows = rows.filter(row => row.rowKind === 'summary').map(row => ({
      code: row.code,
      label: row.label,
      members: row.members ?? [],
    }))

    setVariableOverrides(prev => ({
      ...prev,
      [name]: {
        order: codeRows.map(row => row.key),
        weights,
        labels,
        numericStats: selectedNumericStats,
        groups: variableGroups,
        summaries: summaryRows,
        summaryPreset: selectedScalePreset ?? undefined,
      },
    }))
    setApplyToVarNames([])
    setEditingVariableName(null)
  }, [
    selectedNumericStats,
    selectedScalePreset,
    setApplyToVarNames,
    setEditingVariableName,
    setVariableOverrides,
    variableGroups,
  ])

  const similarVarNames = useMemo(() => {
    if (!editingVariableName || !variableCatalog) return []
    return variableCatalog.list
      .filter(item => item.name !== editingVariableName)
      .filter(item => !item.isString || Object.keys(item.valueLabels ?? {}).length > 0)
      .map(item => item.name)
  }, [editingVariableName, variableCatalog])

  const filteredSimilarVarNames = useMemo(() => {
    if (!applyVarSearch.trim()) return similarVarNames
    const query = applyVarSearch.trim().toLowerCase()
    return similarVarNames.filter(variableName => {
      if (variableName.toLowerCase().includes(query)) return true
      const item = variableCatalog?.byName.get(variableName)
      return !!(item?.label?.toLowerCase().includes(query) || item?.longName?.toLowerCase().includes(query))
    })
  }, [applyVarSearch, similarVarNames, variableCatalog])

  const saveAndApplyToVars = useCallback((targetNames: string[]) => {
    const summaryRows = variableEditorRows
      .filter(row => row.rowKind === 'summary')
      .map(row => ({ code: row.code, label: row.label, members: row.members ?? [] }))
    setVariableOverrides(prev => {
      const next = { ...prev }
      for (const targetName of targetNames) {
        const existing = prev[targetName] ?? {}
        next[targetName] = {
          ...existing,
          groups: variableGroups,
          summaries: summaryRows,
          numericStats: selectedNumericStats,
          summaryPreset: selectedScalePreset ?? undefined,
        } as VariableOverride
      }
      return next
    })
  }, [
    selectedNumericStats,
    selectedScalePreset,
    setVariableOverrides,
    variableEditorRows,
    variableGroups,
  ])

  const toggleCodeSort = useCallback(() => {
    setCodeSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    setVariableEditorRows(prev => {
      const sorted = [...getCodeRows(prev)].sort((a, b) => {
        const comparison = a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' })
        return codeSortDirection === 'asc' ? comparison : -comparison
      })
      return rebuildVariableEditorRows(sorted, variableGroups)
    })
  }, [codeSortDirection, rebuildVariableEditorRows, setCodeSortDirection, setVariableEditorRows, variableGroups])

  const handleVariableRowClick = useCallback((key: string, shiftKey: boolean) => {
    const index = codeEditorRows.findIndex(row => row.key === key)
    if (shiftKey && lastSelectedVariableIndex !== null) {
      const range = codeEditorRows
        .slice(Math.min(lastSelectedVariableIndex, index), Math.max(lastSelectedVariableIndex, index) + 1)
        .map(row => row.key)
      setSelectedVariableRowKeys(prev => [...new Set([...prev, ...range])])
      return
    }

    setSelectedVariableRowKeys(prev =>
      prev.includes(key) ? prev.filter(selectedKey => selectedKey !== key) : [...prev, key],
    )
    setLastSelectedVariableIndex(index)
  }, [codeEditorRows, lastSelectedVariableIndex, setLastSelectedVariableIndex, setSelectedVariableRowKeys])

  const createVariableNetGroup = useCallback(() => {
    setVariableContextMenu(null)
    if (selectedVariableRowKeys.length === 0) return
    setPendingNetName('UPC')
    setShowNetNameDialog(true)
  }, [selectedVariableRowKeys, setPendingNetName, setShowNetNameDialog, setVariableContextMenu])

  const removeVariableNetGroup = useCallback((groupId: string) => {
    const nextGroups = variableGroups.filter(group => group.id !== groupId)
    setVariableGroups(nextGroups)
    setVariableEditorRows(prev => rebuildVariableEditorRows(getCodeRows(prev), nextGroups))
  }, [rebuildVariableEditorRows, setVariableEditorRows, setVariableGroups, variableGroups])

  const removeSelectedCodesFromGroups = useCallback(() => {
    setVariableContextMenu(null)
    const keys = new Set(selectedVariableRowKeys)
    const nextGroups = variableGroups
      .map(group => ({ ...group, members: group.members.filter(member => !keys.has(member)) }))
      .filter(group => group.members.length > 0)
    setVariableGroups(nextGroups)
    setVariableEditorRows(prev => rebuildVariableEditorRows(getCodeRows(prev), nextGroups))
  }, [
    rebuildVariableEditorRows,
    selectedVariableRowKeys,
    setVariableContextMenu,
    setVariableEditorRows,
    setVariableGroups,
    variableGroups,
  ])

  const confirmVariableNetGroup = useCallback(() => {
    const name = pendingNetName.trim()
    if (!name) return
    const nextGroups = [
      ...variableGroups,
      {
        id: crypto.randomUUID(),
        name,
        members: [...selectedVariableRowKeys],
      },
    ]
    setVariableGroups(nextGroups)
    setVariableEditorRows(prev => rebuildVariableEditorRows(getCodeRows(prev), nextGroups))
    setShowNetNameDialog(false)
    setPendingNetName('UPC')
  }, [
    pendingNetName,
    rebuildVariableEditorRows,
    selectedVariableRowKeys,
    setPendingNetName,
    setShowNetNameDialog,
    setVariableEditorRows,
    setVariableGroups,
    variableGroups,
  ])

  const applyScaleSummaryPreset = useCallback((preset: ScaleSummaryPresetType) => {
    try {
      const codeRows = getCodeRows(variableEditorRows)
      const { factors, summaries } = buildScaleSummaryPreset(codeRows, preset)
      const updatedRows = codeRows.map(row => ({
        ...row,
        factor: factors[row.key] ?? row.factor,
        autoFactor: !!factors[row.key],
      }))
      setVariableEditorRows(buildVariableEditorRowsWithSummaries(updatedRows, variableGroups, summaries))
      setSelectedScalePreset(preset)
      setShowScalePresetDialog(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }, [
    setError,
    setSelectedScalePreset,
    setShowScalePresetDialog,
    setVariableEditorRows,
    variableEditorRows,
    variableGroups,
  ])

  return {
    rebuildVariableEditorRows,
    openVariableEditor,
    saveVariableEditor,
    similarVarNames,
    filteredSimilarVarNames,
    saveAndApplyToVars,
    toggleCodeSort,
    handleVariableRowClick,
    createVariableNetGroup,
    removeVariableNetGroup,
    removeSelectedCodesFromGroups,
    confirmVariableNetGroup,
    applyScaleSummaryPreset,
  }
}
