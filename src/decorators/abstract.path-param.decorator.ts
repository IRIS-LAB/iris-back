import { PipeTransform, Type } from '@nestjs/common'
import { BusinessException, ErrorDO, IrisException, TechnicalException } from '@u-iris/iris-common'
import { PathParam } from './path-param.decorator'


export function getPathParam<T>(propertyKey: string, transform: (value: string, key: string) => T, ...pipes: Array<Type<PipeTransform> | PipeTransform>) {
  return PathParam(propertyKey, {
    transform(value: string): T {
      if (typeof value !== 'undefined') {
        try {
          return transform(value, propertyKey)
        } catch (e) {
          if (e instanceof IrisException) {
            throw new BusinessException(new ErrorDO(propertyKey, e.errors[0].code, e.errors[0].label, {path: [propertyKey], value: e.errors[0].value, limit: e.errors[0].limit}))
          }
          throw new TechnicalException(new ErrorDO(propertyKey, 'parameter.invalid', e.message, {path: [propertyKey], value}), e)
        }
      }
      return value
    },
  }, ...pipes)

}
