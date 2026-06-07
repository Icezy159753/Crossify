/**
 * Regression tests backed by the local "Edit 500+Booster.sav" fixture.
 *
 * @vitest-environment jsdom
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { applyValueLabels, parseSav, type SavDataset, type SpssVariable } from './savParser'
import { buildVariableCatalog } from './variableGrouping'
import { computeTableResult } from './resultPipeline'
import { materializeColumnAugment } from './columnAugment'
import { buildScaleSummaryPreset } from './variableEditorUtils'
import { injectNetGroups } from './netGroupInjector'
import { buildSettingsWorkbookBuffer, loadSettings } from './settingsIO'
import { buildCrosstabWorkbook } from './excelExport'
import type { VariableCatalog } from './variableGrouping'

const fixturePath = resolve(process.cwd(), 'Edit 500+Booster.sav')
const describeIfFixture = existsSync(fixturePath) ? describe : describe.skip

interface ScalePairData {
  variables: SpssVariable[]
  cases: Record<string, string | number>[]
  firstScale?: SpssVariable
  secondScale?: SpssVariable
}

async function loadFixture(): Promise<{ dataset: SavDataset; catalog: VariableCatalog }> {
  const bytes = readFileSync(fixturePath)
  const file = new File([bytes], 'Edit 500+Booster.sav', { type: 'application/octet-stream' })
  const parsed = await parseSav(file)
  const dataset = {
    ...parsed,
    cases: applyValueLabels(parsed.cases, parsed.variables),
  }
  return {
    dataset,
    catalog: buildVariableCatalog(dataset.variables, [], dataset.cases),
  }
}

function findVariable(catalog: VariableCatalog, name: string) {
  return catalog.byName.get(name) ?? catalog.byName.get(name.toUpperCase()) ?? catalog.byName.get(name.toLowerCase())
}

function scaleVariables(dataset: SavDataset) {
  return dataset.variables.filter(variable => {
    const codes = Object.keys(variable.valueLabels).map(code => String(Number(code))).sort()
    const name = `${variable.name} ${variable.longName}`.toLowerCase()
    const labels = Object.values(variable.valueLabels).join(' ').toLowerCase()
    const looksLikeQuestionScale = /^q/i.test(variable.name) || /^q/i.test(variable.longName)
    const looksLikeLikertScale =
      labels.includes('พอใจ') ||
      labels.includes('ชอบ') ||
      labels.includes('เห็นด้วย') ||
      labels.includes('สำคัญ') ||
      labels.includes('แน่นอน') ||
      labels.includes('มากที่สุด') ||
      labels.includes('น้อยที่สุด') ||
      labels.includes('satisf') ||
      labels.includes('agree') ||
      labels.includes('like') ||
      labels.includes('important') ||
      labels.includes('likely')
    const looksLikeDemographic =
      labels.includes('gbkk') ||
      labels.includes('ภาค') ||
      labels.includes('บาท') ||
      labels.includes('income') ||
      labels.includes('รายได้') ||
      labels.includes('ผลิตภัณฑ์') ||
      labels.includes('ผ้าอ้อม') ||
      labels.includes('ปัสสาวะ') ||
      labels.includes('ไม่ได้จ้าง') ||
      name.includes('area') ||
      name.includes('income')
    const observedLabels = new Set<string>()
    const validLabels = new Set(Object.values(variable.valueLabels))
    for (const row of dataset.cases) {
      for (const key of [variable.name, variable.longName]) {
        const value = row[key]
        if (value != null && validLabels.has(String(value))) observedLabels.add(String(value))
      }
    }
    return (
      looksLikeQuestionScale &&
      looksLikeLikertScale &&
      !looksLikeDemographic &&
      observedLabels.size >= 4 &&
      codes.length === 5 &&
      ['1', '2', '3', '4', '5'].every(code => codes.includes(code))
    )
  })
}

function sortedLabels(variable: SpssVariable) {
  return Object.entries(variable.valueLabels)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map(([, label]) => label)
}

function labelSignature(variable: SpssVariable) {
  return JSON.stringify(sortedLabels(variable))
}

function matchingScalePair(dataset: SavDataset) {
  const scales = scaleVariables(dataset)
  for (let firstIndex = 0; firstIndex < scales.length; firstIndex++) {
    for (let secondIndex = firstIndex + 1; secondIndex < scales.length; secondIndex++) {
      if (labelSignature(scales[firstIndex]) === labelSignature(scales[secondIndex])) {
        return [scales[firstIndex], scales[secondIndex]] as const
      }
    }
  }
  return [scales[0], scales[1]] as const
}

function syntheticVariable(name: string, label: string, valueLabels: Record<string, string>): SpssVariable {
  return {
    name,
    longName: name,
    label,
    valueLabels,
    isString: false,
    stringLength: 0,
    slotCount: 1,
    dictIndex: 0,
  }
}

function scalePairDataset(dataset: SavDataset): ScalePairData {
  const [firstScale, secondScale] = matchingScalePair(dataset)
  if (firstScale && secondScale) {
    return {
      variables: dataset.variables,
      cases: dataset.cases,
      firstScale,
      secondScale,
    }
  }

  const scale = scaleVariables(dataset)[0]
  if (!scale) {
    return {
      variables: dataset.variables,
      cases: dataset.cases,
      firstScale: undefined,
      secondScale: undefined,
    }
  }

  const copyName = 'REG_SCALE_COPY'
  const copiedVariable = syntheticVariable(copyName, `${scale.label || scale.name} Copy`, scale.valueLabels)
  return {
    variables: [...dataset.variables, copiedVariable],
    cases: dataset.cases.map((row): Record<string, string | number> => ({
      ...row,
      [copyName]: row[scale.name] ?? row[scale.longName],
    })),
    firstScale: scale,
    secondScale: copiedVariable,
  }
}

describeIfFixture('Edit 500+Booster.sav regression', () => {
  let dataset: SavDataset
  let catalog: VariableCatalog

  beforeAll(async () => {
    const loaded = await loadFixture()
    dataset = loaded.dataset
    catalog = loaded.catalog
  }, 60_000)

  it('parses the expected fixture size and key variables', () => {
    expect(dataset.cases).toHaveLength(1415)
    expect(dataset.variables.length).toBeGreaterThanOrEqual(4800)
    expect(findVariable(catalog, 'area_group')).toBeTruthy()
    expect(findVariable(catalog, 'q021')).toBeTruthy()
  })

  it('keeps the final area_group column values when computing area_group by area_group', async () => {
    const variableName = findVariable(catalog, 'area_group')?.name
    expect(variableName).toBeTruthy()

    const result = await computeTableResult(
      dataset.cases,
      {
        rowVar: variableName!,
        colVar: variableName!,
      },
      catalog,
      {},
      { showCount: true, showPercent: true, percentType: 'column', hideZeroRows: false },
    )

    expect(result.grandTotal).toBe(1415)
    expect(result.rowValues).toHaveLength(5)
    expect(result.colValues).toHaveLength(5)
    expect(result.counts.every(row => row.length === result.colValues.length)).toBe(true)
    expect(result.colTotalsN).toHaveLength(result.colValues.length)
    expect(result.colTotalsN.at(-1)).toBeGreaterThan(0)
    expect(result.counts.some(row => (row.at(-1) ?? 0) > 0)).toBe(true)
  })

  it('does not lose the appended summary column after materializing a q021 top Net', async () => {
    const rowVariable = findVariable(catalog, 'q021')?.name
    const colVariable = findVariable(catalog, 'area_group')?.name
    expect(rowVariable).toBeTruthy()
    expect(colVariable).toBeTruthy()

    const result = await computeTableResult(
      dataset.cases,
      {
        rowVar: rowVariable!,
        colVar: colVariable!,
      },
      catalog,
      {},
      { showCount: true, showPercent: true, percentType: 'column', hideZeroRows: false },
    )
    const beforeWidth = result.colValues.length
    const augmented = materializeColumnAugment(result, {
      specs: [{
        kind: 'summary',
        label: 'Net : Test',
        memberIndexes: [beforeWidth - 1],
        insertBoundary: beforeWidth,
      }],
    })

    expect(augmented.colValues).toHaveLength(beforeWidth + 1)
    expect(augmented.colValues.at(-1)).toBe('Net : Test')
    expect(augmented.colTotalsN.at(-1)).toBe(result.colTotalsN.at(-1))
    expect(augmented.counts.every(row => row.length === augmented.colValues.length)).toBe(true)
  })

  it('keeps dimensions aligned when row/column variables are swapped', async () => {
    const areaGroup = findVariable(catalog, 'area_group')?.name
    const q021 = findVariable(catalog, 'q021')?.name
    expect(areaGroup).toBeTruthy()
    expect(q021).toBeTruthy()

    const first = await computeTableResult(
      dataset.cases,
      { rowVar: q021!, colVar: areaGroup! },
      catalog,
      {},
      { showCount: true, showPercent: true, percentType: 'column', hideZeroRows: false },
    )
    const swapped = await computeTableResult(
      dataset.cases,
      { rowVar: areaGroup!, colVar: q021! },
      catalog,
      {},
      { showCount: true, showPercent: true, percentType: 'row', hideZeroRows: false },
    )

    expect(first.counts).toHaveLength(first.rowValues.length)
    expect(first.counts.every(row => row.length === first.colValues.length)).toBe(true)
    expect(swapped.counts).toHaveLength(swapped.rowValues.length)
    expect(swapped.counts.every(row => row.length === swapped.colValues.length)).toBe(true)
    expect(first.grandTotal).toBe(swapped.grandTotal)
  })

  it('creates T2B/TB summary columns from a real five-point scale without shifting trailing columns', async () => {
    const [scale] = matchingScalePair(dataset)
    const areaGroup = findVariable(catalog, 'area_group')?.name
    expect(scale).toBeTruthy()
    expect(areaGroup).toBeTruthy()

    const result = await computeTableResult(
      dataset.cases,
      { rowVar: areaGroup!, colVar: scale.name },
      catalog,
      {},
      { showCount: true, showPercent: true, percentType: 'column', hideZeroRows: false },
    )
    const preset = buildScaleSummaryPreset(
      Object.keys(scale.valueLabels)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
        .map(code => ({ key: scale.valueLabels[code], code })),
      't2b_high_good',
    )
    const specs = preset.summaries
      .filter(summary => summary.code === 'TB' || summary.code === 'T2B')
      .map((summary, index) => ({
        kind: 'summary' as const,
        label: summary.code,
        memberIndexes: summary.members
          .map(member => result.colValues.indexOf(member))
          .filter(memberIndex => memberIndex >= 0),
        insertBoundary: result.colValues.length,
        insertOrder: index,
      }))
    const augmented = materializeColumnAugment(result, { specs })

    expect(augmented.colValues.slice(-2)).toEqual(['TB', 'T2B'])
    expect(augmented.colTotalsN.at(-1)).toBe(
      specs.at(-1)!.memberIndexes.reduce((sum, index) => sum + result.colTotalsN[index], 0),
    )
    expect(augmented.counts.every(row => row.length === augmented.colValues.length)).toBe(true)
  })

  it('inserts a row Net from a real variable while preserving every row width', async () => {
    const q021 = findVariable(catalog, 'q021')?.name
    const areaGroup = findVariable(catalog, 'area_group')?.name
    expect(q021).toBeTruthy()
    expect(areaGroup).toBeTruthy()

    const result = await computeTableResult(
      dataset.cases,
      { rowVar: q021!, colVar: areaGroup! },
      catalog,
      {},
      { showCount: true, showPercent: true, percentType: 'column', hideZeroRows: false },
    )
    const members = result.rowValues.slice(0, 2)
    const withNet = injectNetGroups(result, q021!, {
      [q021!]: {
        labels: Object.fromEntries(result.rowValues.map(value => [value, value])),
        groups: [{ name: 'Regression Net', members }],
      },
    })

    expect(withNet.rowValues.length).toBe(result.rowValues.length + 1)
    expect(withNet.rowValues.some(value => value.startsWith('Net : Regression Net'))).toBe(true)
    expect(withNet.counts.every(row => row.length === withNet.colValues.length)).toBe(true)
  })

  it('builds a custom MRSET from real scale variables and computes it against area_group', async () => {
    const pairData = scalePairDataset(dataset)
    const { firstScale, secondScale } = pairData
    const areaGroup = findVariable(catalog, 'area_group')?.name
    if (!firstScale || !secondScale) throw new Error('No usable scale pair found in fixture')
    expect(areaGroup).toBeTruthy()

    const customCatalog = buildVariableCatalog(pairData.variables, [{
      groupName: 'REG_SCALE_O',
      label: 'Regression Scale MRSET',
      members: [firstScale.name, secondScale.name],
    }], pairData.cases)
    const result = await computeTableResult(
      pairData.cases,
      { rowVar: 'REG_SCALE_O', colVar: areaGroup! },
      customCatalog,
      {},
      { showCount: true, showPercent: true, percentType: 'column', hideZeroRows: false },
    )

    expect(customCatalog.groupedByName.get('REG_SCALE_O')).toBeTruthy()
    expect(result.rowValues.length).toBeGreaterThanOrEqual(5)
    expect(result.counts.every(row => row.length === result.colValues.length)).toBe(true)
  }, 30_000)

  it('creates a derived variable from real cases and can crosstab it immediately', async () => {
    const areaGroup = findVariable(catalog, 'area_group')?.name
    expect(areaGroup).toBeTruthy()
    const firstArea = dataset.cases.find(row => row[areaGroup!])?.[areaGroup!]
    expect(firstArea).toBeTruthy()

    const derivedName = 'REG_AREA_BINARY'
    const derivedDataset: SavDataset = {
      ...dataset,
      variables: [
        ...dataset.variables,
        syntheticVariable(derivedName, 'Regression Area Binary', { '1': 'Selected Area', '2': 'Other Area' }),
      ],
      cases: dataset.cases.map(row => ({
        ...row,
        [derivedName]: row[areaGroup!] === firstArea ? 'Selected Area' : 'Other Area',
      })),
    }
    const derivedCatalog = buildVariableCatalog(derivedDataset.variables, [], derivedDataset.cases)
    const result = await computeTableResult(
      derivedDataset.cases,
      { rowVar: derivedName, colVar: areaGroup! },
      derivedCatalog,
      {},
      { showCount: true, showPercent: true, percentType: 'column', hideZeroRows: false },
    )

    expect(result.grandTotal).toBe(dataset.cases.length)
    expect(result.rowValues).toEqual(['Selected Area', 'Other Area'])
    expect(result.counts.every(row => row.length === result.colValues.length)).toBe(true)
  }, 30_000)

  it('creates Grid TOP/SIDE variables from real scale members and computes a grid table', async () => {
    const pairData = scalePairDataset(dataset)
    const { firstScale, secondScale } = pairData
    if (!firstScale || !secondScale) throw new Error('No usable scale pair found in fixture')
    const gridTop = 'REG_GRID_TOP'
    const gridSide = 'REG_GRID_SIDE'
    const gridMembers = [
      { name: firstScale.name, label: firstScale.label || firstScale.name },
      { name: secondScale.name, label: secondScale.label || secondScale.name },
    ]
    const gridTopVariable = {
      ...syntheticVariable(gridTop, 'Regression Grid Top', Object.fromEntries(gridMembers.map((member, index) => [String(index + 1), member.label]))),
      isGridUserCreated: true,
      isGroupedMA: true,
      memberNames: gridMembers.map(member => member.name),
      gridMembers,
      gridRole: 'top' as const,
      gridPairName: gridSide,
    }
    const gridSideVariable = {
      ...syntheticVariable(gridSide, 'Regression Grid Side', firstScale.valueLabels),
      isGridUserCreated: true,
      gridRole: 'side' as const,
      gridPairName: gridTop,
    }
    const gridCases = pairData.cases.flatMap(row => {
      const rows = [row]
      for (const member of gridMembers) {
        const value = row[member.name]
        if (value != null && value !== '') {
          rows.push({ [gridTop]: member.label, [gridSide]: value })
        }
      }
      return rows
    })
    const gridCatalog = buildVariableCatalog(
      [...pairData.variables, gridTopVariable, gridSideVariable],
      [],
      gridCases,
    )
    const result = await computeTableResult(
      gridCases,
      { rowVar: gridTop, colVar: gridSide },
      gridCatalog,
      {},
      { showCount: true, showPercent: true, percentType: 'row', hideZeroRows: false },
    )

    expect(gridCatalog.groupedByName.get(gridTop)).toBeTruthy()
    expect(result.rowValues).toEqual(gridMembers.map(member => member.label))
    expect(result.colValues).toEqual(sortedLabels(firstScale))
    expect(result.grandTotal).toBeGreaterThan(0)
    expect(result.rowTotalsN.every(total => total > 0)).toBe(true)
    expect(result.counts.every(row => row.length === result.colValues.length)).toBe(true)
  }, 30_000)

  it('roundtrips Net/T2B settings for a real variable through the settings workbook', async () => {
    const scale = scaleVariables(dataset)[0]
    expect(scale).toBeTruthy()
    const buffer = await buildSettingsWorkbookBuffer({
      tables: [{ name: 'Regression', rowVar: scale.name, colVar: findVariable(catalog, 'area_group')?.name ?? null, folderId: null }],
      folders: [],
      output: { showCount: true, showPercent: true, percentType: 'column', hideZeroRows: false },
      variableOverrides: {
        [scale.name]: {
          order: Object.keys(scale.valueLabels),
          weights: {},
          labels: scale.valueLabels,
          groups: [{ id: 'reg-net', name: 'Regression Net', members: Object.keys(scale.valueLabels).slice(0, 2) }],
          summaries: [{ code: 'T2B', label: 'T2B', members: Object.keys(scale.valueLabels).slice(-2) }],
          summaryPreset: 't2b_high_good',
        },
      },
      detectedMrsets: [],
      sourceDataset: { fileName: dataset.fileName },
      sourceMappings: [],
      activeLock: null,
    })
    const settings = await loadSettings(new File([buffer], 'regression-settings.xlsx'))
    const override = settings.variableOverrides?.[scale.name] as {
      groups?: Array<{ name: string; members: string[] }>
      summaries?: Array<{ code: string; members: string[] }>
      summaryPreset?: string
    }

    expect(override.groups?.[0].name).toBe('Regression Net')
    expect(override.summaries?.[0].code).toBe('T2B')
    expect(override.summaryPreset).toBe('t2b_high_good')
  })

  it('builds a multi-table Excel workbook from real fixture results', async () => {
    const areaGroup = findVariable(catalog, 'area_group')?.name
    const q021 = findVariable(catalog, 'q021')?.name
    const scale = scaleVariables(dataset)[0]
    expect(areaGroup).toBeTruthy()
    expect(q021).toBeTruthy()
    expect(scale).toBeTruthy()

    const settings = { showCount: true, showPercent: true, percentType: 'column' as const, hideZeroRows: false }
    const areaByArea = await computeTableResult(
      dataset.cases,
      { rowVar: areaGroup!, colVar: areaGroup! },
      catalog,
      {},
      settings,
    )
    const q021ByArea = await computeTableResult(
      dataset.cases,
      { rowVar: q021!, colVar: areaGroup! },
      catalog,
      {},
      settings,
    )
    const scaleByArea = await computeTableResult(
      dataset.cases,
      { rowVar: scale.name, colVar: areaGroup! },
      catalog,
      {},
      settings,
    )

    const workbook = await buildCrosstabWorkbook([
      { result: areaByArea, config: { ...settings, rowVar: areaGroup!, colVar: areaGroup! }, tableName: 'Area x Area' },
      { result: q021ByArea, config: { ...settings, rowVar: q021!, colVar: areaGroup! }, tableName: 'Q021 x Area' },
      { result: scaleByArea, config: { ...settings, rowVar: scale.name, colVar: areaGroup! }, tableName: 'Scale x Area' },
    ])
    const buffer = await workbook.xlsx.writeBuffer()

    expect(workbook.worksheets.map(sheet => sheet.name)).toEqual([
      'Index',
      'Area x Area',
      'Q021 x Area',
      'Scale x Area',
    ])
    expect(buffer.byteLength).toBeGreaterThan(10_000)
    expect(workbook.getWorksheet('Area x Area')?.rowCount).toBeGreaterThan(areaByArea.rowValues.length)
    expect(workbook.getWorksheet('Q021 x Area')?.rowCount).toBeGreaterThan(q021ByArea.rowValues.length)
    expect(workbook.getWorksheet('Scale x Area')?.rowCount).toBeGreaterThan(scaleByArea.rowValues.length)
  }, 60_000)
})
