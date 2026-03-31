import { describe, expect, it } from 'vitest'
import { __encodingTestUtils, decodeBytes, resolveEncoding } from './savParser'

describe('savParser encoding helpers', () => {
  it('maps common East Asian SPSS code pages to browser decoder labels', () => {
    expect(resolveEncoding('CP932')).toBe('shift_jis')
    expect(resolveEncoding('windows-31j')).toBe('shift_jis')
    expect(resolveEncoding('GB18030')).toBe('gb18030')
    expect(resolveEncoding('CP936')).toBe('gbk')
    expect(resolveEncoding('Big5')).toBe('big5')
    expect(resolveEncoding('CP949')).toBe('euc-kr')
  })

  it('keeps legacy Thai fallback for unknown encodings', () => {
    expect(resolveEncoding('UNKNOWN-SPSS-ENC')).toBe('windows-874')
  })

  it('decodes safely even when the requested encoding label is unsupported', () => {
    expect(decodeBytes(new Uint8Array([0x41, 0x42, 0x43]), 'x-unknown')).toBe('ABC')
  })

  it('recognizes browser-supported encodings before using them', () => {
    expect(__encodingTestUtils.isSupportedEncoding('utf-8')).toBe(true)
    expect(__encodingTestUtils.isSupportedEncoding('x-unknown')).toBe(false)
  })
})
