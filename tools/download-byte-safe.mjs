import fs from 'node:fs/promises'
import path from 'node:path'
import http from 'node:http'
import https from 'node:https'

function getClient(url) {
  return url.protocol === 'https:' ? https : http
}

async function download(url, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const client = getClient(url)
    client.get(url, (response) => {
      const status = response.statusCode ?? 0

      if (status >= 300 && status < 400 && response.headers.location) {
        if (redirectsLeft <= 0) {
          reject(new Error(`Too many redirects for ${url.href}`))
          return
        }

        const nextUrl = new URL(response.headers.location, url)
        resolve(download(nextUrl, redirectsLeft - 1))
        return
      }

      if (status < 200 || status >= 300) {
        reject(new Error(`Request failed for ${url.href}: HTTP ${status}`))
        return
      }

      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks)))
    }).on('error', reject)
  })
}

async function main() {
  const [urlArg, outArg] = process.argv.slice(2)

  if (!urlArg || !outArg) {
    console.error('Usage: node tools/download-byte-safe.mjs <url> <output-file>')
    process.exitCode = 1
    return
  }

  const url = new URL(urlArg)
  const outputFile = path.resolve(outArg)
  const buffer = await download(url)

  await fs.mkdir(path.dirname(outputFile), { recursive: true })
  await fs.writeFile(outputFile, buffer)

  console.log(`Saved ${outputFile} (${buffer.length} bytes)`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
