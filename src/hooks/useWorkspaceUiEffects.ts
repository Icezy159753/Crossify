import { useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'

interface UseWorkspaceUiEffectsInput {
  toast: string | null
  setToast: Dispatch<SetStateAction<string | null>>
  sidebarResizing: boolean
  setSidebarWidth: Dispatch<SetStateAction<number>>
  setSidebarResizing: Dispatch<SetStateAction<boolean>>
  tableContextMenuOpen: boolean
  setTableContextMenu: Dispatch<SetStateAction<{ x: number; y: number; targetId: string } | null>>
  variableContextMenuOpen: boolean
  setVariableContextMenu: Dispatch<SetStateAction<{ x: number; y: number } | null>>
}

export function useWorkspaceUiEffects({
  toast,
  setToast,
  sidebarResizing,
  setSidebarWidth,
  setSidebarResizing,
  tableContextMenuOpen,
  setTableContextMenu,
  variableContextMenuOpen,
  setVariableContextMenu,
}: UseWorkspaceUiEffectsInput) {
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3000)
    return () => window.clearTimeout(timer)
  }, [toast, setToast])

  useEffect(() => {
    if (!sidebarResizing) return
    const onMove = (event: MouseEvent) => {
      setSidebarWidth(width => Math.max(160, Math.min(480, width + event.movementX)))
    }
    const onUp = () => setSidebarResizing(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [setSidebarResizing, setSidebarWidth, sidebarResizing])

  useEffect(() => {
    if (!tableContextMenuOpen) return
    const dismiss = () => setTableContextMenu(null)
    window.addEventListener('click', dismiss, { once: true })
    return () => window.removeEventListener('click', dismiss)
  }, [setTableContextMenu, tableContextMenuOpen])

  useEffect(() => {
    if (!variableContextMenuOpen) return
    const dismiss = () => setVariableContextMenu(null)
    window.addEventListener('click', dismiss, { once: true })
    return () => window.removeEventListener('click', dismiss)
  }, [setVariableContextMenu, variableContextMenuOpen])
}
