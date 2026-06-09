/* Regression: cancelling the native Save dialog on Export (showSaveFilePicker rejects with
   AbortError) must NOT surface a red error banner — it's a normal user cancel. The index.html
   showSaveFilePicker wrapper swallows AbortError into a no-op handle so the bundle's export
   completes silently. Here we inject a picker that always rejects AbortError (= a guaranteed
   "cancel") BEFORE the wrapper installs, then assert no AbortError banner appears after Export. */
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

async function loadPlaywright() {
  try { return await import('playwright') } catch (error) {
    if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error
    const bundledPath = join(process.env.USERPROFILE || process.env.HOME || '', '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules', 'playwright', 'index.mjs')
    if (!existsSync(bundledPath)) throw error
    return import(pathToFileURL(bundledPath).href)
  }
}
async function clickRe(page, src) {
  return page.evaluate(s => {
    const re = new RegExp(s, 'i')
    const b = Array.from(document.querySelectorAll('button')).find(x => re.test(x.innerText))
    if (!b) throw new Error('btn not found: ' + s)
    const k = Object.keys(b).find(i => i.startsWith('__reactProps'))
    if (b[k]?.onClick) b[k].onClick({ preventDefault(){}, stopPropagation(){}, target: b, currentTarget: b }); else b.click()
  }, src)
}
async function clickExact(page, text, occ = 0) {
  return page.evaluate(({ t, o }) => {
    const b = Array.from(document.querySelectorAll('button')).filter(x => x.innerText.trim() === t)[o]
    if (!b) throw new Error('btn not found: ' + t)
    const k = Object.keys(b).find(i => i.startsWith('__reactProps'))
    if (b[k]?.onClick) b[k].onClick({ preventDefault(){}, stopPropagation(){}, target: b, currentTarget: b }); else b.click()
  }, { t: text, o: occ })
}
async function addVar(page, name) {
  await page.evaluate(n => {
    const adds = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === 'Add')
    const b = adds.find(i => i.parentElement?.parentElement?.innerText?.includes(n))
    if (!b) throw new Error('Add not found: ' + n)
    b.click()
  }, name)
  await page.waitForTimeout(300)
}

const url = process.env.CROSSFY_URL || 'http://localhost:5176/'
const fixturePath = resolve(process.cwd(), process.env.CROSSFY_SAV_FIXTURE || 'Edit 500+Booster.sav')
if (!existsSync(fixturePath)) throw new Error('SPSS fixture not found: ' + fixturePath)

const { chromium } = await loadPlaywright()
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1365, height: 768 } })
const page = await ctx.newPage()

try {
  await page.addInitScript(() => {
    window.__CX_AUTH_BYPASS = true
    try { Object.defineProperty(window, 'showOpenFilePicker', { value: undefined, configurable: true }) } catch (_) { window.showOpenFilePicker = undefined }
    // Force the FSA export path AND a guaranteed user-cancel: a picker that always AbortErrors.
    // Defined before index.html scripts so its wrapper captures THIS as the underlying picker.
    window.showSaveFilePicker = function () {
      return Promise.reject(new DOMException('The user aborted a request.', 'AbortError'))
    }
  })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => null)
  await page.waitForFunction(() => Boolean(window.__crossifyRuntime), null, { timeout: 10000 })
  await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button'))[3]; const k = Object.keys(b).find(i => i.startsWith('__reactProps')); b[k].onClick({ preventDefault(){}, stopPropagation(){}, target: b, currentTarget: b }) })
  await page.waitForFunction(() => document.body.innerText.includes('Workspace ready'), null, { timeout: 10000 })
  const cp = page.waitForEvent('filechooser', { timeout: 10000 })
  await clickRe(page, 'Load SPSS File')
  const ch = await cp; await ch.setFiles(fixturePath)
  await page.waitForFunction(() => document.body.innerText.includes('Edit 500+Booster.sav') || document.body.innerText.includes('1,415 cases'), null, { timeout: 90000 })

  await clickExact(page, 'Top'); await addVar(page, 'area_group')
  await clickExact(page, 'Side'); await addVar(page, 'q021')
  await clickExact(page, 'Run All')
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length > 0, null, { timeout: 60000 })
  await page.waitForTimeout(800)

  // Trigger export (FSA path -> our picker rejects AbortError == user cancel)
  await clickExact(page, 'Export Excel')
  await page.waitForTimeout(2500)

  const bannerText = await page.evaluate(() => {
    const t = document.body.innerText
    const hit = /The user aborted a request|AbortError/i.test(t)
    return { hasAbortBanner: hit, snippet: hit ? (t.match(/.{0,80}(AbortError|aborted).{0,80}/i) || [''])[0] : '' }
  })

  if (bannerText.hasAbortBanner) {
    throw new Error('Export-cancel still shows an error banner: ' + bannerText.snippet)
  }
  console.log(JSON.stringify({ ok: true, url, hasAbortBanner: false }, null, 2))
} finally {
  await browser.close()
}
