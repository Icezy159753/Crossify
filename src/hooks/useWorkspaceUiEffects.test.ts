/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useWorkspaceUiEffects } from './useWorkspaceUiEffects'

describe('useWorkspaceUiEffects', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('clears toast after the display window', () => {
    const { result } = renderHook(() => {
      const [toast, setToast] = useState<string | null>('Saved')
      const [sidebarWidth, setSidebarWidth] = useState(220)
      const [sidebarResizing, setSidebarResizing] = useState(false)
      const [tableContextMenu, setTableContextMenu] = useState<{ x: number; y: number; targetId: string } | null>(null)
      const [variableContextMenu, setVariableContextMenu] = useState<{ x: number; y: number } | null>(null)
      useWorkspaceUiEffects({
        toast,
        setToast,
        sidebarResizing,
        setSidebarWidth,
        setSidebarResizing,
        tableContextMenuOpen: Boolean(tableContextMenu),
        setTableContextMenu,
        variableContextMenuOpen: Boolean(variableContextMenu),
        setVariableContextMenu,
      })
      return { toast, sidebarWidth }
    })

    expect(result.current.toast).toBe('Saved')
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.toast).toBeNull()
  })

  it('resizes the sidebar within bounds and stops on mouseup', () => {
    const { result } = renderHook(() => {
      const [toast, setToast] = useState<string | null>(null)
      const [sidebarWidth, setSidebarWidth] = useState(220)
      const [sidebarResizing, setSidebarResizing] = useState(true)
      const [tableContextMenu, setTableContextMenu] = useState<{ x: number; y: number; targetId: string } | null>(null)
      const [variableContextMenu, setVariableContextMenu] = useState<{ x: number; y: number } | null>(null)
      useWorkspaceUiEffects({
        toast,
        setToast,
        sidebarResizing,
        setSidebarWidth,
        setSidebarResizing,
        tableContextMenuOpen: Boolean(tableContextMenu),
        setTableContextMenu,
        variableContextMenuOpen: Boolean(variableContextMenu),
        setVariableContextMenu,
      })
      return { sidebarResizing, sidebarWidth }
    })

    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { movementX: 400 } as MouseEventInit))
    })
    expect(result.current.sidebarWidth).toBe(480)

    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { movementX: -600 } as MouseEventInit))
    })
    expect(result.current.sidebarWidth).toBe(160)

    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup'))
    })
    expect(result.current.sidebarResizing).toBe(false)
  })

  it('dismisses open context menus on the next window click', () => {
    const { result } = renderHook(() => {
      const [toast, setToast] = useState<string | null>(null)
      const [sidebarWidth, setSidebarWidth] = useState(220)
      const [sidebarResizing, setSidebarResizing] = useState(false)
      const [tableContextMenu, setTableContextMenu] = useState<{ x: number; y: number; targetId: string } | null>({
        x: 10,
        y: 20,
        targetId: 'table-1',
      })
      const [variableContextMenu, setVariableContextMenu] = useState<{ x: number; y: number } | null>({
        x: 30,
        y: 40,
      })
      useWorkspaceUiEffects({
        toast,
        setToast,
        sidebarResizing,
        setSidebarWidth,
        setSidebarResizing,
        tableContextMenuOpen: Boolean(tableContextMenu),
        setTableContextMenu,
        variableContextMenuOpen: Boolean(variableContextMenu),
        setVariableContextMenu,
      })
      return { tableContextMenu, variableContextMenu, sidebarWidth }
    })

    act(() => {
      window.dispatchEvent(new MouseEvent('click'))
    })
    expect(result.current.tableContextMenu).toBeNull()
    expect(result.current.variableContextMenu).toBeNull()
  })
})
