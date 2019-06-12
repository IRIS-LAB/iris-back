import helmet from 'helmet'
import { ILogger } from '../logger'
import { ExpressMiddleware } from './base'

/**
 * Enable security with cors plugin
 */
export const enableSecurity: ExpressMiddleware = (logger: ILogger) => helmet()
