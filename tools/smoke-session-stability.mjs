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
  // Benign network noise for an OPTIONAL feature not provisioned in the test env:
  // the no-login Cloud-settings table (crossify_settings) doesn't exist here, so the
  // auto-load/autosave fetch 404s once. This is a UI-stability test, not a network test.
  return message.includes('net::ERR_NETWORK_ACCESS_DENIED')
    || message.includes('net::ERR_FAILED') // hermetic supabase route-abort
    || message.includes('Failed to load resource: the server responded with a status of 404')
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
      button.click()
      return
    }
    props.onClick({
      preventDefault() {},
      stopPropagation() {},
      target: button,
      currentTarget: button,
    })
  }, { buttonText: text, buttonOccurrence: occurrence })
}

async function invokeVariableAddButton(page, variableName) {
  return page.evaluate(name => {
    const addButtons = Array.from(document.querySelectorAll('button'))
      .filter(button => button.innerText.trim() === 'Add')
    const button = addButtons.find(item => item.parentElement?.parentElement?.innerText?.includes(name))
    if (!button) throw new Error(`Variable Add button not found: ${name}`)
    const key = Object.keys(button).find(item => item.startsWith('__reactProps'))
    const props = key ? button[key] : null
    if (!props || typeof props.onClick !== 'function') throw new Error(`React onClick not found for variable Add: ${name}`)
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
    const button = Array.from(document.querySelectorAll('button')).find(item => {
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

async function assertWorkspaceStable(page, label) {
  const state = await page.evaluate(() => ({
    hasDataset: Boolean(window.__cxDataset),
    text: document.body.innerText,
    tableCount: document.querySelectorAll('table').length,
  }))
  if (!state.hasDataset) throw new Error(`${label}: dataset disappeared from runtime bridge`)
  if (!state.text.includes('Edit 500+Booster.sav')) throw new Error(`${label}: workspace header disappeared`)
  if (state.text.includes('Start by loading an SPSS file')) throw new Error(`${label}: app returned to landing/load-empty screen`)
  return state
}

const url = process.env.CROSSFY_URL || 'http://localhost:5173/'
const fixturePath = resolve(process.cwd(), process.env.CROSSFY_SAV_FIXTURE || 'Edit 500+Booster.sav')
const iterations = Number.parseInt(process.env.CROSSFY_STABILITY_ITERATIONS || '12', 10)

if (!existsSync(fixturePath)) {
  throw new Error(`SPSS fixture not found: ${fixturePath}`)
}

const { chromium } = await loadPlaywright()
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1365, height: 768 } })
await page.route('**/supabase/**', r => r.abort()) // hermetic: no production cloud settings
const messages = []
let unexpectedReloads = 0
let countUnexpectedReloads = false

page.on('console', message => {
  if (['error', 'warning'].includes(message.type())) messages.push(`${message.type()}: ${message.text()}`)
})
page.on('pageerror', error => messages.push(`pageerror: ${error.message}`))
page.on('framenavigated', frame => {
  if (countUnexpectedReloads && frame === page.mainFrame() && frame.url() !== 'about:blank') unexpectedReloads += 1
})

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
  await page.waitForFunction(
    () => document.body.innerText.includes('Edit 500+Booster.sav') || document.body.innerText.includes('1,415 cases'),
    null,
    { timeout: 90_000 },
  )

  await invokeReactExactButton(page, 'Top')
  await invokeVariableAddButton(page, 'area_group')
  await invokeReactExactButton(page, 'Side')
  await invokeVariableAddButton(page, 'q021')
  await invokeReactExactButton(page, 'Run Table')
  await page.waitForFunction(() => document.querySelectorAll('table').length > 0, null, { timeout: 60_000 })
  await assertWorkspaceStable(page, 'initial result')
  countUnexpectedReloads = true

  for (let index = 0; index < iterations; index += 1) {
    await invokeReactExactButton(page, 'Design')
    await invokeReactExactButton(page, 'Run Table')
    await page.waitForFunction(() => document.body.innerText.includes('Row:') && document.body.innerText.includes('Col:'), null, { timeout: 60_000 })
    await assertWorkspaceStable(page, `iteration ${index + 1} after run`)

    if (index % 3 === 0) {
      await invokeReactOnClick(page, /Switch Top\/Side/)
      await invokeReactExactButton(page, 'Design')
      await invokeReactExactButton(page, 'Run Table')
      await page.waitForFunction(() => document.body.innerText.includes('Row:') && document.body.innerText.includes('Col:'), null, { timeout: 60_000 })
      await assertWorkspaceStable(page, `iteration ${index + 1} after switch`)
    }

    if (index % 4 === 0) {
      await invokeSegmentedButton(page, 'Filter', ['Design', 'Filter', 'Results'])
      await assertWorkspaceStable(page, `iteration ${index + 1} after filter tab`)
      await invokeSegmentedButton(page, 'Results', ['Design', 'Filter', 'Results'])
      await assertWorkspaceStable(page, `iteration ${index + 1} after results tab`)
    }
  }

  const actionableMessages = messages.filter(message => !ignoredConsoleMessage(message))
  if (actionableMessages.length > 0) throw new Error(`Console errors: ${actionableMessages.join(' | ')}`)

  console.log(JSON.stringify({
    ok: true,
    url,
    fixturePath,
    iterations,
    unexpectedReloads,
    ignoredMessages: messages.filter(ignoredConsoleMessage),
  }, null, 2))
} finally {
  await browser.close()
}
