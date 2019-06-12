import { ErreurDO, TechnicalException } from '@u-iris/iris-common'
import express from 'express'
import eActuator from 'express-actuator'
import { ILogger } from '../logger'
import { ExpressMiddleware } from './base'

/**
 * @param {*} logger winston logger object
 * @returns function to use actuator
 */
export const actuator: ExpressMiddleware = (logger: ILogger) => {
  const router = express.Router()
  router.get('/health', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.json({ status: 'UP' })
  })
  router.use(eActuator())
  router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(err)
    throw new TechnicalException(new ErreurDO('', 'error.actuator.init', 'Unable to init Actuator'), err)
  })
  return router
}
