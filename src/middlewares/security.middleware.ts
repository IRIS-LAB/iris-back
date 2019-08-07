import helmet from 'helmet'
import { Logger } from 'winston'
import { ExpressMiddleware } from '../interfaces'

/**
 * Enable security with cors plugin
 */
export const enableSecurity: ExpressMiddleware = (logger?: Logger) => helmet()
