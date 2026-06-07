import { useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { TableDef } from '../types/workspace'

interface UseActiveTableSyncInput {
  activeTableId: string
  setActiveTableId: Dispatch<SetStateAction<string>>
  tables: TableDef[]
}

export function useActiveTableSync({
  activeTableId,
  setActiveTableId,
  tables,
}: UseActiveTableSyncInput) {
  useEffect(() => {
    if (!activeTableId && tables.length > 0) {
      setActiveTableId(tables[0].id)
    }
  }, [activeTableId, setActiveTableId, tables])
}
