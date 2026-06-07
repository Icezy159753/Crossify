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

async function invokeButtonAt(page, index, label) {
  await page.evaluate(
    ({ buttonIndex, buttonLabel }) => {
      const button = Array.from(document.querySelectorAll('button'))[buttonIndex]
      if (!button) throw new Error(`Button index not found: ${buttonLabel}`)
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
    { buttonIndex: index, buttonLabel: label },
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

  await invokeButtonAt(page, 3, 'enter app')
  await page.waitForFunction(() => document.body.innerText.includes('Workspace ready'), null, { timeout: 10_000 })

  const chooserPromise = page.waitForEvent('filechooser', { timeout: 10_000 })
  await invokeReactButton(page, 'return /Load SPSS File/i.test(button.innerText)', 'load spss')
  const chooser = await chooserPromise
  await chooser.setFiles(fixturePath)
  await page.waitForFunction(
    () => document.body.innerText.includes('Edit 500+Booster.sav') || document.body.innerText.includes('1,415 cases'),
    null,
    { timeout: 90_000 },
  )

  const result = await page.evaluate(async () => {
    window.__cxOpenDeriveModal(null, 'create')
    await new Promise(resolve => setTimeout(resolve, 300))

    const nameInput = document.querySelector('#cx-dv-name')
    const labelInput = document.querySelector('#cx-dv-label')
    const visibleInputs = Array.from(document.querySelectorAll('input')).filter(
      input => input.offsetWidth || input.offsetHeight || input.getClientRects().length,
    )
    const expression = Array.from(document.querySelectorAll('textarea')).find(
      textarea => textarea.offsetWidth || textarea.offsetHeight || textarea.getClientRects().length,
    )
    if (!nameInput || !expression) throw new Error('Derived variable modal did not open')

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

    setInputValue(nameInput, 'ZZZ')
    if (labelInput) {
      setInputValue(labelInput, 'ZZZ')
    }
    const codeLabelInput = visibleInputs.find(input => {
      if (input === nameInput || input === labelInput) return false
      const value = String(input.value || '').trim()
      const placeholder = `${input.placeholder || ''} ${input.getAttribute('aria-label') || ''}`.toLowerCase()
      return value === '' && !placeholder.includes('search') && !placeholder.includes('ค้นหา')
    })
    if (codeLabelInput) {
      setInputValue(codeLabelInput, 'd1')
    }
    setTextareaValue(expression, 'AREA_GROUP=1')

    const visibleButtons = Array.from(document.querySelectorAll('button')).filter(
      button => button.offsetWidth || button.offsetHeight || button.getClientRects().length,
    )
    visibleButtons[visibleButtons.length - 1].click()
    await new Promise(resolve => setTimeout(resolve, 900))

    const ds = window.__cxDataset
    const areaOneCount = ds.cases.reduce((count, row) => count + (row.AREA_GRO === 1 ? 1 : 0), 0)
    // A single-rule derived var is created as one normal (SA) variable named ZZZ_O holding
    // the 0/1 flag directly (NOT a 1-member MA group, which fails to aggregate in crosstabs).
    const derivedCount = ds.cases.reduce((count, row) => count + (row.ZZZ_O === 1 ? 1 : 0), 0)
    const zzz = ds.variables.find(variable => variable.name === 'ZZZ_O')
    return {
      hasMember: !!zzz,
      memberLabel: zzz?.valueLabels?.['1'],
      codeLabelEntered: Boolean(codeLabelInput),
      areaOneCount,
      derivedCount,
    }
  })

  if (!result.hasMember || result.derivedCount <= 0 || result.derivedCount !== result.areaOneCount) {
    throw new Error(`Derived expression did not compute correctly: ${JSON.stringify(result, null, 2)}`)
  }
  if (result.codeLabelEntered && result.memberLabel !== 'd1') {
    throw new Error(`Derived expression code label was not preserved: ${JSON.stringify(result, null, 2)}`)
  }

  const actionableMessages = messages.filter(message => !message.includes('net::ERR_NETWORK_ACCESS_DENIED'))
  if (actionableMessages.length > 0) throw new Error(`Console errors: ${actionableMessages.join(' | ')}`)

  console.log(JSON.stringify({
    ok: true,
    url,
    fixturePath,
    derivedCount: result.derivedCount,
    areaOneCount: result.areaOneCount,
  }, null, 2))
} finally {
  await browser.close()
}
