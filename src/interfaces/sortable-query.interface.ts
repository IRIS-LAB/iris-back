import { SortDirection } from './sort-direction.interface'

export type SortableQuery = Array<{
  field: string
  direction: SortDirection
}>
