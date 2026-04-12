/**
 * Tests for timeFormatUtils — pure formatting functions.
 */
import { describe, expect, it } from 'vitest'
import { formatBatchDuration, formatLiveBatchDuration } from './timeFormatUtils'

// ─── formatBatchDuration ─────────────────────────────────────────────────────

describe('formatBatchDuration', () => {
  it('0 ms → "0 sec"', () => {
    expect(formatBatchDuration(0)).toBe('0 sec')
  })

  it('negative ms → "0 sec" (clamped to 0)', () => {
    expect(formatBatchDuration(-500)).toBe('0 sec')
  })

  it('< 1 min: rounds ms to nearest second', () => {
    expect(formatBatchDuration(1000)).toBe('1 sec')
    expect(formatBatchDuration(1499)).toBe('1 sec')   // rounds down
    expect(formatBatchDuration(1500)).toBe('2 sec')   // rounds up
    expect(formatBatchDuration(59000)).toBe('59 sec')
  })

  it('exactly 1 min → "1 min 0 sec"', () => {
    expect(formatBatchDuration(60000)).toBe('1 min 0 sec')
  })

  it('1 min 30 sec', () => {
    expect(formatBatchDuration(90000)).toBe('1 min 30 sec')
  })

  it('2 min 5 sec', () => {
    expect(formatBatchDuration(125000)).toBe('2 min 5 sec')
  })

  it('rounds partial seconds correctly in multi-minute range', () => {
    // 61.4 s → rounds to 61 → 1 min 1 sec
    expect(formatBatchDuration(61400)).toBe('1 min 1 sec')
    // 61.5 s → rounds to 62 → 1 min 2 sec
    expect(formatBatchDuration(61500)).toBe('1 min 2 sec')
  })
})

// ─── formatLiveBatchDuration ──────────────────────────────────────────────────

describe('formatLiveBatchDuration', () => {
  it('0 ms → "0 sec"', () => {
    expect(formatLiveBatchDuration(0)).toBe('0 sec')
  })

  it('negative ms → "0 sec" (clamped)', () => {
    expect(formatLiveBatchDuration(-9999)).toBe('0 sec')
  })

  it('snaps to nearest 5 seconds (floor)', () => {
    expect(formatLiveBatchDuration(4999)).toBe('0 sec')  // < 5s
    expect(formatLiveBatchDuration(5000)).toBe('5 sec')
    expect(formatLiveBatchDuration(9999)).toBe('5 sec')  // < 10s
    expect(formatLiveBatchDuration(10000)).toBe('10 sec')
    expect(formatLiveBatchDuration(14999)).toBe('10 sec')
    expect(formatLiveBatchDuration(55000)).toBe('55 sec')
  })

  it('exactly 1 min (60 s) → "1 min" (no seconds shown when 0)', () => {
    expect(formatLiveBatchDuration(60000)).toBe('1 min')
  })

  it('1 min 5 sec', () => {
    expect(formatLiveBatchDuration(65000)).toBe('1 min 5 sec')
  })

  it('2 min exactly → "2 min"', () => {
    expect(formatLiveBatchDuration(120000)).toBe('2 min')
  })

  it('2 min 30 sec', () => {
    expect(formatLiveBatchDuration(150000)).toBe('2 min 30 sec')
  })

  it('snaps down — 64 s → 60 s → "1 min"', () => {
    expect(formatLiveBatchDuration(64999)).toBe('1 min')
  })
})
