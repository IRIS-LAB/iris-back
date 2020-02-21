import { getErrorService } from '../modules/iris-module'
import { getQueryParam, QueryConverterParam } from './abstract.query-param.decorator'

export const EnumQueryParam = <T>(datas: { type: T } & QueryConverterParam): ParameterDecorator => {
  return getQueryParam(datas, (value: string, key: string) => {
    const enumKeyFound = Object.keys(datas.type).find(t => datas.type[t].toString() === value)
    if (enumKeyFound === undefined) {
      throw getErrorService().createBusinessException(key, 'parameter.type.invalid', { value })
    }
    return datas.type[enumKeyFound]
  })

}
