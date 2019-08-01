import { createParamDecorator } from '@nestjs/common'
import { EntityOptions } from '../interfaces'
import { EntityOptionsFactory } from '../modules/iris-module/commons'

export const EntityOptionsQueryParam = createParamDecorator((data, req): EntityOptions => {
  return EntityOptionsFactory.build(req)
})
