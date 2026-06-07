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

function ignoredConsoleMessage(message) {
  return message.includes('net::ERR_NETWORK_ACCESS_DENIED')
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

async function invokeReactExactButton(page, text, occurrence = 0) {
  await page.evaluate(
    ({ buttonText, buttonOccurrence }) => {
      const buttons = Array.from(document.querySelectorAll('button'))
        .filter(item => item.innerText.trim() === buttonText)
      const button = buttons[buttonOccurrence]
      if (!button) throw new Error(`Button not found: ${buttonText} (${buttonOccurrence})`)
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
    { buttonText: text, buttonOccurrence: occurrence },
  )
}

async function invokeVariableAddButton(page, variableName) {
  await page.evaluate(name => {
    const addButtons = Array.from(document.querySelectorAll('button'))
      .filter(button => button.innerText.trim() === 'Add')
    const button = addButtons.find(item => item.parentElement?.parentElement?.innerText?.includes(name))
    if (!button) throw new Error(`Variable Add button not found: ${name}`)
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
  }, variableName)
}

async function setVariableSearch(page, query) {
  await page.evaluate(value => {
    const input = Array.from(document.querySelectorAll('input')).find(item => {
      const text = `${item.placeholder || ''} ${item.getAttribute('aria-label') || ''}`.toLowerCase()
      return text.includes('search') || text.includes('ค้นหา')
    })
    if (!input) return
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    if (setter) setter.call(input, value)
    else input.value = value
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }, query)
  await page.waitForTimeout(300)
}

async function setActiveTableAxes(page, { rowVar, colVar }) {
  await page.evaluate(
    axes => {
      const hook = window.__cxResolveLiveTablesHook?.()
      if (!hook?.queue?.dispatch) throw new Error('Tables hook not available')
      hook.queue.dispatch(prev => {
        if (!Array.isArray(prev) || prev.length === 0) throw new Error('No tables available')
        return prev.map(table => ({ ...table, rowVar: axes.rowVar, colVar: axes.colVar, result: null }))
      })
    },
    { rowVar, colVar },
  )
  await page.waitForTimeout(250)
}

async function openVariableEditor(page, variableName) {
  await page.evaluate(name => {
    const rows = document.querySelectorAll('[draggable="true"]')
    function fiberOf(el) {
      const key = Object.keys(el).find(item => item.startsWith('__reactFiber'))
      return key ? el[key] : null
    }
    for (const row of rows) {
      const cls = String(row.className || '')
      if (!cls.includes('cursor-grab')) continue
      let fiber = fiberOf(row)
      let depth = 0
      while (fiber && depth < 18) {
        const props = fiber.memoizedProps
        if (props && typeof props.onOpen === 'function') {
          props.onOpen(name)
          return
        }
        fiber = fiber.return
        depth += 1
      }
    }
    throw new Error(`Cannot open variable editor for ${name}`)
  }, variableName)
}

async function injectAreaGroupNet(page) {
  await page.evaluate(() => {
    const dataset = window.__cxDataset
    const area = dataset?.variables?.find(v =>
      String(v?.name || '').toLowerCase() === 'area_group'
      || String(v?.longName || '').toLowerCase() === 'area_group'
    )
    if (!area?.valueLabels) throw new Error('area_group valueLabels not found')
    const labelEntries = Object.entries(area.valueLabels)
    if (labelEntries.length < 2) throw new Error('area_group needs at least 2 codes for net smoke')
    const ov = window.__cxFindLiveOverridesObject?.() || window.__cxVariableOverrides || {}
    const existing = ov.area_group && typeof ov.area_group === 'object' ? ov.area_group : {}
    ov.area_group = {
      ...existing,
      labels: { ...(existing.labels || {}), ...area.valueLabels },
      groups: [
        {
          id: 'smoke_net_area_group',
          name: 'Smoke Net',
          members: labelEntries.slice(0, 2).map(([code]) => String(code)),
        },
      ],
    }
    window.__cxVariableOverrides = ov
  })
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

  await openVariableEditor(page, 'q076j_1')
  await page.waitForFunction(() => document.body.innerText.includes('Edit Variable - q076j_1'), null, { timeout: 10_000 })
  await page.waitForSelector('#cx-tb-t2b-btn', { timeout: 10_000 })
  await page.click('#cx-tb-t2b-btn')
  await page.waitForFunction(() => document.body.innerText.includes('T2B (1 ดี)'), null, { timeout: 10_000 })
  await invokeReactButton(page, 'return button.innerText.includes("T2B (1 ดี)")', 'T2B preset')
  await page.waitForFunction(() => document.body.innerText.includes('T2B'), null, { timeout: 10_000 })
  await invokeReactExactButton(page, 'Save Variable')
  await page.waitForFunction(() => !document.body.innerText.includes('Edit Variable - q076j_1'), null, { timeout: 10_000 })
  await injectAreaGroupNet(page)

  await invokeReactExactButton(page, 'Top')
  await invokeVariableAddButton(page, 'area_group')
  await invokeReactExactButton(page, 'Side')
  await invokeVariableAddButton(page, 'area_group')
  await setVariableSearch(page, 'q076j_1')
  await invokeVariableAddButton(page, 'q076j_1')
  await invokeReactExactButton(page, 'Run Table')
  await page.waitForFunction(() => {
    const text = document.body.innerText
    return text.includes('Row: area_group + q076j_1') && text.includes('Col: area_group') && text.includes('T2B')
  }, null, { timeout: 60_000 })

  const result = await page.evaluate(() => ({
    text: document.body.innerText,
    tbStore: window.__cxGetTbPresetStore?.(),
    activeResultShape: (() => {
      function fiberOf(el) {
        const key = el && Object.keys(el).find(item => item.startsWith('__reactFiber'))
        return key ? el[key] : null
      }
      const seeds = Array.from(document.querySelectorAll('*')).map(fiberOf).filter(Boolean)
      for (const seed of seeds) {
        let f = seed
        while (f) {
          let s = f.memoizedState
          let guard = 0
          while (s && guard++ < 120) {
            const v = s.memoizedState
            if (Array.isArray(v) && v[0]?.result?.rowValues) {
              const r = v[0].result
              return {
                rowVar: v[0].rowVar,
                colVar: v[0].colVar,
                resultKeys: Object.keys(r),
                rowValues: r.rowValues.slice(0, 30),
                rowPaths: r.rowPaths?.slice(0, 30),
                rowTypes: r.rowTypes?.slice(0, 30),
                rowSectionBases: r.rowSectionBases,
                augmented: r.__cxAugmented,
              }
            }
            s = s.next
          }
          f = f.return
        }
      }
      return null
    })(),
    manualAugShape: (() => {
      function fiberOf(el) {
        const key = el && Object.keys(el).find(item => item.startsWith('__reactFiber'))
        return key ? el[key] : null
      }
      const seeds = Array.from(document.querySelectorAll('*')).map(fiberOf).filter(Boolean)
      for (const seed of seeds) {
        let f = seed
        while (f) {
          let s = f.memoizedState
          let guard = 0
          while (s && guard++ < 120) {
            const v = s.memoizedState
            if (Array.isArray(v) && v[0]?.result?.rowValues && window.__cxAugmentStackedTable) {
              const ov = window.__cxFindLiveOverridesObject?.() || window.__cxVariableOverrides || {}
              const r = window.__cxAugmentStackedTable(v[0].result, [['area_group'], ['q076j_1']], [['area_group']], ov)
              return {
                rowValues: r.rowValues?.slice(0, 30),
                rowTypes: r.rowTypes?.slice(0, 30),
                rowSectionBases: r.rowSectionBases,
              }
            }
            s = s.next
          }
          f = f.return
        }
      }
      return null
    })(),
    rowMeta: Array.from(document.querySelectorAll('tbody tr')).slice(0, 30).map(row => row.innerText.replace(/\s+/g, ' ').trim()),
    hasT2BRow: Array.from(document.querySelectorAll('td, th')).some(cell => cell.innerText.trim() === 'T2B'),
    hasAreaGroupNetRow: Array.from(document.querySelectorAll('td, th')).some(cell => cell.innerText.trim() === 'Net : Smoke Net'),
    areaGroupSectionHasT2B: (() => {
      const rows = Array.from(document.querySelectorAll('tbody tr')).map(row => row.innerText.replace(/\s+/g, ' ').trim())
      const firstBase = rows.findIndex(row => row.startsWith('Base '))
      const secondBase = rows.findIndex((row, index) => index > firstBase && row.startsWith('Base '))
      if (firstBase < 0 || secondBase < 0) return false
      return rows.slice(firstBase + 1, secondBase).some(row => /\bT2B\b|\bTB\b|\bT3B\b|\bBB\b|\bB2B\b|\bB3B\b|\bMean\b/.test(row))
    })(),
    meanValues: Array.from(document.querySelectorAll('tbody tr'))
      .map(row => row.innerText.replace(/\s+/g, ' ').trim())
      .filter(row => /\bMean\b/i.test(row))
      .flatMap(row => (row.match(/-?\d+(?:\.\d+)?/g) || []).map(Number))
      .filter(value => Number.isFinite(value) && value > 0),
    fileChooserDialogs: window.__cxDebugFileChooserCount || 0,
  }))
  if (!result.hasT2BRow) {
    throw new Error(`Generated table did not render a T2B row. Debug: ${JSON.stringify({ tbStore: result.tbStore, activeResultShape: result.activeResultShape, manualAugShape: result.manualAugShape, rowMeta: result.rowMeta }, null, 2)} Text: ${result.text.slice(0, 1200)}`)
  }
  if (!result.hasAreaGroupNetRow) {
    throw new Error(`Generated table did not render the area_group Net row. Text: ${result.text.slice(0, 1200)}`)
  }
  if (result.areaGroupSectionHasT2B) {
    throw new Error(`Net-only area_group section rendered TB/T2B rows. Text: ${result.text.slice(0, 1200)}`)
  }
  if (!result.meanValues.length || result.meanValues.some(value => value > 7.01)) {
    throw new Error(`Mean values should stay inside the 7-point scale. Values: ${JSON.stringify(result.meanValues)} Text: ${result.text.slice(0, 1200)}`)
  }

  await invokeReactExactButton(page, 'Design')
  await page.evaluate(() => {
    localStorage.setItem('__cx_weight_var__', 'W_TOTAL')
    window.__cxWeightVar = 'W_TOTAL'
  })
  await setActiveTableAxes(page, { rowVar: 'q076j_1', colVar: 'q016' })
  await invokeReactExactButton(page, 'Run Table')
  await page.waitForFunction(() => {
    const text = document.body.innerText
    return text.includes('Row: q076j_1') && text.includes('Col: q016') && /\bMean\b/.test(text)
  }, null, { timeout: 60_000 })

  const q016Mean = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr')).map(row => row.innerText.replace(/\s+/g, ' ').trim())
    const meanRow = rows.find(row => /\bMean\b/i.test(row)) || ''
    const values = (meanRow.match(/-?\d+(?:\.\d+)?/g) || []).map(Number).filter(value => Number.isFinite(value))
    const overrides = window.__cxFindLiveOverridesObject?.() || window.__cxVariableOverrides || {}
    const weights = window.__cxResolveMeanWeights?.('q076j_1', overrides) || overrides.q076j_1?.weights || null
    const store = window.__cxGetTbPresetStore?.()?.q076j_1 || null
    const rowsByLabel = rows.filter(row => !/^Base\b|^Unweighted Base\b/i.test(row) && !/\bTB\b|\bT2B\b|\bT3B\b|\bBB\b|\bB2B\b|\bB3B\b|\bMean\b/i.test(row)).slice(0, 8)
    return { meanRow, values, weights, store, rowsByLabel }
  })
  const expectedQ076J1TotalMean = 5.57
  const observedTotalMean = q016Mean.values[0]
  if (Math.abs(observedTotalMean - expectedQ076J1TotalMean) > 0.015) {
    throw new Error(`q076j_1 total Mean should match reference ${expectedQ076J1TotalMean}. Observed=${observedTotalMean}. Debug=${JSON.stringify(q016Mean)}`)
  }

  const actionableMessages = messages.filter(message => !ignoredConsoleMessage(message))
  if (actionableMessages.length > 0) throw new Error(`Console errors: ${actionableMessages.join(' | ')}`)

  console.log(JSON.stringify({
    ok: true,
    url,
    fixturePath,
    hasT2BRow: result.hasT2BRow,
    hasAreaGroupNetRow: result.hasAreaGroupNetRow,
    areaGroupSectionHasT2B: result.areaGroupSectionHasT2B,
    ignoredMessages: messages.filter(ignoredConsoleMessage),
  }, null, 2))
} finally {
  await browser.close()
}
