import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'

/**
 * @deprecated request logger is now handles by a middleware automatically added by IrisModule.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    return next.handle()
  }
}
