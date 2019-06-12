import bodyParser from 'body-parser'
import { ILogger } from '../logger'
import { ExpressMiddleware } from './base'

/**
 * Transform body request to a JSON object
 */
export const parseJSON: ExpressMiddleware = (logger: ILogger) => bodyParser.json()
