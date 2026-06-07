import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()

const checks = [
  {
    file: 'index.html',
    disallowed: [
      { pattern: /\balert\s*\(/g, allow: line => line.includes('.alert(') || line.includes('function alert') },
      { pattern: /\bconfirm\s*\(/g, allow: line => line.includes('.confirm(') || line.includes('function confirm') },
    ],
  },
  {
    file: 'public/assets/index-DsrIxxwV.js',
    disallowed: [
      { pattern: /\bwindow\.alert\s*\(/g, allow: () => false },
      { pattern: /\bwindow\.confirm\s*\(/g, allow: () => false },
      { pattern: /\bconfirm\s*\(/g, allow: line => line.includes('.confirm(') || line.includes('confirmText') },
    ],
  },
]

const violations = []

for (const check of checks) {
  const abs = resolve(root, check.file)
  const text = readFileSync(abs, 'utf8')
  const lines = text.split(/\r?\n/)

  lines.forEach((line, index) => {
    for (const rule of check.disallowed) {
      rule.pattern.lastIndex = 0
      if (rule.pattern.test(line) && !rule.allow(line)) {
        violations.push(`${check.file}:${index + 1}: ${line.trim()}`)
      }
    }
  })
}

if (violations.length > 0) {
  console.error('Overlay runtime boundary check failed:')
  for (const item of violations) console.error(`- ${item}`)
  process.exit(1)
}

console.log(`Overlay runtime boundary check passed (${checks.length} files).`)
