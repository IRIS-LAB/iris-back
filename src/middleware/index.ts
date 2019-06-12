import express from 'express'
import { Logger } from 'winston'
import { ILogger } from '../logger'
import * as actuator from './actuator'
import { ExpressMiddleware } from './base'
import * as compression from './compression'
import * as cors from './cors'
import * as errorHandler from './error-handler'
import * as jsonParser from './json-parser'
import * as requestLogger from './request-logger'
import * as security from './security'

interface IMiddlewares {
  actuator: ExpressMiddleware
  enableCors: ExpressMiddleware
  parseJSON: ExpressMiddleware
  logRequests: ExpressMiddleware
  errorHandler: ExpressMiddleware
  enableCompression: ExpressMiddleware
  enableSecurity: ExpressMiddleware

}

const all: IMiddlewares = {
  actuator: actuator.actuator,
  enableCors: cors.enableCors,
  parseJSON: jsonParser.parseJSON,
  logRequests: requestLogger.logRequests,
  errorHandler: errorHandler.errorHandler,
  enableCompression: compression.enableCompression,
  enableSecurity: security.enableSecurity,
}

type MiddlewareResult = { [key in keyof IMiddlewares]: (express.RequestHandler | express.ErrorRequestHandler) }

export const middlewares: (logger: ILogger) => MiddlewareResult = (logger: ILogger) => {
  let result: { [key: string]: (express.RequestHandler | express.ErrorRequestHandler) }
  result = {}
  for (const key in all) {
    result[key] = all[key as keyof IMiddlewares](logger)
  }
  return result as MiddlewareResult
}

interface WithMiddlewaresOption {
  expressApplication?: express.Application
  disableCors?: boolean
  disableCompression?: boolean
  disableSecurity?: boolean
}

export function withMiddlewares(cb: (app: express.Application) => void, logger: Logger, o: WithMiddlewaresOption = {}): express.Application {
  if (!logger) {
    throw new Error('withMiddlewares: logger is null or undefined')
  }

  const app = o.expressApplication || express()
  const mid = middlewares(logger)
  app.use(mid.parseJSON)
  if (!o.disableCors) {
    app.use(mid.enableCors)
  }
  if (!o.disableCompression) {
    app.use(mid.enableCompression)
  }
  app.use(mid.logRequests)
  if (!o.disableSecurity) {
    app.use(mid.enableSecurity)
  }
  app.use('/actuator', mid.actuator)
  cb(app)
  app.use(mid.errorHandler)
  return app
}
