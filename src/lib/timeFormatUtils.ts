export function formatBatchDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes <= 0) return `${seconds} sec`
  return `${minutes} min ${seconds} sec`
}

export function formatLiveBatchDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000 / 5) * 5)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds - minutes * 60

  if (minutes <= 0) return `${seconds} sec`
  return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} sec`
}
