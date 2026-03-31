/**
 * SPSS .sav binary parser — browser-compatible
 * Supports: bytecode-compressed & uncompressed, variable/value labels,
 *           long variable names (type-7/subtype-13), Thai Windows-874 encoding
 */

const PARSER_YIELD_EVERY = 20

// Use setTimeout(0) — yields control in ~1ms vs requestAnimationFrame's ~16ms
// This keeps the spinner smooth without large idle gaps
function yieldToBrowser() {
  return new Promise<void>(resolve => setTimeout(resolve, 0))
}

export interface SpssVariable {
  name: string
  longName: string
  label: string
  valueLabels: Record<string, string>
  isString: boolean
  stringLength: number
  slotCount: number
  dictIndex: number
}

export interface SavDataset {
  variables: SpssVariable[]
  cases: Record<string, string | number>[]
  fileName: string
  fileSize: number
  encoding: string
  sourcePath?: string | null
}

interface RawLabelChunk {
  bytes: Uint8Array
  len: number
}

const SYSMIS_BYTES = new Uint8Array([0xFE, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF])
const SYSMIS_VALUE = new DataView(SYSMIS_BYTES.buffer).getFloat64(0, true)

function isSysMiss(v: number) {
  return v <= SYSMIS_VALUE + 1e200
}

// ── Encoding helpers ─────────────────────────────────────────────────────────

/** Map SPSS encoding names → browser TextDecoder labels */
const ENC_MAP: Record<string, string> = {
  'UTF-8': 'utf-8', 'UTF8': 'utf-8',
  'UTF-16': 'utf-16le', 'UTF16': 'utf-16le', 'UTF-16LE': 'utf-16le',
  'WINDOWS-1250': 'windows-1250', 'WINDOWS_1250': 'windows-1250', '1250': 'windows-1250',
  'WINDOWS-1251': 'windows-1251', 'WINDOWS_1251': 'windows-1251', '1251': 'windows-1251',
  'WINDOWS-1252': 'windows-1252', 'WINDOWS_1252': 'windows-1252', '1252': 'windows-1252',
  'WINDOWS-1253': 'windows-1253', 'WINDOWS_1253': 'windows-1253', '1253': 'windows-1253',
  'WINDOWS-1254': 'windows-1254', 'WINDOWS_1254': 'windows-1254', '1254': 'windows-1254',
  'WINDOWS-1255': 'windows-1255', 'WINDOWS_1255': 'windows-1255', '1255': 'windows-1255',
  'WINDOWS-1256': 'windows-1256', 'WINDOWS_1256': 'windows-1256', '1256': 'windows-1256',
  'WINDOWS-1257': 'windows-1257', 'WINDOWS_1257': 'windows-1257', '1257': 'windows-1257',
  'WINDOWS-1258': 'windows-1258', 'WINDOWS_1258': 'windows-1258', '1258': 'windows-1258',
  'WINDOWS-874':  'windows-874',  'WINDOWS_874':  'windows-874',  '874': 'windows-874',
  'TIS-620': 'windows-874', 'TIS620': 'windows-874', 'ISO-8859-11': 'windows-874',
  'SHIFT-JIS': 'shift_jis', 'SHIFT_JIS': 'shift_jis', 'SHIFTJIS': 'shift_jis',
  'SJIS': 'shift_jis', 'MS_KANJI': 'shift_jis', 'WINDOWS-31J': 'shift_jis',
  'WINDOWS31J': 'shift_jis', 'CP932': 'shift_jis', 'MS932': 'shift_jis', '932': 'shift_jis',
  'GBK': 'gbk', 'CP936': 'gbk', 'MS936': 'gbk', '936': 'gbk',
  'GB2312': 'gbk', 'GB-2312': 'gbk', 'GB_2312': 'gbk',
  'GB18030': 'gb18030', 'GB-18030': 'gb18030', 'GB_18030': 'gb18030',
  'BIG5': 'big5', 'BIG-5': 'big5', 'BIG_5': 'big5', 'CP950': 'big5', 'MS950': 'big5', '950': 'big5',
  'EUC-KR': 'euc-kr', 'EUC_KR': 'euc-kr', 'EUCKR': 'euc-kr',
  'CP949': 'euc-kr', 'MS949': 'euc-kr', 'UHC': 'euc-kr', '949': 'euc-kr',
  'ISO-8859-1': 'windows-1252', 'ISO8859-1': 'windows-1252', 'LATIN1': 'windows-1252',
  'ISO-8859-15': 'windows-1252', 'ISO8859-15': 'windows-1252',
  'MACINTOSH': 'macintosh', 'MAC-ROMAN': 'macintosh', 'MACROMAN': 'macintosh',
}

const DEFAULT_ENCODING = 'windows-874'
const FALLBACK_ENCODINGS = [DEFAULT_ENCODING, 'utf-8', 'windows-1252'] as const
const supportedEncodingCache = new Map<string, boolean>()

function isSupportedEncoding(label: string): boolean {
  const normalized = label.trim().toLowerCase()
  if (!normalized) return false

  const cached = supportedEncodingCache.get(normalized)
  if (cached != null) return cached

  try {
    new TextDecoder(normalized)
    supportedEncodingCache.set(normalized, true)
    return true
  } catch {
    supportedEncodingCache.set(normalized, false)
    return false
  }
}

export function resolveEncoding(raw: string): string {
  const trimmed = raw.trim()
  const key = trimmed.toUpperCase().replace(/\s+/g, '')
  const mapped = ENC_MAP[key]
  if (mapped && isSupportedEncoding(mapped)) return mapped

  const directCandidates = [
    trimmed.toLowerCase(),
    trimmed.toLowerCase().replace(/_/g, '-'),
  ]
  for (const candidate of directCandidates) {
    if (candidate && isSupportedEncoding(candidate)) return candidate
  }

  if (/^\d+$/.test(key)) {
    const windowsCandidate = `windows-${key}`
    if (isSupportedEncoding(windowsCandidate)) return windowsCandidate
  }

  return DEFAULT_ENCODING
}

function decodeWithEncoding(bytes: Uint8Array, enc: string): string {
  return new TextDecoder(enc).decode(bytes).replace(/\0/g, '').trimEnd()
}

export function decodeBytes(bytes: Uint8Array, enc: string): string {
  const attempts = [enc, ...FALLBACK_ENCODINGS]
  const seen = new Set<string>()

  for (const candidate of attempts) {
    const normalized = candidate.trim().toLowerCase()
    if (!normalized || seen.has(normalized) || !isSupportedEncoding(normalized)) continue
    seen.add(normalized)

    try {
      return decodeWithEncoding(bytes, normalized)
    } catch {
      continue
    }
  }

  return String.fromCharCode(...bytes).replace(/\0/g, '').trimEnd()
}

function decodeBytesLen(bytes: Uint8Array, len: number, enc: string): string {
  return decodeBytes(bytes.subarray(0, Math.min(len, bytes.length)), enc)
}

export const __encodingTestUtils = {
  isSupportedEncoding,
}

// ── Binary reader ────────────────────────────────────────────────────────────

class Buf {
  v: DataView
  o = 0
  le = true
  enc = 'windows-874'

  constructor(ab: ArrayBuffer) { this.v = new DataView(ab) }

  i32() { const x = this.v.getInt32(this.o, this.le); this.o += 4; return x }
  u8()  { return this.v.getUint8(this.o++) }
  f64() { const x = this.v.getFloat64(this.o, this.le); this.o += 8; return x }
  /** Read uint64 le — returns JS number (safe up to 2^53, enough for file sizes) */
  u64() {
    const lo = this.v.getUint32(this.o, true)
    const hi = this.v.getUint32(this.o + 4, true)
    this.o += 8
    return hi * 0x100000000 + lo
  }

  rawBytes(n: number): Uint8Array {
    const slice = new Uint8Array(this.v.buffer, this.o, n)
    this.o += n
    return new Uint8Array(slice)  // copy
  }

  /** Read n bytes as ASCII string (for headers/names — always ASCII in SAV) */
  ascii(n: number): string {
    const b = this.rawBytes(n)
    let s = ''
    for (const c of b) if (c !== 0) s += String.fromCharCode(c)
    return s.trimEnd()
  }

  /** Read n bytes decoded with current encoding */
  str(n: number): string {
    return decodeBytes(this.rawBytes(n), this.enc)
  }

  skip(n: number) { this.o += n }
  peek32() { return this.v.getInt32(this.o, this.le) }
  get left() { return this.v.byteLength - this.o }
}

function alignUp4(n: number) { return Math.ceil(n / 4) * 4 }

function collapseVeryLongStringSegments(vars: SpssVariable[]) {
  const segmentIndexes = new Set<number>()

  for (let vi = 0; vi < vars.length; vi++) {
    if (segmentIndexes.has(vi)) continue

    const segs = (vars[vi] as SpssVariable & { _veryLongSegments?: number })._veryLongSegments
    if (!segs || segs <= 1) continue

    let found = 0
    for (let j = vi + 1; j < vars.length && found < segs - 1; j++) {
      if (segmentIndexes.has(j)) continue
      vars[vi].slotCount += vars[j].slotCount
      segmentIndexes.add(j)
      found += 1
    }
  }

  if (segmentIndexes.size === 0) return vars
  return vars.filter((_, index) => !segmentIndexes.has(index))
}

// ── ZLIB decompressor (SPSS 21+ compression=2) ───────────────────────────────

/**
 * After the dictionary, SPSS compression=2 stores cases as ZLIB-compressed
 * bytecode blocks. Structure (all int64 LE):
 *   Header (24 bytes): [zlib_data_offset] [uncompressed_total] [compressed_total]
 *   Directory:  N × 16 bytes: [uncompressed_block_size] [compressed_block_size]
 *     where N = (zlib_data_offset − currentPos) / 16
 *   Data: N blocks of compressed_block_size bytes each (zlib/deflate format)
 *
 * Returns a new Buf over the fully decompressed bytecode data.
 */
async function decompressZlibSection(
  r: Buf,
  onProgress?: (phase: 'variables' | 'cases', pct: number) => void,
): Promise<Buf> {
  const zlibDataOffset  = r.u64()   // absolute file offset of first block
  const uncompressedTotal = r.u64() // total bytes after decompression
  r.u64()                           // compressed total — not needed

  // Directory spans from current position to zlibDataOffset
  const numBlocks = Math.floor((zlibDataOffset - r.o) / 16)
  const blockSizes: Array<{ unc: number; cmp: number }> = []
  for (let i = 0; i < numBlocks; i++) {
    const unc = r.u64()
    const cmp = r.u64()
    blockSizes.push({ unc, cmp })
  }

  // Seek to first block (may already be there; r.o should equal zlibDataOffset now)
  r.o = zlibDataOffset

  // Pre-allocate output
  const out = new Uint8Array(uncompressedTotal)
  let outPos = 0

  for (let i = 0; i < blockSizes.length; i++) {
    const { cmp } = blockSizes[i]
    const compressedChunk = r.rawBytes(cmp)

    // Decompress using browser DecompressionStream (zlib-wrapped deflate)
    const ds = new DecompressionStream('deflate')
    const writer = ds.writable.getWriter()
    const reader = ds.readable.getReader()

    writer.write(compressedChunk)
    writer.close()

    let chunk: ReadableStreamReadResult<Uint8Array>
    while (!(chunk = await reader.read()).done) {
      out.set(chunk.value, outPos)
      outPos += chunk.value.length
    }

    if ((i + 1) % 20 === 0 || i === blockSizes.length - 1) {
      onProgress?.('cases', (i + 1) / blockSizes.length * 0.3)  // 0–30% for decompression phase
      await yieldToBrowser()
    }
  }

  return new Buf(out.buffer.slice(0, outPos))
}

// ── Parser ────────────────────────────────────────────────────────────────────

export async function parseSav(
  file: File,
  onProgress?: (phase: 'variables' | 'cases', pct: number) => void,
): Promise<SavDataset> {
  const fileWithPath = file as File & { path?: string; webkitRelativePath?: string }
  const sourcePath =
    typeof fileWithPath.path === 'string' && fileWithPath.path.trim()
      ? fileWithPath.path.trim()
      : typeof fileWithPath.webkitRelativePath === 'string' && fileWithPath.webkitRelativePath.trim()
        ? fileWithPath.webkitRelativePath.trim()
        : null
  const ab = await file.arrayBuffer()
  const r = new Buf(ab)

  // ── File header ────────────────────────────────────────────────────
  const magic = r.ascii(4)
  if (!magic.startsWith('$FL')) throw new Error(`ไม่ใช่ไฟล์ SPSS .sav (magic="${magic}")`)

  r.skip(60)                       // product name
  const layout = r.i32()
  r.le = layout !== 3

  const nomCaseSize = r.i32()
  const compression = r.i32()
  r.skip(4)                        // weight index
  const nCasesHeader = r.i32()
  const bias = r.f64()

  r.skip(9 + 8 + 64 + 3)          // date, time, file label, padding

  // compression=2 (ZLIB/zsav) handled after dictionary by decompressZlibSection()

  // ── Dictionary ─────────────────────────────────────────────────────
  const vars: SpssVariable[] = []
  const slotToVar = new Map<number, SpssVariable>()
  const variableLabelBytes = new Map<string, RawLabelChunk>()
  const variableValueLabelBytes = new Map<string, Record<string, RawLabelChunk>>()
  let slotIdx = 0
  let pendingVL: Record<string, string> = {}
  let pendingVLRaw: Record<string, RawLabelChunk> = {}
  let fileEncoding = 'windows-874'  // default for Thai files

  let dictRecordCount = 0
  loop: while (true) {
    const rt = r.i32()
    dictRecordCount++
    if (dictRecordCount % 500 === 0) {
      onProgress?.('variables', -1)  // indeterminate
      await yieldToBrowser()
    }

    switch (rt) {
      case 999:
        r.skip(4)
        break loop

      case 2: {
        // Variable record
        // IMPORTANT: Every variable record (including continuations) = exactly ONE slot.
        // Do NOT pre-register extra slots from the main string record —
        // let continuation records (vtype=-1) handle the extra slots.
        // Pre-registering causes slot index drift → wrong value label assignments.
        const vtype  = r.i32()
        const hasLbl = r.i32()
        const nMiss  = r.i32()
        r.skip(8)                                  // print + write
        const shortName = r.ascii(8)               // names always ASCII

        let label = ''
        if (hasLbl) {
          const ll = r.i32()
          const labelBytes = r.rawBytes(ll)
          r.skip(alignUp4(ll) - ll)
          label = decodeBytes(labelBytes, fileEncoding)
          variableLabelBytes.set(shortName, { bytes: labelBytes, len: ll })
        }
        r.skip(Math.abs(nMiss) * 8)

        slotIdx++  // every record advances slot by exactly 1

        if (vtype === -1) {
          // String continuation slot — extend previous variable
          const prev = vars[vars.length - 1]
          if (prev) { prev.slotCount++; slotToVar.set(slotIdx, prev) }
        } else {
          // Main variable record (numeric or string start)
          // slotCount starts at 1; incremented by subsequent continuation records
          const sv: SpssVariable = {
            name: shortName, longName: shortName, label,
            valueLabels: {}, isString: vtype > 0,
            stringLength: vtype, slotCount: 1, dictIndex: slotIdx,
          }
          vars.push(sv)
          slotToVar.set(slotIdx, sv)
          // ← No slotIdx += slots-1 here; continuations will advance slotIdx themselves
        }
        break
      }

      case 3: {
        // Value label record
        const cnt = r.i32()
        pendingVL = {}
        pendingVLRaw = {}
        for (let i = 0; i < cnt; i++) {
          const valBytes = r.rawBytes(8)
          const numVal = new DataView(valBytes.buffer, valBytes.byteOffset).getFloat64(0, r.le)
          const ll = r.u8()
          const blockLen = Math.ceil((ll + 1) / 8) * 8
          const labelBytes = r.rawBytes(blockLen - 1)
          const labelStr = decodeBytesLen(labelBytes, ll, fileEncoding)
          const key = String(Math.round(numVal * 1e8) / 1e8)
          pendingVL[key] = labelStr
          pendingVLRaw[key] = { bytes: labelBytes, len: ll }
        }
        break
      }

      case 4: {
        // Value label variable record
        const cnt = r.i32()
        for (let i = 0; i < cnt; i++) {
          const vi = r.i32()
          const v = slotToVar.get(vi)
          if (v) {
            Object.assign(v.valueLabels, pendingVL)
            const existing = variableValueLabelBytes.get(v.name) ?? {}
            Object.assign(existing, pendingVLRaw)
            variableValueLabelBytes.set(v.name, existing)
          }
        }
        pendingVL = {}
        pendingVLRaw = {}
        break
      }

      case 6: {
        const n = r.i32(); r.skip(n * 80)
        break
      }

      case 7: {
        const subtype = r.i32()
        const size    = r.i32()
        const cnt     = r.i32()
        const total   = size * cnt

        if (subtype === 13) {
          // Long variable names: "SHORT=longname\tSHORT2=longname2\0"
          const raw = r.str(total)
          for (const pair of raw.split('\t')) {
            const eq = pair.indexOf('=')
            if (eq >= 0) {
              const s = pair.slice(0, eq).trimEnd()
              const l = pair.slice(eq + 1).replace(/\0/g, '').trimEnd()
              const v = vars.find(x => x.name === s)
              if (v) v.longName = l
            }
          }
        } else if (subtype === 14) {
          // Very long strings: "SHORT=NNNNN\0SHORT2=NNNNN\0..."
          // Each entry tells us the TOTAL byte length of a very long string variable.
          // SPSS splits these into 252-byte segments stored as separate dictionary entries.
          // We record these so we can remove the phantom segment variables later.
          const raw = r.str(total)
          for (const pair of raw.replace(/\0/g, '\t').split('\t')) {
            const eq = pair.indexOf('=')
            if (eq < 0) continue
            const s = pair.slice(0, eq).trimEnd()
            const len = Number(pair.slice(eq + 1).trim())
            if (!s || !Number.isFinite(len) || len <= 0) continue
            const v = vars.find(x => x.name === s)
            if (v) {
              v.stringLength = len
              // Mark how many 252-byte segments this variable occupies
              ;(v as any)._veryLongSegments = Math.ceil(len / 252)
            }
          }
        } else if (subtype === 20) {
          // Character encoding name
          const encBytes = r.rawBytes(total)
          const encRaw = new TextDecoder('ascii').decode(encBytes).replace(/\0/g, '').trim()
          fileEncoding = resolveEncoding(encRaw)
          r.enc = fileEncoding
          // Re-decode labels already parsed with wrong encoding
          // (they were read before subtype 20 in some files — re-read not possible,
          //  but in practice subtype 20 comes before variable records in most SPSS versions)
        } else if (subtype === 11) {
          // Document with code page number (fallback)
          if (size === 4 && cnt >= 1) {
            const cpNumber = r.i32()
            r.skip(total - 4)
            const cpStr = String(cpNumber)
            fileEncoding = resolveEncoding(cpStr)
            r.enc = fileEncoding
          } else {
            r.skip(total)
          }
        } else {
          r.skip(total)
        }
        break
      }

      default:
        console.warn('Unknown SAV record type', rt, 'at offset', r.o)
        break loop
    }
  }

  // ── Remove very long string segment variables ──────────────────────
  // SPSS splits strings > 255 bytes into 252-byte segments, each stored
  // as a separate dictionary variable. Subtype-14 told us which variables
  // are very long strings and how many segments they span. We now remove
  // the phantom segment variables (all segments after the first).
  const collapsedVars = collapseVeryLongStringSegments(vars)
  vars.length = 0
  vars.push(...collapsedVars)

  for (const variable of vars) {
    const labelChunk = variableLabelBytes.get(variable.name)
    if (labelChunk) {
      variable.label = decodeBytesLen(labelChunk.bytes, labelChunk.len, fileEncoding)
    }

    const rawValueLabels = variableValueLabelBytes.get(variable.name)
    if (rawValueLabels) {
      variable.valueLabels = Object.fromEntries(
        Object.entries(rawValueLabels).map(([code, chunk]) => [
          code,
          decodeBytesLen(chunk.bytes, chunk.len, fileEncoding),
        ])
      )
    }
  }

  // ── Build ordered slot list ─────────────────────────────────────────
  const slotVars: SpssVariable[] = []
  for (const v of vars) {
    for (let s = 0; s < v.slotCount; s++) slotVars.push(v)
  }
  const slotsPerCase = nomCaseSize > 0 ? nomCaseSize : slotVars.length
  const maxCases = nCasesHeader > 0 ? nCasesHeader : Infinity

  // ── Build varByName map for O(1) lookup ──────────────────────────────
  const varByName = new Map<string, SpssVariable>()
  for (const v of vars) varByName.set(v.name, v)

  // ── Set up read buffer (rb) — decompressed for ZLIB, raw for others ──
  // compression=2: outer ZLIB wraps inner bytecode → decompress first, then
  //   parse the resulting buffer as if it were compression=1 bytecode.
  let rb = r
  if (compression === 2) {
    rb = await decompressZlibSection(r, onProgress)
    rb.le = r.le
    rb.enc = fileEncoding
  }

  // ── Read cases ──────────────────────────────────────────────────────
  const cases: Record<string, string | number>[] = []

  if (compression === 0) {
    while (rb.left >= slotsPerCase * 8 && cases.length < maxCases) {
      const row: Record<string, string | number> = {}
      const strBufs: Record<string, Uint8Array[]> = {}

      for (let s = 0; s < slotsPerCase; s++) {
        const v = slotVars[s]
        if (!v) { rb.skip(8); continue }
        if (v.isString) {
          if (!strBufs[v.name]) strBufs[v.name] = []
          strBufs[v.name].push(rb.rawBytes(8))
        } else {
          const val = rb.f64()
          if (!(v.name in row)) row[v.name] = isSysMiss(val) ? '' : val
        }
      }
      for (const [name, chunks] of Object.entries(strBufs)) {
        const combined = mergeChunks(chunks)
        const vDef = varByName.get(name)
        row[name] = decodeBytesLen(combined, vDef?.stringLength ?? combined.length, fileEncoding)
      }
      cases.push(row)

      if (cases.length % PARSER_YIELD_EVERY === 0) {
        onProgress?.('cases', maxCases === Infinity ? -1 : cases.length / maxCases)
        await yieldToBrowser()
      }
    }

  } else {
    // ── Bytecode compressed (compression=1) or ZLIB-decompressed (compression=2) ─
    // Process each slot directly into the current row as we decode bytecodes.
    const SPACE8 = new Uint8Array(8).fill(0x20)  // reusable space fill
    let slotInCase = 0
    let currentRow: Record<string, string | number> = {}
    const strBufs: Record<string, Uint8Array[]> = {}
    let eof = false

    while (!eof && rb.left >= 8 && cases.length < maxCases) {
      const codes = rb.rawBytes(8)

      for (let ci = 0; ci < 8; ci++) {
        if (eof || cases.length >= maxCases) break
        const code = codes[ci]

        if (code === 252) { eof = true; break }

        const v = slotVars[slotInCase]

        if (v && v.isString) {
          // String slot — need raw 8 bytes
          let bytes: Uint8Array
          if (code === 253) {
            if (rb.left < 8) { eof = true; break }
            bytes = rb.rawBytes(8)
          } else if (code === 254) {
            bytes = SPACE8  // mergeChunks copies, so sharing is safe
          } else {
            const tbuf = new ArrayBuffer(8)
            if (code >= 1 && code <= 251) new DataView(tbuf).setFloat64(0, code - bias, rb.le)
            bytes = new Uint8Array(tbuf)
          }
          if (!strBufs[v.name]) strBufs[v.name] = []
          strBufs[v.name].push(bytes)

        } else if (v) {
          // Numeric slot — compute value directly
          if (!(v.name in currentRow)) {
            if (code === 255) {
              currentRow[v.name] = ''
            } else if (code === 253) {
              if (rb.left < 8) { eof = true; break }
              const bytes = rb.rawBytes(8)
              const val = new DataView(bytes.buffer, bytes.byteOffset).getFloat64(0, rb.le)
              currentRow[v.name] = isSysMiss(val) ? '' : val
            } else if (code >= 1 && code <= 251) {
              currentRow[v.name] = code - bias
            } else {
              // code 0 or 254 — treat as zero
              currentRow[v.name] = 0
            }
          }

        } else {
          // Unknown slot — consume data byte if code 253
          if (code === 253) {
            if (rb.left < 8) { eof = true; break }
            rb.skip(8)
          }
        }

        slotInCase++
        if (slotInCase >= slotsPerCase) {
          // Finalize case
          for (const [name, chunks] of Object.entries(strBufs)) {
            const combined = mergeChunks(chunks)
            const vDef = varByName.get(name)
            currentRow[name] = decodeBytesLen(combined, vDef?.stringLength ?? combined.length, fileEncoding)
          }
          cases.push(currentRow)

          // Reset for next case
          currentRow = {}
          for (const k in strBufs) delete strBufs[k]
          slotInCase = 0

          if (cases.length % PARSER_YIELD_EVERY === 0) {
            onProgress?.('cases', maxCases === Infinity ? -1 : cases.length / maxCases)
            await yieldToBrowser()
          }
        }
      }
    }
  }

  return {
    variables: vars,
    cases,
    fileName: file.name,
    fileSize: file.size,
    encoding: fileEncoding,
    sourcePath,
  }
}

function mergeChunks(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((a, b) => a + b.length, 0)
  const out = new Uint8Array(total)
  let pos = 0
  for (const c of chunks) { out.set(c, pos); pos += c.length }
  return out
}

/** Replace raw numeric codes with value labels */
export function applyValueLabels(
  cases: Record<string, string | number>[],
  variables: SpssVariable[]
): Record<string, string>[] {
  const labelMap = new Map<string, Record<string, string>>()
  for (const v of variables) {
    if (Object.keys(v.valueLabels).length > 0) labelMap.set(v.name, v.valueLabels)
  }

  // Map shortName → longName for variables whose names differ.
  // Allows case data to be accessed by either shortName or longName.
  const aliases = new Map<string, string>()
  for (const v of variables) {
    if (v.longName && v.longName !== v.name) aliases.set(v.name, v.longName)
  }

  return cases.map(c => {
    const row: Record<string, string> = {}
    for (const [k, val] of Object.entries(c)) {
      const lm = labelMap.get(k)
      if (lm && val !== '' && val != null) {
        const key = String(Math.round(Number(val) * 1e8) / 1e8)
        row[k] = lm[key] ?? String(val)
      } else {
        row[k] = val === '' || val == null ? '' : String(val)
      }
      // Add longName alias so lookup by longName also works
      const ln = aliases.get(k)
      if (ln && !(ln in row)) row[ln] = row[k]
    }
    return row
  })
}
