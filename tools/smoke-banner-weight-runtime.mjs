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
    const buttons = Array.from(document.querySelectorAll('button')).filter(item => item.innerText.trim() === buttonText)
    const button = buttons[buttonOccurrence]
    if (!button) throw new Error(`Button not found: ${buttonText}`)
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

async function invokeReactButtonAt(page, index) {
  return page.evaluate(buttonIndex => {
    const button = Array.from(document.querySelectorAll('button'))[buttonIndex]
    if (!button) throw new Error(`Button index not found: ${buttonIndex}`)
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
  }, index)
}

async function invokeVariableAddButton(page, variableName) {
  return page.evaluate(name => {
    const addButtons = Array.from(document.querySelectorAll('button')).filter(button => button.innerText.trim() === 'Add')
    const button = addButtons.find(item => item.parentElement?.parentElement?.innerText?.includes(name))
    if (!button) throw new Error(`Variable Add button not found: ${name}`)
    const key = Object.keys(button).find(item => item.startsWith('__reactProps'))
    const props = key ? button[key] : null
    if (!props || typeof props.onClick !== 'function') throw new Error(`React onClick not found: ${name}`)
    props.onClick({
      preventDefault() {},
      stopPropagation() {},
      target: button,
      currentTarget: button,
    })
  }, variableName)
}

const url = process.env.CROSSFY_URL || 'http://localhost:5173/'
const fixturePath = resolve(process.cwd(), process.env.CROSSFY_SAV_FIXTURE || 'Edit 500+Booster.sav')

if (!existsSync(fixturePath)) throw new Error(`SPSS fixture not found: ${fixturePath}`)

const { chromium } = await loadPlaywright()
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1365, height: 768 } })
const messages = []

page.on('console', message => {
  if (['error', 'warning'].includes(message.type()) && !message.text().includes('net::ERR_NETWORK_ACCESS_DENIED')) {
    messages.push(`${message.type()}: ${message.text()}`)
  }
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
  await page.waitForFunction(() => document.body.innerText.includes('1,415 cases'), null, { timeout: 90_000 })

  await invokeReactExactButton(page, 'Top')
  await invokeVariableAddButton(page, 'area_group')
  await invokeReactExactButton(page, 'Side')
  await invokeVariableAddButton(page, 'q021')
  await invokeReactExactButton(page, 'Run Table')
  await page.waitForFunction(() => document.body.innerText.includes('q021') && document.body.innerText.includes('area_group'), null, { timeout: 60_000 })

  const savedBanner = await page.evaluate(async () => {
    const item = await window.__cxBannerSaveCurrentForTest?.('Banner1')
    return Boolean(item && item.name === 'Banner1')
  })
  if (!savedBanner) throw new Error('Banner save helper did not save Banner1')

  const bannerState = await page.evaluate(() => ({
    banners: window.__cxGetBannerTemplates?.() || [],
    snapshot: window.__cxBuildWorkspaceSnapshot ? window.__cxBuildWorkspaceSnapshot() : null,
  }))
  if (bannerState.banners.length !== 1) throw new Error(`Expected one banner, got ${bannerState.banners.length}`)
  if (!bannerState.banners[0].table?.rowVar || !bannerState.banners[0].table?.colVar) {
    throw new Error(`Saved banner did not capture table axes: ${JSON.stringify(bannerState.banners[0])}`)
  }

  await invokeReactOnClick(page, /Output Options/)
  await page.waitForSelector('[data-cx-weight-picker] select', { timeout: 10_000 })
  const weightOptions = await page.evaluate(() => Array.from(document.querySelectorAll('[data-cx-weight-picker] option')).map(opt => opt.value))
  if (weightOptions.includes('V4799_A')) throw new Error(`Weight picker includes non-weight V4799_A: ${weightOptions.join(', ')}`)
  if (!weightOptions.includes('W_TOTAL') && !weightOptions.some(value => /^WEIGHT/i.test(value))) {
    throw new Error(`Weight picker did not include expected weight variables: ${weightOptions.join(', ')}`)
  }

  await page.evaluate(() => {
    const batch = Array.from(document.querySelectorAll('button')).find(button => button.innerText.trim() === 'Batch')
    if (!batch) throw new Error('Batch button not found')
    batch.click()
  })
  await page.waitForSelector('[data-cx-banner="manage"]', { timeout: 10_000 })
  await page.click('[data-cx-banner="manage"]')
  await page.waitForSelector('[data-export-selected]', { timeout: 10_000 })
  const managerState = await page.evaluate(() => ({
    hasExportSelected: Boolean(document.querySelector('[data-export-selected]')),
    hasLoadSelected: Boolean(document.querySelector('[data-load-selected]')),
    managerText: document.body.innerText,
  }))
  if (!managerState.hasExportSelected || !managerState.hasLoadSelected) {
    throw new Error(`Saved Banners manager missing batch actions: ${JSON.stringify(managerState)}`)
  }

  if (messages.length > 0) throw new Error(`Console errors: ${messages.join(' | ')}`)

  console.log(JSON.stringify({
    ok: true,
    fixturePath,
    bannerCount: bannerState.banners.length,
    weightOptionCount: weightOptions.length,
    hasWTotal: weightOptions.includes('W_TOTAL'),
    excludesV4799A: !weightOptions.includes('V4799_A'),
    hasBannerExportSelected: managerState.hasExportSelected,
  }, null, 2))
} finally {
  await browser.close()
}
