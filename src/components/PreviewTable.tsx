import { Fragment, useState, useEffect, useRef } from 'react'
import { ClipboardCopy, Check } from 'lucide-react'
import type { CrosstabResult, CrosstabConfig } from '../lib/crosstabEngine'
import { getPct, filterZeroRows } from '../lib/crosstabEngine'

interface Props {
  result: CrosstabResult
  config: CrosstabConfig
}

function fmt(n: number, pct: number, showCount: boolean, showPercent: boolean) {
  if (n === 0) return <span className="text-gray-300">-</span>
  const ns = showCount ? n : null
  const ps = showPercent ? `${(pct * 100).toFixed(1)}` : null
  if (ns !== null && ps !== null) return <>{ns}<br /><span className="text-gray-500 text-[10px]">({ps})</span></>
  if (ns !== null) return <>{ns}</>
  if (ps !== null) return <>{ps}</>
  return <>-</>
}

function fmtMean(value: number) {
  if (!Number.isFinite(value) || value === 0) return <span className="text-gray-300">-</span>
  return <span>{value.toFixed(2)}</span>
}

function buildHeaderGroups(paths: string[][], levels: number) {
  return Array.from({ length: levels }, (_, level) => {
    const groups: Array<{ label: string; span: number }> = []
    let currentKey = ''

    paths.forEach(path => {
      const key = path.slice(0, level + 1).join('\u0001')
      const label = path[level] ?? ''
      if (groups.length === 0 || key !== currentKey) {
        groups.push({ label, span: 1 })
        currentKey = key
      } else {
        groups[groups.length - 1].span += 1
      }
    })

    return groups
  })
}

function buildRowDisplayPaths(paths: string[][]) {
  return paths.map((path, rowIndex) =>
    path.map((segment, level) => {
      if (rowIndex === 0) return segment
      const previous = paths[rowIndex - 1] ?? []
      const samePrefix = path.slice(0, level + 1).every((value, idx) => value === previous[idx])
      return samePrefix ? '' : segment
    })
  )
}

function buildRowSectionMeta(sectionBases: Array<{ startIndex: number; label: string }>, totalRows: number) {
  const byStart = new Map<number, { label: string; span: number }>()
  const covered = new Set<number>()

  sectionBases.forEach((section, index) => {
    const end = (sectionBases[index + 1]?.startIndex ?? totalRows) - 1
    byStart.set(section.startIndex, { label: section.label, span: end - section.startIndex + 1 })
    for (let row = section.startIndex + 1; row <= end; row++) covered.add(row)
  })

  return { byStart, covered }
}

function normalizeRowStructure(
  result: CrosstabResult,
  rowPaths: string[][],
  rowLevelLabels: string[],
  rowSectionBases: Array<{ startIndex: number; label: string; totalN: number; colTotalsN: number[] }>,
) {
  if (rowSectionBases.length === 0 && rowLevelLabels.length === 1) {
    return {
      rowPaths: rowPaths.map(path => [result.rowLabel, path[0] ?? '']),
      rowLevelLabels: ['Variable', 'Category'],
      rowSectionBases: [{
        startIndex: 0,
        label: result.rowLabel,
        totalN: result.grandTotal,
        colTotalsN: result.colTotalsN,
      }],
    }
  }

  return { rowPaths, rowLevelLabels, rowSectionBases }
}

export function PreviewTable({ result, config }: Props) {
  const displayResult = filterZeroRows(result, config.hideZeroRows ?? false)
  const { rowValues, colValues, counts, rowTotalsN, colTotalsN, grandTotal } = displayResult
  const { showCount, showPercent, percentType } = config
  const hideTotal = config.hideTotal ?? false

  const rawRowPaths = displayResult.rowPaths ?? rowValues.map(value => [value])
  const colPaths = displayResult.colPaths ?? colValues.map(value => [value])
  const rawRowLevelLabels = displayResult.rowLevelLabels ?? [displayResult.rowLabel]
  const colLevelLabels = displayResult.colLevelLabels ?? [displayResult.colLabel]
  const normalizedRows = normalizeRowStructure(displayResult, rawRowPaths, rawRowLevelLabels, displayResult.rowSectionBases ?? [])
  const rowPaths = normalizedRows.rowPaths
  const rowLevelLabels = normalizedRows.rowLevelLabels
  const rowTypes = displayResult.rowTypes ?? rowValues.map(() => 'data')
  const rowDisplayPaths = buildRowDisplayPaths(rowPaths)
  const colHeaderGroups = buildHeaderGroups(colPaths, colLevelLabels.length)
  const rowSectionBases = normalizedRows.rowSectionBases
  const rowSectionMeta = buildRowSectionMeta(rowSectionBases, rowValues.length)
  const rowLabelWidthClass = rowLevelLabels.length > 1 ? 'w-[136px] min-w-[136px] max-w-[136px]' : 'w-[176px] min-w-[176px] max-w-[176px]'
  const categoryWidthClass = 'w-[188px] min-w-[188px] max-w-[188px]'
  const metricWidthClass = 'w-[82px] min-w-[82px] max-w-[82px]'

  const [copied, setCopied] = useState(false)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const totalPct = (n: number) => grandTotal > 0 ? n / grandTotal : 0

  function renderBaseRow(totalN: number, baseColTotalsN: number[], key: string) {
    return (
      <tr key={key} className="bg-[#D9E1F2] font-bold">
        <td
          colSpan={Math.max(1, rowLevelLabels.length)}
          className="px-2 py-1.5 text-gray-800 border border-[#BDD7EE]"
        >
          Base
        </td>
        {!hideTotal && (
          <td className="px-2 py-1.5 text-center text-gray-800 border border-[#BDD7EE] tabular-nums">
            {totalN === 0 ? <span className="text-gray-300">-</span> : totalN}
          </td>
        )}
        {baseColTotalsN.map((cn, ci) => (
          <td key={ci} className="px-2 py-1.5 text-center text-gray-800 border border-[#BDD7EE] tabular-nums">
            {cn === 0 ? <span className="text-gray-300">-</span> : cn}
          </td>
        ))}
      </tr>
    )
  }

  function buildTSV(): string {
    const header = [...rowLevelLabels, ...(hideTotal ? [] : ['Total']), ...colPaths.map(path => path.join(' / '))].join('\t')
    const baseRow = [
      'Base',
      ...Array.from({ length: Math.max(0, rowLevelLabels.length - 1) }, () => ''),
      ...(hideTotal ? [] : [String(grandTotal)]),
      ...colTotalsN.map(cn => cn === 0 ? '-' : String(cn)),
    ].join('\t')
    const dataRows = rowValues.map((_, ri) => [
      ...rowPaths[ri],
      rowTypes[ri] === 'stat'
        ? (Number.isFinite(rowTotalsN[ri]) ? rowTotalsN[ri].toFixed(2) : '-')
        : rowTotalsN[ri] === 0 ? '-' : String(rowTotalsN[ri]),
      ...colValues.map((__, ci) => rowTypes[ri] === 'stat'
        ? (Number.isFinite(counts[ri][ci]) && counts[ri][ci] !== 0 ? counts[ri][ci].toFixed(2) : '-')
        : counts[ri][ci] === 0 ? '-' : String(counts[ri][ci])),
    ].join('\t'))
    return [header, baseRow, ...dataRows].join('\n')
  }

  async function doCopy() {
    await navigator.clipboard.writeText(buildTSV())
    setCopied(true)
    setCtxMenu(null)
    setTimeout(() => setCopied(false), 1800)
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    setCtxMenu({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    if (!ctxMenu) return
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setCtxMenu(null)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [ctxMenu])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-end">
        <button
          onClick={doCopy}
          title="Copy table as TSV (paste to Excel)"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-md shadow-sm text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          {copied
            ? <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600 font-semibold">Copied!</span></>
            : <><ClipboardCopy className="w-3.5 h-3.5" />Copy Table</>
          }
        </button>
      </div>

      <div
        className="overflow-auto rounded-lg border border-gray-200 text-[11px] select-none max-h-[72vh]"
        onContextMenu={handleContextMenu}
      >
        <table className="border-collapse table-fixed min-w-[760px]">
          <colgroup>
            {rowLevelLabels.map((_, idx) => (
              <col key={`row-col-${idx}`} className={idx === 0 ? rowLabelWidthClass : categoryWidthClass} />
            ))}
            {!hideTotal && <col className={metricWidthClass} />}
            {colValues.map((_, idx) => (
              <col key={`data-col-${idx}`} className={metricWidthClass} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th
                colSpan={Math.max(1, rowLevelLabels.length)}
                rowSpan={colHeaderGroups.length + 1}
                className="border-0 bg-transparent p-0"
              />
              {!hideTotal && (
                <th className="bg-[#1F4E78] text-white px-2 py-1.5 text-center border border-[#BDD7EE] font-bold whitespace-nowrap">
                  Total
                </th>
              )}
              <th
                colSpan={colValues.length}
                className="bg-[#1F4E78] text-white px-2 py-1.5 text-center border border-[#BDD7EE] font-bold"
              >
                <div className="mx-auto max-w-[420px] overflow-hidden text-ellipsis whitespace-nowrap" title={displayResult.colLabel}>
                  {displayResult.colLabel}
                </div>
              </th>
            </tr>
            {colHeaderGroups.map((groups, level) => (
              <tr key={colLevelLabels[level] ?? level}>
                {!hideTotal && (level === colHeaderGroups.length - 1 ? (
                  <th className="bg-[#2E75B6] border border-[#BDD7EE] px-2 py-1.5 text-white text-center text-[10px] font-normal opacity-70">
                    n={grandTotal.toLocaleString()}
                  </th>
                ) : (
                  <th className="bg-[#2E75B6] border border-[#BDD7EE]" />
                ))}
                {groups.map((group, idx) => (
                  <th
                    key={`${level}-${idx}-${group.label}`}
                    colSpan={group.span}
                    className="bg-[#2E75B6] text-white px-3 py-1.5 text-center border border-[#BDD7EE] font-semibold"
                  >
                    <div className="mx-auto max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap" title={group.label}>
                      {group.label}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rowSectionBases.length === 0 && renderBaseRow(grandTotal, colTotalsN, 'base-global')}

            {rowValues.map((rv, ri) => {
              const sectionBase = rowSectionBases.find(section => section.startIndex === ri)
              const isMeanRow = rowTypes[ri] === 'stat'
              const isNetRow = rowTypes[ri] === 'net'
              const isSummaryRow = rowTypes[ri] === 'summary'
              return (
                <Fragment key={rv}>
                  {sectionBase && renderBaseRow(sectionBase.totalN, sectionBase.colTotalsN, `base-${ri}`)}
                  <tr className={isMeanRow ? 'bg-red-50' : isSummaryRow ? 'bg-amber-50' : isNetRow ? 'bg-emerald-50' : ri % 2 === 0 ? 'bg-white' : 'bg-[#EBF3FB]'}>
                  {rowSectionBases.length > 0 ? (
                    <>
                      {rowSectionMeta.byStart.get(ri) && (
                        <td
                          rowSpan={rowSectionMeta.byStart.get(ri)!.span}
                          className={`px-2 py-1.5 border border-[#BDD7EE] text-gray-800 align-middle bg-white break-words whitespace-normal ${isNetRow ? 'text-emerald-800 font-semibold' : isSummaryRow ? 'text-amber-900 font-semibold' : ''}`}
                        >
                          {rowSectionMeta.byStart.get(ri)!.label}
                        </td>
                      )}
                      {!rowSectionMeta.covered.has(ri) && rowDisplayPaths[ri].slice(1).map((segment, level) => (
                        <td
                          key={`${rv}-${level + 1}`}
                          className={`px-2 py-1.5 border border-[#BDD7EE] break-words whitespace-normal ${level === rowDisplayPaths[ri].slice(1).length - 1 ? 'font-medium text-gray-800' : 'text-gray-600'} ${isNetRow ? 'text-emerald-800 font-semibold' : isSummaryRow ? 'text-amber-900 font-semibold' : ''}`}
                        >
                          {segment || <span className="text-transparent">.</span>}
                        </td>
                      ))}
                      {rowSectionMeta.covered.has(ri) && rowDisplayPaths[ri].slice(1).map((segment, level) => (
                        <td
                          key={`${rv}-${level + 1}`}
                          className={`px-2 py-1.5 border border-[#BDD7EE] break-words whitespace-normal ${level === rowDisplayPaths[ri].slice(1).length - 1 ? 'font-medium text-gray-800' : 'text-gray-600'} ${isNetRow ? 'text-emerald-800 font-semibold' : isSummaryRow ? 'text-amber-900 font-semibold' : ''}`}
                        >
                          {segment || <span className="text-transparent">.</span>}
                        </td>
                      ))}
                    </>
                  ) : rowDisplayPaths[ri].map((segment, level) => (
                    <td
                      key={`${rv}-${level}`}
                      className={`px-2 py-1.5 border border-[#BDD7EE] break-words whitespace-normal ${level === rowDisplayPaths[ri].length - 1 ? 'font-medium text-gray-800' : 'text-gray-600'} ${isNetRow ? 'text-emerald-800 font-semibold' : isSummaryRow ? 'text-amber-900 font-semibold' : ''}`}
                    >
                      {segment || <span className="text-transparent">.</span>}
                    </td>
                  ))}
                  {!hideTotal && (
                    <td className={`px-2 py-1.5 text-center font-semibold border border-[#BDD7EE] tabular-nums ${isMeanRow ? 'bg-red-100 text-red-700' : isNetRow ? 'bg-emerald-100 text-emerald-800' : 'text-gray-800 bg-[#D6E4F0]'}`}>
                      {isMeanRow
                        ? fmtMean(rowTotalsN[ri])
                        : fmt(rowTotalsN[ri], totalPct(rowTotalsN[ri]), showCount, showPercent)}
                    </td>
                  )}
                  {colValues.map((_, ci) => {
                    const n = counts[ri][ci]
                    const pct = getPct(n, ri, ci, displayResult, percentType)
                    return (
                      <td key={ci} className={`px-2 py-1.5 text-center border border-[#BDD7EE] tabular-nums ${isMeanRow ? 'text-red-700 bg-red-50 font-semibold' : isNetRow ? 'text-emerald-800 bg-emerald-50 font-semibold' : 'text-gray-700'}`}>
                        {isMeanRow ? fmtMean(n) : fmt(n, pct, showCount, showPercent)}
                      </td>
                    )
                  })}
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {ctxMenu && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: ctxMenu.y, left: ctxMenu.x, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[160px] text-sm"
        >
          <button
            onClick={doCopy}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors text-gray-700"
          >
            <ClipboardCopy className="w-4 h-4 flex-shrink-0" />
            <span>Copy Table</span>
            <span className="ml-auto text-[10px] text-gray-400">TSV</span>
          </button>
        </div>
      )}
    </div>
  )
}
