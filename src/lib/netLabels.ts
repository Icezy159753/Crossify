export function getNetPrefix(depth: number): string {
  if (depth <= 0) return 'Net : '
  return `${'Sub'.repeat(depth)}net : `
}

export function stripNetPrefix(name: string | null | undefined): string {
  return String(name || 'Net').replace(/^(?:Sub)*net\s*:\s*/i, '').trim()
}

export function buildNetLabel(depth: number, name: string | null | undefined): string {
  const clean = stripNetPrefix(name)
  return `${getNetPrefix(depth)}${clean || 'Net'}`
}
