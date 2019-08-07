import { ArgumentMetadata, Query } from '@nestjs/common'
import { BusinessException, ErrorDO, IrisException, TechnicalException } from '@u-iris/iris-common'
import { getErrorProvider } from '../modules/iris-module'

export interface QueryConverterParam {
  key: string
  required?: boolean
}

export function QueryConverter<T>(transform: (value: string, key: string, metadata: ArgumentMetadata) => T) {
  return (datas: string | QueryConverterParam): ParameterDecorator => {
    const param: QueryConverterParam = typeof datas === 'string' ? { key: datas } : datas
    return getQueryParam(param, transform)
  }
}

export function getQueryParam<T>(param: QueryConverterParam, transform: (value: string, key: string, metadata: ArgumentMetadata) => T) {
  return Query(param.key, {
    transform(value: string, metadata: ArgumentMetadata): T {
      if (typeof value !== 'undefined') {
        try {
          return transform(value, param.key, metadata)
        } catch (e) {
          if (e instanceof IrisException) {
            throw new BusinessException(new ErrorDO(param.key, e.errors[0].code, e.errors[0].label, {path: [param.key], value: e.errors[0].value, limit: e.errors[0].limit}))
          }
          throw new TechnicalException(new ErrorDO(param.key, 'parameter.invalid', e.message, {path: [param.key], value}), e)
        }
      } else if (param.required) {
        throw getErrorProvider().createBusinessException(param.key, 'parameter.required', { path: [param.key], value })
      }
      return value
    }
  })

}
