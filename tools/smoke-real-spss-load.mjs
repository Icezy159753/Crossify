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

async function invokeReactOnClick(page, textPattern) {
  return page.evaluate(source => {
    const pattern = new RegExp(source, 'i')
    const button = Array.from(document.querySelectorAll('button')).find(item => pattern.test(item.innerText))
    if (!button) throw new Error(`Button not found: ${source}`)
    const key = Object.keys(button).find(item => item.startsWith('__reactProps'))
    const props = key ? button[key] : null
    if (!props || typeof props.onClick !== 'function') {
      button.click()
      return
    }
    props.onClick({
      preventDefault() {},
      stopPropagation() {},
      target: button,
      currentTarget: button,
    })
  }, textPattern.source)
}

async function invokeReactExactButton(page, text, occurrence = 0) {
  return page.evaluate(({ buttonText, buttonOccurrence }) => {
    const buttons = Array.from(document.querySelectorAll('button'))
      .filter(item => item.innerText.trim() === buttonText)
    const button = buttons[buttonOccurrence]
    if (!button) throw new Error(`Button not found: ${buttonText} (${buttonOccurrence})`)
    const key = Object.keys(button).find(item => item.startsWith('__reactProps'))
    const props = key ? button[key] : null
    if (!props || typeof props.onClick !== 'function') {
      throw new Error(`React onClick not found: ${buttonText} (${buttonOccurrence})`)
    }
    props.onClick({
      preventDefault() {},
      stopPropagation() {},
      target: button,
      currentTarget: button,
    })
  }, { buttonText: text, buttonOccurrence: occurrence })
}

async function invokeReactButtonAt(page, index) {
  return page.evaluate(buttonIndex => {
    const button = Array.from(document.querySelectorAll('button'))[buttonIndex]
    if (!button) throw new Error(`Button index not found: ${buttonIndex}`)
    const key = Object.keys(button).find(item => item.startsWith('__reactProps'))
    const props = key ? button[key] : null
    if (!props || typeof props.onClick !== 'function') throw new Error(`React onClick not found at index: ${buttonIndex}`)
    props.onClick({
      preventDefault() {},
      stopPropagation() {},
      target: button,
      currentTarget: button,
    })
  }, index)
}

async function invokeVariableAddButton(page, variableName) {
  return page.evaluate(name => {
    const addButtons = Array.from(document.querySelectorAll('button'))
      .filter(button => button.innerText.trim() === 'Add')
    const button = addButtons.find(item => item.parentElement?.parentElement?.innerText?.includes(name))
    if (!button) throw new Error(`Variable Add button not found: ${name}`)
    const key = Object.keys(button).find(item => item.startsWith('__reactProps'))
    const props = key ? button[key] : null
    if (!props || typeof props.onClick !== 'function') {
      throw new Error(`React onClick not found for variable Add: ${name}`)
    }
    props.onClick({
      preventDefault() {},
      stopPropagation() {},
      target: button,
      currentTarget: button,
    })
  }, variableName)
}

async function invokeSegmentedButton(page, text, labels) {
  return page.evaluate(({ buttonText, segmentLabels }) => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const button = buttons.find(item => {
      if (item.innerText.trim() !== buttonText) return false
      const parentText = item.parentElement?.innerText ?? ''
      return segmentLabels.every(label => parentText.includes(label))
    })
    if (!button) throw new Error(`Segmented button not found: ${buttonText}`)
    const key = Object.keys(button).find(item => item.startsWith('__reactProps'))
    const props = key ? button[key] : null
    if (!props || typeof props.onClick !== 'function') {
      button.click()
      return
    }
    props.onClick({
      preventDefault() {},
      stopPropagation() {},
      target: button,
      currentTarget: button,
    })
  }, { buttonText: text, segmentLabels: labels })
}

const url = process.env.CROSSFY_URL || 'http://localhost:5173/'
const fixturePath = resolve(process.cwd(), process.env.CROSSFY_SAV_FIXTURE || 'Edit 500+Booster.sav')

if (!existsSync(fixturePath)) {
  throw new Error(`SPSS fixture not found: ${fixturePath}`)
}

const { chromium } = await loadPlaywright()
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1365, height: 768 } })
await page.route('**/supabase/**', r => r.abort()) // hermetic: no production cloud settings
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

  await invokeReactButtonAt(page, 3)
  await page.waitForFunction(() => document.body.innerText.includes('Workspace ready'), null, { timeout: 10_000 })

  const chooserPromise = page.waitForEvent('filechooser', { timeout: 10_000 })
  await invokeReactOnClick(page, /Load SPSS File/)
  const chooser = await chooserPromise
  await chooser.setFiles(fixturePath)

  try {
    await page.waitForFunction(
      () => {
        const text = document.body.innerText
        return text.includes('Edit 500+Booster.sav') || text.includes('1,415 cases')
      },
      null,
      { timeout: 90_000 },
    )
  } catch (error) {
    const debugState = await page.evaluate(() => ({
      text: document.body.innerText.slice(0, 2000),
      inputs: Array.from(document.querySelectorAll('input')).map((input, index) => ({
        index,
        type: input.type,
        accept: input.accept,
        display: getComputedStyle(input).display,
      })),
      buttons: Array.from(document.querySelectorAll('button')).slice(0, 30).map((button, index) => ({
        index,
        text: button.innerText.trim(),
      })),
    }))
    throw new Error(`Timed out waiting for SPSS load. State: ${JSON.stringify(debugState)}`, { cause: error })
  }

  const loadedState = await page.evaluate(() => ({
    hasDataset: Boolean(window.__cxDataset),
    text: document.body.innerText,
    tableCount: document.querySelectorAll('table').length,
    variableRows: Array.from(document.querySelectorAll('[draggable="true"]')).length,
    hasAreaGroup: document.body.innerText.includes('area_group'),
    hasQ021: document.body.innerText.includes('q021'),
  }))
  const actionableMessages = messages.filter(message => !ignoredConsoleMessage(message))

  if (!loadedState.hasDataset) throw new Error('Dataset bridge window.__cxDataset was not populated')
  if (!loadedState.hasAreaGroup) throw new Error('Loaded UI did not show area_group')
  if (!loadedState.hasQ021) throw new Error('Loaded UI did not show q021')
  if (!loadedState.text.includes('4,808 variables')) {
    throw new Error(`Loaded UI did not show expected variable count. Text: ${loadedState.text.slice(0, 500)}`)
  }

  await invokeReactExactButton(page, 'Top')
  await invokeVariableAddButton(page, 'area_group')
  await invokeReactExactButton(page, 'Side')
  await invokeVariableAddButton(page, 'q021')
  await invokeReactExactButton(page, 'Run Table')
  await page.waitForFunction(() => document.querySelectorAll('table').length > 0, null, { timeout: 60_000 })

  const resultState = await page.evaluate(() => ({
    tableCount: document.querySelectorAll('table').length,
    text: document.body.innerText,
  }))
  if (!resultState.text.includes('Table1') || !resultState.text.includes('22 rows') || !resultState.text.includes('5 cols')) {
    throw new Error(`Generated table did not show expected dimensions. Text: ${resultState.text.slice(0, 1000)}`)
  }
  if (!resultState.text.includes('q021') || !resultState.text.includes('area_group')) {
    throw new Error(`Generated table did not show expected row/column metadata. Text: ${resultState.text.slice(0, 1000)}`)
  }
  if (!resultState.text.includes('1,415') || !resultState.text.includes('1,200') || !resultState.text.includes('565')) {
    throw new Error(`Generated table did not show expected real-fixture counts. Text: ${resultState.text.slice(0, 1000)}`)
  }

  await invokeReactOnClick(page, /Switch Top\/Side/)
  await invokeReactExactButton(page, 'Design')
  await invokeReactExactButton(page, 'Run Table')
  await page.waitForFunction(
    () => {
      const text = document.body.innerText
      return text.includes('Row: area_group') && text.includes('Col: q021')
    },
    null,
    { timeout: 60_000 },
  )
  const switchedState = await page.evaluate(() => ({
    tableCount: document.querySelectorAll('table').length,
    text: document.body.innerText,
  }))
  if (!switchedState.text.includes('Table1') || !switchedState.text.includes('area_group') || !switchedState.text.includes('q021')) {
    throw new Error(`Switched table did not preserve expected metadata. Text: ${switchedState.text.slice(0, 1000)}`)
  }

  await invokeSegmentedButton(page, 'Design', ['Design', 'Filter', 'Results'])
  await invokeSegmentedButton(page, 'Filter', ['Top', 'Side', 'Filter'])
  await invokeVariableAddButton(page, 'area_group')
  await invokeSegmentedButton(page, 'Filter', ['Design', 'Filter', 'Results'])
  await page.waitForFunction(
    () => {
      const text = document.body.innerText
      return text.includes('Filter') && text.includes('area_group') && text.includes('AND')
    },
    null,
    { timeout: 30_000 },
  )

  if (actionableMessages.length > 0) throw new Error(`Console errors: ${actionableMessages.join(' | ')}`)

  console.log(JSON.stringify({
    ok: true,
    url,
    fixturePath,
    hasDataset: loadedState.hasDataset,
    hasAreaGroup: loadedState.hasAreaGroup,
    hasQ021: loadedState.hasQ021,
    tableCount: switchedState.tableCount,
    generatedTable: true,
    hasFilterCondition: true,
    switchedTopSide: true,
    variableRows: loadedState.variableRows,
    ignoredMessages: messages.filter(ignoredConsoleMessage),
  }, null, 2))
} finally {
  await browser.close()
}
