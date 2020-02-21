import { createParamDecorator } from '@nestjs/common'
import { PaginatedEntitiesOptions } from '../interfaces'
import { PaginatedEntitiesOptionsFactory } from '../modules/iris-module/commons'

/**
 * @deprecated Use PaginatedEntitiesOptionsQueryParam instead
 */
export const PaginatedEntitiesQueryParam = createParamDecorator((data, req): PaginatedEntitiesOptions => {
  return PaginatedEntitiesOptionsFactory.build(req)
})

export const PaginatedEntitiesOptionsQueryParam = PaginatedEntitiesQueryParam
