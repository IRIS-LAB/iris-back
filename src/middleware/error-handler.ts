import {
  BusinessException,
  EntityNotFoundBusinessException,
  ErreurDO,
  SecurityException,
  TechnicalException,
} from '@u-iris/iris-common'
import express from 'express'
import { ILogger } from '../logger'

import { ExpressMiddleware } from './base'

/**
 * Error handler, log the error and return the good status
 */
export const errorHandler: ExpressMiddleware = (logger: ILogger) => {
  return (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
      return next(err)
    }
    const msg = err.data || err.message
    logger.error(`${msg} : ${err.stack}`)
    let status = 500
    let result = {
      erreurs: err.erreurs,
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
        status = result.erreurs.find((e: ErreurDO) => e.codeErreur.startsWith('security.authentication')) !== undefined ? 401 : 403
        logger.error(JSON.stringify(result))
        break
      default:
        result = { erreurs: [new ErreurDO('', 'error', msg)] }
    }

    res.status(status).send(result)
  }
}
