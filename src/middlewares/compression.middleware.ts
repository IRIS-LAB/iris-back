import compression from 'compression'
import { Logger } from 'winston'
import { ExpressMiddleware } from '../interfaces'

export const enableCompression: ExpressMiddleware = (logger: Logger) => {
  return compression()
}
