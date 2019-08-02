import { Injectable } from '@nestjs/common'
import {
  BusinessException,
  EntityNotFoundBusinessException,
  ErreurDO,
  IrisException,
  SecurityException,
  TechnicalException
} from '@u-iris/iris-common'
import { MessageProvider } from './message.provider'

@Injectable()
export class ErrorProvider {
  constructor(private readonly messageProvider: MessageProvider) {

  }

  public createBusinessException(field: string, code: string, datas?: object): BusinessException {
    return this.createIrisException(BusinessException, field, code, datas)
  }

  public createSecurityException(field: string, code: string, datas?: object): SecurityException {
    return this.createIrisException(SecurityException, field, code, datas)
  }

  public createEntityNotFoundBusinessException(field: string, id: any, code: string = 'entity.not.found', datas?: object): EntityNotFoundBusinessException {
    return this.createIrisException(EntityNotFoundBusinessException, field, code, { id, ...datas })
  }

  public createTechnicalException(field: string, code: string, e: Error, datas?: object): TechnicalException {
    datas = { field, ...datas }
    return new TechnicalException(new ErreurDO(field, code, this.messageProvider.has(`${code}.${field}`) ? this.messageProvider.get(`${code}.${field}`, datas) : this.messageProvider.get(code, datas)), e)
  }

  private createIrisException<T extends IrisException>(exceptionClass: new(erreurs: ErreurDO[] | ErreurDO) => T, field: string, code: string, datas?: object): T {
    datas = { field, ...datas }
    return new exceptionClass(new ErreurDO(field, code, this.messageProvider.has(`${code}.${field}`) ? this.messageProvider.get(`${code}.${field}`, datas) : this.messageProvider.get(code, datas)))
  }
}
