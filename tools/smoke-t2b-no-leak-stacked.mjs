/* Regression: a T2B/summary preset set on ONE variable must NOT leak onto OTHER variables that
   merely share value labels when they are stacked together in the SIDE. Guards the removal of the
   fuzzy label-based preset fallback in cxResolveTbInfoForSection (which made T2B appear on
   questions that never set it, and hijacked a section's Net lookup key). Requires the dev server. */
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
async function setSearch(page, query) {
  await page.evaluate(value => {
    const input = Array.from(document.querySelectorAll('input')).find(i => {
      const t = `${i.placeholder || ''} ${i.getAttribute('aria-label') || ''}`.toLowerCase()
      return t.includes('search') || t.includes('ค้นหา')
    })
    if (!input) return
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    if (setter) setter.call(input, value); else input.value = value
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }, query)
  await page.waitForTimeout(300)
}
async function addVar(page, name) {
  await page.evaluate(n => {
    const nlc = String(n).toLowerCase()
    const adds = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === 'Add')
    const b = adds.find(i => (i.parentElement?.parentElement?.innerText || '').toLowerCase().includes(nlc))
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
  const cp = page.waitForEvent('filechooser', { timeout: 10000 })
  await clickRe(page, 'Load SPSS File')
  const ch = await cp; await ch.setFiles(fixturePath)
  await page.waitForFunction(() => document.body.innerText.includes('Edit 500+Booster.sav') || document.body.innerText.includes('1,415 cases'), null, { timeout: 90000 })

  // Confirm Q007 & Q009 share value labels (the precondition that triggers the old fuzzy leak)
  const pre = await page.evaluate(() => {
    const ds = window.__cxDataset
    const get = n => ds.variables.find(v => String(v.name).toUpperCase() === n)
    const q7 = get('Q007'), q9 = get('Q009')
    const labs = v => v && v.valueLabels ? Object.values(v.valueLabels).map(x => String(x).trim()).sort().join('|') : ''
    return { hasBoth: !!(q7 && q9), shareLabels: !!(q7 && q9) && labs(q7) === labs(q9), labels: labs(q7) }
  })
  if (!pre.hasBoth || !pre.shareLabels) throw new Error('precondition failed: ' + JSON.stringify(pre))

  // Top banner (so the table runs), then a stacked SIDE: Q007 + Q009
  await clickExact(page, 'Top')
  await setSearch(page, 'area_group'); await addVar(page, 'area_group')
  await clickExact(page, 'Side')
  await setSearch(page, 'Q007'); await addVar(page, 'Q007')
  await setSearch(page, 'Q009'); await addVar(page, 'Q009')

  // Set a T2B/summary preset on Q007 ONLY (distinctive code ZZTOPBOX on the 'มี' member)
  await page.evaluate(() => {
    const ds = window.__cxDataset
    const q7 = ds.variables.find(v => String(v.name).toUpperCase() === 'Q007')
    const memberLabels = Object.assign({}, q7.valueLabels)
    // summary spans ALL member codes so it materializes on whatever response rows actually render
    const allCodes = Object.keys(q7.valueLabels)
    const store = window.__cxGetTbPresetStore() || {}
    store[q7.name] = { summaries: [{ code: 'ZZTOPBOX', members: allCodes }], memberLabels }
    window.__cxSetTbPresetStore(store)
  })

  await clickExact(page, 'Run All')
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length > 0, null, { timeout: 60000 })
  await page.waitForTimeout(1200)

  const res = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr')).map(r => r.innerText.replace(/\s+/g, ' ').trim())
    const topboxRows = rows.filter(r => /ZZTOPBOX/.test(r))
    return { topboxCount: topboxRows.length, totalRows: rows.length }
  })

  // Legit T2B (Q007) must appear exactly once; it must NOT leak to Q009 (would be 2).
  if (res.topboxCount !== 1) {
    throw new Error(`T2B leak/absence: expected exactly 1 ZZTOPBOX row (Q007 only), got ${res.topboxCount}. ${JSON.stringify(res)}`)
  }
  if (errors.length) throw new Error('page errors: ' + errors.join(' | '))
  console.log(JSON.stringify({ ok: true, url, topboxCount: res.topboxCount, sharedLabels: pre.labels }, null, 2))
} finally {
  await browser.close()
}
