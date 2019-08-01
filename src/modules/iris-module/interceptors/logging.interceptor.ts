import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import express from 'express'
import { Observable } from 'rxjs'
import URI from 'urijs'
import { getLogger } from '../iris.context'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  public static log(req: express.Request): void {
    getLogger().info(`verb=${req.method},uri=${new URI(req.url).pathname()},queryParams=${JSON.stringify(req.query)},ip=${req.ip}`)
  }

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    LoggingInterceptor.log(context.switchToHttp().getRequest())
    return next.handle()
  }

}
