import { PipeTransform, Type } from '@nestjs/common'
import { TypeUtils } from '../utils'
import { getPathParam } from './abstract.path-param.decorator'

export const DatePathParam = (property: string, ...pipes: Array<Type<PipeTransform> | PipeTransform>) => {
  return getPathParam(property, (value: string, key: string) => TypeUtils.convertToType(TypeUtils.TYPE.DATE, value), ...pipes)
}
