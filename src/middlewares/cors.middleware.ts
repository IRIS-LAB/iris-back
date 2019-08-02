import cors from 'cors'
import { Logger } from 'winston'
import { ExpressMiddleware } from '../interfaces'

/**
 * Enable cors with cors plugin
 */
export const enableCors: ExpressMiddleware = (logger?: Logger) => cors()
