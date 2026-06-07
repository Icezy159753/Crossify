import { describe, expect, it } from 'vitest'
import { buildNetLabel, getNetPrefix, stripNetPrefix } from './netLabels'

describe('getNetPrefix', () => {
  it('formats root and nested Net prefixes', () => {
    expect(getNetPrefix(-1)).toBe('Net : ')
    expect(getNetPrefix(0)).toBe('Net : ')
    expect(getNetPrefix(1)).toBe('Subnet : ')
    expect(getNetPrefix(2)).toBe('SubSubnet : ')
    expect(getNetPrefix(3)).toBe('SubSubSubnet : ')
  })
})

describe('stripNetPrefix', () => {
  it('removes existing Net prefixes case-insensitively', () => {
    expect(stripNetPrefix('Net : Agree')).toBe('Agree')
    expect(stripNetPrefix('Subnet : Nested')).toBe('Nested')
    expect(stripNetPrefix('subsubnet: Deep')).toBe('Deep')
  })
})

describe('buildNetLabel', () => {
  it('normalizes names without duplicating Net prefixes', () => {
    expect(buildNetLabel(0, 'Agree')).toBe('Net : Agree')
    expect(buildNetLabel(0, 'Net : Agree')).toBe('Net : Agree')
    expect(buildNetLabel(1, 'Subnet : Nested')).toBe('Subnet : Nested')
    expect(buildNetLabel(2, '')).toBe('SubSubnet : Net')
  })
})
