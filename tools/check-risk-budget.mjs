import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const root = process.cwd()
const violations = []

const lineBudgets = [
  { file: 'src/App.tsx', maxLines: 2380 },
  // Raised to track the in-progress runtime features added to index.html
  // (Derive/Recode modal, banner templates, MA section, weight handling,
  // workspace snapshot). Long-term reduction path is the src/ migration.
  { file: 'index.html', maxLines: 14400 },
  // Raised for the 2026-06-09 render fixes patched directly into the bundle:
  // section-aware % (zh/de), nested cell-merge (cxComputeRowspans/cxRenderLabelCells),
  // and Sig export injection.
  { file: 'public/assets/index-DsrIxxwV.js', maxLines: 15700 },
]

function readProjectFile(file) {
  return readFileSync(resolve(root, file), 'utf8')
}

function lineCount(text) {
  return text.split(/\r?\n/).length
}

for (const budget of lineBudgets) {
  const text = readProjectFile(budget.file)
  const lines = lineCount(text)
  if (lines > budget.maxLines) {
    violations.push(`${budget.file}: ${lines} lines exceeds risk budget ${budget.maxLines}`)
  }
}

function listSourceFiles(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) return listSourceFiles(fullPath)
    if (!/\.(ts|tsx)$/.test(entry.name)) return []
    return [fullPath]
  })
}

const allowedEslintDisable = new Set(['src/App.tsx'])
const allowedWindowCxWriters = new Set([
  'src/App.tsx',
  'src/lib/excelExport.ts',
  'src/runtime-compat/appRuntimeBridges.ts',
  'src/runtime-compat/appRuntimeBridges.test.ts',
  'src/runtime-compat/runtimeBridge.ts',
  'src/runtime-compat/runtimeBridge.test.ts',
])

for (const fullPath of listSourceFiles(resolve(root, 'src'))) {
  const file = relative(root, fullPath).replace(/\\/g, '/')
  const text = readFileSync(fullPath, 'utf8')
  if (text.includes('@ts-nocheck')) {
    violations.push(`${file}: @ts-nocheck is not allowed`)
  }
  if (text.includes('eslint-disable') && !allowedEslintDisable.has(file)) {
    violations.push(`${file}: eslint-disable needs a local justification or a narrower rule`)
  }
  if (/__cx[A-Za-z0-9_]*\s*=/.test(text) && !allowedWindowCxWriters.has(file)) {
    violations.push(`${file}: direct __cx runtime writes must live behind a runtime bridge`)
  }
}

if (violations.length > 0) {
  console.error('Risk budget check failed:')
  for (const violation of violations) {
    console.error(`- ${violation}`)
  }
  process.exit(1)
}

console.log('Risk budget check passed.')
