import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

async function loadPlaywright() {
  try {
    return await import('playwright')
  } catch (error) {
    if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error
    const bundledPath = join(
      process.env.USERPROFILE || process.env.HOME || '',
      '.cache',
      'codex-runtimes',
      'codex-primary-runtime',
      'dependencies',
      'node',
      'node_modules',
      'playwright',
      'index.mjs',
    )
    if (!existsSync(bundledPath)) throw error
    return import(pathToFileURL(bundledPath).href)
  }
}

async function invokeReactButton(page, predicateSource, label) {
  await page.evaluate(
    ({ source, buttonLabel }) => {
      const predicate = Function('button', source)
      const button = Array.from(document.querySelectorAll('button')).find(item => predicate(item))
      if (!button) throw new Error(`Button not found: ${buttonLabel}`)
      const key = Object.keys(button).find(item => item.startsWith('__reactProps'))
      const props = key ? button[key] : null
      if (props?.onClick) {
        props.onClick({
          preventDefault() {},
          stopPropagation() {},
          target: button,
          currentTarget: button,
        })
      } else {
        button.click()
      }
    },
    { source: predicateSource, buttonLabel: label },
  )
}

const url = process.env.CROSSFY_URL || 'http://localhost:5173/'
const fixturePath = resolve(process.cwd(), process.env.CROSSFY_SAV_FIXTURE || 'Edit 500+Booster.sav')

if (!existsSync(fixturePath)) {
  throw new Error(`SPSS fixture not found: ${fixturePath}`)
}

const { chromium } = await loadPlaywright()
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1365, height: 768 } })
const messages = []

page.on('console', message => {
  if (['error', 'warning'].includes(message.type())) messages.push(`${message.type()}: ${message.text()}`)
})
page.on('pageerror', error => messages.push(`pageerror: ${error.message}`))

try {
  await page.addInitScript(() => {
    window.__CX_AUTH_BYPASS = true
    try {
      Object.defineProperty(window, 'showOpenFilePicker', { value: undefined, configurable: true })
    } catch (_) {
      window.showOpenFilePicker = undefined
    }
  })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => null)
  await page.waitForFunction(() => Boolean(window.__crossifyRuntime), null, { timeout: 10_000 })

  await invokeReactButton(page, 'return /เข้าใช้งานโปรแกรม|Enter|Start/i.test(button.innerText)', 'enter app')
  await page.waitForFunction(() => document.body.innerText.includes('Workspace ready'), null, { timeout: 10_000 })

  const chooserPromise = page.waitForEvent('filechooser', { timeout: 10_000 })
  await invokeReactButton(page, 'return /Load SPSS File|โหลดไฟล์ SPSS/i.test(button.innerText)', 'load spss')
  const chooser = await chooserPromise
  await chooser.setFiles(fixturePath)
  await page.waitForFunction(
    () => document.body.innerText.includes('Edit 500+Booster.sav') || document.body.innerText.includes('1,415 cases'),
    null,
    { timeout: 90_000 },
  )

  const result = await page.evaluate(async () => {
    function fiberOf(el) {
      const key = el && Object.keys(el).find(item => item.startsWith('__reactFiber'))
      return key ? el[key] : null
    }
    function findDatasetHook(startFiber) {
      let f = startFiber
      while (f) {
        let s = f.memoizedState
        let guard = 0
        while (s && guard++ < 120) {
          const v = s.memoizedState
          if (v && typeof v === 'object' && !Array.isArray(v) && Array.isArray(v.variables) && Array.isArray(v.cases)) {
            return s
          }
          s = s.next
        }
        f = f.return
      }
      return null
    }
    const seeds = Array.from(document.querySelectorAll('button, [draggable="true"], table, #root')).map(fiberOf).filter(Boolean)
    let hook = null
    for (const seed of seeds) {
      hook = findDatasetHook(seed)
      if (hook) break
    }
    if (!hook) throw new Error('Dataset hook not found')
    const ds = hook.memoizedState
    const q = ds.variables.find(v => String(v.name || '').toLowerCase() === 'q076j_1' || String(v.longName || '').toLowerCase() === 'q076j_1')
    const area = ds.variables.find(v => String(v.name || '').toLowerCase() === 'area_group' || String(v.longName || '').toLowerCase() === 'area_group')
    if (!q || !area) throw new Error('Required variables not found')
    const qKey = q.name
    const areaKey = area.name
    const qValues = []
    for (const row of ds.cases) {
      const value = row[qKey]
      if (value != null && value !== '' && !qValues.includes(String(value))) qValues.push(String(value))
      if (qValues.length >= 2) break
    }
    if (qValues.length < 2) throw new Error('Not enough q076j_1 values')
    const labelFor = value => q.valueLabels?.[String(value)] || String(value)
    const nextVars = [
      {
        name: 'XX2_O1',
        longName: 'XX2_O1',
        label: 'Code1',
        isString: false,
        valueLabels: { 0: '', 1: 'Code1' },
        _derived: true,
        _derivedMA: true,
        _derivedGroupBase: 'XX2',
      },
      {
        name: 'XX2_O2',
        longName: 'XX2_O2',
        label: 'Code2',
        isString: false,
        valueLabels: { 0: '', 1: 'Code2' },
        _derived: true,
        _derivedMA: true,
        _derivedGroupBase: 'XX2',
      },
    ]
    const nextCases = ds.cases.map(row => ({
      ...row,
      XX2_O1: String(row[qKey]) === qValues[0] ? 1 : 0,
      XX2_O2: String(row[qKey]) === qValues[1] ? 1 : 0,
    }))
    const nextDs = {
      ...ds,
      variables: ds.variables.filter(v => !/^XX2_O[12]$/i.test(String(v.name || ''))).concat(nextVars),
      cases: nextCases,
    }
    hook.queue.dispatch(nextDs)
    window.__cxDataset = nextDs
    await new Promise(resolve => setTimeout(resolve, 500))

    const areaLabels = Object.entries(area.valueLabels || {}).slice(0, 5)
    const colValues = areaLabels.map(([, label]) => label)
    const result = {
      rowVar: 'q076j_1 ++ XX2_O',
      colVar: 'area_group',
      rowLabel: 'q076j_1 + XX2_O',
      colLabel: area.label || 'area_group',
      rowValues: [
        `${q.label} / ${labelFor(qValues[0])}`,
        `${q.label} / ${labelFor(qValues[1])}`,
        'XX2 / XX2_O1',
        'XX2 / XX2_O2',
      ],
      colValues,
      rowLevelLabels: [q.label, 'XX2'],
      colLevelLabels: [area.label || 'area_group'],
      rowPaths: [
        [q.label, labelFor(qValues[0])],
        [q.label, labelFor(qValues[1])],
        ['XX2', 'XX2_O1'],
        ['XX2', 'XX2_O2'],
      ],
      colPaths: colValues.map(label => [label]),
      counts: [
        colValues.map(() => 0),
        colValues.map(() => 0),
        colValues.map(() => 0),
        colValues.map(() => 0),
      ],
      rowTotalsN: [0, 0, 0, 0],
      colTotalsN: colValues.map(() => 0),
      grandTotal: ds.cases.length,
      rowTypes: ['data', 'data', 'data', 'data'],
      colTypes: colValues.map(() => 'data'),
      rowSectionBases: [
        { startIndex: 0, label: q.label, totalN: ds.cases.length, colTotalsN: colValues.map(() => 0) },
        { startIndex: 2, label: 'XX2', totalN: 0, colTotalsN: colValues.map(() => 0) },
      ],
    }
    const augmented = window.__cxAugmentStackedTable(result, [['q076j_1'], ['XX2_O']], [['area_group']], window.__cxVariableOverrides || {})
    const singleResult = {
      rowVar: 'XX2_O',
      colVar: 'Total',
      rowLabel: 'XX2',
      colLabel: 'Total',
      rowValues: ['Code1', 'Code2'],
      colValues: ['Total'],
      rowLevelLabels: ['XX2'],
      colLevelLabels: ['Total'],
      rowPaths: [['Code1'], ['Code2']],
      colPaths: [['Total']],
      counts: [[0], [0]],
      rowTotalsN: [0, 0],
      colTotalsN: [0],
      grandTotal: ds.cases.length,
      rowTypes: ['data', 'data'],
      colTypes: ['data'],
    }
    const singleAugmented = window.__cxAugmentResult(singleResult, 'XX2_O', window.__cxVariableOverrides || {})
    const directSingleRecalc = window.__cxRecomputeMaSectionCounts(singleResult, 0, singleResult.rowValues.length, 'XX2_O', window.__cxVariableOverrides || {}, [['Total']])
    return {
      rowValues: augmented.rowValues,
      rowTotalsN: augmented.rowTotalsN,
      counts: augmented.counts,
      rowSectionBases: augmented.rowSectionBases,
      xxRowsHaveCounts: augmented.rowTotalsN.slice(2, 4).every(n => n > 0),
      xxBase: augmented.rowSectionBases?.[1]?.totalN || 0,
      singleAugmented,
      directSingleRecalc,
      singleRowsHaveCounts: singleAugmented.rowTotalsN.every(n => n > 0),
    }
  })

  if (!result.xxRowsHaveCounts || result.xxBase <= 0) {
    throw new Error(`Derived MA rows were not recomputed: ${JSON.stringify(result, null, 2)}`)
  }
  if (!result.singleRowsHaveCounts) {
    throw new Error(`Single derived MA table did not compute counts: ${JSON.stringify(result, null, 2)}`)
  }

  const actionableMessages = messages.filter(message => !message.includes('net::ERR_NETWORK_ACCESS_DENIED'))
  if (actionableMessages.length > 0) throw new Error(`Console errors: ${actionableMessages.join(' | ')}`)

  console.log(JSON.stringify({
    ok: true,
    url,
    fixturePath,
    xxBase: result.xxBase,
    rowTotalsN: result.rowTotalsN.slice(2, 4),
    singleRowTotalsN: result.singleAugmented.rowTotalsN,
  }, null, 2))
} finally {
  await browser.close()
}
