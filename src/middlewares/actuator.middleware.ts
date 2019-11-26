import { ErrorDO, TechnicalException } from '@u-iris/iris-common'
import express from 'express'
import eActuator from 'express-actuator'
import { getConnectionManager } from 'typeorm'
import { Logger } from 'winston'
import { ExpressMiddleware } from '../interfaces'
import { getLogger } from '../modules/iris-module'

/**
 * @param {*} logger winston logger object
 * @returns function to use actuator
 */
export const actuator: ExpressMiddleware = (logger?: Logger) => {
  const router = express.Router()
  router.get('/health', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let up: boolean = true

    try {
      const connections = getConnectionManager().connections
      up = up && connections.reduce((isConnected: boolean, connec) => isConnected && connec.isConnected, true)
    } catch (e) {
      // nothing
    }
    res.json({ status: up ? 'UP' : 'DOWN' })
  })
  router.use(eActuator())
  router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    (logger || getLogger()).error(err)
    throw new TechnicalException(new ErrorDO('', 'error.actuator.init', 'Unable to init Actuator'), err)
  })
  return router
}
