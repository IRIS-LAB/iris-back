import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { IRIS_CONFIG_OPTIONS } from '../../../constants'
import { IrisConfigOptions } from '../../config-module/config-holder'
import { ClsService, LoggerService } from '../services'

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService, private readonly clsService: ClsService, @Inject(IRIS_CONFIG_OPTIONS) private irisConfigOptions: IrisConfigOptions) {

  }

  public use(request: any, res: any, next: () => void): any {

    this.clsService.bindEmitter(request)
    this.clsService.bindEmitter(res)
    return this.clsService.runPromise(async () => {
      // Save traceId from header
      if (this.irisConfigOptions.traceIdHeader && request.headers && request.headers[this.irisConfigOptions.traceIdHeader.toLowerCase()]) {
        const headerFound = request.headers[this.irisConfigOptions.traceIdHeader.toLowerCase()]
        this.loggerService.setTraceId(Array.isArray(headerFound) ? (headerFound! as string[]).find(t => t !== undefined) as string : headerFound as string)
      }
      if (request.headers && request.headers.authorization) {
        this.clsService.setAuthorizationToken(request.headers.authorization)
      }
      next()
    })

  }

}