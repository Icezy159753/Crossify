/**
 * Tests for dragTransfer — MIME-based drag-and-drop variable list parsing.
 *
 * parseFolderVarListJson is not exported, so all tests go through
 * parseFolderVarListDrag with a minimal DataTransfer mock.
 */
import { describe, expect, it } from 'vitest'
import { parseFolderVarListDrag, FOLDER_VAR_LIST_MIME, FOLDER_VAR_TEXT_PREFIX } from './dragTransfer'

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Minimal DataTransfer mock — stores key→value pairs. */
function makeDT(data: Partial<Record<string, string>>): { dataTransfer: DataTransfer } {
  return {
    dataTransfer: {
      getData: (type: string) => data[type] ?? '',
    } as unknown as DataTransfer,
  }
}

// ─── MIME type path ───────────────────────────────────────────────────────────

describe('parseFolderVarListDrag › MIME type', () => {
  it('returns variable names from valid MIME JSON array', () => {
    const ev = makeDT({ [FOLDER_VAR_LIST_MIME]: JSON.stringify(['Q1', 'Q2', 'Q3']) })
    expect(parseFolderVarListDrag(ev)).toEqual(['Q1', 'Q2', 'Q3'])
  })

  it('filters out non-string and empty-string entries', () => {
    const ev = makeDT({ [FOLDER_VAR_LIST_MIME]: JSON.stringify(['Q1', '', 42, null, 'Q2']) })
    expect(parseFolderVarListDrag(ev)).toEqual(['Q1', 'Q2'])
  })

  it('returns null when MIME array is empty after filtering', () => {
    const ev = makeDT({ [FOLDER_VAR_LIST_MIME]: JSON.stringify(['', '']) })
    expect(parseFolderVarListDrag(ev)).toBeNull()
  })

  it('returns null when MIME value is not a JSON array (object)', () => {
    const ev = makeDT({ [FOLDER_VAR_LIST_MIME]: JSON.stringify({ name: 'Q1' }) })
    expect(parseFolderVarListDrag(ev)).toBeNull()
  })

  it('returns null when MIME value is invalid JSON', () => {
    const ev = makeDT({ [FOLDER_VAR_LIST_MIME]: 'not-json' })
    expect(parseFolderVarListDrag(ev)).toBeNull()
  })

  it('prefers MIME over text/plain when both are present', () => {
    const ev = makeDT({
      [FOLDER_VAR_LIST_MIME]: JSON.stringify(['fromMime']),
      'text/plain': `${FOLDER_VAR_TEXT_PREFIX}${JSON.stringify(['fromText'])}`,
    })
    expect(parseFolderVarListDrag(ev)).toEqual(['fromMime'])
  })
})

// ─── text/plain fallback path ─────────────────────────────────────────────────

describe('parseFolderVarListDrag › text/plain fallback', () => {
  it('reads variables from text/plain with correct prefix', () => {
    const payload = `${FOLDER_VAR_TEXT_PREFIX}${JSON.stringify(['A', 'B'])}`
    const ev = makeDT({ 'text/plain': payload })
    expect(parseFolderVarListDrag(ev)).toEqual(['A', 'B'])
  })

  it('returns null when text/plain prefix is missing', () => {
    const ev = makeDT({ 'text/plain': JSON.stringify(['A', 'B']) })
    expect(parseFolderVarListDrag(ev)).toBeNull()
  })

  it('returns null when text/plain has prefix but invalid JSON after it', () => {
    const ev = makeDT({ 'text/plain': `${FOLDER_VAR_TEXT_PREFIX}not-json` })
    expect(parseFolderVarListDrag(ev)).toBeNull()
  })

  it('returns null when text/plain has prefix but payload is not an array', () => {
    const ev = makeDT({ 'text/plain': `${FOLDER_VAR_TEXT_PREFIX}${JSON.stringify({ v: 'Q1' })}` })
    expect(parseFolderVarListDrag(ev)).toBeNull()
  })
})

// ─── empty / no data ─────────────────────────────────────────────────────────

describe('parseFolderVarListDrag › no data', () => {
  it('returns null when both MIME and text/plain are empty strings', () => {
    const ev = makeDT({})
    expect(parseFolderVarListDrag(ev)).toBeNull()
  })
})
