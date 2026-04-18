import type * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import type { CrosstabResult, CrosstabConfig } from './crosstabEngine'
import { getPct, filterZeroRows } from './crosstabEngine'

const C = {
  headerBg:   '1F4E78',
  headerFg:   'FFFFFF',
  subBg:      '2E75B6',
  totalBg:    'D6E4F0',
  oddBg:      'FFFFFF',
  evenBg:     'EBF3FB',
  border:     'BDD7EE',
  baseBg:     'D9E1F2',
  indexTitle: '1F4E78',
  indexHdr:   '2E75B6',
  indexLink:  '0563C1',
  backLink:   '0563C1',
  meanBg:     'FDE2E1',
  meanFg:     'C00000',
  netBg:      'E2F0D9',
  netFg:      '2F6B2F',
  filterFg:   '666666',
} as const

async function loadExcelJs() {
  const module = await import('exceljs')
  const EJS = module.default;
  // Cache on window for inline scripts (Sig/TB_Setting interceptors)
  (window as unknown as Record<string, unknown>).__cxExcelJSModule = EJS
  return EJS
}

function mkBorder(s: ExcelJS.BorderStyle = 'thin'): Partial<ExcelJS.Borders> {
  const b = { style: s, color: { argb: `FF${C.border}` } } as ExcelJS.Border
  return { top: b, left: b, bottom: b, right: b }
}

function styleHeader(cell: ExcelJS.Cell, bg: string = C.headerBg) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${bg}` } }
  cell.font = { bold: true, color: { argb: `FF${C.headerFg}` }, size: 11, name: 'Calibri' }
  cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  cell.border = mkBorder('medium')
}

function styleSubHeader(cell: ExcelJS.Cell) {
  styleHeader(cell, C.subBg)
}

function styleBase(cell: ExcelJS.Cell) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${C.baseBg}` } }
  cell.font = { bold: true, size: 10, name: 'Calibri' }
  cell.alignment = { horizontal: 'center', vertical: 'middle' }
  cell.border = mkBorder()
}

function styleBaseLabel(cell: ExcelJS.Cell) {
  styleBase(cell)
  cell.alignment = { horizontal: 'left', vertical: 'middle' }
}

function styleTotal(cell: ExcelJS.Cell) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${C.totalBg}` } }
  cell.font = { bold: true, size: 10, name: 'Calibri' }
  cell.alignment = { horizontal: 'center', vertical: 'middle' }
  cell.border = mkBorder()
}

function styleData(cell: ExcelJS.Cell, even: boolean) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${even ? C.evenBg : C.oddBg}` } }
  cell.font = { size: 10, name: 'Calibri' }
  cell.alignment = { horizontal: 'center', vertical: 'middle' }
  cell.border = mkBorder()
}

function styleDataLabel(cell: ExcelJS.Cell, even: boolean) {
  styleData(cell, even)
  cell.alignment = { horizontal: 'left', vertical: 'middle' }
}

function styleMean(cell: ExcelJS.Cell) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${C.meanBg}` } }
  cell.font = { bold: true, size: 10, name: 'Calibri', color: { argb: `FF${C.meanFg}` } }
  cell.alignment = { horizontal: 'center', vertical: 'middle' }
  cell.border = mkBorder()
}

function styleMeanLabel(cell: ExcelJS.Cell) {
  styleMean(cell)
  cell.alignment = { horizontal: 'left', vertical: 'middle' }
}

function styleNet(cell: ExcelJS.Cell) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${C.netBg}` } }
  cell.font = { bold: true, size: 10, name: 'Calibri', color: { argb: `FF${C.netFg}` } }
  cell.alignment = { horizontal: 'center', vertical: 'middle' }
  cell.border = mkBorder()
}

function styleNetLabel(cell: ExcelJS.Cell) {
  styleNet(cell)
  cell.alignment = { horizontal: 'left', vertical: 'middle' }
}

function styleBlankLabel(cell: ExcelJS.Cell) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${C.oddBg}` } }
  cell.font = { size: 10, name: 'Calibri' }
  cell.alignment = { horizontal: 'left', vertical: 'middle' }
  cell.border = mkBorder()
}

function styleFilterSummary(cell: ExcelJS.Cell) {
  cell.font = { italic: true, size: 9, name: 'Calibri', color: { argb: `FF${C.filterFg}` } }
  cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: false }
}

function styleMetaTitle(cell: ExcelJS.Cell) {
  cell.font = { bold: true, size: 12, color: { argb: `FF${C.indexTitle}` }, name: 'Calibri' }
  cell.alignment = { horizontal: 'left', vertical: 'middle' }
}

function styleMetaLink(cell: ExcelJS.Cell) {
  cell.font = { color: { argb: `FF${C.backLink}` }, underline: true, size: 9, italic: true, name: 'Calibri' }
  cell.alignment = { horizontal: 'left', vertical: 'middle' }
}

function setPctValue(cell: ExcelJS.Cell, pct: number) {
  cell.value = Number((pct * 100).toFixed(1))
  cell.numFmt = '0.0'
}

function setMeanValue(cell: ExcelJS.Cell, value: number) {
  cell.value = Number(value.toFixed(2))
  cell.numFmt = '0.00'
}

function safeMergeCells(ws: ExcelJS.Worksheet, startRow: number, startCol: number, endRow: number, endCol: number) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      if (ws.getCell(row, col).isMerged) return
    }
  }
  ws.mergeCells(startRow, startCol, endRow, endCol)
}

export function excelColName(col: number): string {
  let n = col
  let name = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    name = String.fromCharCode(65 + rem) + name
    n = Math.floor((n - 1) / 26)
  }
  return name
}

export function sanitizeSheetName(raw: string): string {
  return raw.replace(/[\\/*?[\]:]/g, '').substring(0, 31).trim() || 'Sheet'
}

export function computeSheetNames(varNames: string[]): string[] {
  const used = new Set<string>()
  return varNames.map(name => {
    const base = sanitizeSheetName(name)
    if (!used.has(base)) {
      used.add(base)
      return base
    }

    for (let i = 2; i <= 99; i++) {
      const candidate = sanitizeSheetName(name).substring(0, 27) + ` (${i})`
      if (!used.has(candidate)) {
        used.add(candidate)
        return candidate
      }
    }

    const fallback = sanitizeSheetName(name).substring(0, 24) + '_' + Date.now().toString().slice(-4)
    used.add(fallback)
    return fallback
  })
}

export function buildHeaderGroups(paths: string[][], levels: number) {
  return Array.from({ length: levels }, (_, level) => {
    const groups: Array<{ label: string; span: number }> = []
    let currentKey = ''

    paths.forEach(path => {
      const key = path.slice(0, level + 1).join('\u0001')
      const label = path[level] ?? ''
      if (groups.length === 0 || key !== currentKey) {
        groups.push({ label, span: 1 })
        currentKey = key
      } else {
        groups[groups.length - 1].span += 1
      }
    })

    return groups
  })
}

export function buildRowDisplayPaths(paths: string[][]) {
  return paths.map((path, rowIndex) =>
    path.map((segment, level) => {
      if (rowIndex === 0) return segment
      const previous = paths[rowIndex - 1] ?? []
      const samePrefix = path.slice(0, level + 1).every((value, idx) => value === previous[idx])
      return samePrefix ? '' : segment
    })
  )
}

export function buildRowSectionMeta(sectionBases: Array<{ startIndex: number; label: string }>, totalRows: number) {
  const byStart = new Map<number, { label: string; span: number }>()
  const covered = new Set<number>()

  sectionBases.forEach((section, index) => {
    const end = (sectionBases[index + 1]?.startIndex ?? totalRows) - 1
    byStart.set(section.startIndex, { label: section.label, span: end - section.startIndex + 1 })
    for (let row = section.startIndex + 1; row <= end; row++) covered.add(row)
  })

  return { byStart, covered }
}

export function normalizeRowStructure(
  result: CrosstabResult,
  rowPaths: string[][],
  rowLevelLabels: string[],
  rowSectionBases: Array<{ startIndex: number; label: string; totalN: number; colTotalsN: number[] }>,
) {
  if (rowSectionBases.length === 0 && rowLevelLabels.length === 1) {
    return {
      rowPaths: rowPaths.map(path => [result.rowLabel, path[0] ?? '']),
      rowLevelLabels: ['Variable', 'Category'],
      rowSectionBases: [{
        startIndex: 0,
        label: result.rowLabel,
        totalN: result.grandTotal,
        colTotalsN: result.colTotalsN,
      }],
    }
  }

  return { rowPaths, rowLevelLabels, rowSectionBases }
}

const INDEX_SHEET = 'Index'

function buildIndexSheet(
  wb: ExcelJS.Workbook,
  items: Array<{ result: CrosstabResult; tableName: string; sheetName: string }>
) {
  const ws = wb.addWorksheet(INDEX_SHEET, { views: [{ showGridLines: false }] })
  ws.views = [{ state: 'frozen', xSplit: 1, ySplit: 4, topLeftCell: 'B5', showGridLines: false }]
  ws.getColumn(1).width = 18
  ws.getColumn(2).width = 55
  ws.getColumn(3).width = 10

  const titleRow = ws.addRow(['Crosstab Tables - Index'])
  titleRow.height = 26
  const titleCell = titleRow.getCell(1)
  titleCell.font = { bold: true, size: 14, color: { argb: `FF${C.indexTitle}` }, name: 'Calibri' }
  titleCell.alignment = { vertical: 'middle' }
  safeMergeCells(ws, 1, 1, 1, 3)
  ws.addRow([])

  const headerRow = ws.addRow(['Table', 'Row Variable Question', 'n='])
  headerRow.height = 20
  ;[1, 2, 3].forEach(c => styleHeader(headerRow.getCell(c)))

  items.forEach(({ result, tableName, sheetName }, idx) => {
    const row = ws.addRow([])
    row.height = 18
    const even = idx % 2 === 1
    const fillArgb = `FF${even ? C.evenBg : C.oddBg}`

    const tableCell = row.getCell(1)
    tableCell.value = { text: tableName, hyperlink: `#'${sheetName}'!A1` }
    tableCell.font = { color: { argb: `FF${C.indexLink}` }, underline: true, size: 10, name: 'Calibri' }
    tableCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillArgb } }
    tableCell.alignment = { vertical: 'middle' }
    tableCell.border = mkBorder()

    const rowLabelCell = row.getCell(2)
    rowLabelCell.value = result.rowLabel
    rowLabelCell.font = { size: 10, name: 'Calibri' }
    rowLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillArgb } }
    rowLabelCell.alignment = { vertical: 'middle' }
    rowLabelCell.border = mkBorder()

    const nCell = row.getCell(3)
    nCell.value = result.grandTotal
    nCell.font = { size: 10, name: 'Calibri' }
    nCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillArgb } }
    nCell.alignment = { horizontal: 'center', vertical: 'middle' }
    nCell.border = mkBorder()
  })
}

function addCrosstabSheet(
  wb: ExcelJS.Workbook,
  result: CrosstabResult,
  config: CrosstabConfig,
  sheetName: string,
  hasIndex: boolean,
  tableName: string | undefined,
  filterSummary?: string
) {
  const displayResult = filterZeroRows(result, config.hideZeroRows ?? false)
  const { rowValues, colValues, counts, rowTotalsN, colTotalsN, grandTotal } = displayResult
  const { showCount, showPercent, percentType } = config
  const hideTotal = config.hideTotal ?? false
  const showBoth = showCount && showPercent
  const rawRowPaths = displayResult.rowPaths ?? rowValues.map(value => [value])
  const colPaths = displayResult.colPaths ?? colValues.map(value => [value])
  const rawRowLevelLabels = displayResult.rowLevelLabels ?? [displayResult.rowLabel]
  const colLevelLabels = displayResult.colLevelLabels ?? [displayResult.colLabel]
  const normalizedRows = normalizeRowStructure(displayResult, rawRowPaths, rawRowLevelLabels, displayResult.rowSectionBases ?? [])
  const rowPaths = normalizedRows.rowPaths
  const rowLevelLabels = normalizedRows.rowLevelLabels
  const rowDisplayPaths = buildRowDisplayPaths(rowPaths)
  const rowTypes = displayResult.rowTypes ?? rowValues.map(() => 'data')
  const colHeaderGroups = buildHeaderGroups(colPaths, colLevelLabels.length)
  const rowLabelCols = Math.max(1, rowLevelLabels.length)
  const rowSectionBases = normalizedRows.rowSectionBases
  const rowSectionMeta = buildRowSectionMeta(rowSectionBases, rowValues.length)
  const subCols = showBoth ? 2 : 1
  const totalNCol = hideTotal ? -1 : rowLabelCols + 1
  const totalPCol = hideTotal ? -1 : (showBoth ? (rowLabelCols + 2) : -1)
  const dataStartCol = hideTotal ? rowLabelCols + 1 : rowLabelCols + 1 + subCols
  const totalCols = hideTotal
    ? rowLabelCols + colValues.length * subCols
    : rowLabelCols + subCols + colValues.length * subCols

  const ws = wb.addWorksheet(sheetName, { views: [{ showGridLines: false }] })
  const pendingRowMerges: Array<{ startRow: number; endRow: number; col: number }> = []

  for (let col = 1; col <= rowLabelCols; col++) ws.getColumn(col).width = col === rowLabelCols ? 28 : 18
  for (let col = rowLabelCols + 1; col <= totalCols; col++) ws.getColumn(col).width = showBoth ? 8 : 12

  const metaRow = ws.addRow([])
  metaRow.height = 18
  const titleCell = metaRow.getCell(1)
  titleCell.value = tableName || sheetName
  styleMetaTitle(titleCell)

  if (hasIndex) {
    const backCell = metaRow.getCell(2)
    backCell.value = { text: '<- Back to Index', hyperlink: `#'${INDEX_SHEET}'!A1` }
    styleMetaLink(backCell)
  }

  if (filterSummary) {
    const filterCell = metaRow.getCell(Math.max(3, totalNCol))
    filterCell.value = `Filter: ${filterSummary}`
    styleFilterSummary(filterCell)
  }

  const topHeaderRow = ws.addRow([])
  topHeaderRow.height = 22
  for (let col = 1; col <= rowLabelCols; col++) topHeaderRow.getCell(col).value = ''
  if (!hideTotal) {
    const totalTopCell = topHeaderRow.getCell(totalNCol)
    totalTopCell.value = 'Total'
    styleHeader(totalTopCell)
    if (showBoth) safeMergeCells(ws, topHeaderRow.number, totalNCol, topHeaderRow.number, totalNCol + 1)
  }
  const colTitleCell = topHeaderRow.getCell(dataStartCol)
  colTitleCell.value = displayResult.colLabel
  styleHeader(colTitleCell)
  if (colValues.length * subCols > 1) {
    safeMergeCells(ws, topHeaderRow.number, dataStartCol, topHeaderRow.number, dataStartCol + colValues.length * subCols - 1)
  }

  colHeaderGroups.forEach((groups, level) => {
    const headerRow = ws.addRow([])
    headerRow.height = 22

    if (level === 0) {
      rowLevelLabels.forEach((_, idx) => {
        const cell = headerRow.getCell(idx + 1)
        cell.value = ''
      })
      if (!hideTotal) {
        const totalCell = headerRow.getCell(totalNCol)
        totalCell.value = `N=${grandTotal.toLocaleString()}`
        styleSubHeader(totalCell)
        if (showBoth) safeMergeCells(ws, headerRow.number, totalNCol, headerRow.number, totalNCol + 1)
      }
    } else {
      for (let col = 1; col <= rowLabelCols; col++) headerRow.getCell(col).value = ''
      if (!hideTotal) {
        for (let col = totalNCol; col < dataStartCol; col++) styleSubHeader(headerRow.getCell(col))
      }
    }

    let startCol = dataStartCol
    groups.forEach(group => {
      const span = group.span * subCols
      const cell = headerRow.getCell(startCol)
      cell.value = group.label
      styleSubHeader(cell)
      if (span > 1) safeMergeCells(ws, headerRow.number, startCol, headerRow.number, startCol + span - 1)
      startCol += span
    })
  })

  const metricRow = ws.addRow([])
  metricRow.height = 18
  for (let col = 1; col <= rowLabelCols; col++) metricRow.getCell(col).value = ''
  ws.views = [{
    state: 'frozen',
    xSplit: dataStartCol - 1,
    ySplit: metricRow.number,
    topLeftCell: `${excelColName(dataStartCol)}${metricRow.number + 1}`,
    showGridLines: false,
  }]

  if (showBoth) {
    if (!hideTotal) {
      const totalNHeader = metricRow.getCell(totalNCol)
      totalNHeader.value = 'N'
      styleSubHeader(totalNHeader)

      const totalPctHeader = metricRow.getCell(totalPCol)
      totalPctHeader.value = '%'
      styleSubHeader(totalPctHeader)
    }

    for (let ci = 0; ci < colValues.length; ci++) {
      const startCol = dataStartCol + ci * subCols
      const nHeader = metricRow.getCell(startCol)
      nHeader.value = 'N'
      styleSubHeader(nHeader)

      const pctHeader = metricRow.getCell(startCol + 1)
      pctHeader.value = '%'
      styleSubHeader(pctHeader)
    }
  } else {
    const metricLabel = showCount ? 'N' : '%'
    if (!hideTotal) {
      const totalMetric = metricRow.getCell(totalNCol)
      totalMetric.value = metricLabel
      styleSubHeader(totalMetric)
    }

    for (let ci = 0; ci < colValues.length; ci++) {
      const startCol = dataStartCol + ci * subCols
      const metricCell = metricRow.getCell(startCol)
      metricCell.value = metricLabel
      styleSubHeader(metricCell)
    }
  }

  const addBaseRow = (totalN: number, baseColTotalsN: number[], blankVariableCol = false) => {
    const baseRow = ws.addRow([])
    baseRow.height = 20
    if (blankVariableCol && rowLabelCols > 1) {
      const blankCell = baseRow.getCell(1)
      blankCell.value = ''
      styleBlankLabel(blankCell)
      const baseCell = baseRow.getCell(2)
      baseCell.value = 'Base'
      styleBaseLabel(baseCell)
      for (let col = 3; col <= rowLabelCols; col++) styleBase(baseRow.getCell(col))
      if (rowLabelCols > 2) safeMergeCells(ws, baseRow.number, 2, baseRow.number, rowLabelCols)
    } else {
      const baseCell = baseRow.getCell(1)
      baseCell.value = 'Base'
      styleBaseLabel(baseCell)
      for (let col = 2; col <= rowLabelCols; col++) styleBase(baseRow.getCell(col))
      if (rowLabelCols > 1) safeMergeCells(ws, baseRow.number, 1, baseRow.number, rowLabelCols)
    }

    if (!hideTotal) {
      if (showBoth) {
        const totalNCell = baseRow.getCell(totalNCol)
        totalNCell.value = totalN
        styleBase(totalNCell)

        const totalPctCell = baseRow.getCell(totalPCol)
        setPctValue(totalPctCell, 1)
        styleBase(totalPctCell)
      } else if (showCount) {
        const totalNCell = baseRow.getCell(totalNCol)
        totalNCell.value = totalN
        styleBase(totalNCell)
      } else {
        const totalPctCell = baseRow.getCell(totalNCol)
        setPctValue(totalPctCell, 1)
        styleBase(totalPctCell)
      }
    }

    for (let ci = 0; ci < colValues.length; ci++) {
      const n = baseColTotalsN[ci]
      const pct = n === 0 ? 0 : percentType === 'column' ? 1 : grandTotal > 0 ? n / grandTotal : 0
      const startCol = dataStartCol + ci * subCols

      if (showBoth) {
        const nCell = baseRow.getCell(startCol)
        const pctCell = baseRow.getCell(startCol + 1)
        styleBase(nCell)
        styleBase(pctCell)
        if (n === 0) {
          nCell.value = '-'
          pctCell.value = '-'
        } else {
          nCell.value = n
          setPctValue(pctCell, pct)
        }
      } else if (showCount) {
        const nCell = baseRow.getCell(startCol)
        styleBase(nCell)
        nCell.value = n === 0 ? '-' : n
      } else {
        const pctCell = baseRow.getCell(startCol)
        styleBase(pctCell)
        if (n === 0) pctCell.value = '-'
        else setPctValue(pctCell, pct)
      }
    }

    return baseRow.number
  }

  if (rowSectionBases.length === 0) {
    addBaseRow(grandTotal, colTotalsN)
  }

  for (let ri = 0; ri < rowValues.length; ri++) {
    const sectionBase = rowSectionBases.find(section => section.startIndex === ri)
    const baseRowNumber = sectionBase ? addBaseRow(sectionBase.totalN, sectionBase.colTotalsN, true) : null
    const row = ws.addRow([])
    row.height = 18
    const even = ri % 2 === 1
    const isMeanRow = rowTypes[ri] === 'stat'
    const isNetRow = rowTypes[ri] === 'net'

    if (rowSectionBases.length > 0) {
      const section = rowSectionMeta.byStart.get(ri)
      if (section) {
        const variableRowNumber = baseRowNumber ?? row.number
        const variableCell = ws.getCell(variableRowNumber, 1)
        if (isNetRow) styleNetLabel(variableCell)
        else styleBlankLabel(variableCell)
        variableCell.value = section.label
        if (section.span > 1) {
          pendingRowMerges.push({
            startRow: variableRowNumber,
            endRow: variableRowNumber + section.span,
            col: 1,
          })
        }
      }

      for (let level = 1; level < rowLabelCols; level++) {
        const cell = row.getCell(level + 1)
        if (isMeanRow) styleMeanLabel(cell)
        else if (isNetRow) styleNetLabel(cell)
        else styleDataLabel(cell, even)
        cell.value = rowDisplayPaths[ri]?.[level] ?? ''
      }
    } else {
      for (let level = 0; level < rowLabelCols; level++) {
        const cell = row.getCell(level + 1)
        if (isMeanRow) styleMeanLabel(cell)
        else if (isNetRow) styleNetLabel(cell)
        else styleDataLabel(cell, even)
        cell.value = rowDisplayPaths[ri]?.[level] ?? ''
      }
    }

    const rowTotal = rowTotalsN[ri]
    const rowPct = grandTotal > 0 ? rowTotal / grandTotal : 0

    if (!hideTotal) {
      if (showBoth) {
        const nCell = row.getCell(totalNCol)
        const pctCell = row.getCell(totalPCol)
        if (isMeanRow) {
          styleMean(nCell)
          styleMean(pctCell)
        } else if (isNetRow) {
          styleNet(nCell)
          styleNet(pctCell)
        } else {
          styleTotal(nCell)
          styleTotal(pctCell)
        }
        if (isMeanRow) {
          setMeanValue(nCell, rowTotal)
          pctCell.value = ''
        } else if (rowTotal === 0) {
          nCell.value = '-'
          pctCell.value = '-'
        } else {
          nCell.value = rowTotal
          setPctValue(pctCell, rowPct)
        }
      } else if (showCount) {
        const nCell = row.getCell(totalNCol)
        if (isMeanRow) styleMean(nCell)
        else if (isNetRow) styleNet(nCell)
        else styleTotal(nCell)
        if (isMeanRow) setMeanValue(nCell, rowTotal)
        else nCell.value = rowTotal === 0 ? '-' : rowTotal
      } else {
        const pctCell = row.getCell(totalNCol)
        if (isMeanRow) styleMean(pctCell)
        else if (isNetRow) styleNet(pctCell)
        else styleTotal(pctCell)
        if (isMeanRow) setMeanValue(pctCell, rowTotal)
        else if (rowTotal === 0) pctCell.value = '-'
        else setPctValue(pctCell, rowPct)
      }
    }

    for (let ci = 0; ci < colValues.length; ci++) {
      const n = counts[ri][ci]
      const pct = getPct(n, ri, ci, displayResult, percentType)
      const startCol = dataStartCol + ci * subCols

      if (showBoth) {
        const nCell = row.getCell(startCol)
        const pctCell = row.getCell(startCol + 1)
        if (isMeanRow) {
          styleMean(nCell)
          styleMean(pctCell)
        } else if (isNetRow) {
          styleNet(nCell)
          styleNet(pctCell)
        } else {
          styleData(nCell, even)
          styleData(pctCell, even)
        }
        if (isMeanRow) {
          if (n === 0) nCell.value = '-'
          else setMeanValue(nCell, n)
          pctCell.value = ''
        } else if (n === 0) {
          nCell.value = '-'
          pctCell.value = '-'
        } else {
          nCell.value = n
          setPctValue(pctCell, pct)
        }
      } else if (showCount) {
        const nCell = row.getCell(startCol)
        if (isMeanRow) styleMean(nCell)
        else if (isNetRow) styleNet(nCell)
        else styleData(nCell, even)
        if (isMeanRow) {
          if (n === 0) nCell.value = '-'
          else setMeanValue(nCell, n)
        } else {
          nCell.value = n === 0 ? '-' : n
        }
      } else {
        const pctCell = row.getCell(startCol)
        if (isMeanRow) styleMean(pctCell)
        else if (isNetRow) styleNet(pctCell)
        else styleData(pctCell, even)
        if (isMeanRow) {
          if (n === 0) pctCell.value = '-'
          else setMeanValue(pctCell, n)
        } else if (n === 0) pctCell.value = '-'
        else setPctValue(pctCell, pct)
      }
    }
  }

  pendingRowMerges.forEach(merge => {
    safeMergeCells(ws, merge.startRow, merge.col, merge.endRow, merge.col)
    const cell = ws.getCell(merge.startRow, merge.col)
    cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
  })

  ws.addRow([])
  const footerTitle = ws.addRow([])
  footerTitle.getCell(1).value = 'Cell Contents:'
  footerTitle.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF666666' } }

  const pctLabel = percentType === 'row' ? 'Row' : percentType === 'column' ? 'Column' : 'Total'
  const footerValue = ws.addRow([])
  footerValue.getCell(1).value = showCount
    ? `- Count${showPercent ? `, ${pctLabel} Percentage` : ''}`
    : showPercent ? `- ${pctLabel} Percentage` : ''
  footerValue.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF666666' } }
}

export async function buildCrosstabWorkbook(
  items: Array<{ result: CrosstabResult; config: CrosstabConfig; tableName?: string; filterSummary?: string }>
) {
  const ExcelJS = await loadExcelJs()
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Crosstab Generator'
  wb.created = new Date()

  const hasIndex = items.length > 1
  const sheetNames = computeSheetNames(items.map(it => it.tableName || it.config.rowVar))

  if (hasIndex) {
    buildIndexSheet(wb, items.map((it, i) => ({
      result: it.result,
      tableName: it.tableName ?? `Table${i + 1}`,
      sheetName: sheetNames[i],
    })))
  }

  items.forEach((it, i) => {
    addCrosstabSheet(wb, it.result, it.config, sheetNames[i], hasIndex, it.tableName, it.filterSummary)
  })

  return wb
}

export async function exportCrosstabToExcel(
  result: CrosstabResult,
  config: CrosstabConfig,
  tableName: string | undefined,
  filterSummary: string | undefined,
  filename = 'crosstab.xlsx'
) {
  const wb = await buildCrosstabWorkbook([{ result, config, tableName, filterSummary }])
  const buf = await wb.xlsx.writeBuffer()
  saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename)
}

export async function exportMultipleCrosstabsToExcel(
  items: Array<{ result: CrosstabResult; config: CrosstabConfig; tableName?: string; filterSummary?: string }>,
  filename = 'crosstab_all.xlsx'
) {
  const wb = await buildCrosstabWorkbook(items)
  const buf = await wb.xlsx.writeBuffer()
  saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename)
}

/**
 * High-level wrapper called by App.tsx handleExportTable.
 * Bridges the TableDef + GlobalSettings API to the low-level export functions.
 */
export async function exportTableToExcel(
  table: { name: string; rowVar: string | null; colVar: string | null; result: CrosstabResult | null; filter?: { description?: string } },
  _dataset: unknown,
  _variableOverrides: unknown,
  settings: { showCount: boolean; showPercent: boolean; percentType: 'row' | 'column' | 'total'; hideZeroRows?: boolean; hideTotal?: boolean },
) {
  if (!table.result) throw new Error('No result to export')
  const config: CrosstabConfig = {
    rowVar: table.result.rowVar,
    colVar: table.result.colVar,
    showCount: settings.showCount,
    showPercent: settings.showPercent,
    percentType: settings.percentType,
    hideZeroRows: settings.hideZeroRows,
    hideTotal: settings.hideTotal,
  }
  const filterSummary = table.filter?.description || undefined
  const filename = `${table.name || 'crosstab'}.xlsx`
  await exportCrosstabToExcel(table.result, config, table.name, filterSummary, filename)
}

/**
 * High-level wrapper called by App.tsx batch export flow.
 * Exports multiple tables into a single workbook.
 */
export async function exportAllTablesToExcel(
  tables: Array<{ name: string; rowVar: string | null; colVar: string | null; result: CrosstabResult | null; filter?: { description?: string } }>,
  _dataset: unknown,
  _variableOverrides: unknown,
  settings: { showCount: boolean; showPercent: boolean; percentType: 'row' | 'column' | 'total'; hideZeroRows?: boolean },
  settingsName?: string,
) {
  const items = tables
    .filter(t => t.result != null)
    .map(t => ({
      result: t.result!,
      config: {
        rowVar: t.result!.rowVar,
        colVar: t.result!.colVar,
        showCount: settings.showCount,
        showPercent: settings.showPercent,
        percentType: settings.percentType,
        hideZeroRows: settings.hideZeroRows,
      } as CrosstabConfig,
      tableName: t.name,
      filterSummary: t.filter?.description || undefined,
    }))
  const filename = settingsName ? `${settingsName}.xlsx` : 'crosstab_all.xlsx'
  await exportMultipleCrosstabsToExcel(items, filename)
}
