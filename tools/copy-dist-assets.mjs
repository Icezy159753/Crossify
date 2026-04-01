/**
 * After `vite build`, merge dist/assets into public/assets (overwrite same names).
 * Keeps extra files in public/assets that are not emitted by the current build.
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'dist', 'assets')
const dest = join(root, 'public', 'assets')

if (!existsSync(src)) {
  console.warn('[copy-dist-assets] skip: dist/assets not found')
  process.exit(0)
}

mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })
console.log('[copy-dist-assets] dist/assets → public/assets')
