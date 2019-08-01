import { PipeTransform, Type } from '@nestjs/common'
import { BusinessException, ErreurDO, IrisException, TechnicalException } from '@u-iris/iris-common'
import { PathParam } from './path-param.decorator'


export function getPathParam<T>(propertyKey: string, transform: (value: string, key: string) => T, ...pipes: Array<Type<PipeTransform> | PipeTransform>) {
  return PathParam(propertyKey, {
    transform(value: string): T {
      if (typeof value !== 'undefined') {
        try {
          return transform(value, propertyKey)
        } catch (e) {
          if (e instanceof IrisException) {
            throw new BusinessException(new ErreurDO(propertyKey, e.erreurs[0].codeErreur, e.erreurs[0].libelleErreur))
          }
          throw new TechnicalException(new ErreurDO(propertyKey, 'parameter.invalid', e.message), e)
        }
      }
      return value
    },
  }, ...pipes)

}
