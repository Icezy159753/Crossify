import { existsSync } from 'node:fs'
import { join } from 'node:path'
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

const url = process.env.CROSSFY_URL || 'http://localhost:5173/'
const { chromium } = await loadPlaywright()

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1365, height: 768 } })
const messages = []

page.on('console', message => {
  if (['error', 'warning'].includes(message.type())) {
    messages.push(`${message.type()}: ${message.text()}`)
  }
})
page.on('pageerror', error => messages.push(`pageerror: ${error.message}`))

try {
  await page.addInitScript(() => {
    window.__CX_AUTH_BYPASS = true
  })
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15_000 })
  await page.waitForFunction(() => Boolean(window.__crossifyRuntime?.confirm), null, { timeout: 10_000 })

  const runtimeKeys = await page.evaluate(() => Object.keys(window.__crossifyRuntime || {}).sort())
  const hasStaticNetBridge = await page.evaluate(() => typeof window.__cxInjectNetGroups === 'function')
  const hasRuntimeAlertHelper = await page.evaluate(() => typeof window.cxRuntimeAlert === 'function')

  await page.evaluate(() => {
    window.__confirmSmokeResult = 'pending'
    window.__crossifyRuntime.confirm({
      title: 'Confirm bridge',
      text: 'Smoke test',
      confirmText: 'Proceed',
      cancelText: 'Cancel',
    }).then(value => { window.__confirmSmokeResult = value })
  })
  await page.waitForSelector('.cx-swal-card', { timeout: 10_000 })
  await page.locator('.cx-swal-secondary').click()
  await page.waitForFunction(() => window.__confirmSmokeResult === false, null, { timeout: 10_000 })

  const confirmResult = await page.evaluate(() => window.__confirmSmokeResult)
  const actionableErrors = messages.filter(message => !message.includes('net::ERR_NETWORK_ACCESS_DENIED'))

  if (!runtimeKeys.includes('alert') || !runtimeKeys.includes('confirm') || !runtimeKeys.includes('toast')) {
    throw new Error(`Runtime bridge missing expected keys: ${runtimeKeys.join(', ')}`)
  }
  if (!hasStaticNetBridge) throw new Error('Static Net bridge is not available')
  if (!hasRuntimeAlertHelper) throw new Error('Static runtime alert helper is not available')
  if (confirmResult !== false) throw new Error(`Confirm cancel path returned ${confirmResult}`)
  if (actionableErrors.length > 0) throw new Error(`Console errors: ${actionableErrors.join(' | ')}`)

  console.log(JSON.stringify({
    ok: true,
    url,
    runtimeKeys,
    hasStaticNetBridge,
    hasRuntimeAlertHelper,
    confirmResult,
    ignoredMessages: messages.filter(message => message.includes('net::ERR_NETWORK_ACCESS_DENIED')),
  }, null, 2))
} finally {
  await browser.close()
}
