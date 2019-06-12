import cors from 'cors'
import { ILogger } from '../logger'
import { ExpressMiddleware } from './base'

/**
 * Enable cors with cors plugin
 */
export const enableCors: ExpressMiddleware = (logger: ILogger) => cors()
