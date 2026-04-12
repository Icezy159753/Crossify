import { describe, expect, it } from 'vitest'
import { injectNetGroups, type NetGroupOverride } from './netGroupInjector'
import type { CrosstabResult } from './crosstabEngine'

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeResult(
  rowValues: string[],
  counts: number[][],
  opts: {
    rowPaths?: string[][]
    rowTypes?: ('data' | 'net' | 'stat' | 'summary')[]
    colValues?: string[]
  } = {},
): CrosstabResult {
  const colValues = opts.colValues ?? ['Total']
  return {
    rowVar: 'R', colVar: 'C',
    rowLabel: 'Row', colLabel: 'Col',
    rowValues,
    colValues,
    rowTypes: opts.rowTypes ?? rowValues.map(() => 'data'),
    rowPaths: opts.rowPaths ?? rowValues.map(v => [v]),
    counts,
    rowTotalsN: counts.map(row => row.reduce((s, n) => s + n, 0)),
    colTotalsN: colValues.map((_, ci) =>
      counts.reduce((s, row) => s + (row[ci] ?? 0), 0),
    ),
    grandTotal: counts.flat().reduce((s, n) => s + n, 0),
  }
}

const ov = (groups: NetGroupOverride['groups'], labels?: Record<string, string>): Record<string, NetGroupOverride> => ({
  s1: { groups, labels },
})

// ─── no-op cases ─────────────────────────────────────────────────────────────

describe('injectNetGroups › no-op', () => {
  const result = makeResult(['Bangkok', 'Chiang Mai'], [[10], [20]])

  it('returns original when overrides is null', () => {
    expect(injectNetGroups(result, 's1', null)).toBe(result)
  })

  it('returns original when overrides has no groups', () => {
    expect(injectNetGroups(result, 's1', { s1: { groups: [] } })).toBe(result)
  })

  it('returns original when vn not in overrides', () => {
    expect(injectNetGroups(result, 's2', ov([{ name: 'Net', members: ['1'] }]))).toBe(result)
  })

  it('returns original when no members resolve', () => {
    // member code '99' doesn't exist in rowValues
    expect(injectNetGroups(result, 's1', ov([{ name: 'Net', members: ['99'] }]))).toBe(result)
  })
})

// ─── basic injection ──────────────────────────────────────────────────────────

describe('injectNetGroups › basic injection', () => {
  /**
   * rowValues: ['Bangkok', 'Samut Prakan', 'Chiang Mai']
   * counts (1 col):  [100, 50, 30]
   * Net = Bangkok + Samut Prakan (members by label, codes '1','2')
   * Expected Net inserted before Bangkok (insertBefore=0)
   */
  const result = makeResult(
    ['Bangkok', 'Samut Prakan', 'Chiang Mai'],
    [[100], [50], [30]],
  )
  const overrides = ov(
    [{ name: 'Net', members: ['1', '2'] }],
    { '1': 'Bangkok', '2': 'Samut Prakan' },
  )
  const out = injectNetGroups(result, 's1', overrides)

  it('inserts a Net row', () => {
    expect(out.rowValues).toContain('   Net')
  })

  it('Net row comes before first member', () => {
    const netIdx = out.rowValues.indexOf('   Net')
    const bangkokIdx = out.rowValues.indexOf('Bangkok')
    expect(netIdx).toBeLessThan(bangkokIdx)
  })

  it('Net row has type "net"', () => {
    const netIdx = out.rowValues.indexOf('   Net')
    expect(out.rowTypes?.[netIdx]).toBe('net')
  })

  it('Net counts = sum of members', () => {
    const netIdx = out.rowValues.indexOf('   Net')
    expect(out.counts[netIdx][0]).toBe(150)  // 100 + 50
  })

  it('Net rowTotalsN = sum of members', () => {
    const netIdx = out.rowValues.indexOf('   Net')
    expect(out.rowTotalsN[netIdx]).toBe(150)
  })

  it('does not mutate the original', () => {
    expect(result.rowValues).toHaveLength(3)
  })

  it('total rows = original + 1 Net', () => {
    expect(out.rowValues).toHaveLength(4)
  })
})

// ─── member match by direct label (no SPSS code) ────────────────────────────

describe('injectNetGroups › direct label match', () => {
  /**
   * members listed as the actual label string (no code→label lookup needed)
   */
  const result = makeResult(['Yes', 'No', 'DK'], [[60], [30], [10]])
  const overrides = ov([{ name: 'Agree', members: ['Yes'] }])
  const out = injectNetGroups(result, 's1', overrides)

  it('finds member by exact label string', () => {
    const netIdx = out.rowValues.findIndex(v => v.trim() === 'Agree')
    expect(netIdx).toBeGreaterThanOrEqual(0)
    expect(out.counts[netIdx][0]).toBe(60)
  })
})

// ─── rowPath depth — single-var (depth 1) ────────────────────────────────────

describe('injectNetGroups › rowPath depth (single-var)', () => {
  /**
   * rowPaths all have depth 1 → Net rowPath should also be depth 1.
   */
  const result = makeResult(
    ['Bangkok', 'Chiang Mai'],
    [[80], [20]],
    { rowPaths: [['Bangkok'], ['Chiang Mai']] },
  )
  const overrides = ov([{ name: 'Net', members: ['Bangkok'] }])
  const out = injectNetGroups(result, 's1', overrides)

  it('Net rowPath depth = 1 when data rows are depth 1', () => {
    const netIdx = out.rowValues.findIndex(v => v.trim() === 'Net')
    expect(out.rowPaths?.[netIdx]).toHaveLength(1)
  })

  it('Net rowPath[0] = Net label', () => {
    const netIdx = out.rowValues.findIndex(v => v.trim() === 'Net')
    expect(out.rowPaths?.[netIdx][0]).toBe(out.rowValues[netIdx])
  })
})

// ─── rowPath depth — stacked multi-var (depth 2) ─────────────────────────────

describe('injectNetGroups › rowPath depth (stacked multi-var)', () => {
  /**
   * Simulates a section from a stacked multi-var table.
   * rowPaths have depth 2: ["S1.Province", "Bangkok"], etc.
   * Net rowPath must also be depth 2: ["S1.Province", "   Net"]
   * so the UI renders the label cell in the correct column.
   */
  const result = makeResult(
    [' S1.Province / Bangkok', ' S1.Province / Samut Prakan', ' S1.Province / Chiang Mai'],
    [[100], [50], [30]],
    {
      rowPaths: [
        ['S1.Province', 'Bangkok'],
        ['S1.Province', 'Samut Prakan'],
        ['S1.Province', 'Chiang Mai'],
      ],
    },
  )
  // Members by SPSS code — matched via suffix " / Bangkok" in rowValue
  const overrides = ov(
    [{ name: 'Net', members: ['1', '2'] }],
    { '1': 'Bangkok', '2': 'Samut Prakan' },
  )
  const out = injectNetGroups(result, 's1', overrides)

  it('Net row is injected', () => {
    const netIdx = out.rowValues.findIndex(v => v.trim() === 'Net')
    expect(netIdx).toBeGreaterThanOrEqual(0)
  })

  it('Net rowPath has same depth as data rows (depth 2)', () => {
    const netIdx = out.rowValues.findIndex(v => v.trim() === 'Net')
    expect(out.rowPaths?.[netIdx]).toHaveLength(2)
  })

  it('Net rowPath prefix matches section variable name', () => {
    const netIdx = out.rowValues.findIndex(v => v.trim() === 'Net')
    expect(out.rowPaths?.[netIdx][0]).toBe('S1.Province')
  })

  it('Net rowPath last element = Net label', () => {
    const netIdx = out.rowValues.findIndex(v => v.trim() === 'Net')
    const netPath = out.rowPaths?.[netIdx]
    expect(netPath?.[netPath.length - 1]).toBe(out.rowValues[netIdx])
  })

  it('Net counts correct (suffix-matched members)', () => {
    const netIdx = out.rowValues.findIndex(v => v.trim() === 'Net')
    expect(out.counts[netIdx][0]).toBe(150)  // 100 + 50
  })
})

// ─── suffix match " VarName / Label" ─────────────────────────────────────────

describe('injectNetGroups › suffix match for stacked rowValues', () => {
  /**
   * rowValues from the compiled bundle have format " VarName / Label".
   * memberToIdx must strip the prefix and match on "Label" alone.
   */
  const result = makeResult(
    [' S1.Province / Yes', ' S1.Province / No', ' S1.Province / DK'],
    [[60], [30], [10]],
    {
      rowPaths: [
        ['S1.Province', 'Yes'],
        ['S1.Province', 'No'],
        ['S1.Province', 'DK'],
      ],
    },
  )
  const overrides = ov(
    [{ name: 'Net', members: ['1', '2'] }],
    { '1': 'Yes', '2': 'No' },
  )
  const out = injectNetGroups(result, 's1', overrides)

  it('resolves code via label → suffix match', () => {
    const netIdx = out.rowValues.findIndex(v => v.trim() === 'Net')
    expect(netIdx).toBeGreaterThanOrEqual(0)
    expect(out.counts[netIdx][0]).toBe(90)   // Yes(60) + No(30)
  })
})

// ─── multiple columns ─────────────────────────────────────────────────────────

describe('injectNetGroups › multi-column result', () => {
  /**
   * 3 rows × 3 cols. Net = rows 0+1.
   */
  const result = makeResult(
    ['A', 'B', 'C'],
    [
      [10, 20, 30],   // A
      [40, 50, 60],   // B
      [70, 80, 90],   // C
    ],
    { colValues: ['X', 'Y', 'Z'] },
  )
  const overrides = ov([{ name: 'Net', members: ['A', 'B'] }])
  const out = injectNetGroups(result, 's1', overrides)

  it('Net counts span all columns', () => {
    const netIdx = out.rowValues.findIndex(v => v.trim() === 'Net')
    expect(out.counts[netIdx]).toEqual([50, 70, 90])  // A+B per col
  })
})

// ─── case-insensitive vn lookup ───────────────────────────────────────────────

describe('injectNetGroups › case-insensitive vn', () => {
  const result = makeResult(['Yes', 'No'], [[60], [40]])
  const overrides: Record<string, NetGroupOverride> = {
    S1: { groups: [{ name: 'Net', members: ['Yes'] }] },
  }

  it('finds override when vn casing differs from key', () => {
    const out = injectNetGroups(result, 's1', overrides)
    const netIdx = out.rowValues.findIndex(v => v.trim() === 'Net')
    expect(netIdx).toBeGreaterThanOrEqual(0)
    expect(out.counts[netIdx][0]).toBe(60)
  })
})

// ─── append Net at end (insertBefore >= rowValues.length) ────────────────────

describe('injectNetGroups › append Net at end', () => {
  /**
   * All members match rows 0 and 1 — Net insertBefore=0, so it goes first.
   * But if members are the last rows, Net goes before first member which is at 0.
   * Test a scenario where member is the last row: member='C' (idx 2)
   * → Net insertBefore=2 (before 'C', middle of list).
   */
  const result = makeResult(['A', 'B', 'C'], [[10], [20], [30]])
  const overrides = ov([{ name: 'Net', members: ['C'] }])
  const out = injectNetGroups(result, 's1', overrides)

  it('inserts before the only member', () => {
    const netIdx = out.rowValues.findIndex(v => v.trim() === 'Net')
    const cIdx = out.rowValues.indexOf('C')
    expect(netIdx).toBe(cIdx - 1)
  })
})
