import { useState, useRef, useCallback, memo, useLayoutEffect, useEffect, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal } from 'lucide-react'
import type { VariableListItem } from '../lib/variableGrouping'
import { FOLDER_VAR_LIST_MIME, FOLDER_VAR_TEXT_PREFIX } from '../lib/dragTransfer'

const ITEM_H = 46  // px per item
const OVERSCAN = 4

// ── Variable kind helpers ────────────────────────────────────────────────────

type VarKind = 'text' | 'sa' | 'ma' | 'numeric'
type QuickAddTarget = 'top' | 'side' | 'filter'
type QuickActionTarget = QuickAddTarget | 'table'

function getVarKind(v: VariableListItem): VarKind {
  if ('isGroupedMA' in v && v.isGroupedMA) return 'ma'
  if (v.isString) return 'text'
  const keys = Object.keys(v.valueLabels)
  if (keys.length === 0) return 'numeric'
  return 'sa'
}

const KIND: Record<VarKind, { label: string; cls: string; title: string }> = {
  text:    { label: 'A',  cls: 'bg-amber-100 text-amber-700 border border-amber-300',        title: 'Text' },
  sa:      { label: 'SA', cls: 'bg-blue-100 text-blue-700 border border-blue-300',           title: 'Single Answer' },
  ma:      { label: 'MA', cls: 'bg-emerald-100 text-emerald-700 border border-emerald-300',  title: 'Multiple Answer' },
  numeric: { label: '#',  cls: 'bg-gray-100 text-gray-500 border border-gray-300',           title: 'Numeric' },
}

const QUICK_TARGET_LABELS: Record<QuickAddTarget, string> = {
  top: 'Top',
  side: 'Side',
  filter: 'Filter',
}

const QUICK_ACTION_LABELS: Record<QuickActionTarget, string> = {
  top: 'Top',
  side: 'Side',
  filter: 'Filter',
  table: 'Table',
}

// ── VarItem ──────────────────────────────────────────────────────────────────

const VarItem = memo(function VarItem({
  v,
  onDragStart,
  getFolderDragNames,
  onOpen,
  selected,
  menuOpen,
  onToggleMenu,
  onSelect,
}: {
  v: VariableListItem
  onDragStart: (name: string) => void
  /** Ordered variable names to place on drop (multi-select => all selected, else [name]) */
  getFolderDragNames: (primary: string) => string[]
  onOpen?: (name: string) => void
  selected: boolean
  menuOpen: boolean
  onToggleMenu: (name: string, anchor: HTMLElement) => void
  onSelect: (name: string, options?: { shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean }) => void
}) {
  const kind = KIND[getVarKind(v)]

  function passSelect(event: MouseEvent<HTMLElement>) {
    onSelect(v.name, {
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
    })
  }

  return (
    <div
      draggable
      onDragStart={e => {
        const names = getFolderDragNames(v.name)
        const payload = JSON.stringify(names)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData(FOLDER_VAR_LIST_MIME, payload)
        e.dataTransfer.setData('text/plain', `${FOLDER_VAR_TEXT_PREFIX}${payload}`)
        onDragStart(v.name)
      }}
      onDoubleClick={() => onOpen?.(v.name)}
      onClick={passSelect}
      onContextMenu={event => {
        event.preventDefault()
        event.stopPropagation()
        onToggleMenu(v.name, event.currentTarget)
      }}
      className={`group relative flex items-start gap-1.5 px-2 py-1.5 rounded cursor-grab active:bg-blue-100 select-none ${
        selected ? 'bg-blue-50/60 ring-1 ring-blue-100' : 'hover:bg-blue-50'
      }`}
      style={{ height: ITEM_H }}
    >
      <span
        className={`mt-0.5 flex-shrink-0 w-5 h-4 rounded text-[9px] font-bold flex items-center justify-center ${kind.cls}`}
        title={kind.title}
      >
        {kind.label}
      </span>
      <div className="min-w-0 flex-1 pr-9">
        <div className="text-xs font-medium text-gray-800 truncate leading-tight">
          {v.name}
        </div>
        <div className="text-[10px] text-gray-400 truncate">{v.label || v.longName}</div>
      </div>
      <button
        type="button"
        onMouseDown={event => event.preventDefault()}
        onClick={event => {
          event.stopPropagation()
          onToggleMenu(v.name, event.currentTarget)
        }}
        className={`absolute right-1 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-blue-100 transition-opacity hover:bg-blue-50 hover:text-[#1F4E78] ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        title="Quick actions"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
    </div>
  )
})

// ── VirtualVarList ───────────────────────────────────────────────────────────

interface Props {
  variables: VariableListItem[]
  onDragStart: (name: string) => void
  onOpen?: (name: string) => void
  activeTarget: QuickAddTarget
  selectedNames: Set<string>
  onSelect: (name: string, options?: { shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean }) => void
  onClearSelection: () => void
  onQuickAction: (name: string, target: QuickActionTarget) => void
}

export function VirtualVarList({ variables, onDragStart, onOpen, activeTarget, selectedNames, onSelect, onClearSelection, onQuickAction }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [search, setSearch] = useState('')
  const [openMenuName, setOpenMenuName] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)
  const [scrollState, setScrollState] = useState({ top: 0, height: 400 })

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (menuRef.current?.contains(target)) return
      if (containerRef.current?.contains(target)) {
        setOpenMenuName(null)
        setMenuPosition(null)
        return
      }
      setOpenMenuName(null)
      setMenuPosition(null)
      onClearSelection()
    }
    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [onClearSelection])

  const filtered = search
    ? variables.filter(v =>
        (v.label || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.longName || '').toLowerCase().includes(search.toLowerCase()) ||
        v.name.toLowerCase().includes(search.toLowerCase())
      )
    : variables

  // Measure container height after mount
  useLayoutEffect(() => {
    const el = containerRef.current
    if (el && el.clientHeight > 0) {
      setScrollState(prev => prev.height === el.clientHeight ? prev : { ...prev, height: el.clientHeight })
    }
    if (!el) return
    const ro = new ResizeObserver(() => {
      if (el.clientHeight > 0) {
        setScrollState(prev => prev.height === el.clientHeight ? prev : { ...prev, height: el.clientHeight })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { top: scrollTop, height: viewH } = scrollState
  const totalH = filtered.length * ITEM_H
  const startIdx = Math.max(0, Math.floor(scrollTop / ITEM_H) - OVERSCAN)
  const endIdx   = Math.min(filtered.length, Math.ceil((scrollTop + viewH) / ITEM_H) + OVERSCAN)
  const visible  = filtered.slice(startIdx, endIdx)

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    setOpenMenuName(null)
    setMenuPosition(null)
    setScrollState(prev => {
      const nextHeight = el.clientHeight > 0 ? el.clientHeight : prev.height
      if (prev.top === el.scrollTop && prev.height === nextHeight) return prev
      return { top: el.scrollTop, height: nextHeight }
    })
  }, [])

  const getFolderDragNames = useCallback(
    (primary: string): string[] => {
      if (selectedNames.size > 1 && selectedNames.has(primary)) {
        return variables.map(v => v.name).filter(n => selectedNames.has(n))
      }
      return [primary]
    },
    [variables, selectedNames],
  )

  const handleToggleMenu = useCallback((name: string, anchor: HTMLElement) => {
    setOpenMenuName(prev => {
      if (prev === name) {
        setMenuPosition(null)
        return null
      }
      const rect = anchor.getBoundingClientRect()
      const menuHeight = 138
      const menuWidth = 126
      const spaceBelow = window.innerHeight - rect.bottom
      const openUpward = spaceBelow < menuHeight && rect.top > spaceBelow
      const top = openUpward ? Math.max(8, rect.top - menuHeight + 8) : Math.min(window.innerHeight - menuHeight - 8, rect.bottom - 6)
      const left = Math.min(window.innerWidth - menuWidth - 8, Math.max(8, rect.right - menuWidth))
      setMenuPosition({ top, left })
      return name
    })
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search box */}
      <div className="px-2 py-1.5 border-b border-gray-100 flex-shrink-0">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาตัวแปร..."
          className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-300 select-text"
        />
      </div>
      {/* Scroll container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <div style={{ height: totalH, position: 'relative' }}>
          {visible.map((v, i) => (
            <div
              key={`${startIdx + i}_${v.name}`}
              style={{
                position: 'absolute',
                top: (startIdx + i) * ITEM_H,
                left: 0,
                right: 0,
                height: ITEM_H,
              }}
            >
              <VarItem
                v={v}
                onDragStart={onDragStart}
                getFolderDragNames={getFolderDragNames}
                onOpen={onOpen}
                selected={selectedNames.has(v.name)}
                menuOpen={openMenuName === v.name}
                onToggleMenu={handleToggleMenu}
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>
      </div>
      {openMenuName && menuPosition && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left, zIndex: 1400 }}
          className="min-w-[126px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl"
        >
          {(['top', 'side', 'filter', 'table'] as const).map(target => (
            <button
              key={target}
              type="button"
              onMouseDown={event => event.preventDefault()}
              onClick={event => {
                event.stopPropagation()
                onQuickAction(openMenuName, target)
                setOpenMenuName(null)
                setMenuPosition(null)
              }}
              className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[11px] font-semibold transition-colors ${
                target === 'table'
                  ? 'text-emerald-700 hover:bg-emerald-50'
                  : 'text-slate-700 hover:bg-blue-50 hover:text-[#1F4E78]'
              }`}
              title={target === 'table' ? 'Create table from variable' : `Add to ${QUICK_ACTION_LABELS[target]}`}
            >
              <span>{QUICK_ACTION_LABELS[target]}</span>
              {target !== 'table' && (
                <span className="text-[9px] font-bold text-gray-400">Add</span>
              )}
            </button>
          ))}
        </div>,
        document.body,
      )}
      <div className="px-2 py-1 text-[10px] text-gray-400 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <span>{search ? `${filtered.length} / ${variables.length}` : `${variables.length} variables`}</span>
          <span className="font-semibold text-blue-500">Quick add: {QUICK_TARGET_LABELS[activeTarget]}</span>
        </div>
      </div>
    </div>
  )
}
