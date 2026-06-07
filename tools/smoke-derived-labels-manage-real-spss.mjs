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
      if (props?.onClick) props.onClick({ preventDefault() {}, stopPropagation() {}, target: button, currentTarget: button })
      else button.click()
    },
    { source: predicateSource, buttonLabel: label },
  )
}

async function invokeReactExactButton(page, text, occurrence = 0) {
  await page.evaluate(
    ({ buttonText, buttonOccurrence }) => {
      const button = Array.from(document.querySelectorAll('button'))
        .filter(item => item.innerText.trim() === buttonText)[buttonOccurrence]
      if (!button) throw new Error(`Button not found: ${buttonText} (${buttonOccurrence})`)
      const key = Object.keys(button).find(item => item.startsWith('__reactProps'))
      const props = key ? button[key] : null
      if (props?.onClick) props.onClick({ preventDefault() {}, stopPropagation() {}, target: button, currentTarget: button })
      else button.click()
    },
    { buttonText: text, buttonOccurrence: occurrence },
  )
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

async function closeOutputOptionsIfOpen(page) {
  const isOpen = await page.evaluate(() => document.body.innerText.includes('OUTPUT OPTIONS'))
  if (!isOpen) return
  await invokeReactExactButton(page, 'Output Options').catch(() => null)
  await page.waitForTimeout(200)
}

async function invokeVariableAddButton(page, variableName) {
  await page.evaluate(name => {
    const addButtons = Array.from(document.querySelectorAll('button')).filter(button => button.innerText.trim() === 'Add')
    const button = addButtons.find(item => item.parentElement?.parentElement?.innerText?.includes(name))
    if (!button) throw new Error(`Variable Add button not found: ${name}`)
    button.click()
  }, variableName)
}

async function setActiveTableAxes(page, { rowVar, colVar }) {
  await page.evaluate(
    axes => {
      const hook = window.__cxResolveLiveTablesHook?.()
      if (!hook?.queue?.dispatch) throw new Error('Tables hook not available')
      hook.queue.dispatch(prev => {
        if (!Array.isArray(prev) || prev.length === 0) throw new Error('No tables available')
        return prev.map(table => ({ ...table, rowVar: axes.rowVar, colVar: axes.colVar, result: null }))
      })
    },
    { rowVar, colVar },
  )
  await page.waitForTimeout(250)
}

async function runAxesAndReadResult(page, { rowVar, colVar }) {
  await page.keyboard.press('Escape').catch(() => null)
  await closeOutputOptionsIfOpen(page)
  await page.waitForTimeout(100)
  await invokeReactExactButton(page, 'Design')
  await setActiveTableAxes(page, { rowVar, colVar })
  await invokeReactExactButton(page, 'Run Table')
  try {
    await page.waitForFunction(
      () => Boolean(document.querySelector('table')) && document.body.innerText.includes('Table1 ·') && document.querySelector('table')?.innerText.includes('Base'),
      null,
      { timeout: 60_000 },
    )
  } catch (error) {
    const state = await page.evaluate(() => {
      const tables = window.__cxResolveLiveTablesHook?.()?.memoizedState || []
      const tableState = tables.find(table => table?.result) || tables[0]
      return {
        rowVar: tableState?.rowVar,
        colVar: tableState?.colVar,
        hasResult: Boolean(tableState?.result),
        resultKeys: tableState?.result ? Object.keys(tableState.result) : [],
        body: document.body.innerText.slice(0, 1000),
      }
    })
    throw new Error(`Run timed out for row=${rowVar} col=${colVar}: ${JSON.stringify(state)}`, { cause: error })
  }
  return page.evaluate(() => {
    const hook = window.__cxResolveLiveTablesHook?.()
    const tableState = (hook?.memoizedState || []).find(table => table?.result) || hook?.memoizedState?.[0]
    const result = tableState?.result
    const table = document.querySelector('table')
    const debug = (() => {
      try {
        const info = window.__cxDerivedColumnLabelGroups?.(window.__cxDataset, tableState?.colVar, window.__cxVariableOverrides || {})
        const groups = {}
        for (const key of Object.keys(info?.groups || {})) {
          groups[key] = {
            strictKeys: Object.keys(info.groups[key].strict || {}).slice(0, 12),
            codeKeys: Object.keys(info.groups[key].levelCodes || {}).slice(0, 12),
          }
        }
        return { colVar: tableState?.colVar, flat: info?.flat || [], groups }
      } catch (error) {
        return { error: error?.message || String(error) }
      }
    })()
    return {
      rowLabel: result?.rowLabel || '',
      colLabel: result?.colLabel || '',
      colValues: result?.colValues || [],
      colPaths: result?.colPaths || [],
      colTotalsN: result?.colTotalsN || [],
      rowSectionBases: result?.rowSectionBases || [],
      text: table?.innerText || '',
      debug,
    }
  })
}

function assertDerivedColumns(scenario, result, options = {}) {
  const bangkok = '\u0e01\u0e17\u0e21'
  const upcountry = '\u0e15\u0e08\u0e27'
  const derivedQuestionLabel = '\u0e20\u0e39\u0e21\u0e34\u0e20\u0e32\u0e04\u0e43\u0e2b\u0e21\u0e48'
  const payload = JSON.stringify({ rowLabel: result.rowLabel, colLabel: result.colLabel, colValues: result.colValues, colPaths: result.colPaths, rowSectionBases: result.rowSectionBases, text: result.text, debug: result.debug })
  if (/THREG_O[12]/.test(payload)) {
    throw new Error(`${scenario}: leaked derived member names ${payload.slice(0, 1200)}`)
  }
  if (!payload.includes(bangkok) || !payload.includes(upcountry)) {
    throw new Error(`${scenario}: missing derived labels ${payload.slice(0, 1200)}`)
  }
  if (options.expectTopTotals) {
    const totals = result.colTotalsN.map(value => Number(value || 0))
    if (totals[0] !== 565 || totals[1] !== 850) {
      throw new Error(`${scenario}: wrong TOP totals ${JSON.stringify({ colValues: result.colValues, colTotalsN: totals })}`)
    }
  }
  if (options.expectColumnQuestionLabel && !payload.includes(derivedQuestionLabel)) {
    throw new Error(`${scenario}: derived TOP question label was not preserved ${payload.slice(0, 1200)}`)
  }
  if (options.expectRowQuestionLabel && !payload.includes(derivedQuestionLabel)) {
    throw new Error(`${scenario}: derived SIDE question label was not preserved ${payload.slice(0, 1200)}`)
  }
  if (options.expectColumnQuestionLabel && /\+\s*\u0e01\u0e17\u0e21|\+\s*\u0e15\u0e08\u0e27/.test(String(result.colLabel || ''))) {
    throw new Error(`${scenario}: column title used a code label instead of the question label ${payload.slice(0, 1200)}`)
  }
}

async function createTwoCodeDerived(page) {
  return page.evaluate(async () => {
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
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

    window.__cxOpenDeriveModal(null, 'create')
    await wait(350)
    const addCode = Array.from(document.querySelectorAll('button')).find(button => button.innerText.trim() === '+ เพิ่ม Code')
    if (!addCode) throw new Error('Add code button not found')
    addCode.click()
    await wait(250)

    const nameInput = document.querySelector('#cx-dv-name')
    const labelInput = document.querySelector('#cx-dv-label')
    if (!nameInput) throw new Error('Name input not found')
    setInputValue(nameInput, 'THREG')
    if (labelInput) setInputValue(labelInput, 'ภูมิภาคใหม่')

    const visibleInputs = Array.from(document.querySelectorAll('input')).filter(
      input => input.offsetWidth || input.offsetHeight || input.getClientRects().length,
    )
    const codeInputs = visibleInputs.filter(input =>
      input !== nameInput
      && input !== labelInput
      && String(input.placeholder || '').trim() !== ''
      && /^(\d+)?$/.test(String(input.value || '').trim()),
    )
    const labelInputs = visibleInputs.filter(input =>
      input !== nameInput
      && input !== labelInput
      && String(input.placeholder || '').includes('Label')
    )
    const textareas = Array.from(document.querySelectorAll('textarea')).filter(
      textarea => textarea.offsetWidth || textarea.offsetHeight || textarea.getClientRects().length,
    )
    if (labelInputs.length < 2 || textareas.length < 2) {
      throw new Error(`Expected two output code rows, got labels=${labelInputs.length}, textareas=${textareas.length}`)
    }
    if (codeInputs[0]) setInputValue(codeInputs[0], '1')
    if (codeInputs[1]) setInputValue(codeInputs[1], '2')
    setInputValue(labelInputs[0], 'กทม')
    setInputValue(labelInputs[1], 'ตจว')
    setTextareaValue(textareas[0], 'AREA_GROUP=1')
    setTextareaValue(textareas[1], 'AREA_GROUP!=1')

    const saveButton = Array.from(document.querySelectorAll('button')).filter(
      button => button.offsetWidth || button.offsetHeight || button.getClientRects().length,
    ).find(button => /สร้างตัวแปร|บันทึกการแก้ไข/.test(button.innerText))
    if (!saveButton) throw new Error('Save derived button not found')
    saveButton.click()
    await wait(900)

    const ds = window.__cxDataset
    const group = ds.variables.find(v => v.name === 'THREG_O')
    const one = ds.variables.find(v => v.name === 'THREG_O1')
    const two = ds.variables.find(v => v.name === 'THREG_O2')
    window.__cxOpenDeriveModal('__manage__', 'manage')
    await wait(300)
    const manageText = document.body.innerText
    return {
      groupLabel: group?.label,
      groupLabels: group?.valueLabels,
      oneLabel: one?.label,
      twoLabel: two?.label,
      oneCount: ds.cases.reduce((count, row) => count + (row.THREG_O1 === 1 ? 1 : 0), 0),
      twoCount: ds.cases.reduce((count, row) => count + (row.THREG_O2 === 1 ? 1 : 0), 0),
      manageHasGroup: manageText.includes('THREG_O'),
      manageHasLabels: manageText.includes('กทม') && manageText.includes('ตจว'),
    }
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

  await invokeReactExactButton(page, 'Output Options')
  await page.waitForFunction(() => Boolean(document.querySelector('[data-cx-weight-picker] select')), null, { timeout: 10_000 })
  const weightPicker = await page.evaluate(() => {
    const select = document.querySelector('[data-cx-weight-picker] select')
    const ds = window.__cxDataset
    const options = Array.from(select?.querySelectorAll('option') || []).map(option => option.value).filter(Boolean)
    const invalid = options.filter(name => {
      const variable = ds.variables.find(item => item.name === name)
      if (!variable || variable.isString || Object.keys(variable.valueLabels || {}).length > 0) return true
      let checked = 0
      for (const row of ds.cases) {
        if (checked >= 250) break
        const raw = row[name] ?? row[variable.longName]
        if (raw == null || raw === '') continue
        checked += 1
        const n = Number(String(raw).replace(/,/g, '').trim())
        if (!Number.isFinite(n)) return true
      }
      return checked === 0
    })
    return { count: options.length, invalid: invalid.slice(0, 10) }
  })
  if (weightPicker.invalid.length > 0) {
    throw new Error(`Weight picker included non-numeric variables: ${JSON.stringify(weightPicker, null, 2)}`)
  }
  await page.keyboard.press('Escape').catch(() => null)
  await closeOutputOptionsIfOpen(page)

  const created = await createTwoCodeDerived(page)
  if (created.groupLabels?.['1'] !== 'กทม' || created.groupLabels?.['2'] !== 'ตจว'
    || created.oneLabel !== 'กทม' || created.twoLabel !== 'ตจว' || created.oneCount !== 565 || created.twoCount !== 850) {
    throw new Error(`Derived labels/counts wrong: ${JSON.stringify(created, null, 2)}`)
  }
  if (!created.manageHasGroup || !created.manageHasLabels) {
    throw new Error(`Manage tab did not show created variable: ${JSON.stringify(created, null, 2)}`)
  }

  await invokeReactExactButton(page, '×')
  const restoreProbe = await page.evaluate(async () => {
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
    const saved = window.__cxCollectDerivedDatasetState?.(window.__cxDataset)
    if (!saved?.variables?.length) throw new Error('No derived dataset state collected')
    const hook = window.__cxGetDatasetHook?.()
    const current = hook?.data || window.__cxDataset
    const derivedNames = new Set(saved.variables.flatMap(variable => [variable.name, ...(variable.memberNames || [])]))
    const stripped = {
      ...current,
      variables: current.variables.filter(variable => !derivedNames.has(variable.name)),
      cases: current.cases.map(row => {
        const next = { ...row }
        derivedNames.forEach(name => delete next[name])
        return next
      }),
    }
    hook?.dispatch?.(() => stripped)
    window.__cxDataset = stripped
    await wait(150)
    if (window.__cxDataset.variables.some(variable => variable.name === 'THREG_O')) {
      throw new Error('Derived variable was not stripped before restore')
    }
    const ok = window.__cxRestoreDerivedDatasetState?.({ derivedDataset: saved })
    await wait(300)
    const ds = window.__cxDataset
    return {
      ok,
      hasGroup: ds.variables.some(variable => variable.name === 'THREG_O'),
      oneCount: ds.cases.reduce((count, row) => count + (row.THREG_O1 === 1 ? 1 : 0), 0),
      twoCount: ds.cases.reduce((count, row) => count + (row.THREG_O2 === 1 ? 1 : 0), 0),
    }
  })
  if (!restoreProbe.ok || !restoreProbe.hasGroup || restoreProbe.oneCount !== 565 || restoreProbe.twoCount !== 850) {
    throw new Error(`Derived restore probe failed: ${JSON.stringify(restoreProbe, null, 2)}`)
  }

  await invokeReactExactButton(page, 'Top')
  await setVariableSearch(page, 'area_group')
  await invokeVariableAddButton(page, 'area_group')
  await invokeReactExactButton(page, 'Side')
  await setVariableSearch(page, 'THREG')
  await invokeVariableAddButton(page, 'THREG_O')
  await invokeReactExactButton(page, 'Run Table')
  await page.waitForFunction(() => document.body.innerText.includes('Row: THREG_O'), null, { timeout: 60_000 })
  const table = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr')).map(row => row.innerText.replace(/\s+/g, ' ').trim())
    return {
      hasBangkok: rows.some(row => row.includes('กทม') && row.includes('565')),
      hasUpcountry: rows.some(row => row.includes('ตจว') && row.includes('850')),
      rows: rows.slice(0, 20),
    }
  })
  if (!table.hasBangkok || !table.hasUpcountry) {
    throw new Error(`Table did not render derived code labels: ${JSON.stringify(table, null, 2)}`)
  }

  await invokeReactExactButton(page, 'Design')
  await invokeReactExactButton(page, 'Side')
  await setVariableSearch(page, 'q076j_1')
  await invokeVariableAddButton(page, 'q076j_1')
  await invokeReactExactButton(page, 'Run Table')
  await page.waitForFunction(() => document.body.innerText.includes('Row: THREG_O + q076j_1'), null, { timeout: 60_000 })
  const multiSide = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr')).map(row => row.innerText.replace(/\s+/g, ' ').trim())
    return {
      hasBangkokLabel: rows.some(row => row.includes('กทม') && row.includes('565')),
      hasUpcountryLabel: rows.some(row => row.includes('ตจว') && row.includes('850')),
      hasUnweightedBase: rows.some(row => row.includes('Unweighted Base')),
      leakedMemberNames: rows.some(row => /THREG_O[12]/.test(row)),
      rows: rows.slice(0, 30),
    }
  })
  if (!multiSide.hasBangkokLabel || !multiSide.hasUpcountryLabel || multiSide.leakedMemberNames || multiSide.hasUnweightedBase) {
    throw new Error(`Multi-side derived labels wrong: ${JSON.stringify(multiSide, null, 2)}`)
  }

  const topOnly = await runAxesAndReadResult(page, { rowVar: 'area_group', colVar: 'THREG_O' })
  assertDerivedColumns('derived TOP only', topOnly, { expectTopTotals: true, expectColumnQuestionLabel: true })

  const topAddMode = await runAxesAndReadResult(page, { rowVar: 'q076j_1', colVar: 'area_group ++ THREG_O' })
  assertDerivedColumns('derived TOP add-mode question label', topAddMode, { expectColumnQuestionLabel: true })
  const topAddText = String(topAddMode.text || '').replace(/\s+/g, ' ')
  if (topAddMode.colPaths.length) {
    if (!topAddMode.colPaths.some(path => path[0] === '\u0e20\u0e39\u0e21\u0e34\u0e20\u0e32\u0e04\u0e43\u0e2b\u0e21\u0e48' && path[1] === '\u0e01\u0e17\u0e21')) {
      throw new Error(`derived TOP add-mode: Bangkok code label is not under the question label ${JSON.stringify(topAddMode.colPaths).slice(0, 1200)}`)
    }
    if (!topAddMode.colPaths.some(path => path[0] === '\u0e20\u0e39\u0e21\u0e34\u0e20\u0e32\u0e04\u0e43\u0e2b\u0e21\u0e48' && path[1] === '\u0e15\u0e08\u0e27')) {
      throw new Error(`derived TOP add-mode: Upcountry code label is not under the question label ${JSON.stringify(topAddMode.colPaths).slice(0, 1200)}`)
    }
  } else if (!topAddText.includes('\u0e20\u0e39\u0e21\u0e34\u0e20\u0e32\u0e04\u0e43\u0e2b\u0e21\u0e48') || !topAddText.includes('\u0e01\u0e17\u0e21') || !topAddText.includes('\u0e15\u0e08\u0e27')) {
    throw new Error(`derived TOP add-mode: rendered header text is incomplete ${topAddText.slice(0, 1200)}`)
  }
  if (/area_group\).*?\+\s*(\u0e01\u0e17\u0e21|\u0e15\u0e08\u0e27)/.test(topAddText)) {
    throw new Error(`derived TOP add-mode: rendered title used a code label instead of the question label ${topAddText.slice(0, 1200)}`)
  }

  const topNestedInner = await runAxesAndReadResult(page, { rowVar: 'q076j_1', colVar: 'area_group || THREG_O' })
  assertDerivedColumns('derived TOP nested inner', topNestedInner, { expectColumnQuestionLabel: true })

  const topNestedOuter = await runAxesAndReadResult(page, { rowVar: 'q076j_1', colVar: 'THREG_O || area_group' })
  assertDerivedColumns('derived TOP nested outer', topNestedOuter, { expectColumnQuestionLabel: true })

  const topThreeLevelNest = await runAxesAndReadResult(page, { rowVar: 'q076j_1', colVar: 'area_group ++ q000 || THREG_O' })
  assertDerivedColumns('derived TOP nested after multiple variables', topThreeLevelNest, { expectColumnQuestionLabel: true })

  const rowAddMode = await runAxesAndReadResult(page, { rowVar: 'THREG_O ++ area_group ++ q076j_1', colVar: 'area_group' })
  assertDerivedColumns('derived SIDE add-mode question label', rowAddMode, { expectRowQuestionLabel: true })

  const weightName = await page.evaluate(() => {
    const ds = window.__cxDataset
    const cases = Array.isArray(ds?.cases) ? ds.cases : []
    return (Array.isArray(ds?.variables) ? ds.variables : []).find(variable => {
      if (!variable?.name || variable.isString || (variable.valueLabels && Object.keys(variable.valueLabels).length)) return false
      let checked = 0
      for (const row of cases.slice(0, 250)) {
        const raw = row?.[variable.name] ?? row?.[variable.longName]
        if (raw == null || raw === '') continue
        checked += 1
        if (!Number.isFinite(Number(String(raw).replace(/,/g, '').trim()))) return false
      }
      return checked > 0
    })?.name || ''
  })
  if (!weightName) throw new Error('No numeric weight variable was available in the fixture')
  await page.evaluate(name => {
    localStorage.setItem('__cx_weight_var__', name)
    window.__cxWeightVar = name
  }, weightName)
  const weightedDerivedSide = await runAxesAndReadResult(page, { rowVar: 'THREG_O ++ area_group', colVar: 'area_group' })
  if (!weightedDerivedSide.text.includes('Unweighted Base')) {
    throw new Error(`Weighted derived SIDE table did not render Unweighted Base. Weight=${weightName}. Text: ${weightedDerivedSide.text.slice(0, 1200)}`)
  }

  const actionableMessages = messages.filter(message => !message.includes('net::ERR_NETWORK_ACCESS_DENIED'))
  if (actionableMessages.length > 0) throw new Error(`Console errors: ${actionableMessages.join(' | ')}`)

  console.log(JSON.stringify({ ok: true, url, fixturePath, created, table, topOnly, weightName }, null, 2))
} finally {
  await browser.close()
}
