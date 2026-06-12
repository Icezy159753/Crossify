/* Regression: Batch (Export Selected Banners) must inject Sig into each exported .xlsx, same as
   a single Export. The batch routes through a fake FSA handle -> window.saveAs -> _resizeTableColumns
   (which injects Sig via __cxInjectSigIntoWorkbook). Builds a table, enables Sig, batch-exports one
   banner, captures the file, and asserts the sub-header carries the "(A)" sig column letters. */
import { existsSync, mkdtempSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
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
const ctx = await browser.newContext({ viewport: { width: 1365, height: 768 }, acceptDownloads: true })
const page = await ctx.newPage()
await page.route('**/supabase/**', r => r.fulfill({ status: 404, contentType: 'application/json', body: '{}' })) // hermetic: no production cloud settings
const outDir = mkdtempSync(join(tmpdir(), 'cxsig-'))
const savedFiles = []
page.on('download', async d => {
  const p = join(outDir, d.suggestedFilename())
  try { await d.saveAs(p); savedFiles.push(p) } catch (_) {}
})

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
  await clickRe(page, /Load SPSS File/)
  const ch = await cp; await ch.setFiles(fixturePath)
  await page.waitForFunction(() => document.body.innerText.includes('Edit 500+Booster.sav') || document.body.innerText.includes('1,415 cases'), null, { timeout: 90000 })

  await clickExact(page, 'Top'); await addVar(page, 'area_group')
  await clickExact(page, 'Side'); await addVar(page, 'q021')
  await page.waitForTimeout(500)
  await page.evaluate(() => {
    var b = Array.from(document.querySelectorAll('button')).find(x => { var t = x.innerText.trim(); return t === 'Run Table' || t === 'Run All' || /^Run\b/.test(t) })
    if (!b) throw new Error('no Run button')
    var k = Object.keys(b).find(i => i.startsWith('__reactProps'))
    if (b[k] && b[k].onClick) b[k].onClick({ preventDefault(){}, stopPropagation(){}, target: b, currentTarget: b }); else b.click()
  })
  await page.waitForFunction(() => document.querySelectorAll('table').length > 0, null, { timeout: 60000 })

  // Enable Sig + letters, then save & batch-export a banner
  const ids = await page.evaluate(async () => {
    window.__cxSaveSigSettings({ enabled: true, level: 95, sigLetters: 'ABCDEF', minBase: 0 })
    await window.__cxBannerSaveCurrentForTest('SigBatch')
    return window.__cxGetBannerTemplates().map(b => b.id)
  })
  if (!ids.length) throw new Error('no banner saved')

  const err = await page.evaluate(async idList => {
    try { await window.__cxBannerExportSelectedForTest(idList); return null } catch (e) { return String(e && e.message || e) }
  }, ids)
  if (err) throw new Error('exportSelected rejected: ' + err)
  await page.waitForTimeout(2500)

  if (!savedFiles.length) throw new Error('no file downloaded from batch export')

  // Parse the exported xlsx and look for the sig column letters "(A)" in the sub-header
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(savedFiles[0])
  let hasSigLetters = false
  wb.eachSheet(ws => {
    for (let r = 1; r <= Math.min(ws.rowCount, 12); r++) {
      for (let c = 1; c <= Math.min(ws.columnCount || 30, 30); c++) {
        const v = ws.getCell(r, c).value
        const txt = v && v.richText ? v.richText.map(t => t.text).join('') : String(v == null ? '' : v)
        if (/\((A|B|C)\)/.test(txt)) hasSigLetters = true
      }
    }
  })
  if (!hasSigLetters) throw new Error('Sig letters NOT found in batch-exported xlsx: ' + savedFiles[0])
  console.log(JSON.stringify({ ok: true, url, file: savedFiles[0], hasSigLetters }, null, 2))
} finally {
  await browser.close()
}
