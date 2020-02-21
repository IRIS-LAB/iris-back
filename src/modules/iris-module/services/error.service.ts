import { Injectable } from '@nestjs/common'
import {
  BusinessException,
  EntityNotFoundBusinessException,
  ErrorDO,
  IrisException,
  SecurityException,
  TechnicalException,
} from '@u-iris/iris-common'
import { ErrorServiceOptions } from '../interfaces/error-service-options.interface'
import { MessageService } from './message.service'

@Injectable()
export class ErrorService {
  constructor(private readonly messageProvider: MessageService) {

  }

  private static mapArgsToOptions(fieldOrOptions: string | ErrorServiceOptions, code?: string, datas?: object, otherArgs?: any): ErrorServiceOptions {
    let options: { field?: string, code?: string, label?: string, datas?: object }
    if (typeof fieldOrOptions === 'object') {
      options = fieldOrOptions
    } else {
      options = {
        field: fieldOrOptions,
        code,
        datas,
      }
    }
    if (typeof options.code === 'undefined' && otherArgs && typeof otherArgs.code !== 'undefined') {
      options.code = otherArgs.code
    }
    return options
  }

  public createBusinessException(fieldOrOptions: string | ErrorServiceOptions, code?: string, datas?: object): BusinessException {
    return this.createIrisException(BusinessException, ErrorService.mapArgsToOptions(fieldOrOptions, code, datas))
  }

  public createSecurityException(fieldOrOptions: string | ErrorServiceOptions, code?: string, datas?: object): SecurityException {
    return this.createIrisException(SecurityException, ErrorService.mapArgsToOptions(fieldOrOptions, code, datas))
  }

  public createEntityNotFoundBusinessException(fieldOrOptions: string | (ErrorServiceOptions & { value?: any }), id?: any, code?: string, datas?: object): EntityNotFoundBusinessException {
    return this.createIrisException(EntityNotFoundBusinessException, ErrorService.mapArgsToOptions(fieldOrOptions, code, {...datas, id, value: id}, {
      code: 'entity.not.found',
      value: id,
    }))
  }

  public createTechnicalException(fieldOrOptions: string | ErrorServiceOptions, code: string | Error, e?: Error, datas?: object): TechnicalException {
    return new TechnicalException(this.getError(ErrorService.mapArgsToOptions(fieldOrOptions, code as string, datas)), typeof fieldOrOptions === 'string' ? e! : code as Error)
  }

  private createIrisException<T extends IrisException>(exceptionClass: new(erreurs: ErrorDO[] | ErrorDO) => T, options: { field?: string, code?: string, label?: string, datas?: object }): T {
    return new exceptionClass(this.getError(options))
  }

  private getError(options: ErrorServiceOptions): ErrorDO {
    const { value, path, limit } = options.datas ? options.datas! : {
      value: undefined,
      path: undefined,
      limit: undefined,
    }

    let label

    if (options.label) {
      label = options.label
    } else {
      const labelDatas = { field: options.field, code: options.code, ...options.datas }

      const labelKeys: Array<Array<string | undefined>> = [
        ['error', options.field, options.code, 'label'],
        ['error', options.field, options.code],
        [options.field, options.code],
        ['error', options.code, 'label'],
        ['error', options.code],
        [options.code],
      ]
      const key = labelKeys
        .map(keys => keys.filter(k => k !== undefined).join('.'))
        .find(k => this.messageProvider.has(k))

      if (key) {
        label = this.messageProvider.get(key, labelDatas)
      }
    }


    return new ErrorDO(options.field || '', options.code || '', label, { value, path, limit })
  }
}
