import { EntityOptions } from './entity-options.interface'
import { PaginationOptions } from './pagination-options.interface'
import { SortableQuery } from './sortable-query.interface'

export interface PaginatedResourcesOptions extends EntityOptions {
  paginate: PaginationOptions
  sort: SortableQuery
}
