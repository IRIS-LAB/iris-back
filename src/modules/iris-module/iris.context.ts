import { INestApplicationContext } from '@nestjs/common'
import { ErrorDO, TechnicalException } from '@u-iris/iris-common'
import winston from 'winston'
import { ErrorService, LoggerService } from './services'

/**
 * NestJS application context
 */
let applicationContext: INestApplicationContext | null

/**
 * Store NestJS application context globally
 */
export function setApplicationContext(context: INestApplicationContext) {
  if (applicationContext) {
    throw new Error('nestjs application context already exists ! Please use this method only one time')
  }
  applicationContext = context
}

export function cleanApplicationContext() {
  applicationContext = null
}

/**
 * Return NestJS application context
 */
export function getApplicationContext(): INestApplicationContext {
  if (!applicationContext) {
    throw new TechnicalException(new ErrorDO('applicationContext', 'null', 'setApplicationContext() has not been called'), new Error())
  }
  return applicationContext
}

export function getErrorService(): ErrorService {
  return getApplicationContext().get(ErrorService)
}

/**
 * @deprecated use getErrorService() instead
 */
export function getErrorProvider(): ErrorService {
  return getErrorService()
}

export function getLoggerService(): LoggerService {
  return getApplicationContext().get(LoggerService)
}

/**
 * @deprecated use getLoggerService() instead
 */
export function getLoggerProvider(): LoggerService {
  return getLoggerService()
}

export function getLogger(): winston.Logger {
  return getLoggerService().logger
}
