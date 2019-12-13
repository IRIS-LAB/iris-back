import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { IRIS_CONFIG_OPTIONS } from '../../../constants'
import { IrisConfigOptions } from '../../config-module/config-holder'
import { ClsProvider, LoggerProvider } from '../providers'

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerProvider, private readonly clsManager: ClsProvider, @Inject(IRIS_CONFIG_OPTIONS) private irisConfigOptions: IrisConfigOptions) {

  }

  public use(request: any, res: any, next: () => void): any {

    this.clsManager.bindEmitter(request)
    this.clsManager.bindEmitter(res)
    return this.clsManager.runPromise(async () => {
      // Save traceId from header
      if (this.irisConfigOptions.traceIdHeader && request.headers && request.headers[this.irisConfigOptions.traceIdHeader.toLowerCase()]) {
        const headerFound = request.headers[this.irisConfigOptions.traceIdHeader.toLowerCase()]
        this.logger.setTraceId(Array.isArray(headerFound) ? (headerFound! as string[]).find(t => t !== undefined) as string : headerFound as string)
      }
      if (request.headers && request.headers.authorization) {
        this.clsManager.setAuthorizationToken(request.headers.authorization)
      }
      next()
    })

  }

}