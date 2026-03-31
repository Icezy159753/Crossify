import { memo, useState, type MouseEvent } from 'react'
import { Copy, Filter, Folder, Trash2 } from 'lucide-react'
import type { FolderDef, TableDef } from '../types/workspace'

interface TableRowProps {
  table: TableDef
  active: boolean
  selected: boolean
  hasActiveFilter: boolean
  filterSummary?: string | null
  folders: FolderDef[]
  onClick: (options?: { shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean }) => void
  onContextMenu: (event: MouseEvent<HTMLDivElement>) => void
  onDelete: () => void
  onRename: (name: string) => void
  onToggleSelect: (options?: { shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean }) => void
  onMoveToFolder: (folderId: string | null) => void
  onDuplicate: () => void
  onDragStart: () => void
  onDropToRow: () => void
  indent: boolean
}

export const TableRow = memo(function TableRow({
  table,
  active,
  selected,
  hasActiveFilter,
  filterSummary,
  folders,
  onClick,
  onContextMenu,
  onDelete,
  onRename,
  onToggleSelect,
  onMoveToFolder,
  onDuplicate,
  onDragStart,
  onDropToRow,
  indent,
}: TableRowProps) {
  const [showFolderPicker, setShowFolderPicker] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState('')

  function commitRename() {
    const next = draftName.trim()
    onRename(next || table.name)
    setEditing(false)
  }

  function passClick(event: MouseEvent<HTMLElement>) {
    onClick({
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
    })
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={event => event.preventDefault()}
      onDrop={event => {
        event.preventDefault()
        event.stopPropagation()
        onDropToRow()
      }}
      onContextMenu={onContextMenu}
      onClick={passClick}
      className={`flex items-center gap-1.5 py-2 cursor-pointer group transition-colors
        ${indent ? 'pl-6 pr-2' : 'px-2'}
        ${active
          ? 'bg-blue-50 border-l-2 border-[#1F4E78]'
          : selected
            ? 'bg-blue-50/70 border-l-2 border-blue-200'
            : 'hover:bg-gray-50 border-l-2 border-transparent'}`}
    >
      <input
        type="checkbox"
        checked={selected}
        onClick={event => {
          event.stopPropagation()
          onToggleSelect({
            shiftKey: event.shiftKey,
            metaKey: event.metaKey,
            ctrlKey: event.ctrlKey,
          })
        }}
        readOnly
        className="w-3 h-3 flex-shrink-0 accent-[#1F4E78] cursor-pointer"
        title="Select table"
      />
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${table.result ? 'bg-green-400' : 'bg-gray-300'}`} />
      {hasActiveFilter && (
        <span
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full border flex-shrink-0 ${
            active
              ? 'border-blue-200 bg-blue-100 text-blue-700'
              : 'border-amber-200 bg-amber-50 text-amber-600'
          }`}
          title={filterSummary || 'This table has an active filter'}
        >
          <Filter className="h-2.5 w-2.5" />
        </span>
      )}
      {editing ? (
        <input
          value={draftName}
          autoFocus
          onClick={event => event.stopPropagation()}
          onChange={event => setDraftName(event.target.value)}
          onBlur={commitRename}
          onKeyDown={event => {
            if (event.key === 'Enter') commitRename()
            if (event.key === 'Escape') {
              setDraftName(table.name)
              setEditing(false)
            }
          }}
          className={`flex-1 text-xs bg-transparent outline-none min-w-0 ${active ? 'text-[#1F4E78] font-semibold' : 'text-gray-700'}`}
        />
      ) : (
        <button
          onClick={event => {
            event.stopPropagation()
            passClick(event)
          }}
          onDoubleClick={event => {
            event.stopPropagation()
            setDraftName(table.name)
            setEditing(true)
          }}
          className={`flex-1 text-left text-xs bg-transparent outline-none min-w-0 truncate ${active ? 'text-[#1F4E78] font-semibold' : 'text-gray-700'}`}
          title="Double-click to rename"
        >
          {table.name}
        </button>
      )}
      {folders.length > 0 && (
        <div className="relative flex-shrink-0">
          <button
            onClick={event => {
              event.stopPropagation()
              setShowFolderPicker(value => !value)
            }}
            className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto text-gray-400 hover:text-amber-500 p-0.5"
            title="Move to folder"
          >
            <Folder className="w-3 h-3" />
          </button>
          {showFolderPicker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowFolderPicker(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                <button
                  className="block w-full text-left px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
                  onClick={event => {
                    event.stopPropagation()
                    onMoveToFolder(null)
                    setShowFolderPicker(false)
                  }}
                >
                  (No folder)
                </button>
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    className="block w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-amber-50"
                    onClick={event => {
                      event.stopPropagation()
                      onMoveToFolder(folder.id)
                      setShowFolderPicker(false)
                    }}
                  >
                    {folder.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <button
        onClick={event => {
          event.stopPropagation()
          onDuplicate()
        }}
        className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto text-gray-400 hover:text-blue-500 flex-shrink-0"
        title="Duplicate this table"
      >
        <Copy className="w-3 h-3" />
      </button>
      <button
        onClick={event => {
          event.stopPropagation()
          onDelete()
        }}
        className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto text-gray-400 hover:text-red-500 flex-shrink-0"
        title="Delete table"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
})
