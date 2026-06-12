import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseMtd, mapMtdToCrossify, mapTestColumns, mapMtdFilter, buildVarIndex } from './mtdImport'
import { parseSav } from './savParser'

const MTD = resolve(process.cwd(), 'Table_Compare.mtd')
const SAV = resolve(process.cwd(), 'J64172 Zaab WaveCom.sav')
const haveFiles = existsSync(MTD) && existsSync(SAV)

describe.skipIf(!haveFiles)('mtd import against real Reporter file', () => {
  it('parses all tables with axes, nets, filters and sig settings', async () => {
    const xml = readFileSync(MTD, 'utf8')
    const parsed = parseMtd(xml)
    expect(parsed.tables.length).toBe(247)

    const t1 = parsed.tables[0]
    expect(t1.name).toBe('Table1')
    expect(t1.description).toBe('Quota')
    expect(t1.side.length).toBeGreaterThan(0)
    expect(t1.top.length).toBeGreaterThan(0)
    // Table1 side includes S9_SES with a "Net AB" net of SES A + SES B
    const ses = t1.side.find(v => v.mdmName === 'S9_SES')
    expect(ses).toBeTruthy()
    const net = ses!.groups.find(g => g.name === 'Net AB')
    expect(net).toBeTruthy()
    expect(net!.memberLabels).toEqual(['SES A', 'SES B'])

    // some table carries a filter expression and sig test columns
    const withFilter = parsed.tables.find(t => t.filters.length > 0)
    expect(withFilter).toBeTruthy()
    const withSig = parsed.tables.find(t => t.testColumns)
    expect(withSig).toBeTruthy()
    expect(withSig!.sigMinBase).toBe(30)
    expect(withSig!.sigAlpha).toBe(5)
  }, 120000)

  it('maps to Crossify against the real SAV with high coverage', async () => {
    const xml = readFileSync(MTD, 'utf8')
    const buf = readFileSync(SAV)
    const ds = await parseSav(new File([buf], 'zaab.sav'))
    const parsed = parseMtd(xml)
    const mapped = mapMtdToCrossify(parsed, ds.variables)

    // unmappable tables (grid [..] funnels, MDM-only banner vars, future-wave vars) are
    // excluded and reported; everything else becomes a Crossify table with axes
    expect(mapped.tables.length + mapped.report.skippedTables.length).toBe(247)
    // the OLD wave-3 SAV is missing many newer-wave SIDE variables; tables whose whole
    // SIDE is unresolvable are skipped+reported (a no-side table can never produce rows)
    expect(mapped.tables.length).toBeGreaterThanOrEqual(180)
    expect(mapped.tables.every(t => !!t.rowVar)).toBe(true)
    expect(mapped.report.skippedTables.length).toBeLessThanOrEqual(67)
    expect(mapped.report.netsApplied).toBeGreaterThan(50)
    expect(mapped.report.filtersApplied).toBeGreaterThan(0)

    // nets map to real codes of S9_SES
    const sesGroups = mapped.overrides['S9_SES'] ?? mapped.overrides['s9_ses']
    expect(sesGroups).toBeTruthy()
    const netAB = sesGroups!.find(g => g.name === 'Net AB')
    expect(netAB).toBeTruthy()
    expect(netAB!.members.length).toBe(2)

    // sig settings extracted
    expect(mapped.sig).toBeTruthy()
    expect(mapped.sig!.enabled).toBe(true)
    expect(mapped.sig!.level).toBe(95)
    expect(mapped.sig!.minBase).toBe(30)
    expect(mapped.sig!.sigLetters).toContain(',')
  }, 300000)
})

describe('unit pieces', () => {
  it('mapTestColumns keeps disjoint banner blocks, drops overlapping cross-tests', () => {
    expect(mapTestColumns('A/B/C/D,E/F/G,A/E')).toBe('ABCD,EFG')
    expect(mapTestColumns('A/B,C/D,B/C')).toBe('AB,CD')
  })

  it('mapMtdFilter maps ContainsAny by label to codes', () => {
    const vars = [{ name: 'QUOTA', longName: 'QUOTA', valueLabels: { '1': 'Users of MSG', '2': 'Aware but non users of MSG' } }]
    const r = mapMtdFilter('QUOTA.ContainsAny({Aware_but_non_users_of_MSG})', vars, buildVarIndex(vars))
    expect(r.reason).toBeNull()
    const spec = r.spec as { groups: { conditions: { variableName: string; values: string[] }[] }[] }
    expect(spec.groups[0].conditions[0].variableName).toBe('QUOTA')
    expect(spec.groups[0].conditions[0].values).toEqual(['2'])
  })

  it('mapMtdFilter reports unsupported expressions instead of guessing', () => {
    const vars = [{ name: 'Q1', valueLabels: { '1': 'Yes' } }]
    const r = mapMtdFilter('Q1 > 3', vars, buildVarIndex(vars))
    expect(r.spec).toBeNull()
    expect(r.reason).toContain('unsupported')
  })
})
