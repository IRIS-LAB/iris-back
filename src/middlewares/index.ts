import express from 'express'
import { Logger } from 'winston'
import { ExpressMiddleware } from '../interfaces'
import { actuator } from './actuator.middleware'
import { enableCompression } from './compression.middleware'
import { enableCors } from './cors.middleware'
import { parseJSON } from './json-parser.middleware'
import { enableSecurity } from './security.middleware'

interface IMiddlewares {
  actuator: ExpressMiddleware
  enableCors: ExpressMiddleware
  parseJSON: ExpressMiddleware
  enableCompression: ExpressMiddleware
  enableSecurity: ExpressMiddleware
}

const all: IMiddlewares = {
  actuator,
  enableCors,
  parseJSON,
  enableCompression,
  enableSecurity,
}

type MiddlewareResult = { [key in keyof IMiddlewares]: (express.RequestHandler | express.ErrorRequestHandler) }

export const middlewares: (logger: Logger) => MiddlewareResult = (logger: Logger) => {
  let result: { [key: string]: (express.RequestHandler | express.ErrorRequestHandler) }
  result = {}
  for (const key in all) {
    result[key] = all[key as keyof IMiddlewares](logger)
  }
  return result as MiddlewareResult
}
