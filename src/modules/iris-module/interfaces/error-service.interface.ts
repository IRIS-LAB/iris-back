import { BusinessException, EntityNotFoundBusinessException, TechnicalException } from '@u-iris/iris-common'
import { ErrorServiceOptions } from './error-service-options.interface'

export interface ErrorService {
  createBusinessException(options: ErrorServiceOptions): BusinessException;

  createBusinessException(field: string, code: string, datas?: object): BusinessException;

  createSecurityException(options: ErrorServiceOptions): BusinessException;

  createSecurityException(field: string, code: string, datas?: object): BusinessException;

  createEntityNotFoundBusinessException(field: string, value?: any, code?: string, datas?: object): EntityNotFoundBusinessException;

  createEntityNotFoundBusinessException(options: ErrorServiceOptions & { value?: any }): EntityNotFoundBusinessException;

  createTechnicalException(field: string, code: string, e: Error, datas?: object): TechnicalException;

  createTechnicalException(options: ErrorServiceOptions, e: Error): TechnicalException;

}