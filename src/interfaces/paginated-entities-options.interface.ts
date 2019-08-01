import { EntityFilterQuery } from './filter-query.interface'
import { PaginatedResourcesOptions } from './paginated-resources-options.interface'

export interface PaginatedEntitiesOptions<T extends EntityFilterQuery> extends PaginatedResourcesOptions {
  filters: T
}
