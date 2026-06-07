import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const outPath = path.join(root, 'assets', 'crossify.ico')
const size = 256
const rgba = new Uint8ClampedArray(size * size * 4)

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) return
  const index = (y * size + x) * 4
  rgba[index] = color[0]
  rgba[index + 1] = color[1]
  rgba[index + 2] = color[2]
  rgba[index + 3] = color[3]
}

function blendPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) return
  const index = (y * size + x) * 4
  const a = color[3] / 255
  const inv = 1 - a
  rgba[index] = Math.round(color[0] * a + rgba[index] * inv)
  rgba[index + 1] = Math.round(color[1] * a + rgba[index + 1] * inv)
  rgba[index + 2] = Math.round(color[2] * a + rgba[index + 2] * inv)
  rgba[index + 3] = Math.min(255, Math.round(color[3] + rgba[index + 3] * inv))
}

function roundedRect(x, y, w, h, r, color) {
  for (let py = y; py < y + h; py += 1) {
    for (let px = x; px < x + w; px += 1) {
      const dx = px < x + r ? x + r - px : px >= x + w - r ? px - (x + w - r - 1) : 0
      const dy = py < y + r ? y + r - py : py >= y + h - r ? py - (y + h - r - 1) : 0
      if (dx * dx + dy * dy <= r * r) setPixel(px, py, color)
    }
  }
}

function circle(cx, cy, radius, color) {
  const r2 = radius * radius
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const dx = x - cx
      const dy = y - cy
      if (dx * dx + dy * dy <= r2) blendPixel(x, y, color)
    }
  }
}

function ring(cx, cy, radius, width, color) {
  const outer = radius * radius
  const inner = (radius - width) * (radius - width)
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const dx = x - cx
      const dy = y - cy
      const d2 = dx * dx + dy * dy
      if (d2 <= outer && d2 >= inner) blendPixel(x, y, color)
    }
  }
}

function textLikeBar(x, y, w, h, color) {
  roundedRect(x, y, w, h, Math.floor(h / 2), color)
}

roundedRect(8, 8, 240, 240, 56, [247, 251, 255, 255])
ring(128, 128, 90, 14, [215, 233, 255, 255])
ring(128, 128, 72, 14, [47, 111, 228, 255])
circle(128, 128, 54, [255, 255, 255, 255])
ring(128, 128, 54, 10, [31, 78, 120, 255])
textLikeBar(82, 106, 92, 18, [47, 111, 228, 255])
textLikeBar(82, 134, 92, 18, [31, 78, 120, 255])

const pixelBytes = Buffer.alloc(size * size * 4)
let offset = 0
for (let y = size - 1; y >= 0; y -= 1) {
  for (let x = 0; x < size; x += 1) {
    const source = (y * size + x) * 4
    pixelBytes[offset] = rgba[source + 2]
    pixelBytes[offset + 1] = rgba[source + 1]
    pixelBytes[offset + 2] = rgba[source]
    pixelBytes[offset + 3] = rgba[source + 3]
    offset += 4
  }
}

const header = Buffer.alloc(40)
header.writeUInt32LE(40, 0)
header.writeInt32LE(size, 4)
header.writeInt32LE(size * 2, 8)
header.writeUInt16LE(1, 12)
header.writeUInt16LE(32, 14)
header.writeUInt32LE(0, 16)
header.writeUInt32LE(pixelBytes.length, 20)

const maskBytes = Buffer.alloc((size * size) / 8)
const image = Buffer.concat([header, pixelBytes, maskBytes])
const icon = Buffer.alloc(22)
icon.writeUInt16LE(0, 0)
icon.writeUInt16LE(1, 2)
icon.writeUInt16LE(1, 4)
icon[6] = 0
icon[7] = 0
icon[8] = 0
icon[9] = 0
icon.writeUInt16LE(1, 10)
icon.writeUInt16LE(32, 12)
icon.writeUInt32LE(image.length, 14)
icon.writeUInt32LE(icon.length, 18)

await fs.mkdir(path.dirname(outPath), { recursive: true })
await fs.writeFile(outPath, Buffer.concat([icon, image]))
console.log(JSON.stringify({ ok: true, outPath }))
