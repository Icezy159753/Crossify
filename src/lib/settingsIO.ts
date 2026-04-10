import type * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import type { MrsetDefinition } from './variableGrouping'
import type {
  FilterJoin,
  FilterOperator,
  TableFilterCondition,
  TableFilterGroup,
  TableFilterSpec,
} from '../types/workspace'

export interface TableSetting {
  name: string
  rowVar: string | null
  colVar: string | null
  folderId: string | null
  filter?: TableFilterSpec
}

export interface FolderSetting {
  id: string
  name: string
}

export interface OutputSettings {
  showCount: boolean
  showPercent: boolean
  percentType: 'row' | 'column' | 'total'
  hideZeroRows?: boolean
}

export interface SourceDatasetSetting {
  fileName: string
  filePath?: string
}

export interface SourceMappingEntry extends SourceDatasetSetting {
  id: string
  ownerLabel?: string
  machineLabel?: string
  lastBoundAt: string
  lastBoundBy?: string
}

export interface SettingsLockInfo {
  sessionId: string
  ownerLabel: string
  machineLabel?: string
  status: 'ACTIVE' | 'EXITED'
  acquiredAt: string
  updatedAt: string
  expiresAt: string
  exitedAt?: string
}

export interface SettingsWorkbookPayload {
  tables: TableSetting[]
  folders: FolderSetting[]
  output: OutputSettings
  variableOverrides?: Record<string, unknown>
  detectedMrsets?: MrsetDefinition[]
  sourceDataset?: SourceDatasetSetting
  sourceMappings?: SourceMappingEntry[]
  activeLock?: SettingsLockInfo | null
}

export interface AllSettings {
  version: '1.0' | '1.1' | '1.2' | '1.3' | '1.4' | '1.5' | '1.6' | '1.7' | '1.8' | '1.9'
  savedAt: string
  output: OutputSettings
  folders: FolderSetting[]
  tables: TableSetting[]
  variableOverrides?: Record<string, unknown>
  customMrsets?: MrsetDefinition[]
  sourceDataset?: SourceDatasetSetting
  sourceMappings?: SourceMappingEntry[]
  activeLock?: SettingsLockInfo | null
}

interface VariableOverrideSheetRow {
  variable: string
  setting: string
  key: string
  value: string
  extra1?: string
  extra2?: string
}

interface VariableNetSheetRow {
  variable: string
  setting: string
  value: string
  code: string
  parent?: string
  depth?: number
}


function parseScalePresetLabel(value: string) {
  const normalized = value.trim()
  if (['1.สร้างTB(Scale น้อยดี)', 'สร้างTB(Scale น้อยดี)', '1.?????TB(Scale ??????)', '?????TB(Scale ??????)'].includes(normalized)) return 'tb_low_good'
  if (['2.สร้างTB(Scale มากดี)', 'สร้างTB(Scale มากดี)', '2.?????TB(Scale ?????)', '?????TB(Scale ?????)'].includes(normalized)) return 'tb_high_good'
  if (['3.สร้างT2B(Scale น้อยดี)', 'สร้างT2B(Scale น้อยดี)', '3.?????T2B(Scale ??????)', '?????T2B(Scale ??????)'].includes(normalized)) return 't2b_low_good'
  if (['4.สร้างT2B(Scale มากดี)', 'สร้างT2B(Scale มากดี)', '4.?????T2B(Scale ?????)', '?????T2B(Scale ?????)'].includes(normalized)) return 't2b_high_good'
  return ''
}

function parseScalePresetEntry(value: string) {
  const normalized = value.trim()
  if (normalized === '1.Create TB (Low scale = good)' || normalized === 'Create TB (Low scale = good)') return 'tb_low_good'
  if (normalized === '2.Create TB (High scale = good)' || normalized === 'Create TB (High scale = good)') return 'tb_high_good'
  if (normalized === '3.Create T2B (Low scale = good)' || normalized === 'Create T2B (Low scale = good)') return 't2b_low_good'
  if (normalized === '4.Create T2B (High scale = good)' || normalized === 'Create T2B (High scale = good)') return 't2b_high_good'
  if (normalized === '5.Create T3B (Low scale = good)' || normalized === 'Create T3B (Low scale = good)') return 't3b_low_good'
  if (normalized === '6.Create T3B (High scale = good)' || normalized === 'Create T3B (High scale = good)') return 't3b_high_good'
  if (normalized === '7.Justright (By code)' || normalized === 'Justright (By code)') return 'justright_code'
  if (normalized === '8.Justright (-2 -1 0 1 2)' || normalized === 'Justright (-2 -1 0 1 2)') return 'justright_centered'
  return parseScalePresetLabel(value)
}

async function loadExcelJs() {
  const module = await import('exceljs')
  return module.default
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.height = 18
  row.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } }
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    }
  })
}

function styleDataRow(row: ExcelJS.Row, even: boolean) {
  row.height = 16
  row.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: even ? 'FFEBF3FB' : 'FFFFFFFF' } }
    cell.font = { size: 10, name: 'Calibri' }
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    }
  })
}

function buildVariableOverrideRows(variableOverrides: Record<string, unknown>) {
  const rows: VariableOverrideSheetRow[] = []
  const netRows: VariableNetSheetRow[] = []

  Object.entries(variableOverrides).forEach(([variable, overrideUnknown]) => {
    const override = (overrideUnknown ?? {}) as {
      order?: string[]
      weights?: Record<string, string>
      labels?: Record<string, string>
      numericStats?: string[]
      groups?: Array<{ id: string; name: string; members: string[]; parentId?: string | null }>
      summaries?: Array<{ code: string; label: string; members: string[] }>
      summaryPreset?: string
    }

    Object.entries(override.labels ?? {}).forEach(([key, value]) => {
      rows.push({ variable, setting: 'Label', key, value: String(value) })
    })
    Object.entries(override.weights ?? {}).forEach(([key, value]) => {
      rows.push({ variable, setting: 'Factor', key, value: String(value) })
    })
    ;(override.order ?? []).forEach((key, index) => {
      rows.push({ variable, setting: 'Order', key, value: String(index + 1) })
    })
    ;(override.numericStats ?? []).forEach(stat => {
      rows.push({ variable, setting: 'Stat', key: stat, value: 'TRUE' })
    })
    ;(override.summaries ?? []).forEach(summary => {
      rows.push({
        variable,
        setting: 'Summary',
        key: summary.code,
        value: summary.label,
        extra1: summary.members.join(','),
      })
    })
    if (override.summaryPreset?.trim()) {
      rows.push({
        variable,
        setting: 'SummaryPreset',
        key: 'preset',
        value: override.summaryPreset.trim(),
      })
    }
    ;(override.groups ?? []).forEach(group => {
      const depth = (() => {
        let level = 0
        let parentId = group.parentId
        const seen = new Set<string>()
        while (parentId) {
          if (seen.has(parentId)) break
          seen.add(parentId)
          const parent = (override.groups ?? []).find(item => item.id === parentId)
          if (!parent) break
          level += 1
          parentId = parent.parentId
        }
        return level
      })()
      netRows.push({
        variable,
        setting: depth === 0 ? 'Net' : `${'Sub'.repeat(depth)}net`,
        value: group.name,
        code: group.members.join(','),
        parent: group.parentId
          ? ((override.groups ?? []).find(item => item.id === group.parentId)?.name ?? '')
          : '',
        depth,
      })
    })
  })

  rows.sort((a, b) =>
    a.variable.localeCompare(b.variable, undefined, { numeric: true, sensitivity: 'base' }) ||
    a.setting.localeCompare(b.setting, undefined, { numeric: true, sensitivity: 'base' }) ||
    a.key.localeCompare(b.key, undefined, { numeric: true, sensitivity: 'base' })
  )
  netRows.sort((a, b) =>
    a.variable.localeCompare(b.variable, undefined, { numeric: true, sensitivity: 'base' }) ||
    (a.depth ?? 0) - (b.depth ?? 0) ||
    a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: 'base' })
  )

  return { rows, netRows }
}

function parseVariableOverrideRows(rows: VariableOverrideSheetRow[], netRows: VariableNetSheetRow[] = []): Record<string, unknown> {
  const byVariable = new Map<string, {
    order: Array<{ key: string; rank: number }>
    weights: Record<string, string>
    labels: Record<string, string>
    numericStats: string[]
    groups: Array<{ id: string; name: string; members: string[]; parentId?: string | null }>
    summaries: Array<{ code: string; label: string; members: string[] }>
    summaryPreset?: string
  }>()

  rows.forEach(row => {
    if (!row.variable) return
    const bucket = byVariable.get(row.variable) ?? {
      order: [],
      weights: {},
      labels: {},
      numericStats: [],
      groups: [],
      summaries: [],
      summaryPreset: undefined,
    }
    byVariable.set(row.variable, bucket)

    if (row.setting === 'Label') bucket.labels[row.key] = row.value
    if (row.setting === 'Factor' && row.value.trim() !== '') bucket.weights[row.key] = row.value.trim()
    if (row.setting === 'Order') bucket.order.push({ key: row.key, rank: Number(row.value) || Number.MAX_SAFE_INTEGER })
    if (row.setting === 'Stat' && row.key) bucket.numericStats.push(row.key)
    if (row.setting === 'Summary' && row.key) {
      bucket.summaries.push({
        code: row.key,
        label: row.value || row.key,
        members: (row.extra1 ?? '').split(',').map(item => item.trim()).filter(Boolean),
      })
    }
    if (row.setting === 'SummaryPreset' && row.value.trim()) bucket.summaryPreset = row.value.trim()
    if (row.setting === 'Net') {
      bucket.groups.push({
        id: row.key,
        name: row.value,
        parentId: row.extra1?.trim() ? row.extra1.trim() : null,
        members: (row.extra2 ?? '').split(',').map(item => item.trim()).filter(Boolean),
      })
    }
  })

  netRows.forEach((row, index) => {
    if (!row.variable) return
    const bucket = byVariable.get(row.variable) ?? {
      order: [],
      weights: {},
      labels: {},
      numericStats: [],
      groups: [],
      summaries: [],
      summaryPreset: undefined,
    }
    byVariable.set(row.variable, bucket)
    const parent = row.parent?.trim() || ''
    const parentGroup = parent
      ? bucket.groups.find(group => group.name === parent)
      : null
    bucket.groups.push({
      id: `${row.variable}__net_${index + 1}`,
      name: row.value,
      parentId: parentGroup?.id ?? null,
      members: row.code.split(',').map(item => item.trim()).filter(Boolean),
    })
  })

  return Object.fromEntries(
    [...byVariable.entries()].map(([variable, bucket]) => [variable, {
      order: bucket.order.sort((a, b) => a.rank - b.rank).map(item => item.key),
      weights: bucket.weights,
      labels: bucket.labels,
      numericStats: bucket.numericStats,
      groups: bucket.groups,
      summaries: bucket.summaries,
      summaryPreset: bucket.summaryPreset,
    }])
  )
}

const SETTINGS_CHUNK_SIZE = 30000

function writeHiddenSettings(ws: ExcelJS.Worksheet, settings: AllSettings) {
  const serialized = JSON.stringify(settings)
  const chunks = serialized.match(new RegExp(`.{1,${SETTINGS_CHUNK_SIZE}}`, 'g')) ?? ['{}']
  chunks.forEach((chunk, index) => {
    ws.getCell(index + 1, 1).value = chunk
  })
}

function readHiddenSettings(ws: ExcelJS.Worksheet): string | null {
  const chunks: string[] = []
  for (let rowNum = 1; rowNum <= ws.rowCount; rowNum++) {
    const raw = ws.getCell(rowNum, 1).value
    const rawObj = raw as unknown as { text?: unknown } | null
    const rawStr = typeof raw === 'string'
      ? raw
      : rawObj && typeof rawObj.text === 'string'
        ? rawObj.text
        : null
    if (!rawStr) break
    chunks.push(rawStr)
  }
  return chunks.length > 0 ? chunks.join('') : null
}

function isFilterJoin(value: string): value is FilterJoin {
  return value === 'all' || value === 'any'
}

function isFilterOperator(value: string): value is FilterOperator {
  return (
    value === 'in' ||
    value === 'not_in' ||
    value === 'gt' ||
    value === 'gte' ||
    value === 'lt' ||
    value === 'lte' ||
    value === 'between' ||
    value === 'contains' ||
    value === 'not_contains' ||
    value === 'is_blank' ||
    value === 'not_blank'
  )
}

function summarizeFilterCondition(condition: TableFilterCondition) {
  if (condition.operator === 'in' || condition.operator === 'not_in') {
    const values = condition.values.join(', ')
    return `${condition.variableName} ${condition.operator === 'in' ? 'in' : 'not in'} [${values}]`
  }
  if (condition.operator === 'between') {
    return `${condition.variableName} between ${condition.value} and ${condition.secondaryValue}`
  }
  if (condition.operator === 'is_blank') return `${condition.variableName} is blank`
  if (condition.operator === 'not_blank') return `${condition.variableName} is not blank`
  return `${condition.variableName} ${condition.operator} ${condition.value}`.trim()
}

function summarizeFilter(filter?: TableFilterSpec) {
  if (!filter) return ''
  const description = filter.description.trim()
  if (description) return description

  const activeGroups = filter.groups.filter(group => group.conditions.length > 0)
  if (activeGroups.length === 0) return ''

  const summary = activeGroups
    .map(group =>
      group.conditions
        .map(summarizeFilterCondition)
        .join(group.join === 'all' ? ' AND ' : ' OR ')
    )
    .join(filter.rootJoin === 'all' ? ' AND ' : ' OR ')

  return summary.length > 180 ? `${summary.slice(0, 177)}...` : summary
}

export async function buildSettingsWorkbookBuffer({
  tables,
  folders,
  output,
  variableOverrides = {},
  detectedMrsets = [],
  sourceDataset,
  sourceMappings = [],
  activeLock = null,
}: SettingsWorkbookPayload): Promise<ArrayBuffer> {
  const ExcelJS = await loadExcelJs()
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Crosstab Generator'
  wb.created = new Date()

  const wsTables = wb.addWorksheet('Tables')
  wsTables.getColumn(1).width = 30
  wsTables.getColumn(2).width = 25
  wsTables.getColumn(3).width = 25
  wsTables.getColumn(4).width = 20
  wsTables.getColumn(5).width = 32
  styleHeaderRow(wsTables.addRow(['Table Name', 'Row Variable', 'Column Variable', 'Folder', 'Filter Description']))
  tables.forEach((table, idx) => {
    const folderName = folders.find(folder => folder.id === table.folderId)?.name ?? ''
    styleDataRow(wsTables.addRow([
      table.name,
      table.rowVar ?? '',
      table.colVar ?? '',
      folderName,
      summarizeFilter(table.filter),
    ]), idx % 2 === 1)
  })

  const wsFilters = wb.addWorksheet('Filters')
  wsFilters.getColumn(1).width = 10
  wsFilters.getColumn(2).width = 28
  wsFilters.getColumn(3).width = 32
  wsFilters.getColumn(4).width = 16
  wsFilters.getColumn(5).width = 10
  wsFilters.getColumn(6).width = 20
  wsFilters.getColumn(7).width = 22
  wsFilters.getColumn(8).width = 16
  wsFilters.getColumn(9).width = 30
  wsFilters.getColumn(10).width = 18
  wsFilters.getColumn(11).width = 18
  styleHeaderRow(wsFilters.addRow([
    'Table #',
    'Table Name',
    'Filter Description',
    'Between Groups',
    'Group #',
    'Between Conditions',
    'Variable',
    'Operator',
    'Values',
    'Value',
    'Secondary Value',
  ]))
  let filterRowIndex = 0
  tables.forEach((table, tableIndex) => {
    const activeGroups = (table.filter?.groups ?? []).filter(group => group.conditions.length > 0)
    if (activeGroups.length === 0) return
    activeGroups.forEach((group, groupIndex) => {
      group.conditions.forEach(condition => {
        styleDataRow(wsFilters.addRow([
          tableIndex + 1,
          table.name,
          table.filter?.description ?? '',
          table.filter?.rootJoin ?? 'all',
          groupIndex + 1,
          group.join,
          condition.variableName,
          condition.operator,
          condition.values.join('|'),
          condition.value,
          condition.secondaryValue,
        ]), filterRowIndex % 2 === 1)
        filterRowIndex += 1
      })
    })
  })

  const wsOutput = wb.addWorksheet('Output')
  wsOutput.getColumn(1).width = 24
  wsOutput.getColumn(2).width = 18
  styleHeaderRow(wsOutput.addRow(['Setting', 'Value']))
  ;[
    ['showCount', String(output.showCount)],
    ['showPercent', String(output.showPercent)],
    ['percentType', output.percentType],
    ['hideZeroRows', String(output.hideZeroRows ?? false)],
  ].forEach(([setting, value], idx) => {
    styleDataRow(wsOutput.addRow([setting, value]), idx % 2 === 1)
  })

  const wsSource = wb.addWorksheet('Source')
  wsSource.getColumn(1).width = 24
  wsSource.getColumn(2).width = 60
  styleHeaderRow(wsSource.addRow(['Setting', 'Value']))
  ;[
    ['SPSS File Name', sourceDataset?.fileName ?? ''],
    ['SPSS File Path', sourceDataset?.filePath ?? ''],
    ['Source Mapping Count', String(sourceMappings.length)],
  ].forEach(([setting, value], idx) => {
    styleDataRow(wsSource.addRow([setting, value]), idx % 2 === 1)
  })

  const wsSourceMappings = wb.addWorksheet('SourceMappings')
  wsSourceMappings.getColumn(1).width = 26
  wsSourceMappings.getColumn(2).width = 32
  wsSourceMappings.getColumn(3).width = 60
  wsSourceMappings.getColumn(4).width = 18
  wsSourceMappings.getColumn(5).width = 18
  wsSourceMappings.getColumn(6).width = 24
  wsSourceMappings.getColumn(7).width = 24
  styleHeaderRow(wsSourceMappings.addRow([
    'Id',
    'File Name',
    'File Path',
    'Owner Label',
    'Machine Label',
    'Last Bound At',
    'Last Bound By',
  ]))
  sourceMappings.forEach((mapping, idx) => {
    styleDataRow(wsSourceMappings.addRow([
      mapping.id,
      mapping.fileName,
      mapping.filePath ?? '',
      mapping.ownerLabel ?? '',
      mapping.machineLabel ?? '',
      mapping.lastBoundAt,
      mapping.lastBoundBy ?? '',
    ]), idx % 2 === 1)
  })

  const wsLock = wb.addWorksheet('Lock')
  wsLock.getColumn(1).width = 24
  wsLock.getColumn(2).width = 40
  styleHeaderRow(wsLock.addRow(['Setting', 'Value']))
  ;[
    ['Lock Status', activeLock?.status ?? (activeLock ? 'ACTIVE' : 'UNLOCKED')],
    ['Session Id', activeLock?.sessionId ?? ''],
    ['Owner Label', activeLock?.ownerLabel ?? ''],
    ['Machine Label', activeLock?.machineLabel ?? ''],
    ['Acquired At', activeLock?.acquiredAt ?? ''],
    ['Updated At', activeLock?.updatedAt ?? ''],
    ['Expires At', activeLock?.expiresAt ?? ''],
    ['Exited At', activeLock?.exitedAt ?? ''],
  ].forEach(([setting, value], idx) => {
    styleDataRow(wsLock.addRow([setting, value]), idx % 2 === 1)
  })

  const wsVars = wb.addWorksheet('VariableSettings')
  wsVars.getColumn(1).width = 24
  wsVars.getColumn(2).width = 16
  wsVars.getColumn(3).width = 18
  wsVars.getColumn(4).width = 28
  styleHeaderRow(wsVars.addRow(['Variable', 'Setting', 'Key', 'Value']))
  const { rows: variableRows, netRows } = buildVariableOverrideRows(variableOverrides)
  variableRows.forEach((item, idx) => {
    styleDataRow(wsVars.addRow([item.variable, item.setting, item.key, item.value]), idx % 2 === 1)
  })

  const wsNet = wb.addWorksheet('VariableNet')
  wsNet.getColumn(1).width = 24
  wsNet.getColumn(2).width = 16
  wsNet.getColumn(3).width = 28
  wsNet.getColumn(4).width = 24
  wsNet.getColumn(5).width = 24
  styleHeaderRow(wsNet.addRow(['Variable', 'Setting', 'Value', 'Code', 'Parent']))
  netRows.forEach((item, idx) => {
    styleDataRow(wsNet.addRow([item.variable, item.setting, item.value, item.code, item.parent ?? '']), idx % 2 === 1)
  })

  // ── MRSET sheet ────────────────────────────────────────────────────────────
  const wsMrset = wb.addWorksheet('MRSET')
  wsMrset.getColumn(1).width = 22
  wsMrset.getColumn(2).width = 40
  wsMrset.getColumn(3).width = 60
  styleHeaderRow(wsMrset.addRow(['กลุ่ม MA (Group Name)', 'ชื่อ / Label', 'ตัวแปรสมาชิก (Members) คั่นด้วย ,']))
  // Add header note row
  const noteRow = wsMrset.addRow(['# ตัวอย่าง: Q8J_R2_O', 'Q8J.Formula...', 'Q8J_R2$1,Q8J_R2$2,Q8J_R2$3'])
  noteRow.font = { italic: true, color: { argb: 'FF888888' }, size: 9 }
  noteRow.height = 14
  detectedMrsets.forEach((mrset, idx) => {
    styleDataRow(wsMrset.addRow([mrset.groupName, mrset.label, mrset.members.join(',')]), idx % 2 === 1)
  })

  const allSettings: AllSettings = {
    version: '1.9',
    savedAt: new Date().toISOString(),
    output,
    folders,
    tables,
    variableOverrides,
    customMrsets: detectedMrsets,
    sourceDataset,
    sourceMappings,
    activeLock,
  }
  const wsHidden = wb.addWorksheet('_settings', { state: 'hidden' })
  writeHiddenSettings(wsHidden, allSettings)

  return wb.xlsx.writeBuffer() as Promise<ArrayBuffer>
}

export async function saveSettings(
  tables: TableSetting[],
  folders: FolderSetting[],
  output: OutputSettings,
  variableOverrides: Record<string, unknown> = {},
  filename = 'crosstab_settings.xlsx',
  detectedMrsets: MrsetDefinition[] = [],
  sourceDataset?: SourceDatasetSetting,
  sourceMappings: SourceMappingEntry[] = [],
  activeLock: SettingsLockInfo | null = null,
): Promise<void> {
  const buf = await buildSettingsWorkbookBuffer({
    tables,
    folders,
    output,
    variableOverrides,
    detectedMrsets,
    sourceDataset,
    sourceMappings,
    activeLock,
  })
  saveAs(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    filename
  )
}

export async function loadSettings(file: File): Promise<AllSettings> {
  const buf = await file.arrayBuffer()
  const ExcelJS = await loadExcelJs()
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(buf)

  let outputSettings: OutputSettings = { showCount: true, showPercent: true, percentType: 'column', hideZeroRows: false }
  let savedFolders: FolderSetting[] = []
  let variableOverrides: Record<string, unknown> = {}
  let customMrsets: MrsetDefinition[] = []
  let sourceDataset: SourceDatasetSetting | undefined
  let sourceMappings: SourceMappingEntry[] = []
  let activeLock: SettingsLockInfo | null = null
  let hiddenTables: TableSetting[] = []
  const visibleFilters = new Map<number, TableFilterSpec>()
  const visibleFilterGroups = new Map<number, Map<number, TableFilterGroup>>()

  const wsHidden =
    wb.worksheets.find(ws => ws.name === '_settings') ??
    wb.getWorksheet('_settings')
  if (wsHidden) {
    const rawStr = readHiddenSettings(wsHidden)
    if (rawStr?.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(rawStr) as AllSettings
        if (
          parsed.version === '1.0' || parsed.version === '1.1' || parsed.version === '1.2' ||
          parsed.version === '1.3' || parsed.version === '1.4' || parsed.version === '1.5' || parsed.version === '1.6' ||
          parsed.version === '1.7' || parsed.version === '1.8' || parsed.version === '1.9'
        ) {
          outputSettings = parsed.output ?? outputSettings
          savedFolders = parsed.folders ?? []
          hiddenTables = parsed.tables ?? []
          variableOverrides = parsed.variableOverrides ?? {}
          customMrsets = parsed.customMrsets ?? []
          sourceDataset = parsed.sourceDataset
          sourceMappings = parsed.sourceMappings ?? []
          activeLock = parsed.activeLock ?? null
        }
      } catch {
        // ignore invalid hidden settings
      }
    }
  }

  const wsSource =
    wb.worksheets.find(ws => ws.name.toLowerCase() === 'source') ??
    wb.getWorksheet('Source')
  if (wsSource) {
    let fileName = sourceDataset?.fileName ?? ''
    let filePath = sourceDataset?.filePath ?? ''
    for (let rowNum = 2; rowNum <= wsSource.rowCount; rowNum++) {
      const row = wsSource.getRow(rowNum)
      const key = String(row.getCell(1).value ?? '').trim().toLowerCase()
      const value = String(row.getCell(2).value ?? '').trim()
      if (!key || !value) continue
      if (key === 'spss file name') fileName = value
      if (key === 'spss file path') filePath = value
    }
    if (fileName) {
      sourceDataset = {
        fileName,
        filePath: filePath || undefined,
      }
    }
  }

  const wsSourceMappings =
    wb.worksheets.find(ws => ws.name.toLowerCase() === 'sourcemappings') ??
    wb.getWorksheet('SourceMappings')
  if (wsSourceMappings) {
    const parsedMappings: SourceMappingEntry[] = []
    for (let rowNum = 2; rowNum <= wsSourceMappings.rowCount; rowNum++) {
      const row = wsSourceMappings.getRow(rowNum)
      const id = String(row.getCell(1).value ?? '').trim()
      const fileName = String(row.getCell(2).value ?? '').trim()
      const filePath = String(row.getCell(3).value ?? '').trim()
      const ownerLabel = String(row.getCell(4).value ?? '').trim()
      const machineLabel = String(row.getCell(5).value ?? '').trim()
      const lastBoundAt = String(row.getCell(6).value ?? '').trim()
      const lastBoundBy = String(row.getCell(7).value ?? '').trim()
      if (!id || !fileName || !lastBoundAt) continue
      parsedMappings.push({
        id,
        fileName,
        filePath: filePath || undefined,
        ownerLabel: ownerLabel || undefined,
        machineLabel: machineLabel || undefined,
        lastBoundAt,
        lastBoundBy: lastBoundBy || undefined,
      })
    }
    if (parsedMappings.length > 0) sourceMappings = parsedMappings
  }

  const wsLock =
    wb.worksheets.find(ws => ws.name.toLowerCase() === 'lock') ??
    wb.getWorksheet('Lock')
  if (wsLock) {
    let status = activeLock?.status ?? ''
    let sessionId = activeLock?.sessionId ?? ''
    let ownerLabel = activeLock?.ownerLabel ?? ''
    let machineLabel = activeLock?.machineLabel ?? ''
    let acquiredAt = activeLock?.acquiredAt ?? ''
    let updatedAt = activeLock?.updatedAt ?? ''
    let expiresAt = activeLock?.expiresAt ?? ''
    let exitedAt = activeLock?.exitedAt ?? ''
    for (let rowNum = 2; rowNum <= wsLock.rowCount; rowNum++) {
      const row = wsLock.getRow(rowNum)
      const key = String(row.getCell(1).value ?? '').trim().toLowerCase()
      const value = String(row.getCell(2).value ?? '').trim()
      if (!key || !value) continue
      if (key === 'lock status') status = value.toUpperCase()
      if (key === 'session id') sessionId = value
      if (key === 'owner label') ownerLabel = value
      if (key === 'machine label') machineLabel = value
      if (key === 'acquired at') acquiredAt = value
      if (key === 'updated at') updatedAt = value
      if (key === 'expires at') expiresAt = value
      if (key === 'exited at') exitedAt = value
    }
    if (sessionId && ownerLabel && acquiredAt && expiresAt) {
      activeLock = {
        sessionId,
        ownerLabel,
        machineLabel: machineLabel || undefined,
        status: status === 'EXITED' ? 'EXITED' : 'ACTIVE',
        acquiredAt,
        updatedAt: updatedAt || acquiredAt,
        expiresAt,
        exitedAt: exitedAt || undefined,
      }
    }
  }

  const wsOutput =
    wb.worksheets.find(ws => ws.name.toLowerCase() === 'output') ??
    wb.getWorksheet('Output')
  if (wsOutput) {
    for (let rowNum = 2; rowNum <= wsOutput.rowCount; rowNum++) {
      const row = wsOutput.getRow(rowNum)
      const key = String(row.getCell(1).value ?? '').trim()
      const value = String(row.getCell(2).value ?? '').trim()
      if (!key) continue
      if (key === 'showCount') outputSettings.showCount = value.toLowerCase() === 'true'
      if (key === 'showPercent') outputSettings.showPercent = value.toLowerCase() === 'true'
      if (key === 'percentType' && (value === 'row' || value === 'column' || value === 'total')) outputSettings.percentType = value
      if (key === 'hideZeroRows') outputSettings.hideZeroRows = value.toLowerCase() === 'true'
    }
  }

  const wsTables =
    wb.worksheets.find(ws => ws.name.toLowerCase() === 'tables') ??
    wb.getWorksheet('Tables')
  if (!wsTables) {
    throw new Error('ไม่พบ Sheet "Tables" ในไฟล์ที่เลือก')
  }

  const tables: TableSetting[] = []
  const folderNamesFound = new Set<string>()
  for (let rowNum = 2; rowNum <= wsTables.rowCount; rowNum++) {
    const row = wsTables.getRow(rowNum)
    const name = String(row.getCell(1).value ?? '').trim()
    if (!name) continue
    const rowVar = String(row.getCell(2).value ?? '').trim() || null
    const colVar = String(row.getCell(3).value ?? '').trim() || null
    const folderName = String(row.getCell(4).value ?? '').trim()
    const filterDescription = String(row.getCell(5).value ?? '').trim()
    if (folderName) folderNamesFound.add(folderName)
    const matchedFolder = savedFolders.find(folder => folder.name === folderName)
    tables.push({
      name,
      rowVar,
      colVar,
      folderId: folderName ? (matchedFolder?.id ?? folderName) : null,
      filter: filterDescription
        ? { description: filterDescription, rootJoin: 'all', groups: [] }
        : undefined,
    })
  }

  const wsFilters =
    wb.worksheets.find(ws => ws.name.toLowerCase() === 'filters') ??
    wb.getWorksheet('Filters')
  if (wsFilters) {
    for (let rowNum = 2; rowNum <= wsFilters.rowCount; rowNum++) {
      const row = wsFilters.getRow(rowNum)
      const tableIndex = Number(row.getCell(1).value ?? 0)
      const description = String(row.getCell(3).value ?? '').trim()
      const rootJoinRaw = String(row.getCell(4).value ?? '').trim().toLowerCase()
      const groupIndex = Number(row.getCell(5).value ?? 0)
      const groupJoinRaw = String(row.getCell(6).value ?? '').trim().toLowerCase()
      const variableName = String(row.getCell(7).value ?? '').trim()
      const operatorRaw = String(row.getCell(8).value ?? '').trim()
      const values = String(row.getCell(9).value ?? '')
        .split('|')
        .map(item => item.trim())
        .filter(Boolean)
      const value = String(row.getCell(10).value ?? '')
      const secondaryValue = String(row.getCell(11).value ?? '')

      if (!Number.isFinite(tableIndex) || tableIndex < 1 || !Number.isFinite(groupIndex) || groupIndex < 1 || !variableName) {
        continue
      }

      const rootJoin: FilterJoin = isFilterJoin(rootJoinRaw) ? rootJoinRaw : 'all'
      const groupJoin: FilterJoin = isFilterJoin(groupJoinRaw) ? groupJoinRaw : 'all'
      const operator: FilterOperator = isFilterOperator(operatorRaw) ? operatorRaw : 'in'

      const filter = visibleFilters.get(tableIndex) ?? {
        description,
        rootJoin,
        groups: [],
      }
      if (!filter.description && description) filter.description = description
      filter.rootJoin = rootJoin
      visibleFilters.set(tableIndex, filter)

      let groupMap = visibleFilterGroups.get(tableIndex)
      if (!groupMap) {
        groupMap = new Map<number, TableFilterGroup>()
        visibleFilterGroups.set(tableIndex, groupMap)
      }

      let group = groupMap.get(groupIndex)
      if (!group) {
        group = {
          id: `table_${tableIndex}_group_${groupIndex}`,
          join: groupJoin,
          conditions: [],
        }
        groupMap.set(groupIndex, group)
        filter.groups.push(group)
      } else {
        group.join = groupJoin
      }

      group.conditions.push({
        id: `table_${tableIndex}_group_${groupIndex}_condition_${rowNum}`,
        variableName,
        operator,
        values,
        value,
        secondaryValue,
      })
    }
  }

  if (hiddenTables.length > 0) {
    tables.forEach((table, index) => {
      const hiddenTable = hiddenTables[index]
      if (!hiddenTable) return
      table.filter = hiddenTable.filter ?? table.filter
    })
  }

  if (visibleFilters.size > 0) {
    tables.forEach((table, index) => {
      const visibleFilter = visibleFilters.get(index + 1)
      if (!visibleFilter) return
      table.filter = visibleFilter
    })
  }

  const folders: FolderSetting[] = [...folderNamesFound].map(name => {
    const saved = savedFolders.find(folder => folder.name === name)
    return { id: saved?.id ?? name, name }
  })

  const wsVars =
    wb.worksheets.find(ws => ws.name.toLowerCase() === 'variablesettings') ??
    wb.getWorksheet('VariableSettings')
  const wsNet =
    wb.worksheets.find(ws => ws.name.toLowerCase() === 'variablenet') ??
    wb.getWorksheet('VariableNet')
  if (wsVars) {
    const rows: VariableOverrideSheetRow[] = []
    for (let rowNum = 2; rowNum <= wsVars.rowCount; rowNum++) {
      const row = wsVars.getRow(rowNum)
      const variable = String(row.getCell(1).value ?? '').trim()
      const setting = String(row.getCell(2).value ?? '').trim()
      const key = String(row.getCell(3).value ?? '').trim()
      const value = String(row.getCell(4).value ?? '').trim()
      const extra1 = String(row.getCell(5).value ?? '').trim()
      const extra2 = String(row.getCell(6).value ?? '').trim()
      if (!variable || !setting) continue
      rows.push({ variable, setting, key, value, extra1, extra2 })
    }
    const netRows: VariableNetSheetRow[] = []
    if (wsNet) {
      for (let rowNum = 2; rowNum <= wsNet.rowCount; rowNum++) {
        const row = wsNet.getRow(rowNum)
        const variable = String(row.getCell(1).value ?? '').trim()
        const setting = String(row.getCell(2).value ?? '').trim()
        const value = String(row.getCell(3).value ?? '').trim()
        const code = String(row.getCell(4).value ?? '').trim()
        const parent = String(row.getCell(5).value ?? '').trim()
        if (!variable || !setting || !value) continue
        netRows.push({ variable, setting, value, code, parent })
      }
    }
    variableOverrides = parseVariableOverrideRows(rows, netRows)
  }

  const wsTb =
    wb.worksheets.find(ws => ws.name.toLowerCase() === 'tb_setting') ??
    wb.getWorksheet('TB_Setting')
  if (wsTb) {
    for (let rowNum = 2; rowNum <= wsTb.rowCount; rowNum++) {
      const row = wsTb.getRow(rowNum)
      const variable = String(row.getCell(1).value ?? '').trim()
      const setting = String(row.getCell(2).value ?? '').trim()
      const preset = parseScalePresetEntry(setting)
      if (!variable || !preset) continue
      const current = (variableOverrides[variable] ?? {}) as Record<string, unknown>
      variableOverrides[variable] = {
        ...current,
        summaryPreset: preset,
      }
    }
  }

  // ── Read MRSET sheet (user-defined MA groups) ────────────────────────────
  const wsMrset =
    wb.worksheets.find(ws => ws.name.toLowerCase() === 'mrset') ??
    wb.getWorksheet('MRSET')
  if (wsMrset) {
    for (let rowNum = 3; rowNum <= wsMrset.rowCount; rowNum++) {  // row 1=header, row 2=example note
      const row = wsMrset.getRow(rowNum)
      const groupName = String(row.getCell(1).value ?? '').trim()
      if (!groupName || groupName.startsWith('#')) continue
      const label = String(row.getCell(2).value ?? '').trim()
      const membersRaw = String(row.getCell(3).value ?? '').trim()
      const members = membersRaw.split(',').map(m => m.trim()).filter(Boolean)
      if (members.length >= 2) {
        // Override or add — later entries in file win for same groupName
        const existing = customMrsets.findIndex(m => m.groupName === groupName)
        const def: MrsetDefinition = { groupName, label, members }
        if (existing >= 0) customMrsets[existing] = def
        else customMrsets.push(def)
      }
    }
  }

  if (sourceMappings.length === 0 && sourceDataset?.fileName) {
    sourceMappings = [{
      id: `legacy:${sourceDataset.filePath?.trim().toLowerCase() || sourceDataset.fileName.trim().toLowerCase()}`,
      fileName: sourceDataset.fileName,
      filePath: sourceDataset.filePath,
      lastBoundAt: new Date().toISOString(),
      lastBoundBy: 'legacy',
    }]
  }

  if (activeLock) {
    activeLock = {
      ...activeLock,
      status: activeLock.status === 'EXITED' ? 'EXITED' : 'ACTIVE',
      updatedAt: activeLock.updatedAt || activeLock.acquiredAt,
    }
  }

  return {
    version: '1.9',
    savedAt: new Date().toISOString(),
    output: outputSettings,
    folders,
    tables,
    variableOverrides,
    customMrsets,
    sourceDataset,
    sourceMappings,
    activeLock,
  }
}
