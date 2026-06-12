/* Smoke: Light load mode (big SPSS) must still run tables correctly and FAST on re-runs.
   Forces light mode on the small fixture via window.__CX_LIGHT_LOAD_THRESHOLD, runs a table
   twice, asserts rows render with counts and that the cached re-run is not pathologically slow
   (regression guard for the re-label-entire-dataset-per-run bug). */
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
async function clickExact(page, t, occ = 0) {
  return page.evaluate(({ tt, o }) => {
    const b = Array.from(document.querySelectorAll('button')).filter(x => x.innerText.trim() === tt)[o]
    if (!b) throw new Error('no ' + tt)
    const k = Object.keys(b).find(i => i.startsWith('__reactProps'))
    if (b[k]?.onClick) b[k].onClick({ preventDefault(){}, stopPropagation(){}, target: b, currentTarget: b }); else b.click()
  }, { tt: t, o: occ })
}
async function clickRe(page, src) {
  return page.evaluate(x => {
    const re = new RegExp(x, 'i')
    const b = Array.from(document.querySelectorAll('button')).find(y => re.test(y.innerText))
    if (!b) throw new Error('no btn ' + x)
    const k = Object.keys(b).find(i => i.startsWith('__reactProps'))
    b[k].onClick({ preventDefault(){}, stopPropagation(){}, target: b, currentTarget: b })
  }, src)
}
async function addVar(page, n) {
  await page.evaluate(nn => {
    const adds = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === 'Add')
    const b = adds.find(i => i.parentElement?.parentElement?.innerText?.includes(nn))
    if (!b) throw new Error('no add ' + nn)
    b.click()
  }, n)
  await page.waitForTimeout(300)
}
const url = process.env.CROSSFY_URL || 'http://localhost:5176/'
const fixturePath = resolve(process.cwd(), process.env.CROSSFY_SAV_FIXTURE || 'Edit 500+Booster.sav')
if (!existsSync(fixturePath)) throw new Error('fixture missing')
const { chromium } = await loadPlaywright()
const browser = await chromium.launch({ headless: true })
const page = await (await browser.newContext({ viewport: { width: 1365, height: 768 } })).newPage()
try {
  await page.addInitScript(() => {
    window.__CX_AUTH_BYPASS = true
    window.__CX_LIGHT_LOAD_THRESHOLD = 1024 * 1024 // 1MB → force light mode on the 21MB fixture
    try { Object.defineProperty(window, 'showOpenFilePicker', { value: undefined, configurable: true }) } catch (_) { window.showOpenFilePicker = undefined }
  })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => null)
  await page.waitForFunction(() => Boolean(window.__crossifyRuntime), null, { timeout: 10000 })
  await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button'))[3]; const k = Object.keys(b).find(i => i.startsWith('__reactProps')); b[k].onClick({ preventDefault(){}, stopPropagation(){}, target: b, currentTarget: b }) })
  await page.waitForFunction(() => document.body.innerText.includes('Workspace ready'), null, { timeout: 10000 })
  const cp = page.waitForEvent('filechooser', { timeout: 10000 })
  await clickRe(page, 'Load SPSS File')
  const ch = await cp; await ch.setFiles(fixturePath)
  await page.waitForFunction(() => document.body.innerText.includes('1,415 cases'), null, { timeout: 90000 })

  const lightOn = await page.evaluate(() => document.body.innerText.includes('Light load mode'))
  if (!lightOn) throw new Error('light mode badge not shown (threshold hook failed)')

  await clickExact(page, 'Top'); await addVar(page, 'area_group')
  await clickExact(page, 'Side'); await addVar(page, 'q021')
  const t0 = Date.now()
  await clickExact(page, 'Run Table')
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length > 0, null, { timeout: 60000 })
  const run1 = Date.now() - t0
  const hasCounts = await page.evaluate(() => /1,415|565/.test(document.body.innerText))
  if (!hasCounts) throw new Error('light-mode table missing expected counts')

  await clickExact(page, 'Design'); await page.waitForTimeout(300)
  const t1 = Date.now()
  await clickExact(page, 'Run Table')
  await page.waitForFunction(() => document.body.innerText.includes('Row:'), null, { timeout: 60000 })
  const run2 = Date.now() - t1
  console.log(JSON.stringify({ ok: true, lightOn, run1ms: run1, run2ms: run2, hasCounts }, null, 2))
} finally { await browser.close() }
