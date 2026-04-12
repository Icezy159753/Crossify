import { Fragment, memo, useState } from 'react'
import { parseFolderVarListDrag } from '../lib/dragTransfer'
import { Filter, Plus, Trash2, X } from 'lucide-react'
import type {
  FilterJoin,
  FilterOperator,
  TableDef,
  TableFilterCondition,
} from '../types/workspace'

interface FilterOptionItem {
  key: string
  label: string
}

interface FilterFieldMeta {
  kind: 'options' | 'numeric' | 'text'
  options: FilterOptionItem[]
  operators: FilterOperator[]
}

interface FilterCanvasProps {
  table: TableDef
  batchEditCount?: number
  isQuickTarget?: boolean
  getVarLabel: (name: string) => string
  getVarTone: (name: string) => { badge: string; cls: string }
  getFilterFieldMeta: (name: string) => FilterFieldMeta
  onActivateQuickTarget?: () => void
  onUpdateDescription: (description: string) => void
  onUpdateRootJoin: (join: FilterJoin) => void
  onAddGroup: () => void
  onClear: () => void
  onDropVariable: (groupId?: string | null, folderNames?: string[] | null) => void
  onUpdateGroupJoin: (groupId: string, join: FilterJoin) => void
  onRemoveGroup: (groupId: string) => void
  onUpdateCondition: (groupId: string, conditionId: string, patch: Partial<TableFilterCondition>) => void
  onRemoveCondition: (groupId: string, conditionId: string) => void
  onGenerate: () => void
  canRun: boolean
}

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  in: 'is any of',
  not_in: 'is not any of',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  between: 'between',
  contains: 'contains',
  not_contains: 'does not contain',
  is_blank: 'is blank',
  not_blank: 'is not blank',
}

const JOIN_LABELS: Record<FilterJoin, string> = {
  all: 'AND',
  any: 'OR',
}

function JoinToggle({
  value,
  onChange,
  compact = false,
}: {
  value: FilterJoin
  onChange: (value: FilterJoin) => void
  compact?: boolean
}) {
  return (
    <div className={`inline-flex rounded-xl bg-blue-50 p-1 ring-1 ring-blue-100 ${compact ? '' : 'shadow-sm'}`}>
      {(['all', 'any'] as const).map(option => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
            value === option
              ? 'bg-white text-[#1F4E78] shadow-sm'
              : 'text-gray-500 hover:text-[#1F4E78]'
          }`}
          title={option === 'all' ? 'Every condition must match' : 'Any condition can match'}
        >
          {JOIN_LABELS[option]}
        </button>
      ))}
    </div>
  )
}

function LogicBadge({
  join,
  label,
}: {
  join: FilterJoin
  label: string
}) {
  return (
    <div className="flex items-center justify-center py-1">
      <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-[#1F4E78]">
        <span>{JOIN_LABELS[join]}</span>
        <span className="text-[10px] font-medium text-blue-500">{label}</span>
      </span>
    </div>
  )
}

function ConditionEditor({
  groupId,
  condition,
  meta,
  getVarLabel,
  getVarTone,
  search,
  onSearchChange,
  onUpdateCondition,
  onRemoveCondition,
}: {
  groupId: string
  condition: TableFilterCondition
  meta: FilterFieldMeta
  getVarLabel: (name: string) => string
  getVarTone: (name: string) => { badge: string; cls: string }
  search: string
  onSearchChange: (value: string) => void
  onUpdateCondition: (groupId: string, conditionId: string, patch: Partial<TableFilterCondition>) => void
  onRemoveCondition: (groupId: string, conditionId: string) => void
}) {
  const tone = getVarTone(condition.variableName)
  const usesOptions = (condition.operator === 'in' || condition.operator === 'not_in') && meta.options.length > 0
  const filteredOptions = search.trim() === ''
    ? meta.options
    : meta.options.filter(option => option.label.toLowerCase().includes(search.trim().toLowerCase()))

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-700 ${tone.cls}`}>
            <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-bold">{tone.badge}</span>
            <span className="truncate max-w-[220px]">{condition.variableName}</span>
          </span>
          <span className="text-xs text-gray-500 truncate">{getVarLabel(condition.variableName)}</span>
        </div>
        <button
          onClick={() => onRemoveCondition(groupId, condition.id)}
          className="text-gray-400 hover:text-red-500"
          title="Remove filter"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={condition.operator}
          onChange={event => onUpdateCondition(groupId, condition.id, { operator: event.target.value as FilterOperator })}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-200"
        >
          {meta.operators.map(operator => (
            <option key={operator} value={operator}>
              {OPERATOR_LABELS[operator]}
            </option>
          ))}
        </select>

        {condition.operator === 'between' && (
          <>
            <input
              value={condition.value}
              onChange={event => onUpdateCondition(groupId, condition.id, { value: event.target.value })}
              placeholder="min"
              className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              value={condition.secondaryValue}
              onChange={event => onUpdateCondition(groupId, condition.id, { secondaryValue: event.target.value })}
              placeholder="max"
              className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200"
            />
          </>
        )}

        {(condition.operator === 'gt' ||
          condition.operator === 'gte' ||
          condition.operator === 'lt' ||
          condition.operator === 'lte' ||
          condition.operator === 'contains' ||
          condition.operator === 'not_contains') && (
          <input
            value={condition.value}
            onChange={event => onUpdateCondition(groupId, condition.id, { value: event.target.value })}
            placeholder={meta.kind === 'numeric' ? 'value' : 'text'}
            className="min-w-[180px] rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200"
          />
        )}
      </div>

      {usesOptions && (
        <div className="mt-3 space-y-2">
          {meta.options.length > 8 && (
            <input
              value={search}
              onChange={event => onSearchChange(event.target.value)}
              placeholder="Search code or label..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200"
            />
          )}
          <div className="max-h-36 overflow-auto rounded-xl border border-blue-100 bg-blue-50/40 p-2">
            <div className="flex flex-wrap gap-2">
              {filteredOptions.map(option => {
                const active = condition.values.includes(option.key)
                return (
                  <button
                    key={option.key}
                    onClick={() => {
                      const nextValues = active
                        ? condition.values.filter(value => value !== option.key)
                        : [...condition.values, option.key]
                      onUpdateCondition(groupId, condition.id, { values: nextValues })
                    }}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      active
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-blue-200 bg-white text-slate-700 hover:border-blue-300'
                    }`}
                    title={option.key}
                  >
                    {option.label}
                  </button>
                )
              })}
              {filteredOptions.length === 0 && (
                <div className="px-2 py-1 text-[11px] text-gray-400">No matching values</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const FilterCanvas = memo(function FilterCanvas({
  table,
  batchEditCount = 1,
  isQuickTarget = false,
  getVarLabel,
  getVarTone,
  getFilterFieldMeta,
  onActivateQuickTarget,
  onUpdateDescription,
  onUpdateRootJoin,
  onAddGroup,
  onClear,
  onDropVariable,
  onUpdateGroupJoin,
  onRemoveGroup,
  onUpdateCondition,
  onRemoveCondition,
  onGenerate,
  canRun,
}: FilterCanvasProps) {
  const [searchByCondition, setSearchByCondition] = useState<Record<string, string>>({})

  return (
    <div className="flex w-full max-w-5xl flex-col gap-5 mx-auto">
      <div className="flex items-center gap-3">
        <span className="whitespace-nowrap text-xs font-medium text-gray-500">Filter Description</span>
        <input
          value={table.filter.description}
          onChange={event => onUpdateDescription(event.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Describe this filter..."
        />
        {batchEditCount > 1 && (
          <span className="whitespace-nowrap rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
            Editing {batchEditCount} tables
          </span>
        )}
      </div>

      <div
        onClick={onActivateQuickTarget}
        className={`rounded-2xl border-2 bg-white p-5 shadow-sm transition-colors ${isQuickTarget ? 'border-blue-500 bg-blue-50/40 shadow-[0_0_0_3px_rgba(59,130,246,0.08)]' : 'border-[#4472C4]'}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 ring-1 ring-blue-100">
              <Filter className="h-4 w-4 text-[#1F4E78]" />
              <span className="text-xs font-semibold text-[#1F4E78]">Between Groups</span>
            </div>
            {isQuickTarget && (
              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                Quick Add
              </span>
            )}
            <JoinToggle value={table.filter.rootJoin} onChange={onUpdateRootJoin} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onAddGroup}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Group
            </button>
            <button
              onClick={onClear}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          In the same group, conditions are joined with AND or OR. Between groups, the top toggle controls the final logic.
        </p>

        <div className="mt-5 space-y-4">
          {table.filter.groups.length === 0 ? (
            <div
              onDragOver={event => {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
              }}
              onDrop={event => {
                event.preventDefault()
                event.stopPropagation()
                onDropVariable(undefined, parseFolderVarListDrag(event))
              }}
              className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 px-6 text-center"
            >
              <div className="space-y-2">
                <div className="mx-auto inline-flex rounded-2xl bg-white p-3 text-blue-600 shadow-sm ring-1 ring-blue-100">
                  <Filter className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Drop a variable here to start filtering</p>
                <p className="text-xs text-gray-500">A new filter group will be created automatically.</p>
              </div>
            </div>
          ) : (
            table.filter.groups.map((group, index) => (
              <Fragment key={group.id}>
                {index > 0 && <LogicBadge join={table.filter.rootJoin} label="between groups" />}
                <div
                  onDragOver={event => {
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                  }}
                  onDrop={event => {
                    event.preventDefault()
                    event.stopPropagation()
                    onDropVariable(group.id, parseFolderVarListDrag(event))
                  }}
                  className="rounded-2xl border border-blue-200 bg-gradient-to-br from-white to-blue-50/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1F4E78] ring-1 ring-blue-100">
                        Group {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Between conditions</span>
                        <JoinToggle value={group.join} onChange={value => onUpdateGroupJoin(group.id, value)} compact />
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveGroup(group.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Group
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {group.conditions.map((condition, conditionIndex) => {
                      const meta = getFilterFieldMeta(condition.variableName)
                      return (
                        <Fragment key={condition.id}>
                          {conditionIndex > 0 && <LogicBadge join={group.join} label="between conditions" />}
                          <ConditionEditor
                            groupId={group.id}
                            condition={condition}
                            meta={meta}
                            getVarLabel={getVarLabel}
                            getVarTone={getVarTone}
                            search={searchByCondition[condition.id] ?? ''}
                            onSearchChange={value => setSearchByCondition(prev => ({ ...prev, [condition.id]: value }))}
                            onUpdateCondition={onUpdateCondition}
                            onRemoveCondition={onRemoveCondition}
                          />
                        </Fragment>
                      )
                    })}
                    <div className="rounded-xl border border-dashed border-blue-200 bg-white/70 px-4 py-3 text-center text-xs text-gray-500">
                      Drop another variable here to add more conditions joined by {JOIN_LABELS[group.join]}
                    </div>
                  </div>
                </div>
              </Fragment>
            ))
          )}
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={!canRun}
        title={!canRun ? 'Add variables to Top or Side in the Design tab first' : undefined}
        className="w-full rounded-xl bg-[#1F4E78] py-2.5 text-sm font-bold text-white shadow transition-colors hover:bg-[#16375a] disabled:cursor-not-allowed disabled:bg-gray-200"
      >
        Run Table
      </button>
    </div>
  )
})
