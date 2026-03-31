import type { CrosstabResult } from '../lib/crosstabEngine'

export type PercentType = 'row' | 'column' | 'total'
export type FilterJoin = 'all' | 'any'
export type FilterOperator =
  | 'in'
  | 'not_in'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'contains'
  | 'not_contains'
  | 'is_blank'
  | 'not_blank'

export interface GlobalSettings {
  showCount: boolean
  showPercent: boolean
  percentType: PercentType
  hideZeroRows: boolean
}

export interface TableFilterCondition {
  id: string
  variableName: string
  operator: FilterOperator
  values: string[]
  value: string
  secondaryValue: string
}

export interface TableFilterGroup {
  id: string
  join: FilterJoin
  conditions: TableFilterCondition[]
}

export interface TableFilterSpec {
  description: string
  rootJoin: FilterJoin
  groups: TableFilterGroup[]
}

export interface TableDef {
  id: string
  name: string
  rowVar: string | null
  colVar: string | null
  result: CrosstabResult | null
  folderId: string | null
  filter: TableFilterSpec
}

export interface FolderDef {
  id: string
  name: string
  expanded: boolean
}
