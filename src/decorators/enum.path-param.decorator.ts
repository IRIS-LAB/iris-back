import { PipeTransform, Type } from '@nestjs/common'
import { getErrorService } from '../modules/iris-module'
import { getPathParam } from './abstract.path-param.decorator'

export const EnumPathParam = <T>(datas: { key: string, type: T }, ...pipes: Array<Type<PipeTransform> | PipeTransform>): ParameterDecorator => {
  return getPathParam(datas.key, (value: string, key: string) => {
    const enumKeyFound = Object.keys(datas.type).find(t => datas.type[t].toString() === value)
    if (enumKeyFound === undefined) {
      throw getErrorService().createBusinessException(key, 'parameter.type.invalid', { value })
    }
    return datas.type[enumKeyFound]
  })

}
