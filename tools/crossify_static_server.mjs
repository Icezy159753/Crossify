import { createReadStream, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const PUBLIC = join(ROOT, 'public')
const PORT = 5173

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

function inside(base, file) {
  const relative = normalize(file).toLowerCase()
  return relative.startsWith(normalize(base).toLowerCase())
}

function fileForUrl(url) {
  const parsed = new URL(url, `http://127.0.0.1:${PORT}`)
  const path = decodeURIComponent(parsed.pathname)
  if (path === '/') return join(ROOT, 'index.html')
  if (path.startsWith('/assets/')) return join(PUBLIC, path.slice(1))
  return join(ROOT, path.slice(1))
}

createServer((req, res) => {
  try {
    const file = resolve(fileForUrl(req.url || '/'))
    if (!inside(ROOT, file) && !inside(PUBLIC, file)) {
      res.writeHead(403).end('Forbidden')
      return
    }
    const st = statSync(file)
    if (!st.isFile()) {
      res.writeHead(404).end('Not found')
      return
    }
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': st.size,
      'Cache-Control': 'no-store',
    })
    createReadStream(file).pipe(res)
  } catch {
    res.writeHead(404).end('Not found')
  }
}).listen(PORT, '127.0.0.1')
