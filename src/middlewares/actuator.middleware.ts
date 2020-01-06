import { Router } from 'express'
import { Logger } from 'winston'
import { ExpressMiddleware } from '../interfaces'

/**
 * @param {*} logger winston logger object
 * @returns function to use actuator
 * @deprecated /actuator/health is now automaticcaly served by IrisModule. You can configure it into iris module config options.
 */
export const actuator: ExpressMiddleware = (logger?: Logger) => {
  return Router()
}
