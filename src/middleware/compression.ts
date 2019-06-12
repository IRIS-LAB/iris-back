import compression from 'compression'
import { ILogger } from '../logger'
import { ExpressMiddleware } from './base'

export const enableCompression: ExpressMiddleware = (logger: ILogger) => {
  return compression()
}
