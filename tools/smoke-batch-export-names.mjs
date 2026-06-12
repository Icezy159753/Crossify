/* Smoke: batch "Export Selected Banners" names each file after its banner and auto-downloads
   (no per-file Save dialog). Guards the per-banner-filename + progress feature, which depends on
   forcing the saveAs path (window.showSaveFilePicker hidden during the batch) and the anchor-click
   interceptor renaming the bundle's own <a download>. Requires the dev server on CROSSFY_URL. */
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

async function reactClickExact(page, text, occ = 0) {
  return page.evaluate(({ t, o }) => {
    const b = Array.from(document.querySelectorAll('button')).filter(x => x.innerText.trim() === t)[o]
    if (!b) throw new Error('btn not found: ' + t)
    const k = Object.keys(b).find(i => i.startsWith('__reactProps'))
    const p = k ? b[k] : null
    if (p?.onClick) p.onClick({ preventDefault(){}, stopPropagation(){}, target: b, currentTarget: b }); else b.click()
  }, { t: text, o: occ })
}
async function reactClickRe(page, src) {
  return page.evaluate(s => {
    const re = new RegExp(s, 'i')
    const b = Array.from(document.querySelectorAll('button')).find(x => re.test(x.innerText))
    if (!b) throw new Error('btn not found: ' + s)
    const k = Object.keys(b).find(i => i.startsWith('__reactProps'))
    const p = k ? b[k] : null
    if (p?.onClick) p.onClick({ preventDefault(){}, stopPropagation(){}, target: b, currentTarget: b }); else b.click()
  }, src.source)
}
async function addVar(page, name) {
  return page.evaluate(n => {
    const adds = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === 'Add')
    const b = adds.find(i => i.parentElement?.parentElement?.innerText?.includes(n))
    if (!b) throw new Error('Add not found: ' + n)
    const k = Object.keys(b).find(i => i.startsWith('__reactProps'))
    b[k].onClick({ preventDefault(){}, stopPropagation(){}, target: b, currentTarget: b })
  }, name)
}

const url = process.env.CROSSFY_URL || 'http://localhost:5176/'
const fixturePath = resolve(process.cwd(), process.env.CROSSFY_SAV_FIXTURE || 'Edit 500+Booster.sav')
if (!existsSync(fixturePath)) throw new Error('SPSS fixture not found: ' + fixturePath)

const { chromium } = await loadPlaywright()
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1365, height: 768 }, acceptDownloads: true })
const page = await context.newPage()
await page.route('**/supabase/**', r => r.abort()) // hermetic: no production cloud settings
const downloads = []
page.on('download', d => downloads.push(d.suggestedFilename()))
const errors = []
page.on('pageerror', e => errors.push(e.message))

try {
  await page.addInitScript(() => {
    window.__CX_AUTH_BYPASS = true
    try { Object.defineProperty(window, 'showOpenFilePicker', { value: undefined, configurable: true }) } catch (_) { window.showOpenFilePicker = undefined }
  })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => null)
  await page.waitForFunction(() => Boolean(window.__crossifyRuntime), null, { timeout: 10000 })
  await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button'))[3]; const k = Object.keys(b).find(i => i.startsWith('__reactProps')); b[k].onClick({ preventDefault(){}, stopPropagation(){}, target: b, currentTarget: b }) })
  await page.waitForFunction(() => document.body.innerText.includes('Workspace ready'), null, { timeout: 10000 })

  const chooserPromise = page.waitForEvent('filechooser', { timeout: 10000 })
  await reactClickRe(page, /Load SPSS File/)
  const chooser = await chooserPromise
  await chooser.setFiles(fixturePath)
  await page.waitForFunction(() => document.body.innerText.includes('Edit 500+Booster.sav') || document.body.innerText.includes('1,415 cases'), null, { timeout: 90000 })

  await reactClickExact(page, 'Top')
  await addVar(page, 'area_group')
  await reactClickExact(page, 'Side')
  await addVar(page, 'q021')
  await reactClickExact(page, 'Run Table')
  await page.waitForFunction(() => document.querySelectorAll('table').length > 0, null, { timeout: 60000 })

  const ids = await page.evaluate(async () => {
    await window.__cxBannerSaveCurrentForTest('Brand Awareness')
    await window.__cxBannerSaveCurrentForTest('Demographics TH')
    return window.__cxGetBannerTemplates().map(b => b.id)
  })
  if (ids.length < 2) throw new Error('expected 2 banners, got ' + ids.length)

  const exportErr = await page.evaluate(async idList => {
    try { await window.__cxBannerExportSelectedForTest(idList); return null }
    catch (e) { return String(e && e.message || e) }
  }, ids)
  if (exportErr) throw new Error('exportSelected rejected: ' + exportErr)
  await page.waitForTimeout(2000)

  const expected = ['01_Brand Awareness.xlsx', '02_Demographics TH.xlsx']
  const ok = expected.every(n => downloads.includes(n))
  if (!ok) throw new Error('per-banner filenames incorrect. downloads=' + JSON.stringify(downloads))
  if (errors.length) throw new Error('page errors: ' + errors.join(' | '))

  console.log(JSON.stringify({ ok: true, url, downloads, expected }, null, 2))
} finally {
  await browser.close()
}
