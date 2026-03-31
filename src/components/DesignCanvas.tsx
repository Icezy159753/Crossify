import { memo, useState, useCallback, type DragEvent } from 'react'

const AXIS_ITEM_MIME = 'application/x-crossify-axis-item'
const AXIS_TEXT_PREFIX = 'crossify-axis:'
import { ChevronDown, ChevronUp, RotateCcw, X } from 'lucide-react'
import {
  flattenAxisSpec,
  parseAxisSpec,
  type AxisSpec,
} from '../lib/appStateUtils'
import { parseFolderVarListDrag } from '../lib/dragTransfer'
import type { TableDef } from '../types/workspace'

export interface AxisDropTarget {
  branchIndex?: number
  placement?: 'before' | 'after'
  targetVar?: string | null
  /** Catalog multi-drag payload (read on drop; more reliable than a ref). */
  folderNames?: string[]
}

function axisTargetWithFolderDrag(event: DragEvent, base: AxisDropTarget): AxisDropTarget {
  const folder = parseFolderVarListDrag(event)
  console.log('[AxisDrop] parseFolderVarListDrag=', folder, 'base=', base)
  return folder && folder.length > 0 ? { ...base, folderNames: folder } : base
}

interface AxisDropZoneProps {
  title: string
  side: 'top' | 'side'
  branches: AxisSpec
  selectedVar: string | null
  mode: 'add' | 'nest'
  isQuickTarget: boolean
  getVarLabel: (name: string) => string
  getVarTone: (name: string) => { badge: string; cls: string }
  onActivateQuickTarget: () => void
  onDrop: (target: AxisDropTarget) => void
  onClear: () => void
  onReorder: (
    source: { branchIndex: number; itemIndex: number },
    target: { branchIndex: number; itemIndex: number; placement?: 'before' | 'after' },
  ) => void
  onRemove: (name: string, occurrence?: { branchIndex: number; itemIndex: number }) => void
  onSelect: (name: string) => void
  onMoveUp: (name: string) => void
  onMoveDown: (name: string) => void
  onModeChange: (mode: 'add' | 'nest') => void
}

const AxisDropZone = memo(function AxisDropZone({
  title,
  side,
  branches,
  selectedVar,
  mode,
  isQuickTarget,
  getVarLabel,
  getVarTone,
  onActivateQuickTarget,
  onDrop,
  onClear,
  onReorder,
  onRemove,
  onSelect,
  onMoveUp,
  onMoveDown,
  onModeChange,
}: AxisDropZoneProps) {
  const [over, setOver] = useState(false)
  const isTop = side === 'top'
  const varNames = flattenAxisSpec(branches)

  const parseAxisDrag = useCallback(
    (event: React.DragEvent) => {
      let raw = event.dataTransfer.getData(AXIS_ITEM_MIME)
      if (!raw) {
        const plain = event.dataTransfer.getData('text/plain')
        if (plain.startsWith(AXIS_TEXT_PREFIX)) {
          raw = plain.slice(AXIS_TEXT_PREFIX.length)
        }
      }
      if (!raw) return null
      try {
        const parsed = JSON.parse(raw) as {
          side?: 'top' | 'side'
          branchIndex?: number
          itemIndex?: number
        }
        if (parsed.side !== side) return null
        if (typeof parsed.branchIndex !== 'number' || typeof parsed.itemIndex !== 'number') return null
        return {
          branchIndex: parsed.branchIndex,
          itemIndex: parsed.itemIndex,
        }
      } catch {
        return null
      }
    },
    [side],
  )

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setOver(true)
  }

  const handleDropEmpty = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setOver(false)
      const axisDrag = parseAxisDrag(event)
      if (axisDrag && branches.length > 0) {
        const lastBranchIndex = branches.length - 1
        const lastItemIndex = Math.max(branches[lastBranchIndex].length - 1, 0)
        onReorder(axisDrag, { branchIndex: lastBranchIndex, itemIndex: lastItemIndex, placement: 'after' })
        return
      }
      onDrop(axisTargetWithFolderDrag(event, { placement: 'after' }))
    },
    [branches, onDrop, onReorder, parseAxisDrag],
  )

  return (
    <div
      onClick={onActivateQuickTarget}
      onDragOver={handleDragOver}
      onDragLeave={() => setOver(false)}
      onDrop={handleDropEmpty}
      className={`border-2 rounded-xl transition-colors bg-white ${over ? 'border-blue-400 bg-blue-50' : isQuickTarget ? 'border-blue-500 bg-blue-50/60 shadow-[0_0_0_3px_rgba(59,130,246,0.08)]' : 'border-blue-200'} ${isTop ? 'w-full min-w-0 max-w-full overflow-hidden p-4' : 'flex-shrink-0 p-3'}`}
      style={isTop ? undefined : { height: 390, minWidth: 240, maxWidth: 320, width: 'min(100%,320px)', overflow: 'hidden' }}
    >
      <div className="flex min-w-0 items-start gap-3" style={isTop ? undefined : { height: '100%' }}>
        <div className="min-w-0 flex-1 overflow-hidden" style={isTop ? undefined : { height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="mb-3 flex items-center gap-2">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">{title}</div>
            {isQuickTarget && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                Quick Add
              </span>
            )}
          </div>
          {varNames.length > 0 ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDropEmpty}
              className={
                isTop
                  ? 'overflow-x-auto flex min-h-[84px] flex-nowrap items-start gap-px pb-1.5'
                  : 'flex flex-col items-start gap-1 pr-1'
              }
              style={isTop ? { overflowX: 'auto', scrollbarWidth: 'thin' } : { flex: '1 1 0%', minHeight: 0, overflowY: 'auto', scrollbarWidth: 'thin' }}
            >
              {branches.map((branch, branchIndex) => (
                <div
                  key={`${title}-branch-${branchIndex}-${branch.join('__')}`}
                  className={isTop ? 'flex shrink-0 items-stretch gap-0' : 'flex w-full min-w-0 flex-col items-stretch gap-0'}
                >
                  <div
                    onDragOver={event => {
                      event.preventDefault()
                      event.stopPropagation()
                      setOver(true)
                    }}
                    onDrop={event => {
                      event.preventDefault()
                      event.stopPropagation()
                      setOver(false)
                      const axisDrag = parseAxisDrag(event)
                      if (axisDrag) {
                        const fallbackItemIndex = 0
                        onReorder(axisDrag, { branchIndex, itemIndex: fallbackItemIndex, placement: 'before' })
                        return
                      }
                      onDrop(axisTargetWithFolderDrag(event, { branchIndex, placement: 'before' }))
                    }}
                    className={isTop
                      ? `w-0.5 rounded ${mode === 'add' ? 'hover:bg-blue-200/70' : 'pointer-events-none opacity-0'}`
                      : `h-1 rounded ${mode === 'add' ? 'hover:bg-blue-200/70' : 'pointer-events-none opacity-0'}`
                    }
                  />
                  <div className="flex w-full min-w-0 flex-col gap-px">
                    {branch.map((name, itemIndex) => {
                      const flatIndex = varNames.indexOf(name)
                      const tone = getVarTone(name)
                      const axisPayload = JSON.stringify({ side, branchIndex, itemIndex })

                      return (
                        <div
                          key={`${branchIndex}-${itemIndex}-${name}`}
                          draggable
                          onClick={() => onSelect(name)}
                          title={getVarLabel(name)}
                          onDragStart={event => {
                            event.dataTransfer.effectAllowed = 'move'
                            event.dataTransfer.setData(AXIS_ITEM_MIME, axisPayload)
                            event.dataTransfer.setData('text/plain', `${AXIS_TEXT_PREFIX}${axisPayload}`)
                          }}
                          onDragOver={event => {
                            const axisDrag = parseAxisDrag(event)
                            if (axisDrag) {
                              event.preventDefault()
                              event.stopPropagation()
                              event.dataTransfer.dropEffect = 'move'
                              return
                            }
                            handleDragOver(event)
                          }}
                          onDrop={event => {
                            event.preventDefault()
                            event.stopPropagation()
                            setOver(false)
                            const axisDrag = parseAxisDrag(event)
                            if (axisDrag) {
                              onReorder(axisDrag, { branchIndex, itemIndex, placement: 'before' })
                              return
                            }
                            onDrop(axisTargetWithFolderDrag(event, { targetVar: name }))
                          }}
                          className={`group relative cursor-pointer transition-all shadow-sm ${isTop ? 'min-h-[42px] min-w-[86px] px-2 py-1.5 rounded-2xl' : 'w-full min-w-0 max-w-full px-2 py-1.5 rounded-2xl'} ${tone.cls} ${selectedVar === name ? 'ring-2 ring-offset-1 ring-blue-300' : 'hover:-translate-y-[1px] hover:shadow-md'}`}
                          style={isTop ? undefined : { height: 34, minHeight: 34, maxHeight: 34, flexShrink: 0 }}
                        >
                          <div className={`flex items-center gap-1.5 ${isTop ? '' : 'min-w-0'}`}>
                            <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 border border-white/70 shadow-sm">
                              {tone.badge}
                            </span>
                            <div
                              className={`min-w-0 font-semibold text-slate-800 leading-tight text-[11px] ${isTop ? 'truncate' : 'truncate pr-10'}`}
                            >
                              {name}
                            </div>
                          </div>
                          <div className={`absolute ${isTop ? 'bottom-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100' : 'top-1/2 right-1 -translate-y-1/2 flex gap-0.5 opacity-70 group-hover:opacity-100'}`}>
                            <button
                              type="button"
                              draggable={false}
                              onClick={event => {
                                event.stopPropagation()
                                onMoveUp(name)
                              }}
                              disabled={flatIndex === 0}
                              className="p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                              title="Move up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              draggable={false}
                              onClick={event => {
                                event.stopPropagation()
                                onMoveDown(name)
                              }}
                              disabled={flatIndex === varNames.length - 1}
                              className="p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                              title="Move down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              draggable={false}
                              onClick={event => {
                                event.stopPropagation()
                                onRemove(name, { branchIndex, itemIndex })
                              }}
                              className="p-0.5 text-gray-400 hover:text-red-500"
                              title="Remove"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div
                    onDragOver={event => {
                      event.preventDefault()
                      event.stopPropagation()
                      setOver(true)
                    }}
                    onDrop={event => {
                      event.preventDefault()
                      event.stopPropagation()
                      setOver(false)
                      const axisDrag = parseAxisDrag(event)
                      if (axisDrag) {
                        const fallbackItemIndex = Math.max(branch.length - 1, 0)
                        onReorder(axisDrag, { branchIndex, itemIndex: fallbackItemIndex, placement: 'after' })
                        return
                      }
                      onDrop(axisTargetWithFolderDrag(event, { branchIndex, placement: 'after' }))
                    }}
                    className={isTop
                      ? `w-0.5 rounded ${mode === 'add' ? 'hover:bg-blue-200/70' : 'pointer-events-none opacity-0'}`
                      : `h-1 rounded ${mode === 'add' ? 'hover:bg-blue-200/70' : 'pointer-events-none opacity-0'}`
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDropEmpty}
              className={`flex items-center justify-center rounded-lg border border-dashed border-gray-200 text-[11px] text-gray-400 text-center px-3 ${isTop ? 'min-h-[84px]' : ''}`}
              style={isTop ? undefined : { flex: '1 1 0%', minHeight: 0 }}
            >
              Drag variable here
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 flex-col items-center gap-2 pt-5">
          <button
            onClick={() => onModeChange('add')}
            className={`min-w-[46px] px-2 py-1 rounded text-[11px] font-semibold border ${mode === 'add' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            Add
          </button>
          <button
            onClick={() => onModeChange('nest')}
            className={`min-w-[46px] px-2 py-1 rounded text-[11px] font-semibold border ${mode === 'nest' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            Nest
          </button>
          <button
            onClick={onClear}
            disabled={varNames.length === 0}
            className="inline-flex min-w-[46px] items-center justify-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
            title={`Clear all ${title.toLowerCase()} variables`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {isTop && varNames.length > 0 && (
        <p className="mt-3 text-[10px] text-gray-400">
          {mode === 'add' ? 'Add mode: place next variable after the last level' : 'Nest mode: insert next variable after the selected level'}
        </p>
      )}
    </div>
  )
})

interface DesignCanvasProps {
  table: TableDef
  batchEditCount?: number
  quickAddTarget: 'top' | 'side' | 'filter'
  getVarLabel: (name: string) => string
  getVarTone: (name: string) => { badge: string; cls: string }
  onActivateQuickTarget: (target: 'top' | 'side') => void
  onDropTop: (mode: 'add' | 'nest', target: AxisDropTarget) => void
  onDropSide: (mode: 'add' | 'nest', target: AxisDropTarget) => void
  onClearTop: () => void
  onClearSide: () => void
  onReorderTop: (
    source: { branchIndex: number; itemIndex: number },
    target: { branchIndex: number; itemIndex: number; placement?: 'before' | 'after' },
  ) => void
  onReorderSide: (
    source: { branchIndex: number; itemIndex: number },
    target: { branchIndex: number; itemIndex: number; placement?: 'before' | 'after' },
  ) => void
  onRemoveTop: (name: string, occurrence?: { branchIndex: number; itemIndex: number }) => void
  onRemoveSide: (name: string, occurrence?: { branchIndex: number; itemIndex: number }) => void
  onMoveTopUp: (name: string) => void
  onMoveTopDown: (name: string) => void
  onMoveSideUp: (name: string) => void
  onMoveSideDown: (name: string) => void
  onUpdateName: (name: string) => void
  onGenerate: () => void
  canRun: boolean
}

export const DesignCanvas = memo(function DesignCanvas({
  table,
  batchEditCount = 1,
  quickAddTarget,
  getVarLabel,
  getVarTone,
  onActivateQuickTarget,
  onDropTop,
  onDropSide,
  onClearTop,
  onClearSide,
  onReorderTop,
  onReorderSide,
  onRemoveTop,
  onRemoveSide,
  onMoveTopUp,
  onMoveTopDown,
  onMoveSideUp,
  onMoveSideDown,
  onUpdateName,
  onGenerate,
  canRun,
}: DesignCanvasProps) {
  const rowLevels = parseAxisSpec(table.rowVar)
  const colLevels = parseAxisSpec(table.colVar)
  const rowVars = flattenAxisSpec(rowLevels)
  const colVars = flattenAxisSpec(colLevels)
  const [selectedTop, setSelectedTop] = useState<string | null>(null)
  const [selectedSide, setSelectedSide] = useState<string | null>(null)
  const [topMode, setTopMode] = useState<'add' | 'nest'>('add')
  const [sideMode, setSideMode] = useState<'add' | 'nest'>('add')

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Table Description</span>
        <input
          value={table.name}
          onChange={event => onUpdateName(event.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        {batchEditCount > 1 && (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100 whitespace-nowrap">
            Editing {batchEditCount} tables
          </span>
        )}
      </div>

      <div className="min-w-0 overflow-hidden rounded-xl border-2 border-[#4472C4] bg-white p-5 shadow-sm">
        <div className="flex min-w-0 flex-col gap-3">
          <AxisDropZone
            title="Top"
            side="top"
            branches={colLevels}
            selectedVar={selectedTop}
            mode={topMode}
            isQuickTarget={quickAddTarget === 'top'}
            getVarLabel={getVarLabel}
            getVarTone={getVarTone}
            onActivateQuickTarget={() => onActivateQuickTarget('top')}
            onDrop={target => onDropTop(topMode, { ...target, targetVar: target.targetVar ?? selectedTop })}
            onClear={() => {
              onClearTop()
              setSelectedTop(null)
            }}
            onReorder={onReorderTop}
            onRemove={(name, occurrence) => {
              onRemoveTop(name, occurrence)
              if (selectedTop === name) setSelectedTop(null)
            }}
            onSelect={setSelectedTop}
            onMoveUp={onMoveTopUp}
            onMoveDown={onMoveTopDown}
            onModeChange={setTopMode}
          />
          <div className="flex min-w-0 items-start gap-3">
            <AxisDropZone
              title="Side"
              side="side"
              branches={rowLevels}
              selectedVar={selectedSide}
              mode={sideMode}
              isQuickTarget={quickAddTarget === 'side'}
              getVarLabel={getVarLabel}
              getVarTone={getVarTone}
              onActivateQuickTarget={() => onActivateQuickTarget('side')}
              onDrop={target => onDropSide(sideMode, { ...target, targetVar: target.targetVar ?? selectedSide })}
              onClear={() => {
                onClearSide()
                setSelectedSide(null)
              }}
              onReorder={onReorderSide}
              onRemove={(name, occurrence) => {
                onRemoveSide(name, occurrence)
                if (selectedSide === name) setSelectedSide(null)
              }}
              onSelect={setSelectedSide}
              onMoveUp={onMoveSideUp}
              onMoveDown={onMoveSideDown}
              onModeChange={setSideMode}
            />
            <div className="flex min-h-[110px] min-w-0 flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/60">
              {rowVars.length > 0 && colVars.length > 0 ? (
                <div className="text-center px-3">
                  <p className="text-xs text-gray-600 font-medium">
                    {rowVars.map(getVarLabel).join(' + ')} x {colVars.map(getVarLabel).join(' + ')}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Press Run to generate the table</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center px-3">Drag variables to Top and Side</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 bg-white/95 pb-1 pt-1 backdrop-blur-[1px]">
        <button
          onClick={onGenerate}
          disabled={!canRun}
          className="w-full py-2.5 bg-[#1F4E78] hover:bg-[#16375a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm shadow"
        >
          Run Table
        </button>
      </div>
    </div>
  )
})
