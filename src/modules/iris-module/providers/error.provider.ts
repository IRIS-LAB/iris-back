import { Injectable } from '@nestjs/common'
import {
  BusinessException,
  EntityNotFoundBusinessException,
  ErrorDO,
  IrisException,
  SecurityException,
  TechnicalException,
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
    return this.createIrisException(EntityNotFoundBusinessException, field, code, { value: id, id, ...datas })
  }

  public createTechnicalException(field: string, code: string, e: Error, datas?: object): TechnicalException {
    return new TechnicalException(this.getError(field, code, datas), e)
  }

  private createIrisException<T extends IrisException>(exceptionClass: new(erreurs: ErrorDO[] | ErrorDO) => T, field: string, code: string, datas?: any): T {
    return new exceptionClass(this.getError(field, code, datas))
  }

  private getError(field: string, code: string, datas?: any): ErrorDO {
    const { value, path, limit } = datas ? datas : { value: undefined, path: undefined, limit: undefined }
    const messageDatas = { field, code, ...datas }
    const message = this.messageProvider.has(`${code}.${field}`) ? this.messageProvider.get(`${code}.${field}`, messageDatas) : this.messageProvider.get(code, messageDatas)
    return new ErrorDO(field, code, message, { value, path, limit })
  }
}
