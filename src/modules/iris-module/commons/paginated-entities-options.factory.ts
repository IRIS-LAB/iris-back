import express from 'express'
import { PaginatedEntitiesOptions, SortDirection } from '../../../interfaces'
import { PaginationUtils } from '../../../utils'
import { getErrorProvider } from '../iris.context'
import { EntityOptionsFactory } from './entity-options.factory'

export class PaginatedEntitiesOptionsFactory {

  public static build(request: express.Request): PaginatedEntitiesOptions {
    let sort: Array<{ field: string, direction: SortDirection }> = []
    if (request.query.sort) {
      sort = []
      const sortStr = Array.isArray(request.query.sort) ? request.query.sort : [request.query.sort]
      for (const s of sortStr) {
        const sortParts = s.split(',')
        if (sortParts.length !== 2 || ['asc', 'desc'].indexOf(sortParts[1]) === -1) {
          throw getErrorProvider().createBusinessException('sort', 'parameter.format.invalid', { validFormat: 'field,asc|desc' })
        }
        sort.push({ field: sortParts[0], direction: sortParts[1] as SortDirection })
      }
    }

    return {
      paginate: PaginationUtils.getPaginationParams(request,
        request.__iris && request.__iris.maxSize ? request.__iris.maxSize : 100,
        request.__iris && request.__iris.defaultSize ? request.__iris.defaultSize : 20),
      sort,
      options: EntityOptionsFactory.getOptions(request),
    }
  }
}
