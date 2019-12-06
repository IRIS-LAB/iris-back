import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common'
import express from 'express'
import { Observable } from 'rxjs'
import { APP_AUTHENTICATION_SERVICE } from '../../../constants'
import { irisModuleOptions } from '../config-holder'
import { AuthenticationService } from '../interfaces'
import { ClsProvider, LoggerProvider } from '../providers'

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerProvider, private readonly clsManager: ClsProvider, @Inject(APP_AUTHENTICATION_SERVICE) private readonly authenticationProvider: AuthenticationService) {
  }

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    const request: express.Request = context.switchToHttp().getRequest()

    this.clsManager.bindEmitter(request)
    this.clsManager.bindEmitter(context.switchToHttp().getResponse())
    return this.clsManager.runPromise(async () => {
      // Save traceId from header
      if (irisModuleOptions.traceIdHeader && request.headers && request.headers[irisModuleOptions.traceIdHeader.toLowerCase()]) {
        const headerFound = request.headers[irisModuleOptions.traceIdHeader.toLowerCase()]
        this.logger.setTraceId(Array.isArray(headerFound) ? (headerFound! as string[]).find(t => t !== undefined) as string : headerFound as string)
      }
      if (request.headers && request.headers.authorization) {
        this.clsManager.setAuthorizationToken(request.headers.authorization)
      }
      this.clsManager.setAuthenticatedUser(await this.authenticationProvider.getAuthenticatedUser(request))
      return next.handle()
    })

  }

}
