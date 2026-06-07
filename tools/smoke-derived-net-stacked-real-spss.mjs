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
        props.onClick({ preventDefault() {}, stopPropagation() {}, target: button, currentTarget: button })
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
      const buttons = Array.from(document.querySelectorAll('button')).filter(item => item.innerText.trim() === buttonText)
      const button = buttons[buttonOccurrence]
      if (!button) throw new Error(`Button not found: ${buttonText} (${buttonOccurrence})`)
      const key = Object.keys(button).find(item => item.startsWith('__reactProps'))
      const props = key ? button[key] : null
      if (props?.onClick) {
        props.onClick({ preventDefault() {}, stopPropagation() {}, target: button, currentTarget: button })
      } else {
        button.click()
      }
    },
    { buttonText: text, buttonOccurrence: occurrence },
  )
}

async function invokeVariableAddButton(page, variableName) {
  await page.evaluate(name => {
    const addButtons = Array.from(document.querySelectorAll('button')).filter(button => button.innerText.trim() === 'Add')
    const button = addButtons.find(item => item.parentElement?.parentElement?.innerText?.includes(name))
    if (!button) throw new Error(`Variable Add button not found: ${name}`)
    button.click()
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

async function createDerivedVariable(page) {
  await page.evaluate(async () => {
    window.__cxOpenDeriveModal(null, 'create')
    await new Promise(resolve => setTimeout(resolve, 300))
    const setInputValue = (input, value) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      if (setter) setter.call(input, value)
      else input.value = value
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
    const setTextareaValue = (textarea, value) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
      if (setter) setter.call(textarea, value)
      else textarea.value = value
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
      textarea.dispatchEvent(new Event('change', { bubbles: true }))
    }
    const nameInput = document.querySelector('#cx-dv-name')
    const labelInput = document.querySelector('#cx-dv-label')
    const codeLabelInput = Array.from(document.querySelectorAll('input')).find(input =>
      input !== nameInput
      && input !== labelInput
      && (input.offsetWidth || input.offsetHeight || input.getClientRects().length)
      && String(input.value || '').trim() === ''
      && !String(input.placeholder || '').includes('ค้นหา')
    )
    const expression = Array.from(document.querySelectorAll('textarea')).find(
      textarea => textarea.offsetWidth || textarea.offsetHeight || textarea.getClientRects().length,
    )
    if (!nameInput || !expression) throw new Error('Derived modal did not open')
    setInputValue(nameInput, 'ZZNET')
    if (labelInput) setInputValue(labelInput, 'Derived Net Smoke')
    if (codeLabelInput) setInputValue(codeLabelInput, 'd1')
    setTextareaValue(expression, 'AREA_GROUP=1')
    const visibleButtons = Array.from(document.querySelectorAll('button')).filter(
      button => button.offsetWidth || button.offsetHeight || button.getClientRects().length,
    )
    visibleButtons[visibleButtons.length - 1].click()
    await new Promise(resolve => setTimeout(resolve, 900))
  })
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
    const ov = window.__cxFindLiveOverridesObject?.() || window.__cxVariableOverrides || {}
    const existing = ov.area_group && typeof ov.area_group === 'object' ? ov.area_group : {}
    ov.area_group = {
      ...existing,
      labels: { ...(existing.labels || {}), ...area.valueLabels },
      groups: [{ id: 'smoke_net_area_group', name: 'Smoke Net', members: labelEntries.slice(0, 2).map(([code]) => String(code)) }],
    }
    window.__cxVariableOverrides = ov
  })
}

const url = process.env.CROSSFY_URL || 'http://localhost:5173/'
const fixturePath = resolve(process.cwd(), process.env.CROSSFY_SAV_FIXTURE || 'Edit 500+Booster.sav')
if (!existsSync(fixturePath)) throw new Error(`SPSS fixture not found: ${fixturePath}`)

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
  await invokeReactButton(page, 'return /Enter|Start|เข้าใช้งานโปรแกรม/i.test(button.innerText)', 'enter app')
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

  await createDerivedVariable(page)
  await injectAreaGroupNet(page)
  await invokeReactExactButton(page, 'Top')
  await invokeVariableAddButton(page, 'area_group')
  await invokeReactExactButton(page, 'Side')
  await invokeVariableAddButton(page, 'area_group')
  await setVariableSearch(page, 'ZZNET')
  await invokeVariableAddButton(page, 'ZZNET_O')
  await invokeReactExactButton(page, 'Run Table')
  await page.waitForFunction(() => document.body.innerText.includes('Row: area_group + ZZNET_O'), null, { timeout: 60_000 })

  const result = await page.evaluate(() => {
    const text = document.body.innerText
    const rows = Array.from(document.querySelectorAll('tbody tr')).map(row => row.innerText.replace(/\s+/g, ' ').trim())
    return {
      text,
      hasAreaGroupNetRow: Array.from(document.querySelectorAll('td, th')).some(cell => cell.innerText.trim() === 'Net : Smoke Net'),
      hasDerivedLabel: Array.from(document.querySelectorAll('td, th')).some(cell => cell.innerText.trim() === 'd1'),
      derivedRowText: rows.find(row => row.includes('d1')) || '',
    }
  })

  if (!result.hasAreaGroupNetRow) throw new Error(`Stacked derived table missed area_group Net row. Text: ${result.text.slice(0, 1200)}`)
  if (!result.hasDerivedLabel || !/\b565\b/.test(result.derivedRowText)) {
    throw new Error(`Stacked derived table did not render derived label/count. Debug: ${JSON.stringify(result, null, 2)}`)
  }

  const actionableMessages = messages.filter(message => !message.includes('net::ERR_NETWORK_ACCESS_DENIED'))
  if (actionableMessages.length > 0) throw new Error(`Console errors: ${actionableMessages.join(' | ')}`)

  console.log(JSON.stringify({ ok: true, url, fixturePath, hasAreaGroupNetRow: result.hasAreaGroupNetRow, derivedRowText: result.derivedRowText }, null, 2))
} finally {
  await browser.close()
}
