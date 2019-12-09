import { Injectable, NestMiddleware } from '@nestjs/common'
import { irisModuleOptions } from '../config-holder'
import { ClsProvider, LoggerProvider } from '../providers'

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerProvider, private readonly clsManager: ClsProvider) {

  }

  public use(request: any, res: any, next: () => void): any {

    this.clsManager.bindEmitter(request)
    this.clsManager.bindEmitter(res)
    return this.clsManager.runPromise(async () => {
      // Save traceId from header
      if (irisModuleOptions.traceIdHeader && request.headers && request.headers[irisModuleOptions.traceIdHeader.toLowerCase()]) {
        const headerFound = request.headers[irisModuleOptions.traceIdHeader.toLowerCase()]
        this.logger.setTraceId(Array.isArray(headerFound) ? (headerFound! as string[]).find(t => t !== undefined) as string : headerFound as string)
      }
      if (request.headers && request.headers.authorization) {
        this.clsManager.setAuthorizationToken(request.headers.authorization)
      }
      next()
    })

  }

}