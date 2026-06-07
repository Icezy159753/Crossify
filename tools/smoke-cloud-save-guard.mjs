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

async function clickButton(page, label) {
  await page.evaluate(buttonLabel => {
    const button = Array.from(document.querySelectorAll('button'))
      .find(item => item.innerText.trim() === buttonLabel || item.innerText.includes(buttonLabel))
    if (!button) throw new Error(`Button not found: ${buttonLabel}`)
    const key = Object.keys(button).find(item => item.startsWith('__reactProps'))
    const props = key ? button[key] : null
    if (props && typeof props.onClick === 'function') {
      props.onClick({
        preventDefault() {},
        stopPropagation() {},
        target: button,
        currentTarget: button,
      })
      return
    }
    button.click()
  }, label)
}

async function clickButtonAt(page, index) {
  await page.evaluate(buttonIndex => {
    const button = Array.from(document.querySelectorAll('button'))[buttonIndex]
    if (!button) throw new Error(`Button index not found: ${buttonIndex}`)
    const key = Object.keys(button).find(item => item.startsWith('__reactProps'))
    const props = key ? button[key] : null
    if (props && typeof props.onClick === 'function') {
      props.onClick({
        preventDefault() {},
        stopPropagation() {},
        target: button,
        currentTarget: button,
      })
      return
    }
    button.click()
  }, index)
}

const url = process.env.CROSSFY_URL || 'http://localhost:5173/'
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
    localStorage.removeItem('crossify.supabase.autosave')
  })
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 })
  await page.waitForFunction(() => Boolean(window.__crossifyRuntime), null, { timeout: 10_000 })

  const landingState = await page.evaluate(() => ({
    hasLanding: document.body.innerText.includes('Crossify'),
    bannerMenuInjected: Boolean(document.querySelector('[data-cx-banner-menu]')),
    desktopDownloadHref: document.querySelector('#cx-download-desktop-app')?.getAttribute('href') || '',
    autosaveDefaultOff: localStorage.getItem('crossify.supabase.autosave') !== 'on',
  }))
  if (!landingState.hasLanding) throw new Error('Landing page did not render')
  if (landingState.bannerMenuInjected) throw new Error('Banner menu should not inject into the landing page')
  if (landingState.desktopDownloadHref !== '/downloads/Crossify-Desktop.exe') {
    throw new Error('Desktop Download App button is missing or points to the wrong file')
  }
  if (!landingState.autosaveDefaultOff) throw new Error('AutoSave should default to Off')

  if (messages.length > 0) throw new Error(`Console errors: ${messages.join(' | ')}`)

  console.log(JSON.stringify({
    ok: true,
    url,
    landingClean: !landingState.bannerMenuInjected,
    desktopDownloadHref: landingState.desktopDownloadHref,
    autosaveDefaultOff: landingState.autosaveDefaultOff,
  }, null, 2))
} finally {
  await browser.close()
}
