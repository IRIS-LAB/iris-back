import { createParamDecorator } from '@nestjs/common'
import { PaginatedResourcesOptions } from '../interfaces'
import { PaginatedEntitiesOptionsFactory } from '../modules/iris-module/commons'

export const PaginatedResourcesQueryParam = createParamDecorator((data, req): PaginatedResourcesOptions => {
  return PaginatedEntitiesOptionsFactory.build(req)
})
