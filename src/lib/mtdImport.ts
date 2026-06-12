/**
 * Reporter (.mtd) table-document import — parser + Crossify mapper.
 *
 * A .mtd file (UNICOM Intelligence / SPSS Data Collection Reporter) is one large XML
 * document containing table definitions: Side/Top axes (variables with category, Net and
 * Combine elements), per-table filters, and significance-test settings. This module is
 * pure (no DOM, no browser APIs) so it can be unit-tested in Node against real files;
 * the runtime copy in index.html S6 mirrors this logic.
 */

export interface MtdGroup {
  /** Net / Combine display label */
  name: string
  /** member category labels (display text) */
  memberLabels: string[]
  /** member category element names (sanitized MDM names) */
  memberNames: string[]
}

export interface MtdAxisVar {
  mdmName: string
  label: string
  groups: MtdGroup[]
  /** category element names in display order (excludes base/net containers) */
  categories: { name: string; label: string }[]
}

export interface MtdTable {
  name: string
  description: string
  side: MtdAxisVar[]
  top: MtdAxisVar[]
  filters: { name: string; expression: string }[]
  testColumns?: string
  columnIds?: string
  sigMinBase?: number
  /** alpha in percent, e.g. 5 → 95% confidence */
  sigAlpha?: number
}

export interface MtdParseResult {
  tables: MtdTable[]
}

const ENT: Record<string, string> = { quot: '"', amp: '&', lt: '<', gt: '>', apos: "'" }
function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/g, (m, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : m
    }
    return ENT[body] ?? m
  })
}

interface Tag {
  name: string
  attrs: Record<string, string>
  selfClosed: boolean
  closing: boolean
  /** offset just after this tag */
  end: number
  /** offset of '<' */
  start: number
}

const TAG_RE = /<(\/?)([A-Za-z_][\w.]*)((?:\s+[\w.]+\s*=\s*"[^"]*")*)\s*(\/?)>/g
const ATTR_RE = /([\w.]+)\s*=\s*"([^"]*)"/g

function* iterateTags(xml: string): Generator<Tag> {
  TAG_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = TAG_RE.exec(xml))) {
    const attrs: Record<string, string> = {}
    if (m[3]) {
      ATTR_RE.lastIndex = 0
      let a: RegExpExecArray | null
      while ((a = ATTR_RE.exec(m[3]))) attrs[a[1]] = decodeEntities(a[2])
    }
    yield { name: m[2], attrs, selfClosed: m[4] === '/', closing: m[1] === '/', start: m.index, end: TAG_RE.lastIndex }
  }
}

/** Extract inner text of a <name>...</name> style element starting right after `from`. */
function innerText(xml: string, openEnd: number, closeTag: string): string {
  const close = xml.indexOf(closeTag, openEnd)
  if (close < 0) return ''
  const body = xml.slice(openEnd, close)
  const cd = body.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/)
  if (cd) return cd[1]
  return decodeEntities(body)
}

export function parseMtd(xml: string): MtdParseResult {
  const tables: MtdTable[] = []
  let table: MtdTable | null = null
  /** axis stack entries: 'Side' | 'Top' | other */
  let axisSide: 'side' | 'top' | null = null
  let axisDepth = 0
  let curVar: MtdAxisVar | null = null
  let curGroup: MtdGroup | null = null
  let inSubElements = false
  let inStatistics = false
  let inColProp = false
  let pendingPropName: string | null = null
  let skipDepth = 0 // depth counter for CellContents/unrelated big subtrees we skip cheaply

  for (const tag of iterateTags(xml)) {
    const n = tag.name

    if (skipDepth > 0) {
      if (!tag.closing && !tag.selfClosed) skipDepth++
      else if (tag.closing) skipDepth--
      continue
    }

    if (!tag.closing && n === 'Table' && tag.attrs.Name !== undefined) {
      table = {
        name: tag.attrs.Name || '',
        description: tag.attrs.Description || '',
        side: [], top: [], filters: [],
      }
      continue
    }
    if (tag.closing && n === 'Table') {
      if (table) tables.push(table)
      table = null
      axisSide = null; axisDepth = 0; curVar = null; curGroup = null
      continue
    }
    if (!table) continue

    if (n === 'Axis') {
      if (!tag.closing) {
        axisDepth++
        const nm = tag.attrs.Name || ''
        if (axisDepth === 1) {
          axisSide = nm === 'Side' ? 'side' : nm === 'Top' ? 'top' : null
        } else if (axisSide && tag.attrs.MdmName) {
          curVar = { mdmName: tag.attrs.MdmName, label: tag.attrs.Label || tag.attrs.MdmName, groups: [], categories: [] }
          table[axisSide].push(curVar)
        }
        if (tag.selfClosed) axisDepth--
      } else {
        axisDepth--
        if (axisDepth <= 1) curVar = null
        if (axisDepth === 0) axisSide = null
      }
      continue
    }

    if (n === 'Element') {
      if (!tag.closing && curVar) {
        const type = tag.attrs.Type || ''
        const label = tag.attrs.Label || tag.attrs.Name || ''
        const mdm = tag.attrs.MdmName || tag.attrs.Name || ''
        if (inSubElements && curGroup) {
          if (type === 'Category') {
            curGroup.memberLabels.push(label)
            curGroup.memberNames.push(mdm)
          }
        } else if (type === 'Net' || type === 'Combine') {
          curGroup = { name: label, memberLabels: [], memberNames: [] }
          curVar.groups.push(curGroup)
        } else if (type === 'Category') {
          curVar.categories.push({ name: mdm, label })
        }
      }
      continue
    }
    if (n === 'SubElements') { inSubElements = !tag.closing; if (tag.closing) curGroup = null; continue }

    if (n === 'Filter' && !tag.closing && tag.attrs.Expression) {
      table.filters.push({ name: tag.attrs.Name || '', expression: tag.attrs.Expression })
      continue
    }

    if (n === 'Statistics' && !tag.closing && !tag.selfClosed) {
      inStatistics = true
      if (tag.attrs.TestColumns) table.testColumns = tag.attrs.TestColumns
      if (tag.attrs.ColumnIDs) table.columnIds = tag.attrs.ColumnIDs
      continue
    }
    if (n === 'Statistics' && tag.closing) { inStatistics = false; inColProp = false; continue }
    if (inStatistics && n === 'Statistic') {
      inColProp = !tag.closing && tag.attrs.Name === 'ColumnProportions'
      continue
    }
    if (inColProp && n === 'name' && !tag.closing) {
      pendingPropName = innerText(xml, tag.end, '</name>')
      continue
    }
    if (inColProp && n === 'value' && !tag.closing) {
      const v = innerText(xml, tag.end, '</value>').trim()
      if (pendingPropName === 'MinBase') {
        const num = Number(v)
        if (Number.isFinite(num) && num > 0) table.sigMinBase = num
      } else if (pendingPropName === 'SigLevel') {
        const num = Number(v)
        if (Number.isFinite(num) && num > 0) table.sigAlpha = num
      }
      pendingPropName = null
      continue
    }

    /* Skip the big CDATA-heavy metadata subtrees cheaply */
    if (!tag.closing && !tag.selfClosed && (n === 'CellContents' || n === 'Scripts' || n === 'DataSources')) {
      skipDepth = 1
      continue
    }
  }

  return { tables }
}

/* ── Mapping to Crossify ──────────────────────────────────────────────── */

export interface CatalogVarLite {
  name: string
  longName?: string
  valueLabels?: Record<string, string>
}

export interface MappedGroup { id: string; name: string; members: string[] }

export interface MappedTable {
  description: string
  rowVar: string
  colVar: string
  filter: unknown | null
  filterSkipped: string | null
  skippedVars: string[]
}

export interface MtdMapResult {
  tables: MappedTable[]
  /** resolved var name → groups to merge into window.__cxVariableOverrides */
  overrides: Record<string, MappedGroup[]>
  sig: { enabled: boolean; level: number; sigLetters: string; minBase: number } | null
  report: {
    totalTables: number
    fullyMapped: number
    partiallyMapped: number
    netsApplied: number
    filtersApplied: number
    filtersSkipped: number
    varsMissing: string[]
    skippedTables: { name: string; description: string; reason: string }[]
  }
}

function norm(s: string): string {
  return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase()
}

/** Resolve an MDM variable name against the loaded SAV variables. */
export function resolveMtdVar(mdmName: string, vars: CatalogVarLite[], index?: Map<string, CatalogVarLite>): string | null {
  const byKey = index ?? buildVarIndex(vars)
  const tryName = (n: string): string | null => {
    const hit = byKey.get(norm(n))
    return hit ? (hit.longName && hit.longName !== hit.name ? hit.longName : hit.name) : null
  }
  const direct = tryName(mdmName)
  if (direct) return direct
  /* MA set: SAV stores members as NAME$1..$n — the catalog groups them under NAME */
  if (byKey.has(norm(mdmName + '$1'))) return mdmName
  /* Grid slice: Outer[{Inner}].Field → try Inner (e.g. NewGrid_C3[{C3#7}].Column → C3#7) */
  const grid = mdmName.match(/\[\{([^}]+)\}\]/)
  if (grid) {
    const inner = grid[1]
    const hit = tryName(inner)
    if (hit) return hit
    if (byKey.has(norm(inner + '$1'))) return inner
  }
  return null
}

export function buildVarIndex(vars: CatalogVarLite[]): Map<string, CatalogVarLite> {
  const m = new Map<string, CatalogVarLite>()
  for (const v of vars) {
    m.set(norm(v.name), v)
    if (v.longName) m.set(norm(v.longName), v)
  }
  return m
}

/** Map net member element names/labels → SAV category codes via valueLabels. */
function mapGroupMembers(g: MtdGroup, v: CatalogVarLite | undefined): string[] {
  if (!v || !v.valueLabels) return []
  const labelToCode = new Map<string, string>()
  for (const [code, label] of Object.entries(v.valueLabels)) {
    labelToCode.set(norm(label), code)
    /* sanitized MDM name: non-alnum → _ */
    labelToCode.set(norm(label).replace(/[^\p{L}\p{N}]+/gu, '_'), code)
  }
  const out: string[] = []
  for (let i = 0; i < g.memberLabels.length; i++) {
    const byLabel = labelToCode.get(norm(g.memberLabels[i]))
    const byName = labelToCode.get(norm(g.memberNames[i]))
    const code = byLabel ?? byName
    if (code && !out.includes(code)) out.push(code)
  }
  return out
}

/** Parse a Reporter filter expression into a Crossify filter spec (supported subset). */
export function mapMtdFilter(
  expression: string,
  vars: CatalogVarLite[],
  index: Map<string, CatalogVarLite>,
): { spec: unknown | null; reason: string | null } {
  /* Supported: VAR.ContainsAny({a, b}) joined by And — anything else is reported */
  const parts = expression.split(/\s+And\s+/i)
  const conditions: { id: string; variableName: string; operator: string; values: string[] }[] = []
  for (const part of parts) {
    const m = part.trim().match(/^([\w.#$฀-๿]+)\.Contains(?:Any|All)?\(\{([^}]*)\}\)$/i)
    if (!m) return { spec: null, reason: 'unsupported expression: ' + expression.slice(0, 120) }
    const varName = resolveMtdVar(m[1], vars, index)
    if (!varName) return { spec: null, reason: 'filter variable not found: ' + m[1] }
    const v = index.get(norm(varName)) ?? index.get(norm(m[1]))
    const labelToCode = new Map<string, string>()
    if (v?.valueLabels) {
      for (const [code, label] of Object.entries(v.valueLabels)) {
        labelToCode.set(norm(label), code)
        labelToCode.set(norm(label).replace(/[^\p{L}\p{N}]+/gu, '_'), code)
      }
    }
    const values: string[] = []
    for (const raw of m[2].split(',')) {
      const item = raw.trim()
      if (!item) continue
      const code = labelToCode.get(norm(item)) ?? labelToCode.get(norm(item).replace(/[^\p{L}\p{N}]+/gu, '_'))
      if (code) { if (!values.includes(code)) values.push(code) }
      else if (/^\d+$/.test(item)) { if (!values.includes(item)) values.push(item) }
      else return { spec: null, reason: 'filter category not found: ' + item + ' in ' + m[1] }
    }
    if (values.length === 0) return { spec: null, reason: 'filter has no resolvable categories: ' + expression.slice(0, 120) }
    conditions.push({ id: 'mtd-' + conditions.length, variableName: varName, operator: 'in', values, value: '', secondaryValue: '' })
  }
  if (conditions.length === 0) return { spec: null, reason: 'empty filter' }
  return {
    /* description is REQUIRED by the table-list renderer (filterSummary calls description.trim()) */
    spec: { description: expression.slice(0, 160), rootJoin: 'all', groups: [{ id: 'mtd-g0', join: 'all', conditions }] },
    reason: null,
  }
}

/** Build Crossify sig letters string from Reporter TestColumns/ColumnIDs.
 * TestColumns is comma-separated comparison sets like "A/B/C/D,E/F/G,A/E" — we keep the
 * leading DISJOINT sets (the banner blocks) and drop overlapping cross-comparisons. */
export function mapTestColumns(testColumns: string): string {
  const seen = new Set<string>()
  const groups: string[] = []
  for (const seg of testColumns.split(',')) {
    const letters = seg.split('/').map(x => x.trim()).filter(x => x.length === 1)
    if (letters.length === 0) continue
    if (letters.some(l => seen.has(l))) continue
    letters.forEach(l => seen.add(l))
    groups.push(letters.join(''))
  }
  return groups.join(',')
}

export function mapMtdToCrossify(parsed: MtdParseResult, vars: CatalogVarLite[]): MtdMapResult {
  const index = buildVarIndex(vars)
  const overrides: Record<string, MappedGroup[]> = {}
  const tables: MappedTable[] = []
  const varsMissing = new Set<string>()
  let netsApplied = 0
  let filtersApplied = 0
  let filtersSkipped = 0
  let fullyMapped = 0
  let partiallyMapped = 0
  const skippedTables: { name: string; description: string; reason: string }[] = []
  let sig: MtdMapResult['sig'] = null
  let groupSeq = 0

  for (const t of parsed.tables) {
    const skipped: string[] = []
    const resolveAxis = (axis: MtdAxisVar[]): string[] => {
      const out: string[] = []
      for (const av of axis) {
        const resolved = resolveMtdVar(av.mdmName, vars, index)
        if (!resolved) { skipped.push(av.mdmName); varsMissing.add(av.mdmName); continue }
        out.push(resolved)
        /* Nets / Combines → override groups (merged once per var; first table wins) */
        if (av.groups.length && !overrides[resolved]) {
          const v = index.get(norm(av.mdmName)) ?? index.get(norm(resolved))
          const mapped: MappedGroup[] = []
          for (const g of av.groups) {
            const members = mapGroupMembers(g, v)
            if (members.length) mapped.push({ id: 'mtdnet-' + (groupSeq++), name: g.name, members })
          }
          if (mapped.length) { overrides[resolved] = mapped; netsApplied += mapped.length }
        }
      }
      return out
    }

    const sideVars = resolveAxis(t.side)
    const topVars = resolveAxis(t.top)
    if (sideVars.length === 0 && topVars.length === 0) {
      /* nothing resolvable (grid [..] tables, MDM-only banner vars, future-wave vars) —
         don't create an empty table; surface it in the report instead */
      skippedTables.push({ name: t.name, description: t.description, reason: skipped.length ? 'variables not in SAV: ' + skipped.join(', ') : 'no mappable axis variables' })
      continue
    }

    let filter: unknown | null = null
    let filterSkipped: string | null = null
    if (t.filters.length) {
      const exprs = t.filters.map(f => f.expression).join(' And ')
      const res = mapMtdFilter(exprs, vars, index)
      if (res.spec) { filter = res.spec; filtersApplied++ }
      else { filterSkipped = res.reason; filtersSkipped++ }
    }

    if (skipped.length === 0 && !filterSkipped) fullyMapped++
    else partiallyMapped++

    tables.push({
      description: (t.description || t.name) + (filterSkipped ? ' [NO FILTER]' : ''),
      rowVar: sideVars.join(' || '),
      colVar: topVars.join(' || '),
      filter,
      filterSkipped,
      skippedVars: skipped,
    })

    if (!sig && t.testColumns) {
      const letters = mapTestColumns(t.testColumns)
      if (letters) {
        sig = {
          enabled: true,
          level: t.sigAlpha === 10 ? 90 : 95,
          sigLetters: letters,
          minBase: t.sigMinBase ?? 0,
        }
      }
    }
  }

  return {
    tables, overrides, sig,
    report: {
      totalTables: parsed.tables.length,
      fullyMapped, partiallyMapped, netsApplied, filtersApplied, filtersSkipped,
      varsMissing: [...varsMissing],
      skippedTables,
    },
  }
}
