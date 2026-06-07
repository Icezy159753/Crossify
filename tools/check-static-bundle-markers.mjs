import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()

const checks = [
  {
    file: 'src/lib/netLabels.ts',
    markers: ['Net : ', 'stripNetPrefix', 'buildNetLabel'],
  },
  {
    file: 'index.html',
    markers: ['function cxNetDisplayLabel', 'cxNetDisplayLabel(d, g.name)', 'Net : ', 'window.__crossifyRuntime', 'notifyExportComplete', 'confirm: function'],
  },
  {
    file: 'public/assets/index-DsrIxxwV.js',
    markers: [
      'Net : ',
      'requestIdleCallback',
      'Workspace snapshot persistence disabled',
    ],
  },
]

const missing = []

for (const check of checks) {
  const abs = resolve(root, check.file)
  const text = readFileSync(abs, 'utf8')
  for (const marker of check.markers) {
    if (!text.includes(marker)) {
      missing.push(`${check.file}: ${marker}`)
    }
  }
}

if (missing.length > 0) {
  console.error('Static bundle marker check failed:')
  for (const item of missing) console.error(`- ${item}`)
  process.exit(1)
}

console.log(`Static bundle marker check passed (${checks.length} files).`)
