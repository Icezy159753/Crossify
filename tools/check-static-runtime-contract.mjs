import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()

function read(file) {
  return readFileSync(resolve(root, file), 'utf8')
}

const files = {
  index: read('index.html'),
  bundle: read('public/assets/index-DsrIxxwV.js'),
  runtimeBridge: read('src/runtime-compat/runtimeBridge.ts'),
  appRuntimeBridges: read('src/runtime-compat/appRuntimeBridges.ts'),
  netInjector: read('src/lib/netGroupInjector.ts'),
  app: read('src/App.tsx'),
}

const requiredMarkers = [
  {
    name: 'Runtime facade exists in source and static runtime',
    pairs: [
      ['src/runtime-compat/runtimeBridge.ts', files.runtimeBridge, 'export interface CrossifyRuntime'],
      ['index.html', files.index, 'window.__crossifyRuntime'],
      ['index.html', files.index, 'notifyExportComplete: cxNotifyExportComplete'],
      ['index.html', files.index, 'confirm: function'],
    ],
  },
  {
    name: 'Static validation dialogs use the runtime alert boundary',
    pairs: [
      ['index.html', files.index, 'window.cxRuntimeAlert'],
      ['index.html', files.index, "cxRuntimeAlert('กรุณาโหลดไฟล์ SPSS ก่อน')"],
      ['index.html', files.index, "cxRuntimeAlert('ใส่ชื่อตัวแปร')"],
    ],
  },
  {
    name: 'Net injection remains wired across source and static runtime',
    pairs: [
      ['src/lib/netGroupInjector.ts', files.netInjector, '__cxInjectNetGroups'],
      ['index.html', files.index, 'function cxNetDisplayLabel'],
      ['index.html', files.index, 'window.__cxInjectNetGroups = cxInjectNetGroups'],
      ['index.html', files.index, 'Net : '],
    ],
  },
  {
    name: 'Filtered cases bridge remains wired from React hook to static augmenters',
    pairs: [
      ['src/runtime-compat/appRuntimeBridges.ts', files.appRuntimeBridges, '__cxGetFilteredCases'],
      ['src/App.tsx', files.app, 'useFilteredCasesBridge({ dataset, variableCatalog, tables })'],
      ['index.html', files.index, 'window.__cxGetFilteredCases'],
    ],
  },
  {
    name: 'Fast refresh-to-home behavior remains patched into the static bundle',
    pairs: [
      ['public/assets/index-DsrIxxwV.js', files.bundle, 'Workspace snapshot persistence disabled'],
    ],
  },
]

const missing = []

for (const check of requiredMarkers) {
  for (const [file, text, marker] of check.pairs) {
    if (!text.includes(marker)) {
      missing.push(`${check.name}: ${file}: ${marker}`)
    }
  }
}

if (missing.length > 0) {
  console.error('Static runtime contract check failed:')
  for (const item of missing) console.error(`- ${item}`)
  process.exit(1)
}

console.log(`Static runtime contract check passed (${requiredMarkers.length} contract groups).`)
