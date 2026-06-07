import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(process.cwd())
const releaseDirs = [
  join(root, 'release-desktop-save-direct'),
  join(root, 'release-desktop-settings-v2'),
  join(root, 'release-desktop-settings-only'),
  join(root, 'release-desktop-fast'),
  join(root, 'release-desktop-current'),
  join(root, 'release-current'),
  join(root, 'release-app'),
  join(root, 'release-desktop'),
  join(root, 'release'),
]
const artifactName = 'Crossify-Desktop.exe'

function findExe(dir) {
  if (!existsSync(dir)) return null
  const entries = readdirSync(dir).sort()
  const directDesktopExe = entries.find(entry => /^Crossify-Desktop.*\.exe$/i.test(entry))
  if (directDesktopExe) return join(dir, directDesktopExe)

  for (const entry of entries) {
    if (entry === 'win-unpacked') continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      const nested = findExe(full)
      if (nested) return nested
      continue
    }
    if (/^Crossify-Desktop.*\.exe$/i.test(entry)) {
      return full
    }
  }
  return null
}

const source = releaseDirs.map(findExe).find(Boolean)
if (!source) {
  throw new Error(`Desktop EXE not found under ${releaseDirs.join(', ')}`)
}

for (const base of ['public', 'dist']) {
  const outDir = join(root, base, 'downloads')
  mkdirSync(outDir, { recursive: true })
  copyFileSync(source, join(outDir, artifactName))
}

console.log(JSON.stringify({
  ok: true,
  source,
  publicPath: 'public/downloads/' + artifactName,
  distPath: 'dist/downloads/' + artifactName,
}, null, 2))
