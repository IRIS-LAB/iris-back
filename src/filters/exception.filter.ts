import { ArgumentsHost, Catch, ExceptionFilter as NestExceptionFilter } from '@nestjs/common'
import {
  BusinessException,
  EntityNotFoundBusinessException,
  ErrorDO,
  SecurityException,
  TechnicalException,
} from '@u-iris/iris-common'
import express from 'express'
import { ClsProvider, getApplicationContext, getLogger, LoggingInterceptor } from '../modules/iris-module'

@Catch()
export class ExceptionFilter implements NestExceptionFilter {

  private static handleError(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
    const logger = getLogger()
    if (res.headersSent) {
      return next(err)
    }
    let msg = err.message || (err.errors && err.errors.length ? err.errors[0].label : 'Unknown errror')
    let status = 500
    if (typeof msg === 'object' && msg.message && msg.statusCode) {
      status = msg.statusCode
      msg = msg.message
    }

    // Remove 'Error: msg' from stack if possible
    let stack = err.stack
    if (err.stack && err.stack.startsWith(`Error: ${msg}\n`)) {
      const splitted = err.stack.split('\n')
      splitted.shift()
      stack = `\n${splitted.join('\n')}`
    }
    logger.error(`${msg} : ${stack}`)

    let result = {
      errors: err.errors,
    }

    // init status
    switch (err.constructor) {
      case EntityNotFoundBusinessException:
        status = 404
        break
      case BusinessException:
        status = 400
        break
      case TechnicalException:
        status = 500
        break
      case SecurityException:
        status = result.errors.find((e: ErrorDO) => e.code.startsWith('security.authentication')) !== undefined ? 401 : 403
        logger.error(JSON.stringify(result))
        break
      default:
        result = { errors: [new ErrorDO('', 'error', msg)] }
    }

    res.status(status).send(result)
  }

  public catch(exception: unknown, host: ArgumentsHost): any {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()
    const next = ctx.getNext()

    const clsProvider = getApplicationContext().get<ClsProvider>(ClsProvider)
    if (clsProvider.active) {
      ExceptionFilter.handleError(exception, request, response, next)
    } else {
      clsProvider.run(() => {
        // if cls-hooked context is not active, logging interceptor must be called here
        LoggingInterceptor.log(request)
        ExceptionFilter.handleError(exception, request, response, next)
      })
    }
  }
}
