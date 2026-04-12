import fs from 'node:fs/promises'
import path from 'node:path'

const rootDir = process.cwd()
const includeExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.css',
  '.html',
  '.svg',
  '.yml',
  '.yaml',
])

const includeRootFiles = new Set([
  '.editorconfig',
  '.gitattributes',
  'index.html',
  'package.json',
  'tailwind.config.js',
  'vite.config.ts',
  'eslint.config.js',
])

const excludedFiles = new Set([
  'app_bundle_chunk.txt',
  'current_vercel_index.css',
  'current_vercel_index.js',
  'ux_function.txt',
  'vercel_bundle.js',
  'vercel_live_index.css',
  'vercel_live_index.js',
  '__live_index_snapshot.html',  // dev snapshot — generated file, not source
])

const excludedDirs = new Set([
  '.claude',
  '.git',
  '.npm-cache',
  '.vercel',
  '.vscode',
  'assets',      // root-level compiled bundle directory
  'dist',
  'node_modules',
  'public',
])

const suspiciousChecks = [
  { name: 'replacement character', regex: /\uFFFD/ },
  {
    name: 'UTF-8 decoded as Windows-1252',
    regex: new RegExp('\\u00C3.|\\u00C2.|\\u00E0\\u00B8.|\\u00E0\\u00B9.', 'u'),
  },
]

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.relative(rootDir, fullPath)

    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name)) continue
      files.push(...await collectFiles(fullPath))
      continue
    }

    if (excludedFiles.has(relativePath)) continue

    if (includeRootFiles.has(relativePath) || includeExtensions.has(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }

  return files
}

async function main() {
  const files = await collectFiles(rootDir)
  const findings = []

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8')

    for (const check of suspiciousChecks) {
      if (check.regex.test(content)) {
        findings.push(`${path.relative(rootDir, file)}: ${check.name}`)
      }
    }
  }

  if (findings.length > 0) {
    console.error('Potential encoding problems found:')
    for (const finding of findings) console.error(`- ${finding}`)
    process.exitCode = 1
    return
  }

  console.log(`Encoding check passed for ${files.length} files.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
