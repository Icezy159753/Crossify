/* eslint-disable */
// @ts-nocheck
import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { parseSav, applyValueLabels } from './lib/savParser'
import type { SavDataset } from './lib/savParser'
import { computeCrosstab, computeCrosstabAsync, filterZeroRows } from './lib/crosstabEngine'
import type { CrosstabResult, CrosstabConfig, CrosstabRowType } from './lib/crosstabEngine'
import type {
  AllSettings,
  OutputSettings,
  SettingsLockInfo,
  SourceDatasetSetting,
  SourceMappingEntry,
} from './lib/settingsIO'
import { formatBatchDuration, formatLiveBatchDuration } from './lib/timeFormatUtils'
import { evaluateFilterSpec } from './lib/filterEngine'
import {
  pickSettingsFileViaSystem,
  pickSavFileViaSystem,
  rememberSavFileHandle,
  restoreSavFileFromSource,
  saveSettingsToFileHandle,
  supportsFileSystemAccess,
} from './lib/fileAccess'
import {
  buildVariableCatalog,
  computeGroupedCrosstab,
  computeGroupedCrosstabAsync,
  getGroupedBaseCount,
  getGroupedSelections,
} from './lib/variableGrouping'
import type { GroupedVariableDef, MrsetDefinition } from './lib/variableGrouping'
import {
  ADD_JOIN,
  type AxisSpec,
  flattenAxisSpec,
  getAxisDisplayLevels,
  insertTopLevelBranchAt,
  insertVarByMode,
  joinAxisSpec,
  moveAxisOccurrenceToTarget,
  moveSelectedRows,
  moveVarInAxis,
  normalizeCode,
  parseAxisSpec,
  removeVarFromAxis,
} from './lib/appStateUtils'
import {
  buildScaleSummaryPreset,
  buildVariableEditorRowsWithSummaries,
  getGroupDepth,
  getNetPrefix,
  type ScaleSummaryPresetType,
  } from './lib/variableEditorUtils'
import type {
  VariableEditorRow,
  VariableNetGroup,
  VariableSummaryRow,
} from './lib/variableEditorUtils'
import { useBatchExportFlow } from './hooks/useBatchExportFlow'
import { CrossifyLogo } from './components/CrossifyLogo'
import { DesignCanvas } from './components/DesignCanvas'
import { FilterCanvas } from './components/FilterCanvas'
import { PreviewTable } from './components/PreviewTable'
import { TableRow } from './components/TableRow'
import { VirtualVarList } from './components/VirtualVarList'
import type {
  FilterJoin,
  FolderDef,
  GlobalSettings,
  PercentType,
  TableDef,
  TableFilterCondition,
  TableFilterGroup,
  TableFilterSpec,
} from './types/workspace'
import {
  Plus, Trash2, Download, RefreshCw,
  ChevronRight, Database, X, Upload, Settings2, Copy,
  FolderOpen, Folder, ChevronDown, Play, Save, FolderInput,
  ArrowUp, ArrowDown, ArrowRight, ClipboardPaste, Sparkles,
} from 'lucide-react'

// เนโ€โฌเนโ€โฌ Types เนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌ

interface VariableOverride {
  order: string[]
  weights: Record<string, string>
  labels?: Record<string, string>
  numericStats?: Array<'mean' | 'min' | 'max' | 'stddev'>
  groups?: VariableNetGroup[]
  summaries?: VariableSummaryRow[]
  summaryPreset?: ScaleSummaryPresetType
}

type NumericStat = 'mean' | 'min' | 'max' | 'stddev'
type QuickAddTarget = 'top' | 'side' | 'filter'

const SETTINGS_LOCK_DURATION_MS = 1000 * 60 * 3
const SETTINGS_LOCK_HEARTBEAT_MS = 1000 * 30
const LIGHT_LOAD_THRESHOLD_BYTES = 150 * 1024 * 1024

interface EditorIdentity {
  ownerLabel: string
  machineLabel: string
}

function getSettingsSessionId(): string {
  if (typeof window === 'undefined') return crypto.randomUUID()
  const storageKey = 'crossify-settings-session-id'
  try {
    const existing = window.sessionStorage.getItem(storageKey)?.trim()
    if (existing) return existing
  } catch {
    // ignore unavailable session storage
  }

  const sessionId = crypto.randomUUID()
  try {
    window.sessionStorage.setItem(storageKey, sessionId)
  } catch {
    // ignore unavailable session storage
  }
  return sessionId
}

function getEditorIdentity(): EditorIdentity {
  if (typeof window === 'undefined') return { ownerLabel: 'Crossify User', machineLabel: 'Browser Session' }
  const storageKey = 'crossify-editor-identity'
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<EditorIdentity>
      if (parsed.ownerLabel && parsed.machineLabel) {
        return { ownerLabel: parsed.ownerLabel, machineLabel: parsed.machineLabel }
      }
    }
  } catch {
    // ignore invalid local storage payload
  }

  const language = typeof navigator !== 'undefined' ? navigator.language.toUpperCase() : 'LOCAL'
  const identity = {
    ownerLabel: `Crossify User ${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    machineLabel: `${language} Browser`,
  }
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(identity))
  } catch {
    // ignore storage failures
  }
  return identity
}

function getScalePresetLabel(preset: ScaleSummaryPresetType) {
  switch (preset) {
    case 'tb_low_good':
      return 'สร้างTB(Scale น้อยดี)'
    case 'tb_high_good':
      return 'สร้างTB(Scale มากดี)'
    case 't2b_low_good':
      return 'สร้างT2B(Scale น้อยดี)'
    case 't2b_high_good':
      return 'สร้างT2B(Scale มากดี)'
    case 't3b_low_good':
      return 'สร้างT3B(Scale น้อยดี)'
    case 't3b_high_good':
      return 'สร้างT3B(Scale มากดี)'
    case 'justright_code':
      return 'Justright(ตาม Code)'
    case 'justright_centered':
      return 'Justright(-2 -1 0 1 2)'
    default:
      return 'สร้าง TB/T2B'
  }
}

function getScalePresetDisplayLabel(preset: ScaleSummaryPresetType) {
  switch (preset) {
    case 'tb_low_good':
      return 'Create TB (Low scale = good)'
    case 'tb_high_good':
      return 'Create TB (High scale = good)'
    case 't2b_low_good':
      return 'Create T2B (Low scale = good)'
    case 't2b_high_good':
      return 'Create T2B (High scale = good)'
    case 't3b_low_good':
      return 'Create T3B (Low scale = good)'
    case 't3b_high_good':
      return 'Create T3B (High scale = good)'
    case 'justright_code':
      return 'Justright (By code)'
    case 'justright_centered':
      return 'Justright (-2 -1 0 1 2)'
    default:
      return getScalePresetLabel(preset)
  }
}

const SCALE_PRESET_OPTIONS: Array<{
  preset: ScaleSummaryPresetType
  title: string
  description: string
  tone: string
}> = [
  {
    preset: 'tb_low_good',
    title: 'TB',
    description: 'ตัวแปรแบบ 1=ดี (ใส่ factor 5→1) สร้างแถว TB และ BB',
    tone: 'border-emerald-200 bg-emerald-50/80 hover:border-emerald-300 hover:bg-emerald-50',
  },
  {
    preset: 'tb_high_good',
    title: 'TB',
    description: 'ตัวแปรแบบ 5=ดี (ใส่ factor 1→5) สร้างแถว TB และ BB',
    tone: 'border-teal-200 bg-teal-50/80 hover:border-teal-300 hover:bg-teal-50',
  },
  {
    preset: 't2b_low_good',
    title: 'T2B',
    description: 'ตัวแปรแบบ 1=ดี (ใส่ factor 5→1) สร้างแถว TB / T2B / BB / B2B',
    tone: 'border-amber-200 bg-amber-50/80 hover:border-amber-300 hover:bg-amber-50',
  },
  {
    preset: 't2b_high_good',
    title: 'T2B',
    description: 'ตัวแปรแบบ 5=ดี (ใส่ factor 1→5) สร้างแถว TB / T2B / BB / B2B',
    tone: 'border-orange-200 bg-orange-50/80 hover:border-orange-300 hover:bg-orange-50',
  },
]

interface FilterOptionItem {
  key: string
  label: string
}

interface FilterFieldMeta {
  kind: 'options' | 'numeric' | 'text'
  options: FilterOptionItem[]
  operators: TableFilterCondition['operator'][]
}

const BATCH_YIELD_EVERY = 250

async function loadExcelExportModule() {
  return import('./lib/excelExport')
}

async function loadSettingsIOModule() {
  return import('./lib/settingsIO')
}

function yieldToBrowser() {
  return new Promise<void>(resolve => {
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => resolve())
      return
    }
    window.setTimeout(() => resolve(), 0)
  })
}

function newTable(idx: number, folderId: string | null = null): TableDef {
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

function emptyTableFilter(): TableFilterSpec {
  return {
    description: '',
    rootJoin: 'all',
    groups: [],
  }
}

function hasActiveFilter(filter: TableFilterSpec | null | undefined): boolean {
  if (!filter) return false
  return filter.groups.some(group => group.conditions.length > 0)
}

function cloneTableFilter(filter: TableFilterSpec): TableFilterSpec {
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

function toComparableFilter(filter: TableFilterSpec) {
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

const FILTER_JOIN_LABEL: Record<FilterJoin, string> = {
  all: 'AND',
  any: 'OR',
}

// เนโ€โฌเนโ€โฌ Drop Zone Target เนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌ

function SettingsBar({
  settings, onChange,
}: {
  settings: GlobalSettings
  onChange: (patch: Partial<GlobalSettings>) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border
          ${open ? 'bg-[#1F4E78] text-white border-[#1F4E78]' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700'}`}
      >
        <Settings2 className="w-3.5 h-3.5" />
        Output Options
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-72">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
              Output Options <span className="text-blue-500 font-normal normal-case">(ใช้กับทุก Table)</span>
            </p>

            <div className="flex gap-5 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.showCount}
                  onChange={e => onChange({ showCount: e.target.checked })}
                  className="w-4 h-4 accent-[#1F4E78]" />
                <span className="text-sm text-gray-700">Count (N)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.showPercent}
                  onChange={e => onChange({ showPercent: e.target.checked })}
                  className="w-4 h-4 accent-[#1F4E78]" />
                <span className="text-sm text-gray-700">Percentage (%)</span>
              </label>
            </div>

            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={settings.hideZeroRows}
                onChange={e => onChange({ hideZeroRows: e.target.checked })}
                className="w-4 h-4 accent-[#1F4E78]"
              />
              <span className="text-sm text-gray-700">Hide zero rows</span>
            </label>

            {settings.showPercent && (
              <div className="flex gap-3 flex-wrap">
                {(['row', 'column', 'total'] as PercentType[]).map(pt => (
                  <label key={pt} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="global-pct"
                      checked={settings.percentType === pt}
                      onChange={() => onChange({ percentType: pt })}
                      className="w-4 h-4 accent-[#1F4E78]" />
                    <span className="text-sm text-gray-700">
                      {pt === 'row' ? 'Row %' : pt === 'column' ? 'Column %' : 'Total %'}
                    </span>
                  </label>
                ))}
              </div>
            )}

                        <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-[10px] text-gray-400">การเปลี่ยน settings จะมีผลกับ Table ที่ Run ใหม่เท่านั้น</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// เนโ€โฌเนโ€โฌ Main App เนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌเนโ€โฌ

export default function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [landingLang, setLandingLang] = useState<'th' | 'en'>('th')
  const [dataset, setDataset] = useState<SavDataset | null>(null)
  const [lightLoadMode, setLightLoadMode] = useState(false)
  const [customMrsets, setCustomMrsets] = useState<MrsetDefinition[]>([])
  const [loading, setLoading] = useState(false)
  const [loadPhase, setLoadPhase] = useState<'variables' | 'cases' | null>(null)
  const [loadPct, setLoadPct] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Global settings
  const [settings, setSettings] = useState<GlobalSettings>({
    showCount: true, showPercent: true, percentType: 'column', hideZeroRows: false,
  })

  const [tables, setTables] = useState<TableDef[]>([newTable(1)])
  const [activeTableId, setActiveTableId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'design' | 'filter' | 'results'>('design')
  const [exporting, setExporting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [lastSelectedTableId, setLastSelectedTableId] = useState<string | null>(null)
  const [quickAddTarget, setQuickAddTarget] = useState<QuickAddTarget>('side')
  const [runningAll, setRunningAll] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(236)
  const [sidebarResizing, setSidebarResizing] = useState(false)
  const [variableOverrides, setVariableOverrides] = useState<Record<string, VariableOverride>>({})
  const [editingVariableName, setEditingVariableName] = useState<string | null>(null)
  const [variableEditorRows, setVariableEditorRows] = useState<VariableEditorRow[]>([])
  const [selectedVariableRowKeys, setSelectedVariableRowKeys] = useState<string[]>([])
  const [lastSelectedVariableIndex, setLastSelectedVariableIndex] = useState<number | null>(null)
  const [selectedVariableNames, setSelectedVariableNames] = useState<Set<string>>(new Set())
  const [lastSelectedVariableName, setLastSelectedVariableName] = useState<string | null>(null)
  const [tableContextMenu, setTableContextMenu] = useState<{ x: number; y: number; targetId: string } | null>(null)
  const [copiedTablesBuffer, setCopiedTablesBuffer] = useState<TableDef[]>([])
  const [codeSortDirection, setCodeSortDirection] = useState<'asc' | 'desc'>('asc')
  const [editingVariableLabelKey, setEditingVariableLabelKey] = useState<string | null>(null)
  const [selectedNumericStats, setSelectedNumericStats] = useState<NumericStat[]>(['mean'])
  const [variableGroups, setVariableGroups] = useState<VariableNetGroup[]>([])
  const [variableContextMenu, setVariableContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showScalePresetDialog, setShowScalePresetDialog] = useState(false)
  const [selectedScalePreset, setSelectedScalePreset] = useState<ScaleSummaryPresetType | null>(null)
  const [showNetNameDialog, setShowNetNameDialog] = useState(false)
  const [pendingNetName, setPendingNetName] = useState('UPC')
  const [openHeaderMenu, setOpenHeaderMenu] = useState<'workspace' | 'tables' | 'batch' | null>(null)
  const [pendingSourceDataset, setPendingSourceDataset] = useState<SourceDatasetSetting | null>(null)
  const [pendingSourceIntent, setPendingSourceIntent] = useState<'match' | 'rebind'>('match')
  const [currentSettingsHandle, setCurrentSettingsHandle] = useState<FileSystemFileHandle | null>(null)
  const [currentSourceMappings, setCurrentSourceMappings] = useState<SourceMappingEntry[]>([])
  const [settingsReadonly, setSettingsReadonly] = useState(false)
  const [settingsReadonlyLock, setSettingsReadonlyLock] = useState<SettingsLockInfo | null>(null)
  const [loadedSettingsName, setLoadedSettingsName] = useState<string | null>(null)
  const [settingsLockReleased, setSettingsLockReleased] = useState(false)

  // Folders
  const [folders, setFolders] = useState<FolderDef[]>([])

  /** Variables being dragged from the catalog (multi-select => all selected, in list order) */
  const dragVarsRef = useRef<string[]>([])
  const dragTableRef = useRef<string | null>(null)
  const loadSettingsInputRef = useRef<HTMLInputElement>(null)
  const batchSettingsInputRef = useRef<HTMLInputElement>(null)
  const pendingSettingsRestoreRef = useRef<AllSettings | null>(null)

  // โ”€โ”€ Batch export flow โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
  const {
    batchExporting,
    batchElapsedMs,
    batchExportSummary,
    beginBatchExport,
    completeBatchExport,
    endBatchExportSession,
    dismissBatchExportSummary,
  } = useBatchExportFlow()

  // โ”€โ”€ Derived / memoized โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

  const variableCatalog = useMemo(() => {
    if (!dataset) return null
    return buildVariableCatalog(dataset.variables, customMrsets, lightLoadMode ? [] : dataset.cases)
  }, [dataset, customMrsets, lightLoadMode])

  const activeTable = useMemo(
    () => tables.find(t => t.id === activeTableId) ?? null,
    [tables, activeTableId],
  )

  const editingTableIds = useMemo(() => {
    if (!activeTableId) return []
    return [...new Set([activeTableId, ...selectedIds])]
  }, [activeTableId, selectedIds])

  const editingTables = useMemo(() => {
    const idSet = new Set(editingTableIds)
    return tables.filter(table => idSet.has(table.id))
  }, [editingTableIds, tables])

  const filterMismatchTableNames = useMemo(() => {
    if (!activeTable || editingTables.length <= 1) return []
    const activeSignature = JSON.stringify(toComparableFilter(activeTable.filter))
    return editingTables
      .filter(table => table.id !== activeTable.id)
      .filter(table => JSON.stringify(toComparableFilter(table.filter)) !== activeSignature)
      .map(table => table.name)
  }, [activeTable, editingTables])

  const editingVariableItem = useMemo(() => {
    if (!editingVariableName || !variableCatalog) return null
    return variableCatalog.byName.get(editingVariableName) ?? null
  }, [editingVariableName, variableCatalog])

  const editingVariableBase = useMemo(() => {
    if (!editingVariableName || !variableCatalog || !dataset) return 0
    const grouped = variableCatalog.groupedByName.get(editingVariableName)
    if (grouped) {
      return getGroupedBaseCount(grouped, dataset.cases)
    }
    const varItem = variableCatalog.byName.get(editingVariableName)
    if (!varItem) return 0
    const override = variableOverrides[editingVariableName]
    const order = override?.order ?? []
    return dataset.cases.filter(c => {
      const raw = c[editingVariableName]
      const code = normalizeCode(raw)
      if (!code) return false
      if (order.length > 0) return order.includes(code)
      return true
    }).length
  }, [editingVariableName, variableCatalog, dataset, variableOverrides])

  const codeEditorRows = useMemo(
    () => variableEditorRows.filter(r => r.rowKind === 'code' || r.rowKind == null),
    [variableEditorRows],
  )

  const firstSelectedVariableIndex = useMemo(() => {
    if (selectedVariableRowKeys.length === 0) return -1
    return codeEditorRows.findIndex(r => r.key === selectedVariableRowKeys[0])
  }, [selectedVariableRowKeys, codeEditorRows])

  const lastSelectedVariableRowIndex = useMemo(() => {
    if (selectedVariableRowKeys.length === 0) return -1
    const last = selectedVariableRowKeys[selectedVariableRowKeys.length - 1]
    return codeEditorRows.findIndex(r => r.key === last)
  }, [selectedVariableRowKeys, codeEditorRows])

  const selectedRowsInGroups = useMemo(() => {
    return selectedVariableRowKeys.some(key =>
      variableGroups.some(g => g.members.includes(key)),
    )
  }, [selectedVariableRowKeys, variableGroups])

  const canRun = useMemo(() => {
    if (!activeTable) return false
    return !!(activeTable.rowVar || activeTable.colVar)
  }, [activeTable])

  // โ”€โ”€ Helper functions โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

  function rebuildVariableEditorRows(
    codeRows: VariableEditorRow[],
    groups: VariableNetGroup[],
  ): VariableEditorRow[] {
    const override = editingVariableName ? variableOverrides[editingVariableName] : null
    const summaries = override?.summaries ?? []
    return buildVariableEditorRowsWithSummaries(codeRows, groups, summaries)
  }

  function isNumericVariable(name: string | null): boolean {
    if (!name || !variableCatalog) return false
    const item = variableCatalog.byName.get(name)
    if (!item) return false
    return !item.isString && Object.keys(item.valueLabels).length === 0
  }

  // โ”€โ”€ Label / tone helpers โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

  const getVarLabel = useCallback(
    (name: string) => {
      if (!variableCatalog) return name
      const item = variableCatalog.byName.get(name)
      if (!item) return name
      return item.label || item.longName || item.name
    },
    [variableCatalog],
  )

  const getVarTone = useCallback(
    (name: string): { badge: string; cls: string } => {
      if (!variableCatalog) return { badge: 'SA', cls: 'bg-blue-100 text-blue-700 border border-blue-300' }
      const item = variableCatalog.byName.get(name)
      if (!item) return { badge: 'SA', cls: 'bg-blue-100 text-blue-700 border border-blue-300' }
      if (item.isGroupedMA) return { badge: 'MA', cls: 'bg-emerald-100 text-emerald-700 border border-emerald-300' }
      if (item.isString) return { badge: 'A', cls: 'bg-amber-100 text-amber-700 border border-amber-300' }
      if (Object.keys(item.valueLabels).length === 0) return { badge: '#', cls: 'bg-gray-100 text-gray-500 border border-gray-300' }
      return { badge: 'SA', cls: 'bg-blue-100 text-blue-700 border border-blue-300' }
    },
    [variableCatalog],
  )

  const getFilterFieldMeta = useCallback(
    (name: string): FilterFieldMeta => {
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
    },
    [variableCatalog],
  )

  // โ”€โ”€ Effects โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

  useEffect(() => {
    if (!activeTableId && tables.length > 0) {
      setActiveTableId(tables[0].id)
    }
  }, [tables, activeTableId])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!sidebarResizing) return
    const onMove = (e: MouseEvent) => {
      setSidebarWidth(w => Math.max(160, Math.min(480, w + e.movementX)))
    }
    const onUp = () => setSidebarResizing(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [sidebarResizing])

  useEffect(() => {
    if (!tableContextMenu) return
    const dismiss = () => setTableContextMenu(null)
    window.addEventListener('click', dismiss, { once: true })
    return () => window.removeEventListener('click', dismiss)
  }, [tableContextMenu])

  useEffect(() => {
    if (!variableContextMenu) return
    const dismiss = () => setVariableContextMenu(null)
    window.addEventListener('click', dismiss, { once: true })
    return () => window.removeEventListener('click', dismiss)
  }, [variableContextMenu])

  // โ”€โ”€ File loading โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

  const loadFile = useCallback(async (file: File, handle?: FileSystemFileHandle) => {
    setLoading(true)
    setLoadPhase('variables')
    setLoadPct(0)
    setError(null)
    try {
      const isLight = file.size > LIGHT_LOAD_THRESHOLD_BYTES
      setLightLoadMode(isLight)
      const parsed = await parseSav(file, {
        onProgress: (phase, pct) => {
          setLoadPhase(phase as 'variables' | 'cases')
          setLoadPct(pct)
        },
        lightMode: isLight,
      })
      const labeled = applyValueLabels(parsed)
      if (handle) {
        rememberSavFileHandle(handle)
      }
      setDataset(labeled)
      setShowLanding(false)
      setError(null)

      if (pendingSettingsRestoreRef.current) {
        const allSettings = pendingSettingsRestoreRef.current
        pendingSettingsRestoreRef.current = null

        const { restoreAllSettings } = await loadSettingsIOModule()
        const restored = restoreAllSettings(allSettings, labeled, pendingSourceIntent, currentSourceMappings)
        setTables(restored.tables.map((t, idx) => ({ ...newTable(idx + 1, t.folderId), ...t })))
        setFolders(restored.folders ?? [])
        setSettings(s => ({ ...s, ...restored.output }))
        setVariableOverrides(restored.variableOverrides ?? {})
        setCustomMrsets(restored.customMrsets ?? [])
        setCurrentSourceMappings(restored.sourceMappings ?? [])
        setActiveTableId(restored.tables[0]?.id ?? '')
        setActiveTab('design')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
      setLoadPhase(null)
      setLoadPct(0)
    }
  }, [pendingSourceIntent, currentSourceMappings])

  const openSavFile = useCallback(async () => {
    try {
      if (supportsFileSystemAccess()) {
        const result = await pickSavFileViaSystem()
        if (!result) return
        await loadFile(result.file, result.handle)
      } else {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.sav'
        input.onchange = async () => {
          const file = input.files?.[0]
          if (file) await loadFile(file)
        }
        input.click()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [loadFile])

  const { getRootProps: getLandingDropProps, getInputProps: getLandingInputProps, isDragActive: isLandingDragActive } = useDropzone({
    onDrop: (files: File[]) => {
      const file = files[0]
      if (file) loadFile(file)
    },
    accept: { 'application/octet-stream': ['.sav'] },
    noClick: false,
    multiple: false,
  })

  const handleFileDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (file) loadFile(file)
  }, [loadFile])

  // โ”€โ”€ Table operations โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

  const addTable = useCallback((folderId: string | null = null) => {
    const idx = tables.length + 1
    const t = newTable(idx, folderId)
    setTables(prev => [...prev, t])
    setActiveTableId(t.id)
    setLastSelectedTableId(t.id)
  }, [tables.length])

  const createTablesFromVariables = useCallback((names: Iterable<string>, folderId: string | null = null) => {
    const uniqueNames = [...new Set(names)].filter(Boolean)
    if (uniqueNames.length === 0) return

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
  }, [variableCatalog])

  const handleTableClick = useCallback((id: string, options?: { shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean }) => {
    setActiveTableId(id)
    setLastSelectedTableId(id)
    if (options?.shiftKey && lastSelectedTableId) {
      const ids = tables.map(t => t.id)
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
  }, [tables, lastSelectedTableId])

  const handleTableDelete = useCallback((id: string) => {
    setTables(prev => {
      const next = prev.filter(t => t.id !== id)
      if (next.length === 0) {
        const t = newTable(1)
        setActiveTableId(t.id)
        return [t]
      }
      if (activeTableId === id) {
        setActiveTableId(next[0].id)
      }
      return next
    })
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next })
  }, [activeTableId])

  const handleTableRename = useCallback((id: string, name: string) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, name } : t))
  }, [])

  const handleTableDuplicate = useCallback((id: string) => {
    setTables(prev => {
      const idx = prev.findIndex(t => t.id === id)
      if (idx < 0) return prev
      const src = prev[idx]
      const dup: TableDef = { ...src, id: crypto.randomUUID(), name: `${src.name} Copy`, result: null }
      const next = [...prev]
      next.splice(idx + 1, 0, dup)
      setActiveTableId(dup.id)
      return next
    })
  }, [])

  const handleTableCopy = useCallback((id: string) => {
    const inSelection = selectedIds.has(id) && selectedIds.size > 1
    if (inSelection) {
      const ordered = tables.filter(t => selectedIds.has(t.id))
      setCopiedTablesBuffer(ordered)
    } else {
      const src = tables.find(t => t.id === id)
      if (src) setCopiedTablesBuffer([src])
    }
  }, [tables, selectedIds])

  const handleTablePasteAfter = useCallback((id: string) => {
    if (copiedTablesBuffer.length === 0) return
    setTables(prev => {
      const idx = prev.findIndex(t => t.id === id)
      const inserts = copiedTablesBuffer.map(t => ({ ...t, id: crypto.randomUUID(), result: null }))
      if (idx < 0) return [...prev, ...inserts]
      return [...prev.slice(0, idx + 1), ...inserts, ...prev.slice(idx + 1)]
    })
  }, [copiedTablesBuffer])

  const handleTableToggleSelect = useCallback((id: string, options?: { shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean }) => {
    if (options?.shiftKey && lastSelectedTableId) {
      const ids = tables.map(t => t.id)
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
  }, [tables, lastSelectedTableId])

  const handleTableContextMenu = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setTableContextMenu({ x: e.clientX, y: e.clientY, targetId: id })
  }, [])

  const handleTableDragStart = useCallback((id: string) => {
    dragTableRef.current = id
  }, [])

  const handleTableDropToRow = useCallback((targetId: string) => {
    const srcId = dragTableRef.current
    if (!srcId || srcId === targetId) return
    setTables(prev => {
      const srcIdx = prev.findIndex(t => t.id === srcId)
      const tgtIdx = prev.findIndex(t => t.id === targetId)
      if (srcIdx < 0 || tgtIdx < 0) return prev
      const next = [...prev]
      const [moved] = next.splice(srcIdx, 1)
      next.splice(tgtIdx, 0, moved)
      return next
    })
    dragTableRef.current = null
  }, [])

  const handleMoveTableToFolder = useCallback((id: string, folderId: string | null) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, folderId } : t))
  }, [])

  // โ”€โ”€ Folder operations โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

  const addFolder = useCallback(() => {
    const folder: FolderDef = { id: crypto.randomUUID(), name: 'New Folder', expanded: true }
    setFolders(prev => [...prev, folder])
  }, [])

  const renameFolder = useCallback((id: string, name: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f))
  }, [])

  const deleteFolder = useCallback((id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id))
    setTables(prev => prev.map(t => t.folderId === id ? { ...t, folderId: null } : t))
  }, [])

  const toggleFolderExpanded = useCallback((id: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, expanded: !f.expanded } : f))
  }, [])

  // โ”€โ”€ Axis operations โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

  const handleDropTop = useCallback((
    mode: 'add' | 'nest',
    target: { branchIndex?: number; placement?: 'before' | 'after'; targetVar?: string | null; folderNames?: string[] },
  ) => {
    const names =
      target.folderNames && target.folderNames.length > 0 ? target.folderNames : dragVarsRef.current
    console.log('[handleDropTop] folderNames=', target.folderNames, 'refNames=', dragVarsRef.current, 'final names=', names)
    if (names.length === 0 || !activeTable) return
    const nestSelected = mode === 'nest' ? (target.targetVar ?? null) : null
    setTables(prev => prev.map(t => {
      if (t.id !== activeTableId) return t
      let spec = parseAxisSpec(t.colVar)
      for (const name of names) {
        spec = insertVarByMode(spec, name, mode, nestSelected)
      }
      return { ...t, colVar: joinAxisSpec(spec) }
    }))
  }, [activeTable, activeTableId])

  const handleDropSide = useCallback((
    mode: 'add' | 'nest',
    target: { branchIndex?: number; placement?: 'before' | 'after'; targetVar?: string | null; folderNames?: string[] },
  ) => {
    const names =
      target.folderNames && target.folderNames.length > 0 ? target.folderNames : dragVarsRef.current
    console.log('[handleDropSide] folderNames=', target.folderNames, 'refNames=', dragVarsRef.current, 'final names=', names)
    if (names.length === 0 || !activeTable) return
    const nestSelected = mode === 'nest' ? (target.targetVar ?? null) : null
    setTables(prev => prev.map(t => {
      if (t.id !== activeTableId) return t
      let spec = parseAxisSpec(t.rowVar)
      for (const name of names) {
        spec = insertVarByMode(spec, name, mode, nestSelected)
      }
      return { ...t, rowVar: joinAxisSpec(spec) }
    }))
  }, [activeTable, activeTableId])

  const handleRemoveTop = useCallback((name: string, occurrence?: { branchIndex: number; itemIndex: number }) => {
    setTables(prev => prev.map(t => {
      if (t.id !== activeTableId) return t
      const spec = parseAxisSpec(t.colVar)
      const next = removeVarFromAxis(spec, name, occurrence)
      return { ...t, colVar: joinAxisSpec(next) }
    }))
  }, [activeTableId])

  const handleRemoveSide = useCallback((name: string, occurrence?: { branchIndex: number; itemIndex: number }) => {
    setTables(prev => prev.map(t => {
      if (t.id !== activeTableId) return t
      const spec = parseAxisSpec(t.rowVar)
      const next = removeVarFromAxis(spec, name, occurrence)
      return { ...t, rowVar: joinAxisSpec(next) }
    }))
  }, [activeTableId])

  const handleReorderTop = useCallback((
    source: { branchIndex: number; itemIndex: number },
    target: { branchIndex: number; itemIndex: number; placement?: 'before' | 'after' },
  ) => {
    setTables(prev => prev.map(t => {
      if (t.id !== activeTableId) return t
      const spec = parseAxisSpec(t.colVar)
      const next = moveAxisOccurrenceToTarget(spec, source, target)
      return { ...t, colVar: joinAxisSpec(next) }
    }))
  }, [activeTableId])

  const handleReorderSide = useCallback((
    source: { branchIndex: number; itemIndex: number },
    target: { branchIndex: number; itemIndex: number; placement?: 'before' | 'after' },
  ) => {
    setTables(prev => prev.map(t => {
      if (t.id !== activeTableId) return t
      const spec = parseAxisSpec(t.rowVar)
      const next = moveAxisOccurrenceToTarget(spec, source, target)
      return { ...t, rowVar: joinAxisSpec(next) }
    }))
  }, [activeTableId])

  const handleMoveTopUp = useCallback((name: string) => {
    setTables(prev => prev.map(t => {
      if (t.id !== activeTableId) return t
      const spec = parseAxisSpec(t.colVar)
      const next = moveVarInAxis(spec, name, -1)
      return { ...t, colVar: joinAxisSpec(next) }
    }))
  }, [activeTableId])

  const handleMoveTopDown = useCallback((name: string) => {
    setTables(prev => prev.map(t => {
      if (t.id !== activeTableId) return t
      const spec = parseAxisSpec(t.colVar)
      const next = moveVarInAxis(spec, name, 1)
      return { ...t, colVar: joinAxisSpec(next) }
    }))
  }, [activeTableId])

  const handleMoveSideUp = useCallback((name: string) => {
    setTables(prev => prev.map(t => {
      if (t.id !== activeTableId) return t
      const spec = parseAxisSpec(t.rowVar)
      const next = moveVarInAxis(spec, name, -1)
      return { ...t, rowVar: joinAxisSpec(next) }
    }))
  }, [activeTableId])

  const handleMoveSideDown = useCallback((name: string) => {
    setTables(prev => prev.map(t => {
      if (t.id !== activeTableId) return t
      const spec = parseAxisSpec(t.rowVar)
      const next = moveVarInAxis(spec, name, 1)
      return { ...t, rowVar: joinAxisSpec(next) }
    }))
  }, [activeTableId])

  const handleClearTop = useCallback(() => {
    setTables(prev => prev.map(t => t.id === activeTableId ? { ...t, colVar: null } : t))
  }, [activeTableId])

  const handleClearSide = useCallback(() => {
    setTables(prev => prev.map(t => t.id === activeTableId ? { ...t, rowVar: null } : t))
  }, [activeTableId])

  // โ”€โ”€ Table name โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

  const handleUpdateTableName = useCallback((name: string) => {
    setTables(prev => prev.map(t => t.id === activeTableId ? { ...t, name } : t))
  }, [activeTableId])

  // โ”€โ”€ Filter operations โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

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
  }, [activeTableId, selectedIds])

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
    applyFilterToEditingTables(() => emptyTableFilter())
  }, [applyFilterToEditingTables])

  const handleDropFilterVariable = useCallback((groupId?: string | null, folderNames?: string[] | null) => {
    const names =
      folderNames && folderNames.length > 0 ? folderNames : dragVarsRef.current
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
        nextFilter.groups = nextFilter.groups.map(g =>
          g.id === groupId ? { ...g, conditions: [...g.conditions, ...newConditions] } : g,
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
  }, [applyFilterToEditingTables])

  const handleUpdateGroupJoin = useCallback((groupId: string, join: FilterJoin) => {
    applyFilterToEditingTables(filter => ({
      ...filter,
      groups: filter.groups.map(g => g.id === groupId ? { ...g, join } : g),
    }))
  }, [applyFilterToEditingTables])

  const handleRemoveGroup = useCallback((groupId: string) => {
    applyFilterToEditingTables(filter => ({
      ...filter,
      groups: filter.groups.filter(g => g.id !== groupId),
    }))
  }, [applyFilterToEditingTables])

  const handleUpdateCondition = useCallback((groupId: string, conditionId: string, patch: Partial<TableFilterCondition>) => {
    applyFilterToEditingTables(filter => ({
      ...filter,
      groups: filter.groups.map(g =>
        g.id === groupId
          ? { ...g, conditions: g.conditions.map(c => c.id === conditionId ? { ...c, ...patch } : c) }
          : g,
      ),
    }))
  }, [applyFilterToEditingTables])

  const handleRemoveCondition = useCallback((groupId: string, conditionId: string) => {
    applyFilterToEditingTables(filter => ({
      ...filter,
      groups: filter.groups.map(g =>
        g.id === groupId
          ? { ...g, conditions: g.conditions.filter(c => c.id !== conditionId) }
          : g,
      ),
    }))
  }, [applyFilterToEditingTables])

  // โ”€โ”€ Run / export โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

  const runTable = useCallback(async (tableId: string) => {
    if (!dataset || !variableCatalog) return
    const table = tables.find(t => t.id === tableId)
    if (!table) return

    let filteredCases = dataset.cases
    if (hasActiveFilter(table.filter)) {
      const runtime = {
        getValueKeys: (varName: string, rawCase: Record<string, string | number>) => {
          const grouped = variableCatalog.groupedByName.get(varName)
          if (grouped) {
            return grouped.options.map(opt => {
              const raw = rawCase[opt.memberName]
              return normalizeCode(raw)
            }).filter(Boolean)
          }
          return [normalizeCode(rawCase[varName])].filter(Boolean)
        },
        getTextValue: (varName: string, rawCase: Record<string, string | number>) => {
          const val = rawCase[varName]
          return val == null ? '' : String(val)
        },
        getNumericValue: (varName: string, rawCase: Record<string, string | number>) => {
          const val = rawCase[varName]
          const num = Number(val)
          return Number.isFinite(num) ? num : null
        },
      }
      filteredCases = dataset.cases.filter(rawCase => {
        const labeled = Object.fromEntries(Object.entries(rawCase).map(([k, v]) => [k, String(v)]))
        return evaluateFilterSpec(table.filter, rawCase, labeled, runtime)
      })
    }

    const colSpec = parseAxisSpec(table.colVar)
    const rowSpec = parseAxisSpec(table.rowVar)
    const colVars = flattenAxisSpec(colSpec)
    const rowVars = flattenAxisSpec(rowSpec)

    // Check if any variable is a grouped MA
    const allVars = [...new Set([...colVars, ...rowVars])]
    const hasGrouped = allVars.some(v => variableCatalog.groupedByName.has(v))

    let result
    if (hasGrouped) {
      result = await computeGroupedCrosstabAsync(
        filteredCases,
        colSpec,
        rowSpec,
        variableCatalog,
        variableOverrides,
        settings,
      )
    } else {
      result = await computeCrosstabAsync(filteredCases, colSpec, rowSpec, variableCatalog, variableOverrides, settings)
    }

    setTables(prev => prev.map(t => t.id === tableId ? { ...t, result } : t))
  }, [dataset, variableCatalog, tables, variableOverrides, settings])

  const runAllTables = useCallback(async () => {
    if (!dataset || !variableCatalog || runningAll) return
    setRunningAll(true)
    try {
      let count = 0
      for (const table of tables) {
        if (!table.rowVar && !table.colVar) continue
        await runTable(table.id)
        count++
        if (count % BATCH_YIELD_EVERY === 0) await yieldToBrowser()
      }
    } finally {
      setRunningAll(false)
    }
  }, [dataset, variableCatalog, tables, runningAll, runTable])

  const handleGenerate = useCallback(() => {
    if (activeTableId) runTable(activeTableId)
  }, [activeTableId, runTable])

  const handleExportTable = useCallback(async () => {
    if (!activeTable?.result || !dataset) return
    setExporting(true)
    try {
      const { exportTableToExcel } = await loadExcelExportModule()
      await exportTableToExcel(activeTable, dataset, variableOverrides, settings)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setExporting(false)
    }
  }, [activeTable, dataset, variableOverrides, settings])

  // โ”€โ”€ Settings โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

  const handleSaveSettings = useCallback(async () => {
    try {
      const { buildAllSettings, exportSettingsToExcel } = await loadSettingsIOModule()
      const allSettings = buildAllSettings({
        tables,
        folders,
        settings,
        variableOverrides,
        customMrsets,
        currentSourceMappings,
        dataset,
        settingsReadonly,
        settingsLockReleased,
        currentSettingsHandle,
        loadedSettingsName,
      })
      if (currentSettingsHandle && !settingsReadonly) {
        await saveSettingsToFileHandle(currentSettingsHandle, allSettings)
        setToast('Settings saved')
      } else {
        await exportSettingsToExcel(allSettings, loadedSettingsName ?? 'crossify-settings')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [tables, folders, settings, variableOverrides, customMrsets, currentSourceMappings, dataset, settingsReadonly, settingsLockReleased, currentSettingsHandle, loadedSettingsName])

  const handleLoadSettingsFile = useCallback(async (file: File, handle?: FileSystemFileHandle) => {
    try {
      const { parseSettingsFromExcel } = await loadSettingsIOModule()
      const allSettings = await parseSettingsFromExcel(file)

      if (allSettings.sourceDataset && !dataset) {
        pendingSettingsRestoreRef.current = allSettings
        if (handle) {
          setCurrentSettingsHandle(handle)
          setLoadedSettingsName(file.name.replace(/\.xlsx$/i, ''))
        }
        const restored = await restoreSavFileFromSource(allSettings.sourceDataset, allSettings.sourceMappings ?? [])
        if (restored) {
          setPendingSourceDataset(null)
          await loadFile(restored.file, restored.handle)
        } else {
          setPendingSourceDataset(allSettings.sourceDataset)
          setPendingSourceIntent('match')
        }
        return
      }

      const { restoreAllSettings } = await loadSettingsIOModule()
      const restored = restoreAllSettings(allSettings, dataset, 'match', currentSourceMappings)
      setTables(restored.tables.map((t, idx) => ({ ...newTable(idx + 1, t.folderId), ...t })))
      setFolders(restored.folders ?? [])
      setSettings(s => ({ ...s, ...restored.output }))
      setVariableOverrides(restored.variableOverrides ?? {})
      setCustomMrsets(restored.customMrsets ?? [])
      setCurrentSourceMappings(restored.sourceMappings ?? [])
      if (handle) {
        setCurrentSettingsHandle(handle)
        setLoadedSettingsName(file.name.replace(/\.xlsx$/i, ''))
        setSettingsReadonly(allSettings.activeLock?.status === 'ACTIVE' && allSettings.activeLock.sessionId !== getSettingsSessionId())
        setSettingsReadonlyLock(allSettings.activeLock ?? null)
      }
      setActiveTableId(restored.tables[0]?.id ?? '')
      setActiveTab('design')
      setToast('Settings loaded')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [dataset, currentSourceMappings, loadFile])

  const handleBatchExportFiles = useCallback(async (files: FileList) => {
    if (!dataset) return
    const startedAt = beginBatchExport()
    let successCount = 0
    let skippedCount = 0
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          const { parseSettingsFromExcel, restoreAllSettings } = await loadSettingsIOModule()
          const allSettings = await parseSettingsFromExcel(file)
          const restored = restoreAllSettings(allSettings, dataset, 'match', currentSourceMappings)
          if (restored.tables.length === 0) { skippedCount++; continue }
          const restoredTables = restored.tables.map((t, idx) => ({ ...newTable(idx + 1, t.folderId), ...t }))
          const ranTables = []
          for (const table of restoredTables) {
            if (!table.rowVar && !table.colVar) { ranTables.push(table); continue }
            let filteredCases = dataset.cases
            if (hasActiveFilter(table.filter)) {
              filteredCases = dataset.cases.filter(rawCase => {
                const labeled = Object.fromEntries(Object.entries(rawCase).map(([k, v]) => [k, String(v)]))
                const runtime = {
                  getValueKeys: (varName: string, rc: Record<string, string | number>) => [normalizeCode(rc[varName])].filter(Boolean),
                  getTextValue: (varName: string, rc: Record<string, string | number>) => String(rc[varName] ?? ''),
                  getNumericValue: (varName: string, rc: Record<string, string | number>) => { const n = Number(rc[varName]); return Number.isFinite(n) ? n : null },
                }
                return evaluateFilterSpec(table.filter, rawCase, labeled, runtime)
              })
            }
            const colSpec = parseAxisSpec(table.colVar)
            const rowSpec = parseAxisSpec(table.rowVar)
            const result = await computeCrosstabAsync(filteredCases, colSpec, rowSpec, variableCatalog, restored.variableOverrides ?? {}, { ...settings, ...restored.output })
            ranTables.push({ ...table, result })
            await yieldToBrowser()
          }
          const { exportAllTablesToExcel } = await loadExcelExportModule()
          const settingsName = file.name.replace(/\.xlsx$/i, '')
          await exportAllTablesToExcel(ranTables, dataset, restored.variableOverrides ?? {}, { ...settings, ...restored.output }, settingsName)
          successCount++
        } catch {
          skippedCount++
        }
      }
    } finally {
      const elapsedMs = Date.now() - startedAt
      completeBatchExport({ successCount, skippedCount, elapsedMs })
      endBatchExportSession()
    }
  }, [dataset, currentSourceMappings, variableCatalog, settings, beginBatchExport, completeBatchExport, endBatchExportSession])

  // โ”€โ”€ Variable editor โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

  const openVariableEditor = useCallback((name: string) => {
    if (!variableCatalog || !dataset) return
    const item = variableCatalog.byName.get(name)
    if (!item) return
    const override = variableOverrides[name]
    const grouped = variableCatalog.groupedByName.get(name)
    let baseRows: VariableEditorRow[]
    if (grouped) {
      const selections = getGroupedSelections(grouped, override)
      baseRows = grouped.options.map((opt, idx) => ({
        key: opt.memberName,
        code: String(idx + 1),
        label: opt.label,
        count: dataset.cases.filter(c => {
          const raw = c[opt.memberName]
          const code = normalizeCode(raw)
          return opt.selectedCodes ? [...opt.selectedCodes].includes(code) : code === '1'
        }).length,
        percent: 0,
        factor: override?.weights?.[opt.memberName] ?? '',
        rowKind: 'code' as const,
      }))
    } else {
      const rawCodes = [...new Set(dataset.cases.map(c => normalizeCode(c[name])).filter(Boolean))]
      const labelMap = item.valueLabels
      const existingOrder = override?.order ?? []
      // ตัวแปร numeric (#) = ไม่ใช่ string และไม่มี value labels → บังคับเรียง code น้อย→มากเสมอ
      const isNumeric = !item.isString && Object.keys(labelMap).length === 0
      const allCodes = isNumeric
        ? [...rawCodes].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
        : existingOrder.length > 0
          ? [...existingOrder, ...rawCodes.filter(c => !existingOrder.includes(c))]
          : rawCodes.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      const total = dataset.cases.filter(c => normalizeCode(c[name])).length
      baseRows = allCodes.map(code => {
        const count = dataset.cases.filter(c => normalizeCode(c[name]) === code).length
        return {
          key: code,
          code,
          label: override?.labels?.[code] ?? (labelMap[code] ? `${code}. ${labelMap[code]}` : code),
          count,
          percent: total > 0 ? (count / total) * 100 : 0,
          factor: override?.weights?.[code] ?? '',
          rowKind: 'code' as const,
        }
      })
    }
    const groups = override?.groups ?? []
    const summaries = override?.summaries ?? []
    const editorRows = buildVariableEditorRowsWithSummaries(baseRows, groups, summaries)
    setVariableEditorRows(editorRows)
    setVariableGroups(groups)
    setSelectedNumericStats(override?.numericStats ?? ['mean'])
    setSelectedScalePreset(override?.summaryPreset ?? null)
    setSelectedVariableRowKeys([])
    setLastSelectedVariableIndex(null)
    setEditingVariableName(name)
  }, [variableCatalog, dataset, variableOverrides])

  const saveVariableEditor = useCallback((name: string, rows: VariableEditorRow[]) => {
    const codeRows = rows.filter(r => r.rowKind === 'code' || r.rowKind == null)
    const weights: Record<string, string> = {}
    const labels: Record<string, string> = {}
    codeRows.forEach(r => {
      if (r.factor) weights[r.key] = r.factor
      labels[r.key] = r.label
    })
    const summaryRows = rows.filter(r => r.rowKind === 'summary').map(r => ({
      code: r.code,
      label: r.label,
      members: r.members ?? [],
    }))
    setVariableOverrides(prev => ({
      ...prev,
      [name]: {
        order: codeRows.map(r => r.key),
        weights,
        labels,
        numericStats: selectedNumericStats,
        groups: variableGroups,
        summaries: summaryRows,
        summaryPreset: selectedScalePreset ?? undefined,
      },
    }))
    setEditingVariableName(null)
  }, [selectedNumericStats, variableGroups, selectedScalePreset])

  const toggleCodeSort = useCallback(() => {
    setCodeSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    setVariableEditorRows(prev => {
      const codeRows = prev.filter(r => r.rowKind === 'code' || r.rowKind == null)
      const sorted = [...codeRows].sort((a, b) => {
        const cmp = a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' })
        return codeSortDirection === 'asc' ? cmp : -cmp
      })
      return rebuildVariableEditorRows(sorted, variableGroups)
    })
  }, [codeSortDirection, variableGroups])

  const handleVariableRowClick = useCallback((key: string, shiftKey: boolean) => {
    const idx = codeEditorRows.findIndex(r => r.key === key)
    if (shiftKey && lastSelectedVariableIndex !== null) {
      const from = lastSelectedVariableIndex
      const to = idx
      const range = codeEditorRows.slice(Math.min(from, to), Math.max(from, to) + 1).map(r => r.key)
      setSelectedVariableRowKeys(prev => [...new Set([...prev, ...range])])
    } else {
      setSelectedVariableRowKeys(prev => {
        if (prev.includes(key)) return prev.filter(k => k !== key)
        return [...prev, key]
      })
      setLastSelectedVariableIndex(idx)
    }
  }, [codeEditorRows, lastSelectedVariableIndex])

  const createVariableNetGroup = useCallback(() => {
    setVariableContextMenu(null)
    if (selectedVariableRowKeys.length === 0) return
    setPendingNetName('UPC')
    setShowNetNameDialog(true)
  }, [selectedVariableRowKeys])

  const removeVariableNetGroup = useCallback((groupId: string) => {
    setVariableGroups(prev => prev.filter(g => g.id !== groupId))
    setVariableEditorRows(prev => rebuildVariableEditorRows(prev.filter(r => r.rowKind === 'code' || r.rowKind == null), variableGroups.filter(g => g.id !== groupId)))
  }, [variableGroups])

  const removeSelectedCodesFromGroups = useCallback(() => {
    setVariableContextMenu(null)
    const keys = new Set(selectedVariableRowKeys)
    setVariableGroups(prev => prev.map(g => ({
      ...g,
      members: g.members.filter(m => !keys.has(m)),
    })).filter(g => g.members.length > 0))
    setVariableEditorRows(prev => {
      const nextGroups = variableGroups.map(g => ({
        ...g,
        members: g.members.filter(m => !keys.has(m)),
      })).filter(g => g.members.length > 0)
      return rebuildVariableEditorRows(prev.filter(r => r.rowKind === 'code' || r.rowKind == null), nextGroups)
    })
  }, [selectedVariableRowKeys, variableGroups])

  const confirmVariableNetGroup = useCallback(() => {
    const name = pendingNetName.trim()
    if (!name) return
    const group: VariableNetGroup = {
      id: crypto.randomUUID(),
      name,
      members: [...selectedVariableRowKeys],
    }
    const nextGroups = [...variableGroups, group]
    setVariableGroups(nextGroups)
    setVariableEditorRows(prev => rebuildVariableEditorRows(prev.filter(r => r.rowKind === 'code' || r.rowKind == null), nextGroups))
    setShowNetNameDialog(false)
    setPendingNetName('UPC')
  }, [pendingNetName, selectedVariableRowKeys, variableGroups])

  const applyScaleSummaryPreset = useCallback((preset: ScaleSummaryPresetType) => {
    try {
      const codeRows = variableEditorRows.filter(r => r.rowKind === 'code' || r.rowKind == null)
      const { factors, summaries } = buildScaleSummaryPreset(codeRows, preset)
      const updatedRows = codeRows.map(r => ({
        ...r,
        factor: factors[r.key] ?? r.factor,
        autoFactor: !!factors[r.key],
      }))
      const nextGroups = variableGroups
      const fullRows = buildVariableEditorRowsWithSummaries(updatedRows, nextGroups, summaries)
      setVariableEditorRows(fullRows)
      setSelectedScalePreset(preset)
      setShowScalePresetDialog(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [variableEditorRows, variableGroups])

  // โ”€โ”€ Variable list interactions โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

  const handleVarDragStart = useCallback(
    (name: string) => {
      const list = variableCatalog?.list ?? []
      const ordered = list.map(v => v.name).filter(n => selectedVariableNames.has(n))
      dragVarsRef.current =
        selectedVariableNames.size > 1 && selectedVariableNames.has(name) ? ordered : [name]
    },
    [variableCatalog, selectedVariableNames],
  )

  const handleVarSelect = useCallback((name: string, options?: { shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean }) => {
    if (options?.shiftKey && lastSelectedVariableName) {
      const list = variableCatalog?.list ?? []
      const from = list.findIndex(v => v.name === lastSelectedVariableName)
      const to = list.findIndex(v => v.name === name)
      const range = list.slice(Math.min(from, to), Math.max(from, to) + 1).map(v => v.name)
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
  }, [lastSelectedVariableName, variableCatalog])

  const handleVarClearSelection = useCallback(() => {
    setSelectedVariableNames(new Set())
    setLastSelectedVariableName(null)
  }, [])

  const handleVarQuickAction = useCallback((name: string, target: 'top' | 'side' | 'filter' | 'table') => {
    if (target === 'table') {
      const sourceNames = selectedVariableNames.size > 1 && selectedVariableNames.has(name)
        ? selectedVariableNames
        : [name]
      createTablesFromVariables(sourceNames)
      return
    }
    const list = variableCatalog?.list ?? []
    const orderedForMulti =
      selectedVariableNames.size > 1 && selectedVariableNames.has(name)
        ? list.map(v => v.name).filter(n => selectedVariableNames.has(n))
        : [name]

    if (target === 'top') {
      setTables(prev => prev.map(t => {
        if (t.id !== activeTableId) return t
        let spec = parseAxisSpec(t.colVar)
        for (const n of orderedForMulti) {
          spec = insertVarByMode(spec, n, 'add', null)
        }
        return { ...t, colVar: joinAxisSpec(spec) }
      }))
    } else if (target === 'side') {
      setTables(prev => prev.map(t => {
        if (t.id !== activeTableId) return t
        let spec = parseAxisSpec(t.rowVar)
        for (const n of orderedForMulti) {
          spec = insertVarByMode(spec, n, 'add', null)
        }
        return { ...t, rowVar: joinAxisSpec(spec) }
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
  }, [activeTableId, applyFilterToEditingTables, createTablesFromVariables, selectedVariableNames, variableCatalog])

  // โ”€โ”€ Return JSX โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€

  const activeResult = activeTable?.result ?? null

  const getFilterSummary = (table: TableDef): string | null => {
    if (!hasActiveFilter(table.filter)) return null
    if (table.filter.description) return table.filter.description
    const totalConditions = table.filter.groups.reduce((sum, g) => sum + g.conditions.length, 0)
    if (totalConditions === 0) return null
    return `${totalConditions} condition${totalConditions !== 1 ? 's' : ''}`
  }

  const batchEditCount = selectedIds.size > 1 ? selectedIds.size : undefined
  const filterBatchEditCount = editingTableIds.length > 1 ? editingTableIds.length : undefined

  return (
    <div className="relative">
      {showLanding ? (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(72,127,211,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(31,78,120,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#edf4ff_100%)] text-slate-900">
          <header className="border-b border-[#2A5B89] bg-[#2E5D89] shadow-[0_8px_30px_rgba(25,56,94,0.16)]">
            <div className="mx-auto flex max-w-[1560px] items-center justify-between px-5 py-4">
              <CrossifyLogo size="md" withWordmark />
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-2xl border border-white/20 bg-white/8 p-1">
                  {(['th', 'en'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLandingLang(lang)}
                      className={`rounded-xl px-4 py-2 text-sm font-bold transition ${landingLang === lang ? 'bg-white text-[#1F4E78] shadow-sm' : 'text-white/70 hover:text-white'}`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => loadSettingsInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  <FolderOpen className="h-4 w-4" />
                  {landingLang === 'th' ? 'Load Settings' : 'Load Settings'}
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto grid max-w-[1560px] gap-10 px-6 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <section className="pt-6 lg:pt-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-blue-200/90 bg-white/65 px-5 py-3 text-xs font-black uppercase tracking-[0.35em] text-[#2F6FE4] shadow-[0_10px_25px_rgba(47,111,228,0.08)] backdrop-blur">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4A86FF]" />
                SPSS Crosstab Workspace
              </div>

              <h1 className="mt-10 max-w-4xl text-5xl font-black leading-[1.08] tracking-[-0.04em] text-slate-900 md:text-6xl">
                <span className="text-[#2F6FE4]">Crossify</span>{' '}
                {landingLang === 'th'
                  ? 'ยกระดับการออกแบบตาราง SPSS Crosstab ให้เร็ว ลื่น และชัดเจน'
                  : 'makes SPSS Crosstab design faster, smoother, and clearer'}
              </h1>

              <p className="mt-8 max-w-3xl text-[2rem] leading-8 text-slate-500 md:text-[2.1rem]">
                {landingLang === 'th'
                  ? 'สร้างแกน Top และ Side, จัด Nest ตัวแปรได้ยืดหยุ่น, ดูผลลัพธ์ทันที และ export งานต่อได้จาก workspace เดียวอย่างเป็นระบบ'
                  : 'Build Top and Side axes, nest variables flexibly, preview results instantly, and export everything from one organized workspace.'}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setShowLanding(false)}
                  className="inline-flex items-center gap-3 rounded-3xl bg-[#1F4E78] px-8 py-5 text-lg font-black text-white shadow-[0_16px_36px_rgba(31,78,120,0.28)] transition hover:bg-[#163857]"
                >
                  {landingLang === 'th' ? 'เข้าใช้งานโปรแกรม' : 'Open Workspace'}
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={openSavFile}
                  className="inline-flex items-center gap-3 rounded-3xl border border-blue-200 bg-white/80 px-8 py-5 text-lg font-black text-[#1F4E78] shadow-[0_10px_25px_rgba(47,111,228,0.08)] transition hover:border-blue-300 hover:bg-white"
                >
                  <Upload className="h-5 w-5" />
                  {landingLang === 'th' ? 'โหลดไฟล์ SPSS' : 'Load SPSS File'}
                </button>
              </div>

              <div className="mt-12 rounded-[28px] bg-[linear-gradient(135deg,_#1F4E78_0%,_#2F6FE4_100%)] p-7 text-white shadow-[0_24px_50px_rgba(40,92,167,0.24)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/14">
                      <FolderInput className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-black uppercase tracking-[0.28em] text-blue-100">
                        Batch Export
                      </div>
                      <h2 className="mt-3 text-3xl font-black leading-tight">
                        {landingLang === 'th'
                          ? 'Batch Export ส่งออกทุก Banner พร้อมกันในคลิกเดียว'
                          : 'Batch Export every banner in one click'}
                      </h2>
                      <p className="mt-3 max-w-2xl text-lg leading-8 text-blue-100/92">
                        {landingLang === 'th'
                          ? 'เลือกไฟล์ Setting Banner เข้ามาหลายไฟล์พร้อมกัน ระบบจะรัน Crosstab และ export Excel ให้ครบทุก Banner โดยอัตโนมัติ ไม่ต้องตั้งค่าซ้ำทีละไฟล์'
                          : 'Load multiple banner setting files at once and let Crossify run and export every Excel output automatically.'}
                      </p>
                    </div>
                  </div>
                  <div className="hidden min-w-[150px] flex-col gap-3 lg:flex">
                    {['Banner_A.sav', 'Banner_B.sav', 'Banner_C.sav'].map(name => (
                      <div key={name} className="rounded-2xl bg-white/12 px-4 py-3 text-sm font-semibold text-blue-50">
                        {name}
                      </div>
                    ))}
                    <div className="text-right text-sm font-bold text-emerald-200">3 files exported</div>
                  </div>
                </div>
              </div>

              <div className="mt-12 grid gap-5 md:grid-cols-3">
                <div className="rounded-[28px] border border-blue-100 bg-white/78 p-6 shadow-[0_16px_35px_rgba(34,88,160,0.08)] backdrop-blur">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2F6FE4]">
                    <Play className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-3xl font-black text-slate-900">{landingLang === 'th' ? 'ออกแบบได้ไว' : 'Design Fast'}</h3>
                  <p className="mt-3 text-lg leading-8 text-slate-500">
                    {landingLang === 'th'
                      ? 'จัดแกน Top และ Side พร้อม nested drag-and-drop ได้อย่างยืดหยุ่น'
                      : 'Arrange Top and Side axes with flexible nested drag-and-drop.'}
                  </p>
                </div>

                <div className="rounded-[28px] border border-blue-100 bg-white/78 p-6 shadow-[0_16px_35px_rgba(34,88,160,0.08)] backdrop-blur">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2F6FE4]">
                    <Download className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-3xl font-black text-slate-900">{landingLang === 'th' ? 'ผลลัพธ์ยืดหยุ่น' : 'Flexible Output'}</h3>
                  <p className="mt-3 text-lg leading-8 text-slate-500">
                    {landingLang === 'th'
                      ? 'ดู crosstab ทันทีและ export Excel ได้โดยไม่ต้องออกจาก workflow'
                      : 'Preview crosstabs instantly and export Excel without leaving your workflow.'}
                  </p>
                </div>

                <div className="rounded-[28px] border border-blue-100 bg-white/78 p-6 shadow-[0_16px_35px_rgba(34,88,160,0.08)] backdrop-blur">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2F6FE4]">
                    <Settings2 className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-3xl font-black text-slate-900">{landingLang === 'th' ? 'ปลอดภัยใน Browser' : 'Browser Safe'}</h3>
                  <p className="mt-3 text-lg leading-8 text-slate-500">
                    {landingLang === 'th'
                      ? 'ข้อมูลประมวลผลใน browser เพื่อ workflow ที่ปลอดภัยยิ่งขึ้น'
                      : 'Process data in the browser for a safer day-to-day workflow.'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </section>

            <section className="lg:pt-12">
              <div className="rounded-[40px] border border-white/80 bg-white/70 p-4 shadow-[0_28px_60px_rgba(27,71,137,0.14)] backdrop-blur">
                <div className="rounded-[34px] bg-[#295786] p-7 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                  <div className="rounded-[18px] bg-white/10 px-5 py-4">
                    <div className="mb-5 flex items-center gap-3 text-white/70">
                      <span className="h-3 w-3 rounded-full bg-white/25" />
                      <span className="h-3 w-3 rounded-full bg-white/25" />
                      <span className="h-3 w-3 rounded-full bg-white/25" />
                      <div className="ml-3 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold">crossify - workspace</div>
                    </div>

                    <div className="flex items-center gap-4 border-b border-white/10 pb-5">
                      <CrossifyLogo size="sm" withWordmark />
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                      <div className="rounded-[26px] bg-white/10 p-5">
                        <div className="text-xs font-black uppercase tracking-[0.28em] text-white/55">Top Axis</div>
                        <div className="mt-5 flex flex-wrap gap-3">
                          {['Area', 'Gender', 'Age'].map((item, index) => (
                            <div
                              key={item}
                              className={`rounded-2xl px-4 py-2 text-lg font-bold ${index < 2 ? 'bg-white text-[#295786]' : 'bg-white/15 text-white/55'}`}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[26px] bg-white/10 p-5">
                        <div className="text-xs font-black uppercase tracking-[0.28em] text-white/55">Output</div>
                        <div className="mt-5 space-y-3">
                          <div className="rounded-2xl bg-emerald-400/22 px-4 py-3 text-lg font-bold text-emerald-100">Counts</div>
                          <div className="rounded-2xl bg-emerald-400/22 px-4 py-3 text-lg font-bold text-emerald-100">Percents</div>
                          <div className="rounded-2xl bg-white/12 px-4 py-3 text-lg font-bold text-white/40">Excel Export</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[26px] bg-white/10 p-5">
                      <div className="text-xs font-black uppercase tracking-[0.28em] text-white/55">Preview</div>
                      <div className="mt-5 overflow-hidden rounded-[20px] border border-white/10">
                        <div className="grid grid-cols-4 bg-white/8 px-5 py-3 text-sm font-semibold text-white/60">
                          <div />
                          <div>Male</div>
                          <div>Female</div>
                          <div>Total</div>
                        </div>
                        {[
                          ['Bangkok', '142', '158', '300'],
                          ['Province', '98', '102', '200'],
                        ].map(row => (
                          <div key={row[0]} className="grid grid-cols-4 border-t border-white/10 px-5 py-4 text-sm text-white/80">
                            <div className="font-semibold">{row[0]}</div>
                            <div>{row[1]}</div>
                            <div>{row[2]}</div>
                            <div>{row[3]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[28px] bg-white/82 p-6">
                    <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">{landingLang === 'th' ? 'แนะนำการเริ่มต้น' : 'Getting Started'}</div>
                    <p className="mt-4 text-lg leading-8 text-slate-700">
                      {landingLang === 'th'
                        ? 'เข้า workspace ก่อน แล้วค่อยโหลดไฟล์ .sav จากเมนูด้านบน'
                        : 'Enter the workspace first, then load your .sav file from the top menu.'}
                    </p>
                  </div>
                  <div className="rounded-[28px] bg-white/82 p-6">
                    <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">{landingLang === 'th' ? 'พร้อมใช้ Settings' : 'Settings Ready'}</div>
                    <p className="mt-4 text-lg leading-8 text-slate-700">
                      {landingLang === 'th'
                        ? 'โหลด settings เดิมกลับมาทำงานต่อจากงานที่บันทึกไว้ก็ได้เร็ว'
                        : 'Reload previous settings and continue from where you left off.'}
                    </p>
                  </div>
                </div>
              </div>

              <div
                {...getLandingDropProps()}
                className={`mt-6 rounded-[28px] border-2 border-dashed px-6 py-8 text-center transition ${isLandingDragActive ? 'border-blue-400 bg-blue-50/80' : 'border-blue-200 bg-white/60 hover:border-blue-300 hover:bg-white/75'}`}
              >
                <input {...getLandingInputProps()} />
                <div className="flex flex-col items-center gap-3">
                  <Database className="h-10 w-10 text-[#2F6FE4]" />
                  <p className="text-lg font-semibold text-slate-600">
                    {isLandingDragActive
                      ? (landingLang === 'th' ? 'วางไฟล์ที่นี่' : 'Drop file here')
                      : (landingLang === 'th' ? 'ลากไฟล์ .sav มาวางที่นี่ หรือกดปุ่มโหลดไฟล์ SPSS' : 'Drag and drop a .sav file here or use Load SPSS File')}
                  </p>
                </div>
              </div>
            </section>
          </main>
        </div>
      ) : (
        <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
          {/* Header */}
          <header className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
            <CrossifyLogo size="sm" />
            <span className="text-sm font-black text-[#1F4E78] mr-1">Crossify</span>

            {/* Workspace menu */}
            <div className="relative">
              <button
                onClick={() => setOpenHeaderMenu(prev => prev === 'workspace' ? null : 'workspace')}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
              >
                <Database className="h-3.5 w-3.5" />
                Workspace
                <ChevronDown className="h-3 w-3" />
              </button>
              {openHeaderMenu === 'workspace' && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpenHeaderMenu(null)} />
                  <div className="absolute left-0 top-full z-20 mt-1 w-52 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      onClick={() => { setOpenHeaderMenu(null); openSavFile() }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Open SPSS File
                    </button>
                    <button
                      onClick={() => { setOpenHeaderMenu(null); handleSaveSettings() }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {currentSettingsHandle ? 'Save Settings' : 'Export Settings'}
                      {loadedSettingsName && <span className="ml-auto text-[10px] text-gray-400 truncate max-w-[90px]">{loadedSettingsName}</span>}
                    </button>
                    <button
                      onClick={() => { setOpenHeaderMenu(null); loadSettingsInputRef.current?.click() }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                      Load Settings
                    </button>
                    {settingsReadonly && settingsReadonlyLock && (
                      <div className="mx-2 mt-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-[10px] text-amber-700">
                        Readonly: locked by {settingsReadonlyLock.ownerLabel}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Tables menu */}
            <div className="relative">
              <button
                onClick={() => setOpenHeaderMenu(prev => prev === 'tables' ? null : 'tables')}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
              >
                Tables
                <ChevronDown className="h-3 w-3" />
              </button>
              {openHeaderMenu === 'tables' && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpenHeaderMenu(null)} />
                  <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      onClick={() => { setOpenHeaderMenu(null); addTable() }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Table
                    </button>
                    <button
                      onClick={() => { setOpenHeaderMenu(null); addFolder() }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <Folder className="h-3.5 w-3.5" />
                      Add Folder
                    </button>
                    {selectedIds.size > 0 && (
                      <button
                        onClick={() => {
                          setOpenHeaderMenu(null)
                          const copies = tables
                            .filter(t => selectedIds.has(t.id))
                            .map(t => ({ ...t, id: crypto.randomUUID(), result: null, name: `${t.name} Copy` }))
                          setTables(prev => [...prev, ...copies])
                          setCopiedTablesBuffer(copies)
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Duplicate Selected ({selectedIds.size})
                      </button>
                    )}
                    {selectedIds.size > 0 && (
                      <button
                        onClick={() => {
                          setOpenHeaderMenu(null)
                          selectedIds.forEach(id => handleTableDelete(id))
                          setSelectedIds(new Set())
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Selected ({selectedIds.size})
                      </button>
                    )}
                    {copiedTablesBuffer.length > 0 && (
                      <button
                        onClick={() => {
                          setOpenHeaderMenu(null)
                          const pastes = copiedTablesBuffer.map(t => ({ ...t, id: crypto.randomUUID(), result: null }))
                          setTables(prev => [...prev, ...pastes])
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <ClipboardPaste className="h-3.5 w-3.5" />
                        Paste Tables ({copiedTablesBuffer.length})
                      </button>
                    )}
                    <button
                      onClick={() => { setOpenHeaderMenu(null); runAllTables() }}
                      disabled={runningAll}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Run All Tables
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Batch menu */}
            <div className="relative">
              <button
                onClick={() => setOpenHeaderMenu(prev => prev === 'batch' ? null : 'batch')}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
              >
                Batch
                <ChevronDown className="h-3 w-3" />
              </button>
              {openHeaderMenu === 'batch' && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpenHeaderMenu(null)} />
                  <div className="absolute left-0 top-full z-20 mt-1 w-52 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      onClick={() => { setOpenHeaderMenu(null); batchSettingsInputRef.current?.click() }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <FolderInput className="h-3.5 w-3.5" />
                      Batch Export (Multi-Settings)
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex-1" />

            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-100 p-0.5">
              {(['design', 'filter', 'results'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-colors ${activeTab === tab ? 'bg-white text-[#1F4E78] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <SettingsBar settings={settings} onChange={patch => setSettings(s => ({ ...s, ...patch }))} />

            {/* Export button */}
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void handleExportTable()
              }}
              disabled={!activeResult || exporting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1F4E78] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#173b5c] disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? 'Exporting...' : 'Export'}
            </button>

            {toast && (
              <div className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
                {toast}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Variable sidebar */}
            <div style={{ width: sidebarWidth }} className="flex flex-col border-r border-gray-200 bg-white overflow-hidden flex-shrink-0">
              {variableCatalog && (
                <VirtualVarList
                  variables={variableCatalog.list}
                  onDragStart={handleVarDragStart}
                  onOpen={openVariableEditor}
                  activeTarget={quickAddTarget}
                  selectedNames={selectedVariableNames}
                  onSelect={handleVarSelect}
                  onClearSelection={handleVarClearSelection}
                  onQuickAction={handleVarQuickAction}
                />
              )}
            </div>

            {/* Resize handle */}
            <div
              className="w-1 cursor-col-resize bg-gray-200 hover:bg-blue-300 flex-shrink-0"
              onMouseDown={() => setSidebarResizing(true)}
            />

            {/* Tables list */}
            <div className="w-52 flex flex-col border-r border-gray-200 bg-white overflow-hidden flex-shrink-0">
              <div className="flex items-center justify-between px-2 py-2 border-b border-gray-100">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Tables</span>
                <div className="flex gap-1">
                  <button onClick={() => addTable()} title="Add Table" className="p-1 rounded hover:bg-gray-100 text-gray-500">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  {selectedVariableNames.size > 0 && (
                    <button
                      onClick={() => createTablesFromVariables(selectedVariableNames)}
                      title={`Create ${selectedVariableNames.size} table${selectedVariableNames.size > 1 ? 's' : ''} from selected variables`}
                      className="p-1 rounded hover:bg-gray-100 text-emerald-600"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={addFolder} title="Add Folder" className="p-1 rounded hover:bg-gray-100 text-gray-500">
                    <Folder className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {/* Ungrouped tables */}
                {tables.filter(t => !t.folderId).map(table => (
                  <TableRow
                    key={table.id}
                    table={table}
                    active={table.id === activeTableId}
                    selected={selectedIds.has(table.id)}
                    hasActiveFilter={hasActiveFilter(table.filter)}
                    filterSummary={getFilterSummary(table)}
                    folders={folders}
                    onClick={opts => handleTableClick(table.id, opts)}
                    onContextMenu={e => handleTableContextMenu(e, table.id)}
                    onDelete={() => handleTableDelete(table.id)}
                    onRename={name => handleTableRename(table.id, name)}
                    onToggleSelect={opts => handleTableToggleSelect(table.id, opts)}
                    onMoveToFolder={folderId => handleMoveTableToFolder(table.id, folderId)}
                    onDuplicate={() => handleTableDuplicate(table.id)}
                    onDragStart={() => handleTableDragStart(table.id)}
                    onDropToRow={() => handleTableDropToRow(table.id)}
                    indent={false}
                  />
                ))}

                {/* Folders */}
                {folders.map(folder => (
                  <div key={folder.id}>
                    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 bg-gray-50 group">
                      <button onClick={() => toggleFolderExpanded(folder.id)} className="p-0.5 rounded text-gray-500">
                        {folder.expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      </button>
                      <Folder className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-gray-700 truncate flex-1">{folder.name}</span>
                      <button
                        onClick={() => addTable(folder.id)}
                        title="Add table to folder"
                        className="hidden group-hover:flex p-0.5 rounded hover:bg-gray-200 text-gray-400"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteFolder(folder.id)}
                        title="Delete folder"
                        className="hidden group-hover:flex p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {folder.expanded && tables.filter(t => t.folderId === folder.id).map(table => (
                      <TableRow
                        key={table.id}
                        table={table}
                        active={table.id === activeTableId}
                        selected={selectedIds.has(table.id)}
                        hasActiveFilter={hasActiveFilter(table.filter)}
                        filterSummary={getFilterSummary(table)}
                        folders={folders}
                        onClick={opts => handleTableClick(table.id, opts)}
                        onContextMenu={e => handleTableContextMenu(e, table.id)}
                        onDelete={() => handleTableDelete(table.id)}
                        onRename={name => handleTableRename(table.id, name)}
                        onToggleSelect={opts => handleTableToggleSelect(table.id, opts)}
                        onMoveToFolder={folderId => handleMoveTableToFolder(table.id, folderId)}
                        onDuplicate={() => handleTableDuplicate(table.id)}
                        onDragStart={() => handleTableDragStart(table.id)}
                        onDropToRow={() => handleTableDropToRow(table.id)}
                        indent={true}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas area */}
            <div className="min-w-0 flex-1 overflow-auto p-4">
              {activeTab === 'design' && activeTable && (
                <DesignCanvas
                  table={activeTable}
                  batchEditCount={batchEditCount}
                  quickAddTarget={quickAddTarget === 'filter' ? 'top' : quickAddTarget}
                  getVarLabel={getVarLabel}
                  getVarTone={getVarTone}
                  onActivateQuickTarget={target => setQuickAddTarget(target)}
                  onDropTop={handleDropTop}
                  onDropSide={handleDropSide}
                  onClearTop={handleClearTop}
                  onClearSide={handleClearSide}
                  onReorderTop={handleReorderTop}
                  onReorderSide={handleReorderSide}
                  onRemoveTop={handleRemoveTop}
                  onRemoveSide={handleRemoveSide}
                  onMoveTopUp={handleMoveTopUp}
                  onMoveTopDown={handleMoveTopDown}
                  onMoveSideUp={handleMoveSideUp}
                  onMoveSideDown={handleMoveSideDown}
                  onUpdateName={handleUpdateTableName}
                  onGenerate={handleGenerate}
                  canRun={canRun}
                />
              )}
              {activeTab === 'filter' && activeTable && (
                <div className="space-y-4">
                  {filterMismatchTableNames.length > 0 && (
                    <div className="mx-auto max-w-5xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
                      Editing this filter will use <span className="font-semibold">{activeTable.name}</span> as the source and overwrite the selected tables that currently differ:
                      {' '}
                      <span className="font-semibold">{filterMismatchTableNames.join(', ')}</span>
                    </div>
                  )}
                  <FilterCanvas
                    table={activeTable}
                    batchEditCount={filterBatchEditCount}
                    isQuickTarget={quickAddTarget === 'filter'}
                    getVarLabel={getVarLabel}
                    getVarTone={getVarTone}
                    getFilterFieldMeta={getFilterFieldMeta}
                    onActivateQuickTarget={() => setQuickAddTarget('filter')}
                    onUpdateDescription={handleUpdateFilterDescription}
                    onUpdateRootJoin={handleUpdateRootJoin}
                    onAddGroup={handleAddGroup}
                    onClear={handleClearFilter}
                    onDropVariable={handleDropFilterVariable}
                    onUpdateGroupJoin={handleUpdateGroupJoin}
                    onRemoveGroup={handleRemoveGroup}
                    onUpdateCondition={handleUpdateCondition}
                    onRemoveCondition={handleRemoveCondition}
                    onGenerate={handleGenerate}
                    canRun={canRun}
                  />
                </div>
              )}
              {activeTab === 'results' && activeResult && (
                <PreviewTable result={activeResult} config={settings} />
              )}
              {activeTab === 'results' && !activeResult && (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No results yet. Run the table to see output.
                </div>
              )}
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={loadSettingsInputRef}
            type="file"
            className="hidden"
            accept=".xlsx"
            onChange={async e => {
              const file = e.target.files?.[0]
              if (!file) return
              e.target.value = ''
              if (supportsFileSystemAccess()) {
                const result = await pickSettingsFileViaSystem()
                if (result) await handleLoadSettingsFile(result.file, result.handle)
              } else {
                await handleLoadSettingsFile(file)
              }
            }}
          />
          <input
            ref={batchSettingsInputRef}
            type="file"
            className="hidden"
            accept=".xlsx"
            multiple
            onChange={async e => {
              const files = e.target.files
              if (!files || files.length === 0) return
              e.target.value = ''
              await handleBatchExportFiles(files)
            }}
          />

          {/* Table context menu */}
          {tableContextMenu && (
            <div
              className="fixed z-50 min-w-[160px] rounded-xl border border-gray-200 bg-white py-1 shadow-xl"
              style={{ left: tableContextMenu.x, top: tableContextMenu.y }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => { handleTableCopy(tableContextMenu.targetId); setTableContextMenu(null) }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
              >
                <Copy className="h-3.5 w-3.5" />
                {selectedIds.has(tableContextMenu.targetId) && selectedIds.size > 1
                  ? `Copy Selected (${selectedIds.size})`
                  : 'Copy'}
              </button>
              {copiedTablesBuffer.length > 0 && (
                <button
                  onClick={() => { handleTablePasteAfter(tableContextMenu.targetId); setTableContextMenu(null) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  Paste ({copiedTablesBuffer.length})
                </button>
              )}
              <button
                onClick={() => { handleTableDuplicate(tableContextMenu.targetId); setTableContextMenu(null) }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={() => { handleTableDelete(tableContextMenu.targetId); setTableContextMenu(null) }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pending source dataset modal */}
      {pendingSourceDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white shadow-2xl">
            <div className="border-b border-gray-100 px-6 py-5">
              <h3 className="text-lg font-bold text-gray-800">SPSS File Required</h3>
              <p className="mt-1 text-sm text-gray-500">
                This settings file references an SPSS dataset. Please locate the file to continue.
              </p>
            </div>
            <div className="px-6 py-5">
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-500">Expected File</div>
                <div className="mt-2 break-all text-base font-semibold text-slate-800">{pendingSourceDataset.fileName}</div>
                {pendingSourceDataset.filePath && (
                  <div className="mt-2 break-all text-xs text-slate-500">{pendingSourceDataset.filePath}</div>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
                ถ้าเครื่องนี้เก็บไฟล์ไว้คนละ path หรือชื่อไฟล์ต่างจากเดิม ให้ใช้ {"`"}Rebind SPSS File{"`"} แล้วระบบจะผูก settings นี้กับไฟล์ใหม่ให้ต่อจากนี้
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    pendingSettingsRestoreRef.current = null
                    setPendingSourceDataset(null)
                    setPendingSourceIntent('match')
                  }}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setPendingSourceDataset(null)
                    setPendingSourceIntent('match')
                    openSavFile()
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  <Upload className="h-4 w-4" />
                  Choose Matching File
                </button>
                <button
                  onClick={() => {
                    setPendingSourceDataset(null)
                    setPendingSourceIntent('rebind')
                    openSavFile()
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1F4E78] px-4 py-2 text-sm font-semibold text-white hover:bg-[#173b5c]"
                >
                  <Upload className="h-4 w-4" />
                  Rebind SPSS File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading modal */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/18 p-6 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-[28px] border border-dashed border-blue-300 bg-white px-10 py-12 text-center shadow-2xl shadow-blue-100">
            <div className="mx-auto flex max-w-xs flex-col items-center gap-4">
              <RefreshCw className="h-12 w-12 animate-spin text-blue-500" />
              <div className="space-y-1">
                <p className="text-xl font-bold text-blue-700">Loading SPSS file...</p>
                <p className="text-xs text-slate-400">
                  {loadPhase === 'variables'
                    ? 'Reading variable metadata...'
                    : loadPhase === 'cases'
                      ? `Loading case data${loadPct > 0 ? ` ${loadPct}%` : ''}...`
                      : 'Preparing file...'}
                </p>
              </div>
              <div className="w-full overflow-hidden rounded-full bg-slate-200 h-1.5">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-150"
                  style={{
                    width: loadPhase === 'cases' && loadPct > 0 ? `${loadPct}%` : '100%',
                    animation: loadPhase !== 'cases' || loadPct === 0 ? 'indeterminate 1.5s ease-in-out infinite' : 'none',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variable editor modal */}
      {editingVariableName && editingVariableItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Edit Variable - {editingVariableName}</h3>
                <p className="text-xs text-gray-500">{editingVariableItem.label || editingVariableItem.longName || editingVariableItem.name}</p>
              </div>
              <button
                onClick={() => setEditingVariableName(null)}
                className="p-1 rounded hover:bg-gray-200 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 overflow-auto max-h-[calc(85vh-64px)] space-y-4">
              <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                <div className="border border-gray-200 rounded-xl overflow-auto max-h-[62vh]">
                  <table className="w-full text-xs select-none">
                    <thead className="bg-[#2E75B6] text-white sticky top-0 z-10">
                      <tr>
                        <th
                          onClick={toggleCodeSort}
                          className="px-2 py-2 text-left w-[72px] cursor-pointer select-none"
                          title="Click to sort code"
                        >
                          Code {codeSortDirection === 'asc' ? 'โ‘' : 'โ“'}
                        </th>
                        <th className="px-2 py-2 text-left">Label</th>
                        <th className="px-2 py-2 text-right w-[90px]">Count</th>
                        <th className="px-2 py-2 text-right w-[80px]">Percent</th>
                        <th className="px-2 py-2 text-center w-[100px]">Factor</th>
                        <th className="px-2 py-2 text-center w-[88px]">Select</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-[#D9E1F2] font-semibold text-gray-800">
                        <td className="px-2 py-2 border-t border-[#BDD7EE]">Base</td>
                        <td className="px-2 py-2 border-t border-[#BDD7EE]">All valid answers</td>
                        <td className="px-2 py-2 border-t border-[#BDD7EE] text-right tabular-nums">{editingVariableBase}</td>
                        <td className="px-2 py-2 border-t border-[#BDD7EE] text-right">100.0</td>
                        <td className="px-2 py-2 border-t border-[#BDD7EE]" />
                        <td className="px-2 py-2 border-t border-[#BDD7EE]" />
                      </tr>
                      {variableEditorRows.map((row, index) => {
                        const selected = selectedVariableRowKeys.includes(row.key)
                        const isNetRow = row.rowKind === 'net'
                        const isSummaryRow = row.rowKind === 'summary'
                        return (
                          <tr key={row.key} className={isNetRow ? 'bg-emerald-50' : isSummaryRow ? 'bg-amber-50' : selected ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-[#EBF3FB]'}>
                            <td
                              className={`px-2 py-2 border-t border-[#BDD7EE] text-gray-700 ${isNetRow ? 'font-semibold text-emerald-800' : isSummaryRow ? 'font-semibold text-amber-800' : 'cursor-pointer'} ${selected ? 'font-semibold' : ''}`}
                              onMouseDown={e => e.preventDefault()}
                              onClick={e => { if (!isNetRow && !isSummaryRow) handleVariableRowClick(row.key, e.shiftKey) }}
                              onContextMenu={e => {
                                if (isNetRow || isSummaryRow) return
                                e.preventDefault()
                                if (!selected) {
                                  setSelectedVariableRowKeys([row.key])
                                  setLastSelectedVariableIndex(codeEditorRows.findIndex(item => item.key === row.key))
                                }
                                setVariableContextMenu({ x: e.clientX, y: e.clientY })
                              }}
                            >
                              {row.code}
                            </td>
                            <td
                              className={`px-2 py-2 border-t border-[#BDD7EE] text-gray-800 ${isNetRow ? 'font-semibold text-emerald-800' : isSummaryRow ? 'font-semibold text-amber-800' : 'cursor-pointer'} ${selected ? 'font-semibold' : ''}`}
                              onMouseDown={e => e.preventDefault()}
                              onClick={e => { if (!isNetRow && !isSummaryRow) handleVariableRowClick(row.key, e.shiftKey) }}
                              onContextMenu={e => {
                                if (isNetRow || isSummaryRow) return
                                e.preventDefault()
                                if (!selected) {
                                  setSelectedVariableRowKeys([row.key])
                                  setLastSelectedVariableIndex(codeEditorRows.findIndex(item => item.key === row.key))
                                }
                                setVariableContextMenu({ x: e.clientX, y: e.clientY })
                              }}
                              onDoubleClick={e => { e.stopPropagation(); setEditingVariableLabelKey(row.key) }}
                            >
                              {editingVariableLabelKey === row.key ? (
                                <input
                                  autoFocus
                                  value={row.label}
                                  onClick={e => e.stopPropagation()}
                                  onChange={e => {
                                    const nextValue = e.target.value
                                    if (isNetRow && row.groupId) {
                                      setVariableGroups(prev => prev.map(group => group.id === row.groupId
                                        ? { ...group, name: nextValue.replace(/^(?:Sub)*net\s*:\s*/i, '').trimStart() }
                                        : group))
                                    }
                                    setVariableEditorRows(prev => prev.map(item => item.key === row.key ? { ...item, label: nextValue } : item))
                                  }}
                                  onBlur={() => setEditingVariableLabelKey(null)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === 'Escape') setEditingVariableLabelKey(null)
                                  }}
                                  className="w-full bg-white border border-blue-200 rounded px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-blue-300"
                                />
                              ) : (
                                <span
                                  className={isNetRow ? 'text-emerald-800 font-semibold' : ''}
                                  style={{ paddingLeft: `${(row.indentLevel ?? 0) * 14}px`, display: 'inline-block' }}
                                >
                                  {row.label}
                                </span>
                              )}
                            </td>
                            <td className={`px-2 py-2 border-t border-[#BDD7EE] text-right tabular-nums ${isNetRow ? 'font-semibold text-emerald-800' : ''}`}>{row.count}</td>
                            <td className={`px-2 py-2 border-t border-[#BDD7EE] text-right ${isNetRow ? 'font-semibold text-emerald-800' : ''}`}>{row.percent.toFixed(1)}%</td>
                            <td className="px-2 py-2 border-t border-[#BDD7EE]">
                              {isNetRow ? (
                                <div className="text-center text-[11px] text-emerald-700">-</div>
                              ) : isSummaryRow ? (
                                <div className="text-center text-[11px] text-amber-700">-</div>
                              ) : (
                                <input
                                  value={row.factor}
                                  onChange={e => setVariableEditorRows(prev => prev.map((item, itemIndex) => itemIndex === index ? { ...item, factor: e.target.value } : item))}
                                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-center outline-none focus:ring-1 focus:ring-blue-300"
                                  placeholder={row.autoFactor ? row.code : '-'}
                                />
                              )}
                            </td>
                            <td className="px-2 py-2 border-t border-[#BDD7EE] text-center">
                              {isNetRow ? (
                                <span className="text-[10px] font-semibold text-emerald-700">NET</span>
                              ) : isSummaryRow ? (
                                <span className="text-[10px] font-semibold text-amber-700">TB/T2B</span>
                              ) : (
                                <span className={`inline-flex h-4 w-4 rounded-full border ${selected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`} />
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="w-[220px] rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-700">Calculation</div>
                    <p className="mt-1 text-[11px] text-gray-500">ใส่ค่า factor ตาม code เพื่อให้เวลาเอาตัวแปรนี้ไปไว้ที่ SIDE แบบข้อเดี่ยว ระบบเพิ่มแถว Mean ให้ในตาราง</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-700">Display</div>
                    <p className="mt-1 text-[11px] text-gray-500">ดับเบิลคลิกที่ตัวแปรใน Variable Folders เพื่อกลับมาแก้ order และ factor ได้ทุกเมื่อ</p>
                  </div>
                  <div className="text-[11px] text-gray-500">Tip: ถ้าไม่ใส่ factor ระบบจะยังใช้ลำดับ code ได้ แต่จะไม่สร้าง Mean</div>
                  <div className="pt-2">
                    {variableGroups.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-gray-700 mb-2">Net Groups</div>
                        <div className="space-y-2">
                          {variableGroups.map(group => (
                            <div key={group.id} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold text-emerald-800">{getNetPrefix(getGroupDepth(group, variableGroups))}{group.name}</span>
                                <button
                                  onClick={() => removeVariableNetGroup(group.id)}
                                  className="text-[10px] text-emerald-700 hover:text-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="mt-1 text-[10px] text-emerald-700">
                                {group.members.join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {isNumericVariable(editingVariableName) && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-gray-700 mb-2">Statistics</div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                          {(['mean', 'min', 'max', 'stddev'] as NumericStat[]).map(stat => (
                            <label key={stat} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedNumericStats.includes(stat)}
                                onChange={e => {
                                  setSelectedNumericStats(prev => e.target.checked
                                    ? [...new Set([...prev, stat])]
                                    : prev.filter(item => item !== stat))
                                }}
                                className="accent-[#1F4E78]"
                              />
                              <span>{stat === 'stddev' ? 'StdDev' : stat[0].toUpperCase() + stat.slice(1)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-xs font-semibold text-gray-700 mb-2">Order Controls</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setVariableEditorRows(prev => rebuildVariableEditorRows(moveSelectedRows(prev.filter(row => row.rowKind === 'code'), selectedVariableRowKeys, -1), variableGroups))}
                        disabled={selectedVariableRowKeys.length === 0 || firstSelectedVariableIndex === 0}
                        className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 text-white p-2 shadow-sm hover:bg-emerald-500 disabled:opacity-30"
                        title="Move selected up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setVariableEditorRows(prev => rebuildVariableEditorRows(moveSelectedRows(prev.filter(row => row.rowKind === 'code'), selectedVariableRowKeys, 1), variableGroups))}
                        disabled={selectedVariableRowKeys.length === 0 || lastSelectedVariableRowIndex === codeEditorRows.length - 1}
                        className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 text-white p-2 shadow-sm hover:bg-emerald-500 disabled:opacity-30"
                        title="Move selected down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                    {selectedScalePreset && (
                      <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2 text-[11px] font-medium text-blue-800">
                        Current preset: {getScalePresetDisplayLabel(selectedScalePreset)}
                      </div>
                    )}
                    <div className="mt-3">
                      <div className="mb-2 text-xs font-semibold text-gray-700">Scale Presets</div>
                      <button
                        onClick={() => setShowScalePresetDialog(true)}
                        className="relative inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-gradient-to-r from-[#1F4E78] to-[#2E75B6] px-3 py-2.5 text-xs font-semibold text-transparent shadow-sm transition hover:from-[#24598b] hover:to-[#377fc1]"
                      >
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-white">
                          <Sparkles className="h-3.5 w-3.5" />
                          {selectedScalePreset ? getScalePresetLabel(selectedScalePreset) : 'สร้าง TB/T2B'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditingVariableName(null)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveVariableEditor(editingVariableName, variableEditorRows)}
                  className="px-3 py-1.5 rounded-lg bg-[#1F4E78] text-white text-sm font-semibold hover:bg-[#173b5c]"
                >
                  Save Variable
                </button>
              </div>
            </div>
            {variableContextMenu && (
              <div
                className="fixed z-[60] min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-xl"
                style={{ left: variableContextMenu.x, top: variableContextMenu.y }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={createVariableNetGroup}
                  disabled={selectedVariableRowKeys.length === 0}
                  className="block w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-emerald-50 disabled:opacity-40"
                >
                  Group Net
                </button>
                <button
                  onClick={removeSelectedCodesFromGroups}
                  disabled={!selectedRowsInGroups}
                  className="block w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-red-50 disabled:opacity-40"
                >
                  Remove Selected From Net
                </button>
              </div>
            )}
            {showNetNameDialog && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl">
                  <div className="border-b border-gray-100 px-5 py-4">
                    <h4 className="text-base font-bold text-gray-800">Create Net Group</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Set a name for the selected net group.
                    </p>
                  </div>
                  <div className="px-5 py-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Net name</label>
                    <input
                      autoFocus
                      value={pendingNetName}
                      onChange={e => setPendingNetName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && pendingNetName.trim()) confirmVariableNetGroup()
                        if (e.key === 'Escape') {
                          setShowNetNameDialog(false)
                          setPendingNetName('UPC')
                        }
                      }}
                      className="w-full rounded-xl border border-blue-200 bg-blue-50/30 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="e.g. UPC"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 px-5 py-4">
                    <button
                      onClick={() => {
                        setShowNetNameDialog(false)
                        setPendingNetName('UPC')
                      }}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmVariableNetGroup}
                      disabled={!pendingNetName.trim()}
                      className="rounded-xl bg-[#1F4E78] px-4 py-2 text-sm font-semibold text-white hover:bg-[#173b5c] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Create Net
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showScalePresetDialog && (
              <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/45 p-4">
                <div className="w-full max-w-[380px] rounded-3xl border border-blue-100 bg-white shadow-2xl">
                  <div className="border-b border-blue-100 px-5 py-4">
                    <h4 className="text-base font-bold text-gray-800">สร้าง TB / T2B</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      เลือก preset เพื่อให้ระบบใส่ factor อัตโนมัติและสร้างแถวสรุปไว้ด้านล่างตัวแปร
                    </p>
                  </div>
                  <div className="grid gap-2 px-4 py-3">
                    {SCALE_PRESET_OPTIONS.map(({ preset, title, description, tone }) => (
                      <button
                        key={preset}
                        onClick={() => applyScaleSummaryPreset(preset)}
                        className={`rounded-xl border px-3 py-2.5 text-left transition ${
                          selectedScalePreset === preset
                            ? `${tone} ring-2 ring-blue-200 shadow-sm`
                            : `${tone}`
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[13px] font-semibold leading-5 text-gray-800">{getScalePresetDisplayLabel(preset)}</div>
                            <div className="mt-0.5 text-[11px] leading-4 text-gray-500">{description}</div>
                          </div>
                          <span className="rounded-full bg-white/85 px-2 py-0.5 text-[9px] font-bold tracking-[0.16em] text-gray-600">
                            {title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-2 px-5 py-4">
                    <button
                      onClick={() => setShowScalePresetDialog(false)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Batch exporting modal */}
      {batchExporting && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-blue-100 bg-white shadow-2xl">
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <div className="relative flex h-28 w-28 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-[#1F4E78] border-r-blue-400 animate-spin" />
                <CrossifyLogo size="lg" className="relative" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-gray-800">กำลังประมวลผล Batch Export</h3>
              <p className="mt-2 text-sm text-gray-500">กรุณารอสักครู่ ระบบกำลังรันทุก setting และ export ไฟล์ให้อัตโนมัติ</p>
              <div className="mt-5 rounded-2xl bg-blue-50 px-5 py-3 text-center">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">Elapsed Time</div>
                <div className="mt-1 text-2xl font-bold tabular-nums text-[#1F4E78]">{formatLiveBatchDuration(batchElapsedMs)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch export summary modal */}
      {batchExportSummary && !batchExporting && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-2xl">
            <div className="border-b border-gray-100 px-6 py-5">
              <h3 className="text-lg font-bold text-gray-800">Batch Export Complete</h3>
              <p className="mt-1 text-sm text-gray-500">สรุปผลการ export ของชุดไฟล์ settings รอบล่าสุด</p>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Success</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-700">{batchExportSummary.successCount}</div>
                  <div className="text-xs text-emerald-700/80">files exported</div>
                </div>
                <div className="rounded-2xl bg-blue-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Time Used</div>
                  <div className="mt-1 text-2xl font-bold text-[#1F4E78]">{formatBatchDuration(batchExportSummary.elapsedMs)}</div>
                  <div className="text-xs text-blue-700/80">total runtime</div>
                </div>
              </div>
              {batchExportSummary.skippedCount > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">มีไฟล์ถูกข้าม {batchExportSummary.skippedCount} ไฟล์ กรุณาดูรายละเอียดในแถบแจ้งเตือนด้านบน</div>
              )}
            </div>
            <div className="flex justify-end px-6 py-5">
              <button
                onClick={dismissBatchExportSummary}
                className="rounded-xl bg-[#1F4E78] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#173b5c]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
