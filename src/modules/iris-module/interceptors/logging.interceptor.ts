import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import express from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import URI from 'urijs'
import { getLogger } from '../iris.context'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  public static logRequest(req: express.Request): void {
    getLogger().info(`verb=${req.method},uri=${new URI(req.url).pathname()},queryParams=${JSON.stringify(req.query)},ip=${req.ip}`)
  }

  public static logResponse(res: express.Response): void {
    getLogger().info(`statusCode=${res.statusCode}`)
  }

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    LoggingInterceptor.logRequest(context.switchToHttp().getRequest())
    return next.handle()
      .pipe(
        tap(() => LoggingInterceptor.logResponse(context.switchToHttp().getResponse())),
      )
  }
}
