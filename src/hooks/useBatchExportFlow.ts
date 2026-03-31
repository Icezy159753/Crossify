import { useCallback, useEffect, useState } from 'react'

export interface BatchExportSummary {
  successCount: number
  skippedCount: number
  elapsedMs: number
}

export function useBatchExportFlow() {
  const [batchExporting, setBatchExporting] = useState(false)
  const [batchExportStartedAt, setBatchExportStartedAt] = useState<number | null>(null)
  const [batchElapsedMs, setBatchElapsedMs] = useState(0)
  const [batchExportSummary, setBatchExportSummary] = useState<BatchExportSummary | null>(null)

  useEffect(() => {
    if (!batchExporting || batchExportStartedAt === null) return

    let frameId = 0
    const update = () => {
      setBatchElapsedMs(Math.max(0, Date.now() - batchExportStartedAt))
      frameId = window.requestAnimationFrame(update)
    }
    update()

    return () => window.cancelAnimationFrame(frameId)
  }, [batchExporting, batchExportStartedAt])

  const beginBatchExport = useCallback((startedAt = Date.now()) => {
    setBatchExporting(true)
    setBatchExportStartedAt(startedAt)
    setBatchElapsedMs(0)
    setBatchExportSummary(null)
    return startedAt
  }, [])

  const completeBatchExport = useCallback((summary: BatchExportSummary) => {
    setBatchElapsedMs(summary.elapsedMs)
    setBatchExportSummary(summary)
  }, [])

  const endBatchExportSession = useCallback(() => {
    setBatchExportStartedAt(null)
    setBatchExporting(false)
  }, [])

  const dismissBatchExportSummary = useCallback(() => {
    setBatchExportSummary(null)
  }, [])

  return {
    batchExporting,
    batchElapsedMs,
    batchExportSummary,
    beginBatchExport,
    completeBatchExport,
    endBatchExportSession,
    dismissBatchExportSummary,
  }
}
