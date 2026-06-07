/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { emptyTableFilter } from '../lib/tableModel'
import type { TableDef } from '../types/workspace'
import { useActiveTableSync } from './useActiveTableSync'

function table(id: string): TableDef {
  return {
    id,
    name: id,
    rowVar: null,
    colVar: null,
    result: null,
    folderId: null,
    filter: emptyTableFilter(),
  }
}

describe('useActiveTableSync', () => {
  it('selects the first table when no active table is set', () => {
    const { result } = renderHook(() => {
      const [activeTableId, setActiveTableId] = useState('')
      useActiveTableSync({
        activeTableId,
        setActiveTableId,
        tables: [table('first'), table('second')],
      })
      return activeTableId
    })

    expect(result.current).toBe('first')
  })

  it('preserves an existing active table id', () => {
    const { result } = renderHook(() => {
      const [activeTableId, setActiveTableId] = useState('second')
      useActiveTableSync({
        activeTableId,
        setActiveTableId,
        tables: [table('first'), table('second')],
      })
      return activeTableId
    })

    expect(result.current).toBe('second')
  })
})
