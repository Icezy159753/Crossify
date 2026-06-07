export function normalizeColumnPaths(colValues: string[], colPaths?: string[][]): string[][] {
  return colValues.map((value, index) => {
    const path = colPaths?.[index]
    return path && path.length > 0 ? path.slice() : [value]
  })
}
