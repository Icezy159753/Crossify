/** Payload: JSON string[] — variables dragged from the catalog (multi-select). */
export const FOLDER_VAR_LIST_MIME = 'application/x-crossify-var-list'

/** Also embedded in text/plain so drop works when the runtime only exposes text/plain (e.g. some WebViews). */
export const FOLDER_VAR_TEXT_PREFIX = 'crossify-vars:'

function parseFolderVarListJson(raw: string): string[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    const names = parsed.filter((x): x is string => typeof x === 'string' && x.length > 0)
    return names.length > 0 ? names : null
  } catch {
    return null
  }
}

export function parseFolderVarListDrag(event: { dataTransfer: DataTransfer }): string[] | null {
  const mime = event.dataTransfer.getData(FOLDER_VAR_LIST_MIME)
  const plain = event.dataTransfer.getData('text/plain')
  if (mime) {
    const fromMime = parseFolderVarListJson(mime)
    if (fromMime) return fromMime
  }
  if (plain.startsWith(FOLDER_VAR_TEXT_PREFIX)) {
    return parseFolderVarListJson(plain.slice(FOLDER_VAR_TEXT_PREFIX.length))
  }
  return null
}
