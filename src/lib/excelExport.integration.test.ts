/**
 * Integration tests for excelExport.ts — uses real ExcelJS + mocked saveAs.
 *
 * jsdom provides `window` so that loadExcelJs() can cache the module there.
 * `file-saver` is mocked so no actual file dialog appears.
 *
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeAll } from 'vitest'
import { buildCrosstabWorkbook, exportCrosstabToExcel, exportTableToExcel, exportAllTablesToExcel } from './excelExport'
import type { CrosstabResult, CrosstabConfig } from './crosstabEngine'

// Mock file-saver so saveAs doesn't throw in jsdom
vi.mock('file-saver', () => ({ saveAs: vi.fn() }))

import { saveAs } from 'file-saver'

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeResult(overrides: Partial<CrosstabResult> = {}): CrosstabResult {
  return {
    rowVar: 'Q1', colVar: 'GENDER',
    rowLabel: 'Satisfaction', colLabel: 'Gender',
    rowValues: ['Yes', 'No'],
    colValues: ['Male', 'Female'],
    colPaths: [['Male'], ['Female']],
    counts: [[30, 20], [10, 40]],
    rowTotalsN: [50, 50],
    colTotalsN: [40, 60],
    grandTotal: 100,
    ...overrides,
  }
}

function makeConfig(overrides: Partial<CrosstabConfig> = {}): CrosstabConfig {
  return {
    rowVar: 'Q1', colVar: 'GENDER',
    showCount: true, showPercent: false, percentType: 'column',
    ...overrides,
  }
}

// ─── buildCrosstabWorkbook ────────────────────────────────────────────────────

describe('buildCrosstabWorkbook', () => {
  it('returns a workbook with one data sheet for single item', async () => {
    const wb = await buildCrosstabWorkbook([{ result: makeResult(), config: makeConfig() }])
    // Single table → no Index sheet, just one data sheet
    expect(wb.worksheets).toHaveLength(1)
  })

  it('returns Index + data sheets when multiple items', async () => {
    const items = [
      { result: makeResult(), config: makeConfig(), tableName: 'T1' },
      { result: makeResult(), config: makeConfig(), tableName: 'T2' },
    ]
    const wb = await buildCrosstabWorkbook(items)
    expect(wb.worksheets.length).toBe(3)  // Index + T1 + T2
    expect(wb.worksheets[0].name).toBe('Index')
  })

  it('sheet name is sanitized from tableName', async () => {
    const wb = await buildCrosstabWorkbook([{
      result: makeResult(),
      config: makeConfig(),
      tableName: 'My:Table*Name',
    }])
    expect(wb.worksheets[0].name).toBe('MyTableName')
  })

  it('deduplicates sheet names when tables share the same name', async () => {
    const items = [
      { result: makeResult(), config: makeConfig(), tableName: 'Dup' },
      { result: makeResult(), config: makeConfig(), tableName: 'Dup' },
    ]
    const wb = await buildCrosstabWorkbook(items)
    const names = wb.worksheets.map(ws => ws.name)
    expect(new Set(names).size).toBe(names.length)  // all unique
  })

  it('produces a non-empty xlsx buffer', async () => {
    const wb = await buildCrosstabWorkbook([{ result: makeResult(), config: makeConfig() }])
    const buf = await wb.xlsx.writeBuffer()
    expect(buf.byteLength).toBeGreaterThan(0)
  })
})

// ─── exportCrosstabToExcel ────────────────────────────────────────────────────

describe('exportCrosstabToExcel', () => {
  beforeAll(() => { vi.clearAllMocks() })

  it('calls saveAs with correct filename', async () => {
    await exportCrosstabToExcel(makeResult(), makeConfig(), 'My Table', undefined, 'my_table.xlsx')
    expect(saveAs).toHaveBeenCalledTimes(1)
    const [, filename] = vi.mocked(saveAs).mock.calls[0]
    expect(filename).toBe('my_table.xlsx')
  })

  it('calls saveAs with a Blob of xlsx type', async () => {
    vi.clearAllMocks()
    await exportCrosstabToExcel(makeResult(), makeConfig(), undefined, undefined, 'out.xlsx')
    const [blob] = vi.mocked(saveAs).mock.calls[0] as [Blob, string]
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  })
})

// ─── exportTableToExcel ───────────────────────────────────────────────────────

describe('exportTableToExcel', () => {
  it('throws when table.result is null', async () => {
    await expect(
      exportTableToExcel(
        { name: 'T', rowVar: 'Q1', colVar: 'GENDER', result: null },
        null, null,
        { showCount: true, showPercent: false, percentType: 'column' },
      )
    ).rejects.toThrow()
  })

  it('calls saveAs with table name as filename', async () => {
    vi.clearAllMocks()
    await exportTableToExcel(
      { name: 'SurveyTable', rowVar: 'Q1', colVar: 'GENDER', result: makeResult() },
      null, null,
      { showCount: true, showPercent: false, percentType: 'column' },
    )
    const [, filename] = vi.mocked(saveAs).mock.calls[0]
    expect(filename).toBe('SurveyTable.xlsx')
  })
})

// ─── exportAllTablesToExcel ───────────────────────────────────────────────────

describe('exportAllTablesToExcel', () => {
  it('skips tables with null result', async () => {
    vi.clearAllMocks()
    await exportAllTablesToExcel(
      [
        { name: 'T1', rowVar: 'Q1', colVar: 'G', result: makeResult() },
        { name: 'T2', rowVar: 'Q2', colVar: 'G', result: null },    // skipped
      ],
      null, null,
      { showCount: true, showPercent: false, percentType: 'column' },
    )
    expect(saveAs).toHaveBeenCalledTimes(1)
  })

  it('uses settingsName as filename when provided', async () => {
    vi.clearAllMocks()
    await exportAllTablesToExcel(
      [{ name: 'T1', rowVar: 'Q1', colVar: 'G', result: makeResult() }],
      null, null,
      { showCount: true, showPercent: false, percentType: 'column' },
      'MySurvey',
    )
    const [, filename] = vi.mocked(saveAs).mock.calls[0]
    expect(filename).toBe('MySurvey.xlsx')
  })

  it('defaults to crosstab_all.xlsx when no settingsName', async () => {
    vi.clearAllMocks()
    await exportAllTablesToExcel(
      [{ name: 'T1', rowVar: 'Q1', colVar: 'G', result: makeResult() }],
      null, null,
      { showCount: true, showPercent: false, percentType: 'column' },
    )
    const [, filename] = vi.mocked(saveAs).mock.calls[0]
    expect(filename).toBe('crosstab_all.xlsx')
  })
})
